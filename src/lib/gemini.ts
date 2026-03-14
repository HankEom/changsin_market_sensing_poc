import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── 클라이언트 초기화 ────────────────────────────
const apiKey = process.env.GEMINI_API_KEY ?? "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/** 사용 가능한 모델 */
const MODEL_MAIN = "gemini-2.0-flash"; // PR-01,02,03
const MODEL_LIGHT = "gemini-2.0-flash"; // PR-04 (경량)

// ─── 공통 호출 함수 ───────────────────────────────

interface GeminiCallOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Gemini API 단일 호출 래퍼.
 * GEMINI_API_KEY 미설정 시 mock 응답 반환.
 */
export async function callGemini({
  system,
  user,
  model = MODEL_MAIN,
  temperature = 0.3,
  maxTokens = 2048,
}: GeminiCallOptions): Promise<string> {
  if (!genAI) {
    console.warn("[gemini] API key not set — returning mock response");
    return getMockResponse(user);
  }

  try {
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: system,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const result = await geminiModel.generateContent(user);
    const text = result.response.text();
    return text;
  } catch (err) {
    console.warn("[gemini] API call failed, falling back to mock:", err instanceof Error ? err.message : err);
    return getMockResponse(user);
  }
}

/**
 * Gemini 호출 후 JSON 파싱까지 수행.
 * 응답에서 ```json 코드 블록을 자동 제거한다.
 */
export async function callGeminiJSON<T = unknown>(
  options: GeminiCallOptions
): Promise<T> {
  const raw = await callGemini(options);
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─── Mock 응답 (API 키 미설정 시) ─────────────────

function getMockResponse(prompt: string): string {
  // 키워드 추출 mock
  if (prompt.includes("extract") || prompt.includes("키워드")) {
    return JSON.stringify([
      { keyword: "airless pump", category: "shape", relevance: 0.95 },
      { keyword: "recycled PET", category: "material", relevance: 0.88 },
      { keyword: "matte coating", category: "finish", relevance: 0.72 },
    ]);
  }

  // 매칭 검증 mock
  if (prompt.includes("fit_score") || prompt.includes("Evaluate the match")) {
    return JSON.stringify({
      fit_score: 85,
      fit_reason:
        "Container shape directly matches the trending airless pump format with suitable material.",
      suggestion:
        "Consider adding recycled material certification to strengthen trend alignment.",
    });
  }

  // 제안서 생성 mock
  if (prompt.includes("제안서") || prompt.includes("proposal")) {
    return `# 트렌드 기반 선제 제안서

## 1. 트렌드 요약
최근 화장품 용기 시장에서 **에어리스 펌프** 관련 키워드가 전주 대비 72% 급증하고 있습니다.
지속가능성과 제품 보존력에 대한 소비자 관심이 높아지면서, 에어리스 기술이 프리미엄 스킨케어를 넘어
미드레인지 브랜드로 확산되는 추세입니다.

## 2. 추천 용기
### CS-AP-001 에어리스 진공 펌프 50ml
- **사양**: PP / matte coating / 50ml
- **적합 이유**: 트렌드 키워드와 형태가 직접 일치하며, 매트 코팅 마감이 현재 선호도 상위
- **활용 방안**: 프리미엄 세럼/에센스 라인 제안

## 3. 기대 효과
시장 트렌드를 선행하여 제안함으로써 클라이언트의 신제품 기획 리드타임을 단축하고,
브랜드 경쟁력 강화에 기여할 수 있습니다.

## 4. 창신의 강점
창신은 에어리스 펌프 용기 생산 분야에서 다년간의 경험을 보유하고 있으며,
PP/PETG 등 다양한 소재 대응이 가능합니다.`;
  }

  // 트렌드 요약 mock
  return "이번 주 화장품 용기 시장은 에어리스 펌프와 리필형 용기가 주도. 특히 에어리스 펌프가 72% 급증하며 지속가능 패키징 트렌드 가속화.";
}

// ─── 프롬프트별 편의 함수 ─────────────────────────

export { MODEL_MAIN, MODEL_LIGHT };
