// @ts-nocheck

/**
 * default settings
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */
import {
  FilterCSS,
  getDefaultWhiteList as getDefaultCSSWhiteList,
} from '../css-filter'
import type { DefaultWhitelistHtmlTag } from './types'

type DefaultWhitelist = Record<DefaultWhitelistHtmlTag, string[]>

export function getDefaultWhiteList(): DefaultWhitelist {
  return {
    a: ['target', 'href', 'title'],
    abbr: ['title'],
    address: [],
    area: ['shape', 'coords', 'href', 'alt'],
    article: [],
    aside: [],
    audio: [
      'autoplay',
      'controls',
      'crossorigin',
      'loop',
      'muted',
      'preload',
      'src',
    ],
    b: [],
    bdi: ['dir'],
    bdo: ['dir'],
    big: [],
    blockquote: ['cite'],
    br: [],
    caption: [],
    center: [],
    cite: [],
    code: [],
    col: ['align', 'valign', 'span', 'width'],
    colgroup: ['align', 'valign', 'span', 'width'],
    dd: [],
    del: ['datetime'],
    details: ['open'],
    div: [],
    dl: [],
    dt: [],
    em: [],
    figcaption: [],
    figure: [],
    font: ['color', 'size', 'face'],
    footer: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    header: [],
    hr: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    ins: ['datetime'],
    kbd: [],
    li: [],
    mark: [],
    nav: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    section: [],
    small: [],
    span: [],
    sub: [],
    summary: [],
    sup: [],
    strong: [],
    strike: [],
    table: ['width', 'border', 'align', 'valign'],
    tbody: ['align', 'valign'],
    td: ['width', 'rowspan', 'colspan', 'align', 'valign'],
    tfoot: ['align', 'valign'],
    th: ['width', 'rowspan', 'colspan', 'align', 'valign'],
    thead: ['align', 'valign'],
    tr: ['rowspan', 'align', 'valign'],
    tt: [],
    u: [],
    ul: [],
    video: [
      'autoplay',
      'controls',
      'crossorigin',
      'loop',
      'muted',
      'playsinline',
      'poster',
      'preload',
      'src',
      'height',
      'width',
    ],
  }
}

const defaultCSSFilter = new FilterCSS()

/**
 * default onTag function
 *
 * @param {String} tag
 * @param {String} html
 * @param {Object} options
 * @return {String}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onTag(tag: any, html: any, options: any) {
  // do nothing
}

/**
 * default onIgnoreTag function
 *
 * @param {String} tag
 * @param {String} html
 * @param {Object} options
 * @return {String}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onIgnoreTag(tag: any, html: any, options: any) {
  // do nothing
}

/**
 * default onTagAttr function
 *
 * @param {String} tag
 * @param {String} name
 * @param {String} value
 * @return {String}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onTagAttr(tag: any, name: any, value: any) {
  // do nothing
}

/**
 * default onIgnoreTagAttr function
 *
 * @param {String} tag
 * @param {String} name
 * @param {String} value
 * @return {String}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onIgnoreTagAttr(tag: any, name: any, value: any) {
  // do nothing
}

/**
 * default escapeHtml function
 *
 * @param {String} html
 */
export function escapeHtml(html: string) {
  return html.replace(REGEXP_LT, '&lt;').replace(REGEXP_GT, '&gt;')
}

/**
 * default safeAttrValue function
 *
 * @param {String} tag
 * @param {String} name
 * @param {String} value
 * @param {Object} cssFilter
 * @return {String}
 */
export function safeAttrValue(
  tag: any,
  name: string,
  value: string | string[],
  cssFilter: boolean,
) {
  // unescape attribute value firstly
  value = friendlyAttrValue(value)

  if (name === 'href' || name === 'src') {
    // filter `href` and `src` attribute
    // only allow the value that starts with `http://` | `https://` | `mailto:` | `/` | `#`
    value = value.trim()
    if (value === '#') return '#'
    if (
      !(
        value.substr(0, 7) === 'http://' ||
        value.substr(0, 8) === 'https://' ||
        value.substr(0, 7) === 'mailto:' ||
        value.substr(0, 4) === 'tel:' ||
        value.substr(0, 11) === 'data:image/' ||
        value.substr(0, 6) === 'ftp://' ||
        value.substr(0, 2) === './' ||
        value.substr(0, 3) === '../' ||
        value[0] === '#' ||
        value[0] === '/'
      )
    ) {
      return ''
    }
  } else if (name === 'background') {
    // filter `background` attribute (maybe no use)
    // `javascript:`
    REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex = 0
    if (REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)) {
      return ''
    }
  } else if (name === 'style') {
    // `expression()`
    REGEXP_DEFAULT_ON_TAG_ATTR_7.lastIndex = 0
    if (REGEXP_DEFAULT_ON_TAG_ATTR_7.test(value)) {
      return ''
    }
    // `url()`
    REGEXP_DEFAULT_ON_TAG_ATTR_8.lastIndex = 0
    if (REGEXP_DEFAULT_ON_TAG_ATTR_8.test(value)) {
      REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex = 0
      if (REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)) {
        return ''
      }
    }
    if (cssFilter !== false) {
      cssFilter = cssFilter || defaultCSSFilter
      value = cssFilter.process(value)
    }
  }

  // escape `<>"` before returns
  value = escapeAttrValue(value)
  return value
}

