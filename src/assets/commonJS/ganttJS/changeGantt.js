import { GanttObject, getTaskParent } from './ganttObject'
import moment from 'moment'

/**
 * 任务equals时比对属性
 * @type {string[]}
 */
export const checkKeys = [
  'name',
  'oldName',
  'start_date',
  'end_date',
  'parent',
  'indexNo',
  'duration',
  'planType',
  'owner_id',
  'forecastBeginDate',
  'roleName',
  'realName',
  'achievements',
  'proportion',
  'owner_type',
  'dutyDeptName',
  'forecastEndDate',
  'describes',
  'weatherControl',
  'requirementIds'
]
/**
 * 变更颜色定义
 * @type {string}
 */
export const changeColor = '#FF0000;'
/**
 * 受影响任务颜色定义
 * @type {string}
 */
export const affectColor = '#0070C5;'

/**
 * 计划变更缓存对象定义
 */
export class ChangeTask {
  constructor() {
    this.describes = ''
    this.monitors = []
    this.links = []
    this.input = []
    this.output = []
    this.special = []
    this.updateInfo = [] // 用于说明具体修改项，减少后台数据操作
  }
}

/**
 * 添加影响任务数据
 * @param ganttObject
 * @param updatedTasks
 * @param vueThis
 * @param taskId
 */
export function updateNewTaskMap(ganttObject, updatedTasks, vueThis, taskId) {
  const task = ganttObject.getTask(taskId)
  let affectTasks = []
  const affecTaskIds = []
  if (
    vueThis.newTaskMap &&
    vueThis.newTaskMap[taskId] &&
    Object.keys(vueThis.newTaskMap[taskId]).length > 0 &&
    vueThis.newTaskMap[taskId].affectTasks &&
    vueThis.newTaskMap[taskId].affectTasks.length > 0
  ) {
    affectTasks = vueThis.newTaskMap[taskId].affectTasks
  }
  if (updatedTasks && updatedTasks.length > 0) {
    ganttObject.batchUpdate(function () {
      updatedTasks.forEach(function (id) {
        if (id && id !== taskId && ganttObject.getGlobalTaskIndex(id) !== 0) {
          const uTask = ganttObject.getTask(id)
          if (uTask && !uTask.style) {
            uTask.style = affectColor
          }
          ganttObject.updateTask(id)
          if (affecTaskIds.indexOf(id) === -1 && vueThis.oldTaskMap && vueThis.oldTaskMap[id] && Object.keys(vueThis.oldTaskMap[id]).length > 0) {
            affecTaskIds.push(id)
            const weatherControl = vueThis.oldTaskMap[id].weatherControl
            affectTasks.push({ id: id, weatherControl: weatherControl })
          }
        }
      })
      if (affectTasks && affectTasks.length > 0) {
        task.affectTasks = affectTasks
      }
      ganttObject.updateTask(taskId)
    })
  }
  // 放入缓存
  setNewTaskMap(vueThis, task, null, 'task')
}

/**
 * 变更缓存修改后数据
 * @param vueThis
 * @param newTask
 * @param obj  task、describes、monitorPoints、links、output、special
 * @param type  task、describes、monitorPoints、links、output、special
 */
export function setNewTaskMap(vueThis, newTask, obj, type) {
  if (vueThis.ganttName && vueThis.ganttName === 'changeGantt') {
    // 历史数据为空时，保存历史数据
    let newT = new ChangeTask()
    if (vueThis.newTaskMap && Object.keys(vueThis.newTaskMap).length > 0 && vueThis.newTaskMap[newTask.id] && Object.keys(vueThis.newTaskMap[newTask.id]).length > 0) {
      const oldT = vueThis.newTaskMap[newTask.id]
      let aff = []
      if (oldT.affectTasks && oldT.affectTasks.length > 0) {
        aff = oldT.affectTasks
      }
      if (newTask.affectTasks && newTask.affectTasks.length > 0) {
        newTask.affectTasks.forEach(function (t) {
          aff.push(t)
        })
      }
      newT = newTask
      newT.affectTasks = aff
      newT.describes = oldT.describes
      newT.monitors = oldT.monitors
      newT.links = oldT.links
      newT.input = oldT.input
      newT.output = oldT.output
      newT.special = oldT.special
      newT.updateInfo = oldT.updateInfo
    } else {
      newT = newTask
    }
    switch (type) {
      case 'describes':
        newT.describes = obj
        break
      case 'monitors':
        newT.monitors = obj
        break
      case 'links':
        newT.links = obj
        break
      case 'input':
        newT.input = obj
        break
      case 'output':
        newT.output = obj
        break
      case 'special':
        newT.special = obj
        break
    }
    if (newT.updateInfo && newT.updateInfo.length > 0) {
      if (newT.updateInfo.indexOf(type) === -1) {
        newT.updateInfo.push(type)
      }
    } else {
      const updateInfo = []
      updateInfo.push(type)
      newT.updateInfo = updateInfo
    }
    vueThis.$set(vueThis.newTaskMap, newTask.id, newT)
  }
}

