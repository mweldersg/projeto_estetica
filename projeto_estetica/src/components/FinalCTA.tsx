'use client'

import Link from 'next/link'

interface Props {
  onBookClick: () => void
}

export default function FinalCTA({ onBookClick }: Props) {
  return (
    <section className="py-20 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.9)), url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-5">
          Pronto para ver seu carro novo <span className='text-garage-gold'> de novo</span>?
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Nossa agenda deste mês está quase lotada. Garanta seu lugar e transforme seu veículo.
        </p>
        <Link
          href="#booking"
          onClick={onBookClick}
          className="inline-flex items-center gap-2 px-8 py-4 bg-garage-gold text-black font-bold uppercase rounded hover:bg-garage-gold-hover transition-all text-lg"
        >
          Agendar Avaliação Agora
        </Link>
        <p className="text-sm text-gray-500 mt-5">Preencha o formulário e confirmaremos seu agendamento.</p>
      </div>
    </section>
  )
}
