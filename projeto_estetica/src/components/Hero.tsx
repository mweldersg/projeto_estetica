'use client'

import Link from 'next/link'

interface Props {
  onBookClick: () => void
}

export default function Hero({ onBookClick }: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center pt-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.95)), url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 uppercase tracking-wide">
          Seu Carro, <span className="text-garage-red">Impecável</span>, Protegido & Mais Bonito
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 font-light max-w-2xl mx-auto">
          Melhore a aparência do seu veículo com nosso detailing automotivo premium. Brilho intenso, proteção duradoura e um interior renovado para motoristas exigentes.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link
            href="#booking"
            onClick={onBookClick}
            className="px-8 py-4 bg-garage-red text-black font-bold uppercase rounded hover:bg-garage-red-hover transition-all shadow-lg hover:shadow-garage-red/30"
          >
            Agendar Avaliação
          </Link>
          <Link
            href="#services"
            className="px-8 py-4 border-2 border-garage-red text-garage-red font-bold uppercase rounded hover:bg-garage-red/10 transition-all"
          >
            Ver Serviços
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm font-semibold text-garage-red">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Brilho Intenso
          </span>
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Proteção Extrema
          </span>
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Valor Imediato
          </span>
        </div>
      </div>
    </section>
  )
}
