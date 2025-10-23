# ABC Bond API

부동산 투자 플랫폼 ABC Bond의 백엔드 API 서버입니다.

> **⚠️ 개발자 안내**: 개발 시작 전 반드시 [CONTRIBUTING.md](CONTRIBUTING.md)를 읽어주세요.
> 모든 코드는 이 가이드의 규칙을 따라야 합니다.

## 📋 프로젝트 개요

ABC Bond는 부동산(주로 아파트) 투자 상품을 제공하는 플랫폼입니다. 사용자는 다양한 부동산 투자 상품에 투자하고, 월별 이자 수익을 확인할 수 있습니다.

### 주요 기능

- 👤 **사용자 관리**: 회원가입, 로그인, 프로필 관리
- 🏢 **투자 상품 관리**: 부동산 투자 상품 조회, 등록, 수정
- 💰 **투자 내역 관리**: 사용자의 투자 생성, 조회, 수정, 취소
- 📊 **투자 통계**: 총 투자금액, 예상 수익률, 월 수익 등

## 🛠️ 기술 스택

- **프레임워크**: [Hono](https://hono.dev/) - 고성능 웹 프레임워크
- **런타임**: [Cloudflare Workers](https://workers.cloudflare.com/) - 엣지 컴퓨팅
- **데이터베이스**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite 기반
- **인증**: JWT (JSON Web Tokens)
- **문서화**: Swagger UI

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 설치

```bash
cd abcbon-api
npm install
```

### 2. 데이터베이스 설정

```bash
# D1 데이터베이스 생성
npm run db:create

# wrangler.toml의 database_id를 업데이트한 후:
# 로컬 개발용 DB 초기화
npm run db:init:local
```

### 3. 환경 변수 설정

`.dev.vars` 파일이 자동으로 생성되어 있습니다. 필요시 수정하세요:

```bash
JWT_SECRET=your-secret-key-here
ENVIRONMENT=development
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면:
- **API**: http://localhost:8787
- **Swagger 문서**: http://localhost:8787/docs
- **Health Check**: http://localhost:8787/health

## 📚 API 엔드포인트

### 공개 엔드포인트 (인증 불필요)

- `GET /` - API 정보
- `GET /health` - 헬스체크
- `GET /docs` - Swagger 문서
- `POST /auth/login` - 로그인
- `GET /investments` - 투자 상품 목록
- `GET /investments/:id` - 투자 상품 상세

### 인증 필요 엔드포인트

#### 사용자
- `GET /users/profile` - 내 프로필 조회
- `PUT /users/profile` - 내 프로필 수정
- `GET /users` - 사용자 목록 (관리자)
- `GET /users/:id` - 특정 사용자 조회 (관리자)

#### 투자 상품 (관리자 전용)
- `POST /investments` - 투자 상품 생성
- `PUT /investments/:id` - 투자 상품 수정
- `DELETE /investments/:id` - 투자 상품 삭제
- `POST /investments/:id/monthly-interests` - 월별 이자 추가

#### 사용자 투자 관리
- `GET /user-investments/my` - 내 투자 내역
- `GET /user-investments/my/stats` - 내 투자 통계
- `POST /user-investments` - 투자 생성
- `PUT /user-investments/:id` - 투자 금액 수정
- `POST /user-investments/:id/cancel` - 투자 취소
- `DELETE /user-investments/:id` - 투자 삭제

## 🔐 인증

### 로그인

```bash
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "1234"
  }'
```

응답:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user1",
    "name": "김투자",
    "email": "user1@example.com"
  }
}
```

### 테스트 계정

- **user1**: `1234` - 일반 사용자
- **user2**: `1234` - 일반 사용자
- **admin**: `admin` - 관리자

### 인증 헤더

인증이 필요한 엔드포인트 호출 시 JWT 토큰을 헤더에 포함:

```bash
curl -X GET http://localhost:8787/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 💾 데이터베이스 구조

### 주요 테이블

1. **users** - 사용자 정보
2. **investments** - 투자 상품 정보
3. **user_investments** - 사용자 투자 내역
4. **monthly_interests** - 월별 이자 수익

자세한 스키마는 [schema.sql](schema.sql)을 참고하세요.

## 📁 프로젝트 구조

```
abcbon-api/
├── src/
│   ├── routes/              # API 라우트
│   │   ├── auth.js          # 인증 (로그인)
│   │   ├── users.js         # 사용자 관리
│   │   ├── investments.js   # 투자 상품
│   │   └── userInvestments.js # 사용자 투자 관리
│   ├── services/            # 비즈니스 로직 (클래스)
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── investmentService.js
│   │   └── userInvestmentService.js
│   ├── middleware/          # 미들웨어
│   │   ├── auth.js          # JWT 인증
│   │   └── errorHandler.js  # 에러 처리
│   ├── utils/               # 유틸리티 함수
│   ├── openapi.js           # API 문서 스펙
│   └── index.js             # 엔트리 포인트
├── schema.sql               # DB 스키마 및 샘플 데이터
├── wrangler.toml            # Cloudflare Workers 설정
├── package.json
├── .dev.vars                # 로컬 환경 변수 (git 제외)
├── CONTRIBUTING.md          # 개발 가이드 (필수 읽기!)
└── README.md
```

## 🧪 API 테스트 예시

### 투자 상품 목록 조회

```bash
curl http://localhost:8787/investments
```

### 내 투자 내역 조회

```bash
curl http://localhost:8787/user-investments/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 투자 통계 조회

```bash
curl http://localhost:8787/user-investments/my/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 새로운 투자 생성

```bash
curl -X POST http://localhost:8787/user-investments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "investment_id": 1,
    "invested_amount": 10000000
  }'
```

## 🌐 배포

### Production 배포

```bash
# 1. JWT_SECRET 설정 (최초 1회)
wrangler secret put JWT_SECRET --env production

# 2. 프로덕션 DB 초기화 (최초 1회)
npm run db:init

# 3. 배포
npm run deploy:prod
```

### Development 배포

```bash
npm run deploy:dev
```

## 🔧 개발 가이드

### 코딩 규칙

프로젝트의 모든 코드는 [CONTRIBUTING.md](CONTRIBUTING.md)의 규칙을 따라야 합니다:

1. ✅ **서비스는 항상 클래스로 작성** (`constructor(env)` 패턴)
2. ✅ **utils는 stateless 함수로 작성**
3. ✅ **라우트에는 비즈니스 로직 금지** (서비스 레이어에 위임)
4. ✅ **파일명은 camelCase** (예: `investmentService.js`)
5. ✅ **env는 생성자에서 주입**
6. ✅ **Cloudflare 바인딩은 직접 사용** (`c.env.DB`, `c.env.KV`)
7. ✅ **인증이 필요한 라우트는 PUBLIC_PATHS에서 제외**

### 새로운 기능 추가

1. 서비스 생성: `src/services/newService.js`
2. 라우트 생성: `src/routes/newRoute.js`
3. `src/index.js`에 라우트 등록
4. 필요시 `PUBLIC_PATHS`에 공개 경로 추가

## 📝 라이센스

ISC

## 👥 팀

ABC Bond Development Team

---

**개발 관련 문의**: [CONTRIBUTING.md](CONTRIBUTING.md) 참고
