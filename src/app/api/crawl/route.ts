import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sampleArticles } from "@/lib/sample-data";

export const dynamic = "force-dynamic";
import type { ApiResponse, CrawlResult } from "@/types";

export async function POST(): Promise<NextResponse<ApiResponse<CrawlResult>>> {
  try {
    const total = sampleArticles.length;

    // Insert sample articles with ON CONFLICT (url) DO NOTHING
    const { data: inserted, error: insertError } = await supabase
      .from("collected_articles")
      .upsert(
        sampleArticles.map((a) => ({
          source: a.source,
          url: a.url,
          title: a.title,
          content: a.content,
          image_url: a.image_url,
          language: "en",
          published_at: a.published_at,
          analyzed: false,
        })),
        { onConflict: "url", ignoreDuplicates: true }
      )
      .select("id");

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    const newCount = inserted?.length ?? 0;
    const duplicateCount = total - newCount;

    // Log to crawl_logs
    await supabase.from("crawl_logs").insert({
      source: "sample",
      status: "success" as const,
      articles_found: total,
      articles_saved: newCount,
      error_message: null,
    });

    return NextResponse.json({
      success: true,
      data: { total, new: newCount, duplicate: duplicateCount },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/crawl]", message);

    // Log error
    await supabase.from("crawl_logs").insert({
      source: "sample",
      status: "error" as const,
      articles_found: 0,
      articles_saved: 0,
      error_message: message,
    });

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
