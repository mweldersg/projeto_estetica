export function isValidOrder(value: unknown): { valid: boolean; parsed?: number; error?: string } {
  if (value === undefined || value === null) return { valid: true, parsed: undefined }
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN
  if (!Number.isInteger(num)) return { valid: false, error: 'order must be an integer' }
  if (num < 0 || num > 10000) return { valid: false, error: 'order must be between 0 and 10000' }
  return { valid: true, parsed: num }
}

export function isValidRating(value: unknown): { valid: boolean; parsed?: number; error?: string } {
  if (value === undefined || value === null) return { valid: false, error: 'rating is required' }
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN
  if (!Number.isInteger(num)) return { valid: false, error: 'rating must be an integer' }
  if (num < 1 || num > 5) return { valid: false, error: 'rating must be between 1 and 5' }
  return { valid: true, parsed: num }
}

export function isValidString(value: unknown, min: number, max: number): { valid: boolean; error?: string } {
  if (typeof value !== 'string') return { valid: false, error: 'must be a string' }
  const trimmed = value.trim()
  if (trimmed.length < min) return { valid: false, error: `must be at least ${min} characters` }
  if (trimmed.length > max) return { valid: false, error: `must be at most ${max} characters` }
  return { valid: true }
}

export function isValidUrl(value: unknown, maxLen = 500): { valid: boolean; error?: string } {
  if (typeof value !== 'string') return { valid: false, error: 'must be a string' }
  if (value.length > maxLen) return { valid: false, error: `URL too long (max ${maxLen})` }
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return { valid: false, error: 'URL must be http or https' }
    return { valid: true }
  } catch {
    return { valid: false, error: 'invalid URL' }
  }
}

export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(id)
}

// Semantics for admin-editable OPTIONAL fields:
//   undefined          -> field omitted from the request -> leave stored value unchanged
//   null or '' or '  ' -> clear the stored value (stored as SQL NULL)
//   otherwise          -> must be a string within [min, max]
export function isValidOptionalString(
  value: unknown,
  min: number,
  max: number
): { valid: boolean; parsed?: string | null; error?: string } {
  if (value === undefined) return { valid: true }
  if (value === null || (typeof value === 'string' && value.trim() === '')) return { valid: true, parsed: null }
  if (typeof value !== 'string') return { valid: false, error: 'must be a string' }
  const trimmed = value.trim()
  if (trimmed.length < min) return { valid: false, error: `must be at least ${min} characters` }
  if (trimmed.length > max) return { valid: false, error: `must be at most ${max} characters` }
  return { valid: true, parsed: trimmed }
}

// Validates newline-separated lists (one item per line, as edited in textareas).
// Accepts either a raw string (may contain \n) or an array of strings for API
// convenience. Empty result clears the field (null).
export function isValidLineList(
  value: unknown,
  maxItems = 20,
  maxItemLength = 150
): { valid: boolean; parsed?: string | null; error?: string } {
  if (value === undefined) return { valid: true }
  if (value === null) return { valid: true, parsed: null }

  let rawLines: unknown[]
  if (Array.isArray(value)) rawLines = value
  else if (typeof value === 'string') rawLines = value.split(/\r?\n/)
  else return { valid: false, error: 'must be a string or a list of strings' }

  if (rawLines.some((l) => typeof l !== 'string')) return { valid: false, error: 'list items must be strings' }

  const cleaned = (rawLines as string[]).map((l) => l.trim()).filter(Boolean)
  if (cleaned.length > maxItems) return { valid: false, error: `must have at most ${maxItems} items` }
  if (cleaned.some((l) => l.length > maxItemLength)) return { valid: false, error: `each item must be at most ${maxItemLength} characters` }

  return { valid: true, parsed: cleaned.length > 0 ? cleaned.join('\n') : null }
}