/**
 * 任务描述修改逻辑处理
 * @param newObj
 * @param oldObj
 * @param vueThis
 * @param taskId
 * @param ganttObject
 */
export function taskDescribesEditCheck(newObj, oldObj, vueThis, taskId, ganttObject) {
  const task = ganttObject.getTask(taskId)
  // 日期处理
  const oldS = moment(oldObj.start_date).format('YYYY-MM-DD')
  const oldE = moment(oldObj.end_date).format('YYYY-MM-DD')
  const newS = moment(newObj.start_date).format('YYYY-MM-DD')
  const newE = moment(newObj.end_date).format('YYYY-MM-DD')
  let describesEdit = false
  let changeDate = false
  let hasEdit = false
  let checkChange = false
  let NewcheckKeys = vueThis.columnSettings.filter((el) => el.attributeType == '1').map((item) => 'kz' + item.id)
  let newCheckKeys = [...checkKeys, ...NewcheckKeys]
  newCheckKeys.forEach(function (key) {
    if (key === 'start_date' || key === 'end_date' || key === 'duration' || key === 'autoScheduling') {
      if (newS !== oldS || newE !== oldE || oldObj.duration !== newObj.duration || oldObj.autoScheduling !== newObj.autoScheduling) {
        changeDate = true
        checkChange = true
        if (key === 'end_date') {
          task.end_date = ganttObject.date.add(moment(newE).toDate(), 1, 'day')
        } else if (key === 'start_date') {
          task.start_date = moment(newS).toDate()
          task.end_date = ganttObject.date.add(moment(newE).toDate(), 1, 'day')
        } else if (key === 'duration') {
          task.duration = newObj.duration
          task.end_date = ganttObject.date.add(moment(newE).toDate(), 1, 'day')
        } else {
          task.autoScheduling = newObj.autoScheduling
        }
      }
    } else if (oldObj[key] !== newObj[key]) {
      checkChange = true
      if (key === 'describes' && oldObj[key] !== newObj[key]) {
        describesEdit = true
      } else {
        task[key] = newObj[key]
      }
      hasEdit = true
    }
  })
  if (checkChange) {
    if (!task.infoType) {
    task.infoType = 'update'
  }
    task.style = changeColor
    ganttObject.updateTask(taskId)
    if (changeDate) {
      GanttObject.updateTaskNew(ganttObject, taskId, vueThis)
      // if(task.parent){
        const parentTask = ganttObject.getTask(task.parent)
        // if (parentTask.autoScheduling === '1') {
          calculateParentEndDateAndDuration(ganttObject, taskId, vueThis)
        // }
      // }
    }
    if (hasEdit) {
      setNewTaskMap(vueThis, task, null, 'task')
    }
    if (describesEdit) {
      setNewTaskMap(vueThis, task, newObj.describes, 'describes')
    }
  }
}

/**
 * 标识信息修改逻辑处理
 * @param oldObj
 * @param newObj -- 任务所有标识信息
 * @param vueThis
 * @param task
 * @param ganttObject
 */
