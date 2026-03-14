import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { callGeminiJSON } from "@/lib/gemini";
import { getMatchVerificationPrompt } from "@/lib/prompts";
import type {
  ApiResponse,
  MatchResponse,
  KeywordMatch,
  MatchedContainer,
  MatchVerification,
  TrendKeyword,
  ContainerCatalog,
} from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MatchResponse>>> {
  try {
    const body = (await request.json()) as { keyword?: string };

    // 1. Determine which keywords to match
    let trendKeywords: TrendKeyword[];

    if (body.keyword) {
      const { data, error } = await supabase
        .from("trend_keywords")
        .select("*")
        .eq("keyword", body.keyword)
        .limit(1);

      if (error) throw new Error(`Fetch keyword failed: ${error.message}`);
      trendKeywords = (data ?? []) as TrendKeyword[];
    } else {
      // Top 5 by trend_index
      const { data, error } = await supabase
        .from("trend_keywords")
        .select("*")
        .order("trend_index", { ascending: false })
        .limit(5);

      if (error) throw new Error(`Fetch keywords failed: ${error.message}`);
      trendKeywords = (data ?? []) as TrendKeyword[];
    }

    if (trendKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        data: { matches: [] },
      });
    }

    // 2. Fetch all active containers
    const { data: containers, error: containerError } = await supabase
      .from("container_catalog")
      .select("*")
      .eq("is_active", true);

    if (containerError) {
      throw new Error(`Fetch containers failed: ${containerError.message}`);
    }

    const allContainers = (containers ?? []) as ContainerCatalog[];

    // 3. For each trend keyword, match against containers via Gemini
    const matches: KeywordMatch[] = [];

    for (const tk of trendKeywords) {
      const matchedContainers: MatchedContainer[] = [];

      for (const container of allContainers) {
        const prompt = getMatchVerificationPrompt(tk.keyword, tk.category, {
          container_code: container.container_code,
          container_name: container.container_name,
          shape: container.shape,
          material: container.material,
          finish: container.finish,
          volume: container.volume,
          description: container.description,
        });

        let verification: MatchVerification;
        try {
          verification = await callGeminiJSON<MatchVerification>({
            system: prompt.system,
            user: prompt.user,
          });
        } catch {
          console.warn(
            `[match] Failed to verify ${tk.keyword} x ${container.container_code}`
          );
          continue;
        }

        // Only keep matches with fit_score >= 50
        if (verification.fit_score >= 50) {
          matchedContainers.push({
            container_code: container.container_code,
            container_name: container.container_name,
            shape: container.shape,
            material: container.material,
            finish: container.finish,
            volume: container.volume,
            fit_score: verification.fit_score,
            fit_reason: verification.fit_reason,
            suggestion: verification.suggestion,
          });

          // Insert into match_results
          await supabase.from("match_results").insert({
            keyword_id: tk.id,
            container_id: container.id,
            similarity_score: verification.fit_score / 100,
            fit_score: verification.fit_score,
            fit_reason: verification.fit_reason,
            suggestion: verification.suggestion,
            match_rank: null, // will set after sorting
          });
        }
      }

      // Sort by fit_score descending and assign ranks
      matchedContainers.sort((a, b) => b.fit_score - a.fit_score);

      matches.push({
        keyword: tk.keyword,
        containers: matchedContainers,
      });
    }

    return NextResponse.json({
      success: true,
      data: { matches },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/match]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
