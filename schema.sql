-- ABC Bond API Database Schema
-- 부동산 투자 플랫폼 데이터베이스 스키마

-- ============================================
-- 사용자 테이블 (Users)
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- 실제 프로덕션에서는 해시된 비밀번호 사용
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar TEXT,
  address TEXT,
  member_since TEXT DEFAULT (datetime('now')),
  newsletter BOOLEAN DEFAULT 1,
  notifications BOOLEAN DEFAULT 1,
  theme TEXT DEFAULT 'light',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- 투자 상품 테이블 (Investments)
-- ============================================
DROP TABLE IF EXISTS investments;
CREATE TABLE investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  total_amount INTEGER NOT NULL, -- 총 투자 금액
  expected_return REAL NOT NULL, -- 예상 수익률 (%)
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'active', -- active, completed, cancelled
  type TEXT DEFAULT 'apartment', -- apartment, commercial, office
  description TEXT,
  
  -- 부동산 정보
  property_value INTEGER, -- 담보 가치
  kb_valuation INTEGER, -- KB 감정가
  senior_loan INTEGER, -- 선순위 대출
  ltv REAL, -- LTV 비율
  
  -- 상세 정보 (JSON으로 저장)
  details TEXT, -- JSON: {buildingType, totalUnits, buildYear, area, floor, direction, parking, heating}
  images TEXT, -- JSON: array of image URLs
  
  -- 등기부등본 정보 (JSON으로 저장)
  registration_document TEXT, -- JSON: 등기부등본 전체 정보
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- 사용자 투자 내역 테이블 (User Investments)
-- ============================================
DROP TABLE IF EXISTS user_investments;
CREATE TABLE user_investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  investment_id INTEGER NOT NULL,
  invested_amount INTEGER NOT NULL, -- 투자 금액
  invested_date TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'active', -- active, completed, cancelled
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  UNIQUE(user_id, investment_id)
);

-- ============================================
-- 월별 이자 수익 테이블 (Monthly Interests)
-- ============================================
DROP TABLE IF EXISTS monthly_interests;
CREATE TABLE monthly_interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  investment_id INTEGER NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM 형식
  amount INTEGER NOT NULL, -- 월 이자 금액
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  UNIQUE(investment_id, month)
);

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX idx_user_investments_investment_id ON user_investments(investment_id);
CREATE INDEX idx_monthly_interests_investment_id ON monthly_interests(investment_id);

-- ============================================
-- 샘플 데이터 삽입
-- ============================================

