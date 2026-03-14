import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { callGemini, MODEL_LIGHT } from "@/lib/gemini";
import { getTrendSummaryPrompt } from "@/lib/prompts";
import type {
  ApiResponse,
  DashboardData,
  DashboardStats,
  TopKeyword,
  RecentMatch,
  TrendKeyword,
  KeywordCategory,
  ContainerCatalog,
  MatchResult,
} from "@/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<ApiResponse<DashboardData>>> {
  try {
    // 1. Fetch all data in parallel
    const [articlesRes, keywordsRes, matchesRes, proposalsRes, containersRes] =
      await Promise.all([
        supabase.from("collected_articles").select("*"),
        supabase.from("trend_keywords").select("*"),
        supabase.from("match_results").select("*"),
        supabase.from("proposals").select("*"),
        supabase.from("container_catalog").select("*"),
      ]);

    const allKeywords = (keywordsRes.data ?? []) as TrendKeyword[];
    const allMatches = (matchesRes.data ?? []) as MatchResult[];
    const allContainers = (containersRes.data ?? []) as ContainerCatalog[];

    // 2. Stats
    const stats: DashboardStats = {
      total_articles: articlesRes.data?.length ?? 0,
      total_keywords: allKeywords.length,
      total_matches: allMatches.length,
      total_proposals: proposalsRes.data?.length ?? 0,
    };

    // 3. Top 5 keywords (sorted by trend_index in JS)
    const sortedKeywords = [...allKeywords].sort(
      (a, b) => b.trend_index - a.trend_index
    );
    const top5 = sortedKeywords.slice(0, 5);

    const topKeywords: TopKeyword[] = top5.map((t) => ({
      keyword: t.keyword,
      category: t.category,
      count: t.mention_count,
      change_rate: t.change_rate,
    }));

    // 4. Recent matches (sorted by created_at, joined with keywords/containers in JS)
    const keywordMap = new Map(allKeywords.map((k) => [k.id, k]));
    const containerMap = new Map(allContainers.map((c) => [c.id, c]));

    const sortedMatches = [...allMatches]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);

    const recentMatches: RecentMatch[] = sortedMatches.map((m) => {
      const tk = keywordMap.get(m.keyword_id);
      const cc = containerMap.get(m.container_id);
      return {
        keyword: tk?.keyword ?? "",
        category: (tk?.category as KeywordCategory) ?? "shape",
        container_code: cc?.container_code ?? "",
        container_name: cc?.container_name ?? "",
        fit_score: m.fit_score ?? 0,
        created_at: m.created_at,
      };
    });

    // 5. Trend summary via Gemini
    let trendSummary = "";
    if (topKeywords.length > 0) {
      const prompt = getTrendSummaryPrompt(
        topKeywords.map((k) => {
          const tk = top5.find((t) => t.keyword === k.keyword);
          return {
            keyword: k.keyword,
            category: k.category,
            mention_count: k.count,
            change_rate: k.change_rate,
            trend_index: tk?.trend_index ?? 0,
          };
        })
      );

      try {
        trendSummary = await callGemini({
          system: prompt.system,
          user: prompt.user,
          model: MODEL_LIGHT,
          maxTokens: 256,
        });
      } catch {
        trendSummary =
          "트렌드 요약을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        top_keywords: topKeywords,
        recent_matches: recentMatches,
        trend_summary: trendSummary.trim(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/dashboard]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
