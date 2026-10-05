export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hf-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--deep)" />
          <stop offset="0.6" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
      <path d="M6 8a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H18l-7 7v-7a6 6 0 0 1-5-6Z" fill="url(#hf-g)" />
      <circle cx="15" cy="12" r="2.6" fill="var(--primary-foreground)" />
      <circle cx="25" cy="12" r="2.6" fill="var(--primary-foreground)" />
      <path d="M10 22c2-4 8-4 10 0M20 22c2-4 8-4 10 0" stroke="var(--primary-foreground)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight text-deep">
        Hand<span className="text-primary">flow</span>
      </span>
    </span>
  );
}
