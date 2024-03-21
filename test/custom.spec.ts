import { describe, expect, it } from 'vitest'
import { xss, getDefaultWhiteList, getDefaultCSSWhiteList } from '../src/index'

const source = 'dd<a href="#"><b><c>haha</c></b></a><br>ff'
const attrSource =
  '<a href="#" target="_blank" checked data-a="b">hi</a href="d">'
const escapeSource = '<x>yy</x><a>bb</a>'

describe('Custom Method', () => {
  it('#onTag - match tag', function () {
    let i = 0
    const html = xss(source, {
      onTag: (tag, html, options) => {
        i++
        if (i === 1) {
          expect(tag).toBe('a')
          expect(html).toBe('<a href="#">')
          expect(options.isClosing).toBe(false)
          expect(options.position).toBe(2)
          expect(options.sourcePosition).toBe(2)
          expect(options.isWhite).toBe(true)
        } else if (i === 2) {
          expect(tag).toBe('b')
          expect(html).toBe('<b>')
          expect(options.isClosing).toBe(false)
          expect(options.position).toBe(14)
          expect(options.sourcePosition).toBe(14)
          expect(options.isWhite).toBe(true)
        } else if (i === 3) {
          expect(tag).toBe('c')
          expect(html).toBe('<c>')
          expect(options.isClosing).toBe(false)
          expect(options.position).toBe(17)
          expect(options.sourcePosition).toBe(17)
          expect(options.isWhite).toBe(false)
        } else if (i === 4) {
          expect(tag).toBe('c')
          expect(html).toBe('</c>')
          expect(options.isClosing).toBe(true)
          expect(options.position).toBe(30)
          expect(options.sourcePosition).toBe(24)
          expect(options.isWhite).toBe(false)
        } else if (i === 5) {
          expect(tag).toBe('b')
          expect(html).toBe('</b>')
          expect(options.isClosing).toBe(true)
          expect(options.position).toBe(40)
          expect(options.sourcePosition).toBe(28)
          expect(options.isWhite).toBe(true)
        } else if (i === 6) {
          expect(tag).toBe('a')
          expect(html).toBe('</a>')
          expect(options.isClosing).toBe(true)
          expect(options.position).toBe(44)
          expect(options.sourcePosition).toBe(32)
          expect(options.isWhite).toBe(true)
        } else if (i === 7) {
          expect(tag).toBe('br')
          expect(html).toBe('<br>')
          expect(options.isClosing).toBe(false)
          expect(options.position).toBe(48)
          expect(options.sourcePosition).toBe(36)
          expect(options.isWhite).toBe(true)
        } else {
          throw new Error()
        }
      },
    })
    expect(html).toBe('dd<a href="#"><b>&lt;c&gt;haha&lt;/c&gt;</b></a><br>ff')
  })

  it('#onTag - return new html', function () {
    const html = xss(source, {
      onTag: (tag, html) => html,
    })
    expect(html).toBe(source)
  })

  it('#onIgnoreTag - match tag', function () {
    let i = 0
    const html = xss(source, {
      onIgnoreTag: function (tag, html, options) {
        i++
        if (i === 1) {
          expect(tag).toBe('c')
          expect(html).toBe('<c>')
          expect(options.isClosing).toBe(false)
          expect(options.position).toBe(17)
          expect(options.sourcePosition).toBe(17)
          expect(options.isWhite).toBe(false)
        } else if (i === 2) {
          expect(tag).toBe('c')
          expect(html).toBe('</c>')
          expect(options.isClosing).toBe(true)
          expect(options.position).toBe(30)
          expect(options.sourcePosition).toBe(24)
          expect(options.isWhite).toBe(false)
        } else {
          throw new Error()
        }
      },
    })
    expect(html).toBe('dd<a href="#"><b>&lt;c&gt;haha&lt;/c&gt;</b></a><br>ff')
  })

  it('#onIgnoreTag - return new html', function () {
    const html = xss(source, {
      onIgnoreTag: function (tag, html, options) {
        return '[' + (options.isClosing ? '/' : '') + 'removed]'
      },
    })
    expect(html).toBe('dd<a href="#"><b>[removed]haha[/removed]</b></a><br>ff')
  })

  it('#onTagAttr - match attr', function () {
    let i = 0
    const html = xss(attrSource, {
      onTagAttr: function (tag, name, value, isWhiteAttr) {
        expect(tag).toBe('a')
        i++
        if (i === 1) {
          expect(name).toBe('href')
          expect(value).toBe('#')
          expect(isWhiteAttr).toBe(true)
        } else if (i === 2) {
          expect(name).toBe('target')
          expect(value).toBe('_blank')
          expect(isWhiteAttr).toBe(true)
        } else if (i === 3) {
          expect(name).toBe('checked')
          expect(value).toBe('')
          expect(isWhiteAttr).toBe(false)
        } else if (i === 4) {
          expect(name).toBe('data-a')
          expect(value).toBe('b')
          expect(isWhiteAttr).toBe(false)
        } else {
          throw new Error()
        }
      },
    })
    expect(html).toBe('<a href="#" target="_blank">hi</a>')
  })

  it('#onTagAttr - match attr', function () {
    const html = xss(attrSource, {
      onTagAttr: function (tag, name) {
        return '$' + name + '$'
      },
    })
    expect(html).toBe('<a $href$ $target$ $checked$ $data-a$>hi</a>')
  })

  it('#onIgnoreTagAttr - match attr', function () {
    let i = 0
    const html = xss(attrSource, {
      onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
        if (i === 0) {
          expect(tag).toBe('a')
          expect(name).toBe('checked')
          expect(value).toBe('')
          expect(isWhiteAttr).toBe(false)
        } else if (i === 1) {
          expect(tag).toBe('a')
          expect(name).toBe('data-a')
          expect(value).toBe('b')
          expect(isWhiteAttr).toBe(false)
        } else {
          throw new Error()
        }
        i++
      },
    })
    expect(html).toBe('<a href="#" target="_blank">hi</a>')
  })

  it('#onIgnoreTagAttr - match attr', function () {
    const html = xss(attrSource, {
      onIgnoreTagAttr: function (tag, name) {
        return '$' + name + '$'
      },
    })
    expect(html).toBe('<a href="#" target="_blank" $checked$ $data-a$>hi</a>')
  })

  it('#escapeHtml - default', function () {
    const html = xss(escapeSource)
    expect(html).toBe('&lt;x&gt;yy&lt;/x&gt;<a>bb</a>')
  })

  it('#escapeHtml - return new value', function () {
    const html = xss(escapeSource, {
      escapeHtml: function (str) {
        return str ? '[' + str + ']' : str
      },
    })
    expect(html).toBe('[<x>][yy][</x>]<a>[bb]</a>')
  })

  it('#safeAttrValue - default', function () {
    const source = '<a href="javascript:alert(/xss/)" title="hi">link</a>'
    const html = xss(source)
    expect(html).toBe('<a href title="hi">link</a>')
  })

  it('#safeAttrValue - return new value', function () {
    const source = '<a href="javascript:alert(/xss/)" title="hi">link</a>'
    const html = xss(source, {
      safeAttrValue: function (tag, name) {
        expect(tag).toBe('a')
        return '$' + name + '$'
      },
    })
    expect(html).toBe('<a href="$href$" title="$title$">link</a>')
  })

  it('#stripIgnoreTag', function () {
    const html = xss(escapeSource, {
      stripIgnoreTag: true,
    })
    expect(html).toBe('yy<a>bb</a>')
  })

  it('#stripTagBody - true', function () {
    const source = '<a>link</a><x>haha</x><y>a<y></y>b</y>k'
    const html = xss(source, {
      stripIgnoreTagBody: true,
    })
    expect(html).toBe('<a>link</a>bk')
  })

  it('#stripIgnoreTagBody - *', function () {
    const source = '<a>link</a><x>haha</x><y>a<y></y>b</y>k'
    const html = xss(source, {
      stripIgnoreTagBody: '*',
    })
    expect(html).toBe('<a>link</a>bk')
  })

  it("#stripIgnoreTagBody - ['x']", function () {
    const source = '<a>link</a><x>haha</x><y>a<y></y>b</y>k'
    const html = xss(source, {
      stripIgnoreTagBody: ['x'],
    })
    expect(html).toBe('<a>link</a>&lt;y&gt;a&lt;y&gt;&lt;/y&gt;b&lt;/y&gt;k')
  })

  it("#stripIgnoreTagBody - ['x'] & onIgnoreTag", function () {
    const source = '<a>link</a><x>haha</x><y>a<y></y>b</y>k'
    const html = xss(source, {
      stripIgnoreTagBody: ['x'],
      onIgnoreTag: function (tag) {
        return '$' + tag + '$'
      },
    })
    expect(html).toBe('<a>link</a>$y$a$y$$y$b$y$k')
  })

  it('#stripIgnoreTag & stripIgnoreTagBody', function () {
    const source = '<scri' + 'pt>alert(/xss/);</scri' + 'pt>'
    const html = xss(source, {
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    })
    expect(html).toBe('')
  })

  it('#stripIgnoreTag & stripIgnoreTagBody - 2', function () {
    const source = 'ooxx<scri' + 'pt>alert(/xss/);</scri' + 'pt>'
    const html = xss(source, {
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    })
    expect(html).toBe('ooxx')
  })

  it('cssFilter', function () {
    const whiteList = getDefaultWhiteList()
    whiteList.div.push('style')
    expect(
      xss('<div style="width: 50%; vertical-align: top;">hello</div>', {
        whiteList: whiteList,
      }),
    ).toBe('<div style="width:50%;">hello</div>')
    expect(
      xss('<div style="width: 50%; vertical-align: top;">hello</div>', {
        whiteList: whiteList,
        css: false,
      }),
    ).toBe('<div style="width: 50%; vertical-align: top;">hello</div>')
    const css = { whiteList: getDefaultCSSWhiteList() }
    css.whiteList['vertical-align'] = true
    expect(
      xss('<div style="width: 50%; vertical-align: top;">hello</div>', {
        whiteList: whiteList,
        css: css,
      }),
    ).toBe('<div style="width:50%; vertical-align:top;">hello</div>')
  })

  it('#onTag - sanitize html parameter space', function () {
    const source = '<a target= " href="><script>alert(2)</script>"><span>'
    const html = xss(source, {
      onTag: function (_, E, S) {
        if (S.isWhite && 'a' === _) {
          if (S.isClosing) return '</span></a>'
          return ''.concat(E, '<span>')
        }
      },
    })
    expect(html).toBe(
      '<a target= " href="><span>&lt;script&gt;alert(2)&lt;/script&gt;"&gt;<span>',
    )
  })

  it('#onTag - sanitize html parameter tab', function () {
    const source = '<a target=	" href="><script>alert(2)</script>"><span>'
    const html = xss(source, {
      onTag: function (_, E, S) {
        if (S.isWhite && 'a' === _) {
          if (S.isClosing) return '</span></a>'
          return ''.concat(E, '<span>')
        }
      },
    })
    expect(html).toBe(
      '<a target=	" href="><span>&lt;script&gt;alert(2)&lt;/script&gt;"&gt;<span>',
    )
  })
})
