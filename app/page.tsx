import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "집로그 — 1인 가구 주거비 관리",
  description:
    "혼자 사는 집의 계약·월세·관리비·지출을 한곳에서 기록하고 관리하는 집로그.",
};

export default function Home() {
  return <LandingPage />;
}
