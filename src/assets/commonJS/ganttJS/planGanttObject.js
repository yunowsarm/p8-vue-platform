import { GanttObject, progressRefreshCheck } from './ganttObject'
import { Gantt } from 'p8-dhtmlx-gantt'
import { setLockTaskProperties, monitorTimeCheck } from './ganttLockUnLock'
import { batchOwnerCheck } from './commandButtonData'
import api from '@/plugins/api'
import moment from 'moment'
import store from '@/plugins/store'

// 列可编辑图标
const canEditIcon = '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>'
const suspendIcon = '<i class="element_icon el-icon-error" style="color:#ff0000;"></i>'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function planGantt(ganttName, vueThis) {
  console.log('初始化公用gantt页面')
  // 获取gantt对象
  let ganttObject = GanttObject.getGanttObject(ganttName)
  // 单元格键盘导航
  // ganttObject.config.keyboard_navigation_cells = true
  // gantt键盘导航
  // ganttObject.config.keyboard_navigation = true
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  GanttObject.endDateEditor(ganttObject)
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
        api['planGanttManager.updatePlanGanttData']({ planGanttRequest: data, createPage: vueThis.createPage })
          .then((res) => {
            if (res) {
              ganttObject.getTask(id).updateType = ''
              return { action: 'ok' }
            } else {
              ganttObject.undo()
              GanttObject.showMessage(vueThis, '更新失败！', 'error')
              return { action: 'error' }
            }
          })
          .catch(() => {
            ganttObject.undo()
            GanttObject.showMessage(vueThis, '更新失败！', 'error')
            return { action: 'error' }
          })
      }
    },
    link: {
      // 前后置关系操作
      create: function (data) {
        return new ganttObject.Promise((resolve, reject) => {
          api['planGanttManager.createPlanGanttLink']({ planGanttLinkRequest: data })
            .then((res) => {
              if (res) {
                return resolve({ tid: res.id, sid: data.id })
              } else {
                ganttObject.undo()
                GanttObject.showMessage(vueThis, '前后置关系创建失败！', 'error')
                return { action: 'error' }
              }
            })
            .catch(() => {
              ganttObject.undo()
              GanttObject.showMessage(vueThis, '前后置关系创建失败！', 'error')
              return { action: 'error' }
            })
        })
      },
      update: function (data, id) {},
      delete: function (id) {
        return new ganttObject.Promise((resolve, reject) => {
          api['planGanttManager.removePlanGanttLink']({ id: id })
            .then((res) => {
              if (res) {
                return resolve({ tid: res })
              } else {
                ganttObject.undo()
                GanttObject.showMessage(vueThis, '前后置关系删除失败！', 'error')
                return { action: 'error' }
              }
            })
            .catch(() => {
              ganttObject.undo()
              GanttObject.showMessage(vueThis, '前后置关系删除失败！', 'error')
              return { action: 'error' }
            })
        })
      }
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
  Gantt.setCommonResource = function setCommonResource(taskId) {
    let task = ganttObject.getTask(taskId)
    vueThis.comResForm.projectTaskId = taskId
    vueThis.comResForm.commonResourceTaskId = task.comResTaskId
    vueThis.comResForm.commonResourceTypesId = task.commonResourceTypesId
    vueThis.comResForm.comResName = task.comResName
    vueThis.comResForm.planBeginTime = task.comResPlanBeginTime
    vueThis.comResForm.planEndTime = task.comResPlanEndTime
    vueThis.comResForm.contact = task.comResContact
    vueThis.comResForm.tel = task.comResTel
    vueThis.comResTaskSaveVisible = true
  }
  Gantt.fundMouseover = function fundMouseover(name, planType, money, years) {
    let param = { name: name, planType: planType, money: money + '(万元)', years: years + '(年)' }
    vueThis.revenueParam = Object.assign({}, param)
    vueThis.addRevenueViewVisible = true
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
    if (planType === '3101') {
      api['thirdPartInterface.getA5FileLink']({ taskId: taskId })
        .then((res) => {
          if (res) {
            let url = res.fileLink
            if (url.substring(0, 10) === 'VISIT_URL=') {
              url = res.fileLink.substring(10)
            }
            window.open(url, '_blank')
          }
        })
        .catch(() => {})
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
  GanttObject.synchronizationColumns(vueThis, ganttObject)
  GanttObject.searchColumnsDataInit(vueThis, ganttObject)
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
    let task = ganttObject.getTask(id)
    if (task.switchType === '9010' || task.switchType === '9020') {
      console.log('任务不可编辑')
      return false
    }
    console.log('任务继续执行')
    if (e.target.className === 'gantt_tree_icon gantt_open' || e.target.className === 'gantt_tree_icon gantt_close') {
      return true
    }
    let parentNode = e.target.parentNode
    if (ganttObject.isTaskExists(id) && parentNode) {
      // 获取gannt操作限制策略
      let taskStatusLockMap = store.getters.taskStatusLockMap
      let editManagerStatus = taskStatusLockMap[task.status]
      // 只读gantt、已完成、变更中、提交审批、根节点不可点击
      if (ganttObject.config.readonly || ganttObject.getGlobalTaskIndex(id) === 0 || (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1)) {
        return false
      }
      if (parentNode) {
        let fieldName = parentNode.getAttribute('data-column-name')
        // 根节点不可编辑
        // 任务属性readonly为true的任务不可编辑
        if (fieldName) {
          switch (fieldName) {
            case 'owner_id':
              if (batchOwnerCheck(ganttName)) {
                vueThis.startTaskId = id
                vueThis.endTaskId = id
                // 属性gantt资源数据，满足团队角色动态修改
                vueThis.$api['planGanttManager.loadPlanGanttResourceData']({ planInfoId: vueThis.planInfoId })
                  .then(function (res) {
                    ganttObject.$resourcesStore.parse(res)
                    vueThis.selectTaskOwnerId = task.owner_id
                    vueThis.resourceSelectVisible = true
                  })
                  .catch(function (error) {
                    console.log('error' + error)
                  })
              }
              break
          }
        }
      }
    }
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
  // GanttObject.workTimeSetting(ganttObject, vueThis)
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
  // GanttObject.addTooltip(ganttObject, vueThis)
  // 升降级
  let actions = GanttObject.getActions(ganttObject)
  ganttObject.performAction = GanttObject.performAction(actions, ganttObject)
  // 监听任务选中
  ganttObject.attachEvent('onTaskMultiSelect', function (id, state, e) {
    if (state) {
      vueThis.selectedTasks.push(ganttObject.getTask(id))
    } else {
      vueThis.selectedTasks.splice(vueThis.selectedTasks.indexOf(ganttObject.getTask(id)), 1)
    }
  })
  // 右键菜单
  GanttObject.createRightMenu(ganttObject, vueThis)
  // 多选任务不可拖动
  GanttObject.unMoveTask(vueThis, ganttObject)
  // 任务自动调度更新
  GanttObject.updateScheduling(ganttObject, vueThis)
  // 查询监听及定义
  GanttObject.setSearchConfig(ganttObject, vueThis)
  // 编辑加锁后，任务加锁逻辑处理
  setLockTaskProperties(ganttObject, vueThis)
  // 控制列表grid是否动态显示关键路径
  if (vueThis.dynamicDisplayCritical && vueThis.createPage === 'compile' && !ganttObject.config.readonly) {
    GanttObject.checkIsCriticalTask(ganttObject)
  }
  // 是否刷新进度校验
  if (progressRefreshCheck(vueThis)) {
    // 更新任务时，进度更新
    // ganttObject.attachEvent('onAfterTaskUpdate', function (id) {
    //   GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    // })
    ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
      return false
    })
    // 移动任务时，更新进度
    ganttObject.attachEvent('onAfterTaskMove', function (id, parent, tindex) {
      GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    })
  }
  // 在将操作添加到撤消堆栈之前触发
  GanttObject.onBeforeUndoStack(ganttObject)
  // 在将操作添加到回退堆栈之前触发
  GanttObject.onBeforeRedoStack(ganttObject)
  // 撤销前校验任务是否存在
  GanttObject.onBeforeUndo(ganttObject)
  // 回退前校验任务是否存在
  GanttObject.onBeforeRedo(ganttObject)
  // 监听资源选择后事件
  GanttObject.resourceOnAfterSelect(ganttObject)
  GanttObject.setDpObject(ganttName, dp)
  GanttObject.setGanttObject(ganttName, ganttObject)
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
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  // 加载编辑器
  let editors = GanttObject.editors(ganttObject, formatter, linksFormatter)
  return [
    {
      name: 'status',
      label: '进度',
      // align: 'center',
      width: 60,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        let html = ''
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0 && vueThis.createPage === 'compile')) {
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
      name: 'managerStatus',
      label: '状态',
      align: 'center',
      width: 80,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0 && vueThis.createPage === 'compile')) {
          let managerStatus = task.managerStatus
          if (managerStatus && vueThis.managerStatusMap) {
            let item = vueThis.managerStatusMap[managerStatus]
            if (item) {
              return item.cmeaning
            }
          }
        }
        return ''
      }
    },
    {
      name: 'courtyardMonitorPoints',
      label: '院所考核',
      align: 'left',
      min_width: 100,
      resize: true,
      template: function (task) {
        // 标识展示
        let monitorPointDatas = ganttObject.serverList(ganttObject.config.monitor_point)
        let monitorPoints = task[ganttObject.config.monitor_point]
        let html = ''
        if (monitorPoints && monitorPointDatas) {
          monitorPoints.split(',').forEach(function (id) {
            monitorPointDatas.some((point, index) => {
              if (point.id === id && (id === '1022' || id === '1030')) {
                let icon = point.icon
                let controlTimeType = point.controlTimeType
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
                return true
              }
            })
          })
        }
        return html
      }
    },
    {
      name: 'monitorPoints',
      label: '标识',
      align: 'left',
      min_width: 100,
      resize: true,
      template: function (task) {
        // 标识展示
        let monitorPointDatas = ganttObject.serverList(ganttObject.config.monitor_point)
        let monitorPoints = task[ganttObject.config.monitor_point]
        let html = ''
        if (monitorPoints && monitorPointDatas) {
          monitorPoints.split(',').forEach(function (id) {
            monitorPointDatas.some((point, index) => {
              if (point.id === id && id !== '1022' && id !== '1030') {
                let icon = point.icon
                let controlTimeType = point.controlTimeType
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
                return true
              }
            })
          })
        }
        if (task.commonResourceTypesId) {
          html += "<span onclick=Gantt.setCommonResource('" + task.id + '\')><i class="el-icon-s-order" style="cursor:pointer;"></i></span>'
        }
        if (task.revenueBudgetId) {
          vueThis.budgetList.forEach(function (budget) {
            if (task.revenueBudgetId === budget.id) {
              html +=
                "<span  onclick = Gantt.fundMouseover('" +
                budget.name +
                "','" +
                budget.planType +
                "','" +
                budget.money +
                "','" +
                budget.years +
                '\')><i class="p8 icon-cost " style="color:#1bbf9e;cursor:pointer;"></i></span>'
            }
          })
        }
        return html
      }
    },
    {
      name: 'planType',
      label: '任务类型',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务类型展示
        let html = ''
        let taskClassifyDatas = ganttObject.serverList(ganttObject.config.plan_type)
        let planType = task[ganttObject.config.plan_type]
        let attentionTaskNum = task.attentionTaskNum || 0
        if (planType && taskClassifyDatas) {
          taskClassifyDatas.some((point, index) => {
            if (point.id === planType) {
              let icon = point.icon
              html += "<i onclick = Gantt.planTypeClick('" + point.id + "','" + task.id + "','" + task.name + "','" + task.parent + '\') class="' + icon + '" title="' + point.title + '"></i>'
              return true
            }
          })
        }
        if (attentionTaskNum > 0) {
          html += "<i onclick = Gantt.attentionTaskView( '" + task.id + '\' ) class="el-icon-star-on" style="color:#FF5809" title="关注' + attentionTaskNum + '条"></i>'
        }
        return html
      }
    },
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
      name: 'name',
      label: '任务名称' + canEditIcon,
      tree: true,
      align: 'left',
      resize: true,
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      min_width: 350,
      editor: editors.text,
      template: function (task) {
        let result = ''
        if (task.switchType === '9010' || task.switchType === '9020') {
          console.log('添加禁用标识')
          return task.name + suspendIcon
        }
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          if (ganttObject.hasChild(task.id)) {
            result = result + '<div style="' + (vueThis.taskStyles[task.id] || '') + 'font-weight:bold;">' + task.name + '</div>'
          } else {
            result = result + '<div style="' + (vueThis.taskStyles[task.id] || '') + '">' + task.name + '</div>'
          }
        } else {
          if (ganttObject.hasChild(task.id)) {
            result = result + '<div style="font-weight:bold;">' + task.name + '</div>'
          } else {
            result = task.name
          }
        }
        return result
      }
    },
    {
      name: 'owner_id',
      label: '责任人' + canEditIcon,
      align: 'center',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      width: 80,
      resize: true,
      // editor: editors.userEditor,
      template: function (task) {
        let resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        let owner = task[ganttObject.config.resource_property]
        if (owner) {
          let userMessage = resourceDatas.getItem(owner)
          if (userMessage) {
            if (userMessage.weatherOut === '1') {
              let text = '<span style="color: #FF0000">(已退出)</span>'
              return userMessage.name + text
            } else {
              return userMessage.name
            }
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    {
      name: 'roleName',
      label: '角色',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        let resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        let owner = task[ganttObject.config.resource_property]
        if (owner) {
          let userMessage = resourceDatas.getItem(owner)
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
      name: 'dutyDeptName',
      label: '部门',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        let resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        let owner = task[ganttObject.config.resource_property]
        if (owner) {
          let userMessage = resourceDatas.getItem(owner)
          if (userMessage) {
            return userMessage.deptName
          } else {
            return ''
          }
        } else {
          return null
        }
      }
    },
    {
      name: 'weatherControl',
      label: '是否可控',
      align: 'center',
      resize: true,
      width: 70,
      template: function (task) {
        let weatherControl = task.weatherControl
        if (weatherControl === '1') {
          return '是'
        } else {
          return '否'
        }
      }
    },
    {
      name: 'predecessors',
      label: '前后置' + canEditIcon,
      min_width: 80,
      resize: true,
      align: 'left',
      editor: editors.predecessors,
      template: function (task) {
        let links = task.$target
        let labels = []
        for (let i = 0; i < links.length; i++) {
          let link = ganttObject.getLink(links[i])
          labels.push(linksFormatter.format(link))
        }
        return labels.join(',')
      }
    },
    {
      name: 'progress',
      label: '完成度',
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
    // {
    //   name: 'autoScheduling',
    //   label: '排程类型' + canEditIcon,
    //   align: 'center',
    //   min_width: 100,
    //   resize: true,
    //   editor: editors.schedule,
    //   template: function (task) {
    //     // if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
    //     //   return '手动'
    //     // } else {
    //       return task.autoScheduling === '1' ? '自动' : '手动'
    //     // }
    //   }
    // },
    {
      name: 'productQuantity',
      label: '数量',
      align: 'center',
      min_width: 80,
      resize: true,
      editor: editors.number
    },
    {
      label: '批次号',
      name: 'batchNumber',
      minWidth: '150',
      resize: true,
      align: 'center'
    },
    {
      label: '产品图号',
      name: 'mapCode',
      min_width: 180,
      resize: true,
      align: 'center'
    },
    {
      label: '产品代号',
      name: 'productCode',
      minWidth: '150',
      resize: true,
      align: 'center'
    },
    {
      label: '产品名称',
      name: 'mapName',
      minWidth: '150',
      resize: true,
      align: 'center'
    },
    {
      name: 'start_date',
      label: '计划开始时间' + canEditIcon,
      align: 'center',
      min_width: 130,
      resize: true,
      editor: editors.start_date,
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
      name: 'end_date',
      label: '计划完成时间' + canEditIcon,
      align: 'center',
      min_width: 130,
      resize: true,
      editor: editors.end_date,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          let pEndDate = ganttObject.getTask(task.parent).end_date
          let tEndDate = task.end_date
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
      name: 'duration',
      label: '工期',
      align: 'center',
      min_width: 70,
      resize: true,
      // editor: editors.duration,
      template: function (task) {
        return formatter.format(task.duration)
      }
    },
    {
      name: 'standardDuration',
      label: '标准工期',
      align: 'center',
      min_width: 80,
      resize: true
    },
    {
      name: 'forecastBeginDate',
      label: '预计开始时间',
      align: 'center',
      min_width: 110,
      resize: true,
      template: function (task) {
        if (ganttObject.hasChild(task.id)) {
          return '<div style="font-weight:bold;">' + moment(task.forecastBeginDate).format('YYYY-MM-DD') + '</div>'
        } else {
          return task.forecastBeginDate
        }
      }
    },
    {
      name: 'forecastEndDate',
      label: '预计完成时间',
      align: 'center',
      min_width: 110,
      resize: true,
      template: function (task) {
        if (task.forecastEndDate && task.end_date) {
          let ed = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
          let fe = moment(ganttObject.date.add(task.forecastEndDate, 0, 'day')).format('YYYY-MM-DD')
          if (ed !== fe) {
            if (ganttObject.hasChild(task.id)) {
              return '<div style="color:' + GanttObject.forecastColor + 'font-weight:bold;">' + fe + '</div>'
            } else {
              return '<div style="color:' + GanttObject.forecastColor + '">' + fe + '</div>'
            }
          } else {
            if (ganttObject.hasChild(task.id)) {
              return '<div style="font-weight:bold;">' + fe + '</div>'
            } else {
              return fe
            }
          }
        }
      }
    },
    { name: 'avBeginDate', label: '院计划开始时间', align: 'center', min_width: 120, resize: true },
    {
      name: 'avEndDate',
      label: '院计划结束时间',
      align: 'center',
      min_width: 120,
      resize: true,
      template: function (task) {
        if (task.avEndDate) {
          return moment(ganttObject.date.add(task.avEndDate, -1, 'day')).format('YYYY-MM-DD')
        }
      }
    },
    { name: 'num', label: '院计划数量', align: 'center', min_width: 100, resize: true },
    { name: 'realBeginDate', label: '实际开始时间', align: 'center', min_width: 100, resize: true },
    { name: 'realEndDate', label: '实际完成时间', align: 'center', min_width: 100, resize: true }
  ]
}
