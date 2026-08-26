'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Service } from '@/lib/mock-data'
import type { ServiceDetails } from '@/lib/serviceDetails'

interface Props {
  service: Service | null
  details: ServiceDetails | null
  open: boolean
  onClose: () => void
  onBook: (value: string) => void
}

export default function ServiceModal({ service, details, open, onClose, onBook }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    // focus close button
    const t = setTimeout(() => closeButtonRef.current?.focus(), 0)

    // body scroll lock
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !service) return null

  // fallback content if no details entry
  const longDesc = details?.longDescription ?? service.description
  const features = details?.features ?? []
  const duration = details?.duration
  const idealFor = details?.idealFor
  const includes = details?.includes

  function handleBook() {
    onBook(service!.value)
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      data-testid="service-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        data-testid="service-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-garage-border bg-garage-card shadow-2xl"
      >
        {/* Close button top-right */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Fechar modal"
          data-testid="service-modal-close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-garage-dark/80 text-garage-muted backdrop-blur hover:bg-garage-dark hover:text-garage-text border border-garage-border transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto">
          {/* Image header */}
          <div className="h-48 w-full shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }} aria-hidden="true" />

          <div className="p-6 sm:p-7">
            <h2 id="service-modal-title" className="pr-8 text-2xl font-bold text-garage-red">
              {service.title}
            </h2>
            <p data-testid="service-modal-description" className="mt-4 text-[15px] leading-relaxed text-garage-muted">
              {longDesc}
            </p>

            {features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-garage-text">O que está incluído</h3>
                <ul className="mt-3 space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-garage-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-garage-red" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(duration || idealFor) && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {duration && (
                  <div className="rounded-lg border border-garage-border bg-garage-dark p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-garage-muted">Duração</p>
                    <p className="mt-1 text-sm font-medium text-garage-text">{duration}</p>
                  </div>
                )}
                {idealFor && (
                  <div className="rounded-lg border border-garage-border bg-garage-dark p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-garage-muted">Ideal para</p>
                    <p className="mt-1 text-sm font-medium text-garage-text">{idealFor}</p>
                  </div>
                )}
              </div>
            )}

            {includes && includes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-garage-muted">Áreas / Pacotes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {includes.map((inc, i) => (
                    <span key={i} className="rounded-full border border-garage-border bg-garage-dark px-3 py-1 text-xs text-garage-muted">
                      {inc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#booking"
                onClick={handleBook}
                data-testid="service-modal-book"
                className="flex-1 rounded-lg bg-garage-red py-3.5 text-center text-sm font-bold uppercase text-black hover:bg-garage-red-hover transition-colors"
              >
                Agendar Este Serviço
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-garage-border py-3.5 text-sm font-semibold text-garage-muted hover:border-garage-red hover:text-garage-text transition-colors sm:flex-none sm:px-8"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
