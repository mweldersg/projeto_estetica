'use client'

import { useState } from 'react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Service } from '@/lib/mock-data'

interface Props {
  initialService: string
  services: Service[]
}

export default function BookingForm({ initialService, services }: Props) {
  const [name, setName] = useState('')
  const [service, setService] = useState(initialService)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [prevInitial, setPrevInitial] = useState(initialService)

  if (initialService !== prevInitial) {
    setPrevInitial(initialService)
    setService(initialService)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    window.location.href = buildWhatsAppUrl({ name, service, vehicle, date, time })
  }

  return (
    <section id="booking" className="py-20 bg-garage-dark border-t border-garage-border">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="text-garage-red">Agende aqui!</span>
        </h2>
        <p className="text-garage-muted text-center mb-10 text-lg">
          Preencha os dados abaixo e finalize o pedido pelo WhatsApp.
        </p>

        <div className="bg-garage-card p-8 rounded-lg border border-garage-border shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="book-name" className="block text-sm font-semibold mb-2">Seu Nome</label>
              <input
                id="book-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. João Silva"
                required
                className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-red transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="book-vehicle" className="block text-sm font-semibold mb-2">Veículo & Ano</label>
                <input
                  id="book-vehicle"
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="ex. BMW 320i 2024"
                  required
                  className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-red transition-colors"
                />
              </div>
              <div>
                <label htmlFor="book-service" className="block text-sm font-semibold mb-2">Serviço</label>
                <select
                  id="book-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text focus:outline-none focus:border-garage-red transition-colors"
                >
                  <option value="">Selecione um serviço...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.value}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="book-date" className="block text-sm font-semibold mb-2">Data</label>
                <input
                  id="book-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text focus:outline-none focus:border-garage-red transition-colors"
                />
              </div>
              <div>
                <label htmlFor="book-time" className="block text-sm font-semibold mb-2">Horário</label>
                <input
                  id="book-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text focus:outline-none focus:border-garage-red transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-garage-red text-black font-bold uppercase rounded hover:bg-garage-red-hover transition-colors text-lg"
            >
              Agendar via WhatsApp
            </button>

            <p className="text-center text-sm text-garage-muted">
              Após enviar, você será redirecionado ao WhatsApp com a mensagem pronta.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
