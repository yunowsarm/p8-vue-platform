import { GanttObject, searchColumnRenderer, taskOverdueRemainingDaysArr, taskProgressFeedbackArr, taskStatusArr, taskWeatherControlArr, columnsTypeMap } from './ganttObject'
import { setLockTaskProperties } from './ganttLockUnLock'
import { taskMoveChange } from './changeGantt'
import moment from 'moment'
import { getGanttColumns } from '@/assets/commonJS/ganttJS/planGanttObject'
import Datepicker from '@/assets/commonJS/originalComponents/datePicker'
import { Gantt } from 'p8-dhtmlx-gantt'
import Inputor from '@/assets/commonJS/originalComponents/input'
import Selector from '@/assets/commonJS/originalComponents/select'
import img from '@/assets/image/gantt/weidu.png'
import { calculateRemainingDays } from '@/utils/common'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function getChangeGantt (ganttName, vueThis) {
  // 获取gantt对象
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.config.order_branch = false
  ganttObject.config.order_branch_free = false
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  // 添加工具提示提示
  GanttObject.addTooltip(ganttObject, vueThis)
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  ganttObject.config.undo_steps = 25 // 撤销5步
  ganttObject.config.drag_links = false
  ganttObject.config.drag_timeline = false
  ganttObject.config.drag_move = false
  GanttObject.onCollapse(ganttObject, vueThis)
  // 查询监听及定义
  GanttObject.setSearchConfig(ganttObject, vueThis)
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
    ganttObject.render()
  }
  Gantt.taskProgressDetails = function taskProgressDetails (taskId) {
    vueThis.showTaskProgressDialog(taskId)
  }
  ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
    return false // denies dragging if the global task index is odd
  })
  ganttObject.attachEvent('onLinkDblClick', function (id, item) {
    return false
  })

  // 网格行的背景颜色
  ganttObject.templates.grid_row_class = function (start, end, task) {
    if (ganttObject.getGlobalTaskIndex(task.id) !== 0 || vueThis.createPage === 'userChange') {
      const managerStatus = task.managerStatus
      const status = task.status
      if (managerStatus !== '6405' && (status !== '6050' || status !== '6070')) {
        return 'updColor'
      }
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
    })
  }
  // ganttObject.attachEvent('onBeforeTaskMove', function (id, parent, tindex) {
  //   let task = ganttObject.getTask(id)
  //   if (task.parent !== parent) { return false }
  //   return false
  // })
  // 列定义
  ganttObject.config.columns = [
    {
      name: 'infoType',
      label: '变更状态',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        let html = ''
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0 || vueThis.createPage === 'userChange') {
          const infoType = task.infoType
          const weatherChange = task.weatherChange
          if (vueThis.ganttName && vueThis.ganttName === 'changeGantt' && weatherChange && weatherChange === '1') {
            html = `<i class='gantt-tip p8 icon-change-item' style='color: red;' title = '变更项'></i>`
          }
          if (infoType) {
            switch (infoType) {
              case 'create':
                html = `<i class='gantt-tip p8 icon-make-increase' style='color: red;' title='调增'></i>`
                break
              case 'update':
                html = `<i class='gantt-tip p8 icon-content-adjustment' style='color: red;' title = '内容调整'></i>`
                break
              case 'delete':
                html = `<i class='gantt-tip p8 icon-make-reductions' style='color: red;' title = '调减'></i>`
                break
            }
          }
        }
        return html
      }
    },
    {
      name: 'status',
      label: '进度',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0 || vueThis.createPage === 'userChange') {
          const status = task.status
          if (status && vueThis.taskStatus) {
            const taskStatusMap = vueThis.taskStatusMap
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              const item = taskStatusMap[status]
              const html = `<i class='gantt-tip p8 ${item.icon}' style='color: ${item.color}' title='${item.cmeaning}' task_status_disp='${item.id}' taskId='${task.id}'></i>`
              return html
            }
          }
        }
        return ''
      }
    },
    {
      name: 'progressFeedback',
      label: '进度反馈',
      align: 'center',
      min_width: 60,
      resize: true,
      template: function (task) {
        const reminderList = vueThis.reminderList
        const obj = reminderList.find((item) => {
          return item.id === task.id
        })
        let img = require('@/assets/image/gantt/weidu.png')
        if (obj && obj.id && Number(obj.reminder) > 0) {
          return `<span onclick=Gantt.taskProgressDetails('${task.id}') style='cursor: pointer'>
            <img style='cursor: pointer;width: 17px; height: 17px' src='${img}' />
          </span>`
        } else if (obj && obj.id && obj.reminder == 0) {
          return `<span onclick=Gantt.taskProgressDetails('${task.id}') class='p8 icon-read-mail' style='cursor: pointer;'></span>`
        } else {
          return ''
        }
      }
    },
    {
      name: 'managerStatus',
      label: '状态',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0 || vueThis.createPage === 'userChange') {
          const managerStatus = task.managerStatus
          if (managerStatus && vueThis.managerStatusMap) {
            const item = vueThis.managerStatusMap[managerStatus]
            if (item) {
              return item.cmeaning
            }
          }
        }
        return ''
      }
    },
    // {
    //   name: 'changeStatusName',
    //   label: '变更状态',
    //   align: 'center',
    //   width: 70,
    //   resize: true,
    //   template: function (task) {
    //     // 任务图标，排除根节点
    //     if (ganttObject.getGlobalTaskIndex(task.id) !== 0 && task.changeStatusName) {
    //       return '<div style="display: inline-block;color:red;">' + task.changeStatusName + '</div>'
    //     }
    //   }
    // },
    // {
    //   name: 'achievements',
    //   label: '绩效',
    //   align: 'center',
    //   resize: true,
    //   min_width: 90
    // },
    // {
    //   name: 'proportion',
    //   label: '比例',
    //   align: 'center',
    //   resize: true,
    //   min_width: 90,
    //   template: function (task) {
    //     if (ganttObject.getGlobalTaskIndex(task.id) !== 0 && task.proportion) {
    //       return task.proportion + '%'
    //     }
    //     return ''
    //   }
    // },
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
          let index = 0
          monitorPoints.split(',').forEach(function (id) {
            // 只显示5个
            if (index < 5) {
              monitorPointDatas.some((point, index) => {
                if (point.id === id) {
                  const icon = point.icon
                  html += '<i class="p8 ' + icon + '" title="' + point.title + '"></i>'
                  return true
                }
              })
            }
            index++
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
              html += '<i class="' + icon + '" title="' + point.title + '" style="color:' + point.color + '" ></i>'
              return true
            }
          })
        }
        return html
      }
    },
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
    //   name: 'secretGrade',
    //   label: '密级',
    //   align: 'center',
    //   resize: true,
    //   min_width: 120,
    //   template: function (task) {
    //     const options = vueThis.secretGrades
    //     const value = options.find((item) => {
    //       return item.id === task.secretGrade
    //     })
    //     return value ? value.title : ''
    //   }
    // },
    {
      name: 'name',
      label: '任务名称',
      tree: true,
      align: 'left',
      resize: true,
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      min_width: 350,
      template: function (task) {
        if (task.style) {
          if (task.infoType === 'delete') {
            return '<div class="text_overflow" style="display: inline-block;text-decoration:line-through;color:' + task.style + '">' + task.name + '</div>'
          } else {
            return `<div class="text_overflow">${task.name}</div>`

          }
        } else {
          return `<div class="text_overflow">${task.name}</div>`
        }
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
        const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        const owner = task[ganttObject.config.resource_property]
        if (owner) {
          return resourceDatas.getItem(owner) ? resourceDatas.getItem(owner).name : ''
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
        const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        const owner = task[ganttObject.config.resource_property]
        if (owner) {
          return resourceDatas.getItem(owner) ? resourceDatas.getItem(owner).roleName : ''
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
        const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        const owner = task[ganttObject.config.resource_property]
        if (owner) {
          return resourceDatas.getItem(owner) ? resourceDatas.getItem(owner).deptName : ''
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
        const weatherControl = task.weatherControl
        if (weatherControl === '1') {
          return '是'
        } else {
          return '否'
        }
      }
    },
    {
      name: 'predecessors',
      label: '前后置',
      min_width: 80,
      resize: true,
      align: 'left',
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
    //   label: '排程类型',
    //   align: 'center',
    //   min_width: 100,
    //   resize: true,
    //   template: function (task) {
    //     // return task.auto_scheduling === true ? '自动' : '手动'
    //     return task.autoScheduling === '1' ? '自动' : '手动'
    //   }
    // },
    {
      name: 'start_date',
      label: '计划开始时间',
      align: 'center',
      min_width: 100,
      resize: true,
      template: function (task) {
        if (ganttObject.isTaskExists(task.parent) && ganttObject.getTask(task.parent).start_date > task.start_date) {
          return '<span class="red-wave">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
        }
        return task.start_date
      }
    },
    {
      name: 'end_date',
      label: '计划完成时间',
      align: 'center',
      min_width: 100,
      resize: true,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          const pEndDate = GanttObject.strToDate(GanttObject.dateToStr(ganttObject.getTask(task.parent).end_date, null, ganttObject), null, ganttObject)
          const tEndDate = GanttObject.strToDate(GanttObject.dateToStr(task.end_date, null, ganttObject), null, ganttObject)
          if (pEndDate < tEndDate) {
            return '<span class="red-wave">' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
          }
        }
        return ganttObject.date.add(task.end_date, -1, 'day')
      }
    },
    {
      name: 'duration',
      label: '工期',
      align: 'center',
      min_width: 60,
      resize: true,
      template: function (task) {
        return formatter.format(task.duration)
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
      resize: true,
      template: function (task) {
        if (task.end_date && task.forecastEndDate) {
          const ed = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
          const fe = task.forecastEndDate
          if (ed !== fe) {
            return '<div style="color:' + GanttObject.forecastColor + '">' + fe + '</div>'
          } else {
            return fe
          }
        }
      }
    },
    { name: 'realBeginDate', label: '实际开始时间', align: 'center', min_width: 100, resize: true },
    { name: 'realEndDate', label: '实际完成时间', align: 'center', min_width: 100, resize: true },
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
  // 创建资源载体
  ganttObject.$resourcesStore = GanttObject.createDatastore(ganttObject)
  // 封装资源数据 名称[部门]-角色
  GanttObject.resourceStoreOnParse(ganttObject)
  // 工作时间设置
  // GanttObject.workTimeSetting(ganttObject, vueThis)
  // 监听任务选中
  ganttObject.attachEvent('onTaskMultiSelect', function (id, state, e) {
    if (state) {
      vueThis.selectedTasks.push(ganttObject.getTask(id))
    } else {
      const index = vueThis.selectedTasks.findIndex((item) => {
        return item.id === id
      })
      vueThis.selectedTasks.splice(index, 1)
    }
  })
  // 只读校验
  if (vueThis.readonly) {
    ganttObject.config.readonly = true
    ganttObject.config.readonlyReason = '当前为只读模式，不可操作'
  } else {
    // 可操作
    // 前后置删除提示文本定义
    GanttObject.linkDescription(ganttObject)
    // 升降级
    const actions = GanttObject.getActions(ganttObject)
    ganttObject.performAction = GanttObject.performAction(actions, ganttObject)
    // 查询监听及定义
    GanttObject.setSearchConfig(ganttObject, vueThis)
    GanttObject.planAfterRedo(ganttObject, vueThis)
    GanttObject.planAfterUndo(ganttObject, vueThis)
    // 自动调度监听
    GanttObject.planChangeCheck(ganttObject, vueThis)
    // 右键菜单
    GanttObject.createRightMenu(ganttObject, vueThis)
    // 多选任务不可拖动
    GanttObject.changeUnMoveTask(vueThis, ganttObject)
    // 任务状态处理
    setLockTaskProperties(ganttObject, vueThis)
    // 更新任务时，进度更新
    ganttObject.attachEvent('onAfterTaskUpdate', function (id) {
      GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    })
    // 移动任务时，更新进度
    ganttObject.attachEvent('onAfterTaskMove', function (id, parent, tindex) {
      GanttObject.refreshProgress(parent, true, ganttObject, vueThis)
    })
    // 移动任务时，更新进度
    ganttObject.attachEvent('onBeforeTaskMove', function (id, parent, tindex) {
      GanttObject.refreshProgress(parent, true, ganttObject, vueThis)
      taskMoveChange(ganttObject, id, parent, vueThis)
    })
    // 拖动任务时，进度更新
    ganttObject.attachEvent('onTaskDrag', function (id) {
      GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    })
    // 新增任务时，进度更新
    ganttObject.attachEvent('onAfterTaskAdd', function (id) {
      GanttObject.refreshProgress(ganttObject.getTask(id).parent, true, ganttObject, vueThis)
    })
    // 删除时，进度更新
    let idParentBeforeDeleteTask = ''
    ganttObject.attachEvent('onBeforeTaskDelete', function (id) {
      idParentBeforeDeleteTask = ''
      idParentBeforeDeleteTask = ganttObject.getTask(ganttObject.getTask(id).parent)
    })
    ganttObject.attachEvent('onAfterTaskDelete', function () {
      if (idParentBeforeDeleteTask !== '') {
        GanttObject.refreshProgress(idParentBeforeDeleteTask, true, ganttObject, vueThis)
      }
    })
    synchronizationColumns(vueThis, ganttObject)
    searchColumnsDataInit(vueThis, ganttObject)
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
    GanttObject.setGanttObject(ganttName, ganttObject)
  }
  return ganttObject
}

/**
 * 同步列
 * @param vueThis
 * @param ganttObject
 */
function synchronizationColumns (vueThis, ganttObject) {
  function checkEdit () {
    if (vueThis.pageName === 'planMonitor') {
      return false
    } else {
      return true
    }
  }

  const initColumns = ganttObject.config.columns
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
    initItem.label = searchColumnRenderer(dataIndex, label, type)
    // }
  })
  // 获取gantt列配置信息
  // if (vueThis.columnSettings.length > 0) {
  //   const tempColumns = []
  //
  //   vueThis.columnSettings.forEach((item) => {
  //     const initColumn = initColumns.filter((initItem) => initItem.name === item.filedName)
  //     if (initColumn && initColumn.length > 0) {
  //       initColumn[0].hide = !item.isEnable == '1'
  //       tempColumns.push(initColumn[0])
  //     }
  //   })
  //   // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
  //   initColumns.forEach((initItem, initIndex) => {
  //     const settingItem = vueThis.columnSettings.filter((settingItem) => settingItem.filedName === initItem.name)
  //     if (!settingItem || Object.keys(settingItem).length === 0) {
  //       initItem.hide = false
  //       if (tempColumns && tempColumns.length > initIndex) {
  //         tempColumns.splice(initIndex, 0, initItem)
  //       } else {
  //         tempColumns.push(initItem)
  //       }
  //     }
  //   })
  //   ganttObject.config.columns = tempColumns
  // } else {
  //   ganttObject.config.columns = initColumns
  // }

  if (vueThis.columnSettings.length > 0) {
    const tempColumns = []
    vueThis.columnSettings.forEach((item) => {
      const initColumn = initColumns.filter((initItem) => initItem.name === item.filedName)
      if (initColumn && initColumn.length > 0) {
        // initColumn[0].hide = !(item.isEnable == '1')
        // tempColumns.push({ ...initColumn[0], indexNo: item.indexNo })
        if (item.isEnable == '1') {
          tempColumns.push({ ...initColumn[0], indexNo: item.indexNo })
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
          default:
            break
        }
        if (item.isEnable == '1') {
          let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
          if (typeList.includes(item.filedType)) {
            tempColumns.push({
              name: 'kz' + item.id,
              label: `<div class='gantt_search'>${item.name}</div><div class='gantt_search gantt_blank'></div>`,
              align: 'center',
              resize: true,
              hide: item.isEnable == '0',
              min_width: 120,
              template: function (task) {
                let result = []
                if (task['kz' + item.id]) {
                  let list = vueThis.extraMap[item.selectCode]
                  if (list && list.length) {
                    let taskList = task['kz' + item.id] ? task['kz' + item.id].split(',') : []
                    list.forEach(el => {
                      taskList.forEach(item => {
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
              label: `<div class="gantt_search">${item.name}</div><div class="gantt_search gantt_blank"></div>`,
              align: 'center',
              resize: true,
              hide: item.isEnable == '0',
              min_width: 120,
              indexNo: item.indexNo,
              template: function (task) {
                return `<div class='text_overflow'>${task['kz' + item.id]}</div>`
              }
            })
          }
        }
      }
    })
    initColumns.forEach((initItem, initIndex) => {
      const settingItem = vueThis.columnSettings.filter((settingItem) => settingItem.filedName === initItem.name)
      if (!settingItem || Object.keys(settingItem).length === 0) {
        initItem.hide = false
        if (tempColumns && tempColumns.length > initIndex) {
          // if (initItem.name == 'infoType') {
          //   tempColumns.unshift(initItem)
          // } else {
          //   tempColumns.push(initItem)
          // }
        } else {
          if (vueThis.columnSettings.filter((el) => el.filedName === initItem.name && el.isEnable !== '0')) {
            tempColumns.push(initItem)
          }
        }
      }
    })
    ganttObject.config.columns = tempColumns
  } else {
    ganttObject.config.columns = initColumns
  }
}

function searchColumnsDataInit (vueThis, ganttObject) {
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
              onChangeValue (value) {
                vueThis.searchForm[name] = value
              },
              onChange (value) {
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
            const obj = new Selector(`.${selectorKey}`, {
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
            })
            vueThis[selectorKey] = obj
          }
        }
      }
    })
  })
}
