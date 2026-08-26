import type { Service } from './mock-data'

export type ServiceDetails = {
  longDescription: string
  features: string[]
  duration?: string
  idealFor?: string
  includes?: string[]
}

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  vitrificacao: {
    longDescription:
      'A Vitrificação de Pintura cria uma camada de vidro líquido (revestimento cerâmico SiO2) sobre o verniz do seu carro. A técnica sela os poros da pintura, proporcionando brilho espelhado profundo, hidrofobia extrema e proteção contra raios UV, fezes de pássaros, seiva e contaminação da chuva ácida. Diferente da cera comum que dura semanas, a vitrificação mantém o carro protegido por anos.',
    features: [
      'Brilho espelhado e profundidade de cor intensa',
      'Hidrofobia: água e sujeira escorrem, lavagem fica muito mais fácil',
      'Proteção UV que evita desbotamento e oxidação',
      'Resistência a micro arranhuras e manchas químicas',
      'Durabilidade de 1 a 3 anos conforme manutenção',
    ],
    duration: '1 a 2 dias (cura de 24h recomendada)',
    idealFor: 'Carros novos, seminovos ou repintados que o dono quer manter impecável por anos.',
    includes: ['Descontaminação completa', 'Polimento preparatório', 'Aplicação cerâmica', 'Cura e inspeção'],
  },

  lavagem_detalhada: {
    longDescription:
      'A Lavagem Detalhada vai muito além da lavagem comum. Limpamos cada canto do veículo — exterior, caixas de roda, portas e interior — com produtos pH neutro, pincéis e microfibras específicas. Finalizamos com cera protetora, revitalização de plásticos e aspiração minuciosa. Ideal para devolver o aspecto de carro bem cuidado sem agressão à pintura.',
    features: [
      'Pré-lavagem com snow foam para remover areia sem riscar',
      'Limpeza técnica de rodas, pneus e caixas de roda',
      'Aspiração completa, limpeza de painéis e vidros por dentro',
      'Cera líquida e revitalizador de plásticos e borrachas',
      'Acabamento sem marcas com toalhas de microfibra premium',
    ],
    duration: '2 a 3 horas',
    idealFor: 'Quem usa o carro no dia a dia e quer limpeza profunda mensal ou quinzenal.',
  },

  lavagem_manutencao: {
    longDescription:
      'A Lavagem de Manutenção é pensada para quem já fez lavagem detalhada ou vitrificação e quer manter o resultado sempre em dia. É rápida, segura e mantém a camada de proteção intacta. Usamos shampoo com cera, método de dois baldes e secagem touchless sempre que possível para não criar swirls.',
    features: [
      'Preserva vitrificação, PPF ou cera existente',
      'Método de dois baldes + luva de microfibra',
      'Secagem com soprador e toalha waffle para evitar riscos',
      'Vidros limpos e pneus pretinhos',
      'Entrega rápida sem fila',
    ],
    duration: '60 a 90 minutos',
    idealFor: 'Clientes com vitrificação/PPF ou que lavam toda semana e querem praticidade.',
  },

  volante: {
    longDescription:
      'O Revestimento de Volante recupera e protege o couro do volante, a peça que mais sofre desgaste por suor, atrito e sol. Aplicamos hidratação profunda, pigmentação e verniz soft-touch que devolvem textura, cor e pegada macia, além de camada protetora contra ressecamento e brilho excessivo.',
    features: [
      'Restaura textura e cor original do couro',
      'Hidratação que evita rachaduras e descascamento',
      'Toque macio e antideslizante',
      'Proteção contra suor, oleosidade e UV',
      'Acabamento fosco de fábrica, sem aspecto pintado',
    ],
    duration: '3 a 5 horas',
    idealFor: 'Volantes desgastados, brilhantes ou esbranquiçados por uso e sol.',
  },

  ppf: {
    longDescription:
      'O PPF (Paint Protection Film) é uma película transparente de poliuretano de alta tecnologia com capacidade de autorreparação. Aplicada sobre pintura, faróis ou para-choques, protege contra lascas de pedra, arranhões de lavagem, galhos, fezes de pássaros e até vandalismo leve. É a proteção máxima, praticamente invisível, removível sem danificar a pintura original — essencial para carros 0km e esportivos.',
    features: [
      'Autorreparação: micro riscos somem com calor',
      'Protege contra pedras, arranhões e abrasão',
      'Brilho extra ou acabamento fosco conforme escolha',
      'Não amarela, não descola, garantia estendida',
      'Valoriza revenda: pintura original preservada',
    ],
    duration: '1 a 3 dias dependendo da área',
    idealFor: 'Carros 0km, supercarros e quem roda em estrada ou quer proteção total.',
    includes: ['Capô', 'Para-choque', 'Retrovisores', 'Pacote completo opcional'],
  },

  polimento: {
    longDescription:
      'O Polimento Técnico é a correção definitiva da pintura. Com politriz, boinas e compostos abrasivos graduais, removemos até 95% dos swirls, hologramas, riscos de lavagem e manchas de verniz, devolvendo a cor viva e o reflexo perfeito. É pré-requisito para vitrificação e PPF. Trabalho medido com espessura para não agredir o verniz.',
    features: [
      'Remove swirls, riscos circulares e hologramas',
      'Devolve profundidade e reflexo de espelho',
      'Medição de verniz para segurança',
      'Correção em 1 a 3 etapas conforme severidade',
      'Prepara pintura para vitrificação/PPF com aderência máxima',
    ],
    duration: '6 a 12 horas',
    idealFor: 'Carros com pintura riscada, sem brilho ou que nunca foram polidos corretamente.',
  },

  higienizacao: {
    longDescription:
      'A Higienização Interna é uma limpeza profunda de bancos (tecido ou couro), forro de teto, carpetes, porta-malas, ar-condicionado e plásticos. Usamos extratora, vapor, ozônio e produtos bactericidas que eliminam ácaros, fungos, bactérias e odores impregnados (cigarro, mofo, pet). Ideal para saúde da família e para quem comprou carro usado.',
    features: [
      'Extração profunda de sujeira de estofados e carpetes',
      'Vapor + ozônio elimina bactérias e odores na raiz',
      'Hidratação de couro e revitalização de plásticos',
      'Limpeza de dutos do ar-condicionado',
      'Secagem controlada para não deixar umidade',
    ],
    duration: '6 a 8 horas',
    idealFor: 'Famílias com crianças/pets, alérgicos e carros com odor persistente.',
  },

  insulfilm: {
    longDescription:
      'Aplicamos películas de alta performance com tecnologia nanocerâmica. Rejeitam até 95% do calor infravermelho e 99% dos raios UV sem escurecer demais à noite. Reduzem o esforço do ar-condicionado, protegem pele e interior contra ressecamento, e garantem privacidade. Trabalhamos com marcas premium, corte computadorizado e acabamento sem bolhas.',
    features: [
      'Rejeição de calor de até 95% com nanocerâmica',
      'Proteção UV 99% para pele e interior',
      'Visibilidade noturna preservada',
      'Garantia contra desbotamento, bolhas e descolamento',
      'Aplicação com plotter para corte perfeito',
    ],
    duration: '2 a 4 horas',
    idealFor: 'Quem dirige sob sol forte, tem crianças no banco traseiro ou quer conforto térmico.',
  },

  revestimento: {
    longDescription:
      'O serviço de Revestimento e Micropintura une restauração de couro (volante, manopla, bancos) e correção pontual de arranhões e lascas na lataria sem repintar a peça inteira. Com aerografia e pigmentação automotiva, retocamos apenas o ponto danificado, mantendo verniz e textura originais. Resultado invisível e muito mais econômico que funilaria.',
    features: [
      'Micropintura corrige lascas e riscos profundos localmente',
      'Restaura couro ressecado ou rasgado',
      'Cor 100% igualada via espectrofotômetro',
      'Sem diferença de tonalidade ou relevo',
      'Laudo para garantia e pós-venda',
    ],
    duration: '4 a 8 horas',
    idealFor: 'Riscos de porta, pedras no capô, calçada na roda e couro desgastado.',
  },
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/__+/g, '_')
}

