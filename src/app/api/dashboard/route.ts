import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { callGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";
import { MODEL_LIGHT } from "@/lib/gemini";
import { getTrendSummaryPrompt } from "@/lib/prompts";
import type {
  ApiResponse,
  DashboardData,
  DashboardStats,
  TopKeyword,
  RecentMatch,
  TrendKeyword,
  KeywordCategory,
} from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<DashboardData>>> {
  try {
    // 1. Aggregate stats (parallel queries)
    const [articlesRes, keywordsRes, matchesRes, proposalsRes] =
      await Promise.all([
        supabase.from("collected_articles").select("*"),
        supabase.from("trend_keywords").select("*"),
        supabase.from("match_results").select("*"),
        supabase.from("proposals").select("*"),
      ]);

    console.log("[dashboard] counts:", {
      articles: articlesRes.data?.length,
      articlesErr: articlesRes.error?.message,
      keywords: keywordsRes.data?.length,
      keywordsErr: keywordsRes.error?.message,
      matches: matchesRes.data?.length,
      matchesErr: matchesRes.error?.message,
      proposals: proposalsRes.data?.length,
      proposalsErr: proposalsRes.error?.message,
    });

    const stats: DashboardStats = {
      total_articles: articlesRes.data?.length ?? 0,
      total_keywords: keywordsRes.data?.length ?? 0,
      total_matches: matchesRes.data?.length ?? 0,
      total_proposals: proposalsRes.data?.length ?? 0,
    };

    // 2. Top 5 trend keywords by trend_index
    const { data: trendData, error: trendError } = await supabase
      .from("trend_keywords")
      .select("*")
      .order("trend_index", { ascending: false })
      .limit(5);

    if (trendError) {
      throw new Error(`Fetch trends failed: ${trendError.message}`);
    }

    const trends = (trendData ?? []) as TrendKeyword[];

    const topKeywords: TopKeyword[] = trends.map((t) => ({
      keyword: t.keyword,
      category: t.category,
      count: t.mention_count,
      change_rate: t.change_rate,
    }));

    // 3. Recent matches with container info (JOIN via two queries)
    const { data: recentMatchData, error: matchError } = await supabase
      .from("match_results")
      .select(
        `
        id,
        fit_score,
        created_at,
        keyword_id,
        container_id,
        trend_keywords!inner ( keyword, category ),
        container_catalog!inner ( container_code, container_name )
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (matchError) {
      console.warn(`[dashboard] Match fetch error: ${matchError.message}`);
    }

    const recentMatches: RecentMatch[] = (recentMatchData ?? []).map(
      (row: Record<string, unknown>) => {
        const tk = row.trend_keywords as Record<string, unknown>;
        const cc = row.container_catalog as Record<string, unknown>;
        return {
          keyword: (tk?.keyword as string) ?? "",
          category: (tk?.category as KeywordCategory) ?? "shape",
          container_code: (cc?.container_code as string) ?? "",
          container_name: (cc?.container_name as string) ?? "",
          fit_score: (row.fit_score as number) ?? 0,
          created_at: (row.created_at as string) ?? "",
        };
      }
    );

    // 4. Trend summary via Gemini (lightweight model)
    let trendSummary = "";
    if (topKeywords.length > 0) {
      const prompt = getTrendSummaryPrompt(
        topKeywords.map((k) => ({
          keyword: k.keyword,
          category: k.category,
          mention_count: k.count,
          change_rate: k.change_rate,
          trend_index:
            trends.find((t) => t.keyword === k.keyword)?.trend_index ?? 0,
        }))
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
