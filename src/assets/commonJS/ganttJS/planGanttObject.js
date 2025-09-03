import { GanttObject, progressRefreshCheck } from './ganttObject'
import { MessageBox, Notification } from 'p8-components-ui'
import { Gantt } from 'p8-dhtmlx-gantt'
import { setLockTaskProperties, monitorTimeCheck, monitorLockUnLockCheckTwo, lockMonitorUpdateCheck } from './ganttLockUnLock'
import { batchOwnerCheck, deleteKeyRemove } from './commandButtonData'
import api from '@/plugins/api'
import moment from 'moment'
import { copyText } from '@/utils/common'
import store from '@/plugins/store'
import { calculateRemainingDays } from '@/utils/common'

// 列可编辑图标
const canEditIcon = '<i class="el-icon-edit-outline" style="color:#ff0000;"></i>'
const suspendIcon = '<i class="element_icon el-icon-error" style="color:#ff0000;"></i>'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function planGantt (ganttName, vueThis) {
  // 获取gantt对象
  const ganttObject = GanttObject.getGanttObject(ganttName)
  // 单元格键盘导航
  // ganttObject.config.keyboard_navigation_cells = true
  // gantt键盘导航
  // ganttObject.config.keyboard_navigation = true
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  GanttObject.endDateEditor(ganttObject)
  GanttObject.customDateEditor(ganttObject)
  GanttObject.customEndDateEditor(ganttObject)
  GanttObject.onCollapse(ganttObject, vueThis)
  GanttObject.onTaskTimeChange(ganttObject)

  // 定义数据处理器
  const dp = ganttObject.createDataProcessor({
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
        const task = ganttObject.getTask(id)
        if (data.name.length > 1000) {
          data.name = data.name.substring(0, 1000) // 截取前2000个字符
          task.name = data.name
          vueThis.$message({
            message: '最多可输入一千字',
            type: 'warning'
          })
        }
        // 进度小数位数限制--进度保留小数点后2位
        if (data.progress && data.progress > 0) {
          const num = parseFloat(data.progress)
          data.progress = Math.round(num * 100) / 100
        }

        let extraList = vueThis.columnSettings.filter((item) => item.attributeType === '1')
        if (extraList.length > 0) {
          const extraData = []
          let extraIds = {}
          vueThis.extendMap[task.id] &&
            vueThis.extendMap[task.id].forEach((item) => {
              extraIds[item.fieldName] = item.id
            })
          extraList.forEach((item) => {
            let fieldValue = ''
            if (item.filedType === 'datepicker' && data['kz' + item.id] !== '') {
              fieldValue = moment(data['kz' + item.id]).format('YYYY-MM-DD')
            } else {
              fieldValue = data['kz' + item.id]
            }
            const obj = {
              id: extraIds[item.filedName] || '',
              fieldName: item.filedName,
              fieldType: item.filedType,
              fieldValue: fieldValue,
              customItem1: item.id,
              indexNo: item.indexNo // 排序号
            }
            extraData.push(obj)
          })
          // 保存
          api['planGanttManager.saveGanttExtendAttr']({ taskId: task.id, taskExtendRequests: extraData })
        }
        api['planGanttManager.updatePlanGanttData']({
          // pId: secretGrade,
          // id: task.secretGrade,
          planGanttRequest: data,
          createPage: vueThis.createPage
        })
          .then((res) => {
            ganttObject.render()
            ganttObject.refreshData()
            if (res === 'true') {
              // ganttObject.getTask(id).updateType = ''
              vueThis.refreshData()
              let ganttDatas = vueThis.$store.getters.ganttDatas
              ganttDatas.tasks = []
              ganttObject.eachTask((task) => {
                ganttDatas.tasks.push(task)
              })
              vueThis.$store.dispatch('setGanttDatas', ganttDatas)
              if (vueThis.fullscreen && task.parent) {
                api['planGanttManager.getSameTaskIndex']({
                  parentId: task.parent
                })
                  .then((res) => {
                    if (res) {
                      ganttObject.eachTask((task) => {
                        res.forEach((item) => {
                          if (task.id === item.id) {
                            task.indexNo = item.index
                          }
                        })
                      })
                      vueThis.fullscreenLoading.close()
                      vueThis.fullscreen = false
                    }
                  })
                  .catch(() => { })
              }
              return { action: 'ok' }
            } else if (res === 'false') {
              ganttObject.undo()
              GanttObject.showMessage(vueThis, '更新失败！', 'error')
              return { action: 'error' }
            } else {
              vueThis.$message({
                message: res,
                type: 'warning'
              })
              ganttObject.undo()
            }
          })
          .catch((err) => {
            // if (err.data === '密级校验失败') {
            //   // 密级校验提示框
            //   GanttObject.showMessage(vueThis, err.head.message, 'error')
            // } else {
            GanttObject.showMessage(vueThis, '更新失败！', 'error')
            // }
            ganttObject.undo()
            return { action: 'error' }
          })
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
                // vueThis.initGantt()
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
          // vueThis.initGantt()
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
  Gantt.setControlTime = function setControlTime (monitorId, monitorName, taskId) {
    const task = ganttObject.getTask(taskId)
    const monitorLockMap = vueThis.monitorLockMap
    // 加锁逻辑控制
    if (monitorTimeCheck(monitorLockMap, task, ganttObject, monitorId, vueThis.lockLevel)) {
      vueThis.monitorId = monitorId
      vueThis.monitorName = monitorName
      vueThis.selectTaskName = task.name
      vueThis.selectTaskId = taskId
      vueThis.controlTimeVisible = true
    }
  }
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
    vueThis.searchIds = []
    ganttObject.render()
  }
  Gantt.taskProgressDetails = function taskProgressDetails (taskId) {
    if (vueThis.createPage === 'compile' || vueThis.createPage === 'decompose') {
      vueThis.reminderList.forEach((el) => {
        if (el.id === taskId) {
          el.reminder = '0'
        }
      })
      vueThis.debouncedShowTaskProgressDialog(taskId)
    }
  }
  GanttObject.treeDataEditor(ganttObject, vueThis.treeDataEditorConfig, vueThis.treeDataEditorConfig1)
  GanttObject.treeDataEditorExtra(ganttObject, vueThis.treeDataEditorConfig)
  GanttObject.selectCanClear(ganttObject)
  // 列定义
  GanttObject.synchronizationColumns(vueThis, ganttObject)
  GanttObject.searchColumnsDataInit(vueThis, ganttObject)
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
    const parentNode = e.target.parentNode
    const fieldName = parentNode.getAttribute('data-column-name') || e.target.getAttribute('data-column-name')
    const wbs = task.$wbs
    if (fieldName === 'wbs') {
      copyText(wbs, '大纲复制成功！')
    }
    if (vueThis.pageType === 'history') {
      if (vueThis.createPage === 'compile' || vueThis.createPage === 'decompose') {
        vueThis.debouncedShowTaskProgressDialog(task.id)
      }
    }
    task.machineName = task.machineName ? task.machineName : ''
    task.completeForm = task.completeForm ? task.completeForm : ''
    task.taskProjectName = task.taskProjectName ? task.taskProjectName : ''
    task.taskMajorName = task.taskMajorName ? task.taskMajorName : ''
    task.completeCriteria = task.completeCriteria ? task.completeCriteria : ''
    task.qualityRequirement = task.qualityRequirement ? task.qualityRequirement : ''
    task.trainingObject = task.trainingObject ? task.trainingObject : ''
    task.completeNum = task.completeNum ? task.completeNum : ''
    task.setts = task.setts ? task.setts : ''
    task.notes = task.notes ? task.notes : ''
    task.evaluation = task.evaluation ? task.evaluation : ''
    task.combinationName = task.combinationName ? task.combinationName : ''
    const target = e.target || e.srcElement
    if (target && target.classList[0] === 'gantt_tree_icon') {
      const task = ganttObject.getTask(id)
      vueThis.addfoldState(task)
    }
    if (task.switchType === '9010' || task.switchType === '9020') {
      return false
    }
    if (e.target.className === 'gantt_tree_icon gantt_open' || e.target.className === 'gantt_tree_icon gantt_close') {
      return true
    }
    const fieldName1 = parentNode.getAttribute('data-column-name') || e.target.getAttribute('data-column-name')
    if (vueThis.planEditLock !== '0' && task && task.managerStatus && (task.managerStatus === '6404' || task.managerStatus === '6407')) {
      return false
    }
    if (ganttObject.isTaskExists(id) && parentNode) {
      // 获取gannt操作限制策略
      const taskStatusLockMap = store.getters.taskStatusLockMap
      const editManagerStatus = taskStatusLockMap[task.status]
      // 只读gantt、已完成、变更中、提交审批、根节点不可点击
      if (vueThis.planEditLock !== '0' && (ganttObject.config.readonly || ganttObject.getGlobalTaskIndex(id) === 0 || (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1))) {
        return false
      }
      const monitorLockMap = vueThis.monitorLockMap
      // 有责任令标识 并且 有责任令修改加锁标识 不能修改
      const monitors = task.monitorPoints || ''
      if (monitors.indexOf('1015') !== -1 && lockMonitorUpdateCheck(monitorLockMap)) {
        return false
      }

      if (parentNode) {
        const fieldName = parentNode.getAttribute('data-column-name') || e.target.getAttribute('data-column-name')
        // 根节点不可编辑
        // 任务属性readonly为true的任务不可编辑
        if (fieldName) {
          // 标识加锁任务不可编辑
          if (ganttObject.getSelectedTasks().length === 1) {
            const monitors = task.monitorPoints || ''
            if (monitors && monitors.length > 0) {
              if (monitorLockUnLockCheckTwo(fieldName, monitors.split(','), vueThis, ganttObject)) {
                return false
              }
            }
          }
          switch (fieldName) {
            // ... existing code ...
            case 'owner_id':
              // 如果是编辑锁定状态,直接返回false
              if (vueThis.planEditLock === '1') {
                return false
              }

              // 检查是否允许编辑责任人
              const canEdit =
                vueThis.createPage === 'decompose'
                  ? vueThis.planEditLock === '0' || batchOwnerCheck(ganttName)
                  : (vueThis.planEditLock === '0' && ganttObject.getGlobalTaskIndex(id) !== 0) || (task.managerStatus !== '6404' && batchOwnerCheck(ganttName))

              if (!canEdit) {
                return false
              }

              // 设置任务ID
              vueThis.startTaskId = id
              vueThis.endTaskId = id

              // 加载资源数据
              vueThis.$api['planGanttManager.loadPlanGanttResourceData']({
                planInfoId: vueThis.planInfoId
              })
                .then(function (res) {
                  ganttObject.$resourcesStore.parse(res)
                  vueThis.selectTaskOwnerId = task.owner_id
                  vueThis.resourceSelectVisible = true
                })
                .catch(function (error) {
                  console.error(error, 'error')
                })
              break
            case 'start_date':
            case 'end_date':
            case 'autoScheduling':
              // 如果是编辑锁定状态,直接返回false
              if (vueThis.planEditLock === '1') {
                return false
              }
              // 检查是否允许编辑责任人
              const rowStartEdit =
                vueThis.createPage === 'decompose'
                  ? vueThis.planEditLock === '0' || batchOwnerCheck(ganttName)
                  : (vueThis.planEditLock === '0' && ganttObject.getGlobalTaskIndex(id) !== 0) || (task.managerStatus !== '6404' && batchOwnerCheck(ganttName))

              if (!rowStartEdit) {
                return false
              }
              if (ganttObject.getSelectedTasks().length > 1) {
                ganttObject.config.readonly = true
                vueThis.ganttRowEditVisible = true
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
        vueThis.selectedTasks = []
      }
      return true
    }
    if (!e) return true
    let result = true
    const columnElement = e.target.querySelectorAll('*')
    // 需要判断当前选中的任务数量，单选不限制
    if (vueThis.selectedTasks.length < 2) {
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
        vueThis.selectedTasks.push(ganttObject.getTask(id))
      })
    } else {
      const index = vueThis.selectedTasks.findIndex((i) => {
        return i.id === id
      })
      if (index !== undefined) {
        vueThis.selectedTasks.splice(index, 1)
      }
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
    // 移动任务时，更新进度
    ganttObject.attachEvent('onAfterTaskMove', function (id, parent, tindex) {
      GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    })
  }
  ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
    const state = {
      id: id,
      colName: mode === 'resize' ? 'start_date' : ''
    }
    return GanttObject.getTaskEditable(ganttObject, state, vueThis)
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
  GanttObject.resourceOnAfterSelect(ganttObject)
  GanttObject.setDpObject(ganttName, dp)
  GanttObject.setGanttObject(ganttName, ganttObject)

  ganttObject.attachEvent('onParse', function () {
    ganttObject.eachTask(function (task) {
      if (vueThis.createPage === 'decompose') {
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
 * @param vueThis
 * @returns {({template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number}|{template: (function(*): string), name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number})[]}
 */
export function getGanttColumns (ganttObject, vueThis) {
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
  ganttObject.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {
    // 点击列名
    const colName = state.columnName
    // 当前任务
    const task = ganttObject.getTask(state.id)
    // 责任令标识可编辑列
    const monitors = task.monitorPoints || ''
    // eslint-disable-next-line no-unused-vars
    const editorsColumns = [
      'setts',
      'completeForm',
      'machineName',
      'planTypeDic',
      'completeCriteria',
      'qualityRequirement',
      'completeNum',
      'combinationName',
      'responsibilityPlanStartTime',
      'responsibilityPlanEndTime',
      'breakDownProject',
      'keyNodePlan',
      'notes'
    ]
    // if (
    //   editorsColumns.indexOf(colName) !== -1 &&
    //   monitors.indexOf('1015') === -1
    // ) {
    //   return false
    // }
    // 月度计划标识可编辑列
    const editorsColumnsTwo = ['evaluation']
    if (editorsColumnsTwo.indexOf(colName) !== -1 && monitors.indexOf('1008') === -1) {
      return false
    }
    return true
  })
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  // 加载编辑器
  const editors = GanttObject.editors(ganttObject, formatter, linksFormatter)

  function checkEdit () {
    if (vueThis.pageName === 'planMonitor') {
      return false
    } else {
      return true
    }
  }

  return [
    {
      name: 'wbs',
      label: '大纲',
      align: 'left',
      template: function (task) {
        const code = ganttObject.getWBSCode(task)
        if (code.split('.').length > vueThis.deep) {
          vueThis.deep = code.split('.').length
        }
        return code
      },
      resize: true,
      min_width: 90
    },
    // {
    //   name: 'taskCode',
    //   label: '任务编号',
    //   align: 'left',
    //   resize: true,
    //   min_width: 90
    // },
    {
      name: 'achievements',
      label: '绩效' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      resize: true,
      min_width: 90,
      editor: checkEdit() ? editors.achievements : null
    },
    {
      name: 'proportion',
      label: '比例' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      resize: true,
      min_width: 70,
      editor: checkEdit() ? editors.proportion : null,
      template: function (task) {
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0 && task.proportion) {
          let parts = task.proportion.toString().split('.')
          var fraction = parts.length === 1 ? '' : parts[1]
          if (2 > fraction.length) {
            fraction += new Array(2 - fraction.length + 1).join('0')
          }
          return parts[0] + '.' + fraction + '%'
        }
        return ''
      }
    },
    {
      name: 'name',
      label: '任务名称' + (checkEdit() ? canEditIcon : ''),
      tree: true,
      align: 'left',
      resize: true,
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      min_width: 350,
      editor: checkEdit() ? editors.text : null,
      template: function (task) {
        if (task.unDescribes !== '1') {
          if (task.describes && task.describes !== '') {
            task.unDescribes = '1'
          }
        }
        if (task.describes === '') {
          task.unDescribes = '0'
        }
        let result = ''
        if (task.switchType === '9010' || task.switchType === '9020') {
          return task.name + suspendIcon
        }
        let state = GanttObject.validateAchievement(ganttObject, vueThis, task)
        // 注意：该逻辑修改时，需同时修改PmProjectTasksMapper.xml中sql片段checkForecastDateInfo逻辑
        let bool = false
        let tips = ''
        if ((task.forecastBeginDate && task.start_date) || (task.end_date && task.forecastEndDate)) {
          const beginStr = moment(task.start_date).format('YYYY-MM-DD')
          const forecastStartStr = task.forecastBeginDate
          const endStr = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
          const forecastEndStr = task.forecastEndDate
          if (beginStr !== forecastStartStr) {
            // 叶子节点且计划完成时间和预测完成时间不一致
            bool = true
            tips += '当前任务计划开始时间和预计开始时间不一致，注意关注\n'
          }
          if (endStr !== forecastEndStr) {
            // 叶子节点且计划完成时间和预测完成时间不一致
            bool = true
            tips += '当前任务计划完成时间和预计完成时间不一致，注意关注\n'
          }
          if (task.managerStatus == '6406' || task.managerStatus == '6409') {
            tips = ''
            bool = false
          }
        }
        if ((state.childTotal || state.childPercentage) && vueThis.hasAchievements) {
          bool = true
          tips += '子任务存在绩效比例分配异常\n'
        }
        let rowHeight = ganttObject.config.row_height
        if (task.outputResult > 0) {
          result = `<i class='el-icon-star-on' style='color: #4bcafe;font-size: 23px;float: left;line-height: ${rowHeight}px;' title='有提交物的'></i>`
        }
        if (task.outputAsk > 0) {
          result = `<i class='el-icon-star-on' style='color: #faa010;font-size: 23px;font-size: 23px;float: left;line-height: ${rowHeight}px;' title='有输出要求的'></i>`
        }
        if (task.hasBusinessForm == 'true') {
          result = result + `<i class='el-icon-s-order' title='该任务包含业务表单' style='color: #f59000; float: left; font-size: 16px; line-height: ${rowHeight}px;'></i>`
        }
        if (bool) result = result + `<i class='p8 icon-tishi' title='${tips}' style='color: #e6a23c; float: left'></i>`
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0 || vueThis.createPage === 'decompose') {
          let taskStyles = vueThis.taskStyles[task.id] || ''
          if (taskStyles && taskStyles.indexOf('text-decoration: line-through;') !== -1 && taskStyles.indexOf('text-decoration:underline;') !== -1) {
            taskStyles += 'text-decoration: line-through underline;'
          }
          if (ganttObject.hasChild(task.id)) {
            result = result + '<div class="text_overflow" style="display: inline-block;' + (taskStyles || '') + 'font-weight:bold;" title="' + (task.name || '') + '">' + (task.name || '') + '</div>'
          } else {
            result = result + '<div class="text_overflow" style="display: inline-block;' + (taskStyles || '') + '" title="' + (task.name || '') + '">' + (task.name || '') + '</div>'
          }
        } else {
          if (ganttObject.hasChild(task.id)) {
            result = result + '<div class="text_overflow" style="display: inline-block;font-weight:bold;" title="' + (task.name || '') + '">' + (task.name || '') + '</div>'
          } else {
            let icon = ''
            if (task.hasBusinessForm == 'true') {
              icon = `<i class='el-icon-s-order' title='该任务包含业务表单' style='color: #f59000; float: left; font-size: 16px; line-height: ${rowHeight}px;'></i>`
            }
            result = icon + `<div title='${task.name}'>${task.name}</div>` || ''
          }
        }
        if (task.unDescribes === '1') result = `<i class='p8 icon-tishi' title='存在任务描述' style='color: #0ab847; float: left'></i>` + result

        return result
      }
    },
    {
      name: 'owner_id',
      label: '责任人' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      width: 80,
      resize: true,
      editor: true,
      template: function (task) {
        return `<span data-column-name='owner_id' class='gantt_owner_id'>${task.realName || ''}</span>`
        // const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        // const owner = task[ganttObject.config.resource_property]
        // if (owner) {
        //   const userMessage = resourceDatas.getItem(owner)

        //   const userList = ganttObject.serverList('userList')
        //   let text = ''
        //   userList.forEach((item) => {
        //     if (userMessage && item.id === userMessage.userId && item.weatherOut === '1') {
        //       text += `<span style="color: #FF0000">(已退出)</span>`
        //     }
        //   })
        //   return `<span data-column-name="owner_id" class="gantt_owner_id">${(userMessage.name += text)}</span>`
        // } else {
        //   return `<span data-column-name="owner_id" class="gantt_owner_id"></span>`
        // }
      }
    },
    {
      name: 'roleName',
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
      name: 'dutyDeptName',
      label: '责任部门',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'start_date',
      label: '计划开始时间' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      min_width: 130,
      resize: true,
      editor: checkEdit() ? editors.start_date : null,
      template: function (task) {
        if (ganttObject.isTaskExists(task.parent) && ganttObject.getTask(task.parent).start_date > task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return (
              '<span data-column-name="start_date" class="red-wave" title="计划开始时间早于父任务的计划开始时间" style="font-weight:bold;">' +
              GanttObject.dateToStr(task.start_date, null, ganttObject) +
              '</span>'
            )
          } else {
            return '<span data-column-name="start_date" class="red-wave" title="计划开始时间早于父任务的计划开始时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.isTaskExists(task.parent) && ganttObject.date.add(ganttObject.getTask(task.parent).end_date, -1, 'day') < task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return (
              '<span data-column-name="start_date" class="red-wave" title="计划开始时间晚于父任务的计划完成时间" style="font-weight:bold;">' +
              GanttObject.dateToStr(task.start_date, null, ganttObject) +
              '</span>'
            )
          } else {
            return '<span data-column-name="start_date" class="red-wave" title="计划开始时间晚于父任务的计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (task.start_date > ganttObject.date.add(task.end_date, -1, 'day')) {
          if (ganttObject.hasChild(task.id)) {
            return (
              '<span data-column-name="start_date" class="red-wave" title="计划开始时间晚于计划完成时间" style="font-weight:bold;">' +
              GanttObject.dateToStr(task.start_date, null, ganttObject) +
              '</span>'
            )
          } else {
            return '<span data-column-name="start_date" class="red-wave" title="计划开始时间晚于计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span data-column-name="start_date" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
        } else {
          return task.start_date
        }
      }
    },
    {
      name: 'end_date',
      label: '计划完成时间' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      min_width: 130,
      resize: true,
      editor: checkEdit() ? editors.end_date : null,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          const pEndDate = ganttObject.getTask(task.parent).end_date
          const tEndDate = task.end_date
          if (pEndDate < tEndDate) {
            if (ganttObject.hasChild(task.id)) {
              return (
                '<span data-column-name="end_date" class="red-wave" title="计划完成时间大于父任务的计划完成时间" style="font-weight:bold;">' +
                GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) +
                '</span>'
              )
            } else {
              return (
                '<span data-column-name="end_date" class="red-wave" title="计划完成时间大于父任务的计划完成时间" >' +
                GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) +
                '</span>'
              )
            }
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span data-column-name="end_date" style="font-weight:bold;">' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
        } else {
          return ganttObject.date.add(task.end_date, -1, 'day')
        }
      }
    },
    {
      name: 'duration',
      label: '工期' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      min_width: 70,
      resize: true,
      editor: editors.duration,
      template: function (task) {
        return formatter.format(task.duration)
      }
    },
    {
      name: 'autoScheduling',
      label: '排程' + (checkEdit() ? canEditIcon : ''),
      align: 'center',
      min_width: 70,
      resize: true,
      editor: checkEdit() ? editors.schedule : null,
      template: function (task) {
        // if (ganttObject.getGlobalTaskIndex(task.id) === 0 && vueThis.$route.name == 'Planning') {
        //   return '自动'
        // } else {
        return task.autoScheduling === '1' ? '自动' : '手动'
        // }
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
          const status = task.status
          if (status && vueThis.taskStatus) {
            const taskStatusMap = vueThis.taskStatusMap
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              const item = taskStatusMap[status]
              html = `<i class='gantt-tip p8 ${item.icon}' style='color: ${item.color};' title='${item.cmeaning}' task_status_disp='${item.id}' taskId='${task.id}'></i>`
            }
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
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0)) {
          const managerStatus = task.managerStatus
          if (managerStatus && vueThis.managerStatusMap) {
            const item = vueThis.managerStatusMap[managerStatus]
            if (item) {
              return `<i class='${item.icon}' style='color: ${item.color}' title='${item.cmeaning}'></i>`
            }
          }
        }
        return ''
      }
    },
    {
      name: 'predecessors',
      label: '前后置' + (checkEdit() ? canEditIcon : ''),
      min_width: 100,
      resize: true,
      align: 'left',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      editor: checkEdit() ? editors.predecessors : null,
      template: function (task) {
        const links = task.$target
        const labels = []
        for (let i = 0; i < links.length; i++) {
          const link = ganttObject.getLink(links[i])
          labels.push(linksFormatter.format(link))
        }
        return labels.join(',')
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
                  html += `<span style='cursor: pointer'><i class='p8 ${icon}' style='cursor:pointer;color: ${point.color}' title='${point.title}'></i></span>`
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
                      '" style="cursor:pointer; color: ' +
                      point.color +
                      '" title="' +
                      point.title +
                      '"></i></span>'
                  } else {
                    if (id === '1018' && task.iconCommond) {
                      let count = null
                      if (task.iconCommond.indexOf(',') !== -1) {
                        count = task.iconCommond.split(',').length
                      } else {
                        count = 1
                      }
                      html += '<i class="p8 ' + icon + '" title="关联合同节点：' + task.iconCommond + '            关联总数：' + count + '" " style="color: ' + point.color + '"></i>'
                    } else {
                      html += '<i class="p8 ' + icon + '" title="' + point.title + '" " style="color: ' + point.color + '"></i>'
                    }
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
      name: 'planType',
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
              html += `<i class='${icon}' style='cursor:pointer;color:${point.color};' title='${point.title} '></i>`
              return true
            }
          })
        }
        return html
      }
    },
    // {
    //   name: 'secretGrade',
    //   label: '密级' + canEditIcon,
    //   align: 'center',
    //   min_width: 130,
    //   resize: true,
    //   editor: editors.secretGrades,
    //   template: function (task) {
    //     const options = ganttObject.serverList('secretGradeList')
    //     const value = options.find((item) => {
    //       return item.key === task.secretGrade
    //     })
    //     return value ? value.label : ''
    //   }
    // },
    {
      name: 'weatherControl',
      label: '管控任务',
      align: 'center',
      resize: true,
      min_width: 70,
      template: function (task) {
        const weatherControl = task.weatherControl
        if (weatherControl === '1') {
          return '是'
        } else {
          return '否'
        }
      }
    },
    {
      name: 'forecastBeginDate',
      label: '预计开始时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'forecastEndDate',
      label: '预计完成时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'realBeginDate',
      label: '实际开始时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'realEndDate',
      label: '实际完成时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'overdueRemainingDays',
      label: '超期/剩余天数',
      align: 'center',
      min_width: 120,
      resize: true,
      template: function (task) {
        const result = calculateRemainingDays(task)
        return result.text
      }
    },
    {
      name: 'progressFeedback',
      label: '进度反馈',
      align: 'center',
      min_width: 60,
      resize: true,
      template: function (task) {
        const reminderList = vueThis.reminderList ? vueThis.reminderList : []
        const obj = reminderList.find((item) => {
          return item.id === task.id
        })
        let img = require('@/assets/image/gantt/weidu.png')
        if (obj && obj.id && Number(obj.reminder) > 0) {
          return `<span title='未读' onclick=Gantt.taskProgressDetails('${task.id}') style='cursor: pointer'>
            <img style='cursor: pointer;width: 17px; height: 17px' src='${img}' />
          </span>`
        } else if (obj && obj.id && obj.reminder == 0) {
          return `<span title='已读' onclick=Gantt.taskProgressDetails('${task.id}') class='p8 icon-read-mail' style='cursor: pointer;'></span>`
        } else {
          return ''
        }
      }
    },
    {
      name: 'createTime',
      label: '创建时间',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'createBy',
      label: '创建人',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'changeCount',
      label: '变更次数',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'updateTime',
      label: '更新时间',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'updateBy',
      label: '更新人',
      align: 'center',
      min_width: 120,
      resize: true
    }
  ]
}

export function planMonitorAdd (ganttObject, vueThis) { }
