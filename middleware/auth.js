/**
 * middleware/auth.js
 * 관리자 세션 인증 미들웨어
 */

/**
 * 관리자 전용 라우트 보호
 * 세션에 isAdmin이 없으면 401 반환
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  res.status(401).json({ success: false, message: '인증이 필요합니다.' });
}

/**
 * 현재 요청이 관리자인지 여부를 res.locals에 주입
 * 모든 뷰에서 isAdmin 변수 사용 가능
 */
function injectAdminStatus(req, res, next) {
  res.locals.isAdmin = !!(req.session && req.session.isAdmin);
  next();
}

module.exports = { requireAdmin, injectAdminStatus };
