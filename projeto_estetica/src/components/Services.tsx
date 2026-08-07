'use client'

import Link from 'next/link'
import type { Service } from '@/lib/mock-data'

interface Props {
  services: Service[]
  onBookService: (service: string) => void
}

export default function Services({ services, onBookService }: Props) {
  return (
    <section id="services" className="py-20 bg-garage-dark">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Nossas Soluções <span className="text-garage-red">Premium</span>
        </h2>
        <p className="text-garage-muted text-center max-w-2xl mx-auto mb-12 text-lg">
          Técnicas avançadas e produtos de alta qualidade para transformar e proteger seu veículo contra o tempo.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-garage-card rounded-lg overflow-hidden border border-garage-border flex flex-col"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 text-garage-red">{service.title}</h3>
                <p className="text-garage-muted mb-5 flex-1">{service.description}</p>
                <Link
                  href="#booking"
                  onClick={() => onBookService(service.value)}
                  className="block w-full py-3 text-center border border-garage-red text-garage-red rounded hover:bg-garage-red hover:text-black transition-colors text-sm font-semibold"
                >
                  Agendar Este Serviço
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
