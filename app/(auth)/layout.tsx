export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-2xl font-bold text-text-primary">집로그</p>
        <p className="mt-1 text-sm text-text-secondary">
          1인 가구 주거비 관리
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