export function monitorPointsEditCheck(oldObj, newObj, vueThis, task, ganttObject, falg) {
  //
  //
  let newArray = []
  if (newObj.length > 0) {
    newArray = Array.from(new Map(newObj.map((item) => [item.monitorId, item])).values())
  }
  // 新标识数据处理
  let monitorIds = ''
  let addMonitor = false // 是否添加标识
  let editMonitor = false // 是否修改标识
  const newMonitorMap = {}
  // 判断是否新增标识
  if (newArray && newArray.length > 0) {
    newArray.forEach(function (item) {
      if (monitorIds) {
        monitorIds = monitorIds + ',' + item.monitorId
      } else {
        monitorIds = item.monitorId
      }
      // 新增锁标识时
      if (!task.monitorPoints || (task.monitorPoints && task.monitorPoints.indexOf(item.monitorId) === -1)) {
        addMonitor = true
      }
      item.taskId = task.id
      newMonitorMap[item.monitorId] = item
    })
  }
  if (!addMonitor && oldObj && oldObj.length > 0) {
    if (newArray && newArray.length > 0) {
      oldObj.forEach(function (m) {
        const newT = newMonitorMap[m.monitorId]
        // 标识删除或未删除但修改了时间时
        if (!newT || (m.controlTimeType === '0' && !(newT && Object.keys(newT).length > 0 && newT.logBeginTime === m.logBeginTime && newT.logEndTime === m.logEndTime))) {
          editMonitor = true
        }
      })
    } else {
      editMonitor = true
    }
  }
  if (falg) {
    addMonitor = true
  }
  // 添加标识或修改标识
  if (addMonitor || editMonitor) {
    task.monitorPoints = monitorIds
    task.style = changeColor
    if (!task.infoType) {
    task.infoType = 'update'
  }
    ganttObject.updateTask(task.id)
    // 缓存
    setNewTaskMap(vueThis, task, newArray, 'monitors')
  }
}

/**
 * 依赖关系修改逻辑处理
 * @param oldObj
 * @param newObj 单条数据
 * @param ganttObject
 * @param vueThis
 * @param task
 */
export function linksEditCheck(oldObj, newObj, vueThis, task, ganttObject) {
  // 判断是否存在新增
  const newLinksMap = {}
  // 判断变更及修改
  let editL = false
  if (oldObj && oldObj.length > 0) {
    if (newObj && newObj.length > 0) {
      if (newObj.length === oldObj.length) {
        newObj.forEach(function (m) {
          newLinksMap[m.source] = m
        })
        oldObj.forEach(function (m) {
          const newT = newLinksMap[m.source]
          // 标识删除或未删除但修改了时间时
          if (!(newT && Object.keys(newT).length > 0 && newT.type === m.type && newT.lag === m.lag)) {
            editL = true
          }
        })
      } else {
        editL = true
      }
    } else {
      editL = true
    }
  } else if (newObj && newObj.length > 0) {
    editL = true
  }
  // 发生变动
  if (editL) {
    if (!task.infoType) {
    task.infoType = 'update'
  }
    task.style = changeColor
    // 删除旧关系
    if (oldObj && oldObj.length > 0) {
      oldObj.forEach(function (link) {
        if (ganttObject.isLinkExists(link.id)) {
          ganttObject.deleteLink(link.id)
        }
      })
    }
    // 创建新关系
    if (newObj && newObj.length > 0) {
      newObj.forEach(function (link) {
        if (ganttObject.isTaskExists(link.source)) {
          const t = ganttObject.getTask(link.source)
          t.predecessor = link.target
          ganttObject.updateTask(link.source)
          ganttObject.addLink(link)
          if (ganttObject.isLinkExists(link.id)) {
            ganttObject.changeLinkId(link.id, link.id + 's')
          }
        }
      })
    }
    ganttObject.updateTask(task.id)
    // 保存新值
    setNewTaskMap(vueThis, task, newObj, 'links')
  }
}

/**
 * 输出、特别说明修改校验
 * @param oldObj
 */
export function otherEditCheck(oldObj, newObj, ganttObject, vueThis, taskId, type) {
  const task = ganttObject.getTask(taskId)
  // 变更逻辑处理
  let editO = false
  if (oldObj && oldObj.length > 0) {
    if (newObj && newObj.length > 0) {
      const newMap = {}
      newObj.forEach(function (s) {
        if (!s.id) {
          editO = true
        } else {
          newMap[s.id] = s
        }
      })
      if (newObj.length === oldObj.length) {
        oldObj.forEach(function (n) {
          // 输出描述相同、附件数量相同
          if (n.id && Object.keys(newMap[n.id]).length > 0 && n.describes === newMap[n.id].describes && n.uploadFiles.length === newMap[n.id].uploadFiles.length) {
            // 附件对象都存在id则相同
            let check = false
            n.uploadFiles.some(function (a) {
              if (!a.id) {
                check = true
                return true
              }
            })
            if (check) {
              editO = true
            }
          } else {
            editO = true
          }
        })
      } else {
        editO = true
      }
    } else {
      editO = true
    }
  } else if (newObj && newObj.length > 0) {
    editO = true
  }
  // 发生变动
  if (editO) {
    if (!task.infoType) {
    task.infoType = 'update'
  }
    if (type === 'output') {
      task.hasAtt = newObj.length
    }
    task.style = changeColor
    ganttObject.updateTask(task.id)
    // 保存新值
    setNewTaskMap(vueThis, task, newObj, type)
  }
}

