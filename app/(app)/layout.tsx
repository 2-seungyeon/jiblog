import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px)+1.5rem)] md:px-6 md:py-6 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
