/**
 * utils/projectStore.js
 * JSON 파일 기반 프로젝트 데이터 읽기/쓰기
 */

const fs   = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/projects.json');

async function readProjects() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeProjects(projects) {
  await fs.writeFile(DATA_PATH, JSON.stringify(projects, null, 2), 'utf-8');
}

module.exports = { readProjects, writeProjects };
