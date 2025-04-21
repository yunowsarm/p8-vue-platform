/**
 * 工作流公用方法
 *
 */
import api from '@/plugins/api'
const workFlowObj = {
  actions: {
    findWorkFlowView(params) {
      return new Promise((resolve, reject) => {
        api['ProcessDefinition.getfindWorkFlowView'](params)
          .then((res) => {
            if (res) {
              resolve({ processDefinitionId: res.processDefinitionId, processInstanceId: res.processInstanceId })
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }
}

export default workFlowObj
