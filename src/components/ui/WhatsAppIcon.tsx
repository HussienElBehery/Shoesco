type WhatsAppIconProps = {
  className?: string;
};

export function WhatsAppIcon({ className }: WhatsAppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.45L3 20.5l1.32-4.72A8.5 8.5 0 1 1 20.5 11.7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M8.15 7.8c.2-.45.4-.46.72-.47h.6c.18 0 .35.06.46.32l.72 1.72c.08.22.05.4-.1.58l-.55.66c-.15.17-.14.32-.04.5.62 1.1 1.53 1.98 2.65 2.55.18.1.34.08.49-.1l.7-.83c.17-.2.36-.24.58-.15l1.64.77c.23.11.35.28.35.48 0 .24-.1 1.15-.7 1.72-.58.55-1.37.82-2.2.61-1.27-.31-2.72-1.06-4.08-2.4-1.1-1.07-1.98-2.5-2.22-3.54-.2-.88.05-1.7.48-2.42Z"
        fill="currentColor"
      />
    </svg>
  );
}

