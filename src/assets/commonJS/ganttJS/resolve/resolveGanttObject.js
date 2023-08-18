import Vue from 'vue'
import { Gantt } from 'p8-dhtmlx-gantt'
import store from '@/plugins/store'
// import { monitorLockUnLockCheck } from './ganttLockUnLock'
import { updateNewTaskMap, setNewTaskMap } from '../changeGantt'
import { getGanttColumns } from './planResolveGanttObject'
import moment from 'moment'
import api from '@/plugins/api'
import Inputor from '@/assets/commonJS/originalComponents/input'
import Selector from '@/assets/commonJS/originalComponents/select'
import DatePicker from '@/assets/commonJS/originalComponents/datePicker'
import { GanttObject } from '../ganttObject'

/**
 * @Description 计划时间限制策略
 * @author fukai
 * @date 2020/5/13 9:32
 */
let PlanDataLimit = {}

/**
 * @Description 计划时间限制策略1
 *
 *              父任务时间自动计划时：
 *                  向上查询祖辈，直到查询到时间非自动计算的父任务时（不存在手动时，时间不做限制），不能突破此任务时间范围
 *              父任务时间不自动计算时：
 *                  不能突破父任务时间范围
 *              自身限制：
 *                  开始时间不能大于完成时间，完成时间不能小于开始时间
 * @author fukai
 * @date 2020/5/13 9:13
 */
PlanDataLimit.strategyOne = function (ganttObject, taskId, minOrMax, startOrEnd) {
  if (ganttObject.isTaskExists(taskId)) {
    let limitTask = null
    let curTask = ganttObject.getTask(taskId)
    // 非根节点操作
    if (ganttObject.getGlobalTaskIndex(curTask.id) !== 0 && curTask.parent && ganttObject.isTaskExists(curTask.parent)) {
      let parentTask = ganttObject.getTask(curTask.parent)
      if (parentTask.autoScheduling === '1') {
        // 向上查询非自动计算时间的父
        let parent = getManualParent(parentTask, ganttObject)
        if (parent && Object.keys(parent).length > 0) {
          limitTask = parent
        } else {
          limitTask = parentTask
        }
      } else {
        limitTask = parentTask
      }
      if (startOrEnd === 'start') {
        if (minOrMax === 'min') {
          return limitTask.start_date
        } else {
          // 限制任务完成时间
          let max1 = ganttObject.date.add(limitTask.end_date, -1, 'day')
          let max2 = ganttObject.date.add(curTask.end_date, -1, 'day')
          return max1 > max2 ? max2 : max1
        }
      } else {
        if (minOrMax === 'min') {
          // 在本身开始时间和限制任务开始时间中取最大值
          let minDate1 = limitTask.start_date
          let minDate2 = curTask.start_date
          return minDate1 > minDate2 ? minDate1 : minDate2
        } else {
          return ganttObject.date.add(limitTask.end_date, -1, 'day')
        }
      }
    }
  }
}

/**
 * @Description 递归向上查询非自动计算时间的父，若不存在返回 null
 * @author fukai
 * @date 2020/5/15 13:02
 */
function getManualParent(task, ganttObject) {
  if (task.autoScheduling === '1') {
    if (task.parent && ganttObject.isTaskExists(task.parent)) {
      let parTask = ganttObject.getTask(task.parent)
      return getManualParent(parTask, ganttObject)
    } else {
      return null
    }
  } else {
    return task
  }
}

/**
 * @Description 计划时间限制策略2
 *              根节点限制：开始时间不能早于计划开始时间，完后时间不能晚于计划完成时间
 *              自身限制：开始时间不能大于完成时间，完成时间不能小于开始时间
 *
 * @author fukai
 * @date 2020/5/13 9:13
 */
PlanDataLimit.strategyTwo = function (ganttObject, taskId, minOrMax, startOrEnd) {
  let rootTask = ganttObject.getTaskByWBSCode('1')
  if (ganttObject.isTaskExists(taskId)) {
    let curTask = ganttObject.getTask(taskId)
    if (startOrEnd === 'start') {
      if (minOrMax === 'min') {
        return rootTask.start_date
      } else {
        // 在本身完成时间之前
        return ganttObject.date.add(curTask.end_date, -1, 'day')
      }
    } else {
      if (minOrMax === 'min') {
        // 在本身开始时间之后
        return curTask.start_date
      } else {
        return ganttObject.date.add(rootTask.end_date, -1, 'day')
      }
    }
  }
}

/**
 * @Description gantt属性对象
 * @author fukai
 * @date 2020/5/13 10:45
 */
export const GanttResolveObject = {}

/**
 * 预计时间与计划开始时间不一致时，预计时间颜色定义
 * @type {string}
 */
GanttResolveObject.forecastColor = '#ff0000'

/**
 * @Description 资源选择后刷新数据
 * @author fukai
 * @date 2020/5/15 15:31
 */
GanttResolveObject.resourceOnAfterSelect = function (ganttObject) {
  ganttObject.$resourcesStore.attachEvent('onAfterSelect', function (id) {
    ganttObject.refreshData()
  })
}

/**
 * @Description grid_row_class样式
 * @author fukai
 * @date 2020/5/15 15:36
 */
GanttResolveObject.grid_row_class = function (ganttObject) {
  return function (start, end, task) {
    let css = []
    if (ganttObject.hasChild(task.id)) {
      css.push('folder_row')
    }
    if (task.$virtual) {
      css.push('group_row')
    }
    if (shouldHighlightTask(task, ganttObject)) {
      css.push('highlighted_resource')
    }
    return css.join(' ')
  }
}

/**
 * @Description resource_cell_value样式
 * @author fukai
 * @date 2020/5/15 16:33
 */
GanttResolveObject.resource_cell_value = function () {
  // eslint-disable-next-line camelcase
  return function (start_date, end_date, resource, tasks) {
    let html = '<div>' + tasks.length + '</div>'
    return html
  }
}

/**
 * @Description task_row_class样式
 * @author fukai
 * @date 2020/5/15 15:39
 */
GanttResolveObject.task_row_class = function (ganttObject) {
  return function (start, end, task) {
    if (shouldHighlightTask(task, ganttObject)) {
      return 'highlighted_resource'
    }
    return ''
  }
}

/**
 * @Description resource_cell_class样式
 * @author fukai
 * @date 2020/5/15 15:39
 */
GanttResolveObject.resource_cell_class = function () {
  // eslint-disable-next-line camelcase
  return function (start_date, end_date, resource, tasks) {
    let css = []
    css.push('resource_marker')
    if (tasks.length <= 1) {
      css.push('workday_ok')
    } else {
      css.push('workday_over')
    }
    return css.join(' ')
  }
}

/**
 * @Description timeline_cell_class样式
 * @author fukai
 * @date 2020/5/15 15:43
 */
GanttResolveObject.timeline_cell_class = function (ganttObject) {
  return function (task, date) {
    if (!ganttObject.isWorkTime({ date: date, task: task })) {
      return 'week_end'
    }
    return ''
  }
}

/**
 * @Description 任务选中样式校验
 * @author fukai
 * @date 2020/5/15 15:29
 */
function shouldHighlightTask(task, ganttObject) {
  let store = ganttObject.$resourcesStore
  let taskResource = task[ganttObject.config.resource_property]
  let selectedResource = store.getSelectedId()
  if (taskResource === selectedResource || store.isChildOf(taskResource, selectedResource)) {
    return true
  }
}

/**
 * @Description 资源选中样式设置
 * @author fukai
 * @date 2020/5/15 15:25
 */
function shouldHighlightResource(resource, ganttObject) {
  let selectedTaskId = ganttObject.getState().selected_task
  if (ganttObject.isTaskExists(selectedTaskId)) {
    let selectedTask = ganttObject.getTask(selectedTaskId)
    let selectedResource = selectedTask[ganttObject.config.resource_property]
    if (resource.id === selectedResource) {
      return true
    } else if (ganttObject.$resourcesStore.isChildOf(selectedResource, resource.id)) {
      return true
    }
  }
  return false
}

/**
 * @Description 根据资源id查询对应任务
 * @author fukai
 * @date 2020/5/15 15:21
 */
function getResourceTasks(resourceId, ganttObject) {
  let resourceStore = ganttObject.getDatastore(ganttObject.config.resource_store)
  let field = ganttObject.config.resource_property
  let tasks
  if (resourceStore.hasChild(resourceId)) {
    tasks = ganttObject.getTaskBy(field, resourceStore.getChildren(resourceId))
  } else {
    tasks = ganttObject.getTaskBy(field, resourceId)
  }
  return tasks
}

/**
 * @Description 定义资源模板
 * @author fukai
 * @date 2020/5/15 15:14
 */
GanttResolveObject.resourceTemplates = function (ganttObject) {
  return {
    grid_row_class: function (start, end, resource) {
      let css = []
      if (ganttObject.$resourcesStore.hasChild(resource.id)) {
        css.push('folder_row')
        css.push('group_row')
      }
      if (shouldHighlightResource(resource, ganttObject)) {
        css.push('highlighted_resource')
      }
      return css.join(' ')
    },
    task_row_class: function (start, end, resource) {
      let css = []
      if (shouldHighlightResource(resource, ganttObject)) {
        css.push('highlighted_resource')
      }
      if (ganttObject.$resourcesStore.hasChild(resource.id)) {
        css.push('group_row')
      }
      return css.join(' ')
    }
  }
}

/**
 * @Description 资源图配置
 * @author fukai
 * @date 2020/5/15 15:15
 */
GanttResolveObject.resourceConfig = function (ganttObject, vueThis) {
  return {
    scale_height: 30,
    // scales: [
    //   { unit: 'day', step: 1, date: '%m/%d' }
    //   // { unit: 'hour', step: 1, date: '%H' }
    // ],
    columns: [
      {
        name: 'name',
        label: '名称',
        tree: true,
        min_width: 200,
        template: function (resource) {
          return resource.name
        },
        resize: true
      },
      {
        name: 'roleName',
        label: '角色',
        min_width: 120,
        template: function (resource) {
          return resource.roleName
        },
        resize: true
      },
      {
        name: 'progress',
        label: '完成度',
        align: 'center',
        min_width: 75,
        template: function (resource) {
          let tasks = getResourceTasks(resource.id, ganttObject)
          let totalToDo = 0
          let totalDone = 0
          tasks.forEach(function (task) {
            totalToDo += task.duration
            totalDone += task.duration * (task.progress || 0)
          })
          let completion = 0
          if (totalToDo) {
            completion = Math.floor((totalDone / totalToDo) * 100)
          }
          return Math.floor(completion) + '%'
        },
        resize: true
      },
      {
        name: 'workload',
        label: '耗时',
        align: 'center',
        min_width: 75,
        template: function (resource) {
          let tasks = getResourceTasks(resource.id, ganttObject)
          let totalDuration = 0
          tasks.forEach(function (task) {
            totalDuration += task.duration
          })
          return (totalDuration || 0) + '天'
        },
        resize: true
      },
      {
        name: 'capacity',
        label: '总工时',
        align: 'center',
        min_width: 75,
        template: function (resource) {
          let resourceStore = ganttObject.getDatastore(ganttObject.config.resource_store)
          let n = resourceStore.hasChild(resource.id) ? resourceStore.getChildren(resource.id).length : 1
          let state = ganttObject.getState()
          return (ganttObject.calculateDuration(state.min_date, state.max_date) * n || 0) + '天'
        }
      }
    ]
  }
}

