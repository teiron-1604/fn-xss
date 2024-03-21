import { describe, expect, it } from 'vitest'
import { xss } from '../src/index'

describe('HTML Formatter', () => {
  it('Remove Comment Tag', () => {
    expect(xss('<!-- hello -->')).toBe('')
    expect(xss('<!--hello-->')).toBe('')
    expect(xss('xx <!-- hello --> yy')).toBe('xx  yy')
    expect(xss('xx<!--hello-->yy')).toBe('xxyy')
    expect(xss('<!-- <!-- <!-- hello --> --> -->')).toBe(' --&gt; --&gt;')
  })

  it('Compatible with various weird inputs', () => {
    expect(xss('')).toBe('')
    expect(xss(null)).toBe('')
    expect(xss(123)).toBe('123')
    expect(xss({ a: 1111 })).toBe('[object Object]')
  })

  it('Clear invisible characters', () => {
    expect(xss('a\u0000\u0001\u0002\u0003\r\n b')).toBe(
      'a\u0000\u0001\u0002\u0003\r\n b',
    )
    expect(
      xss('a\u0000\u0001\u0002\u0003\r\n b', { stripBlankChar: true }),
    ).toBe('a\r\n b')
  })

  it('Filter tags that are not in the whitelist', () => {
    expect(xss('<b>abcd</b>')).toBe('<b>abcd</b>')
    expect(xss('<o>abcd</o>')).toBe('&lt;o&gt;abcd&lt;/o&gt;')
    expect(xss('<b>abcd</o>')).toBe('<b>abcd&lt;/o&gt;')
    expect(xss('<b><o>abcd</b></o>')).toBe('<b>&lt;o&gt;abcd</b>&lt;/o&gt;')
    expect(xss('<hr>')).toBe('<hr>')
    expect(xss('<xss>')).toBe('&lt;xss&gt;')
    expect(xss('<xss o="x">')).toBe('&lt;xss o="x"&gt;')
    expect(xss('<a><b>c</b></a>')).toBe('<a><b>c</b></a>')
    expect(xss('<a><c>b</c></a>')).toBe('<a>&lt;c&gt;b&lt;/c&gt;</a>')
  })

  it('Filtering is not a tag `<>`', () => {
    expect(xss('<>>')).toBe('&lt;&gt;&gt;')
    expect(xss('<scri' + 'pt>')).toBe('&lt;script&gt;')
    expect(xss('<<a>b>')).toBe('&lt;<a>b&gt;')
    expect(xss('<<<a>>b</a><x>')).toBe('&lt;&lt;<a>&gt;b</a>&lt;x&gt;')
  })

  it('Filter attributes that are not in the whitelist', () => {
    expect(xss('<a oo="1" xx="2" title="3">yy</a>')).toBe('<a title="3">yy</a>')
    expect(xss('<a title xx oo>pp</a>')).toBe('<a title>pp</a>')
    expect(xss('<a title """>pp</a>')).toBe('<a title>pp</a>')
    expect(xss('<a t="">')).toBe('<a>')
  })

  it('Special characters within attributes', () => {
    expect(xss('<a title="\'<<>>">')).toBe('<a title="\'&lt;&lt;&gt;&gt;">')
    expect(xss('<a title=""">')).toBe('<a title>')
    expect(xss('<a h=title="oo">')).toBe('<a>')
    expect(xss('<a h= title="oo">')).toBe('<a>')
    expect(xss('<a title="javascript&colonalert(/xss/)">')).toBe(
      '<a title="javascript:alert(/xss/)">',
    )
    expect(xss('<a title"hell aa="fdfd title="ok">hello</a>')).toBe(
      '<a>hello</a>',
    )
  })

  it('Automatically convert single quotes in attribute values to double quotes', () => {
    expect(xss("<a title='abcd'>")).toBe('<a title="abcd">')
    expect(xss("<a title='\"'>")).toBe('<a title="&quot;">')
  })

  it('No attribute value enclosed in double quotes', () => {
    expect(xss('<a title=home>')).toBe('<a title="home">')
    expect(xss('<a title=abc("d")>')).toBe('<a title="abc(&quot;d&quot;)">')
    expect(xss("<a title=abc('d')>")).toBe('<a title="abc(\'d\')">')
  })

  it('Single closing tag', () => {
    expect(xss('<img src/>')).toBe('<img src />')
    expect(xss('<img src />')).toBe('<img src />')
    expect(xss('<img src//>')).toBe('<img src />')
    expect(xss('<br/>')).toBe('<br />')
    expect(xss('<br />')).toBe('<br />')
    expect(xss("<img src=x onerror=alert('XSS')")).toBe('<img src>')
  })

  it('Malformed attribute format', () => {
    expect(xss('<a target = "_blank" title ="bbb">')).toBe(
      '<a target="_blank" title="bbb">',
    )
    expect(xss('<a target = "_blank" title =  title =  "bbb">')).toBe(
      '<a target="_blank" title="title">',
    )
    expect(xss('<img width = 100    height     =200 title="xxx">')).toBe(
      '<img width="100" height="200" title="xxx">',
    )
    expect(xss('<img width = 100    height     =200 title=xxx>')).toBe(
      '<img width="100" height="200" title="xxx">',
    )
    expect(xss('<img width = 100    height     =200 title= xxx>')).toBe(
      '<img width="100" height="200" title="xxx">',
    )
    expect(xss('<img width = 100    height     =200 title= "xxx">')).toBe(
      '<img width="100" height="200" title="xxx">',
    )
    expect(xss("<img width = 100    height     =200 title= 'xxx'>")).toBe(
      '<img width="100" height="200" title="xxx">',
    )
    expect(xss("<img width = 100    height     =200 title = 'xxx'>")).toBe(
      '<img width="100" height="200" title="xxx">',
    )
    expect(
      xss('<img width = 100    height     =200 title= "xxx" no=yes alt="yyy">'),
    ).toBe('<img width="100" height="200" title="xxx" alt="yyy">')
    expect(
      xss(
        '<img width = 100    height     =200 title= "xxx" no=yes alt="\'yyy\'">',
      ),
    ).toBe('<img width="100" height="200" title="xxx" alt="\'yyy\'">')
    expect(xss('<img loading="lazy">')).toBe('<img loading="lazy">')
  })

  it('Use tab or newline separated attributes', () => {
    expect(xss('<img width=100 height=200\nsrc="#"/>')).toBe(
      '<img width="100" height="200" src="#" />',
    )
    expect(xss('<a\ttarget="_blank"\ntitle="bbb">')).toBe(
      '<a target="_blank" title="bbb">',
    )
    expect(xss('<a\ntarget="_blank"\ttitle="bbb">')).toBe(
      '<a target="_blank" title="bbb">',
    )
    expect(xss('<a\n\n\n\ttarget="_blank"\t\t\t\ntitle="bbb">')).toBe(
      '<a target="_blank" title="bbb">',
    )
  })
})
