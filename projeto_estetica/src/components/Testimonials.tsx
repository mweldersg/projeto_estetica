import type { Review } from '@/lib/mock-data'

interface Props {
  reviews: Review[]
}

export default function Testimonials({ reviews }: Props) {
  return (
    <section id="testimonials" className="py-20 bg-garage-dark">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Avaliações dos <span className="text-garage-gold">Nossos Clientes</span>
        </h2>
        <p className="text-garage-muted text-center max-w-2xl mx-auto mb-12 text-lg">
          Notas reais dos nossos clientes no Google.
        </p>

        {reviews.length === 0 ? (
          <p className="text-center text-garage-muted">Em breve.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-garage-card p-6 rounded-lg border border-garage-border flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-full bg-garage-gold text-black font-bold flex items-center justify-center">
                    {review.name.charAt(0)}
                  </span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-garage-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                </div>
                <p className="text-garage-muted flex-1 mb-5">"{review.text}"</p>
                <p className="font-semibold">{review.name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href="https://www.google.com/maps/place/Garage+765sp+-+Est%C3%A9tica+Automotiva+-+Sumar%C3%A9-SP/@-22.8059714,-47.2024581,17z/data=!4m6!3m5!1s0x94c8bfd7f9d9f47d:0x7a257308d80d7813!8m2!3d-22.8059714!4d-47.1998832!16s%2Fg%2F11js_zs_0p?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D#:~:text=21-,avalia%C3%A7%C3%B5es,-%22Foi%20incr%C3%ADvel%20o"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-garage-gold hover:bg-garage-gold-hover text-black font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Confira todas as avaliações do nosso serviço 5.0 estrelas no Google!
          </a>
        </div>
      </div>
    </section>
  )
}