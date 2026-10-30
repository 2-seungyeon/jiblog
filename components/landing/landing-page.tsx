import Link from "next/link";
import { AppLogoIcon } from "@/components/layout/app-logo-icon";
import { Reveal } from "@/components/landing/reveal";

const features = [
  {
    title: "내 집",
    body: "거주 중인 집과 이력을 한곳에서 관리합니다.",
  },
  {
    title: "계약",
    body: "월세·전세·반전세 계약과 종료일 D-day를 놓치지 않습니다.",
  },
  {
    title: "월세·관리비·지출",
    body: "이번 달 납부와 기타 지출을 차분하게 기록합니다.",
  },
] as const;

const ctaPrimaryClassName = [
  "landing-cta inline-flex h-12 min-w-[7rem] items-center justify-center gap-2 rounded-button px-6 text-base font-medium",
  "bg-primary-600 text-text-inverse shadow-sm",
  "transition-[background-color,transform,box-shadow] duration-200 ease-out",
  "hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-md",
  "active:translate-y-0 active:bg-primary-800",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
].join(" ");

const ctaSecondaryClassName = [
  "landing-cta inline-flex h-12 min-w-[7rem] items-center justify-center gap-2 rounded-button px-6 text-base font-medium",
  "border border-border-strong bg-surface/90 text-text-primary shadow-sm backdrop-blur-sm",
  "transition-[background-color,transform,box-shadow,border-color] duration-200 ease-out",
  "hover:border-primary-200 hover:bg-primary-50 hover:-translate-y-0.5",
  "active:translate-y-0 active:bg-primary-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
].join(" ");

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-bg">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <AppLogoIcon size={24} />
            <span className="text-base font-bold text-primary-800">집로그</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="계정">
            <Link
              href="/login"
              className="rounded-md px-2 py-1 text-sm font-medium text-text-secondary no-underline transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="hidden rounded-button bg-primary-600 px-3 py-1.5 text-sm font-medium text-text-inverse no-underline transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 sm:inline-flex"
            >
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="landing-hero relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-4 pb-16 pt-24 sm:justify-center sm:pb-24 sm:pt-28 md:px-6">
          <div className="landing-hero-atmosphere" aria-hidden="true" />
          <div className="landing-hero-pattern" aria-hidden="true" />
          <div className="landing-hero-glow" aria-hidden="true" />

          <div className="relative z-10 mx-auto w-full max-w-5xl">
            <div className="landing-hero-enter landing-hero-enter-1 mb-5 inline-flex items-center gap-3">
              <AppLogoIcon size={40} className="landing-hero-logo" />
              <h1 className="text-[2.75rem] font-bold leading-none tracking-tight text-primary-800 sm:text-6xl md:text-7xl">
                집로그
              </h1>
            </div>

            <p className="landing-hero-enter landing-hero-enter-2 max-w-xl text-xl font-semibold leading-snug tracking-tight text-text-primary sm:text-2xl">
              혼자 사는 집, 주거비도 한곳에.
            </p>

            <p className="landing-hero-enter landing-hero-enter-3 mt-3 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
              집·계약·월세·관리비·기타 지출을 차분하게 기록하고 관리하세요.
            </p>

            <div className="landing-hero-enter landing-hero-enter-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className={ctaPrimaryClassName}>
                시작하기
              </Link>
              <Link href="/login" className={ctaSecondaryClassName}>
                로그인
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border-default bg-bg px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-5xl">
            <Reveal>
              <h2 className="max-w-lg text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                주거비의 흐름을 한 화면에서
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-text-secondary">
                집로그는 1인 가구의 주거 비용을 나눠 관리하지 않고, 집부터
                월별 납부까지 이어지는 이야기로 정리합니다.
              </p>
            </Reveal>

            <ol className="mt-12 space-y-0 divide-y divide-border-default border-y border-border-default">
              {features.map((feature, index) => (
                <li key={feature.title} className="py-6">
                  <Reveal delayMs={index * 80}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-10">
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-primary-600 sm:w-8">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 space-y-1 sm:flex-1">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {feature.title}
                        </h3>
                        <p className="text-base leading-relaxed text-text-secondary">
                          {feature.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="landing-cta-band relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
          <div className="landing-cta-band-bg" aria-hidden="true" />
          <Reveal className="relative z-10 mx-auto w-full max-w-5xl">
            <h2 className="text-2xl font-bold tracking-tight text-primary-800 sm:text-3xl">
              오늘부터 주거비를 기록해 보세요
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-text-secondary">
              계정만 만들면 대시보드에서 바로 시작할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className={ctaPrimaryClassName}>
                시작하기
              </Link>
              <Link href="/login" className={ctaSecondaryClassName}>
                로그인
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border-default px-4 py-8 md:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2">
            <AppLogoIcon size={20} />
            <span className="text-sm font-semibold text-text-primary">집로그</span>
          </div>
          <p className="text-sm text-text-tertiary">1인 가구 주거비 관리</p>
        </div>
      </footer>
    </div>
  );
}
