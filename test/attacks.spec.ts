import { describe, expect, it } from 'vitest'
import { xss } from '../src/index'

// XSS Filter Evasion Cheat Sheet
// https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html
describe('XSS Attacks', () => {
  it('XSS Filter Evasion Cheat Sheet', () => {
    expect(
      xss(
        '></SCRI' +
          'PT>">\'><SCRI' +
          'PT>alert(String.fromCharCode(88,83,83))</SCRI' +
          'PT>',
      ),
    ).toBe(
      '&gt;&lt;/SCRIPT&gt;"&gt;\'&gt;&lt;SCRIPT&gt;alert(String.fromCharCode(88,83,83))&lt;/SCRIPT&gt;',
    )

    expect(xss(';!--"<XSS>=&{()}')).toBe(';!--"&lt;XSS&gt;=&{()}')

    expect(xss('<SCRIPT SRC=http://ha.ckers.org/xss.js></SCRI' + 'PT>')).toBe(
      '&lt;SCRIPT SRC=http://ha.ckers.org/xss.js&gt;&lt;/SCRIPT&gt;',
    )

    expect(xss('<IMG SRC="javascript:alert(\'XSS\');">')).toBe('<img src>')
  })

  it('Filter JavaScript', () => {
    expect(
      xss('<a style="url(\'javascript:alert(1)\')">', {
        whiteList: { a: ['style'] },
      }),
    ).toBe('<a style>')
    expect(
      xss('<td background="url(\'javascript:alert(1)\')">', {
        whiteList: { td: ['background'] },
      }),
    ).toBe('<td background>')
  })

  it('HTML5 new entity encoding colon `&colon;` line break `&NewLine;`', () => {
    expect(xss('<a href="javascript&colon;alert(/xss/)">')).toBe('<a href>')
    expect(xss('<a href="javascript&colonalert(/xss/)">')).toBe('<a href>')
    expect(xss('<a href="a&NewLine;b">')).toBe('<a href>')
    expect(xss('<a href="a&NewLineb">')).toBe('<a href>')
    expect(xss('<a href="javasc&NewLine;ript&colon;alert(1)">')).toBe(
      '<a href>',
    )
  })

  it('HTML comment processing', () => {
    expect(
      xss('<!--                               -->', { allowCommentTag: false }),
    ).toBe('')
    expect(xss('<!--      a           -->', { allowCommentTag: false })).toBe(
      '',
    )
    expect(xss('<!--sa       -->ss', { allowCommentTag: false })).toBe('ss')
    expect(
      xss('<!--                               ', { allowCommentTag: false }),
    ).toBe('')
  })

  it('Single quoted attribute value', function () {
    expect(xss('<a title="xx">not-defined</a>')).toBe(
      '<a title="xx">not-defined</a>',
    )
    expect(
      xss('<a title="xx">single-quoted</a>', {
        singleQuotedAttributeValue: true,
      }),
    ).toBe("<a title='xx'>single-quoted</a>")
    expect(
      xss('<a title="xx">double-quoted</a>', {
        singleQuotedAttributeValue: false,
      }),
    ).toBe('<a title="xx">double-quoted</a>')
    expect(
      xss('<a title="xx">invalid-value</a>', {
        singleQuotedAttributeValue: 'invalid',
      }),
    ).toBe('<a title="xx">invalid-value</a>')
  })

  it('Camel case tag names', function () {
    expect(
      xss(
        '<animateTransform attributeName="transform"' +
          'attributeType="XML"' +
          'type="rotate"' +
          'repeatCount="indefinite"/>',
        {
          whiteList: {
            animateTransform: ['attributeType', 'repeatCount'],
          },
        },
      ),
    ).toBe('<animatetransform attributetype="XML" repeatcount="indefinite" />')
  })
})
