import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SERVICE_DETAILS, getServiceDetails } from '../../src/lib/serviceDetails'
import type { Service } from '../../src/lib/mock-data'

function makeService(overrides: Partial<Service>): Service {
  return {
    id: 'test',
    title: 'Test',
    description: 'Desc curta',
    image: 'https://example.com/img.jpg',
    value: 'Test',
    ...overrides,
  }
}

test('all known service ids have details with required fields', () => {
  for (const [key, details] of Object.entries(SERVICE_DETAILS)) {
    assert.ok(details.longDescription.length > 50, `${key} longDescription too short`)
    assert.ok(details.features.length >= 3, `${key} features < 3`)
    assert.ok(typeof details.longDescription === 'string')
  }
})

test('each SERVICE_DETAILS entry has unique longDescription', () => {
  const descs = Object.values(SERVICE_DETAILS).map((d) => d.longDescription)
  const uniq = new Set(descs)
  assert.equal(uniq.size, descs.length, 'longDescriptions must be unique per service')
})

test('getServiceDetails maps known ids correctly', () => {
  const cases: Array<[string, string]> = [
    ['vitrificacao', 'vidro líquido'],
    ['lavagem_detalhada', 'snow foam'],
    ['lavagem_manutencao', 'dois baldes'],
    ['volante', 'hidratação'],
    ['ppf', 'autorreparação'],
    ['polimento', 'swirls'],
    ['higienizacao', 'ozônio'],
    ['insulfilm', 'nanocerâmica'],
    ['revestimento', 'Micropintura'],
  ]
  for (const [id, keyword] of cases) {
    const svc = makeService({ id, title: id, value: id })
    const details = getServiceDetails(svc)
    assert.ok(details, `details missing for ${id}`)
    assert.ok(details!.longDescription.includes(keyword) || details!.features.join(' ').includes(keyword), `${id} should contain "${keyword}"`)
  }
})

test('getServiceDetails handles aliases via value/title normalization', () => {
  // DB uses "Vitrificação de Pintura" as value
  const svc = makeService({ id: 'random-id', title: 'Vitrificação de Pintura', value: 'Vitrificação de Pintura' })
  const details = getServiceDetails(svc)
  assert.ok(details)
  assert.ok(details!.longDescription.includes('vidro líquido'))

  const svc2 = makeService({ id: 'xyz', title: 'PPF (Paint Protection Film)', value: 'PPF (Paint Protection Film)' })
  const details2 = getServiceDetails(svc2)
  assert.ok(details2)
  assert.ok(details2!.features.join(' ').includes('autorreparação') || details2!.longDescription.includes('autorreparação'))
})

test('getServiceDetails returns null for unknown service', () => {
  const svc = makeService({ id: 'unknown_xyz', title: 'Serviço Inexistente', value: 'Inexistente' })
  assert.equal(getServiceDetails(svc), null)
})

test('details for each service contain Portuguese-specific content (spot check)', () => {
  const svc = makeService({ id: 'vitrificacao', title: 'Vitrificação de Pintura', value: 'Vitrificação de Pintura' })
  const d = getServiceDetails(svc)!
  assert.ok(d.duration)
  assert.ok(d.idealFor)
})

// --- Admin-edited ("Saiba mais") DB content takes precedence ---

const ADMIN_COPY = 'DESCRIÇÃO PERSONALIZADA DO PAINEL ADMINISTRATIVO COM CONTEÚDO SUFICIENTE.'

test('admin-edited longDescription overrides the built-in copy', () => {
  const svc = makeService({
    id: 'vitrificacao',
    title: 'Vitrificação de Pintura',
    value: 'Vitrificação de Pintura',
    longDescription: ADMIN_COPY,
    features: 'Item Alfa\nItem Beta\n',
    duration: '5 horas',
    idealFor: 'Todos os veículos',
    includes: '',
  })
  const d = getServiceDetails(svc)!
  assert.equal(d.longDescription, ADMIN_COPY)
  assert.deepEqual(d.features, ['Item Alfa', 'Item Beta'])
  assert.equal(d.duration, '5 horas')
  assert.equal(d.idealFor, 'Todos os veículos')
  // Blank list stored in DB clears that section
  assert.deepEqual(d.includes, [])
})

test('null / blank longDescription falls back to built-in copy', () => {
  for (const longDescription of [null, undefined, '   '] as Array<string | null | undefined>) {
    const svc = makeService({ id: 'vitrificacao', title: 'Vitrificação de Pintura', value: 'Vitrificação de Pintura', longDescription })
    const d = getServiceDetails(svc)!
    assert.ok(d.longDescription.includes('vidro líquido'), `fallback expected for: ${String(longDescription)}`)
  }
})

test('override applies even when there is no built-in entry for the service', () => {
  const svc = makeService({ id: 'servico_novo_xyz', title: 'Serviço Novo', value: 'Serviço Novo', longDescription: ADMIN_COPY })
  const d = getServiceDetails(svc)
  assert.ok(d)
  assert.equal(d!.longDescription, ADMIN_COPY)
})

// --- Validators used by the services API ---

import { isValidOptionalString, isValidLineList } from '../../src/lib/validate'

test('isValidOptionalString: undefined unchanged, blank clears, bounds enforced', () => {
  assert.deepEqual(isValidOptionalString(undefined, 1, 10), { valid: true })
  assert.deepEqual(isValidOptionalString('', 1, 10), { valid: true, parsed: null })
  assert.deepEqual(isValidOptionalString(null, 1, 10), { valid: true, parsed: null })
  const ok = isValidOptionalString('  conteúdo  ', 1, 4000)
  assert.ok(ok.valid && ok.parsed === 'conteúdo')
  assert.equal(isValidOptionalString(42, 1, 10).valid, false)
  assert.equal(isValidOptionalString('a'.repeat(4001), 1, 4000).valid, false)
})

test('isValidLineList: newline string, array input, empty clears, item limits enforced', () => {
  const joined = isValidLineList('Item A\n\n Item B \n')
  assert.ok(joined.valid && joined.parsed === 'Item A\nItem B')
  const arr = isValidLineList(['X', 'Y'])
  assert.ok(arr.valid && arr.parsed === 'X\nY')
  assert.deepEqual(isValidLineList(''), { valid: true, parsed: null })
  assert.deepEqual(isValidLineList([]), { valid: true, parsed: null })
  assert.deepEqual(isValidLineList(undefined), { valid: true })
  assert.equal(isValidLineList(123 as unknown).valid, false)
  assert.equal(isValidLineList([1, 2] as unknown[] as unknown).valid, false)
  assert.equal(isValidLineList('a\nb\nc'.repeat(8), 3).valid, false) // too many items
  assert.equal(isValidLineList('x'.repeat(151)).valid, false) // item too long
})
