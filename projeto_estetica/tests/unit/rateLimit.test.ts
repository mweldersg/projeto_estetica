import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { getClientIp, normalizePhoneForLimit } from '../../src/lib/rateLimit'

function mockRequest(headers: Record<string, string>, ip?: string): Request {
  const h = new Headers()
  for (const [k, v] of Object.entries(headers)) h.set(k, v)
  const req = { headers: h, ip } as unknown as Request & { ip?: string }
  // Also set ip via property if provided
  if (ip) (req as unknown as Record<string, unknown>).ip = ip
  return req as Request
}

describe('getClientIp — client-controlled headers are not trusted', () => {
  test('prefers request.ip over x-forwarded-for', () => {
    const req = mockRequest({ 'x-forwarded-for': '1.1.1.1' }, '2.2.2.2')
    assert.equal(getClientIp(req), '2.2.2.2')
  })

  test('ignores x-real-ip when no trusted request.ip is present (client-spoofable)', () => {
    const req = mockRequest({ 'x-real-ip': '3.3.3.3', 'x-forwarded-for': '1.1.1.1' })
    assert.equal(getClientIp(req), 'unknown')
  })

  test('ignores x-forwarded-for when no trusted request.ip is present', () => {
    const req = mockRequest({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 10.0.0.1' })
    assert.equal(getClientIp(req), 'unknown')
  })

  test('single spoofed x-forwarded-for is not trusted (no ip available)', () => {
    const req = mockRequest({ 'x-forwarded-for': '1.1.1.1' })
    assert.equal(getClientIp(req), 'unknown')
  })

  test('attacker rotating spoofed x-forwarded-for cannot create new IP buckets (rate limit bypass attempt)', () => {
    // With no trusted ip, every spoofed header must map to the SAME shared bucket;
    // otherwise an attacker could rotate values to create unlimited keys and
    // bypass per-IP rate limiting.
    assert.equal(getClientIp(mockRequest({ 'x-forwarded-for': 'spoofed-1, 10.0.0.99' })), 'unknown')
    assert.equal(getClientIp(mockRequest({ 'x-forwarded-for': 'spoofed-2, 10.0.0.99' })), 'unknown')
    assert.equal(getClientIp(mockRequest({ 'x-forwarded-for': 'spoofed-3, 10.0.0.99' })), 'unknown')
    assert.equal(getClientIp(mockRequest({ 'x-forwarded-for': '9.9.9.9' })), 'unknown')
    // Sanity: these differ from any real socket IP too.
    assert.notEqual('unknown', '10.0.0.99')
  })

  test('falls back to unknown when no headers or ip', () => {
    const req = mockRequest({})
    assert.equal(getClientIp(req), 'unknown')
  })

  test('leftmost spoof is ignored when a trusted socket ip exists — attacker cannot bypass', () => {
    // Even with spoofed leftmost x-forwarded-for, a rotating first entry cannot
    // change the key: both resolve to the trusted request.ip.
    assert.equal(
      getClientIp(mockRequest({ 'x-forwarded-for': '1.1.1.1, 10.0.0.1' }, '10.0.0.99')),
      getClientIp(mockRequest({ 'x-forwarded-for': '2.2.2.2, 10.0.0.1' }, '10.0.0.99'))
    )
  })
})

describe('phone normalization — rate limit bypass', () => {
  test('phone formatting variations normalize to same key', () => {
    // Admin phone 19998740950 formatted as (19) 99874-0950 should normalize to same
    const variants = ['19998740950', '(19) 99874-0950', '19 99874-0950', '19-99874-0950', '19998 740950']
    const base = normalizePhoneForLimit('19998740950')
    for (const v of variants) {
      assert.equal(normalizePhoneForLimit(v), base)
    }
  })

  test('isRateLimited uses normalized phone — formatting does not bypass', () => {
    // With country code +55, should still map to same 11-digit key
    assert.equal(normalizePhoneForLimit('+55 (19) 99874-0950'), normalizePhoneForLimit('19998740950'))
    assert.equal(normalizePhoneForLimit('5519998740950'), '19998740950')
    assert.equal(normalizePhoneForLimit('19998-740950'), '19998740950')
    // Different numbers should remain different
    assert.notEqual(normalizePhoneForLimit('19998740951'), normalizePhoneForLimit('19998740950'))
  })
})
