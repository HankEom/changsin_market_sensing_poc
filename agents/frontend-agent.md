# Frontend Agent 프롬프트

## 역할
CS-MSA PoC의 프론트엔드 3페이지와 레이아웃을 구현한다.

## 참조
- UI 와이어프레임: `docs/poc/07_UI와이어프레임_테스트기준.md`
- 기능명세: `docs/poc/02_PoC_기능명세서.md`
- 프로젝트 규칙: `CLAUDE.md`

## 선행 조건
- `src/types/index.ts` 존재
- `src/components/ui/` shadcn 컴포넌트 존재
- Backend API 구현 완료

## API Contract (Backend Agent 산출물에서 주입됨)
> 이 섹션은 오케스트레이터가 Backend Agent 산출물의 Contract Summary로 교체한다.

## 산출물

### 1. `src/components/layout/Sidebar.tsx`
"use client" 컴포넌트:
- 다크 네이비 배경 (#0f172a), 너비 240px 고정
- 상단: CS-MSA 로고/텍스트
- 네비게이션: 대시보드(/), 매칭(/matching), 제안서(/proposal) — lucide-react 아이콘 사용
- 현재 경로 하이라이트 (usePathname)
- 하단: [수집 실행] 버튼 — 클릭 시 /api/crawl → /api/analyze → /api/match 순차 호출
  - 실행 중 스피너 + 단계 표시 ("수집 중..." → "분석 중..." → "매칭 중...")
  - 완료 시 alert 또는 상태 업데이트

### 2. `src/app/layout.tsx` (수정)
- Sidebar를 좌측에 배치
- 메인 콘텐츠 영역: `ml-60 p-8`
- Inter 폰트 적용

### 3. `src/app/page.tsx` — 메인 대시보드 + 트렌드 통합
"use client" 페이지:
- GET /api/dashboard 호출하여 데이터 로드
- 상단: 통계 카드 4개 (수집 기사, 키워드, 매칭, 제안서) — Card + lucide 아이콘
- 중앙: Top 5 트렌드 키워드
  - 각 키워드: 순위, 키워드명, 카테고리 Badge, 변화율 Badge(급증 시 빨간색), CSS 프로그레스 바(언급수/최대값 비율), 언급수
  - **Recharts 사용 금지** — div + Tailwind width 클래스로 바 차트 구현
- 하단: 키워드 전체 테이블 (shadcn Table)
  - 컬럼: 키워드, 카테고리, 언급수, 변화율, 급증 여부

### 4. `src/app/matching/page.tsx` — 매칭 결과
"use client" 페이지:
- 상단: [매칭 실행] 버튼 (POST /api/match 호출)
- GET /api/dashboard의 recent_matches 또는 별도 매칭 데이터 로드
- 키워드별 그룹핑하여 매칭 결과 카드 표시:
  - 그룹 헤더: "트렌드: {keyword} (↑{change_rate}%)"
  - 카드: 용기코드, 용기명, 소재, 마감, 용량
  - 적합도: CSS 프로그레스 바 + 점수 숫자
  - 적합 이유: 텍스트
  - [제안서 생성 →] 버튼 → /proposal?keyword=...&containers=... 으로 이동

### 5. `src/app/proposal/page.tsx` — 제안서 생성
"use client" 페이지:
- 2컬럼 레이아웃 (좌측 입력, 우측 결과)
- 좌측:
  - 트렌드 키워드 Select (trend_keywords 목록 조회)
  - 매칭 용기 Checkbox 목록 (선택한 키워드의 매칭 결과에서)
  - [생성하기] 버튼
- 우측:
  - 생성 전: 빈 안내 텍스트
  - 생성 중: Skeleton 로딩
  - 생성 완료: react-markdown으로 Markdown 렌더링
  - 하단: [복사] 버튼 (navigator.clipboard), [다운로드] 버튼 (.md 파일)
- URL 쿼리 파라미터로 keyword, containers 받으면 자동 선택

## 디자인 규칙
- 색상: 다크 네이비 사이드바(#0f172a) + 화이트 콘텐츠 배경
- 액센트: blue-600, 급증: red-500, 긍정: green-500
- 카테고리 Badge 색상: shape=blue, material=green, finish=purple
- 모든 카드: shadcn Card 사용, 둥근 모서리, 미세 그림자
- 반응형 불필요 (데스크톱 시연 전용)
- 로딩 상태: shadcn Skeleton 사용
- 에러 상태: 에러 메시지 표시 + 재시도 버튼

## 규칙
- `"use client"` 필요한 컴포넌트에만 명시
- fetch 호출 시 에러 핸들링 필수
- Recharts, chart.js 등 차트 라이브러리 사용 금지
- 하드코딩된 데이터 금지 — 모든 데이터는 API에서 fetch
