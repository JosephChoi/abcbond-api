# ABC Bond API 설치 및 설정 가이드

이 문서는 ABC Bond API 프로젝트를 처음부터 설정하는 방법을 설명합니다.

## 📋 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Cloudflare 계정 (배포 시)

## 🚀 설치 단계

### 1. 의존성 설치

```bash
npm install
```

설치되는 패키지:
- `hono` - 웹 프레임워크
- `@hono/swagger-ui` - API 문서화
- `jose` - JWT 인증
- `wrangler` - Cloudflare Workers CLI (개발 도구)

### 2. D1 데이터베이스 생성

```bash
# D1 데이터베이스 생성
wrangler d1 create abcbon-db
```

실행 결과에서 `database_id`를 복사합니다:

```
✅ Successfully created DB 'abcbon-db'!

[[d1_databases]]
binding = "DB"
database_name = "abcbon-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 이 ID를 복사
```

### 3. wrangler.toml 업데이트

`wrangler.toml` 파일을 열고 `database_id`를 업데이트합니다:

```toml
[[d1_databases]]
binding = "DB"
database_name = "abcbon-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 여기에 복사한 ID 입력
```

### 4. 로컬 개발 DB 초기화

```bash
# 로컬 DB 스키마 및 샘플 데이터 생성
npm run db:init:local
```

이 명령은 다음을 생성합니다:
- 테이블: users, investments, user_investments, monthly_interests
- 샘플 사용자 3명
- 샘플 투자 상품 6개
- 샘플 투자 내역 및 월별 이자 데이터

### 5. 환경 변수 확인

`.dev.vars` 파일이 자동으로 생성되어 있습니다:

```
JWT_SECRET=dev-secret-key-change-this-in-production
ENVIRONMENT=development
```

필요시 `JWT_SECRET`을 변경할 수 있습니다:

```bash
# 새로운 시크릿 키 생성 (선택사항)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 다음 URL에서 접근 가능합니다:
- API: http://localhost:8787
- Swagger 문서: http://localhost:8787/docs
- Health Check: http://localhost:8787/health

## 🧪 테스트

### 1. Health Check

```bash
curl http://localhost:8787/health
```

### 2. 로그인 테스트

```bash
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "1234"
  }'
```

성공 시 JWT 토큰이 반환됩니다:

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

### 3. 투자 상품 조회 테스트

```bash
curl http://localhost:8787/investments
```

### 4. 인증이 필요한 엔드포인트 테스트

```bash
# 로그인에서 받은 토큰을 사용
TOKEN="your-jwt-token-here"

curl http://localhost:8787/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 🌐 프로덕션 배포

### 1. 프로덕션 DB 초기화

```bash
# 프로덕션 DB에 스키마 적용
npm run db:init
```

### 2. JWT Secret 설정

```bash
# 프로덕션용 JWT Secret 설정 (최초 1회)
wrangler secret put JWT_SECRET --env production

# 프롬프트에서 시크릿 키 입력 (위에서 생성한 키 사용)
```

### 3. 배포

```bash
# 프로덕션 배포
npm run deploy:prod

# 또는 개발 환경 배포
npm run deploy:dev
```

## 📊 샘플 데이터

### 테스트 계정

| Username | Password | Name | Email |
|----------|----------|------|-------|
| user1 | 1234 | 김투자 | user1@example.com |
| user2 | 1234 | 이부자 | user2@example.com |
| admin | admin | 관리자 | admin@example.com |

### 투자 상품

6개의 샘플 투자 상품이 포함되어 있습니다:
1. 강남 래미안 퍼스티지
2. 여의도 트리마제
3. 송파 헬리오시티
4. 판교 알파리움
5. 마포 래미안 푸르지오
6. 용산 더샵

## 🔧 트러블슈팅

### "database_id not found" 에러

`wrangler.toml`의 `database_id`가 올바르게 설정되지 않았습니다.
`wrangler d1 create` 명령으로 받은 ID를 정확히 입력했는지 확인하세요.

### JWT 토큰 에러

`.dev.vars` 파일에 `JWT_SECRET`이 설정되어 있는지 확인하세요.

### 데이터베이스가 비어있음

```bash
# 로컬 DB 재초기화
npm run db:init:local
```

### 포트 충돌 (8787)

다른 프로세스가 8787 포트를 사용 중일 수 있습니다:

```bash
# macOS/Linux
lsof -ti:8787 | xargs kill -9

# Windows
netstat -ano | findstr :8787
taskkill /PID <PID> /F
```

## 📝 다음 단계

설치가 완료되었다면:

1. 📖 [CONTRIBUTING.md](CONTRIBUTING.md)를 읽고 개발 규칙을 숙지하세요
2. 📚 [README.md](README.md)에서 API 엔드포인트를 확인하세요
3. 🌐 http://localhost:8787/docs에서 Swagger 문서를 확인하세요
4. 🚀 개발을 시작하세요!

## 💡 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 로컬 DB 초기화
npm run db:init:local

# 프로덕션 DB 초기화
npm run db:init

# 프로덕션 배포
npm run deploy:prod

# 개발 환경 배포
npm run deploy:dev
```

---

문제가 발생하면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하거나 팀에 문의하세요.

