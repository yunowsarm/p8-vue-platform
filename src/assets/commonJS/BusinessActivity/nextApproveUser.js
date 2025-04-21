export const nextApproveUser = {
  sourceTemplate: {
    processInstanceEl: {
      type: 'alert',
      effect: 'light',
      alertType: 'info',
      labelText: '',
      fieldName: 'businessName',
      disabled: true,
      colLayout: 'singleCol',
      fieldConfig: {
        disabled: true
      }
    },
    approveNode: {
      type: 'select',
      labelText: '审批节点',
      fieldName: 'nextTaskNodeId',
      options: [],
      multiple: false,
      disabled: true,
      placeholder: '选择节点',
      colLayout: 'doubleCol',
      fieldConfig: {
        disabled: true
      }
    },
    approveNodeUsers: {
      type: 'treeSelect',
      labelText: '审批人',
      fieldName: '',
      placeholder: '选择节点审批人',
      colLayout: 'doubleCol',
      treeData: []
    }
  },
  initDataSource: function (approveTime, processInstanceIds, vueInstance) {
    return new Promise((resolve, reject) => {
      if (!approveTime) {
        console.error('approveTime:' + approveTime)
      }
      if (!vueInstance) {
        console.error('vueInstance:' + vueInstance)
      }
      if (!processInstanceIds) {
        console.error('processInstanceIds:' + processInstanceIds)
      }
      if (!vueInstance.selectUserDataSource) {
        console.error('vueInstance.selectUserDataSource:' + vueInstance.selectUserDataSource)
      }
      if (!vueInstance.selectUserFormData) {
        console.error('vueInstance.selectUserFormData:' + vueInstance.selectUserFormData)
      }

      vueInstance.$api['PersonalProcessApproval.getNextApproveUser']({ approveTime, processInstanceIds })
        .then((res) => {
          let hasUserTask = false
          if (res && res.length > 0) {
            vueInstance.selectUserDataSource = []
            let template = Object.assign({}, this.sourceTemplate)
            res.forEach((instance) => {
              let i = 1
              template.processInstanceEl.fieldName = instance.businessKey
              template.processInstanceEl.labelText = instance.businessName
              // vueInstance.selectUserFormData[instance.businessKey] = instance.businessName
              vueInstance.selectUserDataSource.push({ ...template.processInstanceEl })
              instance.tasks.forEach((item) => {
                hasUserTask = true
                template.approveNode.fieldName = 'task' + item.id
                if (item.multiple) {
                  template.approveNode.labelText = '审批节点(会签)' + i
                  vueInstance.selectUserFormData['isMultiple' + item.id] = item.multiple
                } else {
                  template.approveNode.labelText = '审批节点'
                  vueInstance.selectUserFormData['isMultiple' + item.id] = item.multiple
                }
                template.approveNode.options = res

                vueInstance.selectUserFormData['task' + item.id] = item.label

                template.approveNodeUsers.treeData = item.nextApproveUsers
                template.approveNodeUsers.multiple = item.multiple
                template.approveNodeUsers.fieldName = 'user' + item.id

                if (item.nextApproveUsers && item.nextApproveUsers[0] && item.nextApproveUsers[0].children && item.nextApproveUsers[0].children[0]) {
                  if (item.multiple) {
                    vueInstance.selectUserFormData['user' + item.id] = item.nextApproveUsers[0].children.map((item) => item.id)
                  } else {
                    vueInstance.selectUserFormData['user' + item.id] = item.nextApproveUsers[0].children[0].id
                  }
                } else {
                  vueInstance.selectUserFormData['user' + item.id] = ''
                }
                vueInstance.selectUserDataSource.push({ ...template.approveNode })
                vueInstance.selectUserDataSource.push({ ...template.approveNodeUsers })
                i++
              })
            })
            resolve(hasUserTask)
          }
          resolve(hasUserTask)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
}
