export function Waves({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="wv" x1="0" x2="1">
          <stop offset="0" stopColor="var(--deep)" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="var(--primary)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--cyan)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path d="M0 180 C 250 80, 450 280, 700 170 S 1050 60, 1200 140 L1200 300 L0 300Z" fill="url(#wv)" opacity="0.12" />
      <path d="M0 220 C 300 140, 500 300, 800 210 S 1100 150, 1200 200" stroke="url(#wv)" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M0 250 C 300 180, 520 320, 820 240 S 1100 190, 1200 235" stroke="url(#wv)" strokeWidth="1.2" fill="none" opacity="0.35" />
    </svg>
  );
}
