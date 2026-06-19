import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DocContent, SlidesContent, WordContent, SheetContent, PdfContent } from "@/lib/doca/store";

export function DocumentPreview({ content, generating = false }: { content: DocContent | null; generating?: boolean }) {
  if (!content) return null;
  switch (content.kind) {
    case "word": return <WordPreview content={content} generating={generating} />;
    case "slides": return <SlidesPreview content={content} generating={generating} />;
    case "sheet": return <SheetPreview content={content} generating={generating} />;
    case "pdf": return <PdfPreview content={content} generating={generating} />;
  }
}

function WordPreview({ content, generating }: { content: WordContent; generating: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[820px] doc-paper px-10 py-14 sm:px-16 sm:py-20 doca-fade-up shadow-[0_1px_0_var(--color-hairline)]">
      {content.blocks.map((b, i) => {
        const isLast = generating && i === content.blocks.length - 1;
        if (b.type === "h1")
          return <h1 key={i} className={`mb-6 font-display text-3xl font-semibold ${isLast ? "doca-caret" : ""}`}>{b.text}</h1>;
        if (b.type === "h2")
          return <h2 key={i} className={`mb-3 mt-8 font-display text-xl font-semibold ${isLast ? "doca-caret" : ""}`}>{b.text}</h2>;
        if (b.type === "h3")
          return <h3 key={i} className={`mb-2 mt-6 font-display text-base font-semibold ${isLast ? "doca-caret" : ""}`}>{b.text}</h3>;
        if (b.type === "p")
          return <p key={i} className={`mb-4 text-[15px] leading-[1.75] text-foreground ${isLast ? "doca-caret" : ""}`}>{b.text}</p>;
        if (b.type === "quote")
          return (
            <blockquote key={i} className="my-6 border-l-2 border-primary pl-4 font-serif text-lg italic text-subtle">
              {b.text}
            </blockquote>
          );
        if (b.type === "list") {
          const Tag = b.ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={`mb-4 ml-5 space-y-1.5 text-[15px] leading-[1.75] ${b.ordered ? "list-decimal" : "list-disc"}`}>
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </Tag>
          );
        }
        return null;
      })}
    </div>
  );
}

function SlidesPreview({ content, generating }: { content: SlidesContent; generating: boolean }) {
  const [i, setI] = useState(0);
  const slide = content.slides[i];
  if (!slide) return null;
  return (
    <div className="mx-auto w-full max-w-[900px] doca-fade-up">
      <div className="doc-paper aspect-[16/9] overflow-hidden">
        <div className="flex h-full flex-col px-10 py-10 sm:px-16 sm:py-14">
          <h2 className={`font-display text-3xl font-semibold sm:text-4xl ${generating && i === content.slides.length - 1 ? "doca-caret" : ""}`}>
            {slide.title}
          </h2>
          <div className="mt-2 h-px w-12 bg-primary" />
          <ul className="mt-8 space-y-3 text-[17px] text-foreground/85">
            {slide.body.map((line, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{content.title}</span>
            <span>{i + 1} / {content.slides.length}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-paper text-subtle transition hover:text-foreground disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {content.slides.map((_, j) => (
            <button
              key={j}
              onClick={() => setI(j)}
              className={`h-1 rounded-full transition-all ${j === i ? "w-6 bg-primary" : "w-3 bg-hairline hover:bg-muted-foreground/40"}`}
              aria-label={`Slide ${j + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setI((v) => Math.min(content.slides.length - 1, v + 1))}
          disabled={i === content.slides.length - 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-paper text-subtle transition hover:text-foreground disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SheetPreview({ content, generating }: { content: SheetContent; generating: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[1000px] doca-fade-up">
      <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{content.title}</div>
      <div className="overflow-hidden rounded-md border border-hairline bg-paper">
        <div className="grid border-b border-hairline bg-muted/50 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
          style={{ gridTemplateColumns: `40px repeat(${content.headers.length}, minmax(0, 1fr))` }}>
          <div className="border-r border-hairline px-2 py-2" />
          {content.headers.map((h, i) => (
            <div key={i} className="border-r border-hairline px-3 py-2 last:border-r-0 text-foreground/70">
              {h}
            </div>
          ))}
        </div>
        {content.rows.map((row, r) => {
          const isLast = generating && r === content.rows.length - 1;
          return (
            <div key={r} className="grid border-b border-hairline last:border-b-0"
              style={{ gridTemplateColumns: `40px repeat(${content.headers.length}, minmax(0, 1fr))` }}>
              <div className="border-r border-hairline bg-muted/30 px-2 py-2 text-center font-mono text-[11px] text-muted-foreground">{r + 1}</div>
              {row.map((cell, c) => (
                <div key={c} className={`border-r border-hairline px-3 py-2 text-[13px] last:border-r-0 ${isLast && c === row.length - 1 ? "doca-caret" : ""}`}>
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PdfPreview({ content, generating }: { content: PdfContent; generating: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[760px] doca-fade-up">
      <div className="doc-paper px-12 py-16 sm:px-20 sm:py-24" style={{ aspectRatio: "1 / 1.414" }}>
        <div className="mb-8 border-b border-hairline pb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Documento PDF</div>
          <h1 className="mt-2 font-display text-2xl font-semibold">{content.title}</h1>
        </div>
        <pre className={`whitespace-pre-wrap font-sans text-[14px] leading-[1.75] text-foreground ${generating ? "doca-caret" : ""}`}>
          {content.body}
        </pre>
      </div>
    </div>
  );
}
