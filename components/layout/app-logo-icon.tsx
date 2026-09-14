type AppLogoIconProps = {
  size?: number;
  className?: string;
};

export function AppLogoIcon({ size = 28, className }: AppLogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={["shrink-0 rounded-md", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#0B5D3B" />
      <path
        d="M16 7.5 24.5 14v10.5a1 1 0 0 1-1 1h-4.5v-6h-6v6H8.5a1 1 0 0 1-1-1V14L16 7.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
