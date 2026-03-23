/**
 * projects.js - 프로젝트 목록 렌더링 & 업로드 모듈
 * - 다중 이미지 선택 및 프리뷰
 * - 다중 카테고리 체크박스
 */

(function initProjects() {
  const list      = document.getElementById('projectsList');
  const modal     = document.getElementById('uploadModal');
  const closeBtn  = document.getElementById('closeUpload');
  const dropZone  = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const previewList = document.getElementById('imagePreviewList');
  const uploadErr   = document.getElementById('uploadErr');

  const API = window.location.origin;

  // 선택된 파일 배열
  let selectedFiles = [];

  // ── 목록 로드 ────────────────────────────────────
  async function loadProjects() {
    try {
      const res      = await fetch(API + '/api/projects');
      const projects = await res.json();
      renderProjects(projects);
    } catch {
      list.innerHTML = '<p style="color:var(--gray-light); padding:40px 0;">프로젝트를 불러오지 못했습니다.</p>';
    }
  }

  // ── 렌더링 ───────────────────────────────────────
  function renderProjects(projects) {
    list.innerHTML = '';
    projects.forEach((p, i) => {
      const num  = String(i + 1).padStart(3, '0');
      const tags = (p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('');
      const year = p.status ? `${p.year} — ${p.status}` : p.year;

      const item = document.createElement('div');
      item.className = 'project-item reveal';
      item.dataset.id = p.id;
      item.innerHTML = `
        <div class="project-num">${num}</div>
        <div class="project-main">
          <div class="project-title">${p.title}</div>
          <div class="project-desc">${p.description || ''}</div>
          <div class="project-tags">${tags}</div>
        </div>
        <div class="project-year">${year}</div>
        <button class="project-delete" onclick="deleteProject(${p.id})">삭제</button>`;

      // 카드 클릭 → 상세 페이지 (삭제 버튼 클릭은 제외)
      item.addEventListener('click', function(e) {
        if (e.target.closest('.project-delete')) return;
        window.location.href = '/project?id=' + p.id;
      });

      list.appendChild(item);
      requestAnimationFrame(() => {
        setTimeout(() => item.classList.add('visible'), i * 60);
      });
    });
    if (window.refreshCursorTargets) window.refreshCursorTargets();
  }

  // ── 삭제 ─────────────────────────────────────────
  window.deleteProject = async function (id) {
    if (!confirm('이 프로젝트를 삭제하시겠습니까?')) return;
    try {
      const res  = await fetch(API + '/api/projects/' + id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadProjects();
      else alert(data.message || '삭제에 실패했습니다.');
    } catch { alert('서버 연결에 실패했습니다.'); }
  };

  // ── 이미지 추가 ──────────────────────────────────
  function addFiles(fileList) {
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) return; // 중복 방지
      selectedFiles.push(file);
      renderPreview(file, selectedFiles.length - 1);
    });
    // 파일이 있으면 드롭존 텍스트 축소
    if (selectedFiles.length > 0) {
      dropZone.querySelector('div').textContent = `+ 이미지 추가 (현재 ${selectedFiles.length}개)`;
    }
  }

  // ── 프리뷰 렌더링 ────────────────────────────────
  function renderPreview(file, index) {
    const reader = new FileReader();
    reader.onload = e => {
      const item = document.createElement('div');
      item.className = 'img-preview-item';
      item.dataset.index = index;
      item.innerHTML = `
        <img src="${e.target.result}" alt="${file.name}">
        <button class="img-preview-remove" onclick="removePreview(${index})" title="제거">×</button>
        <div class="img-preview-name">${file.name}</div>`;
      previewList.appendChild(item);
    };
    reader.readAsDataURL(file);
  }

  // ── 프리뷰 제거 (전역 노출) ──────────────────────
  window.removePreview = function(index) {
    selectedFiles[index] = null; // null로 마킹 (인덱스 보존)
    const item = previewList.querySelector(`[data-index="${index}"]`);
    if (item) item.remove();
    // 전부 null이면 초기화
    if (selectedFiles.every(f => f === null)) {
      selectedFiles = [];
      dropZone.querySelector('div').textContent = '이미지를 드래그하거나 클릭하여 선택';
    } else {
      const remaining = selectedFiles.filter(f => f !== null).length;
      dropZone.querySelector('div').textContent = `+ 이미지 추가 (현재 ${remaining}개)`;
    }
  };

  // ── 폼 제출 ──────────────────────────────────────
  window.addProject = async function () {
    const title = document.getElementById('projTitle').value.trim();
    const desc  = document.getElementById('projDesc').value.trim();
    const year  = document.getElementById('projYear').value.trim() || String(new Date().getFullYear());

    // 선택된 카테고리 수집
    const checkedCats = Array.from(
      document.querySelectorAll('#catGrid input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    uploadErr.style.display = 'none';

    if (!title) {
      uploadErr.textContent = '제목을 입력해주세요.';
      uploadErr.style.display = 'block';
      document.getElementById('projTitle').focus();
      return;
    }

    // 링크 수집
    const linkRows = document.querySelectorAll('.link-row');
    const links = Array.from(linkRows).map(row => ({
      label: row.querySelector('.link-label-input').value.trim(),
      url:   row.querySelector('.link-url-input').value.trim(),
    })).filter(l => l.url);

    const formData = new FormData();
    formData.append('title',       title);
    formData.append('description', desc);
    formData.append('year',        year);
    // 태그: 선택된 카테고리 전체를 콤마로 전달
    formData.append('tags',  checkedCats.join(','));
    formData.append('links', JSON.stringify(links));
    // 카테고리: 첫 번째 선택값을 대표 카테고리로
    formData.append('category', checkedCats[0] || '');

    // 다중 이미지: null 제거 후 전송
    const validFiles = selectedFiles.filter(f => f !== null);
    validFiles.forEach(file => formData.append('images', file));

    try {
      const res  = await fetch(API + '/api/projects', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        modal.classList.remove('active');
        resetForm();
        loadProjects();
      } else {
        uploadErr.textContent = data.message || '추가에 실패했습니다.';
        uploadErr.style.display = 'block';
      }
    } catch {
      uploadErr.textContent = '서버 연결에 실패했습니다.';
      uploadErr.style.display = 'block';
    }
  };

  // ── 폼 초기화 ────────────────────────────────────
  function resetForm() {
    document.getElementById('projTitle').value = '';
    document.getElementById('projDesc').value  = '';
    document.getElementById('projYear').value  = '';
    document.getElementById('linkList').innerHTML = '';
    document.querySelectorAll('#catGrid input[type="checkbox"]').forEach(cb => cb.checked = false);
    selectedFiles = [];
    previewList.innerHTML = '';
    uploadErr.style.display = 'none';
    dropZone.querySelector('div').textContent = '이미지를 드래그하거나 클릭하여 선택';
  }

  // ── 드래그 앤 드롭 ───────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    addFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = ''; // 같은 파일 재선택 허용
  });

  // ── 모달 닫기 ────────────────────────────────────
  closeBtn.addEventListener('click', () => { modal.classList.remove('active'); resetForm(); });
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.classList.remove('active'); resetForm(); }
  });

  // ── 초기 로드 ────────────────────────────────────
  loadProjects();
})();

// ── 링크 행 추가 / 제거 (전역) ──────────────────────
window.addLinkRow = function () {
  const list = document.getElementById('linkList');
  const row  = document.createElement('div');
  row.className = 'link-row';
  row.innerHTML = `
    <input type="text"  class="link-label-input" placeholder="YouTube, ArtStation...">
    <input type="url"   class="link-url-input"   placeholder="https://...">
    <button type="button" class="link-remove-btn" onclick="this.closest('.link-row').remove()">×</button>`;
  list.appendChild(row);

  // 커서 hover 등록
  row.querySelectorAll('input, button').forEach(el => {
    if (window.refreshCursorTargets) return; // main.js가 처리
    el.style.cursor = 'none';
  });
};