const ALIASES: Record<string, string> = {
  ppf_paint_protection_film: 'ppf',
  pelicula_de_protecao: 'ppf',
  vitrificacao_de_pintura: 'vitrificacao',
  polimento_tecnico: 'polimento',
  higienizacao_interna: 'higienizacao',
  aplicacao_de_insulfilm: 'insulfilm',
  revestimento_e_micropintura: 'revestimento',
  revestimento_de_volante: 'volante',
  revestimento_de_volate: 'volante',
  lavagem_detalhada: 'lavagem_detalhada',
  lavagem_de_manutencao: 'lavagem_manutencao',
}

// Parse the newline-separated list fields stored in the DB ("features"/"includes")
function parseStoredLines(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
}

export function getServiceDetails(service: Service): ServiceDetails | null {
  // 1. Admin-edited content takes precedence: when a longDescription was saved
  //    for this service (any service row from the DB carries these optional
  //    fields), build the details entirely from the stored values.
  if (typeof service.longDescription === 'string' && service.longDescription.trim()) {
    return {
      longDescription: service.longDescription,
      features: parseStoredLines(service.features),
      duration: service.duration?.trim() || undefined,
      idealFor: service.idealFor?.trim() || undefined,
      includes: parseStoredLines(service.includes),
    }
  }

  // 2. Fallback: curated built-in copy matched by id/value/title.
  const candidates = [
    service.id,
    service.value,
    service.title,
  ]
    .filter(Boolean)
    .map((v) => normalizeKey(v))

  for (const key of candidates) {
    const alias = ALIASES[key] ?? key
    if (SERVICE_DETAILS[alias]) return SERVICE_DETAILS[alias]
    if (SERVICE_DETAILS[key]) return SERVICE_DETAILS[key]
  }

  // Try substring match for id containing known key
  for (const key of candidates) {
    for (const known of Object.keys(SERVICE_DETAILS)) {
      if (key.includes(known) || known.includes(key)) {
        return SERVICE_DETAILS[known]
      }
    }
  }

  return null
}