/**
 * @Description gantt布局1
 *              左边树列表右边gantt图
 * @author fukai
 * @date 2020/5/13 14:40
 */
GanttResolveObject.layout1 = {
  css: 'gantt_container',
  cols: [
    {
      width: 600,
      min_width: 400,
      rows: [
        { view: 'grid', scrollX: 'gridScroll', scrollable: true, scrollY: 'scrollVer' },
        { view: 'scrollbar', id: 'gridScroll', group: 'horizontal' }
      ]
    },
    { resizer: true, width: 1 },
    {
      rows: [
        { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
        { view: 'scrollbar', id: 'scrollHor', group: 'horizontal' }
      ]
    },
    { view: 'scrollbar', id: 'scrollVer' }
  ]
}
/**
 * @Description gantt布局1
 *              左边树列表右边gantt图: 左边树width可手动传入
 * @author yukang
 * @date 2021/1/9 19:03
 */
GanttResolveObject.layout1_fun = (firstWidth = 600) => {
  return {
    css: 'gantt_container',
    cols: [
      {
        width: firstWidth,
        min_width: 400,
        rows: [
          { view: 'grid', scrollX: 'gridScroll', scrollable: true, scrollY: 'scrollVer' },
          { view: 'scrollbar', id: 'gridScroll', group: 'horizontal' }
        ]
      },
      { resizer: true, width: 1 },
      {
        rows: [
          { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
          { view: 'scrollbar', id: 'scrollHor', group: 'horizontal' }
        ]
      },
      { view: 'scrollbar', id: 'scrollVer' }
    ]
  }
}

/**
 * @Description gantt布局2
 *              只显示树列表
 * @author fukai
 * @date 2020/5/13 14:40
 */
GanttResolveObject.layout2 = {
  css: 'gantt_container',
  // rows: [
  //   {
  //     cols: [
  //       { view: 'grid', id: 'grid', scrollX: 'scroller', scrollY: 'scrollVer' },
  //       { resizer: true, width: 1 },
  //       { view: 'scrollbar', scroll: 'y', id: 'scrollVer' }
  //     ]
  //   },
  //   { resizer: true, width: 1 },
  //   { view: 'scrollbar', id: 'scroller', scroll: 'x' }
  // ]
  cols: [
    {
      rows: [
        { view: 'grid', scrollX: 'gridScroll', scrollable: true, scrollY: 'scrollVer' },
        { view: 'scrollbar', id: 'gridScroll', group: 'horizontal' }
      ]
    },
    { resizer: true, width: 1 },
    { view: 'scrollbar', id: 'scrollVer' }
  ]
}

/**
 * @Description 资源视图布局
 * @author fukai
 * @date 2020/5/13 18:04
 */
GanttResolveObject.layout3 = function (resourceConfig, resourceTemplates) {
  return {
    css: 'gantt_container',
    rows: [
      {
        gravity: 2,
        cols: [
          {
            width: 550,
            min_width: 445,
            rows: [
              { view: 'grid', scrollX: 'gridScroll', scrollable: true, scrollY: 'scrollVer' },
              { view: 'scrollbar', id: 'gridScroll', group: 'vertical' }
            ]
          },
          { resizer: true, width: 1 },
          {
            rows: [
              { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
              { view: 'scrollbar', id: 'scrollHor', group: 'vertical' }
            ]
          },
          { view: 'scrollbar', id: 'scrollVer' }
        ]
      },
      { resizer: true, width: 1, next: 'resources' },
      {
        gravity: 1,
        id: 'resources',
        config: resourceConfig,
        templates: resourceTemplates,
        cols: [
          {
            width: 550,
            min_width: 445,
            rows: [
              { view: 'resourceGrid', scrollX: 'resourceGridScroll', scrollable: true, scrollY: 'resourceVScroll' },
              { view: 'scrollbar', id: 'resourceGridScroll', group: 'vertical' }
            ]
          },
          {
            rows: [
              { view: 'resourceTimeline', scrollX: 'resourceScrollHor', scrollY: 'resourceVScroll' },
              { view: 'scrollbar', id: 'resourceScrollHor', group: 'vertical' }
            ]
          },
          { view: 'scrollbar', id: 'resourceVScroll' }
        ]
      }
    ]
  }
}

/**
 * @Description 定义gantt、数据处理器对象map
 * @author fukai
 * @date 2020/5/21 18:20
 */
let ganttObjectMap = {}
let dpObjectMap = {}

/**
 * @Description 获取gantt对象方法，根据传入名称查询现有对象，若存在则返回，不存在则新建
 * @author fukai
 * @date 2020/5/21 18:31
 */
GanttResolveObject.getGanttObject = function getGanttObject(name) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    if (Object.keys(ganttObjectMap).length > 0 && ganttObjectMap[name] && Object.keys(ganttObjectMap[name]).length > 0) {
      return ganttObjectMap[name]
    } else {
      const newObj = Gantt.getGanttInstance(GanttResolveObject.publicObject)
      // 本地化
      newObj.i18n.setLocale('cn')
      ganttObjectMap[name] = newObj
      return newObj
    }
  }
  return null
}

GanttResolveObject.setGanttObject = function setGanttObject(name, ganttObject) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    ganttObjectMap[name] = ganttObject
  }
}

/**
 * @Description 获取数据处理器对象，根据传入名称查询现有对象，若存在则返回，不存在则返回null
 * @author fukai
 * @date 2020/5/22 9:04
 */
GanttResolveObject.getDpObject = function getDpObject(name) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    if (Object.keys(dpObjectMap).length > 0 && dpObjectMap[name] && Object.keys(dpObjectMap[name]).length > 0) {
      return dpObjectMap[name]
    }
  }
  return null
}

/**
 * @Description 存储数据处理器对象，根据传入传对象和名称放入map中
 * @author fukai
 * @date 2020/5/22 9:04
 */
GanttResolveObject.setDpObject = function setDpObject(name, dpObject) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    dpObjectMap[name] = dpObject
  }
}

/**
 * 日期格式化
 *    默认格式为：'%Y-%m-%d',2010-10-10
 * @constructor
 */
GanttResolveObject.dateToStr = function (date, format, ganttObject) {
  let formatFunc
  if (format) {
    formatFunc = ganttObject.date.date_to_str(format)
  } else {
    formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
  }
  return formatFunc(date)
}

/**
 * 日期格式化
 *    默认格式为：'%Y-%m-%d',2010-10-10
 * @constructor
 */
GanttResolveObject.strToDate = function (date, format, ganttObject) {
  let formatFunc
  if (format) {
    formatFunc = ganttObject.date.str_to_date(format)
  } else {
    formatFunc = ganttObject.date.str_to_date('%Y-%m-%d')
  }
  return formatFunc(date)
}

/**
 * @Description 任务升降级定义
 * @author fukai
 * @date 2020/5/5 17:29
 */
const cascadeAction = {
  indentAction: true,
  outdentAction: true
}

/**
 * @Description 升降级action定义
 * @author fukai
 * @date 2020/5/8 19:05
 */
GanttResolveObject.getActions = function (ganttObject) {
  return {
    undo: function () {
      ganttObject.ext.undo.undo()
    },
    indentAction: function indent(taskId) {
      let task = ganttObject.getTask(taskId)
      let prevId = ganttObject.getPrevSibling(taskId)
      while (ganttObject.isSelectedTask(prevId)) {
        let prev = ganttObject.getPrevSibling(prevId)
        if (!prev) break
        prevId = prev
      }
      if (prevId) {
        let newParent = ganttObject.getTask(prevId)
        ganttObject.moveTask(taskId, ganttObject.getChildren(newParent.id).length, newParent.id)
        if (newParent.autoScheduling === '1' && !ganttObject.hasChild(prevId)) {
          newParent.type = 'project'
        }
        newParent.$open = true
        // 添加更新类型
        newParent.updateType = 'indent'
        task.updateType = 'indent'
        ganttObject.updateTask(taskId)
        GanttResolveObject.calculateForecastDate(ganttObject, newParent)
        ganttObject.updateTask(newParent.id)
        return taskId
      }
      return null
    },
    outdentAction: function outdent(taskId, initialIndexes, initialSiblings) {
      let curTask = ganttObject.getTask(taskId)
      let oldParent = ganttObject.getTask(curTask.parent)
      let oldParenrPar = oldParent.parent
      ganttObject.ext.undo.saveState(taskId, 'task')
      if (ganttObject.isTaskExists(oldParent.id) && oldParent.id !== ganttObject.config.root_id && oldParenrPar !== ganttObject.config.root_id) {
        // 升级不能升到和根平级
        let index = ganttObject.getTaskIndex(oldParent.id) + 1
        let prevSibling = initialSiblings[taskId].first
        if (ganttObject.isSelectedTask(prevSibling)) {
          index += initialIndexes[taskId] - initialIndexes[prevSibling]
        }
        ganttObject.moveTask(taskId, index, ganttObject.getParent(curTask.parent))
        if (!ganttObject.hasChild(oldParent.id)) {
          oldParent.type = ganttObject.config.types.task
        }
        // 添加更新类型
        oldParent.updateType = 'outdent'
        curTask.updateType = 'outdent'
        ganttObject.updateTask(taskId)
        GanttResolveObject.calculateForecastDate(ganttObject, oldParent)
        // 旧父排程为自动时进度计算
        if (oldParent.autoScheduling === '1') {
          oldParent.progress = GanttResolveObject.calculateProgress(oldParent, ganttObject)
        }
        ganttObject.updateTask(oldParent.id)
        return taskId
      }
      return null
    }
  }
}