-- 사용자 데이터
INSERT INTO users (id, username, password, name, email, phone, avatar, address) VALUES
(1, 'user1', '1234', '김투자', 'user1@example.com', '010-1234-5678', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', '서울특별시 강남구 테헤란로 123'),
(2, 'user2', '1234', '이부자', 'user2@example.com', '010-2345-6789', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', '서울특별시 서초구 서초대로 456'),
(3, 'admin', 'admin', '관리자', 'admin@example.com', '010-9999-0000', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', '서울특별시 종로구 종로 1');

-- 투자 상품 데이터
INSERT INTO investments (
  id, name, location, address, total_amount, expected_return, 
  start_date, end_date, image, status, type, description,
  property_value, kb_valuation, senior_loan, ltv,
  details, images, registration_document
) VALUES
(1, '강남 래미안 퍼스티지', '서울 강남구 대치동', '서울특별시 강남구 대치동 123-45', 
 15000000000, 8.5, '2024-01-15', '2026-01-15',
 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
 'active', 'apartment',
 '강남 핵심 지역에 위치한 프리미엄 아파트 투자 상품입니다. 대치동 은마아파트 재건축 단지로, 뛰어난 교통 접근성과 교육 환경을 자랑합니다.',
 18000000000, 18500000000, 10000000000, 55.6,
 '{"buildingType":"아파트","totalUnits":1248,"buildYear":2023,"area":"84㎡","floor":"중층","direction":"남향","parking":"1.5대/세대","heating":"중앙난방"}',
 '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"]',
 '{"issueDate":"2024-01-10","propertyInfo":{"address":"서울특별시 강남구 대치동 123-45","buildingName":"래미안 퍼스티지","buildingType":"아파트","structure":"철근콘크리트구조","floors":"지하 2층, 지상 25층","totalArea":"84.99㎡","buildDate":"2023년 3월 15일"},"ownershipInfo":{"owner":"ABC Bond 투자조합","registrationDate":"2024-01-15","registrationCause":"매매","shareRatio":"1/1"},"rightsInfo":[{"type":"소유권","holder":"ABC Bond 투자조합","registrationDate":"2024-01-15","purpose":"소유권이전"}],"restrictionsInfo":[{"type":"근저당권","holder":"KB국민은행","amount":10000000000,"registrationDate":"2024-01-16","purpose":"채권최고액"}]}'),

(2, '여의도 트리마제', '서울 영등포구 여의도동', '서울특별시 영등포구 여의도동 23-1',
 12000000000, 7.2, '2024-03-20', '2026-03-20',
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
 'active', 'apartment',
 '여의도 금융 중심지에 위치한 최고급 주거 단지입니다. 한강 조망이 가능하며, CBD 접근성이 우수합니다.',
 14000000000, 14800000000, 8000000000, 57.1,
 '{"buildingType":"아파트","totalUnits":892,"buildYear":2022,"area":"114㎡","floor":"고층","direction":"남동향","parking":"2대/세대","heating":"개별난방"}',
 '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"]',
 '{"issueDate":"2024-03-15","propertyInfo":{"address":"서울특별시 영등포구 여의도동 23-1","buildingName":"트리마제","buildingType":"아파트","structure":"철근콘크리트구조","floors":"지하 3층, 지상 30층","totalArea":"114.35㎡","buildDate":"2022년 9월 20일"},"ownershipInfo":{"owner":"ABC Bond 투자조합","registrationDate":"2024-03-20","registrationCause":"매매","shareRatio":"1/1"},"rightsInfo":[{"type":"소유권","holder":"ABC Bond 투자조합","registrationDate":"2024-03-20","purpose":"소유권이전"}],"restrictionsInfo":[{"type":"근저당권","holder":"신한은행","amount":8000000000,"registrationDate":"2024-03-21","purpose":"채권최고액"}]}'),

(3, '송파 헬리오시티', '서울 송파구 신천동', '서울특별시 송파구 신천동 7-20',
 18000000000, 9.1, '2024-02-10', '2026-02-10',
 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
 'active', 'apartment',
 '송파구 최대 규모의 프리미엄 복합 단지입니다. 롯데월드타워 인근으로 생활 편의시설이 우수하며, GTX 개통 예정으로 향후 가치 상승이 기대됩니다.',
 20000000000, 21000000000, 11000000000, 55.0,
 '{"buildingType":"아파트","totalUnits":3508,"buildYear":2021,"area":"99㎡","floor":"중층","direction":"남향","parking":"1.8대/세대","heating":"지역난방"}',
 '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"]',
 '{"issueDate":"2024-02-05","propertyInfo":{"address":"서울특별시 송파구 신천동 7-20","buildingName":"헬리오시티","buildingType":"아파트","structure":"철근콘크리트구조","floors":"지하 4층, 지상 35층","totalArea":"99.85㎡","buildDate":"2021년 12월 10일"},"ownershipInfo":{"owner":"ABC Bond 투자조합","registrationDate":"2024-02-10","registrationCause":"매매","shareRatio":"1/1"},"rightsInfo":[{"type":"소유권","holder":"ABC Bond 투자조합","registrationDate":"2024-02-10","purpose":"소유권이전"}],"restrictionsInfo":[{"type":"근저당권","holder":"하나은행","amount":11000000000,"registrationDate":"2024-02-11","purpose":"채권최고액"}]}'),

(4, '판교 알파리움', '경기 성남시 분당구 판교동', '경기도 성남시 분당구 판교동 532',
 20000000000, 10.3, '2023-11-05', '2025-11-05',
 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
 'active', 'apartment',
 '판교 테크노밸리 핵심 지역의 프리미엄 주거 단지입니다. IT 기업 밀집 지역으로 안정적인 임대 수요가 보장되며, 뛰어난 교육 환경과 생활 인프라를 갖추고 있습니다.',
 22000000000, 23000000000, 12000000000, 54.5,
 '{"buildingType":"아파트","totalUnits":1680,"buildYear":2020,"area":"124㎡","floor":"고층","direction":"남서향","parking":"2.2대/세대","heating":"개별난방"}',
 '["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"]',
 '{"issueDate":"2023-10-30","propertyInfo":{"address":"경기도 성남시 분당구 판교동 532","buildingName":"알파리움","buildingType":"아파트","structure":"철근콘크리트구조","floors":"지하 3층, 지상 28층","totalArea":"124.72㎡","buildDate":"2020년 6월 25일"},"ownershipInfo":{"owner":"ABC Bond 투자조합","registrationDate":"2023-11-05","registrationCause":"매매","shareRatio":"1/1"},"rightsInfo":[{"type":"소유권","holder":"ABC Bond 투자조합","registrationDate":"2023-11-05","purpose":"소유권이전"}],"restrictionsInfo":[{"type":"근저당권","holder":"우리은행","amount":12000000000,"registrationDate":"2023-11-06","purpose":"채권최고액"}]}'),

(5, '마포 래미안 푸르지오', '서울 마포구 공덕동', '서울특별시 마포구 공덕동 105',
 13500000000, 6.8, '2024-04-01', '2026-04-01',
 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
 'active', 'apartment',
 '마포 공덕역 초역세권 프리미엄 아파트입니다. 5호선, 6호선, 경의중앙선, 공항철도 4개 노선 이용 가능하며, 업무 지구와의 접근성이 뛰어납니다.',
 15000000000, 15800000000, 8500000000, 56.7,
 '{"buildingType":"아파트","totalUnits":756,"buildYear":2021,"area":"84㎡","floor":"중층","direction":"남향","parking":"1.6대/세대","heating":"지역난방"}',
 '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"]',
 '{"issueDate":"2024-03-25","propertyInfo":{"address":"서울특별시 마포구 공덕동 105","buildingName":"래미안 푸르지오","buildingType":"아파트","structure":"철근콘크리트구조","floors":"지하 2층, 지상 25층","totalArea":"84.96㎡","buildDate":"2021년 5월 30일"},"ownershipInfo":{"owner":"ABC Bond 투자조합","registrationDate":"2024-04-01","registrationCause":"매매","shareRatio":"1/1"},"rightsInfo":[{"type":"소유권","holder":"ABC Bond 투자조합","registrationDate":"2024-04-01","purpose":"소유권이전"}],"restrictionsInfo":[{"type":"근저당권","holder":"기업은행","amount":8500000000,"registrationDate":"2024-04-02","purpose":"채권최고액"}]}'),

(6, '용산 더샵', '서울 용산구 이촌동', '서울특별시 용산구 이촌동 302-11',
 16000000000, 8.9, '2024-05-15', '2026-05-15',
 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
 'active', 'apartment',
 '용산 한강변의 프리미엄 주거 단지입니다. 한강 조망과 함께 용산 국제업무지구 개발로 인한 가치 상승이 기대됩니다. 교통과 교육 환경이 우수한 입지입니다.',
 17000000000, 18000000000, 9500000000, 55.9,
 '{"buildingType":"아파트","totalUnits":1024,"buildYear":2022,"area":"109㎡","floor":"중고층","direction":"남향","parking":"1.9대/세대","heating":"개별난방"}',
 '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"]',
 '{"issueDate":"2024-05-10","propertyInfo":{"address":"서울특별시 용산구 이촌동 302-11","buildingName":"더샵","buildingType":"아파트","structure":"철근콘크리트구조","floors":"지하 3층, 지상 32층","totalArea":"109.44㎡","buildDate":"2022년 8월 20일"},"ownershipInfo":{"owner":"ABC Bond 투자조합","registrationDate":"2024-05-15","registrationCause":"매매","shareRatio":"1/1"},"rightsInfo":[{"type":"소유권","holder":"ABC Bond 투자조합","registrationDate":"2024-05-15","purpose":"소유권이전"}],"restrictionsInfo":[{"type":"근저당권","holder":"NH농협은행","amount":9500000000,"registrationDate":"2024-05-16","purpose":"채권최고액"}]}');

-- 사용자 투자 내역
INSERT INTO user_investments (user_id, investment_id, invested_amount, invested_date) VALUES
(1, 1, 50000000, '2024-01-15'),
(1, 2, 30000000, '2024-03-20'),
(1, 3, 20000000, '2024-02-10'),
(2, 4, 40000000, '2023-11-05'),
(2, 5, 25000000, '2024-04-01'),
(3, 1, 50000000, '2024-01-15'),
(3, 2, 30000000, '2024-03-20'),
(3, 3, 20000000, '2024-02-10'),
(3, 4, 40000000, '2023-11-05'),
(3, 5, 25000000, '2024-04-01'),
(3, 6, 35000000, '2024-05-15');

-- 월별 이자 수익 (투자 상품 1: 강남 래미안 퍼스티지)
INSERT INTO monthly_interests (investment_id, month, amount) VALUES
(1, '2024-02', 354166),
(1, '2024-03', 354166),
(1, '2024-04', 354166),
(1, '2024-05', 354166),
(1, '2024-06', 354166),
(1, '2024-07', 354166),
(1, '2024-08', 354166),
(1, '2024-09', 354166),
(1, '2024-10', 354166);

-- 월별 이자 수익 (투자 상품 2: 여의도 트리마제)
INSERT INTO monthly_interests (investment_id, month, amount) VALUES
(2, '2024-04', 180000),
(2, '2024-05', 180000),
(2, '2024-06', 180000),
(2, '2024-07', 180000),
(2, '2024-08', 180000),
(2, '2024-09', 180000),
(2, '2024-10', 180000);

-- 월별 이자 수익 (투자 상품 3: 송파 헬리오시티)
INSERT INTO monthly_interests (investment_id, month, amount) VALUES
(3, '2024-03', 151666),
(3, '2024-04', 151666),
(3, '2024-05', 151666),
(3, '2024-06', 151666),
(3, '2024-07', 151666),
(3, '2024-08', 151666),
(3, '2024-09', 151666),
(3, '2024-10', 151666);

-- 월별 이자 수익 (투자 상품 4: 판교 알파리움)
INSERT INTO monthly_interests (investment_id, month, amount) VALUES
(4, '2023-12', 343333),
(4, '2024-01', 343333),
(4, '2024-02', 343333),
(4, '2024-03', 343333),
(4, '2024-04', 343333),
(4, '2024-05', 343333),
(4, '2024-06', 343333),
(4, '2024-07', 343333),
(4, '2024-08', 343333),
(4, '2024-09', 343333),
(4, '2024-10', 343333);

-- 월별 이자 수익 (투자 상품 5: 마포 래미안 푸르지오)
INSERT INTO monthly_interests (investment_id, month, amount) VALUES
(5, '2024-05', 141666),
(5, '2024-06', 141666),
(5, '2024-07', 141666),
(5, '2024-08', 141666),
(5, '2024-09', 141666),
(5, '2024-10', 141666);

-- 월별 이자 수익 (투자 상품 6: 용산 더샵)
INSERT INTO monthly_interests (investment_id, month, amount) VALUES
(6, '2024-06', 259583),
(6, '2024-07', 259583),
(6, '2024-08', 259583),
(6, '2024-09', 259583),
(6, '2024-10', 259583);
