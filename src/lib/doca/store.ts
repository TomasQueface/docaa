export type DocKind = "word" | "slides" | "sheet" | "pdf";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface WordContent {
  kind: "word";
  title: string;
  blocks: Array<
    | { type: "h1" | "h2" | "h3" | "p"; text: string }
    | { type: "list"; items: string[]; ordered?: boolean }
    | { type: "quote"; text: string }
  >;
}

export interface SlidesContent {
  kind: "slides";
  title: string;
  slides: Array<{ title: string; body: string[] }>;
}

export interface SheetContent {
  kind: "sheet";
  title: string;
  headers: string[];
  rows: string[][];
}

export interface PdfContent {
  kind: "pdf";
  title: string;
  body: string;
}

export type DocContent = WordContent | SlidesContent | SheetContent | PdfContent;

export function defaultDocName(kind: DocKind) {
  const map: Record<DocKind, string> = {
    word: "Documento sem título",
    slides: "Apresentação sem título",
    sheet: "Planilha sem título",
    pdf: "PDF sem título",
  };
  return map[kind];
}

export const docKindLabel: Record<DocKind, string> = {
  word: "Word",
  slides: "Slides",
  sheet: "Planilha",
  pdf: "PDF",
};

export const docKindExt: Record<DocKind, string> = {
  word: ".docx",
  slides: ".pptx",
  sheet: ".xlsx",
  pdf: ".pdf",
};
