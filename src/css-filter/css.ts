/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

import * as DEFAULT from './default'
import { parseStyle } from './parser'

/**
 * 返回值是否为空
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isNull(obj: null | undefined) {
  return obj === undefined || obj === null
}

/**
 * 浅拷贝对象
 *
 * @param {Object} obj
 * @return {Object}
 */
function shallowCopyObject(obj: { [x: string]: any }) {
  const ret: Record<any, any> = {}
  for (const i in obj) {
    ret[i] = obj[i]
  }
  return ret
}

/**
 * 创建CSS过滤器
 *
 * @param {Object} options
 *   - {Object} whiteList
 *   - {Function} onAttr
 *   - {Function} onIgnoreAttr
 *   - {Function} safeAttrValue
 */
export function FilterCSS(options?: {
  whiteList?: any
  onAttr?: any
  onIgnoreAttr?: any
  safeAttrValue?: any
}) {
  options = shallowCopyObject(options || {})
  options.whiteList = options.whiteList || DEFAULT.whiteList
  options.onAttr = options.onAttr || DEFAULT.onAttr
  options.onIgnoreAttr = options.onIgnoreAttr || DEFAULT.onIgnoreAttr
  options.safeAttrValue = options.safeAttrValue || DEFAULT.safeAttrValue
  // @ts-expect-error
  this.options = options
}

FilterCSS.prototype.process = function (css: string) {
  // 兼容各种奇葩输入
  css = css || ''
  css = css.toString()
  if (!css) return ''

  const options = this.options
  const whiteList = options.whiteList
  const onAttr = options.onAttr
  const onIgnoreAttr = options.onIgnoreAttr
  const safeAttrValue = options.safeAttrValue

  const retCSS = parseStyle(
    css,
    function (
      sourcePosition: any,
      position: any,
      name: string,
      value: string,
      source: any,
    ) {
      const check = whiteList[name]
      let isWhite = false
      if (check === true) isWhite = check
      else if (typeof check === 'function') isWhite = check(value)
      else if (check instanceof RegExp) isWhite = check.test(value)
      if (isWhite !== true) isWhite = false

      // 如果过滤后 value 为空则直接忽略
      value = safeAttrValue(name, value)
      if (!value) return

      const opts = {
        position: position,
        sourcePosition: sourcePosition,
        source: source,
        isWhite: isWhite,
      }

      if (isWhite) {
        const ret = onAttr(name, value, opts)
        if (isNull(ret)) {
          return name + ':' + value
        } else {
          return ret
        }
      } else {
        const ret = onIgnoreAttr(name, value, opts)
        if (!isNull(ret)) {
          return ret
        }
      }
    },
  )

  return retCSS
}
