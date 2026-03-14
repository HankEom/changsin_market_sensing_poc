"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import type {
  ApiResponse,
  MatchResponse,
  KeywordMatch,
  MatchedContainer,
  KeywordCategory,
} from "@/types";

const CATEGORY_STYLES: Record<KeywordCategory, { label: string; className: string }> = {
  shape: { label: "형태", className: "bg-blue-100 text-blue-700" },
  material: { label: "소재", className: "bg-green-100 text-green-700" },
  finish: { label: "마감", className: "bg-purple-100 text-purple-700" },
};

function getCategoryStyle(keyword: string): { label: string; className: string } {
  // Default to shape if unknown; the API response doesn't always include category at the keyword level
  return CATEGORY_STYLES.shape;
}

function ScoreBar({ score }: { score: number }): React.ReactElement {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-600" : "bg-yellow-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-slate-100">
        <div
          className={cn("h-2 rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

function ContainerCard({
  container,
}: {
  container: MatchedContainer;
}): React.ReactElement {
  return (
    <Card className="h-full">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {container.container_code}
            </p>
            <p className="font-medium">{container.container_name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded bg-slate-100 px-2 py-0.5">
            {container.shape}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5">
            {container.material}
          </span>
          {container.finish && (
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {container.finish}
            </span>
          )}
          {container.volume && (
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {container.volume}
            </span>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            적합도
          </p>
          <ScoreBar score={container.fit_score} />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {container.fit_reason}
        </p>
      </CardContent>
    </Card>
  );
}

export default function MatchingClient(): React.ReactElement {
  const [matches, setMatches] = useState<KeywordMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasRun, setHasRun] = useState<boolean>(false);

  async function handleMatch(): Promise<void> {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/match", { method: "POST" });
      const json: ApiResponse<MatchResponse> = await res.json();

      if (!json.success || !json.data) {
        setError(json.error ?? "매칭 실행에 실패했습니다.");
        return;
      }

      setMatches(json.data.matches);
      setHasRun(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  function buildProposalUrl(kw: KeywordMatch): string {
    const codes = kw.containers.map((c) => c.container_code).join(",");
    return `/proposal?keyword=${encodeURIComponent(kw.keyword)}&containers=${encodeURIComponent(codes)}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">매칭 결과</h1>
          <p className="text-sm text-muted-foreground">
            트렌드 키워드와 용기 카탈로그를 매칭합니다.
          </p>
        </div>
        <Button
          onClick={handleMatch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              매칭 중...
            </>
          ) : (
            "매칭 실행"
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && <MatchingSkeleton />}

      {/* Empty state */}
      {!loading && !hasRun && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              &quot;매칭 실행&quot; 버튼을 클릭하여 트렌드-용기 매칭을 시작하세요.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading &&
        hasRun &&
        matches.map((kw) => (
          <Card key={kw.keyword}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">{kw.keyword}</CardTitle>
              </div>
              <Link href={buildProposalUrl(kw)}>
                <Button variant="outline" size="sm">
                  제안서 생성
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kw.containers.map((c) => (
                  <ContainerCard
                    key={c.container_code}
                    container={c}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

      {/* No results */}
      {!loading && hasRun && matches.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              매칭 결과가 없습니다. 먼저 수집 및 분석을 실행해주세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MatchingSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-48 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
