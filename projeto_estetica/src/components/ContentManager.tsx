'use client'

import { useState } from 'react'
import { apiUpload } from '@/lib/api'

export type Item = Record<string, unknown>

export interface FieldConfig {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'file'
  options?: string[]
  placeholder?: string
  required?: boolean
  optional?: boolean
  accept?: string
}

interface Props {
  title: string
  fields: FieldConfig[]
  items: Item[]
  onAdd: (item: Item) => Promise<void>
  onUpdate: (item: Item) => Promise<void>
  onDelete: (id: string) => Promise<void>
  createEmpty: () => Item
  renderSummary: (item: Item) => React.ReactNode
  renderPreview?: (item: Item) => React.ReactNode
}

export default function ContentManager({
  title,
  fields,
  items,
  onAdd,
  onUpdate,
  onDelete,
  createEmpty,
  renderSummary,
  renderPreview,
}: Props) {
  const [draft, setDraft] = useState<Item | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function askDelete(item: Item) {
    setDeleteError('')
    setDeleteTarget(item)
  }

  function closeDelete() {
    setDeleteTarget(null)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      await onDelete(String(deleteTarget.id))
      closeDelete()
    } catch {
      setDeleteError('Erro ao excluir. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleFile(field: FieldConfig, file: File) {
    setUploadingKey(field.key)
    setError('')
    try {
      const currentUrl = draft ? String(draft[field.key] ?? '') : ''
      const { url } = await apiUpload(file, currentUrl || undefined)
      setDraft((d) => (d ? { ...d, [field.key]: url } : d))
    } catch {
      setError(`Falha no upload de "${field.label}". Tente novamente.`)
    } finally {
      setUploadingKey(null)
    }
  }

  function openCreate() {
    setDraft(createEmpty())
    setIsNew(true)
    setError('')
  }

  function openEdit(item: Item) {
    setDraft({ ...item })
    setIsNew(false)
    setError('')
  }

  function close() {
    setDraft(null)
    setError('')
  }

  const isUploading = uploadingKey !== null
  const requiredUploadMissing = isNew
    ? fields.some(
        (field) =>
          field.type === 'file' &&
          field.required &&
          !String(draft?.[field.key] ?? '').trim(),
      )
    : false
  const canSubmit = !saving && !isUploading && !requiredUploadMissing

  async function save() {
    if (!draft) return

    for (const field of fields) {
      if (field.required && !String(draft[field.key]).trim()) {
        setError(`Preencha o campo "${field.label}"`)
        return
      }
    }
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        await onAdd(draft)
      } else {
        await onUpdate(draft)
      }
      close()
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-garage-gold text-black font-semibold rounded-lg hover:bg-garage-gold-hover transition-colors text-sm"
        >
          Adicionar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-garage-card rounded-lg border border-garage-border">
          <p className="text-garage-muted">Nenhum item ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={String(item.id)}
              className="bg-garage-card border border-garage-border rounded-lg p-4 flex items-center gap-4"
            >
              {renderPreview && renderPreview(item)}
              <div className="flex-1 min-w-0">{renderSummary(item)}</div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="px-3 py-1.5 text-sm border border-garage-border rounded-md text-garage-muted hover:text-garage-text hover:border-garage-gold transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => askDelete(item)}
                  className="px-3 py-1.5 text-sm border border-garage-border rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50" onClick={close}>
          <div
            className="w-full max-w-md bg-garage-card border border-garage-border rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-5">
              {isNew ? `Novo item - ${title}` : `Editar item - ${title}`}
            </h3>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label htmlFor={field.key} className="block text-sm font-medium text-garage-muted mb-1.5">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      value={String(draft[field.key] ?? '')}
                      onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-gold transition-colors"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.key}
                      value={String(draft[field.key] ?? '')}
                      onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text focus:outline-none focus:border-garage-gold transition-colors"
                    >
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'file' ? (
                    <div>
                      <input
                        id={field.key}
                        type="file"
                        accept={field.accept}
                        disabled={uploadingKey === field.key}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFile(field, file)
                        }}
                        className="w-full text-sm text-garage-muted file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border file:border-garage-border file:bg-garage-dark file:text-garage-text file:cursor-pointer hover:file:border-garage-gold transition-colors"
                      />
                      {uploadingKey === field.key ? (
                        <p className="text-sm text-garage-gold mt-1.5">Enviando arquivo...</p>
                      ) : String(draft[field.key] ?? '').trim() ? (
                        <p className="text-sm text-garage-muted mt-1.5 truncate">Arquivo enviado</p>
                      ) : null}
                    </div>
                  ) : (
                    <input
                      id={field.key}
                      type="text"
                      value={String(draft[field.key] ?? '')}
                      onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-garage-dark border border-garage-border rounded-lg text-garage-text placeholder:text-garage-muted/50 focus:outline-none focus:border-garage-gold transition-colors"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  className="flex-1 py-3 border border-garage-border rounded-lg text-garage-muted hover:text-garage-text hover:border-garage-gold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSubmit}
                  title={requiredUploadMissing ? 'Envie o arquivo para habilitar' : undefined}
                  className="flex-1 py-3 bg-garage-gold text-black font-semibold rounded-lg hover:bg-garage-gold-hover transition-colors disabled:opacity-50 disabled:hover:bg-garage-gold disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : isNew ? 'Criar' : 'Salvar'}
                </button>
              </div>
              {requiredUploadMissing && (
                <p className="text-sm text-garage-muted">
                  Envie o arquivo para habilitar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50" onClick={closeDelete}>
          <div
            className="w-full max-w-md bg-garage-card border border-garage-border rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-5">Excluir item</h3>
            {renderPreview && (
              <div className="mb-4 flex justify-center">{renderPreview(deleteTarget)}</div>
            )}
            <div className="mb-4 rounded-lg border border-garage-border bg-garage-dark p-3">
              {renderSummary(deleteTarget)}
            </div>
            <p className="mb-4 text-sm text-garage-muted">
              Esta ação não pode ser desfeita. O arquivo no Google Drive também será removido.
            </p>
            {deleteError && <p className="mb-4 text-sm text-red-400">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-lg border border-garage-border text-garage-muted hover:text-garage-text hover:border-garage-gold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
