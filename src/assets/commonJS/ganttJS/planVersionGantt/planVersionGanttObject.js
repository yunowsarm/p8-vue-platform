import moment from 'moment'
import { GanttObject } from '../ganttObject'
import store from '@/plugins/store'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function getPlanVersionGantt(ganttObject, vueThis, ganttName) {
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  ganttObject.config.drag_links = false
  ganttObject.config.drag_timeline = false
  ganttObject.config.drag_move = false
  ganttObject.config.scale_height = 50
  ganttObject.config.multiselect = true
  ganttObject.config.auto_scheduling = false
  ganttObject.config.grouping = false
  ganttObject.config.undo = false
  ganttObject.config.critical_path = false
  ganttObject.config.fullscreen = false
  ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
    return false
  })
  ganttObject.attachEvent('onLinkDblClick', function (id, item) {
    return false
  })
  ganttObject.attachEvent('onBeforeTaskMove', function (id, parent, tindex) {
    return false
  })
  // 添加任务选中事件
  ganttObject.attachEvent('onTaskSelected', function (id) {
    vueThis.selectTaskId = id
  })

  // 列定义
  const initColumns = getPlanColumn(vueThis.classifyType, ganttObject, vueThis)
  if (vueThis.ganttThis.columnSettings.length > 0) {
    const tempColumns = []
    vueThis.ganttThis.columnSettings.forEach((item) => {
      const initColumn = initColumns.filter((initItem) => initItem.name === item.filedName)
      if (initColumn && initColumn.length > 0) {
        initColumn[0].hide = !(item.isEnable == '1')
        tempColumns.push(initColumn[0])
      }
    })
    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    initColumns.forEach((initItem, initIndex) => {
      const settingItem = vueThis.ganttThis.columnSettings.filter((settingItem) => settingItem.filedName === initItem.name)
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
  GanttObject.setGanttObject(ganttName, ganttObject, vueThis)
  return ganttObject
}

function getPlanColumn(type, ganttObject, vueThis) {
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  return [
    {
      name: 'wbs',
      label: '大纲',
      align: 'left',
      resize: true,
      min_width: 90,
      template: function (task) {
        const code = ganttObject.getWBSCode(task)
        return code
      }
    },
    // {
    //   name: 'taskCode',
    //   label: '任务编号',
    //   align: 'left',
    //   resize: true,
    //   min_width: 90
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
        if (task.hasDelete) {
          return '<div style="text-decoration: line-through; color: rgb(0, 208, 66); font-weight:bold;">' + task.name + '</div>'
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
        return task.realName
      }
    },
    {
      name: 'roleName',
      label: '角色',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        let resourceDatas = ganttObject.serverList('resources')
        const owner = task[ganttObject.config.resource_property]
        if (owner) {
          const userMessage = resourceDatas.find(item => item.id == owner)
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
        return task.dutyDeptName
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
      label: '计划完成时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          const pEndDate = ganttObject.getTask(task.parent).end_date
          const tEndDate = task.end_date
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
      template: function (task) {
        return formatter.format(task.duration)
      }
    },
    {
      name: 'autoScheduling',
      label: '排程类型',
      align: 'center',
      min_width: 100,
      resize: true,
      template: function (task) {
        return task.autoScheduling === '1' ? '自动' : '手动'
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
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          const status = task.status
          //  status && vueThis.taskStatus
          if (status) {
            const taskStatusMap = vueThis.taskStatusMap
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              const item = taskStatusMap[status]
              const html = `<i class="gantt-tip p8 ${item.icon}" style="color: ${item.color}" title="${item.cmeaning}" task_status_disp="${item.id}" taskId="${task.id}"></i>`
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
      width: 80,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0)) {
          if (task.outputResult > 0) {
            return `<i class="el-icon-star-on" style="color: #4bcafe;font-size: 23px" title="有提交物的"></i>`
          }
          if (task.outputAsk > 0) {
            return `<i class="el-icon-star-on" style="color: #faa010;font-size: 23px" title="有输出要求的"></i>`
          }
          const managerStatus = task.managerStatus
          if (managerStatus && vueThis.managerStatusMap) {
            const item = vueThis.managerStatusMap[managerStatus]
            if (item) {
              return `<i class="${item.icon}" style="color: ${item.color}" title="${item.cmeaning}"></i>`
            }
          }
        }
        return ''
      }
    },
    // {
    //   name: 'predecessors',
    //   label: '前后置',
    //   min_width: 100,
    //   resize: true,
    //   align: 'left',
    //   monitorLockLimit: true, // 标识锁定后不可操作的列声明
    //   template: function (task) {
    //     const links = task.$target
    //     const labels = []
    //     for (let i = 0; i < links.length; i++) {
    //       const link = ganttObject.getLink(links[i])
    //       labels.push(linksFormatter.format(link))
    //     }
    //     return labels.join(',')
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
          monitorPoints.split(',').forEach(function (id) {
            monitorPointDatas.some((point, index) => {
              if (point.id === id && id !== '1022' && id !== '1030') {
                const icon = point.icon
                const controlTimeType = point.controlTimeType
                if (id === '1023') {
                  html += `<span style="cursor: pointer"><i class="p8 ${icon}" style="cursor:pointer;" title="${point.title}"></i></span>`
                } else {
                  if (controlTimeType && controlTimeType === '0') {
                    html += '<span><i class="p8 ' + icon + '" style="cursor:pointer;" title="' + point.title + '"></i></span>'
                  } else {
                    html += '<i class="p8 ' + icon + '" title="' + point.title + '"></i>'
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
        // let taskClassifyDatas = ganttObject.serverList(ganttObject.config.plan_type)
        const taskClassifyDatas = vueThis.taskClassifyDatas
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
    // {
    //   name: 'secretGrade',
    //   label: '密级',
    //   align: 'center',
    //   min_width: 130,
    //   resize: true,
    //   template: function (task) {
    //     return task.secretGradeDisplay
    //   }
    // },
    {
      name: 'weatherControl',
      label: '是否管控任务',
      align: 'center',
      resize: true,
      min_width: 150,
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
    }
  ]
}
