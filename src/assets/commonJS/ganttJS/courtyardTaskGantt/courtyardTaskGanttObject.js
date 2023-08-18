import { GanttCourtyardObject, progressRefreshCheck } from './courtyardGanttObject'
import { Gantt } from 'p8-dhtmlx-gantt'
import { setLockTaskProperties, monitorTimeCheck } from '../ganttLockUnLock'

import api from '@/plugins/api'
import moment from 'moment'
import store from '@/plugins/store'
import { GanttObject } from '../ganttObject'
// 计划分解的Gantt js copy by ./planGanttObject.js!
// 列可编辑图标
const canEditIcon = '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function courtyardTaskGanttObject(ganttName, vueThis) {
  // 获取gantt对象
  let ganttObject = GanttCourtyardObject.getGanttObject(ganttName)
  // 单元格键盘导航
  // ganttObject.config.keyboard_navigation_cells = true
  // gantt键盘导航
  // ganttObject.config.keyboard_navigation = true
  // 加载排程类型
  GanttCourtyardObject.autoScheduleList(ganttObject)
  GanttCourtyardObject.endDateEditor(ganttObject)
  // 定义数据处理器
  let dp = ganttObject.createDataProcessor({
    task: {
      // 任务操作
      create: function (data) {
        return new ganttObject.Promise(function (resolve, reject) {
          return resolve({ action: 'inserted' })
        })
      },
      delete: function (id) {
        return new ganttObject.Promise(function (resolve, reject) {
          return resolve({ action: 'deleted' })
        })
      },
      update: function (data, id) {
        // 进度小数位数限制--进度保留小数点后2位
        if (data.progress && data.progress > 0) {
          let num = parseFloat(data.progress)
          data.progress = Math.round(num * 100) / 100
        }
        api['courtyardTask.updatePlanGanttData']({ planGanttRequest: data, createPage: vueThis.createPage })
          .then((res) => {
            if (res) {
              ganttObject.getTask(id).updateType = ''
              return { action: 'ok' }
            } else {
              ganttObject.undo()
              GanttCourtyardObject.showMessage(vueThis, '更新失败！', 'error')
              return { action: 'error' }
            }
          })
          .catch(() => {
            ganttObject.undo()
            GanttCourtyardObject.showMessage(vueThis, '更新失败！', 'error')
            return { action: 'error' }
          })
      }
    },
    link: {
      // 前后置关系操作
      create: function (data) {},
      update: function (data, id) {},
      delete: function (id) {}
    }
  })
  // 事件绑定
  Gantt.setControlTime = function setControlTime(monitorId, monitorName, taskId) {
    let task = ganttObject.getTask(taskId)
    let monitorLockMap = vueThis.monitorLockMap
    // 加锁逻辑控制
    if (monitorTimeCheck(monitorLockMap, task, ganttObject, monitorId, vueThis.lockLevel)) {
      vueThis.monitorId = monitorId
      vueThis.monitorName = monitorName
      vueThis.selectTaskName = task.name
      vueThis.selectTaskId = taskId
      vueThis.controlTimeVisible = true
    }
  }
  Gantt.planTypeClick = function planTypeClick(planType, taskId, taskName, parentId) {
    if (planType === '3103' || planType === '310301' || planType === '310302' || planType === '310303') {
      let param = { taskId: taskId, taskName: taskName, planType: planType, parentId: parentId }
      vueThis.planTypeParam = Object.assign({}, param)
      vueThis.planTypeViewVisible = true
    }
    if (planType === '3110') {
      let param = { taskId: taskId, taskName: taskName, planType: planType, parentId: parentId }
      vueThis.planTypeParam = Object.assign({}, param)
      vueThis.myFlyExperienceVisible = true
    }
    if (planType === '3111') {
      let param = { taskId: taskId, taskName: taskName, planType: planType, parentId: parentId }
      vueThis.planTypeParam = Object.assign({}, param)
      vueThis.myBigExperienceVisible = true
    }
  }
  Gantt.attentionTaskView = function attentionTaskView(taskId) {
    let param = { taskId: taskId }
    vueThis.planTypeParam = Object.assign({}, param)
    vueThis.planTypeViewVisible = true
  }
  // 表头查询值绑定
  Gantt.searchColumnsChange = function searchColumnsChange(name, value, searchType, eleInstance) {
    const customComp = ['select', 'date', 'input']
    if (customComp.indexOf(searchType) < 0) {
      document.getElementById(name + searchType).setAttribute('value', value)
    }
    if (searchType === 'select') {
      // 下拉选择
      if (eleInstance && eleInstance.multiple) {
        // 多选
        if (value && !(value instanceof Array)) {
          let arr = value.split(',')
          vueThis.searchForm[name] = arr
        } else {
          vueThis.searchForm[name] = value
        }
      } else {
        vueThis.searchForm[name] = value
      }
    } else if (searchType === 'date') {
      vueThis.searchForm[name] = value
    } else if (searchType === 'input') {
      vueThis.searchForm[name] = value
    }
    ganttObject.render()
  }
  // 列定义
  GanttCourtyardObject.synchronizationColumns(vueThis, ganttObject)
  GanttCourtyardObject.searchColumnsDataInit(vueThis, ganttObject)
  // 任务更新前校验排程
  ganttObject.attachEvent('onBeforeTaskUpdate', function (id, newItem) {
    let task = ganttObject.getTask(id)
    if (task.parent && ganttObject.isTaskExists(task.parent) && newItem.end_date && newItem.start_date && ganttObject.getTask(task.parent).end_date && ganttObject.getTask(task.parent).start_date) {
      let pStartDate = GanttObject.strToDate(GanttObject.dateToStr(ganttObject.getTask(task.parent).start_date, null, ganttObject), null, ganttObject)
      let pEndDate = GanttObject.strToDate(GanttObject.dateToStr(ganttObject.getTask(task.parent).end_date, null, ganttObject), null, ganttObject)
      let tStartDate = GanttObject.strToDate(GanttObject.dateToStr(newItem.start_date, null, ganttObject), null, ganttObject)
      let tEndDate = GanttObject.strToDate(GanttObject.dateToStr(newItem.end_date, null, ganttObject), null, ganttObject)
      if (pEndDate < tEndDate || pStartDate > tStartDate) {
        newItem.weatherNormal = '1' // 排程不正确
      } else {
        newItem.weatherNormal = ''
      }
    }
  })
  // 单元格单击事件
  ganttObject.attachEvent('onTaskClick', function (id, e) {
    if (e.target.className === 'gantt_tree_icon gantt_open' || e.target.className === 'gantt_tree_icon gantt_close') {
      return true
    }
    if (ganttObject.isTaskExists(id) && e.path && e.path.length > 0) {
      let task = ganttObject.getTask(id)
      // 获取gannt操作限制策略
      let taskStatusLockMap = store.getters.taskStatusLockMap
      let editManagerStatus = taskStatusLockMap[task.status]
      // 只读gantt、已完成、变更中、提交审批、根节点不可点击
      if (ganttObject.config.readonly || ganttObject.getGlobalTaskIndex(id) === 0 || (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1)) {
        return false
      }
      let item = e.path.filter((t) => t.className && t.className.indexOf('gantt_cell') !== -1)
      if (
        item &&
        item.length > 0 &&
        item[0] &&
        Object.keys(item[0].attributes).length &&
        item[0].attributes['data-column-name'] &&
        Object.keys(item[0].attributes['data-column-name'].nodeValue).length
      ) {
        let fieldName = e.path.filter((t) => t.className && t.className.indexOf('gantt_cell') !== -1)[0].attributes['data-column-name'].nodeValue
        // 根节点不可编辑
        // 任务属性readonly为true的任务不可编辑
        if (fieldName) {
          console.log('no-empty>>>>>>>>')
        }
      }
    }
    return true
  })

  // 新增前后置链接校验
  GanttCourtyardObject.beforeLinkAddCheck(ganttObject)
  // 修改前后置链接校验
  GanttCourtyardObject.beforeLinkUpdateCheck(ganttObject)
  // 创建资源载体
  ganttObject.$resourcesStore = GanttCourtyardObject.createDatastore(ganttObject)
  // 封装资源数据 名称[部门]-角色
  GanttCourtyardObject.resourceStoreOnParse(ganttObject)
  // 工作时间设置
  // GanttCourtyardObject.workTimeSetting(ganttObject, vueThis)
  // 前后置删除提示文本定义
  GanttCourtyardObject.linkDescription(ganttObject)
  // 受新建、删除任务限制、暂时注销
  // // 键盘事件绑定
  // ganttObject.plugins({
  //   keyboard_navigation: true
  // })
  // // 开启单元格编辑
  // ganttObject.config.keyboard_navigation_cells = true
  // 添加工具提示提示
  // GanttCourtyardObject.addTooltip(ganttObject, vueThis)
  // 升降级
  let actions = GanttCourtyardObject.getActions(ganttObject)
  ganttObject.performAction = GanttCourtyardObject.performAction(actions, ganttObject)
  // 监听任务选中
  ganttObject.attachEvent('onTaskMultiSelect', function (id, state, e) {
    if (state) {
      vueThis.selectedTasks.push(ganttObject.getTask(id))
    } else {
      vueThis.selectedTasks.splice(vueThis.selectedTasks.indexOf(ganttObject.getTask(id)), 1)
    }
  })
  // 右键菜单
  GanttCourtyardObject.createRightMenu(ganttObject, vueThis)
  // 多选任务不可拖动
  GanttCourtyardObject.unMoveTask(vueThis, ganttObject)
  // 任务自动调度更新
  GanttCourtyardObject.updateScheduling(ganttObject, vueThis)
  // 查询监听及定义
  GanttCourtyardObject.setSearchConfig(ganttObject, vueThis)
  // 编辑加锁后，任务加锁逻辑处理
  setLockTaskProperties(ganttObject, vueThis)
  // 控制列表grid是否动态显示关键路径
  if (vueThis.dynamicDisplayCritical && vueThis.createPage === 'compile' && !ganttObject.config.readonly) {
    GanttCourtyardObject.checkIsCriticalTask(ganttObject)
  }
  // 是否刷新进度校验
  if (progressRefreshCheck(vueThis)) {
    // 更新任务时，进度更新
    // ganttObject.attachEvent('onAfterTaskUpdate', function (id) {
    //   GanttCourtyardObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    // })
    ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
      return false
    })
    // 移动任务时，更新进度
    ganttObject.attachEvent('onAfterTaskMove', function (id, parent, tindex) {
      GanttCourtyardObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    })
  }
  // 在将操作添加到撤消堆栈之前触发
  GanttCourtyardObject.onBeforeUndoStack(ganttObject)
  // 在将操作添加到回退堆栈之前触发
  GanttCourtyardObject.onBeforeRedoStack(ganttObject)
  // 撤销前校验任务是否存在
  GanttCourtyardObject.onBeforeUndo(ganttObject)
  // 回退前校验任务是否存在
  GanttCourtyardObject.onBeforeRedo(ganttObject)
  // 监听资源选择后事件
  GanttCourtyardObject.resourceOnAfterSelect(ganttObject)
  GanttCourtyardObject.setDpObject(ganttName, dp)
  GanttCourtyardObject.setGanttObject(ganttName, ganttObject)
  return ganttObject
}

