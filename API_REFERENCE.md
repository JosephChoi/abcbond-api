# ABC Bond API Reference

ABC Bond API의 전체 엔드포인트 참조 문서입니다.

## 🔐 인증

대부분의 엔드포인트는 JWT 인증이 필요합니다. 로그인 후 받은 토큰을 Authorization 헤더에 포함하세요:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "count": 10  // 목록 조회 시
}
```

### 에러 응답

```json
{
  "error": "Error message",
  "status": 400
}
```

## 🔑 인증 (Authentication)

### POST /auth/login

사용자 로그인

**공개 엔드포인트** (인증 불필요)

**Request Body:**
```json
{
  "username": "user1",
  "password": "1234"
}
```

**Response:**
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

**에러:**
- 401: Invalid credentials

---

## 👤 사용자 (Users)

### GET /users/profile

현재 로그인한 사용자의 프로필 조회

**인증 필요**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user1",
    "name": "김투자",
    "email": "user1@example.com",
    "phone": "010-1234-5678",
    "avatar": "https://...",
    "address": "서울특별시 강남구...",
    "member_since": "2024-01-01T00:00:00.000Z",
    "newsletter": true,
    "notifications": true,
    "theme": "light"
  }
}
```

### PUT /users/profile

현재 로그인한 사용자의 프로필 수정

**인증 필요**

**Request Body:**
```json
{
  "name": "김투자",
  "phone": "010-1234-5678",
  "address": "서울특별시 강남구...",
  "newsletter": true,
  "notifications": true,
  "theme": "dark"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### GET /users

모든 사용자 목록 조회 (관리자 전용)

**인증 필요**

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 3
}
```

### GET /users/:id

특정 사용자 조회 (관리자 전용)

**인증 필요**

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 🏢 투자 상품 (Investments)

### GET /investments

투자 상품 목록 조회

**공개 엔드포인트**

**Query Parameters:**
- `status`: active | completed | cancelled (선택)
- `type`: apartment | commercial | office (선택)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "강남 래미안 퍼스티지",
      "location": "서울 강남구 대치동",
      "address": "서울특별시 강남구 대치동 123-45",
      "total_amount": 15000000000,
      "expected_return": 8.5,
      "start_date": "2024-01-15",
      "end_date": "2026-01-15",
      "image": "https://...",
      "status": "active",
      "type": "apartment",
      "description": "강남 핵심 지역에 위치한...",
      "property_value": 18000000000,
      "kb_valuation": 18500000000,
      "senior_loan": 10000000000,
      "ltv": 55.6,
      "details": {
        "buildingType": "아파트",
        "totalUnits": 1248,
        "buildYear": 2023,
        "area": "84㎡",
        "floor": "중층",
        "direction": "남향",
        "parking": "1.5대/세대",
        "heating": "중앙난방"
      },
      "images": ["https://...", "https://...", "https://..."]
    }
  ],
  "count": 6
}
```

### GET /investments/:id

특정 투자 상품 상세 조회

**공개 엔드포인트**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "강남 래미안 퍼스티지",
    ...,
    "monthlyInterest": [
      { "month": "2024-02", "amount": 354166 },
      { "month": "2024-03", "amount": 354166 }
    ],
    "registrationDocument": {
      "issueDate": "2024-01-10",
      "propertyInfo": { ... },
      "ownershipInfo": { ... },
      "rightsInfo": [ ... ],
      "restrictionsInfo": [ ... ]
    }
  }
}
```

### POST /investments

새로운 투자 상품 생성 (관리자 전용)

**인증 필요**

**Request Body:**
```json
{
  "name": "투자 상품명",
  "location": "서울 강남구",
  "address": "상세 주소",
  "total_amount": 10000000000,
  "expected_return": 8.5,
  "start_date": "2024-01-01",
  "end_date": "2026-01-01",
  "image": "https://...",
  "status": "active",
  "type": "apartment",
  "description": "상품 설명",
  "property_value": 12000000000,
  "kb_valuation": 12500000000,
  "senior_loan": 7000000000,
  "ltv": 58.3,
  "details": { ... },
  "images": [ ... ],
  "registration_document": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": { ... }
}
```

### PUT /investments/:id

투자 상품 정보 수정 (관리자 전용)

**인증 필요**

**Request Body:** POST와 동일 (수정할 필드만)

**Response:**
```json
{
  "success": true,
  "message": "Investment updated successfully",
  "data": { ... }
}
```

### DELETE /investments/:id

투자 상품 삭제 (관리자 전용)

**인증 필요**

