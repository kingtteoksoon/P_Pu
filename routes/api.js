/**
 * routes/api.js
 * 프로젝트 CRUD API
 *
 * GET    /api/projects         — 전체 조회 (공개)
 * POST   /api/projects         — 추가 (관리자)
 * DELETE /api/projects/:id     — 삭제 (관리자)
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { requireAdmin } = require('../middleware/auth');
const { readProjects, writeProjects } = require('../utils/projectStore');

// ── Multer 설정 (이미지 업로드) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `project_${Date.now()}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('이미지 파일만 허용됩니다.'));
  }
});

// GET /api/projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await readProjects();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: '프로젝트를 불러오지 못했습니다.' });
  }
});

// POST /api/projects — 관리자 전용
router.post('/projects', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, year } = req.body;
    const tagsRaw = req.body.tags;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: '제목은 필수입니다.' });
    }

    // tags: 문자열이면 JSON 파싱, 없으면 []
    let tags = [];
    if (tagsRaw) {
      try { tags = JSON.parse(tagsRaw); } catch { tags = [tagsRaw]; }
    }
    if (category && !tags.includes(category)) tags.unshift(category);

    const projects = await readProjects();
    const newId    = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;

    const project = {
      id:          newId,
      title:       title.trim(),
      description: (description || '').trim(),
      category:    category || '',
      tags,
      year:        year || String(new Date().getFullYear()),
      status:      null,
      image:       req.file ? `/uploads/${req.file.filename}` : null,
      createdAt:   new Date().toISOString()
    };

    projects.push(project);
    await writeProjects(projects);

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error('[api] POST /projects error:', err);
    res.status(500).json({ success: false, message: '프로젝트 저장 실패' });
  }
});

// DELETE /api/projects/:id — 관리자 전용
router.delete('/projects/:id', requireAdmin, async (req, res) => {
  try {
    const id       = parseInt(req.params.id, 10);
    const projects = await readProjects();
    const idx      = projects.findIndex(p => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: '프로젝트를 찾을 수 없습니다.' });
    }

    projects.splice(idx, 1);
    await writeProjects(projects);
    res.json({ success: true });
  } catch (err) {
    console.error('[api] DELETE /projects error:', err);
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

module.exports = router;
