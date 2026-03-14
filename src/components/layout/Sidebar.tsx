"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Link2,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { ApiResponse, CrawlResult, AnalyzeResult } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "대시보드", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "매칭", href: "/matching", icon: <Link2 className="h-4 w-4" /> },
  { label: "제안서", href: "/proposal", icon: <FileText className="h-4 w-4" /> },
];

export default function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const [crawling, setCrawling] = useState<boolean>(false);
  const [crawlStatus, setCrawlStatus] = useState<string>("");

  async function handleCrawlAndAnalyze(): Promise<void> {
    setCrawling(true);
    setCrawlStatus("수집 중...");

    try {
      const crawlRes = await fetch("/api/crawl", { method: "POST" });
      const crawlData: ApiResponse<CrawlResult> = await crawlRes.json();

      if (!crawlData.success) {
        setCrawlStatus(`수집 오류: ${crawlData.error ?? "알 수 없는 오류"}`);
        return;
      }

      setCrawlStatus(
        `수집 완료: ${crawlData.data?.total ?? 0}건. 분석 중...`
      );

      const analyzeRes = await fetch("/api/analyze", { method: "POST" });
      const analyzeData: ApiResponse<AnalyzeResult> = await analyzeRes.json();

      if (!analyzeData.success) {
        setCrawlStatus(`분석 오류: ${analyzeData.error ?? "알 수 없는 오류"}`);
        return;
      }

      setCrawlStatus(
        `완료: 키워드 ${analyzeData.data?.keywords_found ?? 0}개 발견`
      );
    } catch (err) {
      setCrawlStatus(
        `오류: ${err instanceof Error ? err.message : "네트워크 오류"}`
      );
    } finally {
      setCrawling(false);
      setTimeout(() => setCrawlStatus(""), 5000);
    }
  }

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-60 flex-col bg-[#0f172a] text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold">
          CS
        </div>
        <span className="text-lg font-semibold tracking-tight">CS-MSA</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section: Crawl button */}
      <div className="border-t border-slate-700 p-4">
        <Button
          onClick={handleCrawlAndAnalyze}
          disabled={crawling}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          {crawling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              실행 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              수집 실행
            </>
          )}
        </Button>
        {crawlStatus && (
          <p className="mt-2 text-xs text-slate-400">{crawlStatus}</p>
        )}
      </div>
    </aside>
  );
}
