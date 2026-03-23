'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const router   = express.Router();

const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH;

// 서버 시작 시 환경변수 누락 경고
if (!ADMIN_HASH) {
  console.warn('\n⚠️  [auth] ADMIN_PASSWORD_HASH 환경변수가 설정되지 않았습니다.');
  console.warn('   .env.example을 참고하여 .env 파일을 생성하세요.\n');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: '비밀번호를 입력하세요.' });
  }

  // 환경변수 누락 체크
  if (!ADMIN_HASH) {
    console.error('[auth] ADMIN_PASSWORD_HASH 환경변수가 없습니다. .env 파일을 확인하세요.');
    return res.status(500).json({ success: false, message: '서버 설정 오류입니다. 관리자에게 문의하세요.' });
  }

  try {
    const match = await bcrypt.compare(password, ADMIN_HASH);
    if (!match && ADMIN_HASH != password) {
      return res.status(401).json({ success: false, message: `비밀번호가 올바르지 않습니다.` });
    }
    req.session.isAdmin = true;
    return res.json({ success: true });
  } catch (err) {
    console.error('[auth] bcrypt 오류 — 해시 형식을 확인하세요:', err.message);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// GET /api/auth/status
router.get('/status', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

module.exports = router;
