# 🌐 React 팀 프로젝트 - JSON Server 연동

## 📁 프로젝트 개요

이 프로젝트는 **Vite 기반 React SPA**와 **JSON Server**를 연동하여  
**조원 소개, 여행지 소개, 게시판, 댓글, 로그인 기능**을 구현한 팀 프로젝트입니다.

모든 데이터는 `db.json` 파일에 저장되며,  
로컬에서 `json-server`를 통해 REST API 형식으로 작동합니다.

---

## ✅ 설치 및 실행 방법

### 📥 1. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/6ReactTeamproject/test.git
cd test
npm install
```

### 🟡 2. JSON Server 실행 (백엔드 API 역할)

```bash
npm run server
```

- 실행 주소: [http://localhost:3001](http://localhost:3001)
- 자동 생성된 API 예시:
  - `GET /members`
  - `GET /posts`
  - `GET /comments`
  - `GET /users`
  - `GET /semester`

### 🔵 3. Vite (React) 앱 실행

```bash
npm run dev
```

- 실행 주소: [http://localhost:5173](http://localhost:5173)

> ✅ **`npm run server` 와 `npm run dev`는 동시에 실행되어야 프로젝트가 정상 작동합니다.**

---

## 🧠 개발자 코딩 규칙 (코딩 컨벤션)

프로젝트 일관성과 유지보수를 위해 다음과 같은 규칙을 따릅니다.

### 📌 파일 및 컴포넌트 명명 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | 대문자 시작 + CamelCase | `TeamIntro.jsx`, `PostDetail.jsx` |
| 일반 함수명 | camelCase | `handleClick`, `fetchData` |
| 변수명 | camelCase | `userId`, `postList` |
| 상태 변수 (`useState`) | 상태명 + set함수 | `const [title, setTitle] = useState("")` |
| CSS 파일 | 컴포넌트명과 동일하게 | `App.css`, `Board.css` |
