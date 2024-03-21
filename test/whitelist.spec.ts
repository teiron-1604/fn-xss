import { describe, expect, it } from 'vitest'
import { xss } from '../src/index'

describe('Whitelist', () => {
  it('Filter all tags', () => {
    expect(xss('<a title="xx">bb</a>', { whiteList: {} })).toBe(
      '&lt;a title="xx"&gt;bb&lt;/a&gt;',
    )
    expect(xss('<hr>', { whiteList: {} })).toBe('&lt;hr&gt;')
  })

  it('Add whitelist tags and attributes', () => {
    expect(
      xss('<ooxx yy="ok" cc="no">uu</ooxx>', { whiteList: { ooxx: ['yy'] } }),
    ).toBe('<ooxx yy="ok">uu</ooxx>')
  })

  it('allowList', () => {
    // 过滤所有标签
    expect(xss('<a title="xx">bb</a>', { allowList: {} })).toBe(
      '&lt;a title="xx"&gt;bb&lt;/a&gt;',
    )
    expect(xss('<hr>', { allowList: {} })).toBe('&lt;hr&gt;')
    // 增加白名单标签及属性
    expect(
      xss('<ooxx yy="ok" cc="no">uu</ooxx>', { allowList: { ooxx: ['yy'] } }),
    ).toBe('<ooxx yy="ok">uu</ooxx>')
  })
})
