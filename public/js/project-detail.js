/**
 * project-detail.js — 프로젝트 상세 페이지
 * URL: /project?id=1
 */

(function initDetail() {
  'use strict';

  const API     = window.location.origin;
  const loading = document.getElementById('projLoading');
  const main    = document.getElementById('projMain');

  /* ── URL에서 id 파싱 ───────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'), 10);

  if (!id || isNaN(id)) {
    window.location.href = '/#projects';
    return;
  }

  /* ── 데이터 로드 ─────────────────────────────────  */
  fetch(API + '/api/projects/' + id)
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(p) {
      if (!p || !p.title) { window.location.href = '/#projects'; return; }
      render(p);
    })
    .catch(function(err) {
      console.error('[project-detail] fetch error:', err);
      window.location.href = '/#projects';
    });

  /* ── 헬퍼: null-safe 텍스트 세팅 ────────────────── */
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function setDisplay(id, val) {
    var el = document.getElementById(id);
    if (el) el.style.display = val;
  }

  /* ── 렌더링 ──────────────────────────────────────  */
  function render(p) {
    document.title = p.title + ' — 김석현 Portfolio';

    setText('dNum',      String(p.id).padStart(3, '0'));
    setText('dTitle',    p.title);
    setText('dYear',     p.year || '');
    setText('dYearMeta', p.year || '—');
    setText('dCategory', p.category || (p.tags || []).join(', ') || '—');
    setText('dDesc',     p.description || '설명이 없습니다.');

    /* 태그 */
    var tagsEl = document.getElementById('dTags');
    if (tagsEl) {
      tagsEl.innerHTML = '';
      (p.tags || []).forEach(function(t) {
        var s = document.createElement('span');
        s.className   = 'project-tag';
        s.textContent = t;
        tagsEl.appendChild(s);
      });
    }

    /* 상태 */
    if (p.status) {
      setText('dStatus',     p.status);
      setText('dStatusMeta', p.status);
    } else {
      setDisplay('dStatus',    'none');
      setDisplay('dStatusRow', 'none');
    }

    /* 외부 링크 */
    renderLinks(p.links);

    /* 이미지 갤러리 */
    var images = Array.isArray(p.images)
      ? p.images.filter(Boolean)
      : (p.image ? [p.image] : []);
    renderGallery(images);

    /* prev / next */
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    if (prevBtn) {
      if (p.prevId) prevBtn.href = '/project?id=' + p.prevId;
      else          prevBtn.classList.add('disabled');
    }
    if (nextBtn) {
      if (p.nextId) nextBtn.href = '/project?id=' + p.nextId;
      else          nextBtn.classList.add('disabled');
    }

    /* 페이드 인 */
    if (loading) loading.classList.add('hidden');
    if (main)    main.style.opacity = '1';

    /* reveal 순차 트리거 */
    setTimeout(function() {
      document.querySelectorAll('.reveal').forEach(function(el, i) {
        setTimeout(function() { el.classList.add('visible'); }, i * 80);
      });
    }, 100);

    /* 커서 재등록 */
    if (window.refreshCursorTargets) window.refreshCursorTargets();
  }

  /* ── 외부 링크 렌더링 ────────────────────────────  */
  function renderLinks(raw) {
    var linksRow = document.getElementById('dLinksRow');
    var linksEl  = document.getElementById('dLinks');
    if (!linksRow || !linksEl) return;

    var links = Array.isArray(raw) ? raw.filter(function(l) { return l && l.url; }) : [];
    if (!links.length) return;

    linksRow.style.display = '';
    linksEl.innerHTML = links.map(function(l) {
      var icon  = getLinkIcon(l.url);
      var label = l.label || getDomain(l.url);
      return '<a href="' + escHtml(l.url) + '" target="_blank" rel="noopener" class="proj-ext-link">'
        + icon
        + '<span>' + escHtml(label) + '</span>'
        + '<svg width="10" height="10" viewBox="0 0 12 12" fill="none">'
        +   '<path d="M2 10L10 2M5 2h5v5" stroke="currentColor" stroke-width="1.2"/>'
        + '</svg>'
        + '</a>';
    }).join('');
  }

  /* ── 갤러리 렌더링 ───────────────────────────────  */
  function renderGallery(images) {
    var gallery = document.getElementById('dGallery');
    if (!gallery) return;
    if (!images.length) { gallery.classList.add('empty'); return; }

    var cls = images.length === 1 ? 'count-1'
            : images.length === 2 ? 'count-2'
            : images.length === 3 ? 'count-3'
            : images.length === 4 ? 'count-4'
            : 'count-many';
    gallery.classList.add(cls);

    images.forEach(function(src, i) {
      var wrap = document.createElement('div');
      wrap.className = 'gal-img-wrap';
      var img = document.createElement('img');
      img.src       = src;
      img.alt       = 'Project image ' + (i + 1);
      img.className = 'gal-img';
      img.loading   = 'lazy';
      img.addEventListener('click', function() { openLightbox(images, i); });
      wrap.appendChild(img);
      gallery.appendChild(wrap);
    });
  }

  /* ── 라이트박스 ──────────────────────────────────  */
  var lightboxImages = [];
  var lightboxIndex  = 0;

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="lightbox-close">\u00d7</button>'
  + '<button class="lightbox-prev">\u2190</button>'
  + '<img class="lightbox-img" alt="">'
  + '<button class="lightbox-next">\u2192</button>'
  + '<div class="lightbox-counter"></div>';
  document.body.appendChild(lb);

  var lbImg     = lb.querySelector('.lightbox-img');
  var lbCounter = lb.querySelector('.lightbox-counter');
  var lbClose   = lb.querySelector('.lightbox-close');
  var lbPrev    = lb.querySelector('.lightbox-prev');
  var lbNext    = lb.querySelector('.lightbox-next');

  function openLightbox(imgs, idx) {
    lightboxImages = imgs;
    lightboxIndex  = idx;
    updateLightbox();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function updateLightbox() {
    lbImg.src = lightboxImages[lightboxIndex];
    lbCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
    lbPrev.style.display = lightboxIndex > 0 ? '' : 'none';
    lbNext.style.display = lightboxIndex < lightboxImages.length - 1 ? '' : 'none';
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  function() { lightboxIndex--; updateLightbox(); });
  lbNext.addEventListener('click',  function() { lightboxIndex++; updateLightbox(); });
  lb.addEventListener('click', function(e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     { closeLightbox(); return; }
    if (e.key === 'ArrowLeft'  && lightboxIndex > 0)                         { lightboxIndex--; updateLightbox(); }
    if (e.key === 'ArrowRight' && lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; updateLightbox(); }
  });

  /* ── 유틸 ────────────────────────────────────────  */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch(e) { return url; }
  }

  function getLinkIcon(url) {
    var u = (url || '').toLowerCase();

    var YOUTUBE_ICON =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
      + '<rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" stroke-width="1.2"/>'
      + '<path d="M10 9l6 3-6 3V9z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'
      + '</svg>';

    var ARTSTATION_ICON =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
      + '<path d="M3 16.5L7 9l4 7.5H3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'
      + '<path d="M10 16.5l2-4 2 4h-4z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'
      + '<path d="M15 16.5l-2.5-5L15 6l5.5 10.5H15z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'
      + '</svg>';

    var GITHUB_ICON =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
      + '<path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7C6.7 19.9 6.1 18 6.1 18c-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.8.8.1-.6.3-1.1.6-1.3-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 015 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.5.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.5 4.9.4.3.7.9.7 1.9V21c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12 22 6.5 17.5 2 12 2z" stroke="currentColor" stroke-width="1.2"/>'
      + '</svg>';

    var INSTAGRAM_ICON =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
      + '<rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.2"/>'
      + '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.2"/>'
      + '<circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'
      + '</svg>';

    var VIMEO_ICON =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
      + '<path d="M22 8c-.1 3-2.2 7-6.2 12-4.1 5.2-7.6 7.8-10.4 7.8-1.7 0-3.2-1.6-4.4-4.8L-.4 17C-1 14.7-1.7 13.5-2.5 13.5c-.2 0-1 .5-2.4 1.5l-1.5-1.9c1.5-1.3 3-2.7 4.4-3.9 2-1.7 3.4-2.6 4.4-2.6 2.3 0 3.7 1.4 4.3 4.1l1.3 5.2c.7 3 1.4 4.6 2.3 4.6.7 0 1.7-1 3-3.1 1.2-2.1 1.9-3.6 2-4.7.1-1.8-.6-2.7-2-2.7-.7 0-1.4.2-2.1.5 1.4-4.5 4-6.7 7.8-6.5 2.8.1 4.1 1.9 3.9 5.5z" stroke="none" fill="currentColor" transform="scale(0.55) translate(6,2)"/>'
      + '</svg>';

    var LINK_ICON =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">'
      + '<path d="M10 13a5 5 0 007.5.7l3-3a5 5 0 00-7-7l-1.7 1.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'
      + '<path d="M14 11a5 5 0 00-7.5-.7l-3 3a5 5 0 007 7l1.7-1.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'
      + '</svg>';

    if (u.indexOf('youtube') !== -1 || u.indexOf('youtu.be') !== -1) return YOUTUBE_ICON;
    if (u.indexOf('artstation') !== -1) return ARTSTATION_ICON;
    if (u.indexOf('github') !== -1)     return GITHUB_ICON;
    if (u.indexOf('instagram') !== -1)  return INSTAGRAM_ICON;
    if (u.indexOf('vimeo') !== -1)      return VIMEO_ICON;
    return LINK_ICON;
  }

})();
