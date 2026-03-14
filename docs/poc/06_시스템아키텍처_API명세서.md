# CS-MSA PoC 시스템 아키텍처 & API 명세서

> **작성일**: 2026-03-14 | **v2.0 커팅 반영**  
> **커팅**: Recharts→CSS바 / SSE→일반POST / 4→3페이지

---

## 1. 단순화 아키텍처

```
[Next.js App (Vercel)]
  ├── /app (프론트엔드: 대시보드 3페이지)
  └── /app/api (백엔드: API Routes 4개)
         │
         ├── Claude API ── 키워드 추출, 매칭, 제안서 생성
         └── Supabase ──── 데이터 저장 (PostgreSQL)
```

### 핵심 단순화 포인트

| 원래 설계 | PoC 단순화 | 사유 |
|----------|-----------|------|
| Airflow DAG 스케줄링 | 대시보드 버튼 수동 트리거 | 인프라 제거 |
| pgvector 벡터 매칭 | Claude API 기반 텍스트 매칭 | 임베딩 파이프라인 제거 |
| 실시간 크롤링 3개 소스 | 샘플 기사 시드 + 선택적 크롤 1개 소스 | 크롤링 안정성 리스크 제거 |
| FastAPI 별도 서버 | Next.js API Routes 통합 | 서버 1대로 통합 |
| Slack Webhook | 대시보드 내 알림 표시 | 외부 연동 최소화 |
| 사용자 인증 | 없음 (퍼블릭 데모) | 시간 절약 |

---

## 2. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 14.x |
| 언어 | TypeScript | 5.x |
| 스타일링 | Tailwind CSS + shadcn/ui | 3.x |
| 차트 | ~~Recharts~~ → Tailwind CSS 바 차트 | - |
| DB | Supabase (PostgreSQL) | - |
| LLM | Claude API (Anthropic) | claude-3-5-sonnet |
| 배포 | Vercel | - |
| 패키지매니저 | pnpm | - |

---

## 3. API 명세

### 3.1 POST /api/crawl — 데이터 수집

```
요청: POST /api/crawl
Body: { "source"?: "sample" | "live" }  // 기본값 "sample"

응답 200:
{
  "success": true,
  "data": {
    "total": 30,
    "new": 25,
    "duplicate": 5
  }
}

에러 500:
{ "success": false, "error": "수집 실패 메시지" }
```

- `source: "sample"` → 시드 데이터 30건 INSERT (안전, 시연용)
- `source: "live"` → 실제 크롤링 1개 소스 (보너스 기능)

### 3.2 POST /api/analyze — 키워드 분석

```
요청: POST /api/analyze
Body: 없음

응답 200:
{
  "success": true,
  "data": {
    "analyzed_count": 25,
    "keywords_found": 42,
    "top_keywords": [
      { "keyword": "airless pump", "category": "shape", "count": 15, "change_rate": 72.0 }
    ],
    "surges": ["airless pump", "refillable"]
  }
}
```

### 3.3 POST /api/match — 용기 매칭

```
요청: POST /api/match
Body: { "keyword"?: "airless pump" }  // 없으면 Top 5 전체 매칭

응답 200:
{
  "success": true,
  "data": {
    "matches": [
      {
        "keyword": "airless pump",
        "containers": [
          {
            "container_code": "CS-AP-001",
            "container_name": "에어리스 진공 펌프 50ml",
            "shape": "airless pump",
            "material": "PP",
            "finish": "matte coating",
            "volume": "50ml",
            "fit_score": 92,
            "fit_reason": "트렌드 키워드와 용기 형태가 직접 일치"
          }
        ]
      }
    ]
  }
}
```

### 3.4 POST /api/proposal — 제안서 생성 (일반 POST)

```
요청: POST /api/proposal
Body: {
  "keyword": "airless pump",
  "containers": ["CS-AP-001", "CS-AP-002", "CS-AP-003"]
}

응답 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "# 트렌드 기반 선제 제안서\n\n## 1. 트렌드 요약\n\n...",
    "keyword": "airless pump",
    "created_at": "2026-03-14T..."
  }
}
```

### 3.5 GET /api/dashboard — 대시보드 데이터

```
요청: GET /api/dashboard

응답 200:
{
  "stats": {
    "total_articles": 30,
    "total_keywords": 42,
    "total_matches": 15,
    "total_proposals": 3
  },
  "top_keywords": [...],
  "recent_matches": [...],
  "trend_chart_data": [
    { "date": "03-08", "airless_pump": 5, "refillable": 3, "bio_plastic": 2 },
    { "date": "03-09", "airless_pump": 8, "refillable": 4, "bio_plastic": 3 }
  ]
}
```

---

## 4. 디렉토리 구조

```
cs-msa-poc/
├── .env.local              # API 키 (ANTHROPIC_API_KEY, SUPABASE_URL, ...)
├── .gitignore
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── supabase/
│   └── seed.sql            # 시드 데이터 (기사 30건 + 용기 30종)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 공통 레이아웃 + 사이드바
│   │   ├── page.tsx        # 메인 대시보드 + 트렌드 (통합)
│   │   ├── matching/page.tsx # 매칭 결과
│   │   ├── proposal/page.tsx # 제안서 생성
│   │   └── globals.css
│   ├── app/api/
│   │   ├── crawl/route.ts
│   │   ├── analyze/route.ts
│   │   ├── match/route.ts
│   │   ├── proposal/route.ts
│   │   └── dashboard/route.ts
│   ├── components/
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   ├── layout/Sidebar.tsx
│   │   ├── dashboard/      # 대시보드 컴포넌트
│   │   ├── trends/         # 트렌드 컴포넌트
│   │   ├── matching/       # 매칭 컴포넌트
│   │   └── proposal/       # 제안서 컴포넌트
│   ├── lib/
│   │   ├── supabase.ts     # Supabase 클라이언트
│   │   ├── claude.ts       # Claude API 래퍼
│   │   ├── prompts.ts      # 프롬프트 모음
│   │   └── sample-data.ts  # 시드 데이터
│   └── types/
│       └── index.ts        # 타입 정의
└── docs/poc/               # 기획 문서
```