/**
 * @Description 升降级逻辑更新封装
 * @author fukai
 * @date 2020/5/9 11:31
 */
GanttResolveObject.performAction = function (actions, ganttObject) {
  return function (actionName) {
    const action = actions[actionName]
    if (!action) {
      return
    }
    if (actionName === 'undo') {
      action()
      return
    }
    ganttObject.batchUpdate(function () {
      let indexes = {}
      let siblings = {}
      ganttObject.eachSelectedTask(function (taskId) {
        indexes[taskId] = ganttObject.getTaskIndex(taskId)
        siblings[taskId] = {
          first: null
        }
        let currentId = taskId
        while (ganttObject.isTaskExists(ganttObject.getPrevSibling(currentId)) && ganttObject.isSelectedTask(ganttObject.getPrevSibling(currentId))) {
          currentId = ganttObject.getPrevSibling(currentId)
        }
        siblings[taskId].first = currentId
      })

      let updated = {}
      ganttObject.eachSelectedTask(function (taskId) {
        if (cascadeAction[actionName]) {
          if (!updated[ganttObject.getParent(taskId)]) {
            let updatedId = action(taskId, indexes, siblings)
            updated[updatedId] = true
          } else {
            updated[taskId] = true
          }
        } else {
          action(taskId, indexes)
        }
      })
      ganttObject.eachSelectedTask(function (taskId) {
        if (ganttObject.isTaskExists(taskId)) {
          ganttObject.getTask(taskId).indexNo = ganttObject.getGlobalTaskIndex(taskId)
        }
      })
    })
  }
}

/**
 * @Description 排程模式定义
 * @author fukai
 * @date 2020/5/13 14:14
 */
GanttResolveObject.autoScheduleList = function (ganttObject) {
  return ganttObject.serverList('autoScheduleList', [
    { key: '2', label: '手动' },
    { key: '1', label: '自动' }
  ])
}

/**
 * @Description 工期格式化
 * @author fukai
 * @date 2020/5/13 14:20
 */
GanttResolveObject.formatter = function (ganttObject) {
  const formatter = ganttObject.ext.formatters.durationFormatter({
    enter: 'day',
    store: 'day',
    format: 'day'
  })
  return formatter
}

/**
 * @Description 前后置格式化
 * @author fukai
 * @date 2020/5/13 15:32
 */
GanttResolveObject.linksFormatter = function (ganttObject, formatter) {
  return ganttObject.ext.formatters.linkFormatter({ durationFormatter: formatter })
}
let html5DateFormat = '%Y-%m-%d'
let dateToStr = null
let strToDate = null
function init(ganttObject) {
  if (!dateToStr) {
    dateToStr = ganttObject.date.date_to_str(html5DateFormat)
  }
  if (!strToDate) {
    strToDate = ganttObject.date.str_to_date(html5DateFormat)
  }
}
GanttResolveObject.endDateEditor = function (ganttObject) {
  ganttObject.config.editor_types.end_date_editor = {
    show: function (id, column, config, placeholder) {
      init(ganttObject)
      let minValue = null
      let maxValue = null
      if (typeof config.min === 'function') {
        minValue = config.min(id, column)
      } else {
        minValue = config.min
      }
      if (typeof config.max === 'function') {
        maxValue = config.max(id, column)
      } else {
        maxValue = config.max
      }
      let minAttr = minValue ? " min='" + dateToStr(minValue) + "' " : ''
      let maxAttr = maxValue ? " max='" + dateToStr(maxValue) + "' " : ''
      let html = "<div style='width:140px'><input type='date' " + minAttr + maxAttr + " name='" + column.name + "'></div>"
      placeholder.innerHTML = html
    },
    hide: function () {},
    set_value: function (value, id, column, node) {
      if (value && value.getFullYear) {
        this.get_input(node).value = dateToStr(ganttObject.date.add(value, -1, 'day'))
      } else {
        this.get_input(node).value = ganttObject.date.add(value, -1, 'day')
      }
    },
    get_value: function (id, column, node) {
      let parsed
      try {
        parsed = ganttObject.date.add(strToDate(this.get_input(node).value), 1, 'day') || ''
      } catch (e) {
        parsed = null
      }
      return parsed
    },
    is_changed: function (value, id, column, node) {
      let currentValue = this.get_value(id, column, node)
      if (currentValue && value && currentValue.valueOf && value.valueOf) {
        if (currentValue.valueOf() !== value.valueOf()) {
          return true
        } else {
          return false
        }
      } else {
        return currentValue !== ganttObject.date.add(value, -1, 'day')
      }
    },
    is_valid: function (value, id, column, node) {
      if (!value || isNaN(value.getTime())) {
        return false
      }
      return true
    },
    get_input: function (node) {
      return node.querySelector('input')
    },
    focus: function (node) {
      let input = this.get_input(node)
      if (!input) {
        return
      }
      if (input.focus) {
        input.focus()
      }

      if (input.select) {
        input.select()
      }
    }
  }
}

/**
 * @Description 编辑器初始化
 * @author fukai
 * @date 2020/5/13 14:21
 */
GanttResolveObject.editors = function (ganttObject, formatter, linksFormatter) {
  return {
    text: { type: 'text', map_to: 'name' },
    start_date: {
      type: 'date',
      map_to: 'start_date',
      min: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'start')
      },
      max: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'start')
      }
    },
    end_date: {
      type: 'end_date_editor',
      map_to: 'end_date',
      min: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'end')
      },
      max: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')
      }
    },
    forecastBeginDate: { type: 'date', map_to: 'forecastBeginDate', min: new Date(2000, 0, 1), max: new Date(2099, 0, 1) },
    forecastEndDate: { type: 'date', map_to: 'forecastEndDate', min: new Date(2000, 0, 1), max: new Date(2099, 0, 1) },
    duration: {
      type: 'duration',
      map_to: 'duration',
      min: 1,
      max: function (taskId) {
        let startDate = moment(ganttObject.getTask(taskId).start_date).format('YYYY-MM-DD')
        let maxEndDate = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')).format('YYYY-MM-DD')
        return startDate.diff(maxEndDate, 'days')
      },
      formatter: formatter
    },
    progress: { type: 'number', map_to: 'progress', min: 0, max: 1 },
    number: { type: 'number', map_to: 'productQuantity', min: 0, max: 999999 },
    schedule: { type: 'select', map_to: 'autoScheduling', options: ganttObject.serverList('autoScheduleList') },
    predecessors: { type: 'predecessor', map_to: 'auto', formatter: linksFormatter },
    userEditor: { type: 'select', map_to: 'owner_id', options: ganttObject.serverList('resourceDatas') }
  }
}

/**
 * 递归向上查询父任务，若父任务为自动排程，更新，若排程为手动，停止递归，不更新
 * @param task
 * @param ganttObject
 * @param parTasksIds
 */
export function getTaskParent(ganttObject, taskId, parTasksIds) {
  if (ganttObject.isTaskExists(taskId)) {
    let parentId = ganttObject.getTask(taskId).parent
    if (parentId && ganttObject.isTaskExists(parentId)) {
      let parTask = ganttObject.getTask(parentId)
      if (parTask && parTask.autoScheduling === '1' && parTasksIds.indexOf(parTask.id) === -1) {
        parTasksIds.push(parTask.id)
        getTaskParent(ganttObject, parTask.id, parTasksIds)
      }
    }
  }
}

/**
 * @Description 更新任务工期、开始时间、完成时间时，前后置关系任务信息更新
 * @author fukai
 * @date 2020/5/14 10:26
 */
GanttResolveObject.updateScheduling = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onAfterTaskAutoSchedule', function (task, start, link, predecessor) {
    // if (task && predecessor && task.autoScheduling === '1') {
    updateforecastDate(task, ganttObject)
    ganttObject.updateTask(task.id)
    // }
  })
}

/**
 * @Description 任务不可拖动限制
 * @author fukai
 * @date 2020/5/14 10:30
 */
GanttResolveObject.unMoveTask = function (vueThis, ganttObject) {
  return ganttObject.attachEvent('onBeforeRowDragEnd', function (id, parent, tindex) {
    let task = ganttObject.getTask(id)
    if (ganttObject.getSelectedTasks().length > 1) {
      GanttResolveObject.showMessage(vueThis, '多选任务不可拖动！', 'warning')
      return false
    } else if (task.parent !== parent) {
      GanttResolveObject.showMessage(vueThis, '任务不可跨层级拖动！', 'warning')
      return false
    } else if (ganttObject.getGlobalTaskIndex(id) === 0) {
      GanttResolveObject.showMessage(vueThis, '根节点不可拖动！', 'warning')
      return false
    } else {
      ganttObject.getTask(id).updateType = 'drag'
      return true
    }
  })
}

/**
 * @Description 变更gantt任务不可拖动限制
 * @author fukai
 * @date 2020/5/14 10:30
 */
GanttResolveObject.changeUnMoveTask = function (vueThis, ganttObject) {
  return ganttObject.attachEvent('onBeforeRowDragEnd', function (id, parent, tindex) {
    let task = ganttObject.getTask(id)
    let parTask = ganttObject.getTask(parent)
    if (ganttObject.getSelectedTasks().length > 1) {
      GanttResolveObject.showMessage(vueThis, '多选任务不可拖动！', 'warning')
      return false
    } else if (task.parent !== parent) {
      GanttResolveObject.showMessage(vueThis, '任务不可跨层级拖动！', 'warning')
      return false
    } else if (ganttObject.getGlobalTaskIndex(id) === 0) {
      GanttResolveObject.showMessage(vueThis, '根节点不可拖动！', 'warning')
      return false
    } else if (task.infoType && task.infoType === 'delete') {
      return false
    } else if (parTask && parTask.infoType && parTask.infoType === 'delete') {
      return false
    } else {
      ganttObject.getTask(id).updateType = 'drag'
      return true
    }
  })
}

/**
 * @Description 计算指定任务进度
 *      当前节点下所有叶子节点进度 * 工期的和 / 当前节点下所有叶子节点的工期合计 = 当前节点进度
 * @author fukai
 * @date 2020/5/18 15:58
 */
GanttResolveObject.calculateProgress = function calculateProgress(task, ganttObject) {
  let totalToDo = 0
  let totalDone = 0
  ganttObject.eachTask(function (child) {
    if (!ganttObject.hasChild(child.id)) {
      totalToDo += child.duration
      totalDone += (child.progress || 0) * child.duration
    }
  }, task.id)
  if (!totalToDo) {
    return 0
  } else {
    return totalDone / totalToDo
  }
}

