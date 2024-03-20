/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

/**
 * 解析style
 *
 * @param {String} css
 * @param {Function} onAttr 处理属性的函数
 *   参数格式： function (sourcePosition, position, name, value, source)
 * @return {String}
 */
export function parseStyle(
  css: string,
  onAttr: (arg0: number, arg1: number, arg2: any, arg3: any, arg4: any) => any,
) {
  css = css.trimEnd()
  if (css[css.length - 1] !== ';') css += ';'
  const cssLength = css.length
  let isParenthesisOpen = false
  let lastPos = 0
  let i = 0
  let retCSS = ''

  function addNewAttr() {
    // 如果没有正常的闭合圆括号，则直接忽略当前属性
    if (!isParenthesisOpen) {
      const source = css.slice(lastPos, i).trim()
      const j = source.indexOf(':')
      if (j !== -1) {
        const name = source.slice(0, j).trim()
        const value = source.slice(j + 1).trim()
        // 必须有属性名称
        if (name) {
          const ret = onAttr(lastPos, retCSS.length, name, value, source)
          if (ret) retCSS += ret + '; '
        }
      }
    }
    lastPos = i + 1
  }

  for (; i < cssLength; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      // 备注开始
      const j = css.indexOf('*/', i + 2)
      // 如果没有正常的备注结束，则后面的部分全部跳过
      if (j === -1) break
      // 直接将当前位置调到备注结尾，并且初始化状态
      i = j + 1
      lastPos = i + 1
      isParenthesisOpen = false
    } else if (c === '(') {
      isParenthesisOpen = true
    } else if (c === ')') {
      isParenthesisOpen = false
    } else if (c === ';') {
      if (isParenthesisOpen) {
        // 在圆括号里面，忽略
      } else {
        addNewAttr()
      }
    } else if (c === '\n') {
      addNewAttr()
    }
  }

  return retCSS.trim()
}