**Response:**
```json
{
  "success": true,
  "message": "Investment deleted successfully"
}
```

### POST /investments/:id/monthly-interests

투자 상품의 월별 이자 추가 (관리자 전용)

**인증 필요**

**Request Body:**
```json
{
  "month": "2024-11",
  "amount": 350000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Monthly interest added successfully",
  "data": {
    "id": 100,
    "investment_id": 1,
    "month": "2024-11",
    "amount": 350000
  }
}
```

---

## 💰 사용자 투자 관리 (User Investments)

### GET /user-investments/my

현재 로그인한 사용자의 투자 내역 조회

**인증 필요**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "investment_id": 1,
      "invested_amount": 50000000,
      "invested_date": "2024-01-15T00:00:00.000Z",
      "status": "active",
      "name": "강남 래미안 퍼스티지",
      "location": "서울 강남구 대치동",
      "address": "서울특별시 강남구 대치동 123-45",
      "total_amount": 15000000000,
      "expected_return": 8.5,
      "start_date": "2024-01-15",
      "end_date": "2026-01-15",
      "image": "https://...",
      "type": "apartment"
    }
  ],
  "count": 3
}
```

### GET /user-investments/my/stats

현재 로그인한 사용자의 투자 통계 조회

**인증 필요**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvested": 100000000,
    "investmentCount": 3,
    "expectedReturn": 8.2,
    "monthlyIncome": 683333
  }
}
```

### GET /user-investments/:investmentId/investors

특정 투자 상품에 투자한 사용자 목록 조회 (관리자 전용)

**인증 필요**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "invested_amount": 50000000,
      "invested_date": "2024-01-15T00:00:00.000Z",
      "name": "김투자",
      "email": "user1@example.com"
    }
  ],
  "count": 2
}
```

### POST /user-investments

새로운 투자 생성

**인증 필요**

**Request Body:**
```json
{
  "investment_id": 1,
  "invested_amount": 10000000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "id": 10,
    "user_id": 1,
    "investment_id": 1,
    "invested_amount": 10000000,
    "status": "active"
  }
}
```

**에러:**
- 400: Invalid investment amount
- 400: Already invested in this investment
- 404: Investment not found

### PUT /user-investments/:investmentId

투자 금액 수정

**인증 필요**

**Request Body:**
```json
{
  "invested_amount": 15000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "investment_id": 1,
    "invested_amount": 15000000,
    "message": "Investment amount updated successfully"
  }
}
```

### POST /user-investments/:investmentId/cancel

투자 취소 (상태 변경)

**인증 필요**

**Response:**
```json
{
  "success": true,
  "message": "Investment cancelled successfully"
}
```

### DELETE /user-investments/:investmentId

투자 삭제

**인증 필요**

**Response:**
```json
{
  "success": true,
  "message": "User investment deleted successfully"
}
```

---

## 🏥 시스템 (System)

### GET /

API 정보

**공개 엔드포인트**

**Response:**
```json
{
  "message": "ABC Bond API - 부동산 투자 플랫폼",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-10-23T12:00:00.000Z",
  "endpoints": {
    "docs": "/docs",
    "health": "/health",
    "auth": "/auth",
    "users": "/users",
    "investments": "/investments",
    "userInvestments": "/user-investments"
  }
}
```

### GET /health

헬스체크

**공개 엔드포인트**

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-23T12:00:00.000Z"
}
```

### GET /docs

Swagger UI API 문서

**공개 엔드포인트**

브라우저에서 http://localhost:8787/docs 접속

---

## ⚠️ 에러 코드

| 코드 | 설명 |
|------|------|
| 400 | ValidationError - 잘못된 요청 |
| 401 | UnauthorizedError - 인증 실패 |
| 404 | NotFoundError - 리소스 없음 |
| 500 | InternalError - 서버 에러 |

---

## 💡 사용 예시

### 로그인 → 투자 → 통계 조회 플로우

```bash
# 1. 로그인
TOKEN=$(curl -s -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "1234"}' | jq -r '.token')

# 2. 투자 상품 목록 조회
curl http://localhost:8787/investments

# 3. 투자 생성
curl -X POST http://localhost:8787/user-investments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "investment_id": 1,
    "invested_amount": 10000000
  }'

# 4. 내 투자 내역 조회
curl http://localhost:8787/user-investments/my \
  -H "Authorization: Bearer $TOKEN"

# 5. 투자 통계 조회
curl http://localhost:8787/user-investments/my/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

더 자세한 정보는 http://localhost:8787/docs 에서 확인하세요.

