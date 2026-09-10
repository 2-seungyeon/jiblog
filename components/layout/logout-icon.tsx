type LogoutIconProps = {
  className?: string;
};

export function LogoutIcon({ className = "size-6 shrink-0" }: LogoutIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5H6.75A1.75 1.75 0 0 1 5 17.75V6.25A1.75 1.75 0 0 1 6.75 4.5H10.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 16l4-4-4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H10.5" />
    </svg>
  );
}
