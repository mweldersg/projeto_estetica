export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Preencha o formulário',
      description: 'Nos diga qual é seu carro e o que você quer fazer.'
    },
    {
      number: 2,
      title: 'Agende a Avaliação',
      description: 'Nossa equipe entra em contato pelo WhatsApp para confirmar o agendamento.'
    },
    {
      number: 3,
      title: 'Execução Premium',
      description: 'Seu carro é tratado com cuidado minucioso em nosso estúdio.'
    },
    {
      number: 4,
      title: 'Carro Renovado',
      description: 'Você retira seu veículo parecendo novo e protegido.'
    }
  ]

  return (
    <section className="py-20 bg-garage-dark">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Um Processo <span className="text-garage-red">Simples & Transparente</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-14 h-14 bg-garage-red text-black rounded-full flex items-center justify-center text-xl font-extrabold mx-auto mb-4">
                {step.number}
              </div>
              <h4 className="text-lg font-bold mb-2">{step.title}</h4>
              <p className="text-garage-muted text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
