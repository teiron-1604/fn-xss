/**
 * xss
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

import { FilterXSS } from './xss'

export * from './xss'
export * from './default'
export * from './parser'

/**
 * filter xss function
 *
 * @param {String} html
 * @param {Object} options { whiteList, onTag, onTagAttr, onIgnoreTag, onIgnoreTagAttr, safeAttrValue, escapeHtml }
 * @return {String}
 */
export function filterXSS(html: any, options?: any) {
  // @ts-ignore
  var xss = new FilterXSS(options)
  return xss.process(html)
}

export { FilterXSS }

// using `xss` on the browser, output `filterXSS` to the globals
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.filterXSS = filterXSS
}

// using `xss` on the WebWorker, output `filterXSS` to the globals
function isWorkerEnv() {
  return (
    typeof self !== 'undefined' &&
    // @ts-ignore
    typeof DedicatedWorkerGlobalScope !== 'undefined' &&
    // @ts-ignore
    self instanceof DedicatedWorkerGlobalScope
  )
}
if (isWorkerEnv()) {
  // @ts-ignore
  self.filterXSS = filterXSS
}
