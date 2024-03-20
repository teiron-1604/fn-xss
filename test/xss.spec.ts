import { describe, expect, it } from 'vitest'
import { xss } from '../src/index'

describe('xss', () => {
  it('removeCommentTag', function () {
    expect(xss('<!-- hello -->')).toBe('')
    expect(xss('<!--hello-->')).toBe('')
    expect(xss('xx <!-- hello --> yy')).toBe('xx  yy')
    expect(xss('xx<!--hello-->yy')).toBe('xxyy')
    expect(xss('<!-- <!-- <!-- hello --> --> -->')).toBe(' --&gt; --&gt;')
  })
})
