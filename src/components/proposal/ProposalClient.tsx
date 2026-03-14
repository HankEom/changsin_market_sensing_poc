"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import type {
  ApiResponse,
  DashboardData,
  ProposalResult,
  TopKeyword,
} from "@/types";

interface ContainerOption {
  code: string;
  name: string;
}

/** Simple markdown-to-html: handles headers, bold, lists, paragraphs */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-6 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function ProposalClient(): React.ReactElement {
  const searchParams = useSearchParams();

  // Data from dashboard
  const [keywords, setKeywords] = useState<TopKeyword[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState<boolean>(true);

  // Selection state
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [containerOptions, setContainerOptions] = useState<ContainerOption[]>([]);
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(
    new Set()
  );

  // Proposal state
  const [generating, setGenerating] = useState<boolean>(false);
  const [proposal, setProposal] = useState<ProposalResult | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Load keywords from dashboard API
  useEffect(() => {
    async function loadKeywords(): Promise<void> {
      try {
        const res = await fetch("/api/dashboard");
        const json: ApiResponse<DashboardData> = await res.json();
        if (json.success && json.data) {
          setKeywords(json.data.top_keywords);
        }
      } catch {
        // silently fail — user can still type
      } finally {
        setLoadingKeywords(false);
      }
    }
    loadKeywords();
  }, []);

  // Pre-fill from URL search params
  useEffect(() => {
    const kwParam = searchParams.get("keyword");
    const ctParam = searchParams.get("containers");

    if (kwParam) {
      setSelectedKeyword(kwParam);
    }

    if (ctParam) {
      const codes = ctParam.split(",").filter(Boolean);
      const options = codes.map((code) => ({
        code,
        name: code, // We only have codes from URL
      }));
      setContainerOptions(options);
      setSelectedContainers(new Set(codes));
    }
  }, [searchParams]);

  // When keyword changes and no URL containers, try to load matching containers
  useEffect(() => {
    if (!selectedKeyword) {
      setContainerOptions([]);
      setSelectedContainers(new Set());
      return;
    }

    // If we already have containers from URL params, don't overwrite
    const urlContainers = searchParams.get("containers");
    if (urlContainers) return;

    // Try to get containers from a match run (POST to /api/match would be heavy,
    // so we just provide a reasonable default list)
    // In a real app, we'd cache match results or fetch from DB
    setContainerOptions([]);
    setSelectedContainers(new Set());
  }, [selectedKeyword, searchParams]);

  function toggleContainer(code: string): void {
    setSelectedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  async function handleGenerate(): Promise<void> {
    if (!selectedKeyword) return;

    setGenerating(true);
    setError("");
    setProposal(null);

    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: selectedKeyword,
          container_codes: Array.from(selectedContainers),
        }),
      });

      const json: ApiResponse<ProposalResult> = await res.json();

      if (!json.success || !json.data) {
        setError(json.error ?? "제안서 생성에 실패했습니다.");
        return;
      }

      setProposal(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!proposal) return;
    try {
      await navigator.clipboard.writeText(proposal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">제안서 생성</h1>
        <p className="text-sm text-muted-foreground">
          트렌드 키워드와 용기를 선택하여 제안서를 생성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Panel: Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">입력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Keyword selector */}
            <div className="space-y-2">
              <Label>트렌드 키워드</Label>
              {loadingKeywords ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={selectedKeyword}
                  onValueChange={setSelectedKeyword}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="키워드를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {keywords.map((kw) => (
                      <SelectItem key={kw.keyword} value={kw.keyword}>
                        {kw.keyword}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Container checkboxes */}
            <div className="space-y-2">
              <Label>용기 선택</Label>
              {containerOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selectedKeyword
                    ? "매칭 페이지에서 용기를 선택하거나, 매칭을 먼저 실행해주세요."
                    : "키워드를 먼저 선택하세요."}
                </p>
              ) : (
                <div className="space-y-2">
                  {containerOptions.map((c) => (
                    <div key={c.code} className="flex items-center gap-2">
                      <Checkbox
                        id={c.code}
                        checked={selectedContainers.has(c.code)}
                        onCheckedChange={() => toggleContainer(c.code)}
                      />
                      <Label
                        htmlFor={c.code}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {c.code}
                        {c.name !== c.code && ` — ${c.name}`}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !selectedKeyword}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  생성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel: Result */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">제안서 결과</CardTitle>
            {proposal && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    복사
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {generating && (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-6 w-1/2 mt-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {!generating && !proposal && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  트렌드와 용기를 선택한 후 생성하기를 클릭하세요
                </p>
              </div>
            )}

            {!generating && proposal && (
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: simpleMarkdownToHtml(proposal.content),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