/**
 * 变更删除
 *    1.所选任务及所选任务的子任务都为变更新建任务时（调增项），直接删除
 *    2.所选任务及所选任务的子任务包含非变更新建任务时（调增项），不直接删除，标记为调减项
 * @param ganttObject
 * @param selectedTaskIds
 * @param vueThis
 */
export function changeGanttRemove(ganttObject, selectedTaskIds, vueThis) {
  ganttObject.batchUpdate(function () {
    let result = true
    selectedTaskIds.some(function (id) {
      if (ganttObject.isTaskExists(id)) {
        const t = ganttObject.getTask(id)
        if (t.infoType === 'create') {
          result = false
        }
        ganttObject.eachTask(function (task) {
          if (task.infoType === 'create') {
            result = false
          }
        }, id)
        if (!result) {
          return true
        }
      }
    })
    // 所选任务及所选任务的子任务包含非变更新建任务时（调增项），不直接删除，标记为调减项
    if (result) {
      selectedTaskIds.forEach(function (id) {
        if (ganttObject.isTaskExists(id)) {
          const t = ganttObject.getTask(id)
          // 变更逻辑处理
          t.infoType = 'delete'
          t.style = changeColor
          const affectTasks = []
          ganttObject.eachTask(function (task) {
            task.infoType = 'delete'
            task.style = changeColor
            if (vueThis.oldTaskMap && vueThis.oldTaskMap[id] && Object.keys(vueThis.oldTaskMap[id]).length > 0) {
              const weatherControl = vueThis.oldTaskMap[id].weatherControl
              affectTasks.push({ id: id, weatherControl: weatherControl })
            }
            ganttObject.updateTask(task.id)
          }, id)
          ganttObject.updateTask(id)
          setNewTaskMap(vueThis, t, null, 'task')
        }
      })
    } else {
      // 直接删除
      selectedTaskIds.forEach(function (id) {
        if (ganttObject.isTaskExists(id)) {
          // 删除任务后，自动父工期变为1天修改
          const parentTaskId = ganttObject.getTask(id).parent
          if (parentTaskId && ganttObject.isTaskExists(parentTaskId)) {
            // 删除缓存数据
            ganttObject.eachTask(function (task) {
              if (vueThis.newTaskMap && vueThis.newTaskMap[id] && Object.keys(vueThis.newTaskMap[id]).length > 0) {
                vueThis.newTaskMap.delete(task.id)
              }
            }, parentTaskId)
            const childIds = ganttObject.getChildren(parentTaskId)
            if (childIds && childIds.length === 1 && ganttObject.getTask(parentTaskId).type === 'project') {
              ganttObject.getTask(parentTaskId).type = 'task'
              ganttObject.updateTask(parentTaskId)
            }
          }
          ganttObject.deleteTask(id)
        }
      })
      vueThis.taskCount = ganttObject.getTaskCount()
    }
  })
}

/**
 * 变更页面，任务更新前任务处理
 * @param ganttObject
 * @param ganttName
 * @param taskId
 */
export function beforeUpdateTask(ganttObject, ganttName, taskId) {
  if (ganttName && ganttName === 'changeGantt') {
    const task = ganttObject.getTask(taskId)
    if (!task.infoType) {
    task.infoType = 'update'
  }
    task.style = changeColor
  }
}

/**
 * 功能区增删标识变更数据缓存
 * @param taskMonitorMap 历史数据
 * @param task
 * @param vueThis
 * @param monitorPointsMap
 * @param mId
 * @param flag
 * @param thisGantt
 */
