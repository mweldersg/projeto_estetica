import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from '../../src/lib/whatsapp'

const BOOKING = {
  name: 'João Silva',
  phone: '(11) 99999-9999',
  service: 'Vitrificação de Pintura',
  vehicle: 'BMW 320i 2024',
  date: '2026-10-15',
  time: '09:00',
}

test('WHATSAPP_NUMBER has default for development', () => {
  assert.match(WHATSAPP_NUMBER, /^\d+$/)
})

test('builds wa.me deep link with formatted message', () => {
  const url = buildWhatsAppUrl(BOOKING)
  assert.ok(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`))

  const params = new URLSearchParams(url.split('?')[1])
  const message = params.get('text') ?? ''

  assert.ok(message.includes('João Silva'))
  assert.ok(message.includes('Vitrificação de Pintura'))
  assert.ok(message.includes('BMW 320i 2024'))
  assert.ok(message.includes('15/10/2026'))
  assert.ok(message.includes('09:00'))
})

test('message is URL-encoded', () => {
  const url = buildWhatsAppUrl(BOOKING)
  assert.ok(!url.includes('João Silva'))
  assert.ok(url.includes('Jo%C3%A3o'))
})
