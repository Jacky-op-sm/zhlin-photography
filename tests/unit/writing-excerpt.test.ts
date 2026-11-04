import assert from 'node:assert/strict'
import test from 'node:test'
import { writingExcerpt } from '../../src/lib/content/writing-model.ts'

test('excerpts drop Markdown syntax and images from descriptions', () => {
  const body = '# 标题\n\n![三月](/assets/a.webp "三月")\n\n**下午**坐在[图书馆](https://example.com)的三楼。\n\n> 湖面平静'
  assert.equal(writingExcerpt(body), '标题 下午坐在图书馆的三楼。 湖面平静')
})

test('excerpts cut on characters and mark truncation', () => {
  assert.equal(writingExcerpt('字'.repeat(12), 10), `${'字'.repeat(10)}…`)
  assert.equal(writingExcerpt('字'.repeat(10), 10), '字'.repeat(10))
})

test('an image-only body yields an empty excerpt for the fallback', () => {
  assert.equal(writingExcerpt('![a](/a.webp)\n![b](/b.webp)'), '')
})
