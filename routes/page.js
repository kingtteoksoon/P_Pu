/**
 * routes/page.js
 * 메인 페이지 렌더링 라우터
 */

const express  = require('express');
const router   = express.Router();
const { readProjects } = require('../utils/projectStore');
const { injectAdminStatus } = require('../middleware/auth');

router.use(injectAdminStatus);

// GET / — 메인 포트폴리오 페이지
router.get('/', async (req, res) => {
  try {
    const projects = await readProjects();
    res.render('index', { projects });
  } catch (err) {
    console.error('[page] index render error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
