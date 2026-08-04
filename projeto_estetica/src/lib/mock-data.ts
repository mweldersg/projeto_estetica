export type Service = {
  id: string
  title: string
  description: string
  image: string
  value: string
}

export type Video = {
  id: string
  title: string
  instagramUrl: string
}

export type Review = {
  id: string
  name: string
  rating: number
  text: string
  image?: string | null
}

export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/garage765sp'

export const instagram = {
  handle: 'garage765sp',
  followers: '8.880 mil',
  posts: '475',
  avatar: 'https://lh3.googleusercontent.com/d/1F7B12GjN3Yizy7Mt9cRtUT9KlK8MMUf5',
  gallery: [
    'https://lh3.googleusercontent.com/d/1uDzsfc_C5-1a5NOUHRNAw0u7DqNIc-bV',
    'https://lh3.googleusercontent.com/d/1-WOdOkIAKKqTM_iefWZHBEBdRxlT1hIT',
    'https://lh3.googleusercontent.com/d/1DISlRLoV4VvQ1ftSuyQho8Tq87z_YlgR',
  ],
}

export const services: Service[] = [
  {
    id: 'vitrificacao',
    title: 'Vitrificação de Pintura',
    description: 'Cria uma camada de vidro (Revestimento Cerâmico) sobre o verniz. Repele água, sujeira e garante brilho espelhado.',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
    value: 'Vitrificação de Pintura',
  },
  {
    id: 'ppf',
    title: 'PPF (Película de Proteção)',
    description: 'Nível máximo de proteção. Película autorrecuperável que protege contra lascas de pedra, arranhuras e vandalismo.',
    image: 'https://images.unsplash.com/photo-1669625328455-3870684ac58c?auto=format&fit=crop&w=600&q=80',
    value: 'PPF (Paint Protection Film)',
  },
  {
    id: 'polimento',
    title: 'Polimento Técnico',
    description: 'Correção de pintura que remove até 95% das ranhuras, swirls e imperfeições, restaurando a cor original.',
    image: 'https://plus.unsplash.com/premium_photo-1663013309657-8b3a2a00849e?auto=format&fit=crop&w=600&q=80',
    value: 'Polimento Técnico',
  },
  {
    id: 'higienizacao',
    title: 'Higienização Interna',
    description: 'Limpeza profunda de bancos, forro, carpetes e plásticos. Elimina odores, fungos e bactérias completamente.',
    image: 'https://plus.unsplash.com/premium_photo-1661909961389-7d501737abde?auto=format&fit=crop&w=600&q=80',
    value: 'Higienização Interna',
  },
  {
    id: 'insulfilm',
    title: 'Aplicação de Insulfilm',
    description: 'Películas de alto desempenho (Nanocerâmica). Rejeição de calor, proteção UV e privacidade completa.',
    image: 'https://images.unsplash.com/photo-1690022676526-2762ac826843?auto=format&fit=crop&w=600&q=80',
    value: 'Aplicação de Insulfilm',
  },
  {
    id: 'revestimento',
    title: 'Revestimento e Micropintura',
    description: 'Renovação do volante em couro e correção de arranhuras profundas sem repintura da peça inteira.',
    image: 'https://plus.unsplash.com/premium_photo-1661962438334-a52e4dd85031?auto=format&fit=crop&w=600&q=80',
    value: 'Revestimento e Micropintura',
  },
]

export const videos: Video[] = [
  {
    id: 'v1',
    title: 'Vitrificação completa',
    instagramUrl: 'https://www.instagram.com/p/DbHLCRLziL4/embed/',
  },
  {
    id: 'v2',
    title: 'Correção de pintura',
    instagramUrl: 'https://www.instagram.com/p/DPb2P71jfIl/embed/',
  },
  {
    id: 'v3',
    title: 'Higienização interna',
    instagramUrl: 'https://www.instagram.com/p/DNMXkm1vuQH/embed/',
  },
  {
    id: 'v4',
    title: 'PPF em capô',
    instagramUrl: 'https://www.instagram.com/p/DQrfJWCDfWo/embed/',
  },
]

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Ricardo Almeida',
    rating: 5,
    text: 'Vitrificação impecável. O brilho ficou surreal e a equipe explicou todo o processo. Carro parece novo em folha.',
  },
  {
    id: 'r2',
    name: 'Fernanda Costa',
    rating: 5,
    text: 'Fiz o polimento corretivo em uma BMW preta que estava cheia de swirls. Resultado perfeito, zero reclamações.',
  },
  {
    id: 'r3',
    name: 'Eduardo Santos',
    rating: 5,
    text: 'Atendimento pontual e transparente. A higienização interna eliminou completamente o odor que nenhuma lavagem resolveu.',
  },
  {
    id: 'r4',
    name: 'Mariana Lopes',
    rating: 5,
    text: 'Aplicaram PPF no meu carro 0km. Trabalho minucioso, sem bolhas e com acabamento invisível. Recomendo demais.',
  },
  {
    id: 'r5',
    name: 'Carlos Mendes',
    rating: 5,
    text: 'Insulfilm nanocerâmico de primeira. O carro ficou muito mais fresco e o visual ficou sensacional.',
  },
  {
    id: 'r6',
    name: 'Beatriz Rocha',
    rating: 5,
    text: 'Restauraram o volante em couro do meu carro. Ficou melhor do que o original. Profissionais de verdade.',
  },
]
