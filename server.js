'use strict';

require('dotenv').config();

const express   = require('express');
const session   = require('express-session');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const authRoutes    = require('./routes/auth');
const projectRoutes = require('./routes/projects');

const app  = express();

// Codespace/Reverse Proxy 환경 대응
// X-Forwarded-For 헤더를 신뢰 (express-rate-limit 오류 방지)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// ── 미들웨어 ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 (public/ 폴더를 루트로 서빙)
// /css/style.css  -> public/css/style.css
// /js/admin.js    -> public/js/admin.js
app.use(express.static(path.join(__dirname, 'public')));

// 세션
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   1000 * 60 * 60 * 4, // 4시간
  },
}));

// 로그인 Rate Limit (무차별 대입 방지)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max:      10,
  message:  { success: false, message: '너무 많은 시도입니다. 잠시 후 다시 시도하세요.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── API 라우터 ────────────────────────────────────
app.use('/api/auth',     loginLimiter, authRoutes);
app.use('/api/projects', projectRoutes);

// ── /project → project.html ─────────────────────
app.get('/project', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

// ── SPA 폴백: 나머지 모든 GET → index.html ────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── 글로벌 에러 핸들러 ────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] error:', err.message);
  res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log('\n  포트폴리오 서버 실행 중');
  console.log('  http://localhost:' + PORT + '\n');
});
