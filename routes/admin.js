/**
 * routes/admin.js
 * 관리자 인증 전용 라우터
 * POST /admin/login  — 로그인
 * POST /admin/logout — 로그아웃
 */

const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// 로그인 시도 Rate Limiting: 15분에 10회
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: '너무 많은 시도입니다. 잠시 후 다시 시도하세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 관리자 비밀번호 해시
 * 변경 방법:
 *   node -e "const b=require('bcryptjs'); b.hash('새비밀번호',10).then(h=>console.log(h))"
 * 기본 비밀번호: admin1234
 */
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH
  || '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// POST /admin/login
router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: '비밀번호를 입력하세요.' });
  }

  try {
    const match = await bcrypt.compare(password, ADMIN_HASH);
    if (match) {
      req.session.isAdmin = true;
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
  } catch (err) {
    console.error('[admin] login error:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

module.exports = router;