/**
 * @Description 根据当前任务向上更新进度
 * @author fukai
 * @date 2020/5/18 16:00
 */
GanttResolveObject.refreshProgress = function refreshProgress(id, submit, ganttObject, vueThis) {
  if (!ganttObject.isTaskExists(id)) {
    return
  }
  let task = ganttObject.getTask(id)
  task.progress = GanttResolveObject.calculateProgress(task, ganttObject)
  if (submit) {
    ganttObject.refreshTask(id)
    ganttObject.updateTask(id)
  }
  if (task.parent) {
    refreshProgress(task.parent, submit, ganttObject, vueThis)
  }
}

/**
 * 通用消息提醒
 * @param vueThis 展示页面this对象
 * @param msg 提示内容
 * @param type success warning
 */
GanttResolveObject.showMessage = function showMessage(vueThis, msg, type) {
  if (type) {
    if (type === 'error') {
      vueThis.$message.error(msg)
    } else {
      vueThis.$message({
        message: msg,
        type: type
      })
    }
  } else {
    vueThis.$message(msg)
  }
}

/**
 * 计算数arr1中是否包含arr2中的值
 * @param taskMonotors
 * @param arr2
 */
GanttResolveObject.calculateArrayContain = function calculateArrayContain(taskMonitors, selMonitor) {
  if (taskMonitors !== null && taskMonitors !== '') {
    let taskM = taskMonitors.split(',')
    for (let i = 0; i < selMonitor.length; i++) {
      if (taskM.indexOf(selMonitor[i]) !== -1) {
        return true
      }
    }
  }
  return false
}

/**
 * 查询逻辑定义
 * @param parent
 * @param priority
 * @param ganttObject
 * @returns {boolean}
 */
function searchFilter(parent, searchForm, ganttObject) {
  if (JSON.stringify(searchForm) !== '{}') {
    let task
    if (parent) {
      task = ganttObject.getTask(parent)
    } else {
      task = ganttObject.getTaskByWBSCode(1)
    }
    let resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
    let owner = task[ganttObject.config.resource_property]
    let resource = resourceDatas.getItem(owner)

    let deep = Number(searchForm.deep) - 1 // 大纲层级
    let deepCheck = true
    if (deep >= 0 && Number(ganttObject.calculateTaskLevel(task)) > Number(deep)) {
      deepCheck = false
    }
    let wbs = searchForm.wbs // 大纲号模糊查询
    let wbsCheck = true
    let code = ganttObject.getWBSCode(task).toString()
    if (wbs && code.indexOf(wbs) === -1) {
      wbsCheck = false
    }
    let taskName = searchForm.name // 任务名称
    let taskNameCheck = true
    if (taskName && task.name.indexOf(taskName) === -1) {
      taskNameCheck = false
    }
    let roleName = searchForm.roleName // 角色模糊查询
    let roleNameCheck = true
    if (roleName && (!resource || (resource && !resource.roleName) || (resource && resource.roleName && resource.roleName.indexOf(roleName) === -1))) {
      roleNameCheck = false
    }
    let roleIds = searchForm.roleIds // 角色数组
    let roleIdCheck = true
    if (roleIds && roleIds.length > 0 && (!resource || (resource && !resource.roleId) || (resource && resource.roleId && roleIds.indexOf(resource.roleId) === -1))) {
      roleIdCheck = false
    }
    let userName = searchForm.userName // 责任人模糊查询
    let userNameCheck = true
    if (userName && (!resource || (resource && !resource.name) || (resource && resource.name && resource.name.indexOf(userName) === -1))) {
      userNameCheck = false
    }
    let ownerIds = searchForm.ownerIds // 责任人
    let userIdCheck = true
    if (ownerIds && ownerIds.length > 0 && (!resource || (resource && !resource.userId) || (resource && resource.userId && ownerIds.indexOf(resource.userId) === -1))) {
      userIdCheck = false
    }
    let deptName = searchForm.dutyDeptName // 部门模糊查询
    let deptNameCheck = true
    if (deptName && (!resource || (resource && !resource.deptName) || (resource && resource.deptName && resource.deptName.indexOf(deptName) === -1))) {
      deptNameCheck = false
    }
    let deptIds = searchForm.deptIds // 部门
    let deptIdCheck = true
    if (deptIds && deptIds.length > 0 && (!resource || (resource && !resource.deptId) || (resource && resource.deptId && deptIds.indexOf(resource.deptId) === -1))) {
      deptIdCheck = false
    }
    let startDate = searchForm.start_date // 任务开始时间
    let endDate = searchForm.end_date // 任务完成时间
    let endDateCheck = true
    let startDateCheck = true
    let dateCheck = true
    if (startDate && endDate) {
      if (
        !(
          new Date(moment(task.start_date).format('YYYY-MM-DD')).getTime() >= new Date(startDate).getTime() &&
          new Date(moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')).getTime() <= new Date(endDate).getTime()
        )
      ) {
        dateCheck = false
      }
    } else if (startDate && moment(task.start_date).format('YYYY-MM-DD') !== moment(startDate).format('YYYY-MM-DD')) {
      startDateCheck = false
    } else if (endDate && moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD') !== moment(endDate).format('YYYY-MM-DD')) {
      endDateCheck = false
    }
    let startEndDate = searchForm.startEndDate // 任务完成时间范围
    if (startEndDate && startEndDate.length === 2) {
      let startDate = startEndDate[0]
      let endDate = startEndDate[1]
      if (new Date(ganttObject.date.add(task.end_date, -1, 'day')).getTime() < startDate.getTime() || new Date(ganttObject.date.add(task.end_date, -1, 'day')).getTime() > endDate.getTime()) {
        dateCheck = false
      }
    }
    let status = searchForm.status // 任务状态
    let statusCheck = true
    if (status && status.length > 0 && status.indexOf(task.status) === -1) {
      statusCheck = false
    }
    let managerStatus = searchForm.managerStatus // 任务管理状态
    let managerStatusCheck = true
    if (managerStatus && managerStatus.length > 0 && managerStatus.indexOf(task.managerStatus) === -1) {
      managerStatusCheck = false
    }
    let monitors = searchForm.monitors // 标识
    let monitorsCheck = true
    if (monitors && monitors.length > 0 && !GanttResolveObject.calculateArrayContain(task.monitorPoints, monitors)) {
      monitorsCheck = false
    }
    let monitorPoints = searchForm.monitorPoints // 标识--列头
    if (monitorPoints && monitorPoints.length > 0 && !GanttResolveObject.calculateArrayContain(task.monitorPoints, monitorPoints)) {
      monitorsCheck = false
    }
    let planTypes = searchForm.planTypes // 任务类型
    let planTypeCheck = true
    if (planTypes && planTypes.length > 0 && (!task.planType || (task.planType && planTypes.indexOf(task.planType) === -1))) {
      planTypeCheck = false
    }
    let planType = searchForm.planType // 任务类型--列头
    if (planType && planType.length > 0 && (!task.planType || (task.planType && planType.indexOf(task.planType) === -1))) {
      planTypeCheck = false
    }
    let productQuantity = searchForm.productQuantity // 数量
    let productQuantityCheck = true
    if (productQuantity) {
      if (!task.productQuantity || (task.productQuantity && Number(task.productQuantity) !== Number(productQuantity))) {
        productQuantityCheck = false
      }
    }
    if (
      wbsCheck &&
      deepCheck &&
      taskNameCheck &&
      startDateCheck &&
      managerStatusCheck &&
      endDateCheck &&
      roleIdCheck &&
      productQuantityCheck &&
      userNameCheck &&
      deptNameCheck &&
      roleNameCheck &&
      userIdCheck &&
      deptIdCheck &&
      dateCheck &&
      statusCheck &&
      monitorsCheck &&
      planTypeCheck
    ) {
      return true
    }
    let child = ganttObject.getChildren(parent)
    for (let val of child) {
      if (searchFilter(val, searchForm, ganttObject)) {
        return true
      }
    }
    return false
  }
  return true
}

/**
 * 搜索查询配置
 * @param ganttObject
 * @param searchForm
 * @returns {*}
 */
GanttResolveObject.setSearchConfig = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onBeforeTaskDisplay', function (id, task) {
    if (searchFilter(id, vueThis.searchForm, ganttObject)) {
      return true
    }
    return false
  })
}

/**
 * 计划编辑--创建资源载体
 * @param ganttObject
 */
GanttResolveObject.createDatastore = function (ganttObject) {
  return ganttObject.createDatastore({
    name: ganttObject.config.resource_store,
    type: 'treeDatastore',
    initItem: function (item) {
      item.parent = item.parent || ganttObject.config.root_id
      item[ganttObject.config.resource_property] = item.parent
      item.open = true
      return item
    }
  })
}

/**
 * 封装资源数据 名称[部门]-角色
 * @param ganttObject
 */
GanttResolveObject.resourceStoreOnParse = function (ganttObject) {
  return ganttObject.$resourcesStore.attachEvent('onParse', function () {
    let resourseDatas = []
    ganttObject.$resourcesStore.eachItem(function (res) {
      if (!ganttObject.$resourcesStore.hasChild(res.id)) {
        let copy = ganttObject.copy(res)
        copy.key = res.id
        copy.label = res.name
        if (copy.deptName) {
          copy.label = '[' + res.deptName + ']' + copy.label
        }
        if (copy.roleName) {
          copy.label = copy.label + '-' + res.roleName
        }
        resourseDatas.push(copy)
      }
    })
    ganttObject.updateCollection('resourceDatas', resourseDatas)
    let vueThis = store.getters.vueThis
    if (vueThis.viewType === 'resource') {
      let groups = ganttObject.$resourcesStore.getItems().map(function (item) {
        let group = ganttObject.copy(item)
        group.group_id = group.id
        return group
      })
      ganttObject.groupBy({
        groups: groups,
        relation_property: ganttObject.config.resource_property,
        group_id: 'group_id',
        group_text: 'name',
        delimiter: ', ',
        default_group_label: 'Not Assigned'
      })
    }
  })
}

/**
 * 右键菜单事件监听
 * @param ganttObject
 * @param vueThis
 */
