/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

import { FilterCSS } from './css'

export * from './css'
export * from './default'

/**
 * XSS过滤
 *
 * @param {String} css 要过滤的CSS代码
 * @param {Object} options 选项：whiteList, onAttr, onIgnoreAttr
 * @return {String}
 */
export function filterCSS(html: any, options?: any) {
  // @ts-expect-error
  const xss = new FilterCSS(options)
  return xss.process(html)
}

// 在浏览器端使用
if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.filterCSS = filterCSS
}
