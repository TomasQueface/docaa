import type { DocKind } from "@/lib/doca/store";

const COLORS: Record<DocKind, string> = {
  word: "var(--color-doc-word)",
  slides: "var(--color-doc-slides)",
  sheet: "var(--color-doc-sheet)",
  pdf: "var(--color-doc-pdf)",
};

const LABELS: Record<DocKind, string> = {
  word: "DOC",
  slides: "PPT",
  sheet: "XLS",
  pdf: "PDF",
};

export function DocKindIcon({ kind, size = 28 }: { kind: DocKind; size?: number }) {
  const w = size;
  const h = Math.round(size * 1.25);
  return (
    <svg width={w} height={h} viewBox="0 0 28 36" aria-hidden>
      <path
        d="M3 1.5h15l7 7v25a1.5 1.5 0 0 1-1.5 1.5h-20.5A1.5 1.5 0 0 1 1.5 33.5v-30A1.5 1.5 0 0 1 3 1.5z"
        fill="var(--color-paper)"
        stroke="var(--color-hairline)"
        strokeWidth="1"
      />
      <path d="M18 1.5v7h7" fill="none" stroke="var(--color-hairline)" strokeWidth="1" />
      <rect x="3" y="22" width="22" height="9" rx="1" fill={COLORS[kind]} />
      <text
        x="14"
        y="29"
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="var(--font-display)"
        fill="#fff"
        letterSpacing="0.5"
      >
        {LABELS[kind]}
      </text>
    </svg>
  );
}