export function updateMonitor(taskMonitorMap, task, vueThis, monitorPointsMap, mId, flag, thisGantt) {
  let newM = []
  if (flag === 'add') {
    const mon = {
      monitorId: mId,
      taskId: task.id,
      logBeginTime: '',
      logEndTime: ''
    }
    if (monitorPointsMap[mId] && monitorPointsMap[mId].controlTimeType && monitorPointsMap[mId].controlTimeType === '0') {
      mon.logBeginTime = task.start_date
      mon.logEndTime = thisGantt.date.add(task.end_date, -1, 'day')
    }
    if (JSON.stringify(vueThis.newTaskMap) !== '{}' && vueThis.newTaskMap[task.id] && vueThis.newTaskMap[task.id].updateInfo.indexOf('monitors') !== -1) {
      const monitors = vueThis.newTaskMap[task.id].monitors
      monitors.push(mon)
      newM = monitors
    } else {
      if (vueThis.taskMonitorMap[task.id] && vueThis.taskMonitorMap[task.id].length > 0) {
        const newAdd = vueThis.taskMonitorMap[task.id]
        newAdd.push(mon)
        newM = newAdd
      } else {
        newM.push(mon)
      }
    }
  } else {
    // 删除标识
    if (JSON.stringify(vueThis.newTaskMap) !== '{}' && vueThis.newTaskMap[task.id] && vueThis.newTaskMap[task.id].updateInfo.indexOf('monitors') !== -1) {
      const monitors = vueThis.newTaskMap[task.id].monitors
      if (monitors && monitors.length > 0) {
        let index = 0
        let isHas = false
        monitors.some(function (item) {
          if (item.monitorId === mId) {
            isHas = true
            return true
          }
          index += 1
        })
        if (isHas) {
          monitors.splice(index, 1)
        }
      }
    } else {
      if (vueThis.taskMonitorMap[task.id] && vueThis.taskMonitorMap[task.id].length > 0) {
        newM = vueThis.taskMonitorMap[task.id]
        let index = 0
        let isHas = false
        newM.some(function (item) {
          if (item.monitorId === mId) {
            isHas = true
            return true
          }
          index += 1
        })
        if (isHas) {
          newM.splice(index, 1)
        }
      }
    }
  }
  if (!task.infoType) {
    task.infoType = 'update'
  }
  task.style = changeColor
  // 刷新缓存数据
  setNewTaskMap(vueThis, task, newM, 'monitors')
}

/**
 * 删除任务时校验是否记录变更
 * @param task
 * @param ganttObject
 * @param vueThis
 * @param monitorLockMap
 */
export function checkTaskChangeStatus(task, ganttObject, vueThis, monitorLockMap) {
  // 获取任务层级
  const taskLevel = Number(ganttObject.calculateTaskLevel(task))
  let result = false
  const monitorIds = task.monitorPoints
  // 锁定层级删除或包含锁定标识任务删除
  if (monitorLockMap.taskEdit === '1' && taskLevel < Number(vueThis.lockLevel)) {
    result = true
  }
  if (monitorIds && monitorIds.split(',').length > 0) {
    monitorIds.split(',').some(function (id) {
      if (monitorLockMap[id] === '1') {
        result = true
        return true
      }
    })
  }
  if (result) {
    task.weatherChange = '1'
    task.style = changeColor
  }
}

/**
 * 任务移动位置时变更逻辑处理
 * @param ganttObject
 * @param id 拖动任务
 * @param parentId 新父id
 */
export function taskMoveChange(ganttObject, id, parentId, vueThis) {
  if (vueThis.ganttName !== 'analysisGantt') {
    const task = ganttObject.getTask(id)
  // 变更页面修改添加标记
  if (!task.infoType) {
    task.infoType = 'update'
  }
  task.style = changeColor
  const parTasksIds = []
  parTasksIds.push(parentId)
  getTaskParent(ganttObject, parentId, parTasksIds)
  getTaskParent(ganttObject, id, parTasksIds)
  // 修改任务添加关联
  if (vueThis.ganttName === 'changeGantt' && parTasksIds && parTasksIds.length > 0) {
    updateNewTaskMap(ganttObject, parTasksIds, vueThis, id)
  }
  }
}

/**
 * 变更时动态获取变更后数据
 * @param ganttObject
 * @param vueThis
 * @param task
 */