// RegExp list
const REGEXP_LT = /</g
const REGEXP_GT = />/g
const REGEXP_QUOTE = /"/g
const REGEXP_QUOTE_2 = /&quot;/g
const REGEXP_ATTR_VALUE_1 = /&#([a-zA-Z0-9]*);?/gim
const REGEXP_ATTR_VALUE_COLON = /&colon;?/gim
const REGEXP_ATTR_VALUE_NEWLINE = /&newline;?/gim
// const REGEXP_DEFAULT_ON_TAG_ATTR_3 = /\/\*|\*\//gm;
const REGEXP_DEFAULT_ON_TAG_ATTR_4 =
  /((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/gi
// const REGEXP_DEFAULT_ON_TAG_ATTR_5 = /^[\s"'`]*(d\s*a\s*t\s*a\s*)\:/gi;
// const REGEXP_DEFAULT_ON_TAG_ATTR_6 = /^[\s"'`]*(d\s*a\s*t\s*a\s*)\:\s*image\//gi;
const REGEXP_DEFAULT_ON_TAG_ATTR_7 =
  /e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi
const REGEXP_DEFAULT_ON_TAG_ATTR_8 = /u\s*r\s*l\s*\(.*/gi

/**
 * escape double quote
 *
 * @param {String} str
 * @return {String} str
 */
export function escapeQuote(str: string) {
  return str.replace(REGEXP_QUOTE, '&quot;')
}

/**
 * unescape double quote
 *
 * @param {String} str
 * @return {String} str
 */
export function unescapeQuote(str: string) {
  return str.replace(REGEXP_QUOTE_2, '"')
}

/**
 * escape html entities
 *
 * @param {String} str
 * @return {String}
 */
export function escapeHtmlEntities(str: string) {
  return str.replace(
    REGEXP_ATTR_VALUE_1,
    function replaceUnicode(str: any, code: string | string[]) {
      return code[0] === 'x' || code[0] === 'X'
        ? String.fromCharCode(parseInt(code.substr(1), 16))
        : String.fromCharCode(parseInt(code, 10))
    },
  )
}

/**
 * escape html5 new danger entities
 *
 * @param {String} str
 * @return {String}
 */
export function escapeDangerHtml5Entities(str: string) {
  return str
    .replace(REGEXP_ATTR_VALUE_COLON, ':')
    .replace(REGEXP_ATTR_VALUE_NEWLINE, ' ')
}

/**
 * clear nonprintable characters
 *
 * @param {String} str
 * @return {String}
 */
export function clearNonPrintableCharacter(str: string) {
  let str2 = ''
  for (let i = 0, len = str.length; i < len; i++) {
    str2 += str.charCodeAt(i) < 32 ? ' ' : str.charAt(i)
  }
  return str2.trim()
}

/**
 * get friendly attribute value
 *
 * @param {String} str
 * @return {String}
 */
export function friendlyAttrValue(str: any) {
  str = unescapeQuote(str)
  str = escapeHtmlEntities(str)
  str = escapeDangerHtml5Entities(str)
  str = clearNonPrintableCharacter(str)
  return str
}

/**
 * unescape attribute value
 *
 * @param {String} str
 * @return {String}
 */
export function escapeAttrValue(str: any) {
  str = escapeQuote(str)
  str = escapeHtml(str)
  return str
}

/**
 * `onIgnoreTag` function for removing all the tags that are not in whitelist
 */
export function onIgnoreTagStripAll() {
  return ''
}

/**
 * remove tag body
 * specify a `tags` list, if the tag is not in the `tags` list then process by the specify function (optional)
 *
 * @param {array} tags
 * @param {function} next
 */
export function StripTagBody(
  tags: any,
  next: (arg0: any, arg1: any, arg2: any) => any,
) {
  if (typeof next !== 'function') {
    next = function () {}
  }

  const isRemoveAllTag = !Array.isArray(tags)
  function isRemoveTag(tag: any) {
    if (isRemoveAllTag) return true
    return tags.indexOf(tag) !== -1
  }

  const removeList: any[][] = []
  let posStart = false

  return {
    onIgnoreTag: function (
      tag: any,
      html: any,
      options: { isClosing: any; position: number | boolean },
    ) {
      if (isRemoveTag(tag)) {
        if (options.isClosing) {
          const ret = '[/removed]'
          const end = options.position + ret.length
          removeList.push([
            posStart !== false ? posStart : options.position,
            end,
          ])
          posStart = false
          return ret
        } else {
          if (!posStart) {
            posStart = options.position
          }
          return '[removed]'
        }
      } else {
        return next(tag, html, options)
      }
    },
    remove: function (html: string) {
      let rethtml = ''
      let lastPos = 0
      removeList.forEach(function (pos: number[]) {
        rethtml += html.slice(lastPos, pos[0])
        lastPos = pos[1]
      })
      rethtml += html.slice(lastPos)
      return rethtml
    },
  }
}

/**
 * remove html comments
 *
 * @param {String} html
 * @return {String}
 */
export function removeCommentTag(html: string) {
  let retHtml = ''
  let lastPos = 0
  while (lastPos < html.length) {
    const i = html.indexOf('<!--', lastPos)
    if (i === -1) {
      retHtml += html.slice(lastPos)
      break
    }
    retHtml += html.slice(lastPos, i)
    const j = html.indexOf('-->', i)
    if (j === -1) {
      break
    }
    lastPos = j + 3
  }
  return retHtml
}

/**
 * remove invisible characters
 *
 * @param {String} html
 * @return {String}
 */
export function stripBlankChar(html: string) {
  let chars = html.split('')
  chars = chars.filter(function (char: string) {
    const c = char.charCodeAt(0)
    if (c === 127) return false
    if (c <= 31) {
      if (c === 10 || c === 13) return true
      return false
    }
    return true
  })
  return chars.join('')
}

export const whiteList = getDefaultWhiteList()
export const attributeWrapSign = '"'

export { defaultCSSFilter as cssFilter, getDefaultCSSWhiteList }
