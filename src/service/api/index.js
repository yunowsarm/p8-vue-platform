/**
 *
 *
 */
const requireModules = require.context('./modules/', false, /\.js$/)
let modules = {}
requireModules.keys().forEach((moduleName) => {
  moduleName = requireModules(moduleName)
  for (let value of Object.values(moduleName)) {
    Object.assign(modules, value)
  }
})

export default modules
