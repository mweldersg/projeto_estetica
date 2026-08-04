'use client'

import { useState } from 'react'
import { WHATSAPP_NUMBER } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

export default function WhatsAppPopup() {
  const [open, setOpen] = useState(false)

  const href = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="max-w-[260px] bg-garage-card border border-garage-border rounded-2xl shadow-2xl p-4">
          <p className="text-sm text-garage-text">
            Ficou com alguma dúvida? Entre em contato!
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-garage-success text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Conversar no WhatsApp
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar WhatsApp' : 'Falar com a gente no WhatsApp'}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-garage-success text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </button>
    </div>
  )
}