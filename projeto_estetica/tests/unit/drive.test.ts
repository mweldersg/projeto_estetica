import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isDriveUrl, extractFileId, getPublicUrl } from '../../src/lib/drive'

test('isDriveUrl matches lh3 googleusercontent URLs', () => {
  assert.equal(isDriveUrl('https://lh3.googleusercontent.com/d/abc123DEF'), true)
})

test('isDriveUrl matches drive.usercontent URLs', () => {
  assert.equal(isDriveUrl('https://drive.usercontent.google.com/download?id=abc123DEF'), true)
})

test('isDriveUrl matches drive.google.com URLs', () => {
  assert.equal(isDriveUrl('https://drive.google.com/uc?export=view&id=abc123DEF'), true)
})

test('isDriveUrl matches media proxy URLs', () => {
  assert.equal(isDriveUrl('/api/media/abc123DEF'), true)
  assert.equal(isDriveUrl('/media/abc123DEF'), true)
})

test('isDriveUrl rejects foreign URLs', () => {
  assert.equal(isDriveUrl('https://images.unsplash.com/photo-1'), false)
  assert.equal(isDriveUrl('https://www.w3schools.com/html/mov_bbb.mp4'), false)
  assert.equal(isDriveUrl(''), false)
})

test('extractFileId parses lh3 /d/ URLs', () => {
  assert.equal(extractFileId('https://lh3.googleusercontent.com/d/abc123DEF'), 'abc123DEF')
})

test('extractFileId parses id= query URLs', () => {
  assert.equal(extractFileId('https://drive.usercontent.google.com/download?id=abc123DEF'), 'abc123DEF')
  assert.equal(extractFileId('https://drive.google.com/uc?export=view&id=abc123DEF'), 'abc123DEF')
})

test('extractFileId parses media proxy URLs', () => {
  assert.equal(extractFileId('/api/media/abc123DEF'), 'abc123DEF')
  assert.equal(extractFileId('/media/abc123DEF'), 'abc123DEF')
})

test('extractFileId returns null for foreign URLs', () => {
  assert.equal(extractFileId('https://images.unsplash.com/photo-1'), null)
  assert.equal(extractFileId('https://www.w3schools.com/html/mov_bbb.mp4'), null)
  assert.equal(extractFileId(''), null)
})

test('getPublicUrl returns proxy URL for images', () => {
  assert.equal(getPublicUrl('abc123DEF'), '/api/media/abc123DEF')
})

test('getPublicUrl returns proxy URL for videos', () => {
  assert.equal(getPublicUrl('abc123DEF'), '/api/media/abc123DEF')
})

test('getPublicUrl returns proxy URL for unknown mime types', () => {
  assert.equal(getPublicUrl('abc123DEF'), '/api/media/abc123DEF')
})
