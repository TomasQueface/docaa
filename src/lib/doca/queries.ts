import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { assistantReply, buildMockContent } from "./mock-generator";
import { docKindLabel, type DocKind } from "./store";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: api.getProfile });
}

export function useDocuments() {
  return useQuery({ queryKey: ["documents"], queryFn: api.listDocuments });
}

export function useDocument(id: string) {
  return useQuery({ queryKey: ["document", id], queryFn: () => api.getDocumentWithMessages(id) });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { kind: DocKind; title?: string }) =>
      api.createDocument(vars.kind, vars.title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useRenameDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; title: string }) => api.renameDocument(vars.id, vars.title),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", vars.id] });
    },
  });
}

export function useAddTestCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount?: number) => api.addTestCredits(amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audience: string) => api.updateOnboarding(audience),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

interface SendMessageVars {
  documentId: string;
  conversationId: string;
  kind: DocKind;
  text: string;
  isFirstMessage: boolean;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      documentId,
      conversationId,
      kind,
      text,
      isFirstMessage,
    }: SendMessageVars) => {
      await api.insertMessage(conversationId, "user", text);

      // Bloqueia aqui, antes de gastar tempo a "gerar" — falha cedo e com clareza se não há créditos.
      await api.consumeCredit(documentId, `Geração de ${docKindLabel[kind]}`);

      await api.updateDocumentStatus(documentId, "generating");
      await new Promise((r) => setTimeout(r, 700));

      const content = buildMockContent(text, kind);
      await api.updateDocumentContent(documentId, content);
      if (isFirstMessage) await api.renameDocument(documentId, content.title.slice(0, 60));

      await new Promise((r) => setTimeout(r, 900));
      await api.insertMessage(conversationId, "assistant", assistantReply(text, kind));
      await api.updateDocumentStatus(documentId, "ready");

      return content;
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: ["document", vars.documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
