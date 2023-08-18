export default {
  methods: {
    strToObj (data, defaultObj = {}) {
      let obj = {}
      if (typeof data === 'string') {
        obj = data ? JSON.parse(data) : defaultObj
      }
      return obj
    }
  }
}
