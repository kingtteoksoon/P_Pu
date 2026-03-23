'use strict';

const express      = require('express');
const path         = require('path');
const fs           = require('fs');
const multer       = require('multer');
const { requireAdmin } = require('../middleware/auth');

const router      = express.Router();
const DATA_FILE   = path.join(__dirname, '../data/projects.json');
const UPLOAD_DIR  = path.join(__dirname, '../public/uploads');

// ── 업로드 디렉터리 보장
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── multer 설정
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  },
});

// ── 헬퍼
function readProjects() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeProjects(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
function nextId(projects) {
  return projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;
}

// ── GET /api/projects  (공개)
router.get('/', (_req, res) => {
  try {
    res.json(readProjects());
  } catch (err) {
    res.status(500).json({ success: false, message: '프로젝트를 불러오지 못했습니다.' });
  }
});

// ── POST /api/projects  (관리자 전용)
router.post('/', requireAdmin, upload.array('images', 10), (req, res) => {
  try {
    const { title, description, category, year, tags, links } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: '제목은 필수입니다.' });
    }

    const projects = readProjects();
    const newProject = {
      id:          nextId(projects),
      title:       title.trim(),
      description: (description || '').trim(),
      category:    category || '',
      tags:        tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      year:        year || String(new Date().getFullYear()),
      status:      null,
      links:       links ? JSON.parse(links) : [],
      images:      req.files && req.files.length > 0
               ? req.files.map(f => `/uploads/${f.filename}`)
               : [],
    };

    projects.push(newProject);
    writeProjects(projects);

    res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    console.error('[projects] POST error:', err);
    res.status(500).json({ success: false, message: '프로젝트 추가에 실패했습니다.' });
  }
});


// ── GET /api/projects/:id  (공개 - 상세)
router.get('/:id', (req, res) => {
  try {
    const id      = parseInt(req.params.id, 10);
    const projects = readProjects();
    const project  = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ success: false, message: '프로젝트를 찾을 수 없습니다.' });
    // prev / next id 계산
    const idx  = projects.indexOf(project);
    const prev = idx > 0               ? projects[idx - 1].id : null;
    const next = idx < projects.length - 1 ? projects[idx + 1].id : null;
    res.json({ ...project, prevId: prev, nextId: next });
  } catch (err) {
    res.status(500).json({ success: false, message: '프로젝트를 불러오지 못했습니다.' });
  }
});

// ── DELETE /api/projects/:id  (관리자 전용)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const id       = parseInt(req.params.id, 10);
    let projects   = readProjects();
    const target   = projects.find(p => p.id === id);

    if (!target) return res.status(404).json({ success: false, message: '프로젝트를 찾을 수 없습니다.' });

    // 이미지 파일 삭제 (배열)
    const imgList = Array.isArray(target.images) ? target.images : (target.image ? [target.image] : []);
    imgList.forEach(img => {
      const filePath = path.join(__dirname, '../public', img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    projects = projects.filter(p => p.id !== id);
    writeProjects(projects);
    res.json({ success: true });
  } catch (err) {
    console.error('[projects] DELETE error:', err);
    res.status(500).json({ success: false, message: '삭제에 실패했습니다.' });
  }
});

module.exports = router;
