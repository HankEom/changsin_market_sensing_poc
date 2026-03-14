/**
 * CS-MSA PoC — LLM 프롬프트 템플릿
 * PR-01 ~ PR-04 (프롬프트 엔지니어링 명세서 기반)
 */

interface PromptPair {
  system: string;
  user: string;
}

// ─── PR-01: 키워드 추출 ──────────────────────────

export function getKeywordExtractionPrompt(
  title: string,
  content: string
): PromptPair {
  return {
    system: `You are an expert analyst in cosmetic packaging and container design trends.
Your task is to extract relevant cosmetic container keywords from packaging industry articles.

Rules:
1. Extract keywords ONLY related to cosmetic containers/packaging
2. Classify each keyword into exactly one category: shape, material, or finish
3. Use standardized English terms
4. Return 0 keywords if the article is not relevant to cosmetic packaging
5. Do NOT extract brand names or company names as keywords`,

    user: `Analyze this packaging industry article and extract cosmetic container keywords.

<article>
Title: ${title}
Content: ${content}
</article>

Return a JSON array of keywords. Each keyword must have:
- "keyword": the standardized term in English (lowercase)
- "category": one of "shape", "material", "finish"
- "relevance": confidence score 0.0 to 1.0

Example output:
[
  {"keyword": "airless pump", "category": "shape", "relevance": 0.95},
  {"keyword": "recycled PET", "category": "material", "relevance": 0.88},
  {"keyword": "matte coating", "category": "finish", "relevance": 0.72}
]

Return ONLY the JSON array, no other text.`,
  };
}

// ─── PR-02: 매칭 검증 ──────────────────────────

interface ContainerSpec {
  container_code: string;
  container_name: string;
  shape: string;
  material: string;
  finish: string | null;
  volume: string | null;
  description: string | null;
}

export function getMatchVerificationPrompt(
  keyword: string,
  category: string,
  container: ContainerSpec
): PromptPair {
  return {
    system: `You are a cosmetic packaging expert who evaluates whether a specific container matches a market trend. You assess the fit between trending design keywords and actual container specifications.`,

    user: `Evaluate the match between this trend keyword and container.

Trend Keyword: ${keyword}
Trend Category: ${category}
Current Trend Context: Trending keyword "${keyword}" in the ${category} category of cosmetic packaging.

Container:
- Code: ${container.container_code}
- Name: ${container.container_name}
- Shape: ${container.shape}
- Material: ${container.material}
- Finish: ${container.finish ?? "N/A"}
- Specifications: ${container.volume ?? "N/A"}

Rate the match:
1. "fit_score": 0-100 (how well this container fits the trend)
2. "fit_reason": one sentence explaining why it fits or doesn't
3. "suggestion": one sentence on how to better position this container for the trend

Return JSON only:
{"fit_score": 85, "fit_reason": "...", "suggestion": "..."}`,
  };
}

// ─── PR-03: 제안서 생성 ──────────────────────────

interface TrendData {
  keyword: string;
  category: string;
  trend_index: number;
  change_rate: number;
  mention_count: number;
}

interface MatchedContainerInfo {
  container_code: string;
  container_name: string;
  shape: string;
  material: string;
  finish: string | null;
  volume: string | null;
  fit_score: number;
  fit_reason: string;
}

export function getProposalPrompt(
  keyword: string,
  trendData: TrendData,
  containers: MatchedContainerInfo[]
): PromptPair {
  const containersText = containers
    .map(
      (c, i) =>
        `${i + 1}. ${c.container_code} ${c.container_name}
   - 형태: ${c.shape} / 소재: ${c.material} / 마감: ${c.finish ?? "N/A"} / 용량: ${c.volume ?? "N/A"}
   - 적합도: ${c.fit_score}점
   - 적합 사유: ${c.fit_reason}`
    )
    .join("\n");

  return {
    system: `You are a senior sales consultant for Changshin, a leading cosmetic container OEM manufacturer. You write compelling, data-driven proposals that help beauty brands stay ahead of packaging trends.

Writing style:
- Professional but accessible Korean (한국어)
- Data-driven with specific numbers and trends
- Action-oriented with clear recommendations
- Highlight Changshin's manufacturing capabilities`,

    user: `다음 트렌드 분석과 매칭 용기 정보를 바탕으로 클라이언트에게 보낼 선제 제안서를 작성하세요.

## 트렌드 분석
- 키워드: ${keyword}
- 카테고리: ${trendData.category}
- 트렌드 지수: ${trendData.trend_index}
- 전주 대비 변화율: ${trendData.change_rate}%
- 최근 7일 언급 건수: ${trendData.mention_count}건

## 매칭 용기 (상위 ${containers.length}종)
${containersText}

## 제안서 형식
다음 구조로 작성하세요:

### 1. 트렌드 요약
- 현재 시장에서 왜 이 트렌드가 주목받고 있는지 2~3문장으로 설명
- 구체적 데이터 인용 (언급량, 변화율)

### 2. 추천 용기
- 매칭된 용기 각각에 대해:
  - 용기 코드 및 사양
  - 이 트렌드에 적합한 이유
  - 예상 활용 방안

### 3. 기대 효과
- 이 트렌드를 선행하여 제안했을 때의 비즈니스 효과

### 4. 창신의 강점
- 해당 트렌드 대응에 있어 창신만의 경쟁력

Markdown 형식으로 작성하세요.`,
  };
}

// ─── PR-04: 트렌드 요약 ──────────────────────────

interface KeywordDataItem {
  keyword: string;
  category: string;
  mention_count: number;
  change_rate: number;
  trend_index: number;
}

export function getTrendSummaryPrompt(
  keywordData: KeywordDataItem[]
): PromptPair {
  const dataText = keywordData
    .map(
      (k, i) =>
        `${i + 1}. ${k.keyword} (${k.category}) — 언급 ${k.mention_count}건, 변화율 ${k.change_rate}%, 지수 ${k.trend_index}`
    )
    .join("\n");

  return {
    system: `You are a cosmetic packaging market analyst. Respond in Korean (한국어). Be concise.`,

    user: `다음 주간 트렌드 키워드 Top 5 데이터를 바탕으로 한 줄 요약을 작성하세요.

${dataText}

요약 형식: "이번 주 화장품 용기 시장은 [핵심 인사이트]. 특히 [주목 키워드]가 [변화율]% 급증하며 [의미]."
한 문장, 80자 이내.`,
  };
}