export function checkInputData(ganttObject, vueThis, task, searchDatas) {
  const result = []
  const oldMap = {}
  if (searchDatas && searchDatas.length > 0) {
    searchDatas.forEach(function (item) {
      oldMap[item.taskId] = item
    })
  }
  task.$target.forEach(function (id) {
    const link = ganttObject.getLink(id)
    const old = oldMap[link.source]
    const changeTask = vueThis.newTaskMap[link.source]
    if (Object.keys(changeTask).length > 0) {
      const task = ganttObject.getTask(link.source)
      const updateInfo = vueThis.newTaskMap[link.source].updateInfo
      const output = vueThis.newTaskMap[link.source].output
      // 未删除任务
      if (task.infoType !== 'delete') {
        // 输出修改后
        if (updateInfo.indexOf('output') !== -1 && output && output.length > 0) {
          const newO = {
            taskId: link.source,
            taskName: task.name,
            inputDatas: output
          }
          result.push(newO)
        } else if (old && Object.keys(old).length > 0) {
          result.push(old)
        }
      }
    } else if (old && Object.keys(old).length > 0) {
      result.push(old)
    }
  })
  return result
}

/**
 * 计算gantt变更数量
 */
export function calculateChangeCount(ganttObject, vueThis) {
  let addCount = 0
  let deleteCount = 0
  let modifyCount = 0
  if (vueThis.newTaskMap && Object.keys(vueThis.newTaskMap).length > 0) {
    const obj = vueThis.newTaskMap
    for (const key in obj) {
      const task = obj[key]
      if (task.infoType && task.infoType === 'create') {
        addCount += 1
      } else if (task.infoType && task.infoType === 'delete') {
        deleteCount += 1
      } else if (task.infoType && task.infoType === 'update') {
        modifyCount += 1
      }
    }
  }
  vueThis.addCount = addCount
  vueThis.deleteCount = deleteCount
  vueThis.modifyCount = modifyCount
}

/**
 * 变更数据回填
 * @param changeTask
 * @param vueThis
 * @param ganttObject
 */
export function backfillChangeDatas(vueThis, ganttObject) {
  // 先添加，再更新，后删除
  const creTask = []
  const upTask = []
  const delTaskIds = []
  for (const key in vueThis.changeTaskInfo) {
    const changeTask = vueThis.changeTaskInfo[key]
    if (changeTask.infoType === 'create') {
      creTask.push(changeTask)
    } else if (changeTask.infoType === 'update') {
      upTask.push(changeTask)
    } else if (changeTask.infoType === 'delete' && ganttObject.isTaskExists(changeTask.id) && !ganttObject.getTask(changeTask.id).readonly) {
      delTaskIds.push(changeTask.id)
    }
    // 附件时间处理
    if (changeTask.input && changeTask.input.length > 0) {
      changeAttItemDate(changeTask.input)
    }
    if (changeTask.output && changeTask.output.length > 0) {
      changeAttItemDate(changeTask.output)
    }
    if (changeTask.special && changeTask.special.length > 0) {
      changeAttItemDate(changeTask.special)
    }
  }
  ganttObject.batchUpdate(function () {
    // 创建新增
    if (creTask != null && creTask.length > 0) {
      creTask.forEach(function (changeTask) {
        if (ganttObject.isTaskExists(changeTask.parent)) {
          vueThis.newTaskMap[changeTask.id] = changeTask
          ganttObject.addTask(changeTask, changeTask.parent, changeTask.indexNo)
          // vueThis.addCount += 1
          linckCheck(changeTask, vueThis, ganttObject, null)
          monitorCheck(changeTask, vueThis, ganttObject, null)
        }
      })
    }
    // 修改
    if (upTask != null && upTask.length > 0) {
      upTask.forEach(function (changeTask) {
        if (ganttObject.isTaskExists(changeTask.id) && !ganttObject.getTask(changeTask.id).readonly) {
          const oldTask = ganttObject.getTask(changeTask.id)
          // 工期处理
          vueThis.newTaskMap[changeTask.id] = changeTask
          // 子修改计划完成时间会改变父级的计划完成时间
          if (vueThis.ganttName !== 'analysisGantt') {
            changeTask.start_date = moment(changeTask.start_date).toDate()
            changeTask.end_date = ganttObject.date.add(moment(changeTask.end_date).toDate(), -1, 'day')
          }
          taskDescribesEditCheck(changeTask, oldTask, vueThis, changeTask.id, ganttObject)
          // 添加依赖关系
          linckCheck(changeTask, vueThis, ganttObject, oldTask)
          monitorCheck(changeTask, vueThis, ganttObject, oldTask)
          // vueThis.modifyCount += 1
        }
      })
    }
  })
  // 删除
  ganttObject.batchUpdate(function () {
    if (delTaskIds && delTaskIds.length > 0) {
      changeGanttRemove(ganttObject, delTaskIds, vueThis)
    }
  })
}

