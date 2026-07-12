import { supabase } from "@/lib/supabase/client";
import { defaultDocName, type ChatMessage, type DocContent, type DocKind } from "./store";

export type DocStatus = "draft" | "generating" | "ready";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  plan: "student" | "professional";
  audience: string | null;
  credits_balance: number;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  user_id: string;
  kind: DocKind;
  title: string;
  content: DocContent | null;
  status: DocStatus;
  created_at: string;
  updated_at: string;
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super("INSUFFICIENT_CREDITS");
    this.name = "InsufficientCreditsError";
  }
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) throw new Error("NOT_AUTHENTICATED");
  return uid;
}

export async function getProfile(): Promise<Profile> {
  const uid = await requireUserId();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateOnboarding(audience: string): Promise<void> {
  const uid = await requireUserId();
  const { error } = await supabase.from("profiles").update({ audience }).eq("id", uid);
  if (error) throw error;
}

export async function listDocuments(): Promise<DocumentRow[]> {
  const uid = await requireUserId();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", uid)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function createDocument(
  kind: DocKind,
  title?: string,
): Promise<{ documentId: string; conversationId: string }> {
  const uid = await requireUserId();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({ user_id: uid, kind, title: title ?? defaultDocName(kind) })
    .select()
    .single();
  if (docError) throw docError;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ user_id: uid, document_id: doc.id })
    .select()
    .single();
  if (convError) throw convError;

  return { documentId: doc.id as string, conversationId: conversation.id as string };
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

export async function renameDocument(id: string, title: string): Promise<void> {
  const { error } = await supabase.from("documents").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function updateDocumentStatus(id: string, status: DocStatus): Promise<void> {
  const { error } = await supabase.from("documents").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateDocumentContent(id: string, content: DocContent): Promise<void> {
  const { error } = await supabase.from("documents").update({ content }).eq("id", id);
  if (error) throw error;
}

export interface DocumentWithMessages {
  document: DocumentRow;
  conversationId: string | undefined;
  messages: ChatMessage[];
}

export async function getDocumentWithMessages(
  documentId: string,
): Promise<DocumentWithMessages | null> {
  const uid = await requireUserId();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", uid)
    .maybeSingle();
  if (docError) throw docError;
  if (!doc) return null;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .eq("document_id", documentId)
    .eq("user_id", uid)
    .maybeSingle();
  if (convError) throw convError;

  let messages: ChatMessage[] = [];
  if (conversation) {
    const { data: rows, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    if (msgError) throw msgError;
    messages = (rows ?? []).map((m) => ({
      id: m.id as string,
      role: m.role as "user" | "assistant",
      content: m.content as string,
      createdAt: new Date(m.created_at as string).getTime(),
    }));
  }

  return {
    document: doc as DocumentRow,
    conversationId: conversation?.id as string | undefined,
    messages,
  };
}

export async function insertMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content });
  if (error) throw error;
}

export async function consumeCredit(documentId: string, description: string): Promise<number> {
  const { data, error } = await supabase.rpc("consume_credit", {
    p_document_id: documentId,
    p_description: description,
  });
  if (error) {
    if (error.message?.includes("INSUFFICIENT_CREDITS")) throw new InsufficientCreditsError();
    throw error;
  }
  return data as number;
}

export async function addTestCredits(amount = 5): Promise<number> {
  const { data, error } = await supabase.rpc("add_test_credits", { p_amount: amount });
  if (error) throw error;
  return data as number;
}
