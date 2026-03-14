import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { callGeminiJSON } from "@/lib/gemini";

export const dynamic = "force-dynamic";
import { getKeywordExtractionPrompt } from "@/lib/prompts";
import type {
  ApiResponse,
  AnalyzeResult,
  ExtractedKeyword,
  CollectedArticle,
  KeywordCategory,
  TopKeyword,
} from "@/types";

export async function POST(): Promise<
  NextResponse<ApiResponse<AnalyzeResult>>
> {
  try {
    // 1. Fetch unanalyzed articles
    const { data: articles, error: fetchError } = await supabase
      .from("collected_articles")
      .select("*")
      .eq("analyzed", false)
      .limit(30);

    if (fetchError) {
      throw new Error(`Fetch articles failed: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          analyzed_count: 0,
          keywords_found: 0,
          top_keywords: [],
          surges: [],
        },
      });
    }

    const typedArticles = articles as CollectedArticle[];

    // 2. Extract keywords for each article via Gemini
    const keywordAggregation = new Map<
      string,
      { category: KeywordCategory; count: number }
    >();
    let totalKeywordsFound = 0;

    for (const article of typedArticles) {
      const prompt = getKeywordExtractionPrompt(article.title, article.content);
      let keywords: ExtractedKeyword[];

      try {
        keywords = await callGeminiJSON<ExtractedKeyword[]>({
          system: prompt.system,
          user: prompt.user,
        });
      } catch {
        console.warn(
          `[analyze] Failed to parse keywords for article ${article.id}`
        );
        keywords = [];
      }

      if (!Array.isArray(keywords)) {
        keywords = [];
      }

      // Insert into article_keywords
      if (keywords.length > 0) {
        const rows = keywords.map((k) => ({
          article_id: article.id,
          keyword: k.keyword,
          category: k.category,
          relevance: k.relevance,
        }));

        const { error: kwError } = await supabase
          .from("article_keywords")
          .insert(rows);

        if (kwError) {
          console.warn(
            `[analyze] Keyword insert error for article ${article.id}: ${kwError.message}`
          );
        }
      }

      totalKeywordsFound += keywords.length;

      // Aggregate counts
      for (const kw of keywords) {
        const key = `${kw.keyword}::${kw.category}`;
        const existing = keywordAggregation.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          keywordAggregation.set(key, { category: kw.category, count: 1 });
        }
      }

      // Mark article as analyzed
      await supabase
        .from("collected_articles")
        .update({ analyzed: true })
        .eq("id", article.id);
    }

    // 3. Upsert into trend_keywords
    const now = new Date();
    const periodEnd = now.toISOString().split("T")[0];
    const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const surges: string[] = [];

    const aggregationEntries = Array.from(keywordAggregation.entries());

    for (const [key, val] of aggregationEntries) {
      const [keyword, category] = key.split("::");

      // Check if existing record for this period
      const { data: existing } = await supabase
        .from("trend_keywords")
        .select("id, mention_count")
        .eq("keyword", keyword)
        .eq("period_start", periodStart)
        .eq("period_end", periodEnd)
        .maybeSingle();

      const mentionCount = (existing?.mention_count ?? 0) + val.count;
      // Simulate change_rate based on count (PoC simplification)
      const changeRate = Math.round(val.count * 15 + Math.random() * 20);
      const trendIndex = Math.round(mentionCount * 10 + changeRate);
      const isSurge = changeRate > 50;

      if (isSurge) {
        surges.push(keyword);
      }

      if (existing) {
        await supabase
          .from("trend_keywords")
          .update({
            mention_count: mentionCount,
            change_rate: changeRate,
            trend_index: trendIndex,
            is_surge: isSurge,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("trend_keywords").insert({
          keyword,
          category: category as KeywordCategory,
          mention_count: mentionCount,
          trend_index: trendIndex,
          change_rate: changeRate,
          is_surge: isSurge,
          period_start: periodStart,
          period_end: periodEnd,
        });
      }
    }

    // 4. Build top_keywords response
    const topEntries = Array.from(keywordAggregation.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    const topKeywords: TopKeyword[] = topEntries.map(([key, val]) => {
      const [keyword, category] = key.split("::");
      const changeRate = Math.round(val.count * 15 + 10);
      return {
        keyword,
        category: category as KeywordCategory,
        count: val.count,
        change_rate: changeRate,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        analyzed_count: typedArticles.length,
        keywords_found: totalKeywordsFound,
        top_keywords: topKeywords,
        surges,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/analyze]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
