import type { DocContent, DocKind } from "./store";

export function inferKindFromPrompt(prompt: string): DocKind {
  const p = prompt.toLowerCase();
  if (/(apresenta|slide|pptx|powerpoint)/.test(p)) return "slides";
  if (/(planilha|excel|tabela|xlsx|orçamento|orcamento|cálculo|calculo)/.test(p)) return "sheet";
  if (/(pdf|relatório|relatorio|contrato|fatura)/.test(p)) return "pdf";
  return "word";
}

export function buildMockContent(prompt: string, kind: DocKind): DocContent {
  const topic = prompt.replace(/[.?!]+$/, "").slice(0, 80) || "Documento";
  const title = capitalize(topic);

  if (kind === "word") {
    return {
      kind: "word",
      title,
      blocks: [
        { type: "h1", text: title },
        {
          type: "p",
          text: `Este documento aborda ${topic.toLowerCase()} de forma estruturada, com base no pedido fornecido. As secções abaixo organizam o conteúdo principal, contextualizando o tema e apresentando os pontos centrais.`,
        },
        { type: "h2", text: "1. Introdução" },
        {
          type: "p",
          text: `A relevância de ${topic.toLowerCase()} no contexto actual justifica uma análise cuidadosa. Esta introdução estabelece o enquadramento e os objectivos do trabalho.`,
        },
        { type: "h2", text: "2. Desenvolvimento" },
        {
          type: "p",
          text: "Os pontos a seguir resumem os aspectos mais importantes a considerar:",
        },
        {
          type: "list",
          items: [
            "Contextualização histórica e definições essenciais.",
            "Principais argumentos e perspectivas em debate.",
            "Exemplos práticos aplicados à realidade local.",
            "Implicações e desafios identificados.",
          ],
        },
        { type: "h2", text: "3. Conclusão" },
        {
          type: "p",
          text: "A análise apresentada permite concluir que o tema requer atenção contínua e abordagens multidisciplinares. Recomenda-se aprofundar os pontos identificados em trabalhos futuros.",
        },
        { type: "quote", text: `"${capitalize(topic)} não é um destino — é um processo."` },
      ],
    };
  }

  if (kind === "slides") {
    return {
      kind: "slides",
      title,
      slides: [
        { title, body: ["Uma visão estruturada", "Preparado com Doca"] },
        { title: "Contexto", body: [
          `Enquadramento de ${topic.toLowerCase()}`,
          "Relevância no momento actual",
          "Público-alvo e objectivos",
        ]},
        { title: "Pontos-chave", body: [
          "Definições essenciais",
          "Argumentos centrais",
          "Casos práticos",
          "Desafios identificados",
        ]},
        { title: "Análise", body: [
          "Comparação de perspectivas",
          "Dados de suporte",
          "Limitações da abordagem",
        ]},
        { title: "Conclusão", body: [
          "Síntese dos pontos discutidos",
          "Recomendações práticas",
          "Próximos passos",
        ]},
        { title: "Obrigado", body: ["Perguntas e discussão"] },
      ],
    };
  }

  if (kind === "sheet") {
    return {
      kind: "sheet",
      title,
      headers: ["Item", "Categoria", "Quantidade", "Preço unit.", "Total"],
      rows: [
        ["Item A", "Categoria 1", "10", "150,00", "1.500,00"],
        ["Item B", "Categoria 1", "5", "320,00", "1.600,00"],
        ["Item C", "Categoria 2", "20", "45,00", "900,00"],
        ["Item D", "Categoria 2", "8", "275,00", "2.200,00"],
        ["Item E", "Categoria 3", "12", "90,00", "1.080,00"],
        ["", "", "", "Subtotal", "7.280,00"],
        ["", "", "", "IVA (17%)", "1.237,60"],
        ["", "", "", "Total", "8.517,60"],
      ],
    };
  }

  return {
    kind: "pdf",
    title,
    body: `${title}\n\nEste documento foi preparado em formato PDF, pronto para impressão e partilha formal.\n\n1. Enquadramento\nO presente documento responde ao pedido relativo a ${topic.toLowerCase()}, organizando a informação de forma clara.\n\n2. Conteúdo principal\nOs elementos centrais foram organizados em secções, garantindo leitura fluída e estrutura profissional.\n\n3. Considerações finais\nO documento pode ser exportado, partilhado ou impresso conforme necessário.\n\n— Gerado com Doca`,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function assistantReply(prompt: string, kind: DocKind): string {
  const labels = { word: "documento Word", slides: "apresentação", sheet: "planilha", pdf: "PDF" } as const;
  return `Estou a preparar a tua ${labels[kind]} sobre "${prompt.slice(0, 60)}". Vê o preview a ser construído ao lado — podes pedir ajustes a qualquer momento.`;
}
