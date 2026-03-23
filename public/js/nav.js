/**
 * nav.js — 네비게이션 모듈
 * - 스크롤 감지 숨김/표시
 * - 스크롤 진행 바
 * - 현재 섹션 active 표시
 * - 모바일 햄버거 메뉴
 */

(function initNav() {
  const nav         = document.getElementById('mainNav');
  const progressBar = document.getElementById('navProgress');
  const navLinks    = document.querySelectorAll('.nav-links a[data-section]');
  const hamburgerBtn  = document.getElementById('hamburgerBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks   = document.querySelectorAll('.mobile-link');

  // ── 스크롤 숨김/표시 + 진행 바 ──────────────────
  let lastScrollY = 0;
  let ticking     = false;

  function updateNav() {
    const scrollY = window.scrollY;
    const docH    = document.documentElement.scrollHeight - window.innerHeight;

    progressBar.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';

    if (scrollY < 10) {
      nav.classList.add('nav-top');
      nav.classList.remove('nav-hidden');
    } else {
      nav.classList.remove('nav-top');
      if      (scrollY > lastScrollY + 4 && scrollY > 80) nav.classList.add('nav-hidden');
      else if (scrollY < lastScrollY - 4)                  nav.classList.remove('nav-hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });
  updateNav();

  // ── 현재 섹션 active ────────────────────────────
  const sectionIds = ['hero', 'about', 'projects', 'contact'];

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('nav-active', a.dataset.section === entry.target.id));
    });
  }, { threshold: 0.35 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  // ── 햄버거 모바일 메뉴 ──────────────────────────
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileOverlay.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileOverlay.classList.remove('open');
      hamburgerBtn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();
