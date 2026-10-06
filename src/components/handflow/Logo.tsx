export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient
          id="hf-hl"
          gradientUnits="userSpaceOnUse"
          x1="6.65"
          y1="6.3"
          x2="14.92"
          y2="15.19"
        >
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient
          id="hf-hr"
          gradientUnits="userSpaceOnUse"
          x1="23.6"
          y1="3.82"
          x2="37.64"
          y2="21.18"
        >
          <stop offset="0" stopColor="var(--deep)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient
          id="hf-bl"
          gradientUnits="userSpaceOnUse"
          x1="1.28"
          y1="18.7"
          x2="19.88"
          y2="22"
        >
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="0.5" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--deep)" />
        </linearGradient>
        <linearGradient
          id="hf-br"
          gradientUnits="userSpaceOnUse"
          x1="37.64"
          y1="12.5"
          x2="14.09"
          y2="38.53"
        >
          <stop offset="0" stopColor="var(--deep)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient
          id="hf-rb"
          gradientUnits="userSpaceOnUse"
          x1="10.79"
          y1="33.57"
          x2="25.66"
          y2="15.19"
        >
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="0.62" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--deep)" />
        </linearGradient>
      </defs>
      <circle cx="10.7" cy="10.76" r="4.26" fill="url(#hf-hl)" />
      <circle cx="28.39" cy="10.64" r="4.13" fill="url(#hf-hr)" />
      <circle cx="9.75" cy="24.48" r="9.09" fill="url(#hf-bl)" />
      <circle cx="29.71" cy="24.32" r="9.26" fill="url(#hf-br)" />
      <path
        d="M7.07 33.24C10.37 29.86 16.57 27.38 19.26 22.83C21.12 19.61 22.98 17.54 24.75 16.43L26.28 20.35C26.07 22.83 25.87 24.9 25.25 26.67C24.01 27.58 22.56 28 21.2 28.41C20.79 29.86 19.88 32.13 18.02 33.16C16.57 33.57 14.09 33.49 12.44 33.16C10.79 33.57 8.72 33.49 7.69 33.37Z"
        fill="url(#hf-rb)"
      />
      <path
        d="M11.74 29.61C14.57 27.67 17.59 25.65 19.26 22.83"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="0.29"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity=".85"
      />
      <path
        d="M21.2 28.41C22.56 28 24.01 27.58 25.25 26.67"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="0.29"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity=".85"
      />
      <path
        d="M6.69 20.19L6.69 24.48"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="1.32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.86 18.33L11.86 24.07"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="1.32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.03 22.83L6.03 24.07C6.03 26.88 8.31 29.07 11.12 29.07L15.58 23.82C16.07 23.16 15.83 22.46 15.12 22.42C14.42 22.38 13.6 23.16 12.52 23.9L12.52 22.83Z"
        fill="var(--primary-foreground)"
      />
      <path
        d="M8.47 22.33L8.47 23.99"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.12 22.33L10.12 23.99"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.47 22.33L8.47 23.99"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.12 22.33L10.12 23.99"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.59 18.9C32.48 18.9 34.96 20.76 34.96 23.16C34.96 24.48 34.42 25.56 33.39 26.38L33.76 29.44L31.36 27.33C30.79 27.46 30.21 27.5 29.59 27.5C26.74 27.5 24.21 25.56 24.21 23.16C24.21 20.76 26.74 18.9 29.59 18.9Z"
        fill="var(--primary-foreground)"
      />
      <circle cx="26.9" cy="23.37" r="0.79" fill="var(--deep)" />
      <circle cx="29.38" cy="23.37" r="0.79" fill="var(--deep)" />
      <circle cx="31.86" cy="23.37" r="0.79" fill="var(--deep)" />
      <path
        d="M35.58 10.97Q37.31 12.71 35.58 14.44"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37.23 9.4Q40.7 12.71 37.44 16.01"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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