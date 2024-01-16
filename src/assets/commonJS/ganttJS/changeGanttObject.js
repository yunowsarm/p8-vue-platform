import { GanttObject } from './ganttObject'
import { setLockTaskProperties } from './ganttLockUnLock'
import { taskMoveChange } from './changeGantt'
import moment from 'moment'
import store from '@/plugins/store'
/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function getChangeGantt(ganttName, vueThis) {
  // 获取gantt对象
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.config.order_branch = false
  ganttObject.config.order_branch_free = false
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  ganttObject.config.undo_steps = 25 // 撤销5步
  ganttObject.config.drag_links = false
  ganttObject.config.drag_timeline = false
  ganttObject.config.drag_move = false
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
            html = `<i class="gantt-tip p8 icon-change-item" style="color: #0d6bec;" title = "变更项"></i>`
          }
          if (infoType) {
            switch (infoType) {
              case 'create':
                html = `<i class="gantt-tip p8 icon-make-increase" style="color: #0d6bec;" title="调增"></i>`
                break
              case 'update':
                html = `<i class="gantt-tip p8 icon-content-adjustment" style="color: #0d6bec;" title = "内容调整"></i>`
                break
              case 'delete':
                html = `<i class="gantt-tip p8 icon-make-reductions" style="color: #0d6bec;" title = "调减"></i>`
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
            const taskStatusMap = store.state.project.dicConfig.taskStatus
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              const item = taskStatusMap[status]
              const html = `<i class="gantt-tip p8 ${item.icon}" style="color: ${item.color}" title="${item.title}" task_status_disp="${item.id}" taskId="${task.id}"></i>`
              return html
            }
          }
        }
        return ''
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
    {
      name: 'changeStatusName',
      label: '变更状态',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          return task.changeStatusName
        }
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
              html += '<i class="' + icon + '" title="' + point.title + '"></i>'
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
    {
      name: 'secretGrade',
      label: '密级',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        const options = vueThis.secretGrades
        const value = options.find((item) => {
          return item.id === task.secretGrade
        })
        return value ? value.title : ''
      }
    },
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
            return '<div style="text-decoration:line-through;color:' + task.style + '">' + task.name + '</div>'
          } else {
            return '<div style="color:' + task.style + '">' + task.name + '</div>'
          }
        } else {
          return task.name
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
    { name: 'realEndDate', label: '实际完成时间', align: 'center', min_width: 100, resize: true }
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

function synchronizationColumns(vueThis, ganttObject) {
  const initColumns = ganttObject.config.columns

  // 获取gantt列配置信息
  if (vueThis.columnSettings.length > 0) {
    const tempColumns = []
    vueThis.columnSettings.forEach((item) => {
      const initColumn = initColumns.filter((initItem) => initItem.name === item.filedName)
      if (initColumn && initColumn.length > 0) {
        initColumn[0].hide = !item.isEnable == '1'
        tempColumns.push(initColumn[0])
      }
    })
    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    initColumns.forEach((initItem, initIndex) => {
      const settingItem = vueThis.columnSettings.filter((settingItem) => settingItem.filedName === initItem.name)
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
