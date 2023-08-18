import { GanttObject } from './ganttObject'
import store from '@/plugins/store'
import moment from 'moment'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function planGanttView(ganttName, vueThis) {
  // 获取gantt对象
  let ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.config.readonly = true
  ganttObject.config.order_branch = false
  ganttObject.config.order_branch_free = false
  ganttObject.config.drag_links = false
  ganttObject.config.drag_timeline = false
  ganttObject.config.drag_move = false
  ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
    return false
  })
  ganttObject.attachEvent('onLinkDblClick', function (id, item) {
    return false
  })
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  // 列定义
  synchronizationColumns(vueThis, ganttObject)
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
      vueThis.selectedTasks.splice(vueThis.selectedTasks.indexOf(ganttObject.getTask(id)), 1)
    }
  })
  // 多选任务不可拖动
  GanttObject.unMoveTask(vueThis, ganttObject)
  return ganttObject
}

/**
 * 使用计划编辑页面列设置
 * @param vueThis
 * @param ganttObject
 */
function synchronizationColumns(vueThis, ganttObject) {
  let initColumns = getGanttColumns(ganttObject, vueThis)
  // 获取gantt列配置信息
  let ganttSetting = GanttObject.getGanttSettingGrid('planGantt', vueThis.createPage)
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

/**
 * 定义计划编辑gantt列
 * @param ganttObject
 * @param vueThis
 * @returns {({template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: template, name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number}|{template: (function(*): string), name: string, width: number, resize: boolean, label: string, align: string}|{template: (function(*=): string), name: string, resize: boolean, label: string, align: string, min_width: number})[]}
 */
function getGanttColumns(ganttObject, vueThis) {
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  return [
    {
      name: 'status',
      label: '进度',
      width: 60,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        let html = ''
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          let status = task.status
          if (status) {
            let taskStatusMap = store.state.project.dicConfig.taskStatus
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              let item = taskStatusMap[status]
              html = `<i class="gantt-tip p8 ${item.icon}" style="color: ${item.color}" title="${item.title}" task_status_disp="${item.id}" taskId="${task.id}"></i>`
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
      width: 70,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
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
              if (point.id === id) {
                let icon = point.icon
                html += '<i class="p8 ' + icon + '" title="' + point.title + '"></i>'
                return true
              }
            })
          })
        }
        if (task.commonResourceTypesId) {
          html += '<i class="el-icon-s-order" style="cursor:pointer;"></i>'
        }
        if (task.revenueBudgetId) {
          vueThis.budgetList.forEach(function (budget) {
            if (task.revenueBudgetId === budget.id) {
              html += '<i class="p8 icon-cost " style="color:#1bbf9e;cursor:pointer;"></i>'
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
        if (planType && taskClassifyDatas) {
          taskClassifyDatas.some((point, index) => {
            if (point.id === planType) {
              let icon = point.icon
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
        return ganttObject.getWBSCode(task)
      },
      resize: true,
      min_width: 90
    },
    {
      name: 'name',
      label: '任务名称',
      tree: true,
      align: 'left',
      resize: true,
      min_width: 350
    },
    {
      name: 'owner_id',
      label: '责任人',
      align: 'center',
      width: 80,
      resize: true,
      template: function (task) {
        let resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        let owner = task[ganttObject.config.resource_property]
        if (owner) {
          return resourceDatas.getItem(owner).name
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
          return resourceDatas.getItem(owner).roleName
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
          return resourceDatas.getItem(owner).deptName
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
      label: '前后置',
      min_width: 80,
      resize: true,
      align: 'left',
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
    //   label: '排程类型',
    //   align: 'center',
    //   min_width: 100,
    //   resize: true,
    //   template: function (task) {
    //     if (ganttObject.getGlobalTaskIndex(task.id) === 0) {
    //       return '手动'
    //     } else {
    //       return task.autoScheduling === '1' ? '自动' : '手动'
    //     }
    //   }
    // },
    {
      name: 'start_date',
      label: '计划开始时间',
      align: 'center',
      min_width: 110,
      resize: true,
      template: function (task) {
        return task.start_date
      }
    },
    {
      name: 'end_date',
      label: '计划完成时间',
      align: 'center',
      min_width: 110,
      resize: true,
      template: function (task) {
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
      name: 'standardDuration',
      label: '标准工期',
      align: 'center',
      min_width: 60,
      resize: true
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
    { name: 'avBeginDate', label: '院计划开始时间', align: 'center', min_width: 100, resize: true },
    {
      name: 'avEndDate',
      label: '院计划结束时间',
      align: 'center',
      min_width: 100,
      resize: true,
      template: function (task) {
        if (task.avEndDate) {
          return moment(ganttObject.date.add(task.avEndDate, -1, 'day')).format('YYYY-MM-DD')
        }
      }
    },
    { name: 'batchNumber', label: '批次号', align: 'center', min_width: 100, resize: true },
    { name: 'mapCode', label: '图号', align: 'center', min_width: 100, resize: true },
    { name: 'productCode', label: '产品代号', align: 'center', min_width: 100, resize: true },
    { name: 'realBeginDate', label: '实际开始时间', align: 'center', min_width: 100, resize: true },
    { name: 'realEndDate', label: '实际完成时间', align: 'center', min_width: 100, resize: true }
  ]
}
