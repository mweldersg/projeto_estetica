'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { apiLogin, apiMe } from '@/lib/api'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiMe().then((user) => {
      if (user) router.replace('/dashboard')
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiLogin({ phone, password })

      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Falha no login')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-garage-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            Garage <span className="text-garage-red">765</span>
          </Link>
          <p className="text-garage-muted mt-2">Área do Administrador</p>
        </div>

        <div className="bg-garage-card border border-garage-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-garage-muted mb-1.5">
                Número de Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setError('')
                }}
                placeholder="(11) 99999-9999"
                required
                className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-garage-muted mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-red transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-garage-red text-black font-semibold rounded-lg hover:bg-garage-red-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-garage-dark flex items-center justify-center">
        <div className="text-garage-muted">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