/**
 * 定义计划编辑gantt列
 * @param ganttObject
 * @param vueThis
 * @returns {({template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number}|{template: (function(*): string), name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number})[]}
 */
export function getGanttColumns(ganttObject, vueThis) {
  // 加载工期格式化
  const formatter = GanttCourtyardObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttCourtyardObject.linksFormatter(ganttObject, formatter)
  // 加载编辑器
  let editors = GanttCourtyardObject.editors(ganttObject, formatter, linksFormatter)
  return [
    {
      name: 'wbs',
      label: '大纲',
      align: 'left',
      template: function (task) {
        let code = ganttObject.getWBSCode(task)
        if (code.split('.').length > vueThis.deep) {
          vueThis.deep = code.split('.').length
        }
        return code
      },
      resize: true,
      min_width: 90
    },
    {
      name: 'status',
      label: '状态',
      // align: 'center',
      width: 60,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        let html = ''
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0)) {
          let status = task.status
          if (status && vueThis.taskStatus) {
            let taskStatusMap = store.state.project.dicConfig.taskStatus
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              let item = taskStatusMap[status]
              html = `<i class="gantt-tip p8 ${item.icon}" style="color: ${item.color}" title="${item.title}" task_status_disp="${item.id}" taskId="${task.id}"></i>`
            }
          }
        }
        // 注意：该逻辑修改时，需同时修改PmProjectTasksMapper.xml中sql片段checkForecastDateInfo逻辑
        if (task.forecastBeginDate && task.start_date && task.end_date && task.forecastEndDate) {
          // let beginStr = moment(task.start_date).format('YYYY-MM-DD')
          let endStr = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
          let forecastEndStr = task.forecastEndDate
          // 父节点
          if (ganttObject.hasChild(task.id)) {
            // 计划完成时间和预测完成时间不一致 => 红色感叹号
            if (endStr !== forecastEndStr) {
              // 父修改过预计完成时间
              if (task.adjustForecastEndDate) {
                let afed = task.adjustForecastEndDate
                let fed = task.forecastEndDate
                if (afed === fed) {
                  html = html + '<i class="p8 icon-estimated-time-modify" style="color: rgb(255, 153, 33);"></i>'
                } else if (afed < fed) {
                  html = html + '<i class="p8 icon-estimated-time-modify" style="color: #ff001b;"></i><i class="p8 icon-estimated-time-modify" style="color: rgb(255, 153, 33);"></i>'
                }
              } else {
                // 父未修改预计完成时间
                html = html + '<i class="p8 icon-estimated-time-modify" style="color: rgb(255, 153, 33);"></i>'
              }
            }
          } else if (endStr !== forecastEndStr) {
            // 叶子节点且计划完成时间和预测完成时间不一致 => 红色感叹号
            html = html + '<i class="p8 icon-estimated-time-modify" style="color: #ff001b;"></i>'
          }
        }
        return html
      }
    },
    {
      name: 'name',
      label: '任务名称',
      tree: true,
      align: 'left',
      resize: true,
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      min_width: 300,
      template: function (task) {
        let result = ''
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          result = result + '<div>' + task.name + '</div>'
        } else {
          result = task.name
        }
        return result
      }
    },
    {
      name: 'realName',
      label: '责任人',
      align: 'center',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      width: 80,
      resize: true
    },
    {
      name: 'dutyDeptName',
      label: '部门',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'progress',
      label: '进度',
      align: 'center',
      width: 60,
      resize: true,
      template: function (task) {
        if (task.progress > 0) {
          return Math.round(task.progress * 100) + '%'
        }
        return 0
      }
    },
    {
      name: 'duration',
      label: '工期',
      align: 'center',
      min_width: 60,
      resize: true,
      // editor: editors.duration,
      template: function (task) {
        return formatter.format(task.duration)
      }
    },
    {
      name: 'start_date',
      label: '计划开始时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if (ganttObject.isTaskExists(task.parent) && ganttObject.getTask(task.parent).start_date > task.start_date) {
          return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
        }
        if (task.start_date > ganttObject.date.add(task.end_date, -1, 'day')) {
          return '<span class="red-wave" title="计划开始时间晚于计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
        }
        return task.start_date
      }
    },
    {
      name: 'end_date',
      label: '计划完成时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          let pEndDate = ganttObject.getTask(task.parent).end_date
          let tEndDate = task.end_date
          if (pEndDate < tEndDate) {
            return '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" >' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
          }
        }
        return ganttObject.date.add(task.end_date, -1, 'day')
      }
    },
    {
      name: 'forecastBeginDate',
      label: '预计开始时间' + canEditIcon,
      align: 'center',
      min_width: 130,
      editor: editors.forecastBeginDate,
      resize: true,
      template: function (task) {
        if (task.forecastBeginDate && task.start_date) {
          let ed = moment(ganttObject.date.add(task.start_date, 0, 'day')).format('YYYY-MM-DD')
          let fe = moment(ganttObject.date.add(task.forecastBeginDate, 0, 'day')).format('YYYY-MM-DD')
          if (ed !== fe) {
            return (
              '<div style="color:' + GanttCourtyardObject.forecastColor + '">' + GanttCourtyardObject.dateToStr(ganttObject.date.add(task.forecastBeginDate, 0, 'day'), null, ganttObject) + '</div>'
            )
          } else {
            return ganttObject.date.add(task.forecastBeginDate, 0, 'day')
          }
        }
      }
    },
    {
      name: 'forecastEndDate',
      label: '预计完成时间' + canEditIcon,
      align: 'center',
      min_width: 130,
      resize: true,
      editor: editors.forecastEndDate,
      template: function (task) {
        if (task.forecastEndDate && task.end_date) {
          let ed = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
          let fe = moment(ganttObject.date.add(task.forecastEndDate, 0, 'day')).format('YYYY-MM-DD')
          if (ed !== fe) {
            return '<div style="color:' + GanttCourtyardObject.forecastColor + '">' + GanttCourtyardObject.dateToStr(ganttObject.date.add(task.forecastEndDate, 0, 'day'), null, ganttObject) + '</div>'
          } else {
            return ganttObject.date.add(task.forecastEndDate, 0, 'day')
          }
        }
      }
    },

    { name: 'realBeginDate', label: '实际开始时间', align: 'center', min_width: 130, resize: true },
    { name: 'realEndDate', label: '实际完成时间', align: 'center', min_width: 130, resize: true },
    {
      name: 'feedbackMsg',
      label: '调整原因' + canEditIcon,
      align: 'center',
      resize: true,
      min_width: 550,
      editor: editors.feedbackMsg,
      template: function (task) {
        let result = ''
        if (task.feedbackMsg && ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          result = result + '<div>' + task.feedbackMsg + '</div>'
        }
        return result
      }
    }
  ]
}
