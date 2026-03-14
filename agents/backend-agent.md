# Backend Agent 프롬프트

## 역할
CS-MSA PoC의 API Routes 5개와 LLM 유틸리티를 구현한다.

## 참조
- API 명세: `docs/poc/06_시스템아키텍처_API명세서.md`
- 프롬프트 명세: `docs/poc/04_프롬프트_엔지니어링_명세서.md`
- 기능명세: `docs/poc/02_PoC_기능명세서.md`
- 프로젝트 규칙: `CLAUDE.md`

## 선행 조건
- `src/types/index.ts` 존재 (Schema Agent 산출물)
- `src/lib/supabase.ts` 존재
- `src/lib/sample-data.ts` 존재

## 산출물 (7개 파일)

### 1. `src/lib/claude.ts`
Claude API 래퍼:
```typescript
import Anthropic from "@anthropic-ai/sdk";

// ANTHROPIC_API_KEY 없으면 mock 모드
// mock 모드: getMockResponse(promptType) → 사전 정의된 JSON 반환
// 실제 모드: Anthropic SDK로 호출

export async function callClaude(systemPrompt: string, userPrompt: string): Promise<string>
export async function callClaudeJSON<T>(systemPrompt: string, userPrompt: string): Promise<T>
```
- 모델: `claude-3-5-sonnet-20241022`
- max_tokens: 4096
- mock 모드에서는 키워드 추출, 매칭, 제안서 각각에 대한 현실적인 mock 데이터 반환

### 2. `src/lib/prompts.ts`
프롬프트 4종을 상수로 export:
- `KEYWORD_EXTRACTION_SYSTEM` / `KEYWORD_EXTRACTION_USER(articles)`
- `MATCH_VALIDATION_SYSTEM` / `MATCH_VALIDATION_USER(keyword, containers)`
- `PROPOSAL_GENERATION_SYSTEM` / `PROPOSAL_GENERATION_USER(keyword, trendData, containers)`
- `TREND_SUMMARY_SYSTEM` / `TREND_SUMMARY_USER(keywords)`

04번 문서의 프롬프트 내용을 그대로 사용한다.

### 3. `src/app/api/crawl/route.ts`
POST /api/crawl:
- Body: `{ source?: "sample" | "live" }` (기본 "sample")
- source=sample → sample-data.ts의 SAMPLE_ARTICLES를 Supabase에 upsert (url 기준 중복 방지)
- 응답: `{ success: true, data: { total, new_count, duplicate } }`

### 4. `src/app/api/analyze/route.ts`
POST /api/analyze:
- Supabase에서 analyzed=false인 기사 조회
- 5건씩 배치로 Claude API 호출 (PR-01 키워드 추출 프롬프트)
- 추출된 키워드를 article_keywords에 INSERT
- 기사 analyzed=true 업데이트
- 키워드별 빈도 집계 → trend_keywords UPSERT
- 트렌드 지수 계산: `mention_count × (1 + change_rate / 100)`
- 급증 판정: change_rate > 50%
- 응답: `{ success: true, data: { analyzed_count, keywords_found, top_keywords, surges } }`

### 5. `src/app/api/match/route.ts`
POST /api/match:
- Body: `{ keyword?: string }` (없으면 Top 5)
- trend_keywords에서 대상 키워드 조회
- container_catalog에서 활성 용기 전체 조회
- Claude API 호출 (PR-02 매칭 검증 프롬프트): 키워드와 용기 목록을 주고 적합도 0~100 평가
- 키워드당 Top 3 (적합도 ≥ 60) → match_results 저장
- 응답: `{ success: true, data: { matches: [...] } }`

### 6. `src/app/api/proposal/route.ts`
POST /api/proposal:
- Body: `{ keyword: string, containers: string[] }`
- trend_keywords에서 해당 키워드 데이터 조회
- container_catalog에서 해당 용기 조회
- Claude API 일반 호출 (PR-03 제안서 생성 프롬프트) → Markdown 텍스트 반환
- proposals 테이블에 저장
- 응답: `{ success: true, data: { id, content, keyword, created_at } }`
- **SSE 스트리밍 사용하지 않는다** — 일반 JSON 응답

### 7. `src/app/api/dashboard/route.ts`
GET /api/dashboard:
- Supabase에서 집계 쿼리:
  - total_articles: collected_articles count
  - total_keywords: trend_keywords count
  - total_matches: match_results count
  - total_proposals: proposals count
- top_keywords: trend_keywords에서 trend_index DESC 상위 10개
- recent_matches: match_results에서 최신 10개 (keyword, container 정보 join)
- 응답: `{ success: true, data: { stats, top_keywords, recent_matches } }`

## 최종 출력 요구
모든 파일 구현 완료 후, 반드시 아래 형식의 API Contract Summary를 출력하라:

```
## API Contract Summary
- POST /api/crawl → req: {...} → res: {...}
- POST /api/analyze → req: {...} → res: {...}
- POST /api/match → req: {...} → res: {...}
- POST /api/proposal → req: {...} → res: {...}
- GET /api/dashboard → res: {...}
스트리밍 엔드포인트: 없음
공용 타입 import: @/types
Supabase 클라이언트 import: @/lib/supabase
```

## 규칙
- 모든 API 응답: `{ success: boolean, data?: T, error?: string }` 형태
- try-catch로 에러 핸들링, 에러 시 500 + error 메시지
- SSE/스트리밍 절대 사용 금지
- `any` 타입 사용 금지
