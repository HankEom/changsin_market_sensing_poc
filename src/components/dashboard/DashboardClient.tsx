"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Hash,
  Package,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import type { ApiResponse, DashboardData, KeywordCategory, TopKeyword } from "@/types";

const CATEGORY_STYLES: Record<KeywordCategory, { label: string; className: string }> = {
  shape: { label: "형태", className: "bg-blue-100 text-blue-700" },
  material: { label: "소재", className: "bg-green-100 text-green-700" },
  finish: { label: "마감", className: "bg-purple-100 text-purple-700" },
};

function CategoryBadge({ category }: { category: KeywordCategory }): React.ReactElement {
  const style = CATEGORY_STYLES[category];
  return (
    <Badge className={cn("border-0", style.className)}>
      {style.label}
    </Badge>
  );
}

function ChangeRateDisplay({ rate }: { rate: number }): React.ReactElement {
  const isPositive = rate >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-green-600" : "text-red-500"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {isPositive ? "+" : ""}
      {rate.toFixed(1)}%
    </span>
  );
}

export default function DashboardClient(): React.ReactElement {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchDashboard(): Promise<void> {
      try {
        const res = await fetch("/api/dashboard");
        const json: ApiResponse<DashboardData> = await res.json();
        if (!json.success || !json.data) {
          setError(json.error ?? "대시보드 데이터를 불러올 수 없습니다.");
          return;
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "네트워크 오류");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return <></>;

  const maxMention = Math.max(...data.top_keywords.map((k) => k.count), 1);

  const statCards = [
    { label: "수집 기사", value: data.stats.total_articles, icon: <Newspaper className="h-5 w-5 text-blue-600" /> },
    { label: "키워드", value: data.stats.total_keywords, icon: <Hash className="h-5 w-5 text-blue-600" /> },
    { label: "매칭 용기", value: data.stats.total_matches, icon: <Package className="h-5 w-5 text-blue-600" /> },
    { label: "제안서", value: data.stats.total_proposals, icon: <FileText className="h-5 w-5 text-blue-600" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      {data.trend_summary && (
        <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 px-4 py-3">
          <p className="text-sm text-slate-700">{data.trend_summary}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 5 Trend Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 5 트렌드 키워드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.top_keywords.slice(0, 5).map((kw) => (
            <div key={kw.keyword} className="flex items-center gap-3">
              <span className="w-28 truncate text-sm font-medium">
                {kw.keyword}
              </span>
              <CategoryBadge category={kw.category} />
              <ChangeRateDisplay rate={kw.change_rate} />
              {kw.change_rate >= 30 && <Badge variant="surge">급증</Badge>}
              <div className="flex-1">
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.round((kw.count / maxMention) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm text-muted-foreground">
                {kw.count}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full Keyword Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">키워드 전체 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>키워드</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead className="text-right">언급수</TableHead>
                <TableHead className="text-right">변화율</TableHead>
                <TableHead>급증</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.top_keywords.map((kw) => (
                <TableRow key={kw.keyword}>
                  <TableCell className="font-medium">{kw.keyword}</TableCell>
                  <TableCell>
                    <CategoryBadge category={kw.category} />
                  </TableCell>
                  <TableCell className="text-right">{kw.count}</TableCell>
                  <TableCell className="text-right">
                    <ChangeRateDisplay rate={kw.change_rate} />
                  </TableCell>
                  <TableCell>
                    {kw.change_rate >= 30 && (
                      <Badge variant="surge">급증</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
