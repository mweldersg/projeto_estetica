'use client'

import { useState } from 'react'
import type { Faq } from '@/lib/mock-data'

interface Props {
  faqs: Faq[]
}

export default function FAQ({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (faqs.length === 0) return null

  return (
    <section className="py-20 bg-garage-card">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Perguntas <span className="text-garage-red">Frequentes</span>
        </h2>

        <div>
          {faqs.map((faq, i) => (
            <div
              key={faq.id}
              className="border-b border-garage-border cursor-pointer"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex justify-between items-center py-5">
                <span className="text-lg font-semibold pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-garage-red shrink-0 transition-transform ${openIndex === i ? 'rotate-45' : ''}`}
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
