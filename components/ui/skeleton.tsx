type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={["ui-skeleton", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
