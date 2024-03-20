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
  // @ts-expect-error
  const xss = new FilterXSS(options)
  return xss.process(html)
}

export { FilterXSS }

// using `xss` on the browser, output `filterXSS` to the globals
if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.filterXSS = filterXSS
}

// using `xss` on the WebWorker, output `filterXSS` to the globals
function isWorkerEnv() {
  return (
    typeof self !== 'undefined' &&
    // @ts-expect-error
    typeof DedicatedWorkerGlobalScope !== 'undefined' &&
    // @ts-expect-error
    self instanceof DedicatedWorkerGlobalScope
  )
}
if (isWorkerEnv()) {
  // @ts-expect-error
  self.filterXSS = filterXSS
}
