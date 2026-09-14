import { AppBrand } from "@/components/layout/app-brand";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <AppBrand href="/login" showTagline size="md" />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
