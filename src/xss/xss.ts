// @ts-nocheck

/**
 * filter xss
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

import { spaceIndex } from '../shared/utils'
import { FilterCSS } from '../css-filter'
import * as DEFAULT from './default'
import { parseTag, parseAttr } from './parser'

/**
 * returns `true` if the input value is `undefined` or `null`
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isNull(obj: unknown): obj is null {
  return obj === undefined || obj === null
}

/**
 * get attributes for a tag
 *
 * @param {String} html
 * @return {Object}
 *   - {String} html
 *   - {Boolean} closing
 */
function getAttrs(html) {
  const i = spaceIndex(html)
  if (i === -1) {
    return {
      html: '',
      closing: html[html.length - 2] === '/',
    }
  }
  html = html.slice(i + 1, -1).trim()
  const isClosing = html[html.length - 1] === '/'
  if (isClosing) html = html.slice(0, -1).trim()
  return {
    html: html,
    closing: isClosing,
  }
}

/**
 * shallow copy
 *
 * @param {Object} obj
 * @return {Object}
 */
function shallowCopyObject(obj) {
  const ret = {}
  for (const i in obj) {
    ret[i] = obj[i]
  }
  return ret
}

function keysToLowerCase(obj) {
  const ret = {}
  for (const i in obj) {
    if (Array.isArray(obj[i])) {
      ret[i.toLowerCase()] = obj[i].map(function (item) {
        return item.toLowerCase()
      })
    } else {
      ret[i.toLowerCase()] = obj[i]
    }
  }
  return ret
}

/**
 * FilterXSS class
 *
 * @param {Object} options
 *        whiteList (or allowList), onTag, onTagAttr, onIgnoreTag,
 *        onIgnoreTagAttr, safeAttrValue, escapeHtml
 *        stripIgnoreTagBody, allowCommentTag, stripBlankChar
 *        css{whiteList, onAttr, onIgnoreAttr} `css=false` means don't use `cssfilter`
 */
export function FilterXSS(options) {
  options = shallowCopyObject(options || {})

  if (options.stripIgnoreTag) {
    if (options.onIgnoreTag) {
      console.error(
        'Notes: cannot use these two options "stripIgnoreTag" and "onIgnoreTag" at the same time',
      )
    }
    options.onIgnoreTag = DEFAULT.onIgnoreTagStripAll
  }
  if (options.whiteList || options.allowList) {
    options.whiteList = keysToLowerCase(options.whiteList || options.allowList)
  } else {
    options.whiteList = DEFAULT.whiteList
  }

  this.attributeWrapSign =
    options.singleQuotedAttributeValue === true
      ? "'"
      : DEFAULT.attributeWrapSign

  options.onTag = options.onTag || DEFAULT.onTag
  options.onTagAttr = options.onTagAttr || DEFAULT.onTagAttr
  options.onIgnoreTag = options.onIgnoreTag || DEFAULT.onIgnoreTag
  options.onIgnoreTagAttr = options.onIgnoreTagAttr || DEFAULT.onIgnoreTagAttr
  options.safeAttrValue = options.safeAttrValue || DEFAULT.safeAttrValue
  options.escapeHtml = options.escapeHtml || DEFAULT.escapeHtml
  this.options = options

  if (options.css === false) {
    this.cssFilter = false
  } else {
    options.css = options.css || {}
    this.cssFilter = new FilterCSS(options.css)
  }
}

/**
 * start process and returns result
 *
 * @param {String} html
 * @return {String}
 */
FilterXSS.prototype.process = function (html) {
  // compatible with the input
  html = html || ''
  html = html.toString()
  if (!html) return ''

  const options = this.options
  const whiteList = options.whiteList
  const onTag = options.onTag
  let onIgnoreTag = options.onIgnoreTag
  const onTagAttr = options.onTagAttr
  const onIgnoreTagAttr = options.onIgnoreTagAttr
  const safeAttrValue = options.safeAttrValue
  const escapeHtml = options.escapeHtml
  const attributeWrapSign = this.attributeWrapSign
  const cssFilter = this.cssFilter

  // remove invisible characters
  if (options.stripBlankChar) {
    html = DEFAULT.stripBlankChar(html)
  }

  // remove html comments
  if (!options.allowCommentTag) {
    html = DEFAULT.removeCommentTag(html)
  }

  // if enable stripIgnoreTagBody
  let stripIgnoreTagBody = false
  if (options.stripIgnoreTagBody) {
    stripIgnoreTagBody = DEFAULT.StripTagBody(
      options.stripIgnoreTagBody,
      onIgnoreTag,
    )
    onIgnoreTag = stripIgnoreTagBody.onIgnoreTag
  }

  let retHtml = parseTag(
    html,
    function (sourcePosition, position, tag, html, isClosing) {
      const info = {
        sourcePosition: sourcePosition,
        position: position,
        isClosing: isClosing,
        isWhite: Object.prototype.hasOwnProperty.call(whiteList, tag),
      }

      // call `onTag()`
      let ret = onTag(tag, html, info)
      if (!isNull(ret)) return ret

      if (info.isWhite) {
        if (info.isClosing) {
          return '</' + tag + '>'
        }

        const attrs = getAttrs(html)
        const whiteAttrList = whiteList[tag]
        const attrsHtml = parseAttr(attrs.html, function (name, value) {
          // call `onTagAttr()`
          const isWhiteAttr = whiteAttrList.indexOf(name) !== -1
          let ret = onTagAttr(tag, name, value, isWhiteAttr)
          if (!isNull(ret)) return ret

          if (isWhiteAttr) {
            // call `safeAttrValue()`
            value = safeAttrValue(tag, name, value, cssFilter)
            if (value) {
              return name + '=' + attributeWrapSign + value + attributeWrapSign
            } else {
              return name
            }
          } else {
            // call `onIgnoreTagAttr()`
            ret = onIgnoreTagAttr(tag, name, value, isWhiteAttr)
            if (!isNull(ret)) return ret
            return
          }
        })

        // build new tag html
        html = '<' + tag
        if (attrsHtml) html += ' ' + attrsHtml
        if (attrs.closing) html += ' /'
        html += '>'
        return html
      } else {
        // call `onIgnoreTag()`
        ret = onIgnoreTag(tag, html, info)
        if (!isNull(ret)) return ret
        return escapeHtml(html)
      }
    },
    escapeHtml,
  )

  // if enable stripIgnoreTagBody
  if (stripIgnoreTagBody) {
    retHtml = stripIgnoreTagBody.remove(retHtml)
  }

  return retHtml
}
