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

export const dynamic = "force-dynamic";

const TOP_CONTAINERS_PER_KEYWORD = 5;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MatchResponse>>> {
  try {
    let body: { keyword?: string } = {};
    try {
      body = (await request.json()) as { keyword?: string };
    } catch {
      // no body — match all top keywords
    }

    // 1. Determine which keywords to match
    const { data: kwData } = body.keyword
      ? await supabase
          .from("trend_keywords")
          .select("*")
          .eq("keyword", body.keyword)
          .limit(1)
      : await supabase.from("trend_keywords").select("*");

    const trendKeywords = (kwData ?? []) as TrendKeyword[];

    // Sort by trend_index and take top 5 if no specific keyword
    const sortedKeywords = body.keyword
      ? trendKeywords
      : [...trendKeywords]
          .sort((a, b) => b.trend_index - a.trend_index)
          .slice(0, 5);

    if (sortedKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        data: { matches: [] },
      });
    }

    // 2. Fetch all active containers
    const { data: containers, error: containerError } = await supabase
      .from("container_catalog")
      .select("*");

    if (containerError) {
      throw new Error(`Fetch containers failed: ${containerError.message}`);
    }

    const allContainers = (containers ?? []) as ContainerCatalog[];

    // 3. Match each keyword against all containers via Gemini
    const matches: KeywordMatch[] = [];
    const allInserts: {
      keyword_id: string;
      container_id: string;
      similarity_score: number;
      fit_score: number;
      fit_reason: string;
      suggestion: string;
      match_rank: number;
    }[] = [];

    for (const tk of sortedKeywords) {
      const matchedContainers: (MatchedContainer & { _container_id: string })[] = [];

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
          continue;
        }

        if (verification.fit_score >= 50) {
          matchedContainers.push({
            _container_id: container.id,
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
        }
      }

      // Sort and take top N
      matchedContainers.sort((a, b) => b.fit_score - a.fit_score);
      const topContainers = matchedContainers.slice(0, TOP_CONTAINERS_PER_KEYWORD);

      // Prepare batch inserts
      topContainers.forEach((c, idx) => {
        allInserts.push({
          keyword_id: tk.id,
          container_id: c._container_id,
          similarity_score: c.fit_score / 100,
          fit_score: c.fit_score,
          fit_reason: c.fit_reason,
          suggestion: c.suggestion ?? "",
          match_rank: idx + 1,
        });
      });

      matches.push({
        keyword: tk.keyword,
        containers: topContainers.map(({ _container_id, ...rest }) => rest),
      });
    }

    // 4. Batch insert all match results at once
    if (allInserts.length > 0) {
      const { error: insertError } = await supabase
        .from("match_results")
        .insert(allInserts);

      if (insertError) {
        console.warn(`[match] Batch insert error: ${insertError.message}`);
      }
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
