import assert from 'node:assert/strict'
import test from 'node:test'
import { escapeHtml } from '../src/lib/contact/html.ts'

test('escapeHtml encodes every HTML control character', () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('x')"> & text`),
    '&lt;img src=x onerror=&quot;alert(&#039;x&#039;)&quot;&gt; &amp; text',
  )
})

test('escapeHtml preserves ordinary Unicode and newlines', () => {
  assert.equal(escapeHtml('你好\n摄影'), '你好\n摄影')
})
