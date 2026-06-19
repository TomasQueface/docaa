import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export interface DocaDoc {
  id: string;
  kind: DocKind;
  name: string;
  updatedAt: number;
  status: "draft" | "generating" | "ready";
  messages: ChatMessage[];
  content: DocContent | null;
}

interface DocaState {
  onboarded: boolean;
  audience: string | null;
  authed: boolean;
  email: string | null;
  docs: DocaDoc[];
  activeId: string | null;
  setOnboarded: (audience: string) => void;
  setAuthed: (email: string) => void;
  signOut: () => void;
  createDoc: (kind: DocKind, name?: string) => string;
  deleteDoc: (id: string) => void;
  setActive: (id: string | null) => void;
  appendMessage: (id: string, msg: ChatMessage) => void;
  setContent: (id: string, content: DocContent) => void;
  setStatus: (id: string, status: DocaDoc["status"]) => void;
  renameDoc: (id: string, name: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useDoca = create<DocaState>()(
  persist(
    (set) => ({
      onboarded: false,
      audience: null,
      authed: false,
      email: null,
      docs: [],
      activeId: null,
      setOnboarded: (audience) => set({ onboarded: true, audience }),
      setAuthed: (email) => set({ authed: true, email }),
      signOut: () => set({ authed: false, email: null }),
      createDoc: (kind, name) => {
        const id = uid();
        const doc: DocaDoc = {
          id,
          kind,
          name: name ?? defaultName(kind),
          updatedAt: Date.now(),
          status: "draft",
          messages: [],
          content: null,
        };
        set((s) => ({ docs: [doc, ...s.docs], activeId: id }));
        return id;
      },
      deleteDoc: (id) =>
        set((s) => ({
          docs: s.docs.filter((d) => d.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      setActive: (id) => set({ activeId: id }),
      appendMessage: (id, msg) =>
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === id ? { ...d, messages: [...d.messages, msg], updatedAt: Date.now() } : d,
          ),
        })),
      setContent: (id, content) =>
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === id ? { ...d, content, updatedAt: Date.now() } : d,
          ),
        })),
      setStatus: (id, status) =>
        set((s) => ({
          docs: s.docs.map((d) => (d.id === id ? { ...d, status } : d)),
        })),
      renameDoc: (id, name) =>
        set((s) => ({
          docs: s.docs.map((d) => (d.id === id ? { ...d, name } : d)),
        })),
    }),
    { name: "doca-state-v1" },
  ),
);

function defaultName(kind: DocKind) {
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