GanttResolveObject.createRightMenu = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onContextMenu', function (taskId, linkId, event) {
    vueThis.mouseX = event.clientX
    vueThis.mouseY = event.clientY
    let readOnly = ganttObject.config.readonly // 当gantt为只读模式时警用
    if (taskId && !readOnly) {
      if (!ganttObject.isSelectedTask(taskId)) {
        ganttObject.eachSelectedTask(function (id) {
          if (ganttObject.isTaskExists(id)) {
            ganttObject.unselectTask(id)
          }
        })
        ganttObject.selectTask(taskId)
      }
      vueThis.selectedTasks = []
      vueThis.selectedTasks.push(ganttObject.getTask(taskId))
      // vueThis.callParentSelectTasks()
      vueThis.menuVisible = true
      let actionMenuWidth = 0
      let actionMenuHeight = 0
      Vue.nextTick(function () {
        if (vueThis.$refs.actionMenu) {
          actionMenuWidth = vueThis.$refs.actionMenu.offsetWidth
          actionMenuHeight = vueThis.$refs.actionMenu.offsetHeight
          if (document.body.clientWidth - event.clientX < actionMenuWidth) {
            vueThis.dropLeft = event.clientX - actionMenuWidth + 'px'
          } else {
            vueThis.dropLeft = event.clientX + 'px'
          }
          if (document.body.clientHeight - event.clientY < actionMenuHeight) {
            vueThis.dropTop = event.clientY - actionMenuHeight + 'px'
          } else {
            vueThis.dropTop = event.clientY + 'px'
          }
        }
      })
    }
  })
}

/**
 * gantt cell编辑器打开前执行逻辑
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.setOnBeforeEditStart = function (ganttObject, vueThis) {
  return ganttObject.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {
    // 点击列名
    let colName = state.columnName
    // 当前任务
    let task = ganttObject.getTask(state.id)
    // 根节点不可编辑
    if (ganttObject.getGlobalTaskIndex(state.id) === 0) {
      return false
    }
    // 分配给当前责任人的节点，只能修改预计完成时间和预计开始时间
    if (!checkResolve(ganttObject, task)) {
      if (task.dutyUserId === task.nowUserId) {
        if (colName !== 'forecastBeginDate' && colName !== 'forecastEndDate') {
          return false
        }
      } else {
        return false
      }
    }
    if (task.monitorPoints !== '' && task.monitorPoints !== null) {
      var indexOf = task.monitorPoints.indexOf('1032')
      if (indexOf !== -1) {
        return true
      }
    }
    // 生产/试制类任务，不可以修改任务数量
    if (colName === 'productQuantity' && task.planType && task.planType.startsWith('3103')) {
      return false
    }
    // 标识加锁任务不可编辑
    // let monitors = task.monitorPoints
    // if (monitors && monitors.length > 0) {
    //   return monitorLockUnLockCheck(colName, monitors.split(','), vueThis, ganttObject)
    // }
    return true
  })
}
/**
 * 查询选中任务是否为分配给当前责任人的任务
 * @param ganttObject
 * @param task
 * @returns {*}
 */
function checkResolve(ganttObject, task) {
  if (task.parent) {
    let parentTask = ganttObject.getTask(task.parent)
    if (parentTask.dutyUserId === parentTask.nowUserId) {
      return true
    } else {
      return checkResolve(ganttObject, parentTask)
    }
  } else {
    return false
  }
}

/**
 * 修改保存时机为输入框失去焦点时保存
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.setCellSaveConfig = function (ganttObject) {
  return ganttObject.ext.inlineEditors.attachEvent('onEditStart', function (state) {
    let el = ganttObject.ext.inlineEditors.getState().placeholder.childNodes[0].childNodes[0]
    el.addEventListener('blur', (event) => {
      ganttObject.ext.inlineEditors.save()
    })
  })
}

/**
 * 编辑器保存前校验定义
 * @param ganttObject
 * @param vueThis
 * @returns {*}
 */
GanttResolveObject.checkoutBeforeCellSave = function (ganttObject, vueThis) {
  return ganttObject.ext.inlineEditors.attachEvent('onBeforeSave', (state) => {
    let oldVal = state.oldValue
    let newVal = state.newValue
    let colName = state.columnName
    let taskId = state.id
    let task = ganttObject.getTask(taskId)
    let result = true
    let msg = ''
    if (colName) {
      switch (colName) {
        case 'duration':
          let startDate = moment(moment(task.start_date).format('YYYY-MM-DD'))
          let maxEndDate = moment(moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')).format('YYYY-MM-DD'))
          let max = maxEndDate.diff(startDate, 'days') + 1
          if (state.newValue === state.oldValue) {
            result = false
          } else {
            if (newVal > max || newVal < 1) {
              result = false
              msg = '工期值填写错误，只能输入1~' + max + '范围内的值！'
              task.duration = oldVal
              ganttObject.refreshData(taskId)
            } else {
              let endDate = ganttObject.date.add(ganttObject.calculateEndDate(task.start_date, newVal), -1, 'day')
              task.forecastBeginDate = GanttResolveObject.dateToStr(task.start_date, '%Y-%m-%d', ganttObject)
              task.forecastEndDate = GanttResolveObject.dateToStr(endDate, '%Y-%m-%d', ganttObject)
              task.adjustForecastBeginDate = null
              task.adjustForecastEndDate = null
            }
          }
          break
        case 'end_date':
          let formatVal = moment(newVal).format('YYYY-MM-DD')
          let formatVal1 = moment(ganttObject.date.add(newVal, -1, 'day')).format('YYYY-MM-DD')
          let oldValue = moment(state.oldValue).format('YYYY-MM-DD')
          let minEndTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'end')).format('YYYY-MM-DD')
          let maxEndTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')).format('YYYY-MM-DD')
          if (formatVal === oldValue) {
            result = false
          } else if (formatVal1 > maxEndTime || formatVal1 < minEndTime) {
            result = false
            msg = '计划完成时间超出设置范围值！'
            task.end_date = state.oldValue
          } else {
            task.forecastBeginDate = GanttObject.dateToStr(task.start_date, '%Y-%m-%d', ganttObject)
            task.forecastEndDate = GanttObject.dateToStr(ganttObject.date.add(newVal, -1, 'day'), '%Y-%m-%d', ganttObject)
            task.adjustForecastBeginDate = null
            task.adjustForecastEndDate = null
          }
          break
        case 'autoScheduling': // 排成类型
          if (state.newValue === state.oldValue) {
            result = false
          } else {
            if (newVal === '1') {
              task.auto_scheduling = true
              if (ganttObject.hasChild(task.id)) {
                task.type = 'project'
              }
            } else {
              task.auto_scheduling = false
              task.type = 'task'
            }
            task.adjustForecastBeginDate = null
            task.adjustForecastEndDate = null
          }
          break
        case 'start_date': // 开始时间
          let sVal = moment(newVal).format('YYYY-MM-DD')
          let oVal = moment(state.oldValue).format('YYYY-MM-DD')
          let minStartTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'start')).format('YYYY-MM-DD')
          let maxStartTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'start')).format('YYYY-MM-DD')
          if (sVal === oVal) {
            result = false
          } else if (sVal < minStartTime || sVal > maxStartTime) {
            result = false
            msg = '计划开始时间超出设置范围值！'
            task.start_date = state.oldValue
          } else {
            // 计算完成时间
            let endDate = ganttObject.date.add(ganttObject.calculateEndDate(state.newValue, task.duration), -1, 'day')
            task.forecastBeginDate = GanttObject.dateToStr(newVal, '%Y-%m-%d', ganttObject)
            task.forecastEndDate = GanttObject.dateToStr(endDate, '%Y-%m-%d', ganttObject)
            task.adjustForecastBeginDate = null
            task.adjustForecastEndDate = null
          }
          break
        case 'forecastBeginDate': // 预计开始时间
          let nfVal = moment(newVal).format('YYYY-MM-DD')
          let oFVal = moment(state.oldValue).format('YYYY-MM-DD')
          let oFEVal = moment(task.forecastEndDate).format('YYYY-MM-DD')
          if (nfVal === oFVal) {
            result = false
          } else if (nfVal > oFEVal) {
            result = false
            msg = '预计开始时间不能晚于预计完成时间！'
            task.forecastBeginDate = state.oldValue
          }
          break
        case 'forecastEndDate': // 预计完成时间
          let nEVal = moment(newVal).format('YYYY-MM-DD')
          let oEVal = moment(state.oldValue).format('YYYY-MM-DD')
          let oFEndVal = moment(task.forecastBeginDate).format('YYYY-MM-DD')
          if (nEVal === oEVal) {
            result = false
          } else if (nEVal < oFEndVal) {
            result = false
            msg = '预计完成时间不能早于预计开始时间！'
            task.forecastEndDate = state.oldValue
          }
          break
      }
    }
    // 错误时提醒
    if (!result && msg !== '') {
      GanttResolveObject.showMessage(vueThis, msg, 'error')
    }
    return result
  })
}

/**
 * 内联编辑器修改保存后调用逻辑
 * @param ganttObject
 * @param vueThis
 * @returns {*}
 */
GanttResolveObject.onSaveCellEven = function (ganttObject, vueThis) {
  return ganttObject.ext.inlineEditors.attachEvent('onSave', (state) => {
    let colName = state.columnName
    let taskId = state.id
    // 当修改计划开始、计划完成、工期时，标记任务，用于更新父
    if (colName === 'end_date' || colName === 'duration' || colName === 'start_date' || colName === 'predecessors') {
      GanttResolveObject.updateTaskNew(ganttObject, taskId, vueThis)
    }
    // 同步左下角选中任务名称
    if (colName === 'name') {
      vueThis.selectTaskName = ganttObject.getTask(taskId).name
    }
  })
}

/**
 * 新建前后置校验
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.beforeLinkAddCheck = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeLinkAdd', function (id, link) {
    return linkAllowCheck(id, link, ganttObject)
  })
}

/**
 * 修改前后置校验
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.beforeLinkUpdateCheck = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeLinkUpdate', function (id, link) {
    return linkAllowCheck(id, link, ganttObject)
  })
}

/**
 * 前后置链接规则定义
 * @param id
 * @param link
 * @param ganttObject
 * @returns {boolean}
 */
function linkAllowCheck(id, link, ganttObject) {
  // 校验是否循环链接
  if (ganttObject.isCircularLink(link)) {
    return false
  }
  let result = true
  // 前置任务不能为所有父
  ganttObject.eachParent(function (task) {
    if (task.id === link.source) {
      result = false
    }
  }, link.target)
  // 前置任务不能为所有子
  ganttObject.eachTask(function (task) {
    if (task.id === link.source) {
      result = false
    }
  }, link.target)
  return result
}

