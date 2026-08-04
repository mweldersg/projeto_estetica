'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'Quanto tempo dura a vitrificação de pintura?',
    answer: 'Dependendo do revestimento cerâmico escolhido e do cuidado na lavagem, a proteção pode durar de 1 a 3 anos.'
  },
  {
    question: 'O polimento remove arranhuras profundas?',
    answer: 'O polimento técnico remove arranhuras superficiais no verniz. Arranhuras que atingiram a pintura ou metal requerem micropintura.'
  },
  {
    question: 'Quanto tempo leva a higienização interna?',
    answer: 'O serviço completo leva de 6 a 8 horas, garantindo limpeza profunda e secagem adequada.'
  },
  {
    question: 'Quais formas de pagamento vocês aceitam?',
    answer: 'Aceitamos PIX, cartões de débito e crédito, com opções de parcelamento para facilitar seu investimento.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-garage-card">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Perguntas <span className="text-garage-gold">Frequentes</span>
        </h2>

        <div>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-b border-garage-border cursor-pointer"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex justify-between items-center py-5">
                <span className="text-lg font-semibold pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-garage-gold shrink-0 transition-transform ${openIndex === i ? 'rotate-45' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40 pb-5' : 'max-h-0'}`}
              >
                <p className="text-garage-muted">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
