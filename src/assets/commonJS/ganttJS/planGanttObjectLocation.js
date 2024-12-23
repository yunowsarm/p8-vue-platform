import { GanttObject, progressRefreshCheck } from './ganttObjectLocation'
import { Gantt } from 'p8-dhtmlx-gantt'
import api from '@/plugins/api'
import moment from 'moment'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function planGantt (ganttName, vueThisLocation) {
  // 获取gantt对象
  const ganttObject = GanttObject.getGanttObject(ganttName)
  GanttObject.endDateEditor(ganttObject)
  GanttObject.customDateEditor(ganttObject)
  GanttObject.customEndDateEditor(ganttObject)
  // 定义数据处理器
  const dp = ganttObject.createDataProcessor({
    task: {
      // 任务操作
      create: function (data) {
      },
      delete: function (id) {
      },
      update: function (data, id) {
      }
    },
    link: {
      // 前后置关系操作
      create: function (data) {
        return new ganttObject.Promise((resolve, reject) => {
          api['planGanttManager.createPlanGanttLink']({
            planGanttLinkRequest: data
          })
            .then((res) => {
              if (res) {
                // vueThisLocation.initGantt()
                return resolve({ tid: res.id, sid: data.id })
              } else {
                ganttObject.undo()
                GanttObject.showMessage(vueThisLocation, '前后置关系创建失败！', 'error')
                return { action: 'error' }
              }
            })
            .catch(() => {
              ganttObject.undo()
              GanttObject.showMessage(vueThisLocation, '前后置关系创建失败！', 'error')
              return { action: 'error' }
            })
          // vueThisLocation.initGantt()
        })
      },
      update: function (data, id) { },
      delete: function (id) {
        return new ganttObject.Promise((resolve, reject) => {
          api['planGanttManager.removePlanGanttLink']({ id: id })
            .then((res) => {
              if (res) {
                return resolve({ tid: res })
              } else {
                ganttObject.undo()
                GanttObject.showMessage(vueThisLocation, '前后置关系删除失败！', 'error')
                return { action: 'error' }
              }
            })
            .catch(() => {
              ganttObject.undo()
              GanttObject.showMessage(vueThisLocation, '前后置关系删除失败！', 'error')
              return { action: 'error' }
            })
        })
      }
    }
  })
  // 表头查询值绑定
  Gantt.searchColumnsChange = function searchColumnsChange (name, value, searchType, eleInstance) {
    const customComp = ['select', 'date', 'input']
    if (customComp.indexOf(searchType) < 0) {
      document.getElementById(name + searchType).setAttribute('value', value)
    }
    if (searchType === 'select') {
      // 下拉选择
      if (eleInstance && eleInstance.multiple) {
        // 多选
        if (value && !(value instanceof Array)) {
          const arr = value.split(',')
          vueThisLocation.searchForm[name] = arr
        } else {
          vueThisLocation.searchForm[name] = value
        }
      } else {
        vueThisLocation.searchForm[name] = value
      }
    } else if (searchType === 'date') {
      vueThisLocation.searchForm[name] = value
    } else if (searchType === 'input') {
      vueThisLocation.searchForm[name] = value
    }
    ganttObject.render()
  }
  GanttObject.treeDataEditor(ganttObject, vueThisLocation.treeDataEditorConfig, vueThisLocation.treeDataEditorConfig1)
  // 列定义
  GanttObject.synchronizationColumns(vueThisLocation, ganttObject)
  GanttObject.searchColumnsDataInit(vueThisLocation, ganttObject)
  // 任务更新前校验排程
  ganttObject.attachEvent('onBeforeTaskUpdate', function (id, newItem) {
    const task = ganttObject.getTask(id)
    if (task.parent && ganttObject.isTaskExists(task.parent) && newItem.end_date && newItem.start_date && ganttObject.getTask(task.parent).end_date && ganttObject.getTask(task.parent).start_date) {
      const pStartDate = GanttObject.strToDate(GanttObject.dateToStr(ganttObject.getTask(task.parent).start_date, null, ganttObject), null, ganttObject)
      const pEndDate = GanttObject.strToDate(GanttObject.dateToStr(ganttObject.getTask(task.parent).end_date, null, ganttObject), null, ganttObject)
      const tStartDate = GanttObject.strToDate(GanttObject.dateToStr(newItem.start_date, null, ganttObject), null, ganttObject)
      const tEndDate = GanttObject.strToDate(GanttObject.dateToStr(newItem.end_date, null, ganttObject), null, ganttObject)
      if (pEndDate < tEndDate || pStartDate > tStartDate) {
        newItem.weatherNormal = '1' // 排程不正确
      } else {
        newItem.weatherNormal = ''
      }
    }
  })
  // 单元格单击事件
  ganttObject.attachEvent('onTaskClick', function (id, e) {
    const task = ganttObject.getTask(id)
    
    return true
  })
  // 新增前后置链接校验
  GanttObject.beforeLinkAddCheck(ganttObject)
  // 修改前后置链接校验
  GanttObject.beforeLinkUpdateCheck(ganttObject)
  // 创建资源载体
  ganttObject.$resourcesStore = GanttObject.createDatastore(ganttObject)
  // 封装资源数据 名称[部门]-角色
  GanttObject.resourceStoreOnParse(ganttObject)
  // 工作时间设置
  // GanttObject.workTimeSetting(ganttObject, vueThisLocation)
  // 前后置删除提示文本定义
  GanttObject.linkDescription(ganttObject)
  // 受新建、删除任务限制、暂时注销
  // // 键盘事件绑定
  // ganttObject.plugins({
  //   keyboard_navigation: true
  // })
  // // 开启单元格编辑
  // ganttObject.config.keyboard_navigation_cells = true
  // 添加工具提示提示
  // GanttObject.addTooltip(ganttObject, vueThisLocation)
  // 升降级
  const actions = GanttObject.getActions(ganttObject)
  ganttObject.performAction = GanttObject.performAction(actions, ganttObject)
  let multipleState = false
  window.addEventListener('keydown', function (event) {
    if (event.keyCode === 16 || event.keyCode === 17) {
      multipleState = true
    }
  })
  window.addEventListener('keyup', function (event) {
    if (event.keyCode === 16 || event.keyCode === 17) {
      multipleState = false
    }
  })
  ganttObject.attachEvent('onBeforeTaskMultiSelect', function (id, state, e) {
    if (state) {
      if (!multipleState) {
        vueThisLocation.selectedTasks = []
      }
      return true
    }
    if (!e) return true
    let result = true
    const columnElement = e.target.querySelectorAll('*')
    // 需要判断当前选中的任务数量，单选不限制
    if (vueThisLocation.selectedTasks.length < 2) {
      return true
    }
    if (columnElement.length === 0 && e.target.classList.contains('gantt_owner_id')) {
      // 没有子元素，且当前元素包含gantt_owner_id这个class名
      result = false
    } else if (columnElement.length > 0 && Array.from(columnElement).some((element) => element.classList.contains('gantt_owner_id'))) {
      // 有子元素，且子素包含gantt_owner_id这个class名
      result = false
    }
    // 取消时分两种情况  1. 点击多选的任务不取消 2.点击非选中的则正常取消
    return result
  })
  // 监听任务选中
  ganttObject.attachEvent('onTaskMultiSelect', function (id, state, e) {
    if (state) {
      setTimeout(() => {
        vueThisLocation.selectedTasks.push(ganttObject.getTask(id))
      })
    } else {
      const index = vueThisLocation.selectedTasks.findIndex((i) => {
        return i.id === id
      })
      if (index !== undefined) {
        vueThisLocation.selectedTasks.splice(index, 1)
      }
    }
  })
  // 查询监听及定义
  GanttObject.setSearchConfig(ganttObject, vueThisLocation)
  // 控制列表grid是否动态显示关键路径
  if (vueThisLocation.dynamicDisplayCritical && vueThisLocation.createPage === 'compile' && !ganttObject.config.readonly) {
    GanttObject.checkIsCriticalTask(ganttObject)
  }
  // 是否刷新进度校验
  if (progressRefreshCheck(vueThisLocation)) {
    // 更新任务时，进度更新
    // ganttObject.attachEvent('onAfterTaskUpdate', function (id) {
    //   GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThisLocation)
    // })
    // 移动任务时，更新进度
    ganttObject.attachEvent('onAfterTaskMove', function (id, parent, tindex) {
      GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThisLocation)
    })
  }
  ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
    const state = {
      id: id,
      colName: mode === 'resize' ? 'start_date' : ''
    }
    return GanttObject.getTaskEditable(ganttObject, state, vueThisLocation)
  })
  // 在将操作添加到撤消堆栈之前触发
  GanttObject.onBeforeUndoStack(ganttObject)
  // 在将操作添加到回退堆栈之前触发
  GanttObject.onBeforeRedoStack(ganttObject)
  // 撤销前校验任务是否存在
  GanttObject.onBeforeUndo(ganttObject)
  // 回退前校验任务是否存在
  GanttObject.onBeforeRedo(ganttObject)
  // 监听资源选择后事件
  GanttObject.setDpObject(ganttName, dp)
  GanttObject.setGanttObject(ganttName, ganttObject)

  ganttObject.attachEvent('onParse', function () {
    ganttObject.eachTask(function (task) {
       if (vueThisLocation.createPage === 'decompose') {
          if (!task.parent) {
            task.type = 'task'
          }
       }
    })
  })
  return ganttObject
}