/**
 * 附件回填时间修改
 * @param datas
 */
function changeAttItemDate(datas) {
  datas.forEach(function (att) {
    if (att.uploadFiles && att.uploadFiles.length > 0) {
      att.uploadFiles.forEach(function (t) {
        t.itemCreateTime = null
      })
    }
  })
}

function linckCheck(changeTask, vueThis, ganttObject, oldTask) {
  // 添加依赖关系
  if (changeTask.updateInfo && changeTask.updateInfo.length > 0 && changeTask.updateInfo.indexOf('links') !== -1) {
    const links = []
    if (changeTask.links && changeTask.links.length > 0) {
      changeTask.links.forEach(function (link) {
        if (ganttObject.isLinkExists(link.source)) {
          links.push(link)
        }
      })
    }
    const old = oldTask ? oldTask.$target : null
    const oldLink = []
    if (old && old.length > 0) {
      old.forEach(function (l) {
        if (ganttObject.isLinkExists(l)) {
          oldLink.push(ganttObject.getLink(l))
        }
      })
    }
    linksEditCheck(oldLink, links, vueThis, ganttObject.getTask(changeTask.id), ganttObject)
  }
}

function monitorCheck(changeTask, vueThis, ganttObject, oldTask) {
  // 添加依赖关系
  if (changeTask.updateInfo && changeTask.updateInfo.length > 0 && changeTask.updateInfo.indexOf('monitors') !== -1) {
    monitorPointsEditCheck(null, changeTask.monitors, vueThis, ganttObject.getTask(changeTask.id), ganttObject)
  }
}

/**
 * 变更中，修改任务时间、工期时，若父任务为手动默认，手动修改父任务完成时间和工期，实现类似project模式
 *
 */
export function calculateParentEndDateAndDuration(ganttObject, taskId, vueThis) {
  if (ganttObject && Object.keys(ganttObject).length > 0 && taskId) {
    const task = ganttObject.getTask(taskId)
    if (!task.affecTaskIds || task.affecTaskIds.length === 0) {
      task.affecTaskIds = []
    }
    ganttObject.batchUpdate(function () {
      ganttObject.eachParent(function (t) {
        console.log(t,'父任务')
        console.log(t.type === 'task')
        // if (!t.parent || ['6405', '6406','6407','6408','6409'].includes(t.managerStatus)) {
        //   return;  // 跳过根节点
        // }
        if(t.autoScheduling !== '1'){
          return
        }
        // const oldTask = vueThis.oldTaskMap[t.id]
        // // 为手动时，若计划完成时间小于当前操作任务的计划完成时间，修改父为操作任务完成时间
        // // if (t.type === 'task') {
        //   console.log('333')
        // console.log(oldTask.end_date)
        // console.log(task.end_date)
        //   if (!oldTask || oldTask.end_date < task.end_date) {
        //     console.log('444')
        //     console.log('手动修改父任务完成时间')
        //     t.end_date = task.end_date
        //     t.forecastEndDate = task.forecastEndDate
        //   } else {
        //     t.end_date = oldTask.end_date
        //     t.forecastEndDate = oldTask.forecastEndDate
        //   }
        //   t.duration = ganttObject.calculateDuration(t.start_date, task.end_date)
        //   t.progress = GanttObject.calculateProgress(t, ganttObject)
        //   if (!t.style) {
        //     t.style = affectColor
        //   }
          task.affecTaskIds.push(t.id)
          ganttObject.updateTask(t.id)
        GanttObject.updateTaskNew(ganttObject, t.id, vueThis)
        // // }
        if (!t.infoType) {
          t.infoType = 'update'
          t.changeStatusName = '变更'
        }
        t.style = changeColor
        setNewTaskMap(vueThis, t, null, 'task')
      }, taskId)
    })
    // ganttObject.updateTask(taskId)
  }
}
