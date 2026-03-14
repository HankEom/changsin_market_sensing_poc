// ─── DB 테이블 타입 ──────────────────────────────

/** collected_articles 테이블 */
export interface CollectedArticle {
  id: string;
  source: string;
  url: string;
  title: string;
  content: string;
  summary: string | null;
  image_url: string | null;
  language: string;
  published_at: string | null;
  analyzed: boolean;
  created_at: string;
}

/** article_keywords 테이블 */
export interface ArticleKeyword {
  id: string;
  article_id: string;
  keyword: string;
  category: KeywordCategory;
  relevance: number;
  created_at: string;
}

/** trend_keywords 테이블 */
export interface TrendKeyword {
  id: string;
  keyword: string;
  category: KeywordCategory;
  mention_count: number;
  trend_index: number;
  change_rate: number;
  is_surge: boolean;
  period_start: string;
  period_end: string;
  created_at: string;
}

/** container_catalog 테이블 */
export interface ContainerCatalog {
  id: string;
  container_code: string;
  container_name: string;
  shape: string;
  material: string;
  finish: string | null;
  volume: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

/** match_results 테이블 */
export interface MatchResult {
  id: string;
  keyword_id: string;
  container_id: string;
  similarity_score: number;
  fit_score: number | null;
  fit_reason: string | null;
  suggestion: string | null;
  match_rank: number | null;
  created_at: string;
}

/** proposals 테이블 */
export interface Proposal {
  id: string;
  keyword_id: string;
  match_ids: string[];
  content: string;
  format: string;
  created_at: string;
}

/** crawl_logs 테이블 */
export interface CrawlLog {
  id: string;
  source: string | null;
  status: "success" | "error" | "timeout";
  articles_found: number;
  articles_saved: number;
  error_message: string | null;
  executed_at: string;
}

// ─── Enum / 유틸 타입 ────────────────────────────

export type KeywordCategory = "shape" | "material" | "finish";

// ─── API 응답 타입 ───────────────────────────────

/** 공통 API 응답 래퍼 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** POST /api/crawl 응답 */
export interface CrawlResult {
  total: number;
  new: number;
  duplicate: number;
}

/** POST /api/analyze 응답 */
export interface AnalyzeResult {
  analyzed_count: number;
  keywords_found: number;
  top_keywords: TopKeyword[];
  surges: string[];
}

export interface TopKeyword {
  keyword: string;
  category: KeywordCategory;
  count: number;
  change_rate: number;
}

/** POST /api/match 응답 */
export interface MatchResponse {
  matches: KeywordMatch[];
}

export interface KeywordMatch {
  keyword: string;
  containers: MatchedContainer[];
}

export interface MatchedContainer {
  container_code: string;
  container_name: string;
  shape: string;
  material: string;
  finish: string | null;
  volume: string | null;
  fit_score: number;
  fit_reason: string;
  suggestion?: string;
}

/** POST /api/proposal 응답 */
export interface ProposalResult {
  id: string;
  content: string;
  keyword: string;
  created_at: string;
}

/** GET /api/dashboard 응답 */
export interface DashboardData {
  stats: DashboardStats;
  top_keywords: TopKeyword[];
  recent_matches: RecentMatch[];
  trend_summary: string;
}

export interface DashboardStats {
  total_articles: number;
  total_keywords: number;
  total_matches: number;
  total_proposals: number;
}

export interface RecentMatch {
  keyword: string;
  category: KeywordCategory;
  container_code: string;
  container_name: string;
  fit_score: number;
  created_at: string;
}

// ─── LLM 프롬프트 응답 타입 ─────────────────────

/** PR-01 키워드 추출 결과 */
export interface ExtractedKeyword {
  keyword: string;
  category: KeywordCategory;
  relevance: number;
}

/** PR-02 매칭 검증 결과 */
export interface MatchVerification {
  fit_score: number;
  fit_reason: string;
  suggestion: string;
}
