import { describe, expect, it } from 'vitest'
import { parseTag, parseAttr } from '../src/index'

function escapeHtml(html: string) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function attr(n: string, v: string) {
  if (v) {
    return n + '="' + v.replace(/"/g, '&quote;') + '"'
  } else {
    return n
  }
}

describe('HTML Parser', () => {
  it('Parse tag', () => {
    let i = 0
    const html = parseTag(
      'hello<A href="#">www</A>ccc<b><br/>',
      (sourcePosition, position, tag, html, isClosing) => {
        i++
        if (i === 1) {
          // Tag 1
          expect(sourcePosition).toBe(5)
          expect(position).toBe(5)
          expect(tag).toBe('a')
          expect(html).toBe('<A href="#">')
          expect(isClosing).toBe(false)
          return '[link]'
        } else if (i === 2) {
          // Tag 2
          expect(sourcePosition).toBe(20)
          expect(position).toBe(14)
          expect(tag).toBe('a')
          expect(html).toBe('</A>')
          expect(isClosing).toBe(true)
          return '[/link]'
        } else if (i === 3) {
          // Tag 3
          expect(sourcePosition).toBe(27)
          expect(position).toBe(24)
          expect(tag).toBe('b')
          expect(html).toBe('<b>')
          expect(isClosing).toBe(false)
          return '[B]'
        } else if (i === 4) {
          // Tag 4
          expect(sourcePosition).toBe(30)
          expect(position).toBe(27)
          expect(tag).toBe('br')
          expect(html).toBe('<br/>')
          expect(isClosing).toBe(false)
          return '[BR]'
        } else {
          throw new Error()
        }
      },
      escapeHtml,
    )

    expect(html).toBe('hello[link]www[/link]ccc[B][BR]')
  })

  it('Parse attr', function () {
    let i = 0
    const html = parseAttr(
      'href="#"attr1=b attr2=c attr3 attr4=\'value4"\'attr5/ attr6\\" attr7= "123 456"',
      (name, value) => {
        i++
        if (i === 1) {
          expect(name).toBe('href')
          expect(value).toBe('#')
          return attr(name, value)
        } else if (i === 2) {
          expect(name).toBe('attr1')
          expect(value).toBe('b')
          return attr(name, value)
        } else if (i === 3) {
          expect(name).toBe('attr2')
          expect(value).toBe('c')
          return attr(name, value)
        } else if (i === 4) {
          expect(name).toBe('attr3')
          expect(value).toBe('')
          return attr(name, value)
        } else if (i === 5) {
          expect(name).toBe('attr4')
          expect(value).toBe('value4"')
          return attr(name, value)
        } else if (i === 6) {
          expect(name).toBe('attr5')
          expect(value).toBe('')
          return attr(name, value)
        } else if (i === 7) {
          expect(name).toBe('attr6\\')
          expect(value).toBe('')
          return attr(name, value)
        } else if (i === 8) {
          expect(name).toBe('attr7')
          expect(value).toBe('123 456')
          return attr(name, value)
        } else {
          throw new Error()
        }
      },
    )

    expect(html).toBe(
      'href="#" attr1="b" attr2="c" attr3 attr4="value4&quote;" attr5 attr6\\ attr7="123 456"',
    )
  })

  it('Parse tag and attr', function () {
    const html = parseTag(
      'hi:<a href="#"target=_blank title="this is a link" alt  = hello   class   = "hello2">link</a>',
      (sourcePosition, position, tag, html, isClosing) => {
        if (tag === 'a') {
          if (isClosing) return '</a>'
          const attrHtml = parseAttr(html.slice(2, -1), (name, value) => {
            if (
              name === 'href' ||
              name === 'target' ||
              name === 'alt' ||
              name === 'class'
            ) {
              return attr(name, value)
            }
          })
          return '<a ' + attrHtml + '>'
        } else {
          return escapeHtml(html)
        }
      },
      escapeHtml,
    )
    expect(html).toBe(
      'hi:<a href="#" target="_blank" alt="hello" class="hello2">link</a>',
    )
  })
})
