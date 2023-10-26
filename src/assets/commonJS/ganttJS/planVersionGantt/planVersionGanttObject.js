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
  ganttObject.config.columns = getPlanColumn(vueThis.classifyType, ganttObject, vueThis)
  GanttObject.setGanttObject(ganttName, ganttObject, vueThis)
  return ganttObject
}

function getPlanColumn(type, ganttObject, vueThis) {
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  return [
    {
      name: 'wbs',
      label: '大纲',
      align: 'left',
      resize: true,
      min_width: 90,
      template: function (task) {
        let code = ganttObject.getWBSCode(task)
        return code
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
        if (task.hasDelete) {
          return '<div style="text-decoration: line-through; color: rgb(0, 208, 66); font-weight:bold;">' + task.name + '</div>'
        } else {
          return task.name
        }
      }
    },
    {
      name: 'text',
      label: '任务类型',
      align: 'center',
      min_width: 110,
      resize: true,
      template: function (task) {
        // 任务类型展示
        let html = ''
        // let taskClassifyDatas = ganttObject.serverList(ganttObject.config.plan_type)
        const taskClassifyDatas = vueThis.taskClassifyDatas
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
      name: 'flag',
      label: '进度',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          let status = task.status
          //  status && vueThis.taskStatus
          if (status) {
            let taskStatusMap = store.state.project.dicConfig.taskStatus
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              let item = taskStatusMap[status]
              let html = `<i class="gantt-tip p8 ${item.icon}" style="color: ${item.color}" title="${item.title}" task_status_disp="${item.id}" taskId="${task.id}"></i>`
              return html
            }
          }
        }
        return ''
      }
    },
    {
      name: 'flag',
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
      name: 'courtyardMonitorPoints',
      label: '院所考核',
      align: 'center',
      width: 70,
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
          let index = 0
          monitorPoints.split(',').forEach(function (id) {
            //  只显示5个
            if (index < 5) {
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
            }
            index++
          })
        }
        return html
      }
    },
    {
      name: 'clientDisplay',
      label: '客户',
      align: 'center',
      resize: true,
      min_width: 110
      // template: function (task) {
      //   let resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
      //   let owner = task[ganttObject.config.resource_property]
      //   if (owner) {
      //     return resourceDatas.getItem(owner).deptName
      //   } else {
      //     return null
      //   }
      // }
    },
    {
      name: 'phaseMarkerDisplay',
      label: '阶段标记',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'productFinishCompletionDisplay',
      label: '完成形式',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'measurementDisplay',
      label: '计量单位',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'workOrder',
      label: '工作令',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'machineNumber',
      label: '单机配套数',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'planNumber',
      label: '计划数量',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'quantityNumber',
      label: '例试数量',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'productionQuantity',
      label: '预投产数量',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'estimatePassRate',
      label: '预估合格率',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        if (task.estimatePassRate) {
          if (task.estimatePassRate > 100) {
            task.estimatePassRate = 100
          }
          if (task.estimatePassRate < 1) {
            task.estimatePassRate = 1
          }
          return task.estimatePassRate + '%'
        } else {
          task.estimatePassRate = 100
          return task.estimatePassRate + '%'
        }
      }
    },
    {
      name: 'totalBudget',
      label: '全周期收入(万元)',
      align: 'center',
      min_width: 170,
      resize: true
    },
    {
      name: 'estimateBudget',
      label: '全周期直接支出预算(万元)',
      align: 'center',
      min_width: 180,
      resize: true
    },
    {
      name: 'productBatchDisplay',
      label: '批次号',
      align: 'center',
      min_width: 140,
      resize: true
    },
    {
      name: 'ownerName',
      label: '责任人',
      align: 'center',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      width: 80,
      resize: true
    },
    {
      name: 'ownerDeptName',
      label: '角色',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'ownerRoleName',
      label: '部门',
      align: 'center',
      resize: true,
      min_width: 130
    },
    {
      name: 'start_date',
      label: '计划开始时间',
      align: 'center',
      min_width: 100,
      resize: true,
      template: function (task) {
        if (ganttObject.isTaskExists(task.parent) && ganttObject.getTask(task.parent).start_date > task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.isTaskExists(task.parent) && ganttObject.date.add(ganttObject.getTask(task.parent).end_date, null, 'day') < task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间晚于父任务的计划完成时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间晚于父任务的计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (task.start_date > ganttObject.date.add(task.end_date, null, 'day')) {
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
      name: 'secretGradeDisplay',
      label: '密级',
      align: 'center',
      width: 70,
      resize: true
    },
    {
      name: 'end_date',
      label: '计划完成时间',
      align: 'center',
      min_width: 100,
      resize: true,
      template: function (task) {
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          let pEndDate = ganttObject.getTask(task.parent).end_date
          let tEndDate = task.end_date
          if (pEndDate < tEndDate) {
            if (ganttObject.hasChild(task.id)) {
              return (
                '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" style="font-weight:bold;">' +
                GanttObject.dateToStr(ganttObject.date.add(task.end_date, null, 'day'), null, ganttObject) +
                '</span>'
              )
            } else {
              return '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" >' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, null, 'day'), null, ganttObject) + '</span>'
            }
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span style="font-weight:bold;">' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, null, 'day'), null, ganttObject) + '</span>'
        } else {
          return ganttObject.date.add(task.end_date, null, 'day')
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
      name: 'productQuantity',
      label: '数量',
      align: 'center',
      width: 70,
      resize: true
    },
    {
      name: 'mapCode',
      label: '产品图号',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'productCode',
      label: '产品代号',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'mapName',
      label: '产品名称',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'avBeginDate',
      label: '院计划开始时间',
      align: 'center',
      min_width: 130,
      resize: true
    },
    {
      name: 'avEndDate',
      label: '院计划结束时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if (task.avEndDate) {
          return moment(ganttObject.date.add(task.avEndDate, -1, 'day')).format('YYYY-MM-DD')
        }
      }
    },
    {
      name: 'num',
      label: '院计划数量',
      align: 'center',
      min_width: 110,
      resize: true
    },
    { name: 'realBeginDate', label: '实际开始时间', align: 'center', min_width: 100, resize: true },
    { name: 'realEndDate', label: '实际完成时间', align: 'center', min_width: 130, resize: true }
  ]
}
