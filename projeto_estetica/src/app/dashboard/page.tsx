'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiMe, apiLogout, apiGetItems, apiCreateItem, apiUpdateItem, apiDeleteItem } from '@/lib/api'
import type { Admin } from '@/lib/api'
import ContentManager from '@/components/ContentManager'
import type { Item } from '@/components/ContentManager'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import Link from 'next/link'

const TABS = [
  { id: 'services', label: 'Serviços' },
  { id: 'videos', label: 'Vídeos' },
  { id: 'reviews', label: 'Depoimentos' },
  { id: 'faqs', label: 'Perguntas Frequentes' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('services')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [serviceItems, setServiceItems] = useState<Item[]>([])
  const [videoItems, setVideoItems] = useState<Item[]>([])
  const [reviewItems, setReviewItems] = useState<Item[]>([])
  const [faqItems, setFaqItems] = useState<Item[]>([])

  async function refresh() {
    const [services, videos, reviews, faqs] = await Promise.all([
      apiGetItems<Item>('services'),
      apiGetItems<Item>('videos'),
      apiGetItems<Item>('reviews'),
      apiGetItems<Item>('faqs'),
    ])
    setServiceItems(services)
    setVideoItems(videos)
    setReviewItems(reviews)
    setFaqItems(faqs)
  }

  useEffect(() => {
    async function load() {
      const u = await apiMe()
      if (!u) {
        router.push('/painel')
        return
      }
      setUser(u)
      await refresh()
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    await apiLogout()
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-garage-dark flex items-center justify-center">
        <div className="text-garage-muted">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-garage-dark">
      <header className="border-b border-garage-border bg-garage-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Garage <span className="text-garage-red">765</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-garage-muted hover:text-garage-text transition-colors"
            >
              ← Voltar ao Início
            </Link>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-sm text-garage-muted hover:text-garage-text transition-colors"
            >
              Alterar Senha
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-garage-muted hover:text-garage-text transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-2">Painel de Conteúdo</h2>
        <p className="text-garage-muted text-sm mb-8">
          Gerencie o conteúdo exibido no site.
        </p>

        <div className="flex gap-2 mb-8 border-b border-garage-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-garage-red text-garage-red'
                  : 'border-transparent text-garage-muted hover:text-garage-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'services' && (
          <ContentManager
            title="Serviços"
            fields={[
              { key: 'title', label: 'Título', required: true },
              { key: 'description', label: 'Descrição', type: 'textarea', required: true },
              { key: 'value', label: 'Valor (usado no agendamento)', required: true },
              {
                key: 'longDescription',
                label: 'Descrição detalhada (Saiba mais)',
                type: 'textarea',
                optional: true,
                placeholder: 'Texto completo exibido no modal. Deixe vazio para usar o texto padrão.',
              },
              { key: 'duration', label: 'Duração', optional: true, placeholder: 'ex. 2 a 3 horas' },
              { key: 'idealFor', label: 'Ideal para', optional: true, placeholder: 'ex. Carros novos ou seminovos' },
              { key: 'features', label: 'Diferenciais (um por linha)', type: 'textarea', optional: true },
              { key: 'includes', label: 'Áreas / Pacotes (um por linha)', type: 'textarea', optional: true },
            ]}
            items={serviceItems}
            onAdd={(item) => apiCreateItem('services', item).then(refresh)}
            onUpdate={(item) => apiUpdateItem('services', String(item.id), item).then(refresh)}
            onDelete={(id) => apiDeleteItem('services', id).then(refresh)}
            createEmpty={() => ({ id: crypto.randomUUID(), title: '', description: '', value: '' })}
            renderSummary={(item) => (
              <div>
                <p className="font-semibold truncate">{String(item.title)}</p>
                <p className="text-sm text-garage-muted truncate">{String(item.description)}</p>
              </div>
            )}
          />
        )}

        {tab === 'videos' && (
          <ContentManager
            title="Vídeos"
            fields={[
              { key: 'title', label: 'Título', required: true },
              {
                key: 'instagramUrl',
                label: 'Instagram Link',
                placeholder: 'https://www.instagram.com/reel/ID/?igsh=123',
                required: true,
              },
            ]}
            items={videoItems}
            onAdd={(item) => apiCreateItem('videos', item).then(refresh)}
            onUpdate={(item) => apiUpdateItem('videos', String(item.id), item).then(refresh)}
            onDelete={(id) => apiDeleteItem('videos', id).then(refresh)}
            createEmpty={() => ({ id: crypto.randomUUID(), title: '', instagramUrl: '' })}
            renderSummary={(item) => (
              <div>
                <p className="font-semibold truncate">{String(item.title)}</p>
                <p className="text-sm text-garage-muted truncate">{String(item.instagramUrl)}</p>
              </div>
            )}
          />
        )}

        {tab === 'reviews' && (
          <ContentManager
            title="Depoimentos"
            fields={[
              { key: 'name', label: 'Nome do Cliente', required: true },
              {
                key: 'rating',
                label: 'Nota (1 a 5)',
                type: 'select',
                options: ['1', '2', '3', '4', '5'],
                required: true,
              },
              { key: 'text', label: 'Texto do Depoimento', type: 'textarea', required: true },
            ]}
            items={reviewItems}
            onAdd={(item) => apiCreateItem('reviews', item).then(refresh)}
            onUpdate={(item) => apiUpdateItem('reviews', String(item.id), item).then(refresh)}
            onDelete={(id) => apiDeleteItem('reviews', id).then(refresh)}
            createEmpty={() => ({ id: crypto.randomUUID(), name: '', rating: 5, text: '' })}
            renderSummary={(item) => (
              <div>
                <p className="font-semibold truncate">
                  {String(item.name)} <span className="text-garage-red">{"★".repeat(Number(item.rating))}</span>
                </p>
                <p className="text-sm text-garage-muted truncate">{String(item.text)}</p>
              </div>
            )}
          />
        )}

        {tab === 'faqs' && (
          <ContentManager
            title="Perguntas Frequentes"
            fields={[
              { key: 'question', label: 'Pergunta', required: true },
              { key: 'answer', label: 'Resposta', type: 'textarea', required: true },
            ]}
            items={faqItems}
            onAdd={(item) => apiCreateItem('faqs', item).then(refresh)}
            onUpdate={(item) => apiUpdateItem('faqs', String(item.id), item).then(refresh)}
            onDelete={(id) => apiDeleteItem('faqs', id).then(refresh)}
            createEmpty={() => ({ id: crypto.randomUUID(), question: '', answer: '' })}
            renderSummary={(item) => (
              <div>
                <p className="font-semibold truncate">{String(item.question)}</p>
                <p className="text-sm text-garage-muted truncate">{String(item.answer)}</p>
              </div>
            )}
          />
        )}
      </main>

      {showPasswordForm && (
        <ChangePasswordForm
          user={user}
          onClose={() => setShowPasswordForm(false)}
        />
      )}
    </div>
  )
}
