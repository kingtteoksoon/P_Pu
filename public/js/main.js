/**
 * main.js - 공통 UI 모듈
 *
 * index.html 과 project.html 에서 모두 로드됨.
 * 페이지에 존재하지 않는 요소는 안전하게 스킵.
 */

(function initMain() {
  const C = window.PORTFOLIO_CONFIG;

  // ── 헬퍼: 요소가 없으면 조용히 무시 ──────────────
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function setHTML(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  }

  // ══ 1. 개인정보 렌더링 (index.html 전용 요소) ════
  if (C) {
    document.title = C.name.ko + ' — Portfolio';

    setText('navLogo',         C.name.ko);
    setText('mobileFooterText', C.name.en + ' — Portfolio 2026');
    setText('heroIndex',        C.initials + ' — 2026');
    setHTML('heroName',
      C.name.en.split(' ')[0] + '<br><em>' + C.name.en.split(' ').slice(1).join(' ') + '</em>');
    setHTML('heroDesc', C.bio.join('<br>'));

    setText('profileNameKo', C.name.ko);
    setText('profileNameEn', C.name.en);
    setHTML('profileBio',    C.bio.join('<br>'));

    setHTML('infoTable', [
      ['소속',       C.affiliation],
      ['이메일',     `<a href="mailto:${C.email}" style="color:inherit">${C.email}</a>`],
      ['ArtStation', `<a href="https://${C.artstation}" target="_blank" style="color:inherit">${C.artstation}</a>`],
      ['GitHub',     `<a href="https://${C.github}" target="_blank" style="color:inherit">${C.github}</a>`],

    ].map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join(''));

    setHTML('educationList', (C.education || []).map(e => `
      <div class="timeline-item">
        <div class="timeline-year">${e.year}</div>
        <div class="timeline-content">
          <div class="timeline-title">${e.title}</div>
          <div class="timeline-sub">${e.sub}</div>
        </div>
      </div>`).join(''));

    setHTML('awardsList', (C.awards || []).map(a => `
      <div class="timeline-item">
        <div class="timeline-year">${a.year}</div>
        <div class="timeline-content">
          <div class="timeline-title">${a.title}</div>
          <div class="timeline-sub">${a.sub}</div>
        </div>
      </div>`).join(''));

    setHTML('skillsList', (C.skills || [])
      .map(s => `<span class="skill-tag">${s}</span>`).join(''));

    setHTML('contactLinks', `
      <a href="mailto:${C.email}" class="contact-card">
        <div class="contact-card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="1.2"/>
          </svg>
        </div>
        <div class="contact-card-info">
          <span class="contact-card-type">Email</span>
          <span class="contact-card-value">${C.email}</span>
        </div>
        <svg class="contact-card-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.2"/>
        </svg>
      </a>
      <a href="https://${C.artstation}" target="_blank" class="contact-card">
        <div class="contact-card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M2 17L7 7l5 10H2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M11 17l2-4 4 4h-6z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M16 17l-3-6 3-6 6 12h-6z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="contact-card-info">
          <span class="contact-card-type">ArtStation</span>
          <span class="contact-card-value">${C.artstation}</span>
        </div>
        <svg class="contact-card-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.2"/>
        </svg>
      </a>`);

    setHTML('footerName', C.name.ko + ' — ' + C.name.en);

    // 업로드 폼 카테고리 동적 생성
    const catGrid = document.getElementById('catGrid');
    if (catGrid) {
      catGrid.innerHTML = (C.categories || []).map(cat => `
        <label class="cat-item">
          <input type="checkbox" value="${cat.value}">
          <span>${cat.label}</span>
        </label>`).join('');
    }
  }

  // ══ 2. (커스텀 커서 제거됨) ══

  // ══ 3. 스크롤 Reveal ════════════════════════════
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ══ 4. 연락 폼 ══════════════════════════════════
  window.handleContactSubmit = async function (btn) {
    const nameEl    = document.getElementById('contactName');
    const emailEl   = document.getElementById('contactEmail');
    const msgEl     = document.getElementById('contactMessage');
    const errEl     = document.getElementById('contactErr');

    if (!nameEl || !emailEl || !msgEl) return;

    const name    = nameEl.value.trim();
    const email   = emailEl.value.trim();
    const message = msgEl.value.trim();

    // 클라이언트 검증
    if (errEl) errEl.style.display = 'none';
    if (!name)    { showContactErr('이름을 입력하세요.'); return; }
    if (!email)   { showContactErr('이메일을 입력하세요.'); return; }
    if (!message) { showContactErr('메시지를 입력하세요.'); return; }

    const orig = btn.textContent;
    btn.textContent = '전송 중...';
    btn.disabled = true;

    try {
      const res  = await fetch(window.location.origin + '/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (data.success) {
        btn.textContent = '전송됨 ✓';
        nameEl.value  = '';
        emailEl.value = '';
        msgEl.value   = '';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 4000);
      } else {
        showContactErr(data.message || '전송에 실패했습니다.');
        btn.textContent = orig;
        btn.disabled = false;
      }
    } catch {
      showContactErr('서버 연결에 실패했습니다.');
      btn.textContent = orig;
      btn.disabled = false;
    }

    function showContactErr(msg) {
      if (!errEl) return;
      errEl.textContent   = msg;
      errEl.style.display = 'block';
    }
  };

})();
