# 김돌 포트폴리오 2026.03.23

Express 기반 포트폴리오 웹사이트

---

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 SESSION_SECRET 및 ADMIN_PASSWORD_HASH 수정

# 3. 서버 실행
npm start          # 프로덕션
npm run dev        # 개발 (nodemon)
```

`http://localhost:3000` 접속

---

## 프로젝트 구조

```
portfolio/
├── server.js                  # Express 엔트리포인트
├── .env.example               # 환경변수 템플릿
├── data/
│   └── projects.json          # 프로젝트 데이터 (JSON)
├── routes/
│   ├── auth.js                # 로그인 / 로그아웃 / 상태
│   └── projects.js            # 프로젝트 CRUD
├── middleware/
│   └── auth.js                # 관리자 세션 가드
└── public/
    ├── index.html             # 메인 페이지
    ├── css/
    │   └── style.css          # 전체 스타일
    ├── js/
    │   ├── main.js            # 커서, Reveal, 연락 폼
    │   ├── nav.js             # 네비게이션
    │   ├── admin.js           # 관리자 인증
    │   └── projects.js        # 프로젝트 렌더링 & 업로드
    └── uploads/               # 업로드 이미지 (자동 생성)
```

---

## API 엔드포인트

| Method | Path                  | 권한     | 설명             |
|--------|-----------------------|----------|------------------|
| GET    | `/api/auth/status`    | 공개     | 관리자 세션 확인 |
| POST   | `/api/auth/login`     | 공개     | 로그인           |
| POST   | `/api/auth/logout`    | 공개     | 로그아웃         |
| GET    | `/api/projects`       | 공개     | 프로젝트 목록    |
| POST   | `/api/projects`       | 관리자   | 프로젝트 추가    |
| DELETE | `/api/projects/:id`   | 관리자   | 프로젝트 삭제    |

---

## 관리자 비밀번호 변경

```bash
node -e "const b=require('bcryptjs'); b.hash('새비밀번호', 10).then(console.log)"
```

출력된 해시를 `.env`의 `ADMIN_PASSWORD_HASH`에 붙여넣기

---

## 관리자 접근 방법

푸터의 **"김돌 — Kim Dol"** 텍스트를 **2초 안에 5번 클릭**
