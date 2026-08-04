'use client'

import { useState } from 'react'
import type { Service, Video, Review } from '@/lib/mock-data'
import Navbar from './Navbar'
import Hero from './Hero'
import PainPoints from './PainPoints'
import Services from './Services'
import VideoCarousel from './VideoCarousel'
import BookingForm from './BookingForm'
import Benefits from './Benefits'
import Testimonials from './Testimonials'
import HowItWorks from './HowItWorks'
import FAQ from './FAQ'
import FinalCTA from './FinalCTA'
import Footer from './Footer'
import WhatsAppPopup from './WhatsAppPopup'
import Instagram from './Instagram'

interface Props {
  services: Service[]
  videos: Video[]
  reviews: Review[]
}

export default function LandingPage({ services, videos, reviews }: Props) {
  const [selectedService, setSelectedService] = useState('')

  return (
    <div className="min-h-screen bg-garage-dark">
      <Navbar />
      <Hero onBookClick={() => setSelectedService('Avaliação Completa')} />
      <PainPoints />
      <Services services={services} onBookService={setSelectedService} />
      
      <section id="videos-instagram" className="py-20 bg-garage-card">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-16 lg:gap-x-12">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 leading-tight">
                Transformações em <span className="text-garage-gold">Vídeo</span>
              </h2>
              <p className="text-garage-muted text-center max-w-2xl mx-auto mb-8 text-lg">
                Veja o resultado <span className="text-garage-gold">real</span> dos nossos trabalhos em detalhe.
              </p>
              <VideoCarousel videos={videos} />
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 leading-tight">
                Acompanhe nosso <span className="text-garage-gold">Instagram!</span>
              </h2>
              <p
                aria-hidden="true"
                className="hidden lg:block invisible text-garage-muted text-center max-w-2xl mx-auto mb-8 text-lg"
              >
                Veja o resultado real dos nossos trabalhos em detalhe.
              </p>
              <Instagram />
            </div>
          </div>
        </div>
      </section>
      
      <BookingForm services={services} initialService={selectedService} />
      <Benefits />
      <Testimonials reviews={reviews} />
      <HowItWorks />
      <FAQ />
      <FinalCTA onBookClick={() => setSelectedService('Avaliação Completa')} />
      <Footer />
      <WhatsAppPopup />
    </div>
  )
}