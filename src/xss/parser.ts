// @ts-nocheck

/**
 * Simple HTML Parser
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

import { spaceIndex } from '../shared/utils'

/**
 * get tag name
 *
 * @param {String} html e.g. '<a hef="#">'
 * @return {String}
 */
function getTagName(html: string) {
  const i = spaceIndex(html)
  let tagName
  if (i === -1) {
    tagName = html.slice(1, -1)
  } else {
    tagName = html.slice(1, i + 1)
  }
  tagName = tagName.trim().toLowerCase()
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
 */
export function parseTag(
  html: string,
  onTag: (
    sourcePosition: boolean,
    position: number,
    tag: string,
    html: string,
    isClosing: boolean,
  ) => string,
  escapeHtml: (html: any) => string,
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
  html: string,
  onAttr: (name: any, value: any) => any,
) {
  'use strict'

  let lastPos = 0
  let lastMarkPos = 0
  const retAttrs: any[] = []
  let tmpName = false
  const len = html.length

  function addAttr(name: string | boolean, value: undefined) {
    name = name.trim()
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
          v = html.slice(lastMarkPos + 1, j).trim()
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
          v = html.slice(lastPos, i).trim()
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
          v = html.slice(lastPos, i).trim()
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
      addAttr(tmpName, stripQuoteWrap(html.slice(lastPos).trim()))
    }
  }

  return retAttrs.join(' ').trim()
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
