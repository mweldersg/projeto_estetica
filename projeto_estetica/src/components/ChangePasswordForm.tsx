'use client'

import { useState } from 'react'
import { apiChangePassword } from '@/lib/api'
import type { Admin } from '@/lib/api'

interface Props {
  user: Admin
  onClose: () => void
}

export default function ChangePasswordForm({ onClose }: Props) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem')
      return
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const data = await apiChangePassword(oldPassword, newPassword)

      if (data.success) {
        setSuccess(true)
        setTimeout(() => onClose(), 2000)
      } else {
        setError(data.error || 'Erro ao alterar senha')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div
        className="w-full max-w-md bg-garage-card border border-garage-border rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-5">Alterar Senha</h3>

        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-garage-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-garage-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-garage-text font-semibold">Senha alterada com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-garage-muted mb-1.5">Senha Atual</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-garage-muted mb-1.5">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                required
                className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-garage-muted mb-1.5">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-gold transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-garage-border rounded-lg text-garage-muted hover:text-garage-text hover:border-garage-gold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-garage-gold text-black font-semibold rounded-lg hover:bg-garage-gold-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
