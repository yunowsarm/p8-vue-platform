import { Gantt } from 'p8-dhtmlx-gantt'
import { GanttObject } from './ganttObject'
import api from '@/plugins/api'

/**
 * @Description 产出流程gantt树对象定义
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function outPutFlowGantt (ganttName, vueThis) {
  // 获取gantt对象
  let ganttObject = GanttObject.getGanttObject(ganttName)
  // 定义左侧树列表宽度
  // ganttObject.config.grid_width = 1600
  // 只显示树列表
  ganttObject.config.layout = GanttObject.layout2
  // 定义列
  ganttObject.config.columns = [
    // {
    //   name: 'flag',
    //   label: '操作',
    //   resize: true,
    //   width: 45,
    //   align: 'center',
    //   template: function (task) {
    //     return "<span onclick=Gantt.taskOperations(event,'" + task.id + "','" + task.parent + "')><i class='p8 icon-personal-setting'></i></span>"
    //   }
    // },
    {
      name: 'id',
      hide: true
    },
    {
      name: 'code',
      label: '活动编号',
      min_width: 100,
      align: 'center',
      resize: true,
      align: 'center'
    },
    {
      name: 'wbs',
      label: '大纲',
      min_width: 100,
      resize: true,
      align: 'left',
      template: ganttObject.getWBSCode
    },
    {
      name: 'typeDisplay',
      label: '类型',
      min_width: 80,
      resize: true,
      align: 'left',
      template: function (task) {
        let str = ''
        if (task.type) {
          vueThis.logoList.forEach(el => {
            if (el.id == task.type) {
              str += '<i class="' + el.icon + '" title="' + el.meaning + '"></i>'
            }
          })
        }
        return str
      }
    },
    {
      name: 'isMilestoneDisplay',
      label: '里程碑',
      min_width: 80,
      resize: true,
      align: 'left'
    },
    {
      name: 'name',
      label: '活动名称',
      min_width: 240,
      tree: true,
      resize: true,
      align: 'left'
    },
    {
      name: 'predNames',
      label: '前置',
      min_width: 240,
      resize: true,
      align: 'left'
    },
    {
      name: 'duration',
      label: '时限',
      min_width: 80,
      resize: true,
      align: 'center',
      template: function (task) {
        if (task.parent) {
          return task.durations
        } else {
          return ''
        }
      }
    },
    {
      name: 'teamRoleName',
      label: '角色',
      min_width: 100,
      resize: true,
      align: 'center',
      align: 'left'
    }
  ]
  // 事件绑定
  Gantt.taskOperations = function taskOperations (event, taskId, parentId) {
    let x = event.clientX + document.body.scrollLeft
    let y = event.clientY + document.body.scrollTop
    vueThis.menuVisible = true
    vueThis.dropdownTop = y + 'px'
    vueThis.dropdownLeft = x + 'px'
    vueThis.taskId = taskId
    vueThis.currentTaskParentId = parentId
  }
  // 行选中事件-根节点不可选中
  ganttObject.attachEvent('onTaskSelected', (id) => {
    if (ganttObject.getGlobalTaskIndex(id) !== 0) {
      vueThis.$emit('taskSelected', id)
    } else {
      vueThis.$emit('taskSelected', '')
    }
  })
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
    // ganttObject.refreshData(); // 刷新数据并重新渲染
    ganttObject.render(); // 强制刷新 Gantt
  })
  // 升降级
  let actions = GanttObject.getActions(ganttObject)
  ganttObject.performAction = GanttObject.performAction(actions, ganttObject)
  // 双击不显示弹出框
  ganttObject.hideCover(ganttObject.getLightbox())
  // 多选任务不可拖动
  GanttObject.unMoveTask(vueThis, ganttObject)
  // 定义数据操作
  let dp = ganttObject.createDataProcessor({
    task: {// 任务操作
      create: function (data) {
        return new ganttObject.Promise(function (resolve, reject) {
          return resolve({ action: 'inserted' })
        })
      },
      delete: function (id) {
        let keys = []
        keys.push(id)
        api['OutputFlow.removeNodes']({ keys: keys }).then(function (res) {
          if (res && res === 'true') {
            GanttObject.showMessage(vueThis, '删除成功！', 'success')
            return { 'action': 'ok' }
          }
        }).catch(() => {
          GanttObject.showMessage(vueThis, '删除失败！', 'error')
          return { 'action': 'error' }
        })
      },
      update: function (data, id) {
        data.indexNo = ganttObject.getGlobalTaskIndex(id)
        api['OutputFlow.updateActivityInfos']({ activityTaskRequest: data }).then(res => {
          // if (res && res === 'true') {
          //   // GanttObject.showMessage(vueThis, data.name + '-更新成功！', 'success')
          //   return { 'action': 'ok' }
          // } else {
          //   ganttObject.undo()
          //   // GanttObject.showMessage(vueThis, '更新失败！', 'error')
          //   return { 'action': 'error' }
          // }
          vueThis.$emit('refrshDes')
        }).catch(() => {
          ganttObject.undo()
          GanttObject.showMessage(vueThis, '更新失败！', 'error')
          return { 'action': 'error' }
        })
      }
    },
    link: {// 前后置关系操作
      create: function (data) {
        return new ganttObject.Promise(function (resolve, reject) {
          return resolve({ action: 'inserted' })
        })
      },
      update: function (data, id) {
      },
      delete: function (id) {
        return new ganttObject.Promise(function (resolve, reject) {
          return resolve({ action: 'deleted' })
        })
      }
    }
  })
  GanttObject.setDpObject(ganttName, dp)
  GanttObject.setGanttObject(ganttName, ganttObject)
  return ganttObject
}
