import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const style = (
    delayMs
      ? ({ "--landing-reveal-delay": `${delayMs}ms` } as CSSProperties)
      : undefined
  );

  return (
    <div
      className={["landing-reveal", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
