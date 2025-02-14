import Vue from 'vue'
import { gantt, Gantt } from 'p8-dhtmlx-gantt'
import store from '@/plugins/store'
import { lockMonitorUpdateCheck, monitorLockUnLockCheck } from './ganttLockUnLock'
import { updateNewTaskMap, setNewTaskMap } from './changeGantt'
import { getGanttColumns } from './planGanttObject'
import moment from 'moment'
import api from '@/plugins/api'
import Inputor from '@/assets/commonJS/originalComponents/input'
import Selector from '@/assets/commonJS/originalComponents/select'
import Datepicker from '@/assets/commonJS/originalComponents/datePicker'
import { P8TreeSelect, DatePicker, Select } from 'p8-components-ui'
import { generateTreeThree, generateTree } from '@/utils/generateTree'
import { calculateRemainingDays } from '@/utils/common'

/**
 * @Description 计划时间限制策略
 * @author fukai
 * @date 2020/5/13 9:32
 */
const PlanDataLimit = {}

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
    const curTask = ganttObject.getTask(taskId)
    // 非根节点操作
    if (ganttObject.getGlobalTaskIndex(curTask.id) !== 0 && curTask.parent && ganttObject.isTaskExists(curTask.parent)) {
      const parentTask = ganttObject.getTask(curTask.parent)
      if (parentTask.autoScheduling === '1') {
        // 向上查询非自动计算时间的父
        const parent = getManualParent(parentTask, ganttObject)
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
          const max1 = ganttObject.date.add(limitTask.end_date, -1, 'day')
          const max2 = ganttObject.date.add(curTask.end_date, -1, 'day')
          return max1 > max2 ? max2 : max1
        }
      } else {
        if (minOrMax === 'min') {
          // 在本身开始时间和限制任务开始时间中取最大值
          const minDate1 = limitTask.start_date
          const minDate2 = curTask.start_date
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
      const parTask = ganttObject.getTask(task.parent)
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
  const rootTask = ganttObject.getTaskByWBSCode('1')
  if (ganttObject.isTaskExists(taskId)) {
    const curTask = ganttObject.getTask(taskId)
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
 * @Description 责任令计划时间限制策略3
 *              根节点限制：开始时间不能早于计划开始时间，完后时间不能晚于计划完成时间
 *              自身限制：开始时间不能大于完成时间，完成时间不能小于开始时间
 *
 * @author fukai
 * @date 2020/5/13 9:13
 */
PlanDataLimit.strategyThree = function (ganttObject, taskId, minOrMax, startOrEnd) {
  const rootTask = ganttObject.getTaskByWBSCode('1')
  if (ganttObject.isTaskExists(taskId)) {
    const curTask = ganttObject.getTask(taskId)
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
        return curTask.responsibilityPlanStartTime
      } else {
        return curTask.responsibilityPlanEndTime
      }
    }
  }
}

/**
 * @Description gantt属性对象
 * @author fukai
 * @date 2020/5/13 10:45
 */
export const GanttObject = {}

/**
 * 预计时间与计划开始时间不一致时，预计时间颜色定义
 * @type {string}
 */
GanttObject.forecastColor = '#ff0000'

/**
 * @Description 资源选择后刷新数据
 * @author fukai
 * @date 2020/5/15 15:31
 */
GanttObject.resourceOnAfterSelect = function (ganttObject) {
  ganttObject.$resourcesStore.attachEvent('onAfterSelect', function (id) {
    ganttObject.refreshData()
  })
}

/**
 * @Description grid_row_class样式
 * @author fukai
 * @date 2020/5/15 15:36
 */
GanttObject.grid_row_class = function (ganttObject) {
  return function (start, end, task) {
    const css = []
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
GanttObject.resource_cell_value = function () {
  // eslint-disable-next-line camelcase
  return function (start_date, end_date, resource, tasks) {
    const html = '<div>' + tasks.length + '</div>'
    return html
  }
}

/**
 * @Description task_row_class样式
 * @author fukai
 * @date 2020/5/15 15:39
 */
GanttObject.task_row_class = function (ganttObject) {
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
GanttObject.resource_cell_class = function () {
  // eslint-disable-next-line camelcase
  return function (start_date, end_date, resource, tasks) {
    const css = []
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
GanttObject.timeline_cell_class = function (ganttObject) {
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
  const store = ganttObject.$resourcesStore
  const taskResource = task[ganttObject.config.resource_property]
  const selectedResource = store.getSelectedId()
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
  const selectedTaskId = ganttObject.getState().selected_task
  if (ganttObject.isTaskExists(selectedTaskId)) {
    const selectedTask = ganttObject.getTask(selectedTaskId)
    const selectedResource = selectedTask[ganttObject.config.resource_property]
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
  const resourceStore = ganttObject.getDatastore(ganttObject.config.resource_store)
  const field = ganttObject.config.resource_property
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
GanttObject.resourceTemplates = function (ganttObject) {
  return {
    grid_row_class: function (start, end, resource) {
      const css = []
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
      const css = []
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
GanttObject.resourceConfig = function (ganttObject, vueThis) {
  return {
    scale_height: 50,
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
          const tasks = getResourceTasks(resource.id, ganttObject)
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
          const tasks = getResourceTasks(resource.id, ganttObject)
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
          const resourceStore = ganttObject.getDatastore(ganttObject.config.resource_store)
          const n = resourceStore.hasChild(resource.id) ? resourceStore.getChildren(resource.id).length : 1
          const state = ganttObject.getState()
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
GanttObject.layout1 = {
  css: 'gantt_container',
  cols: [
    {
      width: 600,
      min_width: 400,
      rows: [
        {
          view: 'grid',
          scrollX: 'gridScroll',
          scrollable: true,
          scrollY: 'scrollVer'
        },
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
GanttObject.layout1_fun = (firstWidth = 600) => {
  return {
    css: 'gantt_container',
    cols: [
      {
        width: firstWidth,
        min_width: 400,
        rows: [
          {
            view: 'grid',
            scrollX: 'gridScroll',
            scrollable: true,
            scrollY: 'scrollVer'
          },
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
GanttObject.layout2 = {
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
        {
          view: 'grid',
          scrollX: 'gridScroll',
          scrollable: true,
          scrollY: 'scrollVer'
        },
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
GanttObject.layout3 = function (resourceConfig, resourceTemplates) {
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
              {
                view: 'grid',
                scrollX: 'gridScroll',
                scrollable: true,
                scrollY: 'scrollVer'
              },
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
              {
                view: 'resourceGrid',
                scrollX: 'resourceGridScroll',
                scrollable: true,
                scrollY: 'resourceVScroll'
              },
              { view: 'scrollbar', id: 'resourceGridScroll', group: 'vertical' }
            ]
          },
          {
            rows: [
              {
                view: 'resourceTimeline',
                scrollX: 'resourceScrollHor',
                scrollY: 'resourceVScroll'
              },
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
const ganttObjectMap = {}
const dpObjectMap = {}

/**
 * @Description 获取gantt对象方法，根据传入名称查询现有对象，若存在则返回，不存在则新建
 * @author fukai
 * @date 2020/5/21 18:31
 */
GanttObject.getGanttObject = function getGanttObject(name, config) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    if (Object.keys(ganttObjectMap).length > 0 && ganttObjectMap[name] && Object.keys(ganttObjectMap[name]).length > 0) {
      return ganttObjectMap[name]
    } else {
      const newObj = Gantt.getGanttInstance(Object.keys(config).length > 0 ? config : GanttObject.publicObject)
      // 本地化
      newObj.i18n.setLocale('cn')
      ganttObjectMap[name] = newObj
      return newObj
    }
  }
  return null
}
GanttObject.getGanttObject = function getGanttObject(name) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    if (Object.keys(ganttObjectMap).length > 0 && ganttObjectMap[name] && Object.keys(ganttObjectMap[name]).length > 0) {
      return ganttObjectMap[name]
    } else {
      const newObj = Gantt.getGanttInstance(GanttObject.publicObject)
      // 本地化
      newObj.i18n.setLocale('cn')
      ganttObjectMap[name] = newObj
      return newObj
    }
  }
  return null
}

GanttObject.setGanttObject = function setGanttObject(name, ganttObject) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    ganttObjectMap[name] = ganttObject
  }
}

/**
 * @Description 获取数据处理器对象，根据传入名称查询现有对象，若存在则返回，不存在则返回null
 * @author fukai
 * @date 2020/5/22 9:04
 */
GanttObject.getDpObject = function getDpObject(name) {
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
GanttObject.setDpObject = function setDpObject(name, dpObject) {
  if (name.replace(/(^s*)|(s*$)/g, '').length > 0) {
    dpObjectMap[name] = dpObject
  }
}

/**
 * 日期格式化
 *    默认格式为：'%Y-%m-%d',2010-10-10
 * @constructor
 */
GanttObject.dateToStr = function (date, format, ganttObject) {
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
GanttObject.strToDate = function (date, format, ganttObject) {
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
GanttObject.getActions = function (ganttObject) {
  return {
    undo: function () {
      ganttObject.ext.undo.undo()
    },
    indentAction: function indent(taskId) {
      const task = ganttObject.getTask(taskId)
      let prevId = ganttObject.getPrevSibling(taskId)
      while (ganttObject.isSelectedTask(prevId)) {
        const prev = ganttObject.getPrevSibling(prevId)
        if (!prev) break
        prevId = prev
      }
      if (prevId) {
        const newParent = ganttObject.getTask(prevId)
        ganttObject.moveTask(taskId, ganttObject.getChildren(newParent.id).length, newParent.id)
        if (newParent.autoScheduling === '1' && !ganttObject.hasChild(prevId)) {
          newParent.type = 'project'
        }
        newParent.$open = true
        // 添加更新类型
        newParent.updateType = 'indent'
        task.updateType = 'indent'
        ganttObject.updateTask(taskId)
        ganttObject.updateTask(newParent.id)
        return taskId
      }
      return null
    },
    outdentAction: function outdent(taskId, initialIndexes, initialSiblings) {
      const curTask = ganttObject.getTask(taskId)
      const oldParent = ganttObject.getTask(curTask.parent)
      const oldParenrPar = oldParent.parent
      ganttObject.ext.undo.saveState(taskId, 'task')
      if (ganttObject.isTaskExists(oldParent.id) && oldParent.id !== ganttObject.config.root_id && oldParenrPar !== ganttObject.config.root_id) {
        // 升级不能升到和根平级
        let index = ganttObject.getTaskIndex(oldParent.id) + 1
        const prevSibling = initialSiblings[taskId].first
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
        // 旧父排程为自动时进度计算
        if (oldParent.autoScheduling === '1') {
          oldParent.progress = GanttObject.calculateProgress(oldParent, ganttObject)
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
GanttObject.performAction = function (actions, ganttObject) {
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
      const indexes = {}
      const siblings = {}
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

      const updated = {}
      ganttObject.eachSelectedTask(function (taskId) {
        if (cascadeAction[actionName]) {
          if (!updated[ganttObject.getParent(taskId)]) {
            const updatedId = action(taskId, indexes, siblings)
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
 * auther: wangzhifeng
 * desc: 判断任务是否可编辑
 * date: 2024/04/03 09:22:18
 */
GanttObject.getTaskEditable = function (ganttObject, state, vueThis) {
  // 点击列名
  const colName = state.columnName
  // 当前任务
  const task = ganttObject.getTask(state.id)
  // 根节点不可编辑
  if (ganttObject.getGlobalTaskIndex(state.id) === 0 && colName != 'achievements') {
    return false
  }
  // 只读gantt不可操作
  if (ganttObject.config.readonly) {
    return false
  }
  // 如果是任务分解，非当前人员创建的，只能编辑责任人
  const userId = store.getters.userInfo.id
  if (vueThis.createPage === 'decompose' && task.createUserId && task.createUserId != userId) {
    return false
  }
  // const userMaxSecret = vueThis.$store.state.user.userInfo.confidentialiteList[vueThis.$store.state.user.userInfo.confidentialiteList.length - 1].id
  // if (task.secretGrade > userMaxSecret) {
  //   vueThis.$message.warning('低密人员不允许修改高密数据')
  //   return false
  // }
  // 获取gannt操作限制策略
  const taskStatusLockMap = store.getters.taskStatusLockMap
  const editManagerStatus = taskStatusLockMap[task.status]
  // 已完成、变更中、提交审批不可操作
  if (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1) {
    return false
  }
  if (task.managerStatus === '6407') {
    return false
  }
  // 父排程为自动时，父开始、完成、工期不可编辑
  if (task.type === 'project' && (colName === 'start_date' || colName === 'end_date' || colName === 'duration')) {
    return false
  }

  if (colName === 'productQuantity') {
    const indexOf = task.monitorPoints.indexOf('1032')
    if (indexOf !== -1) {
      return true
    }
    return false
  }

  // 生产/试制类任务，不可以修改任务数量
  if (colName === 'productQuantity' && task.planType && task.planType.startsWith('3103')) {
    return false
  }
  if (task.monitorPoints && task.monitorPoints.indexOf('1015') !== -1 && vueThis.monitorLockMap['101502'] === '1') {
    return false
  }
  // 标识加锁任务不可编辑
  const monitors = task.monitorPoints
  if (monitors && monitors.length > 0) {
    return monitorLockUnLockCheck(colName, monitors.split(','), vueThis, ganttObject)
  }

  return true
}

/**
 * @Description 排程模式定义
 * @author fukai
 * @date 2020/5/13 14:14
 */
GanttObject.autoScheduleList = function (ganttObject) {
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
GanttObject.formatter = function (ganttObject) {
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
GanttObject.linksFormatter = function (ganttObject, formatter) {
  return ganttObject.ext.formatters.linkFormatter({
    durationFormatter: formatter
  })
}
const html5DateFormat = '%Y-%m-%d'
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

GanttObject.endDateEditor = function (ganttObject) {
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
      const minAttr = minValue ? " min='" + dateToStr(minValue) + "' " : ''
      const maxAttr = maxValue ? " max='" + dateToStr(maxValue) + "' " : ''
      const html = "<div style='width:140px'><input type='date' " + minAttr + maxAttr + " name='" + column.name + "'></div>"
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
      const currentValue = this.get_value(id, column, node)
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
      const input = this.get_input(node)
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
GanttObject.customDateEditor = function (ganttObject) {
  let customDate
  ganttObject.config.editor_types.custom_date_editor = {
    show: function (id, column, config, placeholder) {
      const task = ganttObject.getTask(id)
      init(ganttObject)
      let minValue = null
      let maxValue = null
      if (typeof config.min === 'function') {
        config.min(id, column) && (minValue = dateToStr(config.min(id, column)))
      } else if (config.min) {
        minValue = dateToStr(config.min)
      }
      if (typeof config.max === 'function') {
        config.max(id, column) && (maxValue = dateToStr(config.max(id, column)))
      } else if (config.max) {
        maxValue = dateToStr(config.max)
      }
      const name = column.name
      const html =
        "<div style='width:100%'><input id='gantt_datePicker_" +
        name +
        "' name='" +
        name +
        " type='text' style='display:none'><div style='line-height: 40px;'><div class='gantt_datePicker_" +
        name +
        "'></div></div></div>"
      placeholder.innerHTML = html
      const EditDatePicker = Vue.extend({
        components: { 'el-date-picker': DatePicker },
        data: function () {
          let initDate
          if (typeof task[column.name] === 'string') {
            initDate = task[column.name]
          } else if (typeof task[column.name] === 'object') {
            initDate = dateToStr(task[column.name])
          }
          return {
            input: initDate,
            treeData: [],
            config: {
              valueFormat: 'yyyy-MM-dd',
              pickerOptions: {
                // 添加快捷选项
                shortcuts: [
                  {
                    text: '今天',
                    onClick(picker) {
                      picker.$emit('pick', new Date())
                    }
                  },
                  {
                    text: '昨天',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() - 3600 * 1000 * 24)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '明天',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() + 3600 * 1000 * 24)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一周前',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一周后',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一个月前',
                    onClick(picker) {
                      const date = new Date()
                      date.setMonth(date.getMonth() - 1)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一个月后',
                    onClick(picker) {
                      const date = new Date()
                      date.setMonth(date.getMonth() + 1)
                      picker.$emit('pick', date)
                    }
                  }
                ],
                disabledDate: (time) => {
                  if (minValue && maxValue) {
                    return new Date(maxValue).getTime() < time.getTime() || time.getTime() < new Date(minValue).getTime() - 24 * 60 * 60 * 1000
                  }
                  if (!minValue && maxValue) {
                    return new Date(maxValue).getTime() < time.getTime()
                  }
                  if (minValue && !maxValue) {
                    return time.getTime() < new Date(minValue).getTime() - 24 * 60 * 60 * 1000
                  }
                }
              }
            }
          }
        },
        mounted() {
          this.$refs.datePicker.focus()
        },
        watch: {
          input(val, old) {
            val !== old && (document.getElementById('gantt_datePicker_' + name).value = val)
          }
        },
        methods: {
          handlerBlur(value) {
            ganttObject.ext.inlineEditors.save()
          }
        },
        template:
          '<div class="gantt_Editor gantt_datePicker_' +
          name +
          '"' +
          '><el-date-picker ref="datePicker" @blur="handlerBlur" v-model="input" value-format="yyyy-MM-dd" v-bind="config"></el-date-picker></div>'
      })
      customDate = new EditDatePicker().$mount(`.gantt_datePicker_${name}`)
    },
    hide: function () {
      customDate.$destroy()
      customDate.$el.parentNode.removeChild(customDate.$el)
    },
    set_value: function (value, id, column, node) {
      if (value && value.getFullYear) {
        customDate.$data.input = dateToStr(value)
        this.get_input(node).value = dateToStr(value)
      } else {
        customDate.$data.input = value
        this.get_input(node).value = value
      }
      // this.get_input(node).value = value
    },
    get_value: function (id, column, node) {
      return this.get_input(node).value ? strToDate(this.get_input(node).value) : ''
    },
    is_changed: function (value, id, column, node) {
      const currentValue = this.get_value(id, column, node)
      if (value && value.getFullYear) {
        customDate.$data.input = dateToStr(value)
      } else {
        customDate.$data.input = value
      }
      if (currentValue && value && currentValue.valueOf && value.valueOf) {
        if (currentValue.valueOf() !== value.valueOf()) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    is_valid: function (value, id, column, node) {
      if (isNaN(value)) {
        return false
      }
      return true
    },
    get_input: function (node) {
      return node.querySelector('input')
    },
    focus: function (node) {
      const input = this.get_input(node)
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
GanttObject.customEndDateEditor = function (ganttObject) {
  let customEndDateEditor
  ganttObject.config.editor_types.custom_end_date_editor = {
    show: function (id, column, config, placeholder) {
      const task = ganttObject.getTask(id)
      init(ganttObject)
      let minValue = null
      let maxValue = null
      if (typeof config.min === 'function') {
        config.min(id, column) && (minValue = dateToStr(config.min(id, column)))
      } else {
        minValue = dateToStr(config.min)
      }
      if (typeof config.max === 'function') {
        config.max(id, column) && (maxValue = dateToStr(config.max(id, column)))
      } else {
        maxValue = dateToStr(config.max)
      }
      const name = column.name
      const html =
        "<div style='width:100%'><input id='gantt_end_datePicker_" +
        name +
        "' name='" +
        name +
        " type='text' style='display:none'><div style='line-height: 40px;'><div class='gantt_end_datePicker_" +
        name +
        "'></div></div></div>"
      placeholder.innerHTML = html
      const EditDatePicker = Vue.extend({
        components: { 'el-date-picker': DatePicker },
        data: function () {
          let initDate
          if (typeof task[column.name] === 'string') {
            initDate = task[column.name]
          } else if (typeof task[column.name] === 'object') {
            initDate = dateToStr(task[column.name])
          }
          return {
            input: initDate,
            treeData: [],
            config: {
              pickerOptions: {
                // 添加快捷选项
                shortcuts: [
                  {
                    text: '今天',
                    onClick(picker) {
                      picker.$emit('pick', new Date())
                    }
                  },
                  {
                    text: '昨天',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() - 3600 * 1000 * 24)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '明天',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() + 3600 * 1000 * 24)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一周前',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一周后',
                    onClick(picker) {
                      const date = new Date()
                      date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一个月前',
                    onClick(picker) {
                      const date = new Date()
                      date.setMonth(date.getMonth() - 1)
                      picker.$emit('pick', date)
                    }
                  },
                  {
                    text: '一个月后',
                    onClick(picker) {
                      const date = new Date()
                      date.setMonth(date.getMonth() + 1)
                      picker.$emit('pick', date)
                    }
                  }
                ],
                disabledDate: (time) => {
                  const vueThis = store.getters.vueThis
                  if (vueThis.createPage === 'decompose') {
                    if (minValue && maxValue) {
                      return new Date(maxValue).getTime() < time.getTime() || time.getTime() < new Date(minValue).getTime() - 24 * 60 * 60 * 1000
                    }
                    if (!minValue && maxValue) {
                      return new Date(maxValue).getTime() < time.getTime()
                    }
                    if (minValue && !maxValue) {
                      return time.getTime() < new Date(minValue).getTime() - 24 * 60 * 60 * 1000
                    }
                  } else {
                    if (minValue && maxValue) {
                      return time.getTime() < new Date(minValue).getTime() - 24 * 60 * 60 * 1000
                    }
                    if (!minValue && maxValue) {
                      return new Date(maxValue).getTime() < time.getTime()
                    }
                    if (minValue && !maxValue) {
                      return time.getTime() < new Date(minValue).getTime() - 24 * 60 * 60 * 1000
                    }
                  }
                }
              }
            }
          }
        },
        mounted() {
          this.$refs.datePicker.focus()
        },
        watch: {
          input(val, old) {
            val !== old && (document.getElementById('gantt_end_datePicker_' + name).value = val)
          }
        },
        methods: {
          handlerBlur(value) {
            ganttObject.ext.inlineEditors.save()
          }
        },
        template:
          '<div class="gantt_Editor gantt_datePicker_' +
          name +
          '"' +
          '><el-date-picker ref="datePicker" v-model="input" @blur="handlerBlur" value-format="yyyy-MM-dd" v-bind="config"></el-date-picker></div>'
      })
      customEndDateEditor = new EditDatePicker().$mount(`.gantt_end_datePicker_${name}`)
    },
    hide: function () {
      customEndDateEditor.$destroy()
      customEndDateEditor.$el.parentNode.removeChild(customEndDateEditor.$el)
    },
    set_value: function (value, id, column, node) {
      this.get_input(node).value = value
      if (value && value.getFullYear) {
        this.get_input(node).value = dateToStr(ganttObject.date.add(value, -1, 'day'))
        customEndDateEditor.$data.input = dateToStr(ganttObject.date.add(value, -1, 'day'))
      } else {
        this.get_input(node).value = ganttObject.date.add(value, -1, 'day')
        customEndDateEditor.$data.input = ganttObject.date.add(value, -1, 'day')
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
      const currentValue = this.get_value(id, column, node)
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
      if (isNaN(value)) {
        return false
      }
      return true
    },
    get_input: function (node) {
      return node.querySelector('input')
    },
    focus: function (node) {
      const input = this.get_input(node)
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
GanttObject.treeDataEditor = function (ganttObject, editorConfig, editorConfig1) {
  let treeSelectExample
  ganttObject.config.editor_types.tree_data_editor = {
    show: function (id, column, config, placeholder) {
      const task = ganttObject.getTask(id)
      const name = column.name
      const html =
        "<div style='width:100%'><input id='gantt_treeSelect_" +
        name +
        "' type='text' style='display:none'><div style='line-height: 40px;'><div class='gantt_treeSelect_" +
        name +
        "'></div></div></div>"
      placeholder.innerHTML = html
      const Treeselect = Vue.extend({
        components: { 'p8-tree-select': P8TreeSelect },
        data: function () {
          return {
            input: '',
            treeData: [],
            config: editorConfig1
          }
        },
        created() {},
        mounted() {
          this.$api[this.config.optionUrl.api](this.config.optionUrl.params).then((res) => {
            if (this.config.useTreeFormat) {
              this.treeData = generateTreeThree(res, this.config.useTreePId)
            } else {
              this.treeData = res
            }
            this.input = editorConfig1.multiple && task[name] ? task[name].split(',') : task[name]
          })
        },
        watch: {
          input(val, old) {
            document.getElementById('gantt_treeSelect_' + name).value = val
            eventBus.$emit('isReflash', true)
          }
        },
        methods: {
          handleChange(value) {
            Gantt.searchColumnsChange(name, value, 'date')
          }
        },
        template: '<div class="gantt_Editor gantt_treeSelect_' + name + '"' + '><p8-tree-select v-model="input" size="mini" v-bind="config" :data="treeData"></p8-tree-select></div>'
      })
      treeSelectExample = new Treeselect().$mount(`.gantt_treeSelect_${name}`)
    },
    hide: function () {
      treeSelectExample.$destroy()
      treeSelectExample.$el.parentNode.removeChild(treeSelectExample.$el)
    },
    set_value: function (value, id, column, node) {
      treeSelectExample.$data.input = value
      this.get_input(node).value = value
    },
    get_value: function (id, column, node) {
      return this.get_input(node).value
    },
    is_changed: function (value, id, column, node) {
      treeSelectExample.$data.input = value
      return true
    },
    is_valid: function (value, id, column, node) {
      return true
    },
    get_input: function (node) {
      return node.querySelector('input')
    },
    focus: function (node) {}
  }
}
GanttObject.treeDataEditorExtra = function (ganttObject, editorConfig) {
  let treeSelectExample
  ganttObject.config.editor_types.tree_data_editor_extra = {
    show: function (id, column, config, placeholder) {
      const task = ganttObject.getTask(id)
      const name = column.name
      const html =
        "<div style='width:100%'><input id='gantt_treeSelect_" +
        name +
        "' type='text' style='display:none'><div style='line-height: 40px;'><div class='gantt_treeSelect_" +
        name +
        "'></div></div></div>"
      placeholder.innerHTML = html
      const Treeselect = Vue.extend({
        components: { 'p8-tree-select': P8TreeSelect },
        data: function () {
          return {
            input: '',
            treeData: [],
            config: config.editorConfig,
            filter: { multiple: config.editorConfig.multiple }
          }
        },
        created() {},
        mounted() {
          this.$api[this.config.optionUrl.api](this.config.optionUrl.params).then((res) => {
            if (this.config.useTreeFormat) {
              this.treeData = generateTreeThree(res, this.config.useTreePId)
            } else {
              this.treeData = res
            }
            this.input = config.editorConfig.multiple && task[name] ? task[name].split(',') : task[name]
          })
        },
        watch: {
          input(val, old) {
            document.getElementById('gantt_treeSelect_' + name).value = val
          }
        },
        methods: {
          handleChange(value) {
            Gantt.searchColumnsChange(name, value, 'date')
          }
        },
        template: '<div class="gantt_Editor gantt_treeSelect_' + name + '"' + '><p8-tree-select v-model="input" size="mini" v-bind="config" :data="treeData"></p8-tree-select></div>'
      })
      treeSelectExample = new Treeselect().$mount(`.gantt_treeSelect_${name}`)
    },
    hide: function () {
      treeSelectExample.$destroy()
      treeSelectExample.$el.parentNode.removeChild(treeSelectExample.$el)
    },
    set_value: function (value, id, column, node) {
      treeSelectExample.$data.input = value
      this.get_input(node).value = value
    },
    get_value: function (id, column, node) {
      return this.get_input(node).value
    },
    is_changed: function (value, id, column, node) {
      treeSelectExample.$data.input = value
      return true
    },
    is_valid: function (value, id, column, node) {
      return true
    },
    get_input: function (node) {
      return node.querySelector('input')
    },
    focus: function (node) {}
  }
}
// 带清空按钮的下拉框
GanttObject.selectCanClear = function (ganttObject) {
  let clrearSelectExample
  ganttObject.config.editor_types.select_can_clear = {
    show: function (id, column, config, placeholder) {
      var task = ganttObject.getTask(id)
      let name = column.name
      let html =
        "<div style='width:100%'><input id='gantt_clearSelect_" +
        name +
        "' type='text' style='display:none'><div style='line-height: 40px;'><div class='gantt_clearSelect_" +
        name +
        "'></div></div></div>"
      placeholder.innerHTML = html
      let Clearselect = Vue.extend({
        components: { 'el-select': Select },
        data: function () {
          return {
            input: '',
            options: [],
            config: config.editorConfig,
            multiple: config.editorConfig.multiple
          }
        },
        created() {
          this.$api[this.config.optionUrl.api](this.config.optionUrl.params).then((res) => {
            if (res && res.length) {
              res.forEach((el) => {
                this.options.push({ key: el.value, label: el.label })
              })
            }
            this.input = config.editorConfig.multiple && task[name] ? task[name].split(',') : task[name]
          })
        },
        mounted() {
          this.input = task[name]
        },
        watch: {
          input(val, old) {
            document.getElementById('gantt_clearSelect_' + name).value = val
          }
        },
        template:
          '<div class="gantt_Editor gantt_clearSelect_' +
          name +
          '"' +
          '><el-select style="width:100%" :multiple="multiple" clearable v-model="input" size="mini" placeholder="请选择"><el-option v-for="item in options" :key="item.key" :label="item.label" :value="item.key"></el-option></el-select></div>'
      })
      clrearSelectExample = new Clearselect().$mount(`.gantt_clearSelect_${name}`)
    },
    hide: function () {
      clrearSelectExample.$destroy()
      clrearSelectExample.$el.parentNode.removeChild(clrearSelectExample.$el)
    },
    set_value: function (value, id, column, node) {
      clrearSelectExample.$data.input = value
      this.get_input(node).value = value
    },
    get_value: function (id, column, node) {
      return this.get_input(node).value
    },
    is_changed: function (value, id, column, node) {
      clrearSelectExample.$data.input = value
      return true
    },
    is_valid: function (value, id, column, node) {
      return true
    },
    get_input: function (node) {
      return node.querySelector('input')
    },
    focus: function (node) {}
  }
}

/**
 * @Description 编辑器初始化
 * @author fukai
 * @date 2020/5/13 14:21
 */
GanttObject.editors = function (ganttObject, formatter, linksFormatter) {
  return {
    text: { type: 'text', map_to: 'name' },
    achievements: { type: 'number', map_to: 'achievements' },
    proportion: { type: 'number', map_to: 'proportion' },
    taskProjectName: { type: 'text', map_to: 'taskProjectName' },
    qualityRequirement: { type: 'text', map_to: 'qualityRequirement', defaultValue: '' },
    taskMajorName: { type: 'text', map_to: 'taskMajorName' },
    start_date: {
      type: 'custom_date_editor',
      map_to: 'start_date',
      min: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'start')
      },
      max: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'start')
      }
    },
    end_date: {
      type: 'custom_end_date_editor',
      map_to: 'end_date',
      min: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'end')
      },
      max: function (taskId) {
        return ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')
      }
    },
    // secretGrades: {
    //   type: 'select',
    //   map_to: 'secretGrade',
    //   options: [
    //     { key: '9001', label: '公开' },
    //     { key: '9003', label: '内部' },
    //     { key: '9004', label: '普通商业秘密' },
    //     { key: '9005', label: '秘密' },
    //     { key: '9006', label: '核心商业秘密' },
    //     { key: '9007', label: '机密' }
    //   ]
    // },
    forecastBeginDate: {
      type: 'custom_date_editor',
      map_to: 'forecastBeginDate',
      min: new Date(2000, 0, 1),
      max: new Date(2099, 0, 1)
    },
    forecastEndDate: {
      type: 'custom_date_editor',
      map_to: 'forecastEndDate',
      min: new Date(2000, 0, 1),
      max: new Date(2099, 0, 1)
    },
    duration: {
      type: 'duration',
      map_to: 'duration',
      min: 1,
      max: function (taskId) {
        const startDate = moment(ganttObject.getTask(taskId).start_date).format('YYYY-MM-DD')
        const maxEndDate = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')).format('YYYY-MM-DD')
        return startDate.diff(maxEndDate, 'days')
      },
      formatter: formatter
    },
    progress: { type: 'number', map_to: 'progress', min: 0, max: 1 },
    number: { type: 'number', map_to: 'productQuantity', min: 0, max: 999999 },
    completeQuantity: { type: 'number', map_to: 'completeQuantity', min: 0, max: 999999 },
    schedule: {
      type: 'select',
      map_to: 'autoScheduling',
      options: ganttObject.serverList('autoScheduleList')
    },
    predecessors: {
      type: 'predecessor',
      map_to: 'auto',
      formatter: linksFormatter
    },
    // qualityRequirement: {
    //   type: 'text',
    //   map_to: 'qualityRequirement'
    //   // formatter: linksFormatter
    // },
    userEditor: {
      type: 'select',
      map_to: 'owner_id',
      options: ganttObject.serverList('resourceDatas')
    },
    responsibilityPlanStartTime: {
      type: 'custom_date_editor',
      map_to: 'responsibilityPlanStartTime',
      min: function (taskId) {
        // return new Date(ganttObject.config.responsibilityPlan_limit(ganttObject, taskId, 'min', 'end'))
      },
      max: function (taskId) {
        return ganttObject.config.responsibilityPlan_limit(ganttObject, taskId, 'max', 'end') ? new Date(ganttObject.config.responsibilityPlan_limit(ganttObject, taskId, 'max', 'end')) : ''
      }
    },
    responsibilityPlanEndTime: {
      type: 'custom_date_editor',
      map_to: 'responsibilityPlanEndTime',
      min: function (taskId) {
        return ganttObject.config.responsibilityPlan_limit(ganttObject, taskId, 'min', 'end') ? new Date(ganttObject.config.responsibilityPlan_limit(ganttObject, taskId, 'min', 'end')) : ''
      },
      max: function (taskId) {
        // return new Date(ganttObject.config.responsibilityPlan_limit(ganttObject, taskId, 'max', 'end'))
      }
    },
    breakDownProject: {
      type: 'select',
      map_to: 'breakDownProject',
      options: ganttObject.serverList('yesOron')
    },
    keyNodePlan: {
      type: 'select',
      map_to: 'keyNodePlan',
      options: ganttObject.serverList('yesOron')
    },
    trainingMode: {
      type: 'select',
      map_to: 'trainingMode',
      options: [
        { key: '540ef9be23be5afdc48d6b41f14483ec', label: '内训' },
        { key: '3a791c8d56a16396b060ca079a28cde5', label: '外训' },
        { key: '48dfbbf27287778b91a05ae76f983559', label: '网课' }
      ]
    },
    setts: { type: 'text', map_to: 'setts', defaultValue: '' },
    completeForm: { type: 'text', map_to: 'completeForm' },
    completeCriteria: { type: 'text', map_to: 'completeCriteria' },
    trainingObject: { type: 'text', map_to: 'trainingObject' },
    completeNum: { type: 'text', map_to: 'completeNum' },
    // qualityRequirement: { type: 'text', map_to: 'qualityRequirement', defaultValue: '' },
    planTypeDic: {
      type: 'select',
      map_to: 'planTypeDic',
      options: [
        { key: '8d806619abce467ee5a0d9bb8b790dab', label: '重要' },
        { key: 'b1ea43fb96a2155607d5155d0caf94ef', label: '一般' },
        { key: '11d96bf1eb38b4951c010dfd7417d2a3', label: '核心' }
      ]
    },
    machineName: { type: 'text', map_to: 'machineName', defaultValue: '' },
    combinationName: { type: 'text', map_to: 'combinationName', defaultValue: '' },
    notes: { type: 'text', map_to: 'notes', defaultValue: '' },
    evaluation: { type: 'text', map_to: 'evaluation', defaultValue: '' }
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
    const parentId = ganttObject.getTask(taskId).parent
    if (parentId && ganttObject.isTaskExists(parentId)) {
      const parTask = ganttObject.getTask(parentId)
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
GanttObject.updateScheduling = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onAfterTaskAutoSchedule', function (task, start, link, predecessor) {
    if (task && predecessor && task.autoScheduling === '1') {
      updateforecastDate(task, ganttObject)
      ganttObject.updateTask(task.id)
      }
    if (task.parent) {
      const parentId = task.parent
      const parentTask = ganttObject.getTask(parentId)
      if (parentTask.autoScheduling !== '1') return
      const parTasksIds = []
      // 修改任务添加关联
      if (vueThis.ganttName === 'changeGantt') {
        if (ganttObject.isTaskExists(parentId)) {
          const parTask = ganttObject.getTask(parentId)
          // 更新父任务
          parTasksIds.push(parTask.id)
          ganttObject.eachParent(function (task) {
            parTasksIds.push(task.id)
          }, parTask.id)
        }
        if (parTasksIds && parTasksIds.length > 0) {
          parTasksIds.forEach((t) => {
            const parT = ganttObject.getTask(t)
            updateforecastDate(parT, ganttObject)
            ganttObject.updateTask(t)
          })
        }
        if (ganttObject.isTaskExists(parentId)) {
          const parTask = ganttObject.getTask(parentId)
          // 更新父任务
          parTasksIds.push(parTask.id)
          getTaskParent(ganttObject, parTask.id, parTasksIds)
        }
        // if (parTasksIds && parTasksIds.length > 0) {
        updateNewTaskMap(ganttObject, parTasksIds, vueThis, taskId)
        // }
      } else if (vueThis.ganttName === 'planGantt') {
        if (ganttObject.isTaskExists(parentId)) {
          const parTask = ganttObject.getTask(parentId)
          // 更新父任务
          parTasksIds.push(parTask.id)
          ganttObject.eachParent(function (task) {
            parTasksIds.push(task.id)
          }, parTask.id)
        }
        if (parTasksIds && parTasksIds.length > 0) {
          parTasksIds.forEach((t) => {
            const parT = ganttObject.getTask(t)
            updateforecastDate(parT, ganttObject)
            ganttObject.updateTask(t)
          })
        }
      }
    }
  })
}

/**
 * @Description 任务不可拖动限制
 * @author fukai
 * @date 2020/5/14 10:30
 */
GanttObject.unMoveTask = function (vueThis, ganttObject) {
  return ganttObject.attachEvent('onBeforeRowDragEnd', function (id, parent, tindex) {
    const task = ganttObject.getTask(id)
    if (ganttObject.getSelectedTasks().length > 1) {
      GanttObject.showMessage(vueThis, '多选任务不可拖动！', 'warning')
      return false
    } else if (task.parent !== parent) {
      GanttObject.showMessage(vueThis, '任务不可跨层级拖动！', 'warning')
      return false
    } else if (ganttObject.getGlobalTaskIndex(id) === 0) {
      GanttObject.showMessage(vueThis, '根节点不可拖动！', 'warning')
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
GanttObject.changeUnMoveTask = function (vueThis, ganttObject) {
  return ganttObject.attachEvent('onBeforeRowDragEnd', function (id, parent, tindex) {
    const task = ganttObject.getTask(id)
    const parTask = ganttObject.getTask(parent)
    if (ganttObject.getSelectedTasks().length > 1) {
      GanttObject.showMessage(vueThis, '多选任务不可拖动！', 'warning')
      return false
    } else if (task.parent !== parent) {
      GanttObject.showMessage(vueThis, '任务不可跨层级拖动！', 'warning')
      return false
    } else if (ganttObject.getGlobalTaskIndex(id) === 0) {
      GanttObject.showMessage(vueThis, '根节点不可拖动！', 'warning')
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
GanttObject.calculateProgress = function calculateProgress(task, ganttObject) {
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
GanttObject.refreshProgress = function refreshProgress(id, submit, ganttObject, vueThis) {
  if (!ganttObject.isTaskExists(id)) {
    return
  }
  const task = ganttObject.getTask(id)
  task.progress = GanttObject.calculateProgress(task, ganttObject)
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
GanttObject.showMessage = function showMessage(vueThis, msg, type) {
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
GanttObject.calculateArrayContain = function calculateArrayContain(taskMonitors, selMonitor) {
  if (taskMonitors !== null && taskMonitors !== '') {
    const taskM = taskMonitors.split(',')
    if (taskM.indexOf(selMonitor) !== -1) {
      return true
    }
    // for (let i = 0; i < selMonitor.length; i++) {
    //
    //   if (taskM.indexOf(selMonitor[i]) !== -1) {
    //     return true
    //   }
    // }
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
  const vueThis = store.getters.vueThis
  if (JSON.stringify(searchForm) !== '{}') {
    let task
    if (parent) {
      task = ganttObject.getTask(parent)
    } else {
      task = ganttObject.getTaskByWBSCode(1)
    }
    const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
    const owner = task[ganttObject.config.resource_property]
    const resource = resourceDatas.getItem(owner)

    const wbs = searchForm.wbs // 大纲号模糊查询
    let wbsCheck = true
    const level = task.$level + 1
    if (wbs && level != wbs) {
      wbsCheck = false
    }
    const taskName = searchForm.name ? searchForm.name.trim() : '' // 任务名称
    let taskNameCheck = true
    if (taskName && task.name.indexOf(taskName) === -1) {
      taskNameCheck = false
    }
    const roleName = searchForm.roleName // 角色模糊查询
    let roleNameCheck = true
    if (roleName && (!resource || (resource && !resource.roleName) || (resource && resource.roleName && resource.roleName.indexOf(roleName) === -1))) {
      roleNameCheck = false
    }
    // 角色数组
    const roleIds = searchForm.roleIds
    let roleIdCheck = true
    if (searchForm.isInput) {
      if (roleIds && roleIds.length > 0 && (!resource || (resource && !resource.roleId) || (resource && resource.roleId && roleIds.indexOf(resource.roleId) === -1))) {
        roleIdCheck = false
      }
    } else {
      const taskName = searchForm.roleIds
      if (taskName && (!resource || !resource.roleName || resource.roleName.indexOf(taskName) === -1)) {
        roleIdCheck = false
      }
    }

    const userName = searchForm.userName // 责任人模糊查询
    let userNameCheck = true
    if (userName && (!resource || (resource && !resource.name) || (resource && resource.name && resource.name.indexOf(userName) === -1))) {
      userNameCheck = false
    }
    const ownerIds = searchForm.ownerIds // 责任人
    let userIdCheck = true
    if (searchForm.isInput) {
      if (ownerIds && ownerIds.length > 0 && (!resource || (resource && !resource.userId) || (resource && resource.userId && ownerIds.indexOf(resource.userId) === -1))) {
        userIdCheck = false
      }
    } else {
      const taskName = searchForm.ownerIds

      if (taskName && (!resource || !resource.name || resource.name.indexOf(taskName) === -1)) {
        userIdCheck = false
      }
    }

    const deptName = searchForm.dutyDeptName // 部门模糊查询
    let deptNameCheck = true
    if (deptName && (!resource || (resource && !resource.deptName) || (resource && resource.deptName && resource.deptName.indexOf(deptName) === -1))) {
      deptNameCheck = false
    }
    const taskProjectName = searchForm.taskProjectName // 任务名称
    let taskProjectNameCheck = true
    if (taskProjectName && task.taskProjectName && task.taskProjectName.indexOf(taskProjectName) === -1) {
      taskProjectNameCheck = false
    }
    let deptIdCheck = true
    if (searchForm.isInput) {
      const deptIds = searchForm.deptIds // 部门
      if (deptIds && deptIds.length > 0 && (!resource || (resource && !resource.deptId) || (resource && resource.deptId && deptIds.indexOf(resource.deptId) === -1))) {
        deptIdCheck = false
      }
    } else {
      const taskName = searchForm.deptIds
      if (taskName && (!resource || !resource.deptName || resource.deptName.indexOf(taskName) === -1)) {
        deptIdCheck = false
      }
    }

    // let secretGradeCheck = true
    // const { secretGrade } = searchForm
    // if (secretGrade && task.secretGrade && !task.secretGrade.includes(secretGrade)) {
    //   secretGradeCheck = false
    // }
    // if (secretGrade && !task.secretGrade) {
    //   secretGradeCheck = false
    // }

    const startDate = searchForm.start_date // 任务开始时间
    const endDate = searchForm.end_date // 任务完成时间
    let endDateCheck = true
    let startDateCheck = true
    let dateCheck = true
    if (startDate && endDate) {
      if (
        !(
          new Date(moment(task.start_date).format('YYYY-MM-DD')).getTime() >= new Date(startDate).getTime() &&
          new Date(moment(ganttObject.date.add(task.end_date, -2, 'day')).format('YYYY-MM-DD')).getTime() <= new Date(endDate).getTime()
        )
      ) {
        dateCheck = false
      }
    } else if (startDate && moment(task.start_date).format('YYYY-MM-DD') !== moment(startDate).format('YYYY-MM-DD')) {
      startDateCheck = false
    } else if (endDate && moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD') !== moment(endDate).format('YYYY-MM-DD')) {
      endDateCheck = false
    }
    const startEndDate = searchForm.startEndDate // 任务完成时间范围
    if (startEndDate && startEndDate.length === 2) {
      const startDate = startEndDate[0]
      const endDate = startEndDate[1]
      if (new Date(ganttObject.date.add(task.end_date, -1, 'day')).getTime() < startDate.getTime() || new Date(ganttObject.date.add(task.end_date, -1, 'day')).getTime() > endDate.getTime()) {
        dateCheck = false
      }
    }

    const overdueRemainingDays = searchForm.overdueRemainingDays // 超期/剩余天数
    let overdueRemainingDaysCheck = true
    if (overdueRemainingDays && overdueRemainingDays.length > 0) {
      const result = calculateRemainingDays(task)
      const days = result.value

      if (overdueRemainingDays == 0 && days >= 0) {
        overdueRemainingDaysCheck = false
      } else if (overdueRemainingDays == 7 && (days < 0 || days > 7)) {
        overdueRemainingDaysCheck = false
      } else if (overdueRemainingDays == 30 && (days < 0 || days > 30)) {
        overdueRemainingDaysCheck = false
      }
    }

    const status = searchForm.status // 任务状态
    let statusCheck = true
    if (status && status.length > 0 && status.indexOf(task.status) === -1) {
      statusCheck = false
    }

    const progressFeedback = searchForm.progressFeedback // 进度反馈
    let progressFeedbackCheck = true
    const reminderList = vueThis.reminderList
    if (reminderList) {
      const obj = reminderList.find((item) => {
        return item.id === task.id
      })
      let reminder = -1
      if (obj) {
        reminder = obj.reminder
      }
      if (progressFeedback && progressFeedback == 1 && Number(reminder) != 0) {
        progressFeedbackCheck = false
      } else if (progressFeedback && progressFeedback == 0 && Number(reminder) < 1) {
        progressFeedbackCheck = false
      }
    }

    const weatherControl = searchForm.weatherControl // 管控任务
    let weatherControlCheck = true
    if (weatherControl && weatherControl.length > 0 && weatherControl.indexOf(task.weatherControl) === -1) {
      weatherControlCheck = false
    }
    const managerStatus = searchForm.managerStatus // 任务管理状态
    let managerStatusCheck = true
    if (managerStatus && managerStatus.length > 0 && managerStatus.indexOf(task.managerStatus) === -1) {
      managerStatusCheck = false
    }
    const monitorPoints = searchForm.monitorPoints // 标识--列头
    let monitorsCheck = true
    // let monitorPointsArr = []
    // if (monitorPoints && task.monitorPoints) {
    //   monitorPointsArr = task.monitorPoints.split(',')
    // }
    if (monitorPoints && task.monitorPoints && task.monitorPoints.indexOf(monitorPoints) == -1) {
      monitorsCheck = false
    }
    if (monitorPoints && !task.monitorPoints) {
      monitorsCheck = false
    }
    const planTypes = searchForm.planTypes // 任务类型
    let planTypeCheck = true
    if (planTypes && planTypes.length > 0 && (!task.planType || (task.planType && planTypes.indexOf(task.planType) === -1))) {
      planTypeCheck = false
    }
    const planType = searchForm.planType // 任务类型--列头
    if (planType && planType.length > 0 && (!task.planType || (task.planType && planType.indexOf(task.planType) === -1))) {
      planTypeCheck = false
    }
    const productQuantity = searchForm.productQuantity // 数量
    let productQuantityCheck = true
    if (productQuantity) {
      if (!task.productQuantity || (task.productQuantity && Number(task.productQuantity) !== Number(productQuantity))) {
        productQuantityCheck = false
      }
    }
    if (
      wbsCheck &&
      taskNameCheck &&
      startDateCheck &&
      managerStatusCheck &&
      // secretGradeCheck &&
      // specialDutyCheck &&
      // tasksCooperateCheck &&
      endDateCheck &&
      roleIdCheck &&
      productQuantityCheck &&
      userNameCheck &&
      deptNameCheck &&
      taskProjectNameCheck &&
      roleNameCheck &&
      userIdCheck &&
      deptIdCheck &&
      dateCheck &&
      statusCheck &&
      monitorsCheck &&
      planTypeCheck &&
      weatherControlCheck &&
      progressFeedbackCheck &&
      overdueRemainingDaysCheck
    ) {
      return true
    }
    const child = ganttObject.getChildren(parent)
    for (const val of child) {
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
GanttObject.setSearchConfig = function (ganttObject, vueThis) {
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
GanttObject.createDatastore = function (ganttObject) {
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
GanttObject.resourceStoreOnParse = function (ganttObject) {
  return ganttObject.$resourcesStore.attachEvent('onParse', function () {
    const resourseDatas = []
    ganttObject.$resourcesStore.eachItem(function (res) {
      if (!ganttObject.$resourcesStore.hasChild(res.id)) {
        const copy = ganttObject.copy(res)
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
    const vueThis = store.getters.vueThis
    if (vueThis.viewType === 'resource') {
      const groups = ganttObject.$resourcesStore.getItems().map(function (item) {
        const group = ganttObject.copy(item)
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
GanttObject.createRightMenu = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onContextMenu', function (taskId, linkId, event) {
    vueThis.mouseX = event.clientX
    vueThis.mouseY = event.clientY
    vueThis.getSelectTasks = []
    vueThis.getSelectTasks = vueThis.selectedTasks
    const readOnly = ganttObject.config.readonly // 当gantt为只读模式时警用
    if (taskId && !readOnly) {
      if (!ganttObject.isSelectedTask(taskId)) {
        ganttObject.eachSelectedTask(function (id) {
          if (ganttObject.isTaskExists(id)) {
            ganttObject.unselectTask(id)
          }
        })
        ganttObject.selectTask(taskId)
      }
      // vueThis.selectedTasks = []
      // vueThis.selectedTasks.push(ganttObject.getTask(taskId))
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
GanttObject.setOnBeforeEditStart = function (ganttObject, vueThis) {
  return ganttObject.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {
    return GanttObject.getTaskEditable(ganttObject, state, vueThis)
  })
}

/**
 * 修改保存时机为输入框失去焦点时保存
 * @param ganttObject
 * @returns {*}
 */
GanttObject.setCellSaveConfig = function (ganttObject) {
  return ganttObject.ext.inlineEditors.attachEvent('onEditStart', function (state) {
    const el = ganttObject.ext.inlineEditors.getState().placeholder.childNodes[0].childNodes[0]
    if (
      ganttObject.ext.inlineEditors._editorType === 'tree_data_editor' ||
      ganttObject.ext.inlineEditors._editorType === 'select_person' ||
      ganttObject.ext.inlineEditors._editorType === 'custom_select' ||
      ganttObject.ext.inlineEditors._editorType === 'tree_data_editor_extra' ||
      ganttObject.ext.inlineEditors._editorType === 'select_can_clear'
    ) {
      el.addEventListener('input', (event) => {
        ganttObject.ext.inlineEditors.save()
      })
    } else {
      el.addEventListener('blur', (event) => {
        ganttObject.ext.inlineEditors.save()
      })
    }
  })
}

/**
 * 编辑器保存前校验定义
 * @param ganttObject
 * @param vueThis
 * @returns {*}
 */
GanttObject.checkoutBeforeCellSave = function (ganttObject, vueThis) {
  return ganttObject.ext.inlineEditors.attachEvent('onBeforeSave', (state) => {
    const oldVal = state.oldValue
    const newVal = state.newValue
    const colName = state.columnName
    const taskId = state.id
    const task = ganttObject.getTask(taskId)
    let result = true
    let msg = ''
    if (colName) {
      switch (colName) {
        case 'duration':
          const startDate = moment(moment(task.start_date).format('YYYY-MM-DD'))
          const maxEndDate = moment(moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')).format('YYYY-MM-DD'))
          const max = maxEndDate.diff(startDate, 'days') + 1
          if (state.newValue === state.oldValue) {
            result = false
          } else {
            if (newVal > max || newVal < 1) {
              result = false
              msg = '工期值填写错误，只能输入1~' + max + '范围内的值！'
              task.duration = oldVal
              ganttObject.refreshData(taskId)
            } else {
              const endDate = ganttObject.date.add(ganttObject.calculateEndDate(task.start_date, newVal), -1, 'day')
              task.forecastBeginDate = GanttObject.dateToStr(task.start_date, '%Y-%m-%d', ganttObject)
              task.forecastEndDate = GanttObject.dateToStr(endDate, '%Y-%m-%d', ganttObject)
            }
          }
          break
        case 'end_date':
          const formatVal = moment(newVal).format('YYYY-MM-DD')
          const formatVal1 = newVal ? moment(ganttObject.date.add(newVal, -1, 'day')).format('YYYY-MM-DD') : ''

          const oldValue = moment(state.oldValue).format('YYYY-MM-DD')
          const minEndTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'end')).format('YYYY-MM-DD')
          const maxEndTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'end')).format('YYYY-MM-DD')
          if (formatVal === oldValue) {
            result = false
          } else if (formatVal1 < minEndTime) {
            result = false
            msg = '计划完成时间超出设置范围值！'
            task.end_date = state.oldValue
          } else {
            task.forecastBeginDate = GanttObject.dateToStr(task.start_date, '%Y-%m-%d', ganttObject)
            task.forecastEndDate = GanttObject.dateToStr(ganttObject.date.add(newVal, -1, 'day'), '%Y-%m-%d', ganttObject)
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
          }
          break
        case 'start_date': // 开始时间
          const sVal = moment(newVal).format('YYYY-MM-DD')
          const oVal = moment(state.oldValue).format('YYYY-MM-DD')
          const minStartTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'min', 'start')).format('YYYY-MM-DD')
          const maxStartTime = moment(ganttObject.config.plan_limit(ganttObject, taskId, 'max', 'start')).format('YYYY-MM-DD')
          if (sVal === oVal) {
            result = false
          } else if (sVal < minStartTime || sVal > maxStartTime) {
            result = false
            msg = '计划开始时间超出设置范围值！'
            task.start_date = state.oldValue
          } else {
            // 计算完成时间
            const endDate = ganttObject.date.add(ganttObject.calculateEndDate(state.newValue, task.duration), -1, 'day')
            task.forecastBeginDate = GanttObject.dateToStr(newVal, '%Y-%m-%d', ganttObject)
            task.forecastEndDate = GanttObject.dateToStr(endDate, '%Y-%m-%d', ganttObject)
          }
          break
      }
    }
    // 错误时提醒
    if (!result && msg !== '') {
      GanttObject.showMessage(vueThis, msg, 'error')
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
GanttObject.onSaveCellEven = function (ganttObject, vueThis) {
  return ganttObject.ext.inlineEditors.attachEvent('onSave', (state) => {
    const colName = state.columnName
    const taskId = state.id
    const task = ganttObject.getTask(taskId)
    const vueThis = store.getters.vueThis
    let parentId = ganttObject.getParent(task.id)
    let parentTask = ganttObject.getTask(parentId)
    // 当修改计划开始、计划完成、工期时，标记任务，用于更新父
    if (colName === 'end_date' || colName === 'duration' || colName === 'start_date' || colName === 'predecessors' || colName === 'autoScheduling') {
      // if (colName === 'end_date') {
      //   vueThis.$nextTick(() => {
      //     vueThis.initGantt(vueThis.planInfoId, vueThis.viewType)
      //   })
      // }
      GanttObject.updateTaskNew(ganttObject, taskId, vueThis)
    }
    //
    if (colName == 'achievements') {
      let num = Number(task.achievements)
      if (!Number.isInteger(num)) {
        task.achievements = num.toFixedNoRound(2)
      }
      if (ganttObject.getGlobalTaskIndex(taskId) !== 0 && parentTask.achievements) {
        task.proportion = ((Number(task.achievements) / Number(parentTask.achievements)) * 100).toFixedNoRound(2)
      }
      ganttObject.updateTask(taskId)
    }
    if (colName == 'proportion') {
      let num1 = Number(task.proportion)
      if (!Number.isInteger(num1)) {
        task.proportion = num1.toFixedNoRound(2)
      }
      if (ganttObject.getGlobalTaskIndex(taskId) !== 0 && parentTask.achievements) {
        task.achievements = (Number(parentTask.achievements) * (Number(task.proportion) / 100)).toFixedNoRound(2)
      }
      ganttObject.updateTask(taskId)
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
GanttObject.beforeLinkAddCheck = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeLinkAdd', function (id, link) {
    return linkAllowCheck(id, link, ganttObject)
  })
}

/**
 * 修改前后置校验
 * @param ganttObject
 * @returns {*}
 */
GanttObject.beforeLinkUpdateCheck = function (ganttObject) {
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
 * gantt图缩放（ctrl+鼠标滚轮），使用方式 thisGantt.ext.zoom.init(GanttObject.zoomConfig(thisGantt))
 * 由于编辑视图不包含gantt图，无法使用
 * @param ganttObject
 */
GanttObject.zoomConfig = function ganttZoomConfig(ganttObject) {
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
            const dateToStr = ganttObject.date.date_to_str('%n')
            const endDate = ganttObject.date.add(ganttObject.date.add(date, 3, 'month'), -1, 'day')
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
GanttObject.workTimeSetting = function (ganttObject, vueThis) {
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

  const weekScaleTemplate = function (date) {
    const dateToStr = ganttObject.date.date_to_str('%Y/%m/%d')
    const weekNum = ganttObject.date.date_to_str('(第 %W 周)')
    const endDate = ganttObject.date.add(ganttObject.date.add(date, 1, 'week'), -1, 'day')
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
GanttObject.linkDescription = function (ganttObject) {
  // eslint-disable-next-line no-return-assign
  return (ganttObject.templates.link_description = function (link) {
    const from = ganttObject.getTask(link.source)
    const to = ganttObject.getTask(link.target)
    const text = '<b>' + from.name + '</b>和<b>' + to.name + '</b>的关系'
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
GanttObject.addTooltip = function (ganttObject, vueThis) {
  ganttObject.plugins({
    tooltip: true
  })
  ganttObject.attachEvent('onGanttReady', function () {
    const tooltips = ganttObject.ext.tooltips
    tooltips.tooltipFor({
      selector: '*',
      html: function (event, node) {
        // 判断节点是否包含 text_overflow 类名
        if (node && node.classList.contains('text_overflow')) {
          if (node.innerText) {
            // 检查文本是否溢出
            if (node.scrollWidth > node.offsetWidth) {
              return node.innerText // 返回溢出的文本
            }
          }
        }
        return '' // 如果没有文本溢出或节点无效，则不显示 Tooltip
      }
    })

    // tooltips.tooltipFor({
    //   selector: '.gantt_task_link',
    //   html: function (event, node) {
    //     const linkId = node.getAttribute(ganttObject.config.link_attribute)
    //     if (linkId) {
    //       const link = ganttObject.getLink(linkId)
    //       const from = ganttObject.getTask(link.source)
    //       const to = ganttObject.getTask(link.target)
    //       return ['<b>前后置类型:</b> ' + linkTypeToString(link.type), '<b>前置任务: </b> ' + from.name, '<b>当前任务: </b> ' + to.name].join('<br>')
    //     }
    //   }
    // })
    // tooltips.tooltipFor({
    //   selector: '.gantt_task_progress_wrapper',
    //   html: function (event, node) {
    //     const taskId = node.getAttribute('task_id')
    //     const task = ganttObject.getTask(taskId)
    //     if (task) {
    //       const statusData = vueThis.taskStatus[task.status]
    //       if (statusData && statusData.name) {
    //         return [
    //           '<b>任务名称：</b> ' + task.name,
    //           '<b>任务状态：</b> ' + statusData.name,
    //           '<b>计划开始时间</b> ' + ganttObject.templates.tooltip_date_format(task.start_date),
    //           '<b>计划完成时间</b> ' + ganttObject.templates.tooltip_date_format(ganttObject.date.add(task.end_date, -1, 'day'))
    //         ].join('<br>')
    //       } else {
    //         return ''
    //       }
    //     }
    //   }
    // })
  })
}
/**
 * @Description 通用属性定义
 * @author fukai
 * @date 2020/5/8 19:04
 */
GanttObject.publicObject = {
  plugins: {
    auto_scheduling: true, // 是否自动排程
    multiselect: true,
    grouping: true,
    undo: true,
    critical_path: true,
    fullscreen: true
  },
  config: {
    // eslint-disable-next-line no-undef
    show_errors: CHECK_PRODUCTION_ERROR_TIP, // 是否显示错误消息
    work_time: false, // 计算工作时间时排除非工作时间
    skip_off_time: false, // gantt图中隐藏非工作时间
    // correct_work_time: true, // 可以将任务的开始日期和结束日期调整为工作时间（拖动时）
    // 当用户更改任务的开始日期时，任务end_date将保持不变，任务持续时间将被更新以反映更改；
    // 当用户更改任务的结束日期时，任务开始日期将保持不变，任务持续时间将被更新以反映该更改
    inline_editors_date_processing: 'keepDates',
    duration_unit: 'day',
    // min_column_width: 20,
    start_on_monday: true, // 设置一周从周一开始
    row_height: 50,
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
    responsibilityPlan_limit: PlanDataLimit.strategyThree, // 责任令计划时间限制策略，若需要新增限制策略，请参考现有策略开发，完成后修改此配置即可
    layout: GanttObject.layout2, // 默认布局为只显示树编辑列表
    resource_store: 'resourceDatas',
    resource_property: 'owner_id', // 责任人定义
    monitor_point: 'monitorPoints', // 标识定义
    plan_type: 'planType', // 任务类型定义
    training_mode_list: 'trainingMode', // 培训方式定义
    task_status: 'taskStatus', // 任务状态定义
    tasks_cooperate_dept: 'tasksCooperateDeptList' // 任务完成形式
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
GanttObject.updateTaskNew = function (ganttObject, taskId, vueThis) {
  ganttObject.batchUpdate(function () {
    const task = ganttObject.getTask(taskId)
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
    if (task.parent) {
      const parentId = task.parent
      const parentTask = ganttObject.getTask(parentId)
      if (parentTask.autoScheduling !== '1') return
      const parTasksIds = []
      // 修改任务添加关联
      if (vueThis.ganttName === 'changeGantt') {
        if (ganttObject.isTaskExists(parentId)) {
          const parTask = ganttObject.getTask(parentId)
          // 更新父任务
          parTasksIds.push(parTask.id)
          ganttObject.eachParent(function (task) {
            parTasksIds.push(task.id)
          }, parTask.id)
        }
        if (parTasksIds && parTasksIds.length > 0) {
          parTasksIds.forEach((t) => {
            const parT = ganttObject.getTask(t)
            updateforecastDate(parT, ganttObject)
            ganttObject.updateTask(t)
          })
        }
        if (ganttObject.isTaskExists(parentId)) {
          const parTask = ganttObject.getTask(parentId)
          // 更新父任务
          parTasksIds.push(parTask.id)
          getTaskParent(ganttObject, parTask.id, parTasksIds)
        }
        // if (parTasksIds && parTasksIds.length > 0) {
        updateNewTaskMap(ganttObject, parTasksIds, vueThis, taskId)
        // }
      } else if (vueThis.ganttName === 'planGantt') {
        if (ganttObject.isTaskExists(parentId)) {
          const parTask = ganttObject.getTask(parentId)
          // 更新父任务
          parTasksIds.push(parTask.id)
          ganttObject.eachParent(function (task) {
            parTasksIds.push(task.id)
          }, parTask.id)
        }
        if (parTasksIds && parTasksIds.length > 0) {
          parTasksIds.forEach((t) => {
            const parT = ganttObject.getTask(t)
            updateforecastDate(parT, ganttObject)
            ganttObject.updateTask(t)
          })
        }
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
GanttObject.planChangeCheck = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onAfterAutoSchedule', function (taskId, updatedTasks) {
    // 判断是否产生变更
    if (vueThis.ganttName === 'changeGantt' && updatedTasks && updatedTasks.length > 0 && taskId) {
      updateNewTaskMap(ganttObject, updatedTasks, vueThis, ganttObject.getTask(taskId).predecessor)
    }
  })
}

/**
 * auther: wangzhifeng
 * desc: gantt全屏关闭事件监听
 * date: 2024/06/19 09:53:59
 */
GanttObject.onCollapse = function (ganttObject, vueThis) {
  return ganttObject.attachEvent('onCollapse', function () {
    vueThis.$bus.$emit('ganttOnFullscreen', false)
  })
}

/**
 * redo后逻辑处理
 * @param ganttObject
 * @param vueThis
 * @returns {*}
 */
GanttObject.planAfterRedo = function (ganttObject, vueThis) {
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
GanttObject.planAfterUndo = function (ganttObject, vueThis) {
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
GanttObject.onBeforeUndoStack = function (ganttObject) {
  // 在将操作添加到撤消堆栈之前触发
  return ganttObject.attachEvent('onBeforeUndoStack', function (action) {
    // 任务的删除和新建不可撤销
    if (action && action.commands && action.commands.length > 0) {
      const commands = action.commands
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
GanttObject.onBeforeRedoStack = function (ganttObject) {
  // 在将操作添加到回退堆栈之前触发
  return ganttObject.attachEvent('onBeforeRedoStack', function (action) {
    // 任务的删除和新建不可回退
    if (action && action.commands && action.commands.length > 0) {
      const commands = action.commands
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
GanttObject.onBeforeUndo = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeUndo', function (action) {
    if (action && action.commands && action.commands.length > 0) {
      for (let j = 0; j < action.commands.length; j++) {
        const command = action.commands[j]
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
GanttObject.onBeforeRedo = function (ganttObject) {
  return ganttObject.attachEvent('onBeforeRedo', function (action) {
    if (action && action.commands && action.commands.length > 0) {
      for (let j = 0; j < action.commands.length; j++) {
        const command = action.commands[j]
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
  const planStatusLockMap = store.getters.planStatusLockMap
  if (planStatusLockMap[vueThis.planInfoStatus] && planStatusLockMap[vueThis.planInfoStatus].refreshProgress === 'true') {
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
GanttObject.getGanttSettingGrid = function (ganttName, createPage) {
  const ganttSetting = store.state.user.userSettingAll && store.state.user.userSettingAll.Gantt ? store.state.user.userSettingAll.Gantt : null
  const key = ganttName + '-' + createPage
  if (ganttSetting) {
    const columnsSetting = ganttSetting.filter((item) => item.key === key)
    if (columnsSetting && columnsSetting.length) {
      return columnsSetting[0]
    }
  }
  return null
}

/**
 * 定义列类型对应关系，此处添加后，需要编写searchFilter方法对应属性过滤逻辑
 */
export const columnsTypeMap = {
  status: 'select',
  progressFeedback: 'select',
  managerStatus: 'select',
  monitorPoints: 'select',
  planType: 'select',
  wbs: 'select',
  name: 'input',
  owner_id: 'input',
  roleName: 'input',
  dutyDeptName: 'input',
  taskProjectName: 'input',
  overdueRemainingDays: 'select',
  // secretGrade: 'select',
  weatherControl: 'select',
  // 'predecessors': 'input',
  // progress: 'select',
  // 'productQuantity': 'input',
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
export const taskProgressFeedbackArr = [
  {
    id: '0',
    title: '未读'
  },
  {
    id: '1',
    title: '已读'
  }
]
export const taskOverdueRemainingDaysArr = [
  {
    id: '0',
    title: '已超期'
  },
  {
    id: '7',
    title: '剩余7天以内'
  },
  {
    id: '30',
    title: '剩余30天以内'
  }
]
export const taskWeatherControlArr = [
  {
    id: '1',
    title: '是'
  },
  {
    id: '0',
    title: '否'
  }
]

/**
 * 根据gantt列配置信息同步gantt列
 * @param ganttName
 * @param createPage
 * @param ganttObject
 * @returns {[]}
 */
GanttObject.synchronizationColumns = function (vueThis, ganttObject) {
  function checkEdit() {
    if (vueThis.pageName === 'planMonitor') {
      return false
    } else {
      return true
    }
  }

  function getEditors(editType, item, filedType) {
    let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
    if (typeList.includes(filedType)) {
      let multiple = false
      if (filedType == 'selectMultiple' || filedType == 'treeMultiple') {
        multiple = true
      }
      return {
        type: editType,
        map_to: 'kz' + item.id,
        editorConfig: {
          optionUrl: {
            api: 'formGenerator.getSelectionDataDic',
            params: { selectCode: item.selectCode }
          },
          multiple: multiple,
          defaultExpandAll: true,
          clearable: true,
          useTreeFormat: true,
          useTreePId: 'pId'
        }
      }
    } else {
      return { type: editType, map_to: 'kz' + item.id }
    }
  }

  const initColumns = getGanttColumns(ganttObject, vueThis)
  initColumns.forEach((initItem, initIndex) => {
    const name = initItem.name
    let type = columnsTypeMap[name]
    let dataIndex
    // if (type) {
    const label = initItem.label
    if (name === 'owner_id') {
      dataIndex = 'userName'
    } else {
      dataIndex = name
    }
    const newLabel = searchColumnRenderer(dataIndex, label, type)
    initItem.label = newLabel
    // }
  })
  // 系统配置设置隐藏的列
  const hideColumns = vueThis.columnSettings.filter((item) => item.isEnable == '0')
  // 系统设置，拓展属性
  const extraColumns = vueThis.columnSettings.filter((item) => item.attributeType === '1')
  const hideColumnKeys = hideColumns.map((item) => item.filedName)
  const extraColumnKeys = extraColumns.map((item) => 'kz' + item.id)
  // 获取gantt列配置信息
  const ganttSetting = GanttObject.getGanttSettingGrid(vueThis.ganttName, vueThis.createPage)
  // 存在配置信息时，同步，不存在时显示默认gantt列信息
  if (ganttSetting) {
    const settingColumns = ganttSetting.value.columns
    let tempColumns = []
    // 根据表头配置信息修改ganttObject对象中columns的显示隐藏属性及排序
    const settingExtra = {}
    settingColumns.forEach((settingItem, initIndex) => {
      if (extraColumnKeys.includes(settingItem.name)) {
        settingExtra[settingItem.name] = {
          index: initIndex,
          hide: settingItem.hide
        }
      }
      const initColumn = initColumns.filter((initItem) => initItem.name === settingItem.name)
      if (initColumn && Object.keys(initColumn).length > 0) {
        initColumn[0].hide = settingItem.hide
        let columnSetting = vueThis.columnSettings.filter((el) => el.filedName === initColumn[0].name && el.isEnable !== '0')
        if (columnSetting && columnSetting.length > 0) {
          tempColumns[initIndex] = initColumn[0]
        }
      }
    })

    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    initColumns.forEach((initItem, initIndex) => {
      const settingItem = settingColumns.filter((settingItem) => settingItem.name === initItem.name)
      if (!settingItem || Object.keys(settingItem).length === 0) {
        initItem.hide = false
        if (tempColumns && tempColumns.length > initIndex) {
          // console.log(initItem,'====initItem11');
          // tempColumns.push(initItem)
        } else {
          if (vueThis.columnSettings.filter((el) => el.filedName === initItem.name && el.isEnable !== '0')) {
            tempColumns.push(initItem)
          }
        }
      }
    })
    // 处理拓展字段
    extraColumns.forEach((item) => {
      let editType = null
      switch (item.filedType) {
        case 'text':
          editType = 'text'
          break
        case 'number':
          editType = 'number'
          break
        case 'textarea':
          editType = 'text'
          break
        case 'datepicker':
          editType = 'custom_date_editor'
          break
        case 'selectSingle':
          editType = 'select_can_clear'
          break
        case 'selectMultiple':
          editType = 'select_can_clear'
          break
        case 'treeSingle':
          editType = 'tree_data_editor_extra'
          break
        case 'treeMultiple':
          editType = 'tree_data_editor_extra'
          break
        default:
          break
      }
      if (settingExtra['kz' + item.id]) {
        let initItem = {}
        let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
        if (typeList.includes(item.filedType)) {
          initItem = {
            name: 'kz' + item.id,
            label: `<div class='gantt_search'>${item.name}${checkEdit() ? '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>' : ''}</div><div class='gantt_search gantt_blank'></div>`,
            align: 'center',
            resize: true,
            hide: settingExtra['kz' + item.id].hide,
            min_width: 120,
            editor: checkEdit() ? getEditors(editType, item, item.filedType) : null,
            template: function (task) {
              let result = []
              if (task['kz' + item.id]) {
                let list = vueThis.extraMap[item.selectCode]
                if (list && list.length) {
                  let taskList = task['kz' + item.id] ? task['kz' + item.id].split(',') : []
                  list.forEach((el) => {
                    taskList.forEach((item) => {
                      if (el.value == item) {
                        result.push(el.label)
                      }
                    })
                  })
                }
              }
              return `<div class='text_overflow'>${result.join(',')}</div>`
            }
          }
        } else {
          initItem = {
            name: 'kz' + item.id,
            label: `<div class='gantt_search'>${item.name}${checkEdit() ? '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>' : ''}</div><div class='gantt_search gantt_blank'></div>`,
            align: 'center',
            resize: true,
            hide: settingExtra['kz' + item.id].hide,
            min_width: 120,
            editor: checkEdit() ? { type: editType, map_to: 'kz' + item.id } : null,
            template: function (task) {
              return `<div class='text_overflow'>${task['kz' + item.id]}</div>`
            }
          }
        }
        tempColumns.splice(settingExtra['kz' + item.id].index, 1, initItem)
      } else {
        tempColumns.push({
          name: 'kz' + item.id,
          label: `<div class='gantt_search'>${item.name}${checkEdit() ? '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>' : ''}</div><div class='gantt_search gantt_blank'></div>`,
          align: 'center',
          resize: true,
          hide: item.isEnable == '0',
          min_width: 120,
          editor: checkEdit() ? { type: editType, map_to: 'kz' + item.id } : null,
          template: function (task) {
            return `<div class='text_overflow'>${task['kz' + item.id]}</div>`
          }
        })
      }
    })

    tempColumns = tempColumns.filter((el) => el)

    ganttObject.config.columns = tempColumns
  } else if (vueThis.columnSettings.length > 0) {
    const tempColumns = []
    vueThis.columnSettings.forEach((item) => {
      const initColumn = initColumns.filter((initItem) => initItem.name === item.filedName)
      if (initColumn && initColumn.length > 0) {
        // initColumn[0].hide = !(item.isEnable == '1')
        // tempColumns.push({ ...initColumn[0], indexNo: item.indexNo })
        if (item.isEnable == '1') {
          tempColumns.push({ ...initColumn[0] })
        }
      }
      if (item.attributeType === '1') {
        let editType = null
        switch (item.filedType) {
          case 'text':
            editType = 'text'
            break
          case 'number':
            editType = 'number'
            break
          case 'textarea':
            editType = 'text'
            break
          case 'datepicker':
            editType = 'custom_date_editor'
            break
          case 'selectSingle':
            editType = 'select_can_clear'
            break
          case 'selectMultiple':
            editType = 'select_can_clear'
            break
          case 'treeSingle':
            editType = 'tree_data_editor_extra'
            break
          case 'treeMultiple':
            editType = 'tree_data_editor_extra'
            break
          default:
            break
        }
        if (item.isEnable == '1') {
          let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
          if (typeList.includes(item.filedType)) {
            tempColumns.push({
              name: 'kz' + item.id,
              label: `<div class='gantt_search'>${item.name}${checkEdit() ? '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>' : ''}</div><div class='gantt_search gantt_blank'></div>`,
              align: 'center',
              resize: true,
              hide: item.isEnable == '0',
              min_width: 120,
              editor: checkEdit() ? getEditors(editType, item, item.filedType) : null,
              template: function (task) {
                let result = []
                if (task['kz' + item.id]) {
                  let list = vueThis.extraMap[item.selectCode]
                  if (list && list.length) {
                    let taskList = task['kz' + item.id] ? task['kz' + item.id].split(',') : []
                    list.forEach((el) => {
                      taskList.forEach((item) => {
                        if (el.value == item) {
                          result.push(el.label)
                        }
                      })
                    })
                  }
                }
                return `<div class='text_overflow'>${result.join(',')}</div>`
              }
            })
          } else {
            tempColumns.push({
              name: 'kz' + item.id,
              label: `<div class='gantt_search'>${item.name}${checkEdit() ? '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>' : ''}</div><div class='gantt_search gantt_blank'></div>`,
              align: 'center',
              resize: true,
              hide: item.isEnable == '0',
              min_width: 120,
              editor: checkEdit() ? getEditors(editType, item, item.filedType) : null,
              template: function (task) {
                let result = task['kz' + item.id]
                if (editType == 'custom_date_editor') {
                  if (result) {
                    result = moment(result).format('YYYY-MM-DD')
                  }
                }
                return `<div class='text_overflow'>${result}</div>`
              }
            })
          }
        }
      }
    })
    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    // initColumns.forEach((initItem, initIndex) => {
    //   const settingItem = vueThis.columnSettings.filter((settingItem) => settingItem.filedName === initItem.name)
    //   if (!settingItem || Object.keys(settingItem).length === 0) {
    //     initItem.hide = false
    //     if (tempColumns && tempColumns.length > initIndex) {
    //       tempColumns.splice(initIndex, 0, initItem)
    //     } else {
    //       tempColumns.push(initItem)
    //     }
    //   }
    // })
    // 处理拓展字段的展示
    // extraColumns.forEach(item => {

    // })
    ganttObject.config.columns = tempColumns
  } else {
    ganttObject.config.columns = initColumns
  }
}

GanttObject.searchColumnsDataInit = function (vueThis, ganttObject) {
  return ganttObject.attachEvent('onDataRender', function () {
    const initColumns = getGanttColumns(ganttObject, vueThis)
    initColumns.forEach((initItem, initIndex) => {
      let name = initItem.name
      const type = columnsTypeMap[name]
      if (type) {
        let datas = []
        if (type === 'select') {
          switch (name) {
            case 'status':
              datas = taskStatusArr
              break
            case 'progressFeedback':
              datas = taskProgressFeedbackArr
              break
            case 'overdueRemainingDays':
              datas = taskOverdueRemainingDaysArr
              break
            case 'weatherControl':
              datas = taskWeatherControlArr
              break
            case 'managerStatus':
              if (vueThis.managerStatusMap && Object.keys(vueThis.managerStatusMap).length > 0) {
                for (const item in vueThis.managerStatusMap) {
                  const obj = {
                    id: item,
                    title: vueThis.managerStatusMap[item].cmeaning
                  }
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
            // case 'secretGrade':
            //   datas = ganttObject.serverList('secretGrades')
            //   break
            case 'wbs':
              for (let i = 0; i < vueThis.deep; i++) {
                const item = {
                  id: i + 1 + '',
                  title: i + 1 + '级'
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
          } else {
            vueThis[datePickerKey] = new Datepicker(`.${datePickerKey}`, {
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
            const obj = document.getElementById(name + type)
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
          const options = datas.map((item) => {
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
          } else {
            // let
            if (document.getElementsByClassName(`${selectorKey}`) && !document.getElementsByClassName(`${selectorKey}`).length) {
              return
            }
            const obj = new Selector(
              `.${selectorKey}`,
              {
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
                  Gantt.searchColumnsChange(name, value, 'select', vueThis[selectorKey])
                }
              },
              vueThis
            )
            vueThis[selectorKey] = obj
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
GanttObject.calculateParentForecastDate = function (ganttObject, task) {
  if (task.parent) {
    api['planGanttManager.calculateParentForecastDate']({
      parentId: task.parent
    })
      .then((res) => {
        if (res) {
          res.forEach(function (item) {
            const pTask = ganttObject.getTask(item.id)
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
  task.forecastBeginDate = GanttObject.dateToStr(task.start_date, '%Y-%m-%d', ganttObject)
  task.forecastEndDate = GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), '%Y-%m-%d', ganttObject)
}

/**
 * 任务列表是否动态显示关键路径
 * @param ganttObject
 */
GanttObject.checkIsCriticalTask = function (ganttObject) {
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
 * auther: wangzhifeng
 * desc: 校验绩效和比例的合规
 * date: 2024/07/11 15:10:42
 */
GanttObject.validateAchievement = function (ganttObject, vueThis, task) {
  let childIds = ganttObject.getChildren(task.id)
  let parentId = ganttObject.getParent(task.id)
  let state = {
    // 子比例超限
    childPercentage: false,
    // 子绩效大于当前任务绩效
    childTotal: false
    // 当前任务层级比例和大于100
    // 当前任务层级绩效和大于父
  }
  // 校验当前修改，是否对子有影响
  if (childIds && childIds.length > 0) {
    let childAchievement = 0
    let childProportion = 0
    childIds.forEach((childId) => {
      let child = ganttObject.getTask(childId)
      childAchievement += Number(child.achievements)
      childProportion += Number(child.proportion)
    })
    if (childAchievement > task.achievements) {
      state.childTotal = true
    }
    if (childProportion > 100) {
      state.childPercentage = true
    }
  }
  return state
}

/**
 * gantt带查询列头渲染
 * @param name
 * @param columnName
 * @param searchType
 * @returns {string}
 */
export function searchColumnRenderer(name, columnName, searchType) {
  let result
  if (searchType === 'input') {
    // result = '<div class="gantt_search">' + columnName + '</div>' +
    //   '<div class="gantt_search">' +
    //   '<input id="' + name + searchType + '" type="text" class="search_item" value="" placeholder="请输入..." onchange="Gantt.searchColumnsChange(\'' + name + '\',this.value,\'input\')"/>' +
    //   '</div>'
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_cell_search gantt_search gantt_inputor_' + name + '"' + '></div>'
  } else if (searchType === 'select') {
    // result = '<div class="gantt_search">' + columnName + '</div>' +
    //   '<div class="gantt_search">' +
    //   '<select id="' + name + searchType + '" class="search_item" placeholder="请选择..." onchange="Gantt.searchColumnsChange(\'' + name + '\',this.value,\'select\')"/>">' +
    //   '<option value =""></option>' +
    //   '</select></div>'
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_cell_search gantt_search gantt_selector_' + name + '"' + '></div>'
  } else if (searchType === 'date') {
    // result = '<div class="gantt_search">' + columnName + '</div>' +
    //   '<div class="gantt_search">' +
    //   '<input id="' + name + searchType + '" type="date" class="search_item" value="" onchange="Gantt.searchColumnsChange(\'' + name + '\',this.value,\'date\')"/></div>'
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_cell_search gantt_search gantt_datepicker_' + name + '"' + '></div>'
  } else {
    result = '<div class="gantt_search">' + columnName + '</div>' + '<div class="gantt_search gantt_blank"' + '></div>'
  }
  return result
}
