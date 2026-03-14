# Schema Agent 프롬프트

## 역할
CS-MSA PoC의 타입 정의, Supabase 클라이언트, 시드 데이터를 생성한다.

## 참조
- 데이터 모델: `docs/poc/05_데이터_모델_설계서.md`
- 프로젝트 규칙: `CLAUDE.md`

## 산출물 (6개 파일)

### 1. `src/types/index.ts`
모든 TypeScript 인터페이스를 정의한다:
- `Article` — collected_articles 테이블 매핑
- `ArticleKeyword` — article_keywords 테이블 매핑
- `TrendKeyword` — trend_keywords 테이블 매핑
- `Container` — container_catalog 테이블 매핑
- `MatchResult` — match_results 테이블 매핑
- `Proposal` — proposals 테이블 매핑
- `CrawlLog` — crawl_logs 테이블 매핑
- `DashboardStats` — 대시보드 통계 응답 타입
- `ApiResponse<T>` — 공통 API 응답 래퍼 `{ success: boolean, data?: T, error?: string }`

### 2. `src/lib/supabase.ts`
Supabase 클라이언트를 생성한다:
- `createClient()` 함수 export
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수 사용
- 환경 변수 미설정 시 콘솔 경고 출력

### 3. `src/lib/sample-data.ts`
시드 데이터를 export한다:
- `SAMPLE_ARTICLES: Article[]` — 화장품 용기 패키징 관련 영문 기사 30건
  - 각 기사: source, url(가상), title, content(200~500자), published_at(최근 2주 분산)
  - 소스 분포: packaging-world 10건, cosmetics-design 10건, beauty-packaging 10건
  - 내용에 airless, refillable, bio-plastic, minimalist, glass premium 등 키워드 자연스럽게 포함
- `SAMPLE_CONTAINERS: Container[]` — 창신 가상 용기 카탈로그 30종
  - 05번 문서의 시드 데이터 30종 그대로 사용
  - container_code, container_name, shape, material, finish, volume, description, is_active 포함

### 4. `supabase/schema.sql`
05번 문서의 7개 테이블 DDL 그대로 작성한다. pgvector 확장과 embedding 컬럼은 제외한다 (PoC에서 미사용).

### 5. `supabase/seed.sql`
sample-data.ts의 용기 카탈로그 30종을 INSERT 문으로 작성한다.

## 규칙
- `any` 타입 사용 금지
- 모든 인터페이스에 JSDoc 주석 추가
- 시드 기사 content는 실제 패키징 업계 기사처럼 자연스러운 영문으로 작성
- 날짜는 2026-03-01 ~ 2026-03-14 범위
