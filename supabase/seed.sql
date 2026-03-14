-- ============================================================
-- CS-MSA PoC — Schema + Seed Data
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 0. 확장
-- pgvector는 PoC에서 사용하지 않으므로 생략 (Claude → Gemini 텍스트 매칭)

-- 1. 테이블 생성 ------------------------------------------------

CREATE TABLE IF NOT EXISTS collected_articles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source        VARCHAR(100) NOT NULL,
  url           TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  summary       TEXT,
  image_url     TEXT,
  language      VARCHAR(10) DEFAULT 'en',
  published_at  TIMESTAMPTZ,
  analyzed      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_keywords (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id  UUID REFERENCES collected_articles(id) ON DELETE CASCADE,
  keyword     VARCHAR(100) NOT NULL,
  category    VARCHAR(20) NOT NULL CHECK (category IN ('shape', 'material', 'finish')),
  relevance   REAL DEFAULT 0.0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trend_keywords (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword        VARCHAR(100) NOT NULL,
  category       VARCHAR(20) NOT NULL CHECK (category IN ('shape', 'material', 'finish')),
  mention_count  INTEGER DEFAULT 0,
  trend_index    REAL DEFAULT 0.0,
  change_rate    REAL DEFAULT 0.0,
  is_surge       BOOLEAN DEFAULT FALSE,
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, period_start)
);

CREATE TABLE IF NOT EXISTS container_catalog (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  container_code  VARCHAR(50) UNIQUE NOT NULL,
  container_name  VARCHAR(200) NOT NULL,
  shape           VARCHAR(100) NOT NULL,
  material        VARCHAR(100) NOT NULL,
  finish          VARCHAR(100),
  volume          VARCHAR(50),
  description     TEXT,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_results (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id       UUID REFERENCES trend_keywords(id),
  container_id     UUID REFERENCES container_catalog(id),
  similarity_score REAL NOT NULL,
  fit_score        INTEGER,
  fit_reason       TEXT,
  suggestion       TEXT,
  match_rank       INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id  UUID REFERENCES trend_keywords(id),
  match_ids   UUID[] NOT NULL,
  content     TEXT NOT NULL,
  format      VARCHAR(20) DEFAULT 'summary',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crawl_logs (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source         VARCHAR(100),
  status         VARCHAR(20) CHECK (status IN ('success', 'error', 'timeout')),
  articles_found INTEGER DEFAULT 0,
  articles_saved INTEGER DEFAULT 0,
  error_message  TEXT,
  executed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 ------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_articles_analyzed ON collected_articles(analyzed) WHERE analyzed = FALSE;
CREATE INDEX IF NOT EXISTS idx_articles_created  ON collected_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source   ON collected_articles(source);
CREATE INDEX IF NOT EXISTS idx_ak_article  ON article_keywords(article_id);
CREATE INDEX IF NOT EXISTS idx_ak_keyword  ON article_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_ak_category ON article_keywords(category);
CREATE INDEX IF NOT EXISTS idx_tk_surge  ON trend_keywords(is_surge) WHERE is_surge = TRUE;
CREATE INDEX IF NOT EXISTS idx_tk_period ON trend_keywords(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_mr_keyword   ON match_results(keyword_id);
CREATE INDEX IF NOT EXISTS idx_mr_container ON match_results(container_id);
CREATE INDEX IF NOT EXISTS idx_mr_created   ON match_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cc_active ON container_catalog(is_active) WHERE is_active = TRUE;

-- 3. RLS 비활성화 (PoC) ----------------------------------------

ALTER TABLE collected_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE article_keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE trend_keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE container_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs DISABLE ROW LEVEL SECURITY;

-- 4. 용기 카탈로그 시드 (30종) -----------------------------------

INSERT INTO container_catalog (container_code, container_name, shape, material, finish, volume) VALUES
  ('CS-AP-001', '에어리스 진공 펌프 50ml', 'airless pump', 'PP', 'matte coating', '50ml'),
  ('CS-AP-002', '에어리스 진공 펌프 30ml', 'airless pump', 'PETG', 'UV coating', '30ml'),
  ('CS-AP-003', '에어리스 미니 펌프 15ml', 'airless pump', 'PP', 'glossy', '15ml'),
  ('CS-DP-001', '드롭퍼 보틀 30ml', 'dropper bottle', 'glass', 'frosted', '30ml'),
  ('CS-DP-002', '드롭퍼 보틀 15ml', 'dropper bottle', 'PETG', 'transparent', '15ml'),
  ('CS-TB-001', '튜브 100ml', 'tube', 'PE', 'silk printing', '100ml'),
  ('CS-TB-002', '튜브 50ml', 'tube', 'bio-PE', 'hot stamping', '50ml'),
  ('CS-TB-003', '미니 튜브 30ml', 'tube', 'PE', 'matte', '30ml'),
  ('CS-CP-001', '컴팩트 케이스 15g', 'compact', 'ABS', 'metallic', '15g'),
  ('CS-CP-002', '컴팩트 쿠션 케이스', 'compact cushion', 'PP', 'soft-touch', '15g'),
  ('CS-CJ-001', '크림자 100ml', 'cream jar', 'glass', 'UV coating', '100ml'),
  ('CS-CJ-002', '크림자 50ml', 'cream jar', 'acrylic', 'metalizing', '50ml'),
  ('CS-CJ-003', '미니 크림자 30ml', 'cream jar', 'PP', 'matte', '30ml'),
  ('CS-MS-001', '미스트 스프레이 150ml', 'mist spray', 'PET', 'transparent', '150ml'),
  ('CS-MS-002', '미스트 스프레이 100ml', 'mist spray', 'PETG', 'color tinted', '100ml'),
  ('CS-MS-003', '미니 미스트 50ml', 'mist spray', 'PP', 'frosted', '50ml'),
  ('CS-RF-001', '리필 파우치 50ml', 'refillable pouch', 'PE/AL', 'matte', '50ml'),
  ('CS-RF-002', '리필 카트리지 30ml', 'refillable cartridge', 'PP', 'glossy', '30ml'),
  ('CS-RF-003', '리필 팟 15ml', 'refillable pod', 'aluminum', 'anodized', '15ml'),
  ('CS-PP-001', '펌프 보틀 200ml', 'pump bottle', 'HDPE', 'silk printing', '200ml'),
  ('CS-PP-002', '펌프 보틀 100ml', 'pump bottle', 'PET', 'shrink label', '100ml'),
  ('CS-PP-003', '미니 펌프 30ml', 'pump bottle', 'PP', 'UV coating', '30ml'),
  ('CS-SQ-001', '스퀴즈 보틀 150ml', 'squeeze bottle', 'LDPE', 'offset printing', '150ml'),
  ('CS-AM-001', '앰플 보틀 10ml', 'ampoule', 'glass', 'frosted', '10ml'),
  ('CS-AM-002', '앰플 보틀 5ml', 'ampoule', 'glass', 'transparent', '5ml'),
  ('CS-ST-001', '스틱 타입 15g', 'stick', 'PP', 'matte', '15g'),
  ('CS-CU-001', '쿠션 리필 15g', 'cushion refill', 'PP', 'soft-touch', '15g'),
  ('CS-BP-001', '바이오 플라스틱 크림자 50ml', 'cream jar', 'PLA (bio)', 'matte', '50ml'),
  ('CS-BP-002', '바이오 에어리스 30ml', 'airless pump', 'bio-PP', 'UV coating', '30ml'),
  ('CS-AL-001', '알루미늄 틴 케이스 30g', 'tin case', 'aluminum', 'brushed', '30g')
ON CONFLICT (container_code) DO NOTHING;
