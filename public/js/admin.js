/**
 * admin.js - 관리자 인증 모듈
 */

(function initAdmin() {
  var loginModal      = document.getElementById('adminLoginModal');
  var closeLoginBtn   = document.getElementById('closeAdminLogin');
  var pwInput         = document.getElementById('adminPwInput');
  var pwErr           = document.getElementById('adminPwErr');
  var submitBtn       = loginModal.querySelector('.form-submit');
  var loggedInSection = document.getElementById('adminLoggedInInfo');
  var adminBtnWrap    = document.getElementById('adminBtnWrap');
  var openUploadBtn   = document.getElementById('openUpload');

  // window.location.origin 사용 → 로컬/Codespace/배포 환경 모두 대응
  // 상대경로('/api/...')는 Codespace 프록시 구조에서 경로가 꼬일 수 있음
  var API = window.location.origin;

  // 세션 상태 초기 확인
  fetch(API + '/api/auth/status')
    .then(function(r) { return r.json(); })
    .then(function(data) { if (data.isAdmin) setAdminUI(true); })
    .catch(function() {});

  // 관리자 UI 전환
  function setAdminUI(isAdmin) {
    document.body.classList.toggle('admin-mode', isAdmin);
    adminBtnWrap.style.display = isAdmin ? 'flex' : 'none';
    loggedInSection.style.display = isAdmin ? 'block' : 'none';
    pwInput.closest('.form-group').style.display = isAdmin ? 'none' : 'block';
    submitBtn.style.display = isAdmin ? 'none' : 'block';
  }

  // 로그인
  async function login() {
    var pw = pwInput.value;
    if (!pw) return;

    try {
      var res = await fetch(API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      var data = await res.json();

      if (data.success) {
        pwErr.style.display = 'none';
        pwInput.value = '';
        setAdminUI(true);
      } else {
        pwErr.textContent = data.message || '비밀번호가 올바르지 않습니다.';
        pwErr.style.display = 'block';
        pwInput.style.borderColor = '#c0392b';
        setTimeout(function() { pwInput.style.borderColor = ''; }, 1500);
        pwInput.value = '';
        pwInput.focus();
      }
    } catch (err) {
      pwErr.textContent = '서버 연결에 실패했습니다. (' + err.message + ')';
      pwErr.style.display = 'block';
    }
  }

  // 로그아웃 (전역 노출)
  window.logoutAdmin = async function() {
    await fetch(API + '/api/auth/logout', { method: 'POST' }).catch(function() {});
    setAdminUI(false);
    loginModal.classList.remove('active');
  };

  // 업로드 모달 열기 (전역 노출)
  window.openUploadFromAdmin = function() {
    loginModal.classList.remove('active');
    document.getElementById('uploadModal').classList.add('active');
  };

  // 엔터키 / 버튼 클릭
  submitBtn.addEventListener('click', login);
  pwInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });

  // 푸터 5회 클릭으로 진입
  var clickCount = 0;
  var clickTimer = null;
  document.querySelector('.footer-name').addEventListener('click', function() {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(function() { clickCount = 0; }, 2000);
    if (clickCount >= 5) {
      clickCount = 0;
      loginModal.classList.add('active');
      pwInput.focus();
    }
  });

  // 모달 닫기
  closeLoginBtn.addEventListener('click', function() { loginModal.classList.remove('active'); });
  loginModal.addEventListener('click', function(e) {
    if (e.target === loginModal) loginModal.classList.remove('active');
  });

  // 관리자 추가 버튼
  openUploadBtn.addEventListener('click', function() {
    document.getElementById('uploadModal').classList.add('active');
  });
})();
