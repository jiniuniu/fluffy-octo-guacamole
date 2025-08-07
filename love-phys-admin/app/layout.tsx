import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物理动画管理系统",
  description: "生成物理解释和SVG动画的管理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
