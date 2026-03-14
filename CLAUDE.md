# CS-MSA PoC — 프로젝트 규칙

## 프로젝트 개요
- **시스템명**: CS-MSA (Changshin Market Sensing Agent)
- **목적**: 화장품 용기 디자인 트렌드 센싱 PoC — 클라이언트 시연용
- **기술 스택**: Next.js 14 (App Router) + Supabase + Gemini API + Vercel

## 디렉토리 구조
```
창신/
├── docs/                    # 기획 문서 (PRD, SRS, 기능명세서)
│   └── poc/                 # PoC 기획 문서 7종
├── agents/                  # Subagent 프롬프트 정의
├── supabase/                # DB 스키마, 시드 데이터
├── src/
│   ├── app/                 # Next.js App Router 페이지
│   │   ├── page.tsx         # 메인 대시보드 + 트렌드 (통합)
│   │   ├── matching/        # 매칭 결과 페이지
│   │   ├── proposal/        # 제안서 생성 페이지
│   │   └── api/             # API Routes (crawl, analyze, match, proposal, dashboard)
│   ├── components/
│   │   ├── ui/              # shadcn/ui 기본 컴포넌트
│   │   ├── layout/          # Sidebar 등 레이아웃
│   │   ├── dashboard/       # 대시보드 전용 컴포넌트
│   │   ├── matching/        # 매칭 전용 컴포넌트
│   │   └── proposal/        # 제안서 전용 컴포넌트
│   ├── lib/                 # 유틸리티, API 클라이언트
│   └── types/               # TypeScript 타입 정의
├── CLAUDE.md                # 이 파일
└── package.json
```

## 코딩 규칙

### TypeScript
- strict 모드 사용
- 모든 함수에 반환 타입 명시
- `any` 사용 금지 — `unknown` 또는 구체적 타입 사용
- 타입은 `src/types/index.ts`에서 중앙 관리

### Next.js
- App Router 사용 (pages 디렉토리 아님)
- 서버 컴포넌트 기본, 클라이언트 필요 시 `"use client"` 명시
- API Routes는 `src/app/api/[name]/route.ts` 패턴
- 환경 변수: 서버 전용은 `process.env.`, 클라이언트는 `NEXT_PUBLIC_` 접두사

### 스타일링
- Tailwind CSS + shadcn/ui 사용
- Recharts 사용 금지 — CSS 프로그레스 바로 시각화
- 색상 테마: 다크 네이비 사이드바(#0f172a) + 화이트 콘텐츠
- 액센트: blue-600, 급증: red-500, 긍정: green-500

### API 패턴
- 모든 API 응답: `{ success: boolean, data?: T, error?: string }`
- SSE 스트리밍 사용 금지 — 일반 POST + JSON 응답
- Gemini API 호출: `src/lib/gemini.ts` 래퍼 사용
- Mock fallback: `GEMINI_API_KEY` 미설정 시 자동 mock 응답

### Supabase
- 클라이언트: `src/lib/supabase.ts`
- 서버 사이드: `createClient()` 직접 호출
- RLS 비활성화 (PoC)

## 커팅 사항 (시간 절약)
- ~~Recharts~~ → Tailwind CSS 바 차트
- ~~SSE 스트리밍~~ → 일반 POST 응답
- ~~4페이지~~ → 3페이지 (대시보드+트렌드 통합)
- ~~pgvector 벡터 매칭~~ → Gemini 텍스트 매칭
- ~~Slack 알림~~ → 제거
- ~~사용자 인증~~ → 없음

## 참조 문서
- 기능명세서: `docs/poc/02_PoC_기능명세서.md`
- 프롬프트 명세: `docs/poc/04_프롬프트_엔지니어링_명세서.md`
- 데이터 모델: `docs/poc/05_데이터_모델_설계서.md`
- API 명세: `docs/poc/06_시스템아키텍처_API명세서.md`
- UI 와이어프레임: `docs/poc/07_UI와이어프레임_테스트기준.md`
