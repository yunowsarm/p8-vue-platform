import store from '@/plugins/store'
import { backfillChangeDatas } from './changeGantt'

/**
 * 计划编辑加解锁逻辑处理类
 */

/**
 * gantt页面操作权限判断，针对ganttObject.config.readonly = ?使用
 * @param planStatus 计划状态
 * @param monitorLockMap 标识加解锁状态map
 * @returns {boolean} true:不可编辑，false:可操作
 */
export function editLockUnLockCheck(planStatus, monitorLockMap) {
  if (monitorLockMap && Object.keys(monitorLockMap).length > 0) {
    // 获取gannt操作限制策略
    let planStatusLockMap = store.getters.planStatusLockMap
    // 已完成、进行中且编辑加锁时，计划不可编辑
    let editStatus = planStatusLockMap[planStatus]['ganttEdit']
    if (editStatus === 'false') {
      return true
    }
  }
  return false
}

/**
 * gantt页面编辑权限判断，针对标识加解锁使用（若任务包含多个标识，且其中所有标识都处于解锁状态时，任务才可编辑）
 * @param colName 点击列属性名
 * @param taskMonitors 任务标识
 * @param vueThis 页面this对象
 * @param ganttObject gantt对象
 * @returns {boolean} true:不可编辑，false:可操作
 */
export function monitorLockUnLockCheck(colName, taskMonitors, vueThis, ganttObject) {
  let result = true
  if (vueThis.monitorLockMap && Object.keys(vueThis.monitorLockMap).length > 0) {
    // 操作的列为受标识锁定控制的列时
    if (vueThis.limitColumns && vueThis.limitColumns.length > 0 && vueThis.limitColumns.indexOf(colName) !== -1 && taskMonitors) {
      taskMonitors.some(function (item) {
        if (vueThis.monitorLockMap[item] === '1') {
          result = false
          return true
        }
      })
    }
  }
  return result
}

/**
 * 获取标识锁定后不可操作的列
 * gantt定义的columns中包含monitorLockLimit：true属性的列
 * @param columns
 */
export function getMonitorLimitColumns(columns, vueThis) {
  columns.forEach(function (item) {
    if (item.monitorLockLimit) {
      vueThis.limitColumns.push(item.name)
    }
  })
}

/**
 * 任务删除时标识锁定校验（若选中任务或选中任务的子任务中存在加锁标识时，选中任务不可删除）
 * @param tasks
 */
export function monitorLockUnRemoveCheck(tasks, ganttObject) {
  let result = true
  let vueThis = store.getters.vueThis
  if (vueThis.monitorLockMap && Object.keys(vueThis.monitorLockMap).length > 0) {
    tasks.some(function (task) {
      result = checkTaskLockStatus(task, vueThis.monitorLockMap, result)
      if (result) {
        // 递归查子
        if (ganttObject.hasChild(task.id)) {
          ganttObject.eachTask(function (child) {
            let check = checkTaskLockStatus(child, vueThis.monitorLockMap, result)
            if (!check) {
              result = false
            }
          })
        }
      }
      if (!result) {
        return true
      }
    })
  }
  return result
}

/**
 * 检查任务是否存在加锁标识
 * @param task
 * @param monitorLockMap
 * @param result
 * @returns {*}
 */
function checkTaskLockStatus(task, monitorLockMap, result) {
  let monitors = task.monitorPoints
  if (monitors && monitors.length > 0) {
    monitors.split(',').some(function (item) {
      if (monitorLockMap[item] === '1') {
        result = false
        return true
      }
    })
  }
  return result
}

/**
 * 计划标识加锁时，gantt页面对应标识不可添加、删除
 * @param monitorLockMap
 * @param monitorId
 * @returns {boolean}
 */
export function lockMonitor(monitorLockMap, monitorId) {
  if (monitorLockMap && Object.keys(monitorLockMap).length > 0) {
    if (monitorLockMap[monitorId] === '1') {
      return true
    }
  }
  return false
}

/**
 * 任务调度限制
 * @param taskEditAble
 * @param task
 * @param ganttObject
 */
export function ganttEditCheck(taskEditAble, task, ganttObject) {
  // 已完成、提交审批的任务不可修改
  if (taskEditAble && taskEditAble === 'false') {
    task.readonly = true
    // 编辑加锁后任务类型默认为task，避免修改时间时发生联动
    task.type = 'task'
    task.auto_scheduling = false
  } else {
    // 排程处理
    if (task.autoScheduling === '1') {
      task.auto_scheduling = true
      if (ganttObject.hasChild(task.id) && ganttObject.getGlobalTaskIndex(task.id) !== 0) {
        task.type = 'project'
      } else {
        task.type = 'task'
      }
    } else {
      task.type = 'task'
      task.auto_scheduling = false
    }
  }
}

/**
 * gantt任务操作权限控制
 * @param ganttObject
 * @param vueThis
 */