/**
 * gantt图缩放（ctrl+鼠标滚轮），使用方式 thisGantt.ext.zoom.init(GanttResolveObject.zoomConfig(thisGantt))
 * 由于编辑视图不包含gantt图，无法使用
 * @param ganttObject
 */
GanttResolveObject.zoomConfig = function ganttZoomConfig(ganttObject) {
  return {
    // minColumnWidth: 20,
    // maxColumnWidth: 150,
    levels: [
      // 小时
      // [
      //   { unit: 'day', step: 1, format: '%Y/%m/%d' },
      //   { unit: 'hour', step: 1, format: '%G' }
      // ],
      // 天
      [
        { unit: 'month', step: 1, format: '%Y/%m' },
        { unit: 'day', step: 1, format: '%j(%l)' }
      ],
      // 周
      [
        { unit: 'month', step: 1, format: '%Y/%m' },
        { unit: 'week', step: 1, format: '第%w周' }
      ],
      // 月
      [
        { unit: 'year', step: 1, format: '%Y年' },
        { unit: 'month', format: '%m月', step: 1 }
      ],
      // 季度
      [
        { unit: 'year', step: 1, format: '%Y年' },
        {
          unit: 'quarter',
          step: 1,
          format: function (date) {
            let dateToStr = ganttObject.date.date_to_str('%n')
            let endDate = ganttObject.date.add(ganttObject.date.add(date, 3, 'month'), -1, 'day')
            let result
            if (dateToStr(date) < 4 && dateToStr(date) > 0) {
              result = '一'
            } else if (dateToStr(date) < 7 && dateToStr(date) > 3) {
              result = '二'
            } else if (dateToStr(date) < 10 && dateToStr(date) > 6) {
              result = '三'
            } else {
              result = '四'
            }
            return '第' + result + '季度（' + dateToStr(date) + ' - ' + dateToStr(endDate) + '）'
          }
        }
      ],
      // 年
      [{ unit: 'year', step: 1, format: '%Y年' }]
    ],
    // startDate: new Date(2018, 2, 27),
    // endDate: new Date(2099, 3, 20),
    activeLevelIndex: 0,
    useKey: 'ctrlKey',
    trigger: 'wheel',
    element: function () {
      return ganttObject.$root.querySelector('.gantt_task')
    }
  }
}

/**
 * 工作时间设置
 * @param ganttObject
 */
GanttResolveObject.workTimeSetting = function (ganttObject, vueThis) {
  ganttObject.config.duration_unit = 'hour'
  // ganttObject.config.duration_step = 1
  ganttObject.config.round_dnd_dates = true
  // ganttObject.config.time_step = vueThis.workTime

  ganttObject.templates.timeline_cell_class = function (task, date) {
    if (!ganttObject.isWorkTime(date, 'hour')) {
      return 'no_work_hour'
    }
    return ''
  }

  let weekScaleTemplate = function (date) {
    let dateToStr = ganttObject.date.date_to_str('%Y/%m/%d')
    let weekNum = ganttObject.date.date_to_str('(第 %W 周)')
    let endDate = ganttObject.date.add(ganttObject.date.add(date, 1, 'week'), -1, 'day')
    return dateToStr(date) + ' - ' + dateToStr(endDate) + ' ' + weekNum(date)
  }

  ganttObject.config.scales = [
    { unit: 'week', step: 1, format: weekScaleTemplate },
    { unit: 'day', step: 1, format: '%m/%d(%l)' },
    { unit: 'hour', step: 1, format: '%G' }
  ]

  // 定义全局工作时间范围
  ganttObject.setWorkTime({ hours: [9, 12, 13, 18] })
  // 设置周二为非工作日
  // ganttObject.setWorkTime({ day: 2, hours: false })
  // 设置每周周几工作时间
  ganttObject.setWorkTime({ day: 6, hours: [9, 12, 13, 18] })
  ganttObject.setWorkTime({ day: 0, hours: [9, 12, 13, 18] })
  // 设置具体某天工作时间
  // ganttObject.unsetWorkTime({ date: new Date(2020, 8, 7) })

  // 隐藏工作时间外的时间
  // ganttObject.ignore_time = function (date) {
  //   if (date.getHours() < 9 || date.getHours() > 18) {
  //     return true
  //   }
  //   return false
  // }
  // 隐藏非工作时间
  ganttObject.ignore_time = function (date) {
    return !ganttObject.isWorkTime(date, 'hour')
  }
}

/**
 * 前后置联系那删除提示
 * @param ganttObject
 * @returns {function(*): string}
 */
GanttResolveObject.linkDescription = function (ganttObject) {
  // eslint-disable-next-line no-return-assign
  return (ganttObject.templates.link_description = function (link) {
    let from = ganttObject.getTask(link.source)
    let to = ganttObject.getTask(link.target)
    let text = '<b>' + from.name + '</b>和<b>' + to.name + '</b>的关系'
    return text
  })
}

/**
 * 四种前后置
 * @param linkType
 * @returns {string}
 */
function linkTypeToString(linkType) {
  switch (linkType) {
    case '0':
      return 'Finish to start'
    case '1':
      return 'Start to start'
    case '2':
      return 'Finish to finish'
    case '3':
      return 'Start to finish'
    default:
      return ''
  }
}

/**
 * 添加工具提示
 * @param ganttObject
 */
GanttResolveObject.addTooltip = function (ganttObject, vueThis) {
  ganttObject.plugins({
    tooltip: true
  })
  ganttObject.templates.tooltip_date_format = ganttObject.date.date_to_str('%Y-%m-%d')
  ganttObject.attachEvent('onGanttReady', function () {
    let tooltips = ganttObject.ext.tooltips
    ganttObject.templates.tooltip_text = function (start, end, task) {
      let statusData = vueThis.taskStatus[task.status]
      if (statusData && statusData.name) {
        return [
          '<b>任务名称：</b> ' + task.name,
          '<b>任务状态：</b> ' + statusData.name,
          '<b>计划开始时间</b> ' + ganttObject.templates.tooltip_date_format(task.start_date),
          '<b>计划完成时间</b> ' + ganttObject.templates.tooltip_date_format(ganttObject.date.add(task.end_date, -1, 'day'))
        ].join('<br>')
      } else {
        return ''
      }
    }
    tooltips.tooltipFor({
      selector: '.p8',
      html: function (event, node) {
        let taskId = node.getAttribute('task_id')
        let task = ganttObject.getTask(taskId)
        if (task) {
          let statusData = vueThis.taskStatus[task.status]
          if (statusData && statusData.name) {
            return '<b>任务状态：</b> ' + statusData.name
          } else {
            return ''
          }
        }
      }
    })
    tooltips.tooltipFor({
      selector: '.gantt_task_link',
      html: function (event, node) {
        let linkId = node.getAttribute(ganttObject.config.link_attribute)
        if (linkId) {
          let link = ganttObject.getLink(linkId)
          let from = ganttObject.getTask(link.source)
          let to = ganttObject.getTask(link.target)
          return ['<b>前后置类型:</b> ' + linkTypeToString(link.type), '<b>前置任务: </b> ' + from.name, '<b>当前任务: </b> ' + to.name].join('<br>')
        }
      }
    })
    tooltips.tooltipFor({
      selector: '.gantt_task_progress_wrapper',
      html: function (event, node) {
        let taskId = node.getAttribute('task_id')
        let task = ganttObject.getTask(taskId)
        if (task) {
          let statusData = vueThis.taskStatus[task.status]
          if (statusData && statusData.name) {
            return [
              '<b>任务名称：</b> ' + task.name,
              '<b>任务状态：</b> ' + statusData.name,
              '<b>计划开始时间</b> ' + ganttObject.templates.tooltip_date_format(task.start_date),
              '<b>计划完成时间</b> ' + ganttObject.templates.tooltip_date_format(ganttObject.date.add(task.end_date, -1, 'day'))
            ].join('<br>')
          } else {
            return ''
          }
        }
      }
    })
  })
}

/**
 * @Description 通用属性定义
 * @author fukai
 * @date 2020/5/8 19:04
 */
GanttResolveObject.publicObject = {
  plugins: {
    auto_scheduling: true, // 是否自动排程
    multiselect: true,
    grouping: true,
    undo: true,
    critical_path: true,
    fullscreen: true
  },
  config: {
    work_time: false, // 计算工作时间时排除非工作时间
    skip_off_time: false, // gantt图中隐藏非工作时间
    // correct_work_time: true, // 可以将任务的开始日期和结束日期调整为工作时间（拖动时）
    // 当用户更改任务的开始日期时，任务end_date将保持不变，任务持续时间将被更新以反映更改；
    // 当用户更改任务的结束日期时，任务开始日期将保持不变，任务持续时间将被更新以反映该更改
    inline_editors_date_processing: 'keepDates',
    duration_unit: 'day',
    // min_column_width: 20,
    start_on_monday: true, // 设置一周从周一开始
    row_height: 40,
    scales: [
      { unit: 'month', step: 1, format: '%Y年%m月' },
      { unit: 'day', step: 1, format: '%j' }
    ],
    undo: true,
    redo: true,
    undo_steps: 5, // 撤销5步
    readonly: false,
    drag_progress: false, // 禁止拖动修改进度
    auto_scheduling_compatibility: true,
    auto_scheduling_strict: true,
    auto_scheduling_initial: false, // 初始化加载时不自动排程
    auto_scheduling: true,
    auto_types: false,
    fit_tasks: true, // 自动扩展时间范围以适合所有显示的任务
    details_on_dblclick: false, // 双击不显示编辑框
    open_tree_initially: true,
    // branch_loading: true, // 异步加载
    date_format: '%Y-%m-%d', // 时间格式化
    order_branch: 'marker',
    show_progress: true,
    order_branch_free: true,
    cascade_delete: false, // 禁用联级删除
    // multiselect_one_level: true,//多选只能在同级
    // reorder_grid_columns: true, // 允许通过拖放来重新排布列表列
    keep_grid_width: false,
    grid_resize: true,
    plan_limit: PlanDataLimit.strategyOne, // 计划时间限制策略，若需要新增限制策略，请参考现有策略开发，完成后修改此配置即可
    layout: GanttResolveObject.layout2, // 默认布局为只显示树编辑列表
    resource_store: 'resourceDatas',
    resource_property: 'owner_id', // 责任人定义
    monitor_point: 'monitorPoints', // 标识定义
    plan_type: 'planType', // 任务类型定义
    task_status: 'taskStatus' // 任务状态定义
  },
  templates: {
    progress_text: function (start, end, task) {
      return "<span style='text-align:left'>" + Math.round(task.progress * 100) + '%</span>'
    },
    task_text: function (start, end, task) {
      return "<span style='text-align:left;margin-top: 1px;'>" + task.name + '</span>'
    }
  }
}

