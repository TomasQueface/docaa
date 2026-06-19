import type { DocKind } from "@/lib/doca/store";
import { docKindLabel } from "@/lib/doca/store";

export function GeneratingIndicator({ kind }: { kind: DocKind }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      A tecer {docKindLabel[kind]}…
    </div>
  );
}
