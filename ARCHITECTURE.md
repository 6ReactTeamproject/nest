# 프로젝트 아키텍처 및 전체 흐름 문서

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [전체 구조](#전체-구조)
3. [인증 시스템 흐름](#인증-시스템-흐름)
4. [API 통신 흐름](#api-통신-흐름)
5. [주요 컴포넌트 설명](#주요-컴포넌트-설명)
6. [데이터 흐름 예시](#데이터-흐름-예시)

---

## 프로젝트 개요

현지학기제 카페 프로젝트는 **NestJS (백엔드)**와 **React (프론트엔드)**로 구성된 풀스택 웹 애플리케이션입니다.

### 기술 스택
- **백엔드**: NestJS, TypeORM, MySQL, JWT, Passport
- **프론트엔드**: React, React Router, Context API
- **인증**: JWT (액세스 토큰 + 리프레시 토큰)

---

## 전체 구조

```
프로젝트 루트/
├── backend/              # NestJS 백엔드
│   ├── src/
│   │   ├── auth/        # 인증 모듈 (로그인, 회원가입, 토큰 관리)
│   │   ├── user/        # 사용자 모듈
│   │   ├── posts/       # 게시글 모듈
│   │   ├── comments/    # 댓글 모듈
│   │   ├── messages/    # 쪽지 모듈
│   │   ├── members/     # 멤버 소개 모듈
│   │   ├── semester/    # 학기 모듈
│   │   └── main.ts      # 애플리케이션 진입점
│   └── package.json
│
├── frontend/            # React 프론트엔드
│   ├── src/
│   │   ├── api/
│   │   │   └── fetch.js        # API 통신 모듈 (중앙화된 API 호출)
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── hooks/
│   │   │   └── UserContext.jsx  # 전역 사용자 상태 관리
│   │   └── main.jsx             # React 앱 진입점
│   └── package.json
│
└── mysql/               # 데이터베이스 초기화 스크립트
    └── init/
        └── seed.sql     # 더미 데이터
```

---

## 인증 시스템 흐름

### 1. 회원가입 흐름

```
사용자 입력 (Signup.jsx)
    ↓
POST /auth/register
    ↓
AuthController.register()
    ↓
AuthService.register()
    ├─ 아이디 중복 확인
    ├─ 비밀번호 해싱 (bcrypt)
    ├─ 사용자 생성 (User 엔티티)
    ├─ 액세스 토큰 생성 (JWT, 15분 유효)
    └─ 리프레시 토큰 생성 (랜덤 문자열, 7일 유효)
    ↓
응답: { access_token, refresh_token, user }
    ↓
프론트엔드: localStorage에 저장
    ├─ access_token
    ├─ refresh_token
    └─ user (JSON)
```

### 2. 로그인 흐름

```
사용자 입력 (Login.jsx)
    ↓
POST /auth/login
    ↓
AuthController.login()
    ↓
AuthService.login()
    ├─ validateUser() 호출
    │   ├─ loginId로 사용자 조회
    │   └─ bcrypt.compare()로 비밀번호 검증
    ├─ 액세스 토큰 생성 (JWT)
    └─ 리프레시 토큰 생성
    ↓
응답: { access_token, refresh_token, user }
    ↓
프론트엔드: localStorage에 저장
```

### 3. 토큰 갱신 흐름 (자동)

```
API 요청 (예: POST /posts)
    ↓
액세스 토큰 만료 → 401 에러
    ↓
handleErrorResponse() (fetch.js)
    ↓
refreshAccessToken() 호출
    ├─ localStorage에서 refresh_token 가져오기
    ├─ POST /auth/refresh
    └─ 새 access_token 받기
    ↓
원래 요청 재시도 (새 토큰으로)
    ↓
성공!
```

**중요**: 여러 API 요청이 동시에 401 에러를 받으면, 첫 번째 요청만 리프레시 토큰으로 갱신하고 나머지는 같은 Promise를 기다립니다. (중복 갱신 방지)

### 4. 로그아웃 흐름

```
사용자 클릭 (로그아웃 버튼)
    ↓
POST /auth/logout
    ├─ refresh_token 전송
    └─ 백엔드에서 refresh_token 삭제
    ↓
프론트엔드: localStorage 정리
    ├─ access_token 제거
    ├─ refresh_token 제거
    └─ user 제거
```

---

## API 통신 흐름

### 프론트엔드 API 모듈 (fetch.js)

**위치**: `frontend/src/api/fetch.js`

이 파일은 모든 API 통신을 중앙화하여 관리합니다.

#### 주요 함수

1. **`apiGet(endpoint, idOrQuery)`**
   - GET 요청 처리
   - 예: `apiGet("posts", "1")` → `GET /posts/1`
   - 예: `apiGet("posts/all", "?userId=5")` → `GET /posts/all?userId=5`

2. **`apiPost(endpoint, data, onSuccess)`**
   - POST 요청 처리 (인증 필수)
   - 예: `apiPost("posts", { title: "...", content: "..." })`

3. **`apiPatch(endpoint, id, data)`**
   - PATCH 요청 처리
   - 예: `apiPatch("posts", "1", { title: "수정" })`
   - 예: `apiPatch("posts", "1/view", {})` → 조회수 증가

4. **`apiDelete(endpoint, id)`**
   - DELETE 요청 처리 (인증 필수)
   - 예: `apiDelete("posts", "1")`

#### 공통 기능

- **자동 토큰 갱신**: 401 에러 시 리프레시 토큰으로 자동 갱신 후 재시도
- **에러 처리**: 401, 403 등 상태 코드별 에러 메시지 제공
- **JWT 헤더 자동 추가**: `getHeaders()` 함수로 Authorization 헤더 자동 포함

### 백엔드 API 구조

#### 컨트롤러 → 서비스 → 데이터베이스

```
요청 (HTTP)
    ↓
Controller (라우팅, 요청 검증)
    ↓
Service (비즈니스 로직)
    ↓
Repository (TypeORM, 데이터베이스 접근)
    ↓
MySQL 데이터베이스
```

#### 예시: 게시글 작성

```
POST /posts
    ↓
PostsController.create()
    ├─ @UseGuards(JwtAuthGuard) → JWT 검증
    ├─ @GetUser() → 현재 사용자 정보 추출
    └─ PostsService.create() 호출
        ↓
PostsService.create()
    ├─ 데이터 검증
    ├─ userId 추가 (작성자)
    └─ Post 엔티티 저장
        ↓
데이터베이스에 저장
    ↓
응답: 생성된 게시글 데이터
```

---

## 주요 컴포넌트 설명

### 백엔드

#### 1. AuthService (`backend/src/auth/auth.service.ts`)

**역할**: 인증 관련 비즈니스 로직 처리

**주요 메서드**:
- `validateUser(loginId, password)`: 사용자 인증 (비밀번호 검증)
- `login(loginDto)`: 로그인 처리 및 토큰 발급
- `register(registerDto)`: 회원가입 처리 및 토큰 발급
- `refreshAccessToken(refreshToken)`: 리프레시 토큰으로 새 액세스 토큰 발급
- `generateRefreshToken(userId)`: 리프레시 토큰 생성 (private)
- `logout(refreshToken)`: 로그아웃 (리프레시 토큰 삭제)
- `checkIdExists(loginId)`: 아이디 중복 확인

**토큰 생성 방식**:
- **액세스 토큰**: JWT (JSON Web Token), 15분 유효
- **리프레시 토큰**: 랜덤 문자열 (128자), 7일 유효, 데이터베이스에 저장

#### 2. JwtStrategy (`backend/src/auth/strategies/jwt.strategy.ts`)

**역할**: JWT 토큰 검증 전략

**동작**:
1. 요청 헤더에서 `Authorization: Bearer {token}` 추출
2. JWT 서명 검증
3. payload에서 `userId`, `loginId` 추출
4. `request.user`에 사용자 정보 저장

#### 3. JwtAuthGuard (`backend/src/auth/guards/jwt-auth.guard.ts`)

**역할**: 인증이 필요한 엔드포인트 보호

**사용법**:
```typescript
@UseGuards(JwtAuthGuard)
@Post()
async create() { ... }
```

#### 4. GetUser 데코레이터 (`backend/src/auth/decorators/get-user.decorator.ts`)

**역할**: 컨트롤러에서 현재 사용자 정보 쉽게 가져오기

**사용법**:
```typescript
@Post()
async create(@GetUser() user: { userId: number; loginId: string }) {
  // user.userId, user.loginId 사용 가능
}
```

### 프론트엔드

#### 1. fetch.js (`frontend/src/api/fetch.js`)

**역할**: 모든 API 통신 중앙화

**특징**:
- 자동 토큰 갱신 (401 에러 시)
- 공통 에러 처리
- JWT 헤더 자동 추가

#### 2. UserContext (`frontend/src/hooks/UserContext.jsx`)

**역할**: 전역 사용자 상태 관리

**사용법**:
```javascript
const { user, setUser } = useUser();
// user: 현재 로그인한 사용자 정보 (또는 null)
// setUser: 사용자 정보 업데이트 함수
```

**저장 위치**: `main.jsx`에서 localStorage에서 초기 로드

---

## 데이터 흐름 예시

### 예시 1: 게시글 작성

```
1. 사용자가 게시글 작성 폼 입력
   (WritePost.jsx)

2. apiPost("posts", { title, content, image }) 호출
   (fetch.js)

3. POST /posts 요청
   - 헤더: Authorization: Bearer {access_token}
   - 본문: { title, content, image }

4. PostsController.create()
   - JwtAuthGuard로 토큰 검증
   - GetUser()로 현재 사용자 정보 추출
   - PostsService.create() 호출

5. PostsService.create()
   - userId 추가 (작성자)
   - Post 엔티티 생성 및 저장

6. 데이터베이스에 저장
   (posts 테이블)

7. 응답: { id, title, content, userId, createdAt, ... }

8. 프론트엔드: 성공 메시지 표시 및 페이지 이동
```

### 예시 2: 게시글 조회 (토큰 만료 시)

```
1. 사용자가 게시글 목록 페이지 접속
   (Board.jsx)

2. apiGet("posts/info") 호출
   (fetch.js)

3. GET /posts/info 요청
   - 헤더: Authorization: Bearer {만료된 토큰}

4. 백엔드: 401 Unauthorized 응답
   (토큰 만료)

5. handleErrorResponse() 호출
   (fetch.js)

6. refreshAccessToken() 호출
   - POST /auth/refresh
   - refresh_token 전송
   - 새 access_token 받기
   - localStorage에 저장

7. 원래 요청 재시도
   - GET /posts/info
   - 헤더: Authorization: Bearer {새 토큰}

8. 성공 응답: 게시글 목록 데이터

9. 프론트엔드: 게시글 목록 표시
```

### 예시 3: 댓글 좋아요 토글

```
1. 사용자가 댓글 좋아요 버튼 클릭
   (PostDetail.jsx)

2. apiPatch("comments", "5/like", {}) 호출
   (fetch.js)

3. PATCH /comments/5/like 요청
   - 헤더: Authorization: Bearer {access_token}

4. CommentsController.toggleLike()
   - JwtAuthGuard로 토큰 검증
   - GetUser()로 현재 사용자 정보 추출
   - CommentsService.toggleLike() 호출

5. CommentsService.toggleLike()
   - 댓글 조회
   - likedUserIds 배열 확인
   - 이미 좋아요 했으면 취소, 안 했으면 추가
   - likes 카운트 업데이트

6. 데이터베이스 업데이트
   (comments 테이블)

7. 응답: { id, text, likes, likedUserIds, ... }

8. 프론트엔드: UI 업데이트 (좋아요 수, 버튼 상태)
```

---

## 권한 관리

### 인증 정책

1. **공개 API** (인증 불필요)
   - GET /posts/info (게시글 목록 조회)
   - GET /posts/:id (게시글 상세 조회)
   - GET /posts/:id/view (조회수 증가)
   - GET /user/info (사용자 목록)
   - GET /members (멤버 소개 목록)

2. **인증 필요 API** (JWT 토큰 필수)
   - POST /posts (게시글 작성)
   - PATCH /posts/:id (게시글 수정)
   - DELETE /posts/:id (게시글 삭제)
   - POST /comments (댓글 작성)
   - PATCH /comments/:id (댓글 수정)
   - DELETE /comments/:id (댓글 삭제)
   - PATCH /comments/:id/like (댓글 좋아요)

3. **작성자만 가능** (인증 + 권한 검증)
   - 게시글 수정/삭제: 본인 게시글만
   - 댓글 수정/삭제: 본인 댓글만
   - 사용자 정보 수정: 본인 정보만

**구현 위치**: 각 Service의 `update()`, `remove()` 메서드에서 `userId` 비교

---

## 환경 변수

### 백엔드 (.env)

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3000
```

### 프론트엔드 (constants/index.js)

```javascript
export const API_BASE_URL = "http://localhost:3000";
```

---

## 데이터베이스 구조

### 주요 테이블

1. **users**: 사용자 정보
   - id, loginId, password (해싱됨), name, image, giturl

2. **refresh_tokens**: 리프레시 토큰
   - id, token (128자 랜덤 문자열), userId, expiresAt, createdAt

3. **posts**: 게시글
   - id, title, content, image, userId, views, createdAt

4. **comments**: 댓글
   - id, text, postId, userId, parentId, likes, likedUserIds (JSON 배열)

5. **messages**: 쪽지
   - id, content, senderId, receiverId, isRead, createdAt

6. **members**: 멤버 소개
   - id, name, introduction, image, userId

---

## 주요 파일 경로 참조

### 백엔드
- 인증 컨트롤러: `backend/src/auth/auth.controller.ts`
- 인증 서비스: `backend/src/auth/auth.service.ts`
- JWT 전략: `backend/src/auth/strategies/jwt.strategy.ts`
- JWT 가드: `backend/src/auth/guards/jwt-auth.guard.ts`
- 사용자 데코레이터: `backend/src/auth/decorators/get-user.decorator.ts`
- 앱 모듈: `backend/src/app.module.ts`
- 메인 진입점: `backend/src/main.ts`

### 프론트엔드
- API 통신: `frontend/src/api/fetch.js`
- 사용자 컨텍스트: `frontend/src/hooks/UserContext.jsx`
- 메인 진입점: `frontend/src/main.jsx`
- 상수: `frontend/src/constants/index.js`

---

## 추가 참고사항

### 토큰 저장 위치
- **프론트엔드**: localStorage
  - `access_token`: JWT 토큰
  - `refresh_token`: 리프레시 토큰
  - `user`: 사용자 정보 (JSON)

### 보안 고려사항
1. 비밀번호는 bcrypt로 해싱하여 저장
2. 액세스 토큰은 짧은 유효기간 (15분)
3. 리프레시 토큰은 데이터베이스에 저장하여 무효화 가능
4. 한 사용자당 하나의 리프레시 토큰만 유지 (새 로그인 시 기존 토큰 삭제)

### 에러 처리
- 401 (Unauthorized): 토큰 만료/무효 → 자동 갱신 시도
- 403 (Forbidden): 권한 없음 → 에러 메시지 표시
- 기타: 에러 메시지 표시

---

이 문서는 프로젝트의 전체 구조와 데이터 흐름을 이해하는 데 도움이 됩니다. 추가 질문이나 수정 사항이 있으면 알려주세요.


