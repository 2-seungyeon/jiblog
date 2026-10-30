import type { Metadata } from "next";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "집로그",
  description: "1인 가구를 위한 주거비 관리 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-bg font-sans text-text-primary">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
