export default function Benefits() {
  const benefits = [
    {
      icon: (
        <svg className="w-10 h-10 text-garage-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Proteção Duradoura',
      description: 'Produtos certificados que duram anos.'
    },
    {
      icon: (
        <svg className="w-10 h-10 text-garage-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Valorização',
      description: 'Recupere o valor de revenda do seu veículo.'
    },
    {
      icon: (
        <svg className="w-10 h-10 text-garage-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: 'Produtos Profissionais',
      description: 'Uso exclusivo de linhas premium de classe mundial.'
    },
    {
      icon: (
        <svg className="w-10 h-10 text-garage-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Atendimento Personalizado',
      description: 'Consultoria estética para suas necessidades específicas.'
    }
  ]

  return (
    <section className="py-20 bg-garage-card">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Por que escolher a <span className="text-garage-red">Garage 765</span>?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="text-center p-4">
              <div className="flex justify-center mb-4">{benefit.icon}</div>
              <h4 className="text-lg font-bold mb-2">{benefit.title}</h4>
              <p className="text-garage-muted text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