/**
 * @Description 重新定义任务更新方法，更新时联动更新父节点
 * @author fukai
 * @date 2020/5/13 14:30
 */
GanttResolveObject.updateTaskNew = function (ganttObject, taskId, vueThis) {
  ganttObject.batchUpdate(function () {
    let task = ganttObject.getTask(taskId)
    if (task.autoScheduling === '1' && ganttObject.getGlobalTaskIndex(task.id) !== 0) {
      task.auto_scheduling = true
      if (ganttObject.hasChild(task.id)) {
        task.type = 'project'
      } else {
        task.type = 'task'
      }
    } else {
      task.auto_scheduling = false
      task.type = 'task'
    }
    updateforecastDate(task, ganttObject)
    ganttObject.updateTask(taskId)
    ganttObject.autoSchedule(taskId)
    let parentId = task.parent
    let parTasksIds = []
    // 修改任务添加关联
    if (vueThis.ganttName === 'changeGantt') {
      if (ganttObject.isTaskExists(parentId)) {
        let parTask = ganttObject.getTask(parentId)
        // 更新父任务
        parTasksIds.push(parTask.id)
        getTaskParent(ganttObject, parTask.id, parTasksIds)
      }
      if (parTasksIds && parTasksIds.length > 0) {
        updateNewTaskMap(ganttObject, parTasksIds, vueThis, taskId)
      }
    } else if (vueThis.ganttName === 'planGantt') {
      if (ganttObject.isTaskExists(parentId)) {
        let parTask = ganttObject.getTask(parentId)
        // 更新父任务
        parTasksIds.push(parTask.id)
        ganttObject.eachParent(function (task) {
          parTasksIds.push(task.id)
        }, parTask.id)
      }
      if (parTasksIds && parTasksIds.length > 0) {
        parTasksIds.forEach((t) => {
          let parT = ganttObject.getTask(t)
          updateforecastDate(parT, ganttObject)
          ganttObject.updateTask(t)
        })
      }
    }
  })
}

/**
 * 任务变更记录
 *    1.任务修改时，自动调度影响锁定层级记录变更
 *    2.任务修改时，影响任务包含锁定标识且标识锁定列包含开始时间、完成时间、工期、排程类型时，记录变更
 * @param ganttObject
 * @param vueThis
 */
GanttResolveObject.planChangeCheck = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onAfterAutoSchedule', function (taskId, updatedTasks) {
    // 判断是否产生变更
    if (vueThis.ganttName === 'changeGantt' && updatedTasks && updatedTasks.length > 0 && taskId) {
      updateNewTaskMap(ganttObject, updatedTasks, vueThis, ganttObject.getTask(taskId).predecessor)
    }
  })
}

/**
 * redo后逻辑处理
 * @param ganttObject
 * @param vueThis
 * @returns {*}
 */
GanttResolveObject.planAfterRedo = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onAfterRedo', function (action) {
    if (vueThis.ganttName && vueThis.ganttName === 'changeGantt' && action.commands && action.commands.length > 0 && vueThis.newTaskMap && Object.keys(vueThis.newTaskMap).length > 0) {
      action.commands.forEach(function (item) {
        if (item.entity === 'task' && vueThis.newTaskMap[item.value.id] && Object.keys(vueThis.newTaskMap[item.value.id]).length > 0) {
          setNewTaskMap(vueThis, item.oldValue, null, 'task')
        }
      })
    }
  })
}

/**
 * undo后逻辑处理
 * @param ganttObject
 * @param vueThis
 * @returns {*}
 */
GanttResolveObject.planAfterUndo = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onAfterUndo', function (action) {
    if (vueThis.ganttName && vueThis.ganttName === 'changeGantt' && action.commands && action.commands.length > 0 && vueThis.newTaskMap && Object.keys(vueThis.newTaskMap).length > 0) {
      action.commands.forEach(function (item) {
        if (item.entity === 'task' && vueThis.newTaskMap[item.value.id] && Object.keys(vueThis.newTaskMap[item.value.id]).length > 0) {
          setNewTaskMap(vueThis, item.value, null, 'task')
        }
      })
    }
  })
}

/**
 * 在将操作添加到撤消堆栈之前校验
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.onBeforeUndoStack = function (ganttObject) {
  // 在将操作添加到撤消堆栈之前触发
  return ganttObject.attachEvent('onBeforeUndoStack', function (action) {
    // 任务的删除和新建不可撤销
    if (action && action.commands && action.commands.length > 0) {
      let commands = action.commands
      for (let i = 0; i < action.commands.length; i++) {
        if (commands[i].entity === 'task' && (commands[i].type === 'add' || commands[i].type === 'remove' || commands[i].type === 'move')) {
          // 清空撤销堆栈
          ganttObject.clearUndoStack()
          return false
        }
      }
    }
    return true
  })
}

/**
 * 在将操作添加到回退堆栈之前校验
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.onBeforeRedoStack = function (ganttObject) {
  // 在将操作添加到回退堆栈之前触发
  return ganttObject.attachEvent('onBeforeRedoStack', function (action) {
    // 任务的删除和新建不可回退
    if (action && action.commands && action.commands.length > 0) {
      let commands = action.commands
      for (let i = 0; i < action.commands.length; i++) {
        if (commands[i].entity === 'task' && (commands[i].type === 'add' || commands[i].type === 'remove' || commands[i].type === 'move')) {
          // 清空回退堆栈
          ganttObject.clearRedoStack()
          return false
        }
      }
    }
    return true
  })
}

/**
 * 撤销前校验任务是否存在
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.onBeforeUndo = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeUndo', function (action) {
    if (action && action.commands && action.commands.length > 0) {
      for (let j = 0; j < action.commands.length; j++) {
        let command = action.commands[j]
        if (command.entity === 'task' && !ganttObject.isTaskExists(command.value.id)) {
          return false
        }
      }
    }
    return true
  })
}

/**
 * 回退前校验任务是否存在
 * @param ganttObject
 * @returns {*}
 */
GanttResolveObject.onBeforeRedo = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeRedo', function (action) {
    if (action && action.commands && action.commands.length > 0) {
      for (let j = 0; j < action.commands.length; j++) {
        let command = action.commands[j]
        if (command.entity === 'task' && !ganttObject.isTaskExists(command.value.id)) {
          return false
        }
      }
    }
    return true
  })
}

/**
 * 是否刷新进度校验 （只有计划状态为进行中时才刷新进度）
 * @param vueThis
 * @returns {boolean}
 */
export function progressRefreshCheck(vueThis) {
  let result = false
  let planStatusLockMap = store.getters.planStatusLockMap
  if (planStatusLockMap[vueThis.planInfoStatus] && planStatusLockMap[vueThis.planInfoStatus]['refreshProgress'] === 'true') {
    result = true
  }
  return result
}

/**
 * 获取gantt设置的列信息
 * @param ganttName
 * @param createPage
 * @returns {null|*}
 */
GanttResolveObject.getGanttSettingGrid = function (ganttName, createPage) {
  let ganttSetting = store.state.user.userSettingAll.Gantt ? store.state.user.userSettingAll.Gantt : null
  let key = ganttName + '-' + createPage
  if (ganttSetting) {
    let columnsSetting = ganttSetting.filter((item) => item.key === key)
    if (columnsSetting && columnsSetting.length) {
      return columnsSetting[0]
    }
  }
  return null
}

/**
 * 定义列类型对应关系，此处添加后，需要编写searchFilter方法对应属性过滤逻辑
 */
const columnsTypeMap = {
  // 'status': 'select',
  // 'managerStatus': 'select',
  // 'monitorPoints': 'select',
  // 'planType': 'select',
  wbs: 'select',
  name: 'input',
  owner_id: 'input',
  roleName: 'input',
  dutyDeptName: 'input',
  // 'weatherControl': 'select',
  // 'predecessors': 'input',
  // 'progress': 'input',
  productQuantity: 'input',
  start_date: 'date',
  end_date: 'date'
  // 'duration': 'input',
  // 'standardDuration': 'input',
  // 'forecastBeginDate': 'date',
  // 'forecastEndDate': 'date',
  // 'realBeginDate': 'date',
  // 'realEndDate': 'date'
}
export const taskStatusArr = [
  {
    id: '6020',
    title: '未开始'
  },
  {
    id: '6050',
    title: '进行中'
  },
  {
    id: '6070',
    title: '已完成'
  }
]

/**
 * 根据gantt列配置信息同步gantt列
 * @param ganttName
 * @param createPage
 * @param ganttObject
 * @returns {[]}
 */
GanttResolveObject.synchronizationColumns = function (vueThis, ganttObject) {
  let initColumns = getGanttColumns(ganttObject, vueThis)
  initColumns.forEach((initItem, initIndex) => {
    let name = initItem.name
    let type = columnsTypeMap[name]
    let dataIndex
    if (type) {
      let label = initItem.label
      if (name === 'owner_id') {
        dataIndex = 'userName'
      } else {
        dataIndex = name
      }
      let newLabel = searchColumnRenderer(dataIndex, label, type)
      initItem.label = newLabel
    }
  })
  // 获取gantt列配置信息
  let ganttSetting = GanttResolveObject.getGanttSettingGrid(vueThis.ganttName, vueThis.createPage)
  // 存在配置信息时，同步，不存在时显示默认gantt列信息
  if (ganttSetting) {
    let settingColumns = ganttSetting.value.columns
    let tempColumns = []
    // 根据表头配置信息修改ganttObject对象中columns的显示隐藏属性及排序
    settingColumns.forEach((settingItem, initIndex) => {
      let initColumn = initColumns.filter((initItem) => initItem.name === settingItem.name)
      if (initColumn && Object.keys(initColumn).length > 0) {
        initColumn[0].hide = settingItem.hide
        tempColumns.push(initColumn[0])
      }
    })
    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    initColumns.forEach((initItem, initIndex) => {
      let settingItem = settingColumns.filter((settingItem) => settingItem.name === initItem.name)
      if (!settingItem || Object.keys(settingItem).length === 0) {
        initItem.hide = false
        if (tempColumns && tempColumns.length > initIndex) {
          tempColumns.splice(initIndex, 0, initItem)
        } else {
          tempColumns.push(initItem)
        }
      }
    })
    ganttObject.config.columns = tempColumns
  } else {
    ganttObject.config.columns = initColumns
  }
}

