import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { callGemini } from "@/lib/gemini";
import { getProposalPrompt } from "@/lib/prompts";
import type {
  ApiResponse,
  ProposalResult,
  TrendKeyword,
  ContainerCatalog,
  MatchResult,
} from "@/types";

interface ProposalRequestBody {
  keyword: string;
  containers: string[]; // container codes
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ProposalResult>>> {
  try {
    const body = (await request.json()) as ProposalRequestBody;

    if (!body.keyword || !body.containers?.length) {
      return NextResponse.json(
        { success: false, error: "keyword and containers[] are required" },
        { status: 400 }
      );
    }

    // 1. Fetch trend data for keyword
    const { data: trendData, error: trendError } = await supabase
      .from("trend_keywords")
      .select("*")
      .eq("keyword", body.keyword)
      .order("trend_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (trendError) {
      throw new Error(`Fetch trend failed: ${trendError.message}`);
    }

    const trend = trendData as TrendKeyword | null;
    if (!trend) {
      return NextResponse.json(
        { success: false, error: `Trend keyword "${body.keyword}" not found` },
        { status: 404 }
      );
    }

    // 2. Fetch container details
    const { data: containerData, error: containerError } = await supabase
      .from("container_catalog")
      .select("*")
      .in("container_code", body.containers);

    if (containerError) {
      throw new Error(`Fetch containers failed: ${containerError.message}`);
    }

    const containers = (containerData ?? []) as ContainerCatalog[];

    // 3. Fetch match results for these containers + keyword
    const containerIds = containers.map((c) => c.id);
    const { data: matchData } = await supabase
      .from("match_results")
      .select("*")
      .eq("keyword_id", trend.id)
      .in("container_id", containerIds);

    const matchResults = (matchData ?? []) as MatchResult[];

    // Build container info with match data
    const containerInfos = containers.map((c) => {
      const match = matchResults.find((m) => m.container_id === c.id);
      return {
        container_code: c.container_code,
        container_name: c.container_name,
        shape: c.shape,
        material: c.material,
        finish: c.finish,
        volume: c.volume,
        fit_score: match?.fit_score ?? 70,
        fit_reason: match?.fit_reason ?? "Potential match based on specifications",
      };
    });

    // 4. Call Gemini with proposal prompt
    const prompt = getProposalPrompt(
      body.keyword,
      {
        keyword: trend.keyword,
        category: trend.category,
        trend_index: trend.trend_index,
        change_rate: trend.change_rate,
        mention_count: trend.mention_count,
      },
      containerInfos
    );

    const proposalContent = await callGemini({
      system: prompt.system,
      user: prompt.user,
      maxTokens: 4096,
    });

    // 5. Save to proposals table
    const matchIds = matchResults.map((m) => m.id);

    const { data: inserted, error: insertError } = await supabase
      .from("proposals")
      .insert({
        keyword_id: trend.id,
        match_ids: matchIds,
        content: proposalContent,
        format: "markdown",
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      throw new Error(`Insert proposal failed: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: inserted.id as string,
        content: proposalContent,
        keyword: body.keyword,
        created_at: inserted.created_at as string,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/proposal]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
