/**
 * To Promise extends
 * =================================================================
 * A extend Promise function to write async await without
 * try catch block, it can make your code stronger and simply to
 * read
 * =================================================================
 * how to use:
 *
 * before:
 * async getData () {
 *  try {
 *     const res = await this.$api['getData'](params)
 *  } catch (e) {
 *    //
 *  }
 * }
 *
 * after:
 * async getData() {
 *    const [err, res] = await this.$to(this.$api['getData'](params))
 *    if(!err) {
 *      // do sth with result
 *    }
 * }
 * ====================================================================
 * Author: Vicco Wang
 * Date: 2019.05.27
 * ====================================================================
 *
 */

/**
 *
 * @param {*} promise
 */
function isPromise(promise) {
  if (!promise) return false
  if (promise && Promise.prototype.isPrototypeOf(promise)) return true
  return false
}

/**
 *
 * @param {*} promise
 */
function To(promise) {
  //
  if (isPromise) {
    return promise
      .then((res) => {
        return [null, res]
      })
      .catch((err) => {
        return [err]
      })
  } else {
    return [new Error('the params is not a Promise Object.')]
  }
}

export default {
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$to', {
      value: To
    })
  }
}
