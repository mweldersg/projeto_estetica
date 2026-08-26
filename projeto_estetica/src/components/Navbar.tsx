'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { apiMe } from '@/lib/api'
import { instagram, INSTAGRAM_URL } from '@/lib/mock-data'
import { WHATSAPP_NUMBER } from '@/lib/whatsapp'
import { InstagramIcon, WhatsAppIcon } from './icons'

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    apiMe().then((user) => setIsAdmin(Boolean(user)))
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-garage-dark/90 backdrop-blur-sm border-b border-garage-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full overflow-hidden border border-garage-red shrink-0">
            <Image
              src={instagram.avatar}
              alt="Garage 765"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </span>
          <span className="text-xl font-bold">
            Garage <span className="text-garage-red">765</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2.5 text-garage-muted hover:text-garage-red rounded-lg transition-colors"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="p-2.5 text-garage-muted hover:text-garage-red rounded-lg transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>
          {isAdmin && (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm border border-garage-red text-garage-red rounded-lg hover:bg-garage-red hover:text-black transition-colors"
            >
              Painel
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}