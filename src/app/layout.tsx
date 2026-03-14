import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CS-MSA | 마켓 센싱 에이전트",
  description: "화장품 용기 디자인 트렌드 센싱 PoC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-white p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
