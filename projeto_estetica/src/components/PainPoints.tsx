export default function PainPoints() {
  const pains = [
    {
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      title: 'Pintura Opaca e Arranhada',
      description: 'Lavagem incorreta, sol, chuva ácida e fezes de pássaros criam micro-ranhuras e corroem o verniz original.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Interior Desgastado',
      description: 'Bancos sujos, maus odores, plásticos ressecados e bactérias acumuladas afetam sua saúde e conforto.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Desvalorização na Revenda',
      description: 'Um veículo mal conservado pode perder até 20% do seu valor de mercado na revenda.'
    }
  ]

  return (
    <section className="py-20 bg-garage-card">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          O tempo e o uso diário estão <span className="text-garage-red">destruindo</span> seu carro?
        </h2>
        <p className="text-garage-muted text-center max-w-2xl mx-auto mb-12 text-lg">
          Mesmo com lavagens frequentes, carros sem proteção profissional sofrem desgaste que desvaloriza o veículo e tira o prazer de dirigir.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {pains.map((pain, i) => (
            <div
              key={i}
              className="bg-garage-dark p-8 rounded-lg border border-garage-border text-center hover:border-garage-red transition-colors"
            >
              <div className="flex justify-center mb-5">{pain.icon}</div>
              <h3 className="text-xl font-bold mb-3">{pain.title}</h3>
              <p className="text-garage-muted">{pain.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
