// Dicionário didático: definições curtas e claras para grupos e categorias.
// Linguagem acessível para qualquer nível de conhecimento financeiro.
// Usado pelos popovers "?" no app para educar o usuário.

type Dict = Record<string, string>;

// ────────────────── DESPESAS ──────────────────
export const EXPENSE_GROUP_INFO: Dict = {
  "Casa": "Tudo que mantém o seu lar funcionando: moradia, contas fixas e mercado. Costuma ser o maior bloco do orçamento.",
  "Pessoal": "Gastos com você e sua família: saúde, estudo, transporte, comida do dia a dia. Essenciais à sua qualidade de vida.",
  "Estilo de vida": "Tudo que você escolhe consumir por prazer: lazer, restaurantes, viagens, assinaturas. Aqui mora o supérfluo que mais pesa no fim do mês.",
  "Negócios": "Despesas ligadas ao seu trabalho autônomo, MEI ou empresa. Separe sempre do dinheiro pessoal.",
  "Investimentos": "Não é gasto, é construção de patrimônio. Trate como uma 'conta' que você paga para o seu futuro.",
  "Extras": "Imprevistos, taxas e o que não se encaixa em nenhum outro grupo. Quanto menor, melhor seu controle.",
};

export const EXPENSE_CATEGORY_INFO: Dict = {
  // Casa
  "Aluguel": "Valor mensal pago pela moradia que você não é proprietário(a).",
  "Condomínio": "Taxa do prédio/condomínio que cobre limpeza, portaria e áreas comuns.",
  "Energia": "Conta de luz da residência.",
  "Água": "Conta de água e esgoto da residência.",
  "Internet": "Plano de banda larga, fibra ou móvel residencial.",
  "Gás": "Botijão ou gás encanado usado em casa.",
  "Manutenção": "Reparos, consertos, pintura, obras pequenas no imóvel.",
  "Mercado": "Compra de comida e itens básicos para casa (não confundir com restaurantes).",

  // Pessoal
  "Saúde": "Plano de saúde, consultas, remédios, exames, terapia, dentista.",
  "Educação": "Mensalidades, cursos, livros, materiais escolares — seus ou da família.",
  "Vestuário": "Roupas, calçados e acessórios.",
  "Higiene": "Produtos de higiene pessoal e cuidados básicos (sabonete, shampoo, cosméticos do dia a dia).",
  "Transporte": "Combustível, ônibus, metrô, app de mobilidade, manutenção do carro.",
  "Alimentação": "Comida fora de casa que faz parte da rotina (lanche no trabalho, marmita, café).",

  // Estilo de vida
  "Lazer": "Atividades de diversão: cinema, parques, eventos, baladas.",
  "Restaurantes": "Refeições em restaurantes, bares e delivery por opção (não necessidade).",
  "Viagens": "Passagens, hospedagem, passeios, gastos durante viagens.",
  "Assinaturas": "Streaming, apps pagos, clubes, revistas. Reveja periodicamente — somam muito.",
  "Hobbies": "Materiais e cursos do seu hobby: música, esportes, jogos, artesanato.",
  "Presentes": "Compras para outras pessoas: aniversários, datas comemorativas.",

  // Negócios
  "Marketing": "Anúncios pagos, design, conteúdo para divulgar seu negócio.",
  "Ferramentas": "Softwares, apps e licenças usados no trabalho.",
  "Impostos": "Tributos e taxas profissionais (DAS, INSS, IR do negócio).",
  "Serviços": "Contador, freelancers e outros prestadores que apoiam seu trabalho.",
  "Equipamentos": "Computador, celular, móveis e equipamentos do seu negócio.",

  // Investimentos
  "Renda fixa": "Tesouro Direto, CDB, LCI, LCA — investimentos com regras conhecidas e baixo risco.",
  "Renda variável": "Ações, ETFs, FIIs — podem render mais, mas oscilam de valor.",
  "Cripto": "Bitcoin, Ethereum e outras moedas digitais. Alto risco, alta volatilidade.",
  "Previdência": "PGBL, VGBL, planos de aposentadoria privada de longo prazo.",
  "Aportes": "Valor que você adiciona a um investimento já existente.",

  // Extras
  "Imprevistos": "Gastos não planejados (multa, conserto urgente, emergência).",
  "Doações": "Valores doados a instituições, pessoas ou causas.",
  "Taxas": "Tarifas bancárias, juros de cartão, IOF, anuidades.",
  "Outros": "Qualquer despesa que não se encaixa nas categorias acima.",
};

// ────────────────── ENTRADAS ──────────────────
export const INCOME_GROUP_INFO: Dict = {
  "Salário": "Sua renda principal vinda do trabalho com vínculo: CLT, sócio ou contrato fixo.",
  "Renda extra": "Tudo que você ganha fora do salário fixo: freelas, vendas, comissões.",
  "Investimentos": "Dinheiro que o seu próprio dinheiro gera: juros, dividendos, lucros.",
  "Outros": "Entradas pontuais: presentes, reembolsos, qualquer dinheiro recebido.",
};

export const INCOME_CATEGORY_INFO: Dict = {
  // Salário
  "Salário CLT": "Salário mensal de quem trabalha com carteira assinada (já com descontos).",
  "Pró-labore": "Remuneração mensal de sócio(a) de empresa.",
  "13º": "Décimo terceiro salário, pago em duas parcelas (novembro e dezembro).",
  "Férias": "Valor recebido nas férias (salário + 1/3 constitucional).",
  "Bônus": "Premiação extra paga pela empresa (PLR, metas, gratificações).",

  // Renda extra
  "Freelance": "Pagamento por trabalhos avulsos ou projetos próprios.",
  "Comissão": "Percentual que você ganha sobre vendas ou contratos fechados.",
  "Vendas": "Receita de produtos ou serviços que você vende por conta própria.",
  "Aluguéis": "Valor recebido pelo aluguel de um imóvel ou bem que você possui.",

  // Investimentos
  "Dividendos": "Parte do lucro distribuído por empresas em que você investe (ações, FIIs).",
  "Juros": "Rendimento de aplicações de renda fixa (poupança, CDB, Tesouro).",
  "Resgate": "Valor retirado de um investimento (saque do principal + rendimento).",
  "Lucros": "Ganho obtido na venda de um ativo por preço maior que o de compra.",

  // Outros
  "Presente": "Dinheiro recebido como presente.",
  "Reembolso": "Devolução de algum gasto que você fez (empresa, plano de saúde, etc.).",
  "Outros": "Qualquer outra entrada que não se encaixa nas categorias acima.",
};

import type { TransactionType } from "@/types";

export function getGroupInfo(type: TransactionType, group: string): string | null {
  const dict = type === "income" ? INCOME_GROUP_INFO : EXPENSE_GROUP_INFO;
  return dict[group] ?? null;
}

export function getCategoryInfo(type: TransactionType, category: string): string | null {
  const dict = type === "income" ? INCOME_CATEGORY_INFO : EXPENSE_CATEGORY_INFO;
  return dict[category] ?? null;
}
