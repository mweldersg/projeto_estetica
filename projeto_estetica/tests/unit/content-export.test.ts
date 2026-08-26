import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildPublicContentExport, containsCredentialData } from '../../scripts/content-export'

describe('content export — never leaks Admin credentials', () => {
  test('Admin model (with password hash) is dropped from the export', () => {
    const raw = {
      admin: [{ id: 'a1', phone: '19998740950', password: '$2b$10$abcdefghijklmnopqrstuv' }],
      services: [{ id: 's1', title: 'Lavagem' }],
      videos: [{ id: 'v1', title: 'PPF' }],
      reviews: [{ id: 'r1', name: 'Joao', rating: 5 }],
      faqs: [{ id: 'f1', question: 'Q', answer: 'A' }],
    }
    const exported = buildPublicContentExport(raw)

    // The admin key itself must never appear.
    assert.ok(!('admin' in exported))
    assert.equal(JSON.stringify(exported).includes('$2b$10$abcdefghijklmnopqrstuv'), false)
    // But the public content is preserved.
    assert.equal(exported.services.length, 1)
    assert.equal(exported.videos.length, 1)
    assert.equal(exported.reviews.length, 1)
    assert.equal(exported.faqs.length, 1)
  })

  test('buildPublicContentExport output passes containsCredentialData', () => {
    const exported = buildPublicContentExport({
      admin: [{ password: 'x' }],
      services: [{ id: 's1', title: 'Título' }],
    })
    assert.equal(containsCredentialData(exported), false)
    assert.equal(containsCredentialData(JSON.stringify(exported)), false)
  })

  test('containsCredentialData flags leaked admin/password/hash', () => {
    assert.equal(containsCredentialData({ admin: [] }), true)
    assert.equal(containsCredentialData({ users: [{ password: 'pw' }] }), true)
    assert.equal(containsCredentialData({ user: { passwordHash: 'h' } }), true)
    assert.equal(containsCredentialData({ data: { refreshToken: 't' } }), true)
    // Nested only one level and not credentials
    assert.equal(containsCredentialData({ services: [{ title: 'Normal' }] }), false)
  })
})