export const nextApproveUserBeforehand = {
  sourceTemplate: {
    approveNodeUsers: {
      type: 'select',
      labelText: '审批人',
      fieldName: '',
      placeholder: '选择节点审批人',
      colLayout: 'singleCol',
      fieldConfig: {
        multiple: false,
        disabled: false
      },
      options: [],
      rules: [
        {
          required: true
        }
      ]
    }
  },
  initDataSource: function (processDefinitionKey, vueInstance, res) {
    return new Promise((resolve, reject) => {
      if (!vueInstance) {
        console.error('vueInstance:' + vueInstance)
      }
      if (!processDefinitionKey) {
        console.error('processDefinitionKey:' + processDefinitionKey)
      }
      if (!vueInstance.selectUserBeforehandDataSource) {
        console.error('vueInstance.selectUserBeforehandDataSource:' + vueInstance.selectUserBeforehandDataSource)
      }
      if (!vueInstance.selectUserBeforehandFormData) {
        console.error('vueInstance.selectUserBeforehandFormData:' + vueInstance.selectUserBeforehandFormData)
      }
      let businessId = ''
      let businessIdList = []
      if (vueInstance.releaseMenuParams && vueInstance.releaseMenuParams.id) {
        businessId = vueInstance.releaseMenuParams.id
        businessIdList.push(businessId)
      }
      if (vueInstance.releaseMenuParams && vueInstance.releaseMenuParams.ids) {
        businessIdList = vueInstance.releaseMenuParams.ids
      }

      // vueInstance.$api['PersonalProcessApproval.beforehandTaskDefinition']({ processDefinitionKey: processDefinitionKey, businessIds: businessIdList }).then(res => {
        if (res && res.result && res.beforehand && res.userTasks && res.userTasks.length > 0) {
          vueInstance.selectUserBeforehandDataSource = []
          let template = Object.assign({}, this.sourceTemplate)
          let otherParams = res.taskOtherParams
          res.userTasks.forEach(instance => {
            let expressionText
            if (otherParams && otherParams[instance.key] && otherParams[instance.key].isMultiInstance === true) {
              expressionText = otherParams[instance.key].collectionExpressionText.trim().replace('$', '').replace('{', '').replace('}', '')
              template.approveNodeUsers.fieldConfig = { multiple: true, disabled: false }
              let values = []
              if (res.candidateUserMap[expressionText] && res.candidateUserMap[expressionText].length) {
                res.candidateUserMap[expressionText].map(item => {
                  values.push(item.value)
                })
               }
              vueInstance.selectUserBeforehandFormData[expressionText] = values
            } else {
              expressionText = instance.assigneeExpression.expressionText.trim().replace('$', '').replace('{', '').replace('}', '')
              template.approveNodeUsers.fieldConfig = { multiple: false }
              if (res.candidateUserMap[expressionText] && res.candidateUserMap[expressionText][0]) {
                // vueInstance.selectUserBeforehandFormData[expressionText] = res.candidateUserMap[expressionText][0].value
              }
            }
            template.approveNodeUsers.fieldName = expressionText
            template.approveNodeUsers.labelText = instance.nameExpression.expressionText
            template.approveNodeUsers.options = res.candidateUserMap[expressionText]
            vueInstance.selectUserBeforehandDataSource.push({ ...template.approveNodeUsers })
          })
          resolve(true)
        } else if (res && res.result && !res.beforehand) {
          resolve(false)
        } else {
          vueInstance.$message({
            message: '操作失败！' + res.resultMsg,
            type: 'warning'
          })
          resolve(false)
        }
      // }).catch(function (error) {
      //   reject(error)
      // })
    })
  }
}
