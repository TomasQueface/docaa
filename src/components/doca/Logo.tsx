interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className = "", showWordmark = true }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <rect x="2.5" y="1.5" width="14" height="19" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="5.5" y="4.5" width="14" height="16" rx="1.5" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.4" />
        <line x1="8" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8" y1="12.5" x2="17" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="13.5" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[17px] font-semibold tracking-tight">
          Doca
        </span>
      )}
    </div>
  );
}
