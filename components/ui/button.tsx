import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "tertiary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "cursor-pointer bg-primary-600 text-text-inverse shadow-sm hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:hover:bg-primary-600",
  secondary:
    "cursor-pointer border border-border-strong bg-surface text-text-primary shadow-sm hover:bg-surface-muted active:bg-surface-muted disabled:cursor-not-allowed disabled:hover:bg-surface",
  accent:
    "cursor-pointer border-0 bg-surface text-text-primary font-semibold disabled:cursor-not-allowed disabled:hover:bg-surface",
  tertiary:
    "cursor-pointer border border-transparent bg-surface-muted text-text-secondary shadow-none hover:border-border-default hover:bg-surface hover:text-text-primary active:bg-surface disabled:cursor-not-allowed disabled:hover:bg-surface-muted disabled:hover:text-text-secondary",
  ghost:
    "cursor-pointer border border-border-default bg-surface text-text-secondary shadow-sm hover:bg-surface-muted hover:text-text-primary active:bg-surface-muted disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-text-secondary",
  danger:
    "cursor-pointer border border-error bg-surface text-error shadow-sm hover:bg-error-bg active:bg-error-bg disabled:cursor-not-allowed disabled:hover:bg-surface",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    loading = false,
    loadingLabel = "처리 중...",
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const label = loading ? loadingLabel : children;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex h-12 min-w-[7rem] items-center justify-center gap-2 rounded-button px-6 text-base font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <span
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span className="truncate">{label}</span>
    </button>
  );
});
