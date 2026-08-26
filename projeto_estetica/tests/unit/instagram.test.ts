import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { isInstagramHost, isValidInstagramUrl } from '../../src/lib/instagram'

describe('Instagram hostname validation', () => {
  test('accepts instagram.com and its legitimate subdomains', () => {
    const validHosts = [
      'instagram.com',
      'www.instagram.com',
      'cdn.instagram.com',
      'api-anything.instagram.com',
    ]
    for (const h of validHosts) {
      assert.equal(isInstagramHost(h), true, `host should be valid: ${h}`)
    }
    assert.equal(isValidInstagramUrl('https://www.instagram.com/p/ABC123/'), true)
    assert.equal(isValidInstagramUrl('https://instagram.com/reel/ABC123'), true)
    assert.equal(isValidInstagramUrl('https://cdn.instagram.com/x'), true)
  })

  test('rejects lookalike / attacker-controlled hosts and unrelated domains', () => {
    const invalid = [
      'evilinstagram.com',
      'anythinginstagram.com',
      'notinstagram.com',
      'instagram.com.evil.com',
      'instagram.com.evil.net',
      'evil.com',
      'example.com',
      'www.instagram.com.evil.com',
      'sub.instagram.com.evil.com',
    ]
    for (const host of invalid) {
      assert.equal(isInstagramHost(host), false, `host should be rejected: ${host}`)
    }
    assert.equal(isValidInstagramUrl('https://evilinstagram.com/p/ABC123/'), false)
    assert.equal(isValidInstagramUrl('https://anythinginstagram.com/x'), false)
    assert.equal(isValidInstagramUrl('https://instagram.com.evil.com/p'), false)
    assert.equal(isValidInstagramUrl('https://www.instagram.com.evil.com/p'), false)
    assert.equal(isValidInstagramUrl('https://example.com/p'), false)
  })

  test('rejects non-http(s) schemes and malformed values', () => {
    assert.equal(isValidInstagramUrl('javascript:alert(1)//instagram.com'), false)
    assert.equal(isValidInstagramUrl('ftp://instagram.com/x'), false)
    assert.equal(isValidInstagramUrl('not a url'), false)
    assert.equal(isValidInstagramUrl(''), false)
    assert.equal(isInstagramHost(''), false)
    assert.equal(isInstagramHost('instagram.com.'), true) // trailing dot normalized
  })

  test('is case-insensitive on the hostname', () => {
    assert.equal(isInstagramHost('WWW.Instagram.COM'), true)
    assert.equal(isValidInstagramUrl('https://www.Instagram.com/p/ABC/'), true)
  })
})