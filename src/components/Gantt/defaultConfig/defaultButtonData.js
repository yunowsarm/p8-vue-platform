import api from '@/plugins/api'
import store from '@/plugins/store'
import moment from 'moment'

const changeColor = '#FF0000;'

export const defaultButtonData = [
  {
    id: 'create-children',
    icon: 'p8 icon-new-subordinate',
    title: '新建下级',
    help: '新建下级',
    clickFun: function (btn, ganttObject, tasks) {
      noDpAddTask(1, 'Child', ganttObject)
    },
    isDisableFun: function (btn, ganttObject, tasks) {},
    children: [
      {
        id: 'create-children-two',
        icon: 'p8 icon-new-subordinate',
        title: '2 条',
        help: '新建2条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(2, 'Child', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {}
      },
      {
        id: 'create-children-four',
        icon: 'p8 icon-new-subordinate',
        title: '4 条',
        help: '新建4条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(4, 'Child', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {}
      },
      {
        id: 'create-children-six',
        icon: 'p8 icon-new-subordinate',
        title: '6 条',
        help: '新建6条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(6, 'Child', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {}
      },
      {
        id: 'create-children-eight',
        icon: 'p8 icon-new-subordinate',
        title: '8 条',
        help: '新建8条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(8, 'Child', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {}
      },
      {
        id: 'createByNum',
        icon: 'p8 icon-new-subordinate',
        createNum: Number,
        title: '其他数量',
        help: '其他数量',
        clickFun: function (btn, ganttObject, tasks, createNum) {
          const vueThis = store.getters.vueThis
          noDpAddTask(createNum, 'Child', ganttObject)
          vueThis.menuVisible = false
        },
        isDisableFun: function (btn, ganttObject, tasks) {}
      }
    ]
  },
  {
    id: 'create-equative',
    icon: 'p8 icon-new-sibling',
    title: '新建同级',
    help: '新建同级',
    clickFun: function (btn, ganttObject, tasks) {
      noDpAddTask(1, 'Before', ganttObject)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      if (ganttObject && tasks.length > 0) {
        const task = ganttObject.getTask(tasks[0].id)
        if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
          return true
        }
      }
    },
    children: [
      {
        id: 'create-equative-two',
        icon: 'p8 icon-new-sibling',
        title: '2 条',
        help: '新建2条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(2, 'Before', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {
          if (ganttObject && tasks.length > 0) {
            const task = ganttObject.getTask(tasks[0].id)
            if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
              return true
            }
          }
        }
      },
      {
        id: 'create-equative-four',
        icon: 'p8 icon-new-sibling',
        title: '4 条',
        help: '新建4条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(4, 'Before', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {
          if (ganttObject && tasks.length > 0) {
            const task = ganttObject.getTask(tasks[0].id)
            if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
              return true
            }
          }
        }
      },
      {
        id: 'create-equative-six',
        icon: 'p8 icon-new-sibling',
        title: '6 条',
        help: '新建6条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(6, 'Before', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {
          if (ganttObject && tasks.length > 0) {
            const task = ganttObject.getTask(tasks[0].id)
            if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
              return true
            }
          }
        }
      },
      {
        id: 'create-equative-eight',
        icon: 'p8 icon-new-sibling',
        title: '8 条',
        help: '新建8条',
        clickFun: function (btn, ganttObject, tasks) {
          noDpAddTask(8, 'Before', ganttObject)
        },
        isDisableFun: function (btn, ganttObject, tasks) {
          if (ganttObject && tasks.length > 0) {
            const task = ganttObject.getTask(tasks[0].id)
            if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
              return true
            }
          }
        }
      }
    ]
  },
  {
    id: 'remove-tasks',
    icon: 'p8 icon-delete',
    title: '删除',
    help: '删除',
    clickFun: function (btn, ganttObject, tasks) {
      removeTasks(ganttObject)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      return checkContentRoot(ganttObject, tasks)
    }
  },
  {
    id: 'outdent-task',
    icon: 'p8 icon-upgrade',
    title: '升级',
    help: '升级',
    clickFun: function (btn, ganttObject, tasks) {
      ganttObject.performAction('outdentAction', ganttObject)
      ganttObject.refreshData()
    },
    isDisableFun: function (btn, ganttObject, tasks) {}
  },
  {
    id: 'indent-task',
    icon: 'p8 icon-downgrade',
    title: '降级',
    help: '降级',
    clickFun: function (btn, ganttObject, tasks) {
      ganttObject.performAction('indentAction', ganttObject)
      ganttObject.refreshData()
    },
    isDisableFun: function (btn, ganttObject, tasks) {}
  },
  {
    id: 'copy-tasks',
    icon: 'p8 icon-copy',
    title: '复制',
    help: '复制',
    clickFun: function (btn, ganttObject, tasks) {},
    isDisableFun: function (btn, ganttObject, tasks) {}
  },
  {
    id: 'paste-tasks',
    icon: 'p8 icon-paste',
    title: '粘贴',
    help: '粘贴',
    clickFun: function (btn, ganttObject, tasks) {},
    isDisableFun: function (btn, ganttObject, tasks) {}
  },
  {
    id: 'find-history-view',
    icon: 'p8 icon-view',
    title: '查看流程图',
    help: '查看流程图',
    clickFun: function (btn, ganttObject, tasks) {},
    isDisableFun: function (btn, ganttObject, tasks) {}
  },
  {
    id: 'color-red',
    icon: '#ff0000', // 页面显示style样式
    title: '红色',
    style: 'color:#ff0000;', // css样式
    help: '红色',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3', btn)) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'color-blue',
    icon: '#00B0F0', // 页面显示style样式
    title: '蓝色',
    style: 'color:#00B0F0;', // css样式
    help: '蓝色',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'color-green',
    icon: '#00B050', // 页面显示style样式
    title: '绿色',
    style: 'color:#00B050;', // css样式
    help: '绿色',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'color-purple',
    icon: '#FFC000', // 页面显示style样式
    title: '橙色',
    style: 'color:#FFC000;', // css样式
    help: '橙色',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'font-bold',
    icon: 'p8 icon-bold',
    title: '加粗',
    style: 'font-weight:bold;', // css样式
    help: '加粗',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'font-italic',
    icon: 'p8 icon-italic',
    title: '斜体',
    style: 'font-style:italic;', // css样式
    help: '斜体',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'font-underline',
    icon: 'p8 icon-underline',
    title: '下划线',
    style: 'text-decoration:underline;', // css样式
    help: '下划线',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'removeStyle',
    icon: 'p8 icon-delete',
    title: '取消样式',
    help: '取消样式',
    clickFun: function (btn, ganttObject, tasks) {
      updateTaskStyle(ganttObject, tasks, btn)
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'plan-edit-gantt',
    icon: 'p8 icon-edit-view',
    title: '编辑视图',
    help: '编辑视图',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (ganttObject) {
        // 清空选中
        ganttObject.eachSelectedTask(function (id) {
          ganttObject.unselectTask(id)
        })
        vueThis.layoutType = 'grid'
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (vueThis.layoutType && vueThis.layoutType !== 'grid') {
        return false
      }
      return true
    }
  },
  {
    id: 'plan-gantt',
    icon: 'p8 icon-gantt',
    title: 'gantt图',
    help: 'gantt图',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (ganttObject) {
        // 清空选中
        ganttObject.eachSelectedTask(function (id) {
          ganttObject.unselectTask(id)
        })
        vueThis.layoutType = 'gantt'
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (vueThis.layoutType && vueThis.layoutType !== 'gantt') {
        return false
      }
      return true
    }
  },
  {
    id: 'plan-gantt-resource',
    icon: 'p8 icon-resource-view',
    title: '资源视图',
    help: '资源视图',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (ganttObject) {
        // 清空选中
        ganttObject.eachSelectedTask(function (id) {
          ganttObject.unselectTask(id)
        })
        vueThis.layoutType = 'resource'
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (vueThis.layoutType && vueThis.layoutType !== 'resource') {
        return false
      }
      return true
    }
  },
  {
    id: 'full-screen',
    icon: 'p8 icon-full-screen',
    title: '全屏',
    help: '全屏',
    clickFun: function (btn, ganttObject, tasks) {
      // 全屏监听
      ganttObject.ext.fullscreen.getFullscreenElement = function () {
        return document.querySelector('#planGantt')
      }
      ganttObject.ext.fullscreen.toggle()
      if (btn.title === '全屏') {
        btn.title = '退出全屏'
        btn.icon = 'p8 icon-exit-fullscreen'
        btn.help = '退出全屏'
      } else {
        btn.title = '全屏'
        btn.icon = 'p8 icon-full-screen'
        btn.help = '全屏'
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      return false
    }
  },
  {
    id: 'critical-path',
    icon: 'p8 icon-critical-path',
    title: '关键路径',
    help: '关键路径',
    clickFun: function (btn, ganttObject, tasks) {
      if (ganttObject) {
        if (ganttObject.config.highlight_critical_path) {
          ganttObject.config.highlight_critical_path = false
        } else {
          ganttObject.config.highlight_critical_path = true
        }
        ganttObject.render()
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      return false
    }
  },
  {
    id: 'excel-import',
    icon: 'p8 icon-excel-import',
    title: 'Excel导入',
    help: 'Excel导入',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.importExcel = true
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '1')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'project-import',
    icon: 'p8 icon-project-import',
    title: 'Project导入',
    help: 'Project导入',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (vueThis.isGTL) {
        vueThis.importProjects = true
      } else {
        vueThis.importProject = true
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      let result
      if (isDisableFunCheck(ganttObject, tasks, '1')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'excel-export',
    icon: 'p8 icon-excel-export',
    title: 'Excel导出',
    help: 'Excel导出',
    clickFun: function (btn, ganttObject, tasks, data, messages) {
      const vueThis = store.getters.vueThis
      const planInfoId = vueThis.planInfoId
      if (!vueThis.exportExcelApi) {
        vueThis.$message.warning('请先配置Excel导出的接口地址')
        return
      }

      api[vueThis.exportExcelApi]({ planInfoId: planInfoId }, { responseType: 'blob' })
        .then((data) => {
          const fileName = 'Excel导出计划' + '-' + moment().format('YYYYMMDD')
          const fileType = 'xls'
          const blob = new Blob([data.data], {
            type: 'application/vnd.ms-excel'
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = `${fileName}.${fileType}`
          document.body.appendChild(link)
          link.click()
        })
        .catch((erro) => {
          vueThis.$message({
            message: 'excel导出失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      return false
    }
  },
  {
    id: 'project-export',
    icon: 'p8 icon-project-export',
    title: 'Project导出',
    help: 'Project导出',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      const taskId = vueThis.taskId
      const planInfoId = vueThis.planInfoId

      api['planGanttManager.excelProject']({ planInfoId: planInfoId, dicType: 'ACTIVITY_TYPE', taskId: taskId }, { responseType: 'blob' })
        .then((data) => {
          const date = new Date()
          // eslint-disable-next-line camelcase
          const file_name = '计划编制数据导出' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          // eslint-disable-next-line camelcase
          const file_type = 'xml'
          const blob = new Blob([data.data], {
            type: 'application/octet-stream'
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          // eslint-disable-next-line camelcase
          link.download = `${file_name}.${file_type}`
          document.body.appendChild(link)
          link.click()
        })
        .catch((erro) => {
          vueThis.$message({
            message: 'Project导出失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      return false
    }
  },
  {
    id: 'grid-setting',
    icon: 'p8 icon-version-list',
    title: '列设置',
    help: '列设置',
    clickFun: function (btn, ganttObject, tasks) {
      const vueThis = store.getters.vueThis
      if (vueThis && Object.keys(vueThis).length) {
        vueThis.renderColumns = ganttObject.config.columns.filter((i) => {
          return !vueThis.flexColumns.includes(i.name)
        })
        vueThis.selectGridVisible = true
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {
      return false
    }
  },
  {
    id: 'menu-config',
    icon: 'p8 icon-menu-config',
    title: '菜单配置',
    help: '菜单配置',
    clickFun: function (btn, ganttObject, tasks) {
      if (ganttObject) {
        const vueThis = store.getters.vueThis
        vueThis.rightMenuConfigVisible = true
      }
    },
    isDisableFun: function (btn, ganttObject, tasks) {}
  }
]

/**
 * @Description 任务删除
 * @author wzf
 * @date 2020/5/8 15:33
 */
function removeTasks(ganttObject) {
  const vueThis = store.getters.vueThis
  const selectedTaskId = ganttObject.getSelectedTasks()
  vueThis.deleteTask(selectedTaskId)
  selectedTaskId.forEach((id) => {
    ganttObject.deleteTask(id)
  })
  vueThis.taskCount = ganttObject.getTaskCount()
}

/**
 * 前台创建任务，不与后台交互
 * @param num
 * @param pos
 * @param ganttObject
 */
export function noDpAddTask(num, pos, ganttObject) {
  if (ganttObject) {
    const taskId = ganttObject.getSelectedId()
    const task = ganttObject.getTask(taskId)
    const taskIndexNo = ganttObject.getTaskIndex(taskId) // 分支indexNo
    const vueThis = store.getters.vueThis
    const style = changeColor
    const parent = ganttObject.getTask(task.parent)
    switch (pos) {
      case 'Before':
        // 同级上方插入
        noDpCreateTask(ganttObject, num, parent, 'Before', '新任务', taskIndexNo, parent.autoScheduling, vueThis, style)
        break
      case 'After':
        // 同级下方插入
        noDpCreateTask(ganttObject, num, parent, 'After', '新任务', taskIndexNo + 1, parent.autoScheduling, vueThis, style)
        break
      case 'Child':
        // 新建下级--在最后
        noDpCreateTask(ganttObject, num, task, 'Child', '新任务', null, task.autoScheduling, vueThis, style)
        task.$open = true
        vueThis.taskCount = vueThis.taskCount + num
        break
    }
  }
}

/**
 * 任务创建，不与后台交互
 * @param ganttObject
 * @param num
 * @param parent
 * @param pos
 * @param taskName
 * @param indexNo
 * @param autoScheduling
 * @param vueThis
 * @param style
 */
function noDpCreateTask(ganttObject, num, parent, pos, taskName, indexNo, autoScheduling, vueThis, style) {
  function save(tasks) {
    ganttObject.batchUpdate(function () {
      tasks.forEach((task, i) => {
        switch (pos) {
          case 'Child': // 新建子在最后
            ganttObject.addTask(task, parent.id, 99999 + i)
            if (parent.autoScheduling === 1 && parent.type === 'task' && ganttObject.getGlobalTaskIndex(parent.id) !== 0) {
              parent.type = 'project'
            }
            break
          default:
            ganttObject.addTask(task, parent.id, indexNo++)
            break
        }
      })
      vueThis.taskCount = ganttObject.getTaskCount()
    })
  }

  vueThis.createTask(num, parent, save)
}

/**
 * 任务样式添加及取消
 * @param {*} thisGantt
 * @param {*} thisDp
 * @param {*} tasks
 * @param {*} btnId
 */
function updateTaskStyle(ganttObject, tasks, btn) {
  if (ganttObject && btn) {
    const vueThis = store.getters.vueThis
    const taskStyles = vueThis.dictionary.taskStyle
    const selTaskStyles = {}
    let planInfoId = ''
    tasks.forEach(function (task) {
      const oldTaskStyle = taskStyles[task.id] ? taskStyles[task.id] : ''
      if (planInfoId === '') {
        planInfoId = task.planInfoId
      }
      if (btn.id.startsWith('color-')) {
        // 颜色（只能有一个，设置新颜色时替换原先颜色）
        if (oldTaskStyle && oldTaskStyle.indexOf('color:') !== -1) {
          if (oldTaskStyle && oldTaskStyle.indexOf(btn.style) !== -1) {
          } else {
            const startIndex = oldTaskStyle.indexOf('color:')
            const endIndex = oldTaskStyle.indexOf('color:') + btn.style.length
            const reg1 = new RegExp(oldTaskStyle.substring(startIndex, endIndex), 'g')
            const reg2 = new RegExp('"', 'g')
            selTaskStyles[task.id] = JSON.stringify(oldTaskStyle).replace(reg1, btn.style).replace(reg2, '')
          }
        } else {
          selTaskStyles[task.id] = oldTaskStyle + btn.style
        }
      } else if (btn.id === 'removeStyle') {
        // 删除样式（删除所有样式）
        if (oldTaskStyle) {
          // 减少数据量
          selTaskStyles[task.id] = ''
        }
      } else {
        // 字体（可以共存）
        if (oldTaskStyle && oldTaskStyle.indexOf(btn.style) !== -1) {
        } else {
          selTaskStyles[task.id] = oldTaskStyle + btn.style
        }
      }
    })
    if (JSON.stringify(selTaskStyles) !== '{}') {
      api['planGanttManager.updateTaskStyle']({
        taskStyles: selTaskStyles,
        planInfoId: planInfoId
      })
        .then(function (res) {
          if (res) {
            if (res === 'true') {
              for (const key in selTaskStyles) {
                if (selTaskStyles[key]) {
                  vueThis.dictionary.taskStyle[key] = selTaskStyles[key]
                } else {
                  delete vueThis.dictionary.taskStyle[key]
                }
              }
              ganttObject.refreshData()
            } else {
              vueThis.$message({
                message: '任务样式修改失败！',
                type: 'error'
              })
            }
          }
        })
        .catch((err) => {
          console.error(err, 'err')
          vueThis.$message({
            message: '任务样式修改失败！',
            type: 'error'
          })
        })
    }
  }
}

/**
 * 通用按钮禁用条件
 * @param ganttObject
 * @param tasks
 * @returns {boolean}
 */
function isDisableFunCheck(ganttObject, tasks, checkType, btn) {
  let result = false
  if (ganttObject && Object.keys(ganttObject).length > 0) {
    const taskIds = ganttObject.getSelectedTasks()
    if (!checkReadOnly(ganttObject) && taskIds && !checkTaskReadonly(ganttObject, tasks) && !ganttObject.config.readonly) {
      if (checkType === '1' && taskIds.length === 1) {
        result = true
      } else if (checkType === '2' && taskIds.length === 1 && !checkContentRoot(ganttObject, tasks)) {
        result = true
      } else if (checkType === '3' && taskIds.length > 0 && !checkContentRoot(ganttObject, tasks)) {
        result = true
      }
    }
  }
  return result
}

/**
 * 检查任务readonly属性，为true时，任务不可操作
 * @param ganttObject
 * @param tasks
 * @returns {boolean}
 */
function checkTaskReadonly(ganttObject, tasks) {
  let result = false
  ganttObject.eachSelectedTask(function (taskId) {
    const task = ganttObject.getTask(taskId)
    if (task.readonly && !result) {
      result = true
    }
  })
  return result
}

/**
 * @Description 判断gantt的readonly属性值
 */
function checkReadOnly(ganttObject) {
  if (ganttObject && ganttObject.config.readonly) {
    if (ganttObject.config.readonly) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

/**
 * @Description 检查选中任务是否包含根节点 包含：true 不包含：false
 */
function checkContentRoot(ganttObject, tasks) {
  let result = false
  if (ganttObject && tasks) {
    ganttObject.eachSelectedTask(function (taskId) {
      if (ganttObject.getGlobalTaskIndex(taskId) === 0 && !result) {
        result = true
      }
    })
  }
  return result
}