export function setLockTaskProperties(ganttObject, vueThis) {
  // 获取gannt操作限制策略
  let planStatusLockMap = store.getters.planStatusLockMap
  let planEditStatus = planStatusLockMap[vueThis.planInfoStatus]['ganttEdit']
  let controlTaskEdit = planStatusLockMap[vueThis.planInfoStatus]['controlTaskEdit']
  let userId = store.getters.userId
  let resourceDatas = ganttObject.serverList('resourceDatas')
  let owners = []
  if (resourceDatas.length > 0) {
    resourceDatas.forEach(function (item) {
      if (item.userId === userId) {
        owners.push(item.id)
      }
    })
  }
  // 已完成计划不可编辑
  if (planEditStatus === 'false') {
    ganttObject.config.readonly = true
  } else {
    return ganttObject.attachEvent('onParse', function () {
      // 获取gannt操作限制策略
      let taskStatusLockMap = store.getters.taskStatusLockMap
      ganttObject.eachTask(function (task) {
        // task.checked = false
        if (task.status) {
          let editManagerStatus = taskStatusLockMap[task.status]
          if (vueThis.ganttName === 'planGantt') {
            if (
              (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1 && ganttObject.getGlobalTaskIndex(task.id) !== 0) || // 已完成、变更中、提交审批任务不可操作
              ganttObject.getGlobalTaskIndex(task.id) === 0 || // 根节点不可操作
              (controlTaskEdit && controlTaskEdit === 'false' && task.weatherControl && task.weatherControl === '1') || // 发布后可控任务不可操作
              (vueThis.createPage === 'decompose' && task.createSource === '0')
            ) {
              // 计划编辑页面创建任务计划分解页面不可操作
              task.readonly = true
              // 已完成、可控任务类型默认为task，避免修改时间时发生联动
              task.type = 'task'
              task.auto_scheduling = false
            } else if (task.autoScheduling === '1') {
              if (ganttObject.hasChild(task.id)) {
                task.type = 'project'
              } else {
                task.type = 'task'
              }
              task.readonly = false
              task.auto_scheduling = true
            } else {
              task.readonly = false
              task.type = 'task'
              task.auto_scheduling = false
            }
          } else if (vueThis.ganttName === 'changeGantt') {
            // 已完成、提交审批后任务不可操作
            // 我的任务计划变更页面创建任务父可修改子，计划编辑页面创建的任务我的任务变更页面不可操作
            if (vueThis.createPage === 'userChange') {
              if ((editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1) || ganttObject.getGlobalTaskIndex(task.id) === 0) {
                task.readonly = true
                task.type = 'task'
                task.auto_scheduling = false
              } else if (!ganttObject.isChildOf(task.id, vueThis.taskId) && task.id !== vueThis.taskId) {
                if (task.autoScheduling === '1' && ganttObject.hasChild(task.id)) {
                  task.type = 'project'
                  task.auto_scheduling = true
                } else {
                  task.type = 'task'
                  task.auto_scheduling = false
                }
              } else if (task.autoScheduling === '1') {
                task.readonly = false
                task.auto_scheduling = true
                if (ganttObject.hasChild(task.id)) {
                  task.type = 'project'
                } else {
                  task.type = 'task'
                }
              } else {
                task.readonly = false
                task.type = 'task'
                task.auto_scheduling = false
              }
              // 可操作行添加背景色
              ganttObject.templates.grid_row_class = function (start, end, task) {
                if (ganttObject.isChildOf(task.id, vueThis.taskId) || task.id === vueThis.taskId) {
                  return 'can_edit_color'
                }
                return ''
              }
            } else {
              if ((editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1) || ganttObject.getGlobalTaskIndex(task.id) === 0) {
                task.readonly = true
                task.type = 'task'
                task.auto_scheduling = false
              } else if (task.autoScheduling === '1') {
                task.readonly = false
                task.auto_scheduling = true
                if (ganttObject.hasChild(task.id)) {
                  task.type = 'project'
                } else {
                  task.type = 'task'
                }
              } else {
                task.readonly = false
                task.type = 'task'
                task.auto_scheduling = false
              }
            }
            // 添加任务历史数据
            let oldT = task
            if (task.$target && task.$target.length > 0) {
              let links = []
              task.$target.forEach(function (linkId) {
                if (ganttObject.isLinkExists(linkId)) {
                  links.push(ganttObject.getLink(linkId))
                }
              })
              oldT.links = links
            }
            vueThis.oldTaskMap[task.id] = oldT
          }
          // 前后置数据处理
          vueThis.dependentDatas.push({
            id: task.id,
            name: task.name,
            parent: task.parent,
            status: task.status,
            hasAtt: task.hasAtt && task.hasAtt > 0 ? 'true' : 'false' // 是否存在输出
          })
        }
      })
      // 变更数据回填
      if (vueThis.ganttName === 'changeGantt' && vueThis.changeTaskInfo && Object.keys(vueThis.changeTaskInfo).length > 0) {
        backfillChangeDatas(vueThis, ganttObject)
      }
    })
  }
}

/**
 * 标识时间管理受加解锁逻辑限制
 *        标识加锁后对应时间不可修改
 *        任务编辑加锁后，若任务所在层级为锁定层级，时间不可修改
 *        计划完成后，时间不可修改
 * @param vueThis
 * @param task
 * @param ganttObject
 */
export function monitorTimeCheck(monitorLockMap, task, ganttObject, monitorId, lockLevel) {
  // 计划完成
  if (ganttObject && ganttObject.config.readonly) {
    return false
  }
  // 任务编辑加锁后，若任务所在层级为锁定层级
  if (task.readonly && ganttObject.calculateTaskLevel(task) < lockLevel) {
    return false
  }
  // 标识加锁
  if (monitorLockMap && Object.keys(monitorLockMap).length > 0 && monitorLockMap[monitorId] === '1') {
    return false
  }
  return true
}

/**
 * 标识加锁后复制任务时，不复制加锁标识，该逻辑在任务复制sql中实现
 */
