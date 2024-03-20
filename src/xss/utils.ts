// @ts-nocheck
export default {
  indexOf: function (arr, item) {
    let i, j
    if (Array.prototype.indexOf) {
      return arr.indexOf(item)
    }
    for (i = 0, j = arr.length; i < j; i++) {
      if (arr[i] === item) {
        return i
      }
    }
    return -1
  },
  forEach: function (arr, fn, scope) {
    let i, j
    if (Array.prototype.forEach) {
      return arr.forEach(fn, scope)
    }
    for (i = 0, j = arr.length; i < j; i++) {
      fn.call(scope, arr[i], i, arr)
    }
  },
  trim: function (str) {
    if (String.prototype.trim) {
      return str.trim()
    }
    return str.replace(/(^\s*)|(\s*$)/g, '')
  },
  spaceIndex: function (str) {
    const reg = /\s|\n|\t/
    const match = reg.exec(str)
    return match ? match.index : -1
  },
}