GanttResolveObject.searchColumnsDataInit = function (vueThis, ganttObject) {
  return ganttObject.attachEvent('onDataRender', function () {
    let initColumns = getGanttColumns(ganttObject, vueThis)
    initColumns.forEach((initItem, initIndex) => {
      let name = initItem.name
      let type = columnsTypeMap[name]
      if (type) {
        let datas = []
        if (type === 'select') {
          switch (name) {
            case 'status':
              datas = taskStatusArr
              break
            case 'managerStatus':
              if (vueThis.managerStatusMap && Object.keys(vueThis.managerStatusMap).length > 0) {
                for (let item in vueThis.managerStatusMap) {
                  let obj = { id: item, title: vueThis.managerStatusMap[item].cmeaning }
                  datas.push(obj)
                }
              }
              break
            case 'monitorPoints':
              datas = ganttObject.serverList(ganttObject.config.monitor_point)
              break
            case 'planType':
              datas = ganttObject.serverList(ganttObject.config.plan_type)
              break
            case 'wbs':
              for (let i = 0; i < vueThis.deep; i++) {
                let item = {
                  id: i + 1 + '',
                  title: i + 1 + ''
                }
                datas.push(item)
              }
          }
        } else if (type === 'date') {
          const datePickerKey = `gantt_datepicker_${name}`
          const children = document.getElementsByClassName(datePickerKey).length && document.getElementsByClassName(datePickerKey)[0].children
          if (vueThis[datePickerKey] && children && children.length) {
            // vueThis[datePickerKey]: 说明组件被创建
            // let childEle = (document.getElementsByClassName(datePickerKey)[0].children).length: 说明被创建的组件存在

            // 当vueThis[datePickerKey] 为true 但 childEle 为false 说明当前列被拖拽了, 拖拽结束,表头部分又被重写, 此时 自定义组件整体元素丢失
            console.log(`${datePickerKey}: has create`)
          } else {
            vueThis[datePickerKey] = new DatePicker(`.${datePickerKey}`, {
              customClassName: 'gantt_custom_datepicker', // 自定义类名 (可根据此类名手动更改组件的样式)
              value: vueThis.searchForm[name] || '',
              onChange: function (value) {
                // change事件
                Gantt.searchColumnsChange(name, value.date, 'date')
              }
            })
          }
        } else if (type === 'input') {
          if (name === 'owner_id') {
            name = 'userName'
          }
          const inputKey = `gantt_inputor_${name}`
          const children = document.getElementsByClassName(inputKey).length && document.getElementsByClassName(inputKey)[0].children
          if (vueThis[inputKey] && children && children.length) {
            // vueThis[inputKey]: 说明组件被创建
            // let childEle = (document.getElementsByClassName(inputKey)[0].children).length: 说明被创建的组件存在

            // 当vueThis[inputKey] 为true 但 childEle 为false 说明当前列被拖拽了, 拖拽结束,表头部分又被重写, 此时 自定义组件整体元素丢失
            console.log(`${inputKey}: has create`)
          } else {
            vueThis[inputKey] = new Inputor(`.${inputKey}`, {
              value: vueThis.searchForm[name] || '',
              placeholder: '请输入',
              onChangeValue(value) {
                vueThis.searchForm[name] = value
              },
              onChange(value) {
                Gantt.searchColumnsChange(name, value, 'input')
              }
            })
          }
        } else {
          // 列resize后数据回填
          if (vueThis.searchForm && Object.keys(vueThis.searchForm).length) {
            let obj = document.getElementById(name + type)
            let result
            if (obj) {
              if (vueThis.searchForm[name] && vueThis.searchForm[name] instanceof Array) {
                result = vueThis.searchForm[name].join(',')
              } else if (vueThis.searchForm[name]) {
                result = vueThis.searchForm[name]
              } else {
                result = ''
              }
              obj.setAttribute('value', result)
            }
          }
        }
        if (datas && datas.length > 0) {
          const multiple = [] // 下拉选择多选定义, 如: 若存在多选, mutiple = ['wbs', 'planType']
          let options = datas.map((item) => {
            return {
              name: item.title,
              value: item.id
            }
          })
          const selectorKey = `gantt_selector_${name}`
          const children = document.getElementsByClassName(selectorKey).length && document.getElementsByClassName(selectorKey)[0].children
          if (vueThis[selectorKey] && children && children.length) {
            // vueThis[selectorKey]: 说明select被创建
            // let childEle = (document.getElementsByClassName(selectorKey)[0].children).length: 说明被创建的select存在

            // 当vueThis[selectorKey] 为true 但 childEle 为false 说明当前列被拖拽了, 拖拽结束,表头部分又被重写, 此时 自定义select整体元素丢失
            console.log(`${selectorKey}: has create`)
          } else {
            vueThis[selectorKey] = new Selector(`.${selectorKey}`, {
              customClassName: 'gantt_custom_select', // 自定义select类名 (可根据此类名手动更改select组件的样式)
              options: options, // select下拉列表(数组对象: [{name: '苹果', value: 'apple'}])
              props: {
                // 提供绑定字段(label-对应数组对象中的name, value对应数组对象的value)
                label: 'name',
                value: 'value'
              },
              multiple: multiple.includes(name), // 是否多选
              value: vueThis.searchForm[name] || vueThis.searchForm__WBS || '', // 绑定的值[array or string](multiple为true--value: ['yk', 'p8'] or value: 'yk,p8'; multiple为false--value: 'yk')
              placeholder: '请选择', // 默认提示文本
              onSelect: function (value) {
                // select change事件
                if (name === 'wbs') {
                  // 列->大纲: 查询和其他列查询方式不同: 大纲列单独处理,选中的值单独存放; 其余列查询按照值进行包含匹配
                  vueThis.searchForm__WBS = value
                  ganttObject.eachTask(function (task) {
                    if (value && ganttObject.calculateTaskLevel(task) === value - 1) {
                      task.$open = false
                    } else {
                      task.$open = true
                    }
                  })
                  ganttObject.render()
                } else {
                  Gantt.searchColumnsChange(name, value, 'select', vueThis[selectorKey])
                }
              }
            })
          }
        }
      }
    })
  })
}

/**
 * 修改计划时间时，父预计时间计算
 * @param ganttObject
 * @param task
 */
GanttResolveObject.calculateParentForecastDate = function (ganttObject, task) {
  if (task.parent) {
    api['planGanttManager.calculateParentForecastDate']({ parentId: task.parent })
      .then((res) => {
        if (res) {
          res.forEach(function (item) {
            let pTask = ganttObject.getTask(item.id)
            pTask.forecastEndDate = item.forecastEndDate
            ganttObject.updateTask(pTask.id)
          })
        }
      })
      .catch(() => {})
  }
}

/**
 * 更新预计时间
 * @param task
 */
export function updateforecastDate(task, ganttObject) {
  task.forecastBeginDate = GanttResolveObject.dateToStr(task.start_date, '%Y-%m-%d', ganttObject)
  task.forecastEndDate = GanttResolveObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), '%Y-%m-%d', ganttObject)
  task.adjustForecastBeginDate = null
  task.adjustForecastEndDate = null
}

/**
 * 任务列表是否动态显示关键路径
 * @param ganttObject
 */
GanttResolveObject.checkIsCriticalTask = function (ganttObject) {
  if (ganttObject && Object.keys(ganttObject).length > 0) {
    ganttObject.templates.grid_row_class = function (start, end, task) {
      if (ganttObject.isCriticalTask(task)) {
        return 'critical_task'
      }
      return ''
    }
  }
}

/**
 * 任务预计时间计算
 * @param ganttObject
 * @param task
 */
GanttResolveObject.calculateForecastDate = function (ganttObject, task) {
  // if (ganttObject.hasChild(task.id)) {
  //   let maxForecastEndDate = moment(ganttObject.date.add(task.end_date, -1, 'day'))
  //   // 父预计时间计算
  //   // 子中最大预计完成时间与父计划完成时间比较，取最大值
  //   ganttObject.eachTask(function (child) {
  //     let forecastEndDate = moment(child.forecastEndDate)
  //     if (maxForecastEndDate.diff(forecastEndDate) < 0) {
  //       maxForecastEndDate = forecastEndDate
  //     }
  //   }, task.id)
  //   // 当父主动修改过预测时间，且修改的预测时间大于maxForecastEndDate，设置父预测时间为修改后的预测时间
  //   if (task.adjustForecastEndDate) {
  //     if (moment(task.adjustForecastEndDate).diff(maxForecastEndDate) >= 0) {
  //       task.forecastEndDate = task.adjustForecastEndDate
  //     } else {
  //       task.forecastEndDate = moment(maxForecastEndDate).format('YYYY-MM-DD')
  //     }
  //   } else {
  //     task.forecastEndDate = moment(maxForecastEndDate).format('YYYY-MM-DD')
  //   }
  // } else if (task.adjustForecastEndDate) { // 父预计时间计算
  //   task.forecastEndDate = task.adjustForecastEndDate
  // } else {
  //   task.forecastEndDate = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
  // }
}

/**
 * gantt带查询列头渲染
 * @param name
 * @param columnName
 * @param searchType
 * @returns {string}
 */
function searchColumnRenderer(name, columnName, searchType) {
  let result
  if (searchType === 'input') {
    // result = '<div class="gantt_search">' + columnName + '</div>' +
    //   '<div class="gantt_search">' +
    //   '<input id="' + name + searchType + '" type="text" class="search_item" value="" placeholder="请输入..." onchange="Gantt.searchColumnsChange(\'' + name + '\',this.value,\'input\')"/>' +
    //   '</div>'
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_search gantt_inputor_' + name + '"' + '></div>'
  } else if (searchType === 'select') {
    // result = '<div class="gantt_search">' + columnName + '</div>' +
    //   '<div class="gantt_search">' +
    //   '<select id="' + name + searchType + '" class="search_item" placeholder="请选择..." onchange="Gantt.searchColumnsChange(\'' + name + '\',this.value,\'select\')"/>">' +
    //   '<option value =""></option>' +
    //   '</select></div>'
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_search gantt_selector_' + name + '"' + '></div>'
  } else if (searchType === 'date') {
    // result = '<div class="gantt_search">' + columnName + '</div>' +
    //   '<div class="gantt_search">' +
    //   '<input id="' + name + searchType + '" type="date" class="search_item" value="" onchange="Gantt.searchColumnsChange(\'' + name + '\',this.value,\'date\')"/></div>'
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_search gantt_datepicker_' + name + '"' + '></div>'
  }
  return result
}
