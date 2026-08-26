export interface Admin {
  id: string
  phone: string
}

export async function apiLogin(data: { phone?: string; username?: string; password?: string }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function apiLogout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' })
  return res.json()
}

export async function apiMe() {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = await res.json()
  return data.user as Admin
}

export async function apiChangePassword(oldPassword: string, newPassword: string) {
  const res = await fetch('/api/auth/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword })
  })
  return res.json()
}

export async function apiGetItems<T>(resource: string): Promise<T[]> {
  const res = await fetch(`/api/${resource}`)
  if (!res.ok) throw new Error('Falha ao carregar')
  const data = await res.json()
  return data.items as T[]
}

export async function apiCreateItem(resource: string, item: Record<string, unknown>) {
  const res = await fetch(`/api/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
  if (!res.ok) throw new Error('Falha ao salvar')
}

export async function apiUpdateItem(resource: string, id: string, item: Record<string, unknown>) {
  const res = await fetch(`/api/${resource}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
  if (!res.ok) throw new Error('Falha ao salvar')
}

export async function apiDeleteItem(resource: string, id: string) {
  const res = await fetch(`/api/${resource}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao excluir')
}
