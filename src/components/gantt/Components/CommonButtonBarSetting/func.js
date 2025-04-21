import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
// import store from '@/plugins/store'
export const getButtonData = (panelData) => {
  if (!(Array.isArray(panelData) && panelData.length)) {
    return []
  }
  let buttonList = []
  panelData.forEach((plan) => {
    const groups = plan.groups
    if (assistFunc.isExecute(groups)) {
    } else {
      groups.forEach((group) => {
        const btnConfigs = group.buttonConfigs
        if (assistFunc.isExecute(btnConfigs)) {
          // if (group.groupName === '任务标识' && btnConfigs === 'command-monitor' && (group.position && group.position.indexOf('right') > -1)) {
          //   let monitorBtns = store.getters.monitorBtnsByApi.map(btn => {
          //     btn.position = group.position
          //     return btn
          //   })
          //   buttonList = buttonList.concat(monitorBtns)
          // }
          // if (group.groupName === '任务类型' && btnConfigs === 'command-classify' && (group.position && group.position.indexOf('right') > -1)) {
          //   let classifyBtns = store.getters.classifyBtnsByApi.map(btn => {
          //     btn.position = group.position
          //     return btn
          //   })
          //   buttonList = buttonList.concat(classifyBtns)
          // }
        } else {
          buttonList = buttonList.concat(assistFunc.getButton(btnConfigs))
        }
      })
    }
  })
  if (buttonList.length) {
    const endButtonList = buttonList.filter((btn) => btn.position.indexOf('right') > -1)
    return endButtonList.map((btn) => {
      const { title, id, icon } = btn
      return {
        title,
        buttonId: id,
        icon
      }
    })
  }
  return buttonList
}

const assistFunc = {
  isExecute: (configs) => {
    return configs.constructor === String
  },
  getButton: (btnConfigs) => {
    if (!(Array.isArray(btnConfigs) && btnConfigs.length)) {
      return []
    }
    const buttons = []
    btnConfigs.forEach((btnConfig) => {
      if (btnConfig.position.indexOf('right') > -1) {
        const btnData = CommandButtonData.filter((btn) => btn.id === btnConfig.buttonId)
        if (btnData.length) {
          btnData[0].position = btnConfig.position || []
          buttons.push(btnData[0])
        }
      }
    })
    return buttons
  }
}