/**
 * 定义计划编辑gantt列
 * @param ganttObject
 * @param vueThisLocation
 * @returns {({template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number}|{template: (function(*): string), name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number})[]}
 */
export function getGanttLocationColumns (ganttObject, vueThisLocation) {
  ganttObject.serverList('yesOron', [
    { key: '1', label: '是' },
    { key: '0', label: '否' }
  ])

  ganttObject.serverList('secretGradeList', [
    { key: '9001', label: '公开' },
    { key: '9003', label: '内部' },
    { key: '9004', label: '普通商业秘密' },
    { key: '9005', label: '秘密' },
    { key: '9006', label: '核心商业秘密' },
    { key: '9007', label: '机密' }
  ])
  return [
    {
      name: 'statusLocation',
      label: '进度',
      // align: 'center',
      width: 60,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        let html = ''
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0 && vueThisLocation.createPage === 'compile')) {
          const status = task.status
          if (status && vueThisLocation.taskStatus) {
            const taskStatusMap = vueThisLocation.taskStatusMap
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              const item = taskStatusMap[status]
              html = `<i class="gantt-tip p8 ${item.icon}" style="color: ${item.color};" title="${item.cmeaning}" task_status_disp="${item.id}" taskId="${task.id}"></i>`
            }
          }
        }
        return html
      }
    },
    {
      name: 'managerStatusLocation',
      label: '状态',
      align: 'center',
      width: 80,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0)) {
          if (task.outputResult > 0) {
            return `<i class="el-icon-star-on" style="color: #4bcafe;font-size: 23px" title="有提交物的"></i>`
          }
          if (task.outputAsk > 0) {
            return `<i class="el-icon-star-on" style="color: #faa010;font-size: 23px" title="有输出要求的"></i>`
          }
          const managerStatus = task.managerStatus
          if (managerStatus && vueThisLocation.managerStatusMap) {
            const item = vueThisLocation.managerStatusMap[managerStatus]
            if (item) {
              return `<i class="${item.icon}" style="color: ${item.color}" title="${item.cmeaning}"></i>`
            }
          }
        }
        return ''
      }
    },
    {
      name: 'monitorPointsLocation',
      label: '标识',
      align: 'left',
      min_width: 100,
      resize: true,
      template: function (task) {
        // 标识展示
        const monitorPointDatas = ganttObject.serverList(ganttObject.config.monitor_point)
        const monitorPoints = task[ganttObject.config.monitor_point]
        let html = ''
        if (monitorPoints && monitorPointDatas) {
          monitorPoints.split(',').forEach(function (id) {
            monitorPointDatas.some((point, index) => {
              if (point.id === id && id !== '1022' && id !== '1030') {
                const icon = point.icon
                const controlTimeType = point.controlTimeType
                if (id === '1023') {
                  html += `<span style="cursor: pointer"><i class="p8 ${icon}" style="cursor:pointer;" title="${point.title}"></i></span>`
                } else {
                  if (controlTimeType && controlTimeType === '0') {
                    html +=
                      '<span onclick=Gantt.setControlTime(' +
                      point.id +
                      ",'" +
                      point.title +
                      "','" +
                      task.id +
                      '\')><i class="p8 ' +
                      icon +
                      '" style="cursor:pointer;" title="' +
                      point.title +
                      '"></i></span>'
                  } else {
                    html += '<i class="p8 ' + icon + '" title="' + point.title + '"></i>'
                  }
                }
                return true
              }
            })
          })
        }
        return html
      }
    },
    {
      name: 'planTypeLocation',
      label: '任务类型',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务类型展示
        let html = ''
        const taskClassifyDatas = ganttObject.serverList(ganttObject.config.plan_type)
        const planType = task[ganttObject.config.plan_type]
        if (planType && taskClassifyDatas) {
          taskClassifyDatas.some((point, index) => {
            if (point.id === planType) {
              const icon = point.icon
              html += `<i class="${icon}" style="cursor:pointer;" title="${point.title} "></i>`
              return true
            }
          })
        }
        return html
      }
    },
    {
      name: 'progressFeedbackLocation',
      label: '进度反馈',
      align: 'center',
      min_width: 60,
      resize: true,
      template: function (task) {
        const reminderList = vueThisLocation.reminderList
        const obj = reminderList.find((item) => {
          return item.id === task.id
        })
        let img = require('@/assets/image/gantt/weidu.png')
        if (obj && obj.id && Number(obj.reminder) > 0) {
          return `<span style="cursor: pointer">
            <img style="cursor: pointer;width: 17px; height: 17px" src="${img}" />
          </span>`
        } else if (obj && obj.id && obj.reminder == 0) {
          return `<span class="p8 icon-read-mail" style="cursor: pointer;"></span>`
        } else {
          return ''
        }
      }
    },
    {
      name: 'wbsLocation',
      label: '大纲',
      align: 'left',
      template: function (task) {
        const code = ganttObject.getWBSCode(task)
        if (code.split('.').length > vueThisLocation.deep) {
          vueThisLocation.deep = code.split('.').length
        }
        return code
      },
      resize: true,
      min_width: 90
    },
    {
      name: 'nameLocation',
      label: '任务名称',
      tree: true,
      align: 'left',
      resize: true,
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      min_width: 350,
      template: function (task) {
        return task.name
      }
    },
    {
      name: 'owner_id',
      label: '责任人',
      align: 'center',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      width: 80,
      resize: true,
      template: function (task) {
        return `<span data-column-name="owner_id" class="gantt_owner_id">${task.realName || ''}</span>`
      }
    },
    {
      name: 'roleNameLocation',
      label: '角色',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        const owner = task[ganttObject.config.resource_property]
        if (owner) {
          const userMessage = resourceDatas.getItem(owner)
          if (userMessage) {
            return userMessage.roleName
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    {
      name: 'dutyDeptNameLocation',
      label: '责任部门',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        return task.dutyDeptName
      }
    },
    {
      name: 'start_dateLocation',
      label: '计划开始时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if (ganttObject.isTaskExists(task.parent) && ganttObject.getTask(task.parent).start_date > task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.isTaskExists(task.parent) && ganttObject.date.add(ganttObject.getTask(task.parent).end_date, -1, 'day') < task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间晚于父任务的计划完成时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间晚于父任务的计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (task.start_date > ganttObject.date.add(task.end_date, -1, 'day')) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间晚于计划完成时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间晚于计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
        } else {
          return task.start_date
        }
      }
    },
    {
      name: 'end_dateLocation',
      label: '计划完成时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          const pEndDate = ganttObject.getTask(task.parent).end_date
          const tEndDate = task.end_date
          if (pEndDate < tEndDate) {
            if (ganttObject.hasChild(task.id)) {
              return (
                '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" style="font-weight:bold;">' +
                GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) +
                '</span>'
              )
            } else {
              return '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" >' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
            }
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span style="font-weight:bold;">' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
        } else {
          return ganttObject.date.add(task.end_date, -1, 'day')
        }
      }
    },
    {
      name: 'overdueRemainingDaysLocation',
      label: '超期/剩余天数',
      align: 'center',
      min_width: 120,
      resize: true,
      template: function (task) {
        let text = ''
        if (task.managerStatus === '6409') {
          const realEndDate = new Date(moment(task.realEndDate).format('YYYY-MM-DD'))
          const endDate = new Date(moment(task.end_date).format('YYYY-MM-DD')) - 24 * 60 * 60 * 1000
          const days = Math.floor(Math.abs((realEndDate - endDate) / 1000 / 60 / 60 / 24))
          // 已完成
          if (realEndDate > endDate) {
            text = `<span style="color: #F80012">超${days}天完成</span>`
          } else if (days === 0) {
            text = `<span style="color: #1892FF">当天完成</span>`
          } else {
            text = `<span style="color: #1892FF">提前${days}天完成</span>`
          }
        } else {
          const nowDate = new Date(moment(new Date()).format('YYYY-MM-DD'))
          const endDate = new Date(moment(task.end_date).format('YYYY-MM-DD')) - 24 * 60 * 60 * 1000
          const days = Math.floor(Math.abs((nowDate - endDate) / 1000 / 60 / 60 / 24))
          if (nowDate > endDate) {
            text = `<span style="color: #F80012">超${days}天</span>`
          } else if (days === 0) {
            text = `<span style="color: #1BBF9E">今天</span>`
          } else {
            text = `<span style="color: #0296ff">剩${days}天</span>`
          }
        }
        return text
      }
    },
    {
      name: 'weatherControlLocation',
      label: '管控任务',
      align: 'center',
      resize: true,
      min_width: 80,
      template: function (task) {
        const weatherControl = task.weatherControl
        if (weatherControl === '1') {
          return '是'
        } else {
          return '否'
        }
      }
    }
  ]
}

export function planMonitorAdd (ganttObject, vueThisLocation) { }
