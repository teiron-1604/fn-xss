// @ts-nocheck

/**
 * Simple HTML Parser
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

import _ from './utils'

/**
 * get tag name
 *
 * @param {String} html e.g. '<a hef="#">'
 * @return {String}
 */
function getTagName(html: string | any[]) {
  const i = _.spaceIndex(html)
  let tagName
  if (i === -1) {
    tagName = html.slice(1, -1)
  } else {
    tagName = html.slice(1, i + 1)
  }
  tagName = _.trim(tagName).toLowerCase()
  if (tagName.slice(0, 1) === '/') tagName = tagName.slice(1)
  if (tagName.slice(-1) === '/') tagName = tagName.slice(0, -1)
  return tagName
}

/**
 * is close tag?
 *
 * @param {String} html 如：'<a hef="#">'
 * @return {Boolean}
 */
function isClosing(html: string) {
  return html.slice(0, 2) === '</'
}

/**
 * parse input html and returns processed html
 *
 * @param {String} html
 * @param {Function} onTag e.g. function (sourcePosition, position, tag, html, isClosing)
 * @param {Function} escapeHtml
 * @return {String}
 */
export function parseTag(
  html: {
    length: any
    charAt: (arg0: number) => any
    slice: (arg0: number | boolean, arg1: number | boolean) => string
    substr: (arg0: number) => any
  },
  onTag: (
    arg0: boolean,
    arg1: number,
    arg2: string,
    arg3: string,
    arg4: boolean,
  ) => string,
  escapeHtml: (arg0: any) => string,
) {
  'use strict'

  let rethtml = ''
  let lastPos = 0
  let tagStart = false
  let quoteStart = false
  let currentPos = 0
  const len = html.length
  let currentTagName = ''
  let currentHtml = ''

  chariterator: for (currentPos = 0; currentPos < len; currentPos++) {
    const c = html.charAt(currentPos)
    if (tagStart === false) {
      if (c === '<') {
        tagStart = currentPos
        continue
      }
    } else {
      if (quoteStart === false) {
        if (c === '<') {
          rethtml += escapeHtml(html.slice(lastPos, currentPos))
          tagStart = currentPos
          lastPos = currentPos
          continue
        }
        if (c === '>' || currentPos === len - 1) {
          rethtml += escapeHtml(html.slice(lastPos, tagStart))
          currentHtml = html.slice(tagStart, currentPos + 1)
          currentTagName = getTagName(currentHtml)
          rethtml += onTag(
            tagStart,
            rethtml.length,
            currentTagName,
            currentHtml,
            isClosing(currentHtml),
          )
          lastPos = currentPos + 1
          tagStart = false
          continue
        }
        if (c === '"' || c === "'") {
          let i = 1
          let ic = html.charAt(currentPos - i)

          while (ic.trim() === '' || ic === '=') {
            if (ic === '=') {
              quoteStart = c
              continue chariterator
            }
            ic = html.charAt(currentPos - ++i)
          }
        }
      } else {
        if (c === quoteStart) {
          quoteStart = false
          continue
        }
      }
    }
  }
  if (lastPos < len) {
    rethtml += escapeHtml(html.substr(lastPos))
  }

  return rethtml
}

const REGEXP_ILLEGAL_ATTR_NAME = /[^a-zA-Z0-9\\_:.-]/gim

/**
 * parse input attributes and returns processed attributes
 *
 * @param {String} html e.g. `href="#" target="_blank"`
 * @param {Function} onAttr e.g. `function (name, value)`
 * @return {String}
 */
export function parseAttr(
  html: {
    length: number
    charAt: (arg0: number) => string
    slice: (arg0: number, arg1: number | undefined) => boolean
    indexOf: (arg0: any, arg1: number) => any
    replace: (arg0: RegExp, arg1: string) => any
  },
  onAttr: (arg0: any, arg1: any) => any,
) {
  'use strict'

  let lastPos = 0
  let lastMarkPos = 0
  const retAttrs: any[] = []
  let tmpName = false
  const len = html.length

  function addAttr(name: string | boolean, value: undefined) {
    name = _.trim(name)
    name = name.replace(REGEXP_ILLEGAL_ATTR_NAME, '').toLowerCase()
    if (name.length < 1) return
    const ret = onAttr(name, value || '')
    if (ret) retAttrs.push(ret)
  }

  // 逐个分析字符
  for (let i = 0; i < len; i++) {
    const c = html.charAt(i)
    let v, j
    if (tmpName === false && c === '=') {
      tmpName = html.slice(lastPos, i)
      lastPos = i + 1
      lastMarkPos =
        html.charAt(lastPos) === '"' || html.charAt(lastPos) === "'"
          ? lastPos
          : findNextQuotationMark(html, i + 1)
      continue
    }
    if (tmpName !== false) {
      if (i === lastMarkPos) {
        j = html.indexOf(c, i + 1)
        if (j === -1) {
          break
        } else {
          v = _.trim(html.slice(lastMarkPos + 1, j))
          addAttr(tmpName, v)
          tmpName = false
          i = j
          lastPos = i + 1
          continue
        }
      }
    }
    if (/\s|\n|\t/.test(c)) {
      html = html.replace(/\s|\n|\t/g, ' ')
      if (tmpName === false) {
        j = findNextEqual(html, i)
        if (j === -1) {
          v = _.trim(html.slice(lastPos, i))
          addAttr(v)
          tmpName = false
          lastPos = i + 1
          continue
        } else {
          i = j - 1
          continue
        }
      } else {
        j = findBeforeEqual(html, i - 1)
        if (j === -1) {
          v = _.trim(html.slice(lastPos, i))
          v = stripQuoteWrap(v)
          addAttr(tmpName, v)
          tmpName = false
          lastPos = i + 1
          continue
        } else {
          continue
        }
      }
    }
  }

  if (lastPos < html.length) {
    if (tmpName === false) {
      addAttr(html.slice(lastPos))
    } else {
      addAttr(tmpName, stripQuoteWrap(_.trim(html.slice(lastPos))))
    }
  }

  return _.trim(retAttrs.join(' '))
}

function findNextEqual(str: string | any[], i: number) {
  for (; i < str.length; i++) {
    const c = str[i]
    if (c === ' ') continue
    if (c === '=') return i
    return -1
  }
}

function findNextQuotationMark(str: string | any[], i: number) {
  for (; i < str.length; i++) {
    const c = str[i]
    if (c === ' ') continue
    if (c === "'" || c === '"') return i
    return -1
  }
}

function findBeforeEqual(str: { [x: string]: any }, i: number) {
  for (; i > 0; i--) {
    const c = str[i]
    if (c === ' ') continue
    if (c === '=') return i
    return -1
  }
}

function isQuoteWrapString(text: string | any[]) {
  if (
    (text[0] === '"' && text[text.length - 1] === '"') ||
    (text[0] === "'" && text[text.length - 1] === "'")
  ) {
    return true
  } else {
    return false
  }
}

function stripQuoteWrap(text: string) {
  if (isQuoteWrapString(text)) {
    return text.substr(1, text.length - 2)
  } else {
    return text
  }
}
