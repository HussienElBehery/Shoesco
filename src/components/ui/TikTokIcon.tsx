type TikTokIconProps = {
  className?: string;
};

export function TikTokIcon({ className }: TikTokIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M14.5 3h3.05c.18 1.5 1.02 2.86 2.3 3.69A5.7 5.7 0 0 0 22 7.5v3.08a8.68 8.68 0 0 1-4.5-1.4v6.2A5.62 5.62 0 1 1 12.62 9.8v3.08a2.62 2.62 0 1 0 1.88 2.5V3Z" />
    </svg>
  );
}
