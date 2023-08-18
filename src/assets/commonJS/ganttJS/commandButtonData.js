import { GanttObject, progressRefreshCheck, updateforecastDate } from './ganttObject'

import { changeColor, changeGanttRemove, setNewTaskMap } from './changeGantt'
import api from '@/plugins/api'
import store from '@/plugins/store'

export const CommandButtonData = [
  {
    id: 'create-children',
    icon: 'p8 icon-new-subordinate',
    title: '新建下级',
    help: '新建下级',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName === 'changeGantt') {
        noDpAddTask(1, 'Child', ganttName)
      } else {
        addTask(1, 'Child', ganttName)
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      } else if (checkEditTask(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      let vueThis = store.getters.vueThis
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
        result = true
      }
      if (checkHasProductTask(tasks)) {
        result = true
      }
      return result
    },
    children: [
      {
        id: 'create-children-two',
        icon: 'p8 icon-new-subordinate',
        title: '2 条',
        help: '新建2条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(2, 'Child', ganttName)
          } else {
            addTask(2, 'Child', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          } else if (checkEditTask(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          if (checkHasProductTask(tasks)) {
            result = true
          }
          return result
        }
      },
      {
        id: 'create-children-four',
        icon: 'p8 icon-new-subordinate',
        title: '4 条',
        help: '新建4条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(4, 'Child', ganttName)
          } else {
            addTask(4, 'Child', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          } else if (checkEditTask(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          if (checkHasProductTask(tasks)) {
            result = true
          }
          return result
        }
      },
      {
        id: 'create-children-six',
        icon: 'p8 icon-new-subordinate',
        title: '6 条',
        help: '新建6条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(6, 'Child', ganttName)
          } else {
            addTask(6, 'Child', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          } else if (checkEditTask(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          if (checkHasProductTask(tasks)) {
            result = true
          }
          return result
        }
      },
      {
        id: 'create-children-eight',
        icon: 'p8 icon-new-subordinate',
        title: '8 条',
        help: '新建8条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(8, 'Child', ganttName)
          } else {
            addTask(8, 'Child', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          } else if (checkEditTask(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          if (checkHasProductTask(tasks)) {
            result = true
          }
          return result
        }
      },
      {
        id: 'createByNum',
        icon: 'p8 icon-new-subordinate',
        createNum: Number,
        title: '其他数量',
        help: '其他数量',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          if (ganttName === 'changeGantt') {
            noDpAddTask(vueThis.createNum, 'Child', ganttName)
          } else {
            addTask(vueThis.createNum, 'Child', ganttName)
          }
          vueThis.menuVisible = false
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          // if (!checkReadOnly(ganttName) && tasks && tasks.length === 1) {
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          } else if (checkEditTask(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          if (checkHasProductTask(tasks)) {
            result = true
          }
          return result
        }
      }
    ]
  },
  {
    id: 'create-equative',
    icon: 'p8 icon-new-sibling',
    title: '新建同级',
    help: '新建同级',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName === 'changeGantt') {
        noDpAddTask(1, 'Before', ganttName)
      } else {
        // addTask(1, 'Before', ganttName)
        addTask(1, 'After', ganttName)
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '2')) {
        result = false
      } else if (checkEditTask(ganttName, tasks) && !checkContentRoot(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      return result
    },
    children: [
      {
        id: 'create-equative-two',
        icon: 'p8 icon-new-sibling',
        title: '2 条',
        help: '新建2条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(2, 'Before', ganttName)
          } else {
            // addTask(2, 'Before', ganttName)
            addTask(2, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '2')) {
            result = false
          } else if (checkEditTask(ganttName, tasks) && !checkContentRoot(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          return result
        }
      },
      {
        id: 'create-equative-four',
        icon: 'p8 icon-new-sibling',
        title: '4 条',
        help: '新建4条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(4, 'Before', ganttName)
          } else {
            // addTask(4, 'Before', ganttName)
            addTask(4, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '2')) {
            result = false
          } else if (checkEditTask(ganttName, tasks) && !checkContentRoot(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          return result
        }
      },
      {
        id: 'create-equative-six',
        icon: 'p8 icon-new-sibling',
        title: '6 条',
        help: '新建6条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(6, 'Before', ganttName)
          } else {
            // addTask(6, 'Before', ganttName)
            addTask(6, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '2')) {
            result = false
          } else if (checkEditTask(ganttName, tasks) && !checkContentRoot(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          return result
        }
      },
      {
        id: 'create-equative-eight',
        icon: 'p8 icon-new-sibling',
        title: '8 条',
        help: '新建8条',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(8, 'Before', ganttName)
          } else {
            // addTask(8, 'Before', ganttName)
            addTask(8, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '2')) {
            result = false
          } else if (checkEditTask(ganttName, tasks) && !checkContentRoot(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          return result
        }
      }
    ]
  },
  {
    id: 'common-resources',
    icon: 'p8 icon-settings',
    title: '共性资源',
    help: '共性资源',
    isDisableFun: function (btn, ganttName, tasks) {
      let result = true
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      }
      return result
    },
    children: [
      {
        id: 'create-resources',
        icon: 'el-icon-s-order',
        title: '添加资源',
        help: '添加共性资源',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          vueThis.comResForm.projectTaskId = tasks[0].id
          vueThis.comResTaskSaveVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result = true
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          }
          return result
        }
      },
      {
        id: 'off-resources',
        icon: 'el-icon-s-order',
        title: '取消资源',
        help: '取消共性资源',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          vueThis.comResForm.projectTaskId = tasks[0].id
          vueThis.unComResSubmit(tasks[0].id)
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result = true
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          }
          return result
        }
      }
    ]
  },
  {
    id: 'fund-task',
    icon: 'p8 icon-cost',
    title: '设置经费节点',
    help: '设置经费节点',
    isDisableFun: function (btn, ganttName, tasks) {
      let result = true
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      }
      return result
    },
    children: [
      {
        id: 'fund-task-two',
        icon: 'p8 icon-settings',
        title: '二级拨款节点',
        help: '二级拨款节点',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          tasks.forEach(function (task) {
            vueThis.otherParam.owner_id = task.owner_id
            vueThis.otherParam.taskId = task.id
          })
          vueThis.otherParam.deptTag = 'secondDept'
          vueThis.addRevenueVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result = true
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          }
          return result
        }
      },
      {
        id: 'fund-task-other',
        icon: 'p8 icon-settings',
        title: '外协拨款节点',
        help: '外协拨款节点',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis

          tasks.forEach(function (task) {
            vueThis.otherParam.owner_id = task.owner_id
            vueThis.otherParam.taskId = task.id
          })
          vueThis.otherParam.deptTag = 'otherDept'
          vueThis.addRevenueVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result = true
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          }
          return result
        }
      },
      {
        id: 'fund-task-remove',
        icon: 'p8 icon-settings',
        title: '取消拨款节点',
        help: '取消拨款节点',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          tasks.forEach(function (task) {
            vueThis.otherParam.taskId = task.id
          })

          api['TaskRevenueInfo.removeRelation'](vueThis.otherParam)
            .then(function (res) {
              if (res) {
                vueThis.addRevenueClose(null, vueThis.otherParam)
                vueThis.$message({
                  message: '取消成功',
                  type: 'success'
                })
              } else {
                vueThis.$message({
                  message: '取消失败！',
                  type: 'error'
                })
              }
            })
            .catch(() => {
              vueThis.$message({
                message: '取消失败！',
                type: 'error'
              })
            })
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result = true
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          }
          return result
        }
      }
    ]
  },
  {
    id: 'product-message',
    icon: 'p8 icon-trial-production',
    title: '添加生产信息',
    help: '添加生产信息',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      vueThis.selectTaskId = tasks[0].id
      vueThis.productTaskEditVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = true
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        let planType = tasks[0] ? tasks[0].planType : ''
        if (planType && planType.indexOf('3103') !== -1) {
          result = false
        }
      }
      return result
    }
  },
  {
    id: 'outdent-task',
    icon: 'p8 icon-upgrade',
    title: '升级',
    help: '升级',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      thisGantt.performAction('outdentAction', thisGantt)
      thisGantt.refreshData()
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks && tasks.length > 0 && outdentCheck(ganttName, tasks) && !checkReadOnly(ganttName)) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'task-sync',
    icon: 'p8 icon-refresh',
    title: '单条同步',
    help: '单条同步',
    clickFun: function (btn, ganttName, tasks) {
      let allTaskIds = []
      tasks.forEach(function (task) {
        allTaskIds.push(task.id)
      })
      batchSyncTask(ganttName, allTaskIds)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks && tasks.length === 1) {
        result = false
      } else {
        result = true
      }

      return result
    }
  },
  {
    id: 'product-message-sync',
    icon: 'p8 icon-refresh',
    title: '添加生产信息',
    help: '添加生产信息',
    clickFun: function (btn, ganttName, tasks) {
      // let vueThis = store.getters.vueThis
      // todo 创建菜单
      let vueThis = store.getters.vueThis
      vueThis.selectTaskDate = tasks[0]
      vueThis.productTaskSaveVisible = true
      console.log(vueThis.selectTaskDate, tasks[0], tasks, 'sss')
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks && tasks.length === 1) {
        result = false
      } else {
        result = true
      }

      return result
    }
  },
  {
    id: 'indent-task',
    icon: 'p8 icon-downgrade',
    title: '降级',
    help: '降级',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      thisGantt.performAction('indentAction', thisGantt)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks && tasks.length > 0 && canIndentCheck(ganttName)) {
        result = false
      } else {
        result = true
      }
      let vueThis = store.getters.vueThis
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
        result = true
      }
      return result
    }
  },
  {
    id: 'remove-tasks',
    icon: 'p8 icon-delete',
    title: '删除',
    help: '删除',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      if (ganttName === 'changeGantt') {
        if (thisGantt) {
          removeTasks(thisGantt, null, ganttName)
        }
      } else {
        let thisDp = GanttObject.getDpObject(ganttName)
        if (thisGantt && thisDp) {
          let msg = '是否确认删除选中任务?'
          if (checkHasApproveTask(ganttName, tasks)) {
            msg = '删除任务包含已提交审批任务，是否确认删除?'
          }
          thisGantt.confirm({
            text: msg,
            ok: '确认',
            cancel: '取消',
            callback: function (result) {
              if (result) {
                removeTasks(thisGantt, thisDp, ganttName)
              }
            }
          })
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      let vueThis = store.getters.vueThis
      if (tasks && tasks.length > 0 && canDeleteCheck(ganttName, tasks, vueThis)) {
        result = false
      } else {
        result = true
      }
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length >= 1) {
        tasks.forEach(function (task, index) {
          if (task.managerStatus === '6403') {
            result = true
          }
        })
      }
      return result
    }
  },
  {
    id: 'product-task',
    icon: 'p8 icon-clear-non-production-tasks',
    title: '清空非生产任务数量',
    help: '清空非生产任务数量',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      let thisGantt = GanttObject.getGanttObject(ganttName)
      vueThis.planTypeDatas = thisGantt.serverList(thisGantt.config.plan_type)
      vueThis.ganttName = ganttName
      vueThis.productTaskVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      if (checkSwitchType(tasks)) {
        return true
      }
      if (checkReadOnly(ganttName)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'hierarchy-filter',
    type: 'select',
    userDefault: 'false',
    title: '层级',
    help: '层级',
    clickFun: function (value, ganttName) {
      if (ganttName) {
        let ganttObject = GanttObject.getGanttObject(ganttName)
        ganttObject.eachTask(function (task) {
          if (value && ganttObject.calculateTaskLevel(task) === value - 1) {
            task.$open = false
          } else {
            task.$open = true
          }
        })
        ganttObject.render()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      return false
    }
  },
  {
    id: 'plan-scheduling',
    type: 'select',
    userDefault: 'true',
    title: '排程模式设置',
    help: '排程模式设置',
    options: [
      {
        label: '自动',
        value: '1'
      },
      {
        label: '手动',
        value: '2'
      }
    ],
    clickFun: function (value, ganttName, tasks) {
      if (ganttName && value) {
        changePlanScheduling(value, ganttName, tasks)
      }
    },
    isDisableFun: function (ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      let vueThis = store.getters.vueThis
      if (!checkReadOnly(ganttName) && tasks && tasks.length > 0 && !checkTaskReadonly(ganttName, tasks) && !vueThis.readOnly && !checkContentRoot(ganttName, tasks)) {
        return false
      }
      return true
    }
  },
  {
    id: 'batch-owner',
    icon: 'p8 icon-full-name',
    title: '批量设置责任人',
    help: '批量设置责任人',
    clickFun: function (btn, ganttName, tasks) {
      batchOwner(ganttName)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks && tasks.length > 0 && batchOwnerCheck(ganttName)) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'batch-sync',
    icon: 'p8 icon-refresh',
    title: '全部同步',
    help: '全部同步',
    clickFun: function (btn, ganttName, tasks) {
      batchSyncTask(ganttName, [])
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      if (checkSwitchType(tasks)) {
        return true
      }
      if (checkReadOnly(ganttName)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'product-task-view',
    icon: 'p8 icon-management-elements',
    title: '添加/查看生产计划',
    help: '添加/查看生产计划',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      let thisGantt = GanttObject.getGanttObject(ganttName)
      vueThis.planTypeDatas = thisGantt.serverList(thisGantt.config.plan_type)
      vueThis.ganttName = ganttName
      vueThis.productTaskViewVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      if (checkSwitchType(tasks)) {
        return true
      }
      if (checkReadOnly(ganttName)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'out-put-view',
    icon: 'p8 icon-view-output',
    title: '查看输出物',
    help: '查看输出物',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      let thisGantt = GanttObject.getGanttObject(ganttName)
      vueThis.planTypeDatas = thisGantt.serverList(thisGantt.config.plan_type)
      vueThis.ganttName = ganttName
      vueThis.outPutViewVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      if (checkSwitchType(tasks)) {
        return true
      }
      if (checkReadOnly(ganttName)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'issue-tasks',
    icon: 'p8 icon-task-distribute',
    title: '任务下发',
    help: '任务下发',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let thisDp = GanttObject.getDpObject(ganttName)
      if (thisGantt && thisDp) {
        thisGantt.confirm({
          text: '下发已选择的任务，包含这些任务的各级子任务和父任务将同时下发，是否继续?',
          ok: '确认',
          cancel: '取消',
          callback: function (result) {
            if (result) {
              issueTask(thisGantt, thisDp)
            }
          }
        })
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      // 计划编辑页面才可下发
      if (checkCanIssue(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'issue-message',
    icon: 'p8 icon-issuance-notice',
    title: '通知下发',
    help: '通知下发',
    clickFun: function (btn, ganttName, tasks) {
      // let thisGantt = GanttObject.getGanttObject(ganttName)
      // let thisDp = GanttObject.getDpObject(ganttName)
      // if (thisGantt && thisDp) {
      //   thisGantt.confirm({
      //     text: '下发时，将连同所选任务的子任务及关联父任务一同下发，任务下发后责任人可见，是否确认下发选中任务?',
      //     ok: '确认',
      //     cancel: '取消',
      //     callback: function (result) {
      //       if (result) {
      //         issueTask(thisGantt, thisDp)
      //       }
      //     }
      //   })
      // }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      // 计划编辑页面才可下发
      if (checkCanIssue(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'undo-tasks',
    icon: 'p8 icon-revoke',
    title: '撤销',
    help: '撤销',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      if (thisGantt) {
        thisGantt.undo()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (thisGantt && !checkReadOnly(ganttName) && thisGantt.getUndoStack() && thisGantt.getUndoStack().length > 0 && !checkTaskReadonly(ganttName, tasks) && !vueThis.readOnly) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'redo-tasks',
    icon: 'p8 icon-redo',
    title: '重做',
    help: '重做',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      if (thisGantt) {
        thisGantt.redo()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (thisGantt && !checkReadOnly(ganttName) && thisGantt.getRedoStack() && thisGantt.getRedoStack().length > 0 && !checkTaskReadonly(ganttName, tasks) && !vueThis.readOnly) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'copy-tasks',
    icon: 'p8 icon-copy',
    title: '复制',
    help: '复制',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (ganttName === 'changeGantt') {
        noDpCopy(thisGantt, tasks, vueThis)
      } else {
        let thisDp = GanttObject.getDpObject(ganttName)
        if (thisGantt && thisDp) {
          copyTask(thisGantt, tasks, vueThis)
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks && tasks.length > 0 && !checkContentRoot(ganttName, tasks) && !checkReadOnly(ganttName)) {
        return false
      }
      return true
    }
  },
  {
    id: 'paste-tasks',
    icon: 'p8 icon-paste',
    title: '粘贴',
    help: '粘贴',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (ganttName === 'changeGantt') {
        noDpPaste(thisGantt, tasks, vueThis)
      } else {
        let thisDp = GanttObject.getDpObject(ganttName)
        if (thisGantt && thisDp) {
          pasteTask(thisGantt, tasks, vueThis, 'only', thisDp)
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = true
      if (checkSwitchType(tasks)) {
        return true
      }
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (tasks && tasks.length === 1 && tasks[0].parent && thisGantt.isTaskExists(tasks[0].parent)) {
        let parentTask = thisGantt.getTask(tasks[0].parent)
        // 获取gannt操作限制策略
        let taskStatusLockMap = store.getters.taskStatusLockMap
        let editManagerStatus = taskStatusLockMap[parentTask.status]
        if (editManagerStatus && editManagerStatus.indexOf(parentTask.managerStatus) !== -1 && Object.keys(vueThis.copyTasks).length) {
          return false
        }
      }
      return result
    }
  },
  {
    id: 'plan-scheduling',
    icon: 'p8 icon-front-and-rear',
    title: '自动/手动排程',
    help: '自动/手动排程',
    clickFun: function (btn, ganttName, tasks) {},
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (autoSchedulingCheck(ganttName)) {
        result = true
      } else {
        result = false
      }
      return result
    }
  },
  {
    id: 'color-red',
    icon: '#ff0000', // 页面显示style样式
    title: '红色',
    style: 'color:#ff0000;', // css样式
    help: '红色',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'color-blue',
    icon: '#00B0F0', // 页面显示style样式
    title: '蓝色',
    style: 'color:#00B0F0;', // css样式
    help: '蓝色',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'color-green',
    icon: '#00B050', // 页面显示style样式
    title: '绿色',
    style: 'color:#00B050;', // css样式
    help: '绿色',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'color-purple',
    icon: '#FFC000', // 页面显示style样式
    title: '橙色',
    style: 'color:#FFC000;', // css样式
    help: '橙色',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'font-bold',
    icon: 'p8 icon-bold',
    title: '加粗',
    style: 'font-weight:bold;', // css样式
    help: '加粗',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'font-italic',
    icon: 'p8 icon-italic',
    title: '斜体',
    style: 'font-style:italic;', // css样式
    help: '斜体',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'font-underline',
    icon: 'p8 icon-underline',
    title: '下划线',
    style: 'text-decoration:underline;', // css样式
    help: '下划线',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'removeStyle',
    icon: 'p8 icon-cancel-format',
    title: '取消样式',
    help: '取消样式',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '3')) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'plan-edit-gantt',
    icon: 'p8 icon-edit-view',
    title: '编辑视图',
    help: '编辑视图',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (thisGantt) {
        // 清空选中
        thisGantt.eachSelectedTask(function (id) {
          thisGantt.unselectTask(id)
        })
        vueThis.viewType = 'grid'
        if (ganttName && ganttName === 'changeGantt') {
          vueThis.initGantt(vueThis.planInfoId, vueThis.changeRecordId, 'grid')
        } else if (ganttName && ganttName === 'planGantt') {
          vueThis.initGantt(vueThis.planInfoId, 'grid')
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      let vueThis = store.getters.vueThis
      if (vueThis.viewType && vueThis.viewType !== 'grid') {
        return false
      }
      return true
    }
  },
  {
    id: 'plan-gantt',
    icon: 'p8 icon-gantt',
    title: 'gantt图',
    help: 'gantt图',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (thisGantt) {
        // 清空选中
        thisGantt.eachSelectedTask(function (id) {
          thisGantt.unselectTask(id)
        })
        vueThis.viewType = 'gantt'
        if (ganttName && ganttName === 'changeGantt') {
          vueThis.initGantt(vueThis.planInfoId, vueThis.changeRecordId, 'gantt')
        } else if (ganttName && ganttName === 'planGantt') {
          vueThis.initGantt(vueThis.planInfoId, 'gantt')
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      if (vueThis.viewType && vueThis.viewType !== 'gantt') {
        return false
      }
      return true
    }
  },
  {
    id: 'plan-gantt-resource',
    icon: 'p8 icon-resource-view',
    title: '资源视图',
    help: '资源视图',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      let vueThis = store.getters.vueThis
      if (thisGantt) {
        // 清空选中
        thisGantt.eachSelectedTask(function (id) {
          thisGantt.unselectTask(id)
        })
        vueThis.viewType = 'resource'
        if (ganttName && ganttName === 'changeGantt') {
          vueThis.initGantt(vueThis.planInfoId, vueThis.changeRecordId, 'resource')
        } else if (ganttName && ganttName === 'planGantt') {
          vueThis.initGantt(vueThis.planInfoId, 'resource')
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      if (vueThis.viewType && vueThis.viewType !== 'resource') {
        return false
      }
      return true
    }
  },
  {
    id: 'full-screen',
    icon: 'p8 icon-full-screen',
    title: '全屏',
    help: '全屏',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      // 全屏监听
      thisGantt.ext.fullscreen.getFullscreenElement = function () {
        return document.querySelector('#couerDiv')
      }
      thisGantt.ext.fullscreen.toggle()
      if (btn.title === '全屏') {
        btn.title = '退出全屏'
        btn.icon = 'p8 icon-exit-fullscreen'
        btn.help = '退出全屏'
      } else {
        btn.title = '全屏'
        btn.icon = 'p8 icon-full-screen'
        btn.help = '全屏'
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'critical-path',
    icon: 'p8 icon-critical-path',
    title: '关键路径',
    help: '关键路径',
    clickFun: function (btn, ganttName, tasks) {
      let thisGantt = GanttObject.getGanttObject(ganttName)
      if (thisGantt) {
        if (thisGantt.config.highlight_critical_path) {
          thisGantt.config.highlight_critical_path = false
        } else {
          thisGantt.config.highlight_critical_path = true
        }
        thisGantt.render()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'excel-import',
    icon: 'p8 icon-excel-import',
    title: 'Excel导入',
    help: 'Excel导入',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      vueThis.importExcel = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      } else if (checkEditTask(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      let vueThis = store.getters.vueThis
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
        result = true
      }
      if (checkHasProductTask(tasks)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'project-import',
    icon: 'p8 icon-project-import',
    title: 'Project导入',
    help: 'Project导入',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      vueThis.importProject = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      } else if (checkEditTask(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      let vueThis = store.getters.vueThis
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
        result = true
      }
      if (checkHasProductTask(tasks)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'excel-export',
    icon: 'p8 icon-excel-export',
    title: 'Excel导出',
    help: 'Excel导出',
    clickFun: function (btn, ganttName, tasks, data, messages) {
      let vueThis = store.getters.vueThis
      // taskId如何获得？？
      let taskId = vueThis.taskId
      let planInfoId = vueThis.planInfoId

      api['planGanttManager.excelExport']({ planInfoId: planInfoId, dicType: 'ACTIVITY_TYPE', taskId: taskId }, { responseType: 'blob' })
        .then((data) => {
          let date = new Date()
          // eslint-disable-next-line camelcase
          let file_name = '计划编制数据导出' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
          // eslint-disable-next-line camelcase
          let file_type = 'xls'
          let blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          console.log(blob, 'blob数据')
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          // eslint-disable-next-line camelcase
          link.download = `${file_name}.${file_type}`
          document.body.appendChild(link)
          link.click()
        })
        .catch((erro) => {
          vueThis.$message({
            message: 'excel导出失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'project-export',
    icon: 'p8 icon-project-export',
    title: 'Project导出',
    help: 'Project导出',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      let taskId = vueThis.taskId
      let planInfoId = vueThis.planInfoId

      api['planGanttManager.excelProject']({ planInfoId: planInfoId, dicType: 'ACTIVITY_TYPE', taskId: taskId }, { responseType: 'blob' })
        .then((data) => {
          let date = new Date()
          // eslint-disable-next-line camelcase
          let file_name = '计划编制数据导出' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
          // eslint-disable-next-line camelcase
          let file_type = 'xml'
          let blob = new Blob([data.data], { type: 'application/octet-stream' })
          console.log(blob, 'Project-blob数据')
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          // eslint-disable-next-line camelcase
          link.download = `${file_name}.${file_type}`
          document.body.appendChild(link)
          link.click()
        })
        .catch((erro) => {
          vueThis.$message({
            message: 'Project导出失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'erp-pull',
    icon: 'p8 icon-ERP',
    title: 'ERP',
    help: 'ERP',
    clickFun: function (btn, ganttName, tasks) {
      console.log(btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      return false
    }
  },
  {
    id: 'pdm-pull',
    icon: 'p8 icon-PDM',
    title: 'PDM',
    help: 'PDM',
    clickFun: function (btn, ganttName, tasks) {
      console.log(btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      return false
    }
  },
  {
    id: 'master-pull',
    icon: 'p8 icon-master-data',
    title: '主数据',
    help: '主数据',
    clickFun: function (btn, ganttName, tasks) {
      console.log(btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      return false
    }
  },
  {
    id: 'activity-import',
    icon: 'p8 icon-knowledge-base-import',
    title: '知识库导入',
    help: '知识库导入',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      vueThis.activityImportType = 'children'
      vueThis.activityImportVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      } else if (checkEditTask(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      let vueThis = store.getters.vueThis
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
        result = true
      }
      if (checkHasProductTask(tasks)) {
        result = true
      }
      return result
    },
    children: [
      {
        id: 'activity-import-children',
        icon: 'p8 icon-knowledge-base-import',
        title: '导入下级',
        help: '导入下级',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          vueThis.activityImportType = 'children'
          vueThis.activityImportVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '1')) {
            result = false
          } else if (checkEditTask(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          return result
        }
      },
      {
        id: 'activity-import-before',
        icon: 'p8 icon-knowledge-base-import',
        title: '导入同级',
        help: '导入同级',
        clickFun: function (btn, ganttName, tasks) {
          let vueThis = store.getters.vueThis
          vueThis.activityImportType = 'before'
          vueThis.activityImportVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          let result
          if (checkSwitchType(tasks)) {
            return true
          }
          if (isDisableFunCheck(ganttName, tasks, '2')) {
            result = false
          } else if (checkEditTask(ganttName, tasks) && !checkContentRoot(ganttName, tasks)) {
            result = false
          } else {
            result = true
          }
          return result
        }
      }
    ]
  },
  {
    id: 'my-experience',
    icon: 'p8 icon-create-experience-library',
    title: '创建我的经验库',
    help: '创建我的经验库',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      vueThis.myExperienceType = 'children'
      vueThis.myExperienceVisible = true
      vueThis.queryParam.planId = vueThis.planInfoId
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      return false
    }
  },
  {
    id: 'my-experience-import',
    icon: 'p8 icon-experience-base-import',
    title: '经验库导入',
    help: '经验库导入',
    clickFun: function (btn, ganttName, tasks) {
      let vueThis = store.getters.vueThis
      vueThis.myExperienceType = 'children'
      vueThis.myExperienceImportVisible = true
      //  console.log( vueThis.planInfoId,'---------我的计划标识');
      // vueThis.queryParam.planId = vueThis.planInfoId
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result
      if (checkSwitchType(tasks)) {
        return true
      }
      if (isDisableFunCheck(ganttName, tasks, '1')) {
        result = false
      } else if (checkEditTask(ganttName, tasks)) {
        result = false
      } else {
        result = true
      }
      let vueThis = store.getters.vueThis
      let createPage = vueThis.createPage
      if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
        result = true
      }
      if (checkHasProductTask(tasks)) {
        result = true
      }
      return result
    }
  },
  {
    id: 'create-version',
    icon: 'p8 icon-create-version',
    title: '创建版本',
    help: '创建版本',
    clickFun: function (btn, ganttName, tasks) {},
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      let result = true
      return result
    }
  },
  {
    id: 'version-compare',
    icon: 'p8 icon-contrast',
    title: '比较',
    help: '比较',
    clickFun: function (btn, ganttName, tasks) {},
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      let result = true
      return result
    }
  },
  {
    id: 'version-list',
    icon: 'p8 icon-version-list',
    title: '版本列表',
    help: '版本列表',
    clickFun: function (btn, ganttName, tasks) {},
    isDisableFun: function (btn, ganttName, tasks) {
      let result = true
      return result
    }
  },
  {
    id: 'grid-setting',
    icon: 'p8 icon-version-list',
    title: '列设置',
    help: '列设置',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        let ganttObject = GanttObject.getGanttObject(ganttName)
        let vueThis = store.getters.vueThis
        if (vueThis && Object.keys(vueThis).length) {
          vueThis.renderColumns = ganttObject.config.columns
          vueThis.selectGridVisible = true
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'resource-group-setting',
    icon: 'p8 icon-team-member-editor',
    title: '团队成员编辑',
    help: '团队成员编辑',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        let vueThis = store.getters.vueThis
        vueThis.ganttGroupSetting = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
    }
  },
  {
    id: 'search-list',
    icon: 'p8 icon-search',
    title: '查询',
    help: '查询',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        let vueThis = store.getters.vueThis
        vueThis.ganttSearchVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
    }
  },
  {
    id: 'menu-config',
    icon: 'p8 icon-menu-config',
    title: '菜单配置',
    help: '菜单配置',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        let vueThis = store.getters.vueThis
        vueThis.rightMenuConfigVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {}
  },
  {
    id: 'unSuspend-config',
    icon: 'element_icon el-icon-caret-right',
    title: '解除暂停',
    help: '解除暂停',
    clickFun: function (btn, ganttName, tasks) {
      let ids = []
      tasks.forEach(function (task) {
        ids.push(task.id)
      })
      let vueThis = store.getters.vueThis
      api['planGanttManager.changeSwitchType']({ pasteTaskIds: ids, type: '9000' })
        .then(function (res) {
          let ganttObject = GanttObject.getGanttObject(ganttName)
          ids.forEach(function (id) {
            let selTask = ganttObject.getTask(id)
            selTask.switchType = '9000'
            ganttObject.updateTask(id)
          })
          vueThis.$message({
            message: '解除成功！',
            type: 'success'
          })
        })
        .catch(() => {
          vueThis.$message({
            message: '解除失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      return result
    }
  },
  {
    id: 'suspend-config',
    icon: 'element_icon el-icon-warning',
    title: '暂停',
    help: '暂停',
    clickFun: function (btn, ganttName, tasks) {
      let ids = []
      tasks.forEach(function (task) {
        ids.push(task.id)
      })
      let vueThis = store.getters.vueThis
      api['planGanttManager.changeSwitchType']({ pasteTaskIds: ids, type: '9010' })
        .then(function (res) {
          let ganttObject = GanttObject.getGanttObject(ganttName)
          ids.forEach(function (id) {
            let selTask = ganttObject.getTask(id)
            selTask.switchType = '9010'
            ganttObject.updateTask(id)
          })
          vueThis.$message({
            message: '暂停成功！',
            type: 'success'
          })
        })
        .catch(() => {
          vueThis.$message({
            message: '暂停失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      return result
    }
  },
  {
    id: 'forbid-config',
    icon: 'element_icon el-icon-error',
    title: '禁止',
    help: '禁止',
    clickFun: function (btn, ganttName, tasks) {
      let ids = []
      tasks.forEach(function (task) {
        ids.push(task.id)
      })
      let vueThis = store.getters.vueThis
      api['planGanttManager.changeSwitchType']({ pasteTaskIds: ids, type: '9020' })
        .then(function (res) {
          let ganttObject = GanttObject.getGanttObject(ganttName)
          ids.forEach(function (id) {
            let selTask = ganttObject.getTask(id)
            selTask.switchType = '9020'
            ganttObject.updateTask(id)
          })
          vueThis.$message({
            message: '禁止成功！',
            type: 'success'
          })
        })
        .catch(() => {
          vueThis.$message({
            message: '禁止失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      let result = false
      return result
    }
  }
]

/**
 * 通用按钮禁用条件
 * @param ganttName
 * @param tasks
 * @returns {boolean}
 */
function isDisableFunCheck(ganttName, tasks, checkType) {
  let result = false
  let vueThis = store.getters.vueThis
  let ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && Object.keys(ganttObject).length > 0) {
    let taskIds = ganttObject.getSelectedTasks()
    if (!checkReadOnly(ganttName) && taskIds && !checkTaskReadonly(ganttName, tasks) && !vueThis.readOnly) {
      if (checkType === '1' && taskIds.length === 1) {
        result = true
      } else if (checkType === '2' && taskIds.length === 1 && !checkContentRoot(ganttName, tasks)) {
        result = true
      } else if (checkType === '3' && taskIds.length > 0 && !checkContentRoot(ganttName, tasks)) {
        result = true
      }
      // 变更中已删除任务不可操作
      if (ganttName === 'changeGantt') {
        taskIds.some(function (id) {
          let task = ganttObject.getTask(id)
          if (task.infoType && task.infoType === 'delete') {
            result = false
            return true
          }
        })
      }
    }
  }
  return result
}

/**
 * 检查任务readonly属性，为true时，任务不可操作
 * @param ganttName
 * @param tasks
 * @returns {boolean}
 */
function checkTaskReadonly(ganttName, tasks) {
  let result = false
  let ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (taskId) {
    let task = ganttObject.getTask(taskId)
    if (task.readonly && !result) {
      result = true
    }
  })
  return result
}

/**
 * @Description 判断gantt的readonly属性值
 * @author fukai
 * @date 2020/5/21 19:49
 */
function checkReadOnly(ganttName) {
  let ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && ganttObject.config.readonly) {
    if (ganttObject.config.readonly) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

/**
 * @Description 检查选中任务是否包含根节点
 *              包含：true
 *              不包含：false
 * @author fukai
 * @date 2020/5/13 11:33
 */
function checkContentRoot(ganttName, tasks) {
  let result = false
  let ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && tasks) {
    ganttObject.eachSelectedTask(function (taskId) {
      if (ganttObject.getGlobalTaskIndex(taskId) === 0 && !result) {
        result = true
      }
    })
  }
  return result
}

/**
 * @Description 任务新建
 * @author fukai
 * @date 2020/5/7 12:01
 */
function addTask(num, pos, ganttName) {
  let ganttObject = GanttObject.getGanttObject(ganttName)
  let dpObject = GanttObject.getDpObject(ganttName)
  if (ganttObject && dpObject) {
    let taskId = ganttObject.getSelectedId()
    let task = ganttObject.getTask(taskId)
    let taskIndexNo = ganttObject.getTaskIndex(taskId) // 分支indexNo
    let vueThis = store.getters.vueThis
    let type = 'task'
    let parentTask
    switch (pos) {
      case 'Before':
        // 同级上方插入
        parentTask = ganttObject.getTask(task.parent)
        api['planGanttManager.createPlanGanttData']({
          name: '新任务',
          parent: taskId,
          insertNum: num,
          insertType: 'Before',
          type: type,
          autoScheduling: parentTask.autoScheduling,
          createPage: vueThis.createPage
        })
          .then(function (res) {
            if (res) {
              createTaskByDatas(ganttObject, res, task.parent, 'Before', '新任务', '任务创建成功!', dpObject, taskIndexNo)
              vueThis.taskCount = vueThis.taskCount + num
            } else {
              vueThis.$message({
                message: '任务创建失败！',
                type: 'error'
              })
            }
          })
          .catch(() => {
            vueThis.$message({
              message: '任务创建失败！',
              type: 'error'
            })
          })
        break
      case 'After':
        let afterIndexNo = taskIndexNo + 1 // 分支indexNo
        parentTask = ganttObject.getTask(task.parent)
        // 同级下方插入
        api['planGanttManager.createPlanGanttData']({
          name: '新任务',
          parent: taskId,
          insertNum: num,
          insertType: 'After',
          type: type,
          autoScheduling: parentTask.autoScheduling,
          createPage: vueThis.createPage
        })
          .then(function (res) {
            if (res) {
              createTaskByDatas(ganttObject, res, task.parent, 'After', '新任务', '任务创建成功!', dpObject, afterIndexNo)
              vueThis.taskCount = vueThis.taskCount + num
            } else {
              vueThis.$message({
                message: '任务创建失败！',
                type: 'error'
              })
            }
          })
          .catch(() => {
            vueThis.$message({
              message: '任务创建失败！',
              type: 'error'
            })
          })
        break
      case 'Child':
        parentTask = task
        // 新建下级
        api['planGanttManager.createPlanGanttData']({
          name: '新任务',
          parent: taskId,
          insertNum: num,
          insertType: 'Child',
          type: type,
          autoScheduling: task.autoScheduling,
          createPage: vueThis.createPage
        })
          .then(function (res) {
            if (res) {
              task.$open = true
              createTaskByDatas(ganttObject, res, taskId, 'Child', '新任务', '任务创建成功!', dpObject, null)
              vueThis.taskCount = vueThis.taskCount + num
            }
          })
          .catch(() => {
            vueThis.$message({
              message: '任务创建失败！',
              type: 'error'
            })
          })
        break
    }
  }
}

/**
 * 创建任务
 * @param ganttObject
 * @param datas
 * @param parentId
 * @param indexNo
 * @param taskName
 * @param msg
 * @param dpObject
 */
function createTaskByDatas(ganttObject, datas, parentId, pos, taskName, msg, dpObject, indexNo) {
  dpObject.ignore(function () {
    ganttObject.batchUpdate(function () {
      datas.forEach(function (item) {
        let scheduling = false
        if (item.autoScheduling === '1') {
          scheduling = true
        }
        let task = {
          id: item.id,
          name: taskName !== null ? taskName : item.name,
          progress: item.progress,
          start_date: item.start_date,
          end_date: item.end_date,
          duration: item.duration,
          forecastBeginDate: item.forecastBeginDate,
          forecastEndDate: item.forecastEndDate,
          parent: item.parent,
          status: item.status,
          planInfoId: item.planInfoId,
          monitorPoints: item.monitorPoints,
          owner_id: item.owner_id,
          auto_scheduling: scheduling,
          autoScheduling: item.autoScheduling,
          type: 'task',
          managerStatus: item.managerStatus,
          weatherControl: item.weatherControl,
          createSource: item.createSource,
          indexNo: item.indexNo,
          planType: item.planType,
          $open: true
        }

        switch (pos) {
          case 'Child':
            ganttObject.addTask(task, parentId, item.indexNo)
            // 父任务排程类型为自动时，更新排程
            let parentTask = ganttObject.getTask(parentId)
            if (parentTask.autoScheduling === '1' && parentTask.type === 'task' && ganttObject.getGlobalTaskIndex(parentTask.id) !== 0) {
              parentTask.type = 'project'
              ganttObject.updateTask(parentId)
            }
            break
          case 'paste':
            let parTask = ganttObject.getTask(parentId)
            if (parentId === item.parent) {
              parTask = ganttObject.getTask(parentId)
              ganttObject.addTask(task, parentId, indexNo++)
            } else {
              parTask = ganttObject.getTask(item.parent)
              ganttObject.addTask(task, item.parent, item.indexNo)
            }
            // 父任务排程类型为自动时，更新排程
            if (parTask.autoScheduling === '1' && parTask.type === 'task' && ganttObject.getGlobalTaskIndex(parTask.id) !== 0) {
              parTask.type = 'project'
              ganttObject.updateTask(parTask.id)
            }
            break
          default:
            ganttObject.addTask(task, parentId, indexNo++)
            break
        }
      })
    })
  })
  // 更新父进度
  let vueThis = store.getters.vueThis
  if (progressRefreshCheck(vueThis)) {
    let allParTaskIds = []
    allParTaskIds.push(parentId)
    ganttObject.eachParent(function (t) {
      allParTaskIds.push(t.id)
    }, parentId)
    ganttObject.batchUpdate(function () {
      allParTaskIds.forEach(function (id) {
        if (ganttObject.isTaskExists(id)) {
          let parTask = ganttObject.getTask(id)
          parTask.progress = GanttObject.calculateProgress(parTask, ganttObject)
          ganttObject.updateTask(id)
        }
      })
    })
  }
  ganttObject.refreshData()
  vueThis.$message({
    message: msg,
    type: 'success'
  })
}

/**
 * @Description 任务删除
 * @author fukai
 * @date 2020/5/8 15:33
 */
function removeTasks(ganttObject, dp, ganttName) {
  let selectedTaskIds = []
  let selTaskIds = ganttObject.getSelectedTasks()
  let vueThis = store.getters.vueThis
  selTaskIds.forEach(function (id) {
    if (ganttObject.isTaskExists(id)) {
      let flag = true
      ganttObject.eachParent(function (task) {
        // 排除根节点和父节点也选中的节点
        if (flag && ganttObject.getGlobalTaskIndex(task.id) !== 0 && selTaskIds.indexOf(task.id) !== -1) {
          flag = false
        }
      }, id)
      if (flag && selectedTaskIds.indexOf(id) === -1) {
        selectedTaskIds.push(id)
      }
    }
    // 取消选中
    ganttObject.unselectTask(id)
  })

  // 变更删除时，不删除任务，添加调减图标
  if (ganttName === 'changeGantt') {
    changeGanttRemove(ganttObject, selectedTaskIds, vueThis)
  } else {
    api['planGanttManager.removePlanGanttData']({ taskIds: selectedTaskIds })
      .then(function (res) {
        if (res && res === 'true') {
          let parTaskIds = []
          dp.ignore(function () {
            ganttObject.batchUpdate(function () {
              selectedTaskIds.forEach(function (id) {
                if (ganttObject.isTaskExists(id)) {
                  // 删除任务后，自动父工期变为1天修改
                  let parentTaskId = ganttObject.getTask(id).parent
                  if (parentTaskId && ganttObject.isTaskExists(parentTaskId) && ganttObject.hasChild(parentTaskId)) {
                    let childIds = ganttObject.getChildren(parentTaskId)
                    if (childIds && childIds.length === 1 && ganttObject.getTask(parentTaskId).type === 'project') {
                      ganttObject.getTask(parentTaskId).type = 'task'
                      ganttObject.updateTask(parentTaskId)
                    }
                  }
                  parTaskIds.push(parentTaskId)
                  ganttObject.deleteTask(id)
                }
              })
            })
          })
          // 更新父
          if (parTaskIds && parTaskIds.length > 0) {
            let allParTaskIds = []
            Array.from(new Set(parTaskIds)).forEach(function (item) {
              allParTaskIds.push(item)
              ganttObject.eachParent(function (t) {
                allParTaskIds.push(t.id)
              }, item)
            })
            ganttObject.batchUpdate(function () {
              Array.from(new Set(allParTaskIds)).forEach(function (id) {
                if (ganttObject.isTaskExists(id)) {
                  let parTask = ganttObject.getTask(id)
                  parTask.progress = GanttObject.calculateProgress(parTask, ganttObject)
                  GanttObject.calculateForecastDate(ganttObject, parTask)
                  ganttObject.updateTask(id)
                }
              })
            })
          }
          vueThis.taskCount = ganttObject.getTaskCount()
          vueThis.$message({
            message: '任务删除成功',
            type: 'success'
          })
        } else if (res === 'false') {
          vueThis.$message({
            message: '任务删除失败！',
            type: 'error'
          })
        } else {
          vueThis.$message({
            message: res,
            type: 'warning'
          })
        }
      })
      .catch((err) => {
        console.log(err, 'err')
        vueThis.$message({
          message: '任务删除失败！',
          type: 'error'
        })
      })
  }
}

/**
 * 任务复制
 * @param ganttObject
 * @param tasks
 */
function copyTask(ganttObject, tasks, vueThis) {
  let selectTaskIds = ganttObject.getSelectedTasks()
  let planInfoId = vueThis.planInfoId
  let copyTaskIds = []
  selectTaskIds.forEach(function (taskId) {
    // 向上查父，若父也选中，子不计算在内
    ganttObject.eachParent(function (task) {
      if (selectTaskIds.indexOf(task.id) === -1 && copyTaskIds.indexOf(taskId) === -1) {
        copyTaskIds.push(taskId)
      }
    }, taskId)
  })
  // 获取数据json对象
  if (copyTaskIds !== null && copyTaskIds.length > 0) {
    api['planGanttManager.copyTasks']({ pasteTaskIds: copyTaskIds, planInfoId: planInfoId })
      .then(function (res) {
        if (res) {
          if (res) {
            vueThis.copyTasks = res
          } else {
            vueThis.$message({
              message: '任务复制失败！',
              type: 'error'
            })
          }
        }
      })
      .catch((err) => {
        console.log(err, 'err')
        vueThis.$message({
          message: '任务复制失败！',
          type: 'error'
        })
      })
  }
}

/**
 * 任务粘贴
 * @param ganttObject
 * @param tasks
 */
function pasteTask(ganttObject, tasks, vueThis, type, dpObj) {
  let copyTasks = vueThis.copyTasks
  if (copyTasks != null) {
    let selTask = tasks[0]
    let parentTask = ganttObject.getTask(selTask.parent)
    let selId = selTask.id
    let selIndexNo = ganttObject.getTaskIndex(selId) + 1 // 分支indexNo
    let planInfoId = vueThis.planInfoId
    api['planGanttManager.pasteTasks']({ pasteData: copyTasks, parentId: parentTask.id, selectTaskId: selId, type: type, planInfoId: planInfoId, createPage: vueThis.createPage })
      .then(function (res) {
        if (res) {
          // 刷新样式
          if (res.styles) {
            store.dispatch('setTaskStyles', res.styles)
          }
          // 刷新资源
          if (res.resources) {
            ganttObject.$resourcesStore.parse(res.resources)
          }
          if (res.tasks) {
            createTaskByDatas(ganttObject, res.tasks, parentTask.id, 'paste', null, '任务粘贴成功！', dpObj, selIndexNo)
          }
        } else {
          vueThis.$message({
            message: '任务粘贴失败！',
            type: 'error'
          })
        }
      })
      .catch((err) => {
        console.log(err, 'err')
        vueThis.$message({
          message: '任务粘贴失败！',
          type: 'error'
        })
      })
  }
}

/**
 * 任务样式添加及取消
 * @param {*} thisGantt
 * @param {*} thisDp
 * @param {*} tasks
 * @param {*} btnId
 */
function updateTaskStyle(ganttName, tasks, btn) {
  let ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && btn) {
    let taskStyles = store.getters.taskStyles
    let selTaskStyles = {}
    let planInfoId = ''
    let vueThis = store.getters.vueThis
    tasks.forEach(function (task) {
      let oldTaskStyle = taskStyles[task.id] ? taskStyles[task.id] : ''
      if (planInfoId === '') {
        planInfoId = task.planInfoId
      }
      if (btn.id.startsWith('color-')) {
        // 颜色（只能有一个，设置新颜色时替换原先颜色）
        if (oldTaskStyle && oldTaskStyle.indexOf('color:') !== -1) {
          if (oldTaskStyle && oldTaskStyle.indexOf(btn.style) !== -1) {
            console.log('no-empty>>>>>>>>')
          } else {
            let startIndex = oldTaskStyle.indexOf('color:')
            let endIndex = oldTaskStyle.indexOf('color:') + btn.style.length
            let reg1 = new RegExp(oldTaskStyle.substring(startIndex, endIndex), 'g')
            let reg2 = new RegExp('"', 'g')
            selTaskStyles[task.id] = JSON.stringify(oldTaskStyle).replace(reg1, btn.style).replace(reg2, '')
          }
        } else {
          selTaskStyles[task.id] = oldTaskStyle + btn.style
        }
      } else if (btn.id === 'removeStyle') {
        // 删除样式（删除所有样式）
        if (oldTaskStyle) {
          // 减少数据量
          selTaskStyles[task.id] = ''
        }
      } else {
        // 字体（可以共存）
        if (oldTaskStyle && oldTaskStyle.indexOf(btn.style) !== -1) {
          console.log('no-empty>>>>>>>>')
        } else {
          selTaskStyles[task.id] = oldTaskStyle + btn.style
        }
      }
    })
    if (JSON.stringify(selTaskStyles) !== '{}') {
      api['planGanttManager.updateTaskStyle']({ taskStyles: selTaskStyles, planInfoId: planInfoId })
        .then(function (res) {
          if (res) {
            if (res === 'true') {
              tasks.forEach(function (task) {
                if (selTaskStyles[task.id]) {
                  taskStyles[task.id] = selTaskStyles[task.id]
                } else {
                  delete taskStyles[task.id]
                }
              })
              store.dispatch('setTaskStyles', taskStyles)
              ganttObject.refreshData()
            } else {
              vueThis.$message({
                message: '任务样式修改失败！',
                type: 'error'
              })
            }
          }
        })
        .catch((err) => {
          console.log(err, 'err')
          vueThis.$message({
            message: '任务样式修改失败！',
            type: 'error'
          })
        })
    }
  }
}

/**
 * 排程切换校验
 * @param ganttName
 * @returns {boolean}
 */
function autoSchedulingCheck(ganttName) {
  let result = false
  let ganttObject = GanttObject.getGanttObject(ganttName)
  // 已完成时不可切换
  if (ganttObject && ganttObject.config.readonly) {
    if (ganttObject.config.readonly) {
      result = true
    }
  }
  // 编辑加锁时不可切换
  let vueThis = store.getters.vueThis
  if (vueThis.monitorLockMap && vueThis.monitorLockMap['taskEdit'] === '1') {
    result = true
  }
  return result
}

/**
 * 前台创建任务，不与后台交互
 * @param num
 * @param pos
 * @param ganttName
 */
export function noDpAddTask(num, pos, ganttName) {
  let ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject) {
    let taskId = ganttObject.getSelectedId()
    let task = ganttObject.getTask(taskId)
    let taskIndexNo = ganttObject.getTaskIndex(taskId) // 分支indexNo
    let vueThis = store.getters.vueThis
    let style = changeColor
    let parent = ganttObject.getTask(task.parent)
    switch (pos) {
      case 'Before':
        // 同级上方插入
        noDpCreateTask(ganttObject, num, parent, 'Before', '新任务', taskIndexNo, parent.autoScheduling, vueThis, style)
        break
      case 'After':
        // 同级下方插入
        noDpCreateTask(ganttObject, num, parent, 'After', '新任务', taskIndexNo + 1, parent.autoScheduling, vueThis, style)
        break
      case 'Child':
        // 新建下级--在最后
        noDpCreateTask(ganttObject, num, task, 'Child', '新任务', null, task.autoScheduling, vueThis, style)
        task.$open = true
        vueThis.taskCount = vueThis.taskCount + num
        break
    }
  }
}

/**
 * 任务创建，不与后台交互
 * @param ganttObject
 * @param num
 * @param parent
 * @param pos
 * @param taskName
 * @param indexNo
 * @param autoScheduling
 * @param vueThis
 * @param style
 */
function noDpCreateTask(ganttObject, num, parent, pos, taskName, indexNo, autoScheduling, vueThis, style) {
  let schedule = false
  let formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
  if (autoScheduling === '1') {
    schedule = true
  }
  ganttObject.batchUpdate(function () {
    for (let i = 0; i < num; i++) {
      let task = {
        // id: item.id,
        name: taskName,
        infoType: 'create',
        style: style,
        progress: 0,
        start_date: parent.start_date,
        end_date: parent.end_date,
        duration: parent.duration,
        forecastBeginDate: formatFunc(new Date(parent.start_date)),
        forecastEndDate: formatFunc(ganttObject.date.add(new Date(parent.end_date), -1, 'day')),
        parent: parent.id,
        status: vueThis.createTaskStatus,
        planInfoId: vueThis.planInfoId,
        monitorPoints: '',
        owner_id: '',
        auto_scheduling: schedule,
        autoScheduling: autoScheduling,
        managerStatus: vueThis.managerStatus,
        weatherControl: vueThis.weatherControl,
        createSource: vueThis.createSource,
        type: 'task',
        $open: true
      }

      switch (pos) {
        case 'Child': // 新建子在最后
          ganttObject.addTask(task, parent.id, 99999 + i)
          if (parent.autoScheduling === 1 && parent.type === 'task' && ganttObject.getGlobalTaskIndex(parent.id) !== 0) {
            parent.type = 'project'
          }
          break
        default:
          ganttObject.addTask(task, parent.id, indexNo++)
          break
      }
      // 将自动生成数字id转为字符串
      ganttObject.changeTaskId(task.id, task.id + 's')
      // 添加缓存
      setNewTaskMap(vueThis, task, null, 'task')
    }
  })
}

/**
 * 任务复制，不与后台交互
 * @param thisGantt
 * @param tasks
 * @param vueThis
 */
function noDpCopy(thisGantt, tasks, vueThis) {
  let selectTaskIds = thisGantt.getSelectedTasks()
  let copyTaskIds = []
  vueThis.copyTasks = []
  selectTaskIds.forEach(function (taskId) {
    // 向上查父，若父也选中，子不计算在内
    thisGantt.eachParent(function (task) {
      if (selectTaskIds.indexOf(task.id) === -1 && copyTaskIds.indexOf(taskId) === -1) {
        copyTaskIds.push(taskId)
      }
    }, taskId)
    // 查询所有子
    copyTaskIds.forEach(function (id) {
      vueThis.copyTasks.push(thisGantt.getTask(id))
      thisGantt.eachTask(function (task) {
        vueThis.copyTasks.push(task)
      }, id)
    })
  })
}

/**
 * 任务粘贴，不与后台交互
 * @param ganttObject
 * @param tasks
 * @param vueThis
 */
function noDpPaste(ganttObject, tasks, vueThis) {
  if (vueThis.copyTasks && vueThis.copyTasks.length > 0) {
    let selectTask = tasks[0]
    let parentTasks = ganttObject.getTask(selectTask.parent)
    let selIndexNo = ganttObject.getTaskIndex(selectTask.id) + 1 // 分支indexNo
    let style = changeColor
    let idMap = {}
    ganttObject.batchUpdate(function () {
      vueThis.copyTasks.forEach(function (item) {
        // 添加任务
        let task
        if (idMap && idMap[item.parent]) {
          task = createTask(parentTasks, idMap[item.parent], vueThis, style, item, ganttObject)
          let parTask = ganttObject.getTask(item.parent)
          if (parTask.autoScheduling === '1' && parTask.type === 'task' && ganttObject.getGlobalTaskIndex(parTask.id) !== 0) {
            parTask.type = 'project'
          }
          ganttObject.addTask(task, idMap[item.parent], selIndexNo++)
        } else {
          task = createTask(parentTasks, parentTasks.id, vueThis, style, item, ganttObject)
          let parTask = ganttObject.getTask(selectTask.parent)
          if (parTask.autoScheduling === '1' && parTask.type === 'task' && ganttObject.getGlobalTaskIndex(parTask.id) !== 0) {
            parTask.type = 'project'
          }
          ganttObject.addTask(task, selectTask.parent, selIndexNo++)
        }
        // 将自动生成数字id转为字符串
        ganttObject.changeTaskId(task.id, task.id + 's')
        idMap[item.id] = task.id
        // 存在标识时逻辑处理
        if (task.monitorPoints && task.monitorPoints.split(',').length > 0 && vueThis.monitorPointDatas && vueThis.monitorPointDatas.length > 0) {
          let newM = []
          let monitorPoints = []
          vueThis.monitorPointDatas.forEach(function (item) {
            if (item.controlTimeType && item.controlTimeType === '0') {
              monitorPoints.push(item.monitorId)
            }
          })
          task.monitorPoints.split(',').forEach(function (mId) {
            let m = {
              monitorId: mId,
              taskId: task.id,
              logBeginTime: '',
              logEndTime: ''
            }
            if (monitorPoints && monitorPoints.length > 0 && monitorPoints.indexOf(mId) !== -1) {
              m.logBeginTime = task.start_date
              m.logEndTime = ganttObject.date.add(task.end_date, -1, 'day')
            }
            newM.push(m)
          })
          setNewTaskMap(vueThis, task, newM, 'monitors')
        } else {
          task.monitorPoints = ''
          ganttObject.updateTask(task.id)
        }
        // 添加缓存
        setNewTaskMap(vueThis, task, null, 'task')
      })
    })
  }
}

/**
 * 根据复制任务创建新任务
 * @param parent
 * @param vueThis
 * @param style
 * @param copyTask
 * @param ganttObject
 * @returns {{end_date: *, parent: *, $open: boolean, planType, forecastBeginDate: *, owner_id, monitorPoints, type: string, duration: *, autoScheduling, infoType: string, auto_scheduling: *, name: *, progress: number, style: *, forecastEndDate: *, planInfoId: *, start_date: *, status: string}}
 */
function createTask(parent, parentId, vueThis, style, copyTask, ganttObject) {
  let formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
  let task = {
    name: copyTask.name,
    infoType: 'create',
    style: style,
    progress: 0,
    start_date: parent.start_date,
    end_date: parent.end_date,
    duration: parent.duration,
    forecastBeginDate: formatFunc(new Date(parent.start_date)),
    forecastEndDate: formatFunc(ganttObject.date.add(new Date(parent.end_date), -1, 'day')),
    parent: parentId,
    status: vueThis.createTaskStatus,
    planInfoId: vueThis.planInfoId,
    monitorPoints: copyTask.monitorPoints,
    owner_id: copyTask.owner_id,
    auto_scheduling: parent.auto_scheduling,
    autoScheduling: parent.autoScheduling,
    managerStatus: vueThis.managerStatus,
    weatherControl: vueThis.weatherControl,
    createSource: vueThis.createSource,
    planType: copyTask.planType,
    type: 'task',
    $open: true
  }
  return task
}

/**
 * 发布后可控任务可新建下级，同级
 */
function checkEditTask(ganttName, tasks) {
  let vueThis = store.getters.vueThis
  if (ganttName) {
    let ganttObject = GanttObject.getGanttObject(ganttName)
    let taskIds = ganttObject.getSelectedTasks()
    if (taskIds && taskIds.length === 1 && vueThis.ganttName === 'planGantt') {
      let taskId = taskIds[0]
      let task = ganttObject.getTask(taskId)
      let planStatusLockMap = store.getters.planStatusLockMap
      let taskStatusLockMap = store.getters.taskStatusLockMap
      let planEditStatus = planStatusLockMap[vueThis.planInfoStatus]['ganttEdit']
      let editManagerStatus = taskStatusLockMap[task.status]
      if (planEditStatus && planEditStatus === 'true' && (!task.managerStatus || (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) !== -1))) {
        return true
      }
    }
  }
  return false
}

/**
 * 计划下发校验
 * @param ganttName
 * @param tasks
 */
function checkCanIssue(ganttName, tasks) {
  let result = true
  let vueThis = store.getters.vueThis
  if (checkReadOnly(ganttName)) {
    return false
  }
  if (!tasks || tasks.length === 0 || vueThis.ganttName !== 'planGantt' || vueThis.createPage !== 'compile') {
    return false
  }
  let planStatusLockMap = store.getters.planStatusLockMap
  let planEditStatus = planStatusLockMap[vueThis.planInfoStatus]['refreshProgress'] // 进行中计划才可下发
  if (planEditStatus !== 'true') {
    return false
  }
  let ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id) && result) {
      let task = ganttObject.getTask(id)
      if (task.managerStatus !== vueThis.issueStatus || !task.owner_id) {
        result = false
      }
      if (ganttObject.hasChild(id)) {
        ganttObject.eachTask(function (task) {
          if (task.managerStatus !== vueThis.issueStatus || !task.owner_id) {
            result = false
          }
        }, id)
      }
      if (task.parent) {
        ganttObject.eachParent(function (ptask) {
          if (!ptask.owner_id && ganttObject.getGlobalTaskIndex(ptask.id) !== 0) {
            result = false
          }
        }, id)
      }
    }
  })
  return result
}

/**
 * 计划下发
 */
function issueTask(ganttObject, thisDp) {
  let taskIds = []
  let tasks = []
  let taskMsg = []
  let vueThis = store.getters.vueThis
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id)) {
      let task = ganttObject.getTask(id)
      if (ganttObject.getGlobalTaskIndex(id) !== 0 && task.managerStatus === vueThis.issueStatus && taskIds.indexOf(id) === -1) {
        if (task.weatherNormal) {
          taskMsg.push(task.name)
        } else {
          taskIds.push(id)
          tasks.push(task)
        }
      }
      if (ganttObject.hasChild(id)) {
        ganttObject.eachTask(function (t) {
          if (t.managerStatus === vueThis.issueStatus && taskIds.indexOf(t.id) === -1) {
            if (task.weatherNormal) {
              taskMsg.push(t.name)
            } else {
              taskIds.push(t.id)
              tasks.push(t)
            }
          }
        }, id)
      }
      if (task.parent) {
        ganttObject.eachParent(function (ptask) {
          if (ptask.managerStatus === vueThis.issueStatus && taskIds.indexOf(ptask.id) === -1 && ganttObject.getGlobalTaskIndex(ptask.id) !== 0) {
            if (task.weatherNormal) {
              taskMsg.push(ptask.name)
            } else {
              taskIds.push(ptask.id)
              tasks.push(ptask)
            }
          }
        }, id)
      }
    }
  })

  if (taskMsg.length > 0) {
    vueThis.$message({
      message: '任务名称: 【' + taskMsg.join(',') + '】的排程不正确，请修改计划时间后再下发！',
      type: 'warning'
    })
  } else {
    api['planGanttManager.issuePlanTasks']({ pasteTaskIds: taskIds, planInfoId: vueThis.planInfoId })
      .then(function (res) {
        if (res) {
          thisDp.ignore(function () {
            ganttObject.batchUpdate(function () {
              tasks.forEach(function (task) {
                task.managerStatus = res
                ganttObject.updateTask(task.id)
              })
            })
          })
          vueThis.$message({
            message: '任务下发成功！',
            type: 'success'
          })
        } else {
          vueThis.$message({
            message: '任务下发失败！',
            type: 'error'
          })
        }
      })
      .catch((err) => {
        console.log(err, 'err')
        vueThis.$message({
          message: '任务下发失败！',
          type: 'error'
        })
      })
  }
}

/**
 * 批量设置责任人最小开始时间和最大完成时间数据获取
 * @param ganttName
 */
function batchOwner(ganttName) {
  let startTaskId = ''
  let endTaskId = ''
  let startDate = null
  let endDate = null
  let vueThis = store.getters.vueThis
  let ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id)) {
      let task = ganttObject.getTask(id)
      if (startDate && endDate) {
        if (startDate > task.start_date) {
          startDate = task.start_date
          startTaskId = id
        }
        if (endDate < task.end_date) {
          endDate = task.start_date
          endTaskId = id
        }
      } else {
        startTaskId = id
        endTaskId = id
        startDate = task.start_date
        endDate = task.end_date
      }
    }
  })
  if (startTaskId && endTaskId) {
    vueThis.startTaskId = startTaskId
    vueThis.endTaskId = endTaskId
    vueThis.resourceSelectVisible = true
  }
}

/**
 * 同步计划时间到预计时间
 * @param ganttName
 */
function batchSyncTask(ganttName, allTaskIds) {
  let vueThis = store.getters.vueThis
  let ganttObject = GanttObject.getGanttObject(ganttName)
  let dpObject = GanttObject.getDpObject(ganttName)
  api['planGanttManager.batchSyncTask']({ planInfoId: vueThis.planInfoId, pasteTaskIds: allTaskIds })
    .then(function (res) {
      if (res) {
        if (allTaskIds && allTaskIds.length > 0) {
          let formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
          dpObject.ignore(function () {
            ganttObject.batchUpdate(function () {
              allTaskIds.forEach(function (taskId) {
                let selTask = ganttObject.getTask(taskId)
                selTask.forecastBeginDate = formatFunc(new Date(selTask.start_date))
                selTask.forecastEndDate = formatFunc(ganttObject.date.add(new Date(selTask.end_date), -1, 'day'))
                ganttObject.updateTask(taskId)
              })
            })
          })
        } else {
          // vueThis.batchSyncTaskCallBack()
        }
        vueThis.$message({
          message: '同步成功！',
          type: 'success'
        })
      } else {
        vueThis.$message({
          message: '同步失败！',
          type: 'error'
        })
      }
    })
    .catch((err) => {
      console.log(err, 'err')
      vueThis.$message({
        message: '同步失败！',
        type: 'error'
      })
    })
}

/**
 * 设置责任人校验规则
 *    1.根节点不可设置责任人
 *    2.已完成、提交审批任务不可操作责任人
 *    3.计划发布后可控任务不可操作责任人
 * @param ganttName
 * @returns {boolean}
 */
function batchOwnerCheck(ganttName) {
  let result = true
  let vueThis = store.getters.vueThis
  let planStatusLockMap = store.getters.planStatusLockMap
  let planEditStatus = planStatusLockMap[vueThis.planInfoStatus]['ganttEdit']
  // 已提交完成计划不可操作
  if (planEditStatus !== 'true') {
    return false
  }
  let taskEditMap = store.getters.taskStatusLockMap
  let ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id)) {
      let task = ganttObject.getTask(id)
      let editManagerStatus = taskEditMap[task.status]
      let indexNo = ganttObject.getGlobalTaskIndex(id)
      if (
        indexNo === 0 ||
        (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1 && indexNo !== 0) ||
        (task.readonly && (task.weatherControl === '1' || task.managerStatus === vueThis.issueStatus))
      ) {
        result = false
      }
    }
  })
  return result
}

/**
 * 任务降级校验
 *    1.所选任务中各任务上一个同级节点为已完成、审批中、变更中时，不可降级
 *    2.所选任务包含已完成、审批中、变更中时，不可降级
 *    3.所选任务包含根节点时不可降级
 *    4.所选任务中各任务上一个同级节点存在前后置关系的，不可降级
 *    5.所选任务为已下发，上方同级任务为待下发的，不可降级
 * @param ganttName
 * @returns {boolean}
 */
function canIndentCheck(ganttName) {
  let result = true
  if (ganttName) {
    let ganttObject = GanttObject.getGanttObject(ganttName)
    let selectedTaskIds = []
    let vueThis = store.getters.vueThis
    let selTaskIds = ganttObject.getSelectedTasks()
    // 直接父子同时选中时，只留父
    selTaskIds.forEach(function (id) {
      if (ganttObject.isTaskExists(id)) {
        let selTask = ganttObject.getTask(id)
        if (selTaskIds.indexOf(selTask.parent) === -1) {
          selectedTaskIds.push(id)
        }
      }
    })
    let taskEditMap = store.getters.taskStatusLockMap
    selectedTaskIds.some(function (id) {
      if (ganttObject.isTaskExists(id)) {
        let task = ganttObject.getTask(id)
        let indexNo = ganttObject.getGlobalTaskIndex(id)
        let editManagerStatus = taskEditMap[task.status]
        let preTaskId = ganttObject.getPrevSibling(id)
        // 不为根 && 父存在 && 不为已完成、审批中、变更中
        if (indexNo !== 0 && preTaskId && ganttObject.isTaskExists(preTaskId) && editManagerStatus && editManagerStatus.indexOf(task.managerStatus) !== -1) {
          let preTask = ganttObject.getTask(preTaskId)
          let preIndexNo = ganttObject.getGlobalTaskIndex(preTaskId)
          // 父不为根 || 上一个同级节点为已完成、审批中、变更中 || （子为已下发 && 父为待下发）
          if (
            preIndexNo === 0 ||
            (editManagerStatus && editManagerStatus.indexOf(preTask.managerStatus) === -1) ||
            (task.managerStatus !== preTask.managerStatus && preTask.managerStatus === vueThis.issueStatus)
          ) {
            result = false
            return true
          }
          // 存在前后置关系
          if (result && task.$target && task.$target.length > 0) {
            task.$target.forEach(function (linkId) {
              let link = ganttObject.getLink(linkId)
              if (result && link.source === preTaskId) {
                result = false
              }
            })
          }
          if (result && task.$source && task.$source.length > 0) {
            task.$source.forEach(function (linkId) {
              let link = ganttObject.getLink(linkId)
              if (result && link.target === preTaskId) {
                result = false
              }
            })
          }
          // 存在“生产，齐套，备料”标识
          if (preTask.planType) {
            if (preTask.planType === '3101' || (preTask.planType.indexOf('3103') !== -1 && preTask.planType !== '3103')) {
              result = false
            }
          }
        } else {
          result = false
          return true
        }
        // 子中否包含已完成、审批中、变更中
        // if (result) {
        //   ganttObject.eachTask(function (task) {
        //     let childManagerStatus = taskEditMap[task.status]
        //     let indexNo = ganttObject.getGlobalTaskIndex(task.id)
        //     if (indexNo === 0 || (childManagerStatus && childManagerStatus.indexOf(task.managerStatus) === -1 && indexNo !== 0) || task.readonly) {
        //       result = false
        //     }
        //   }, id)
        // }
      }
    })
  }
  return result
}

/**
 * 升级逻辑校验
 *    1.父为根节点的不可升级
 *    2.所选任务包含根节点时不可操作
 * @param ganttName
 * @param tasks
 * @returns {boolean}
 */
function outdentCheck(ganttName, tasks) {
  let result = true
  if (ganttName) {
    let ganttObject = GanttObject.getGanttObject(ganttName)
    ganttObject.eachSelectedTask(function (taskId) {
      if (ganttObject.isTaskExists(taskId)) {
        let task = ganttObject.getTask(taskId)
        let indexNo = ganttObject.getGlobalTaskIndex(taskId)
        if (indexNo === 0 || !task.parent || (ganttObject.isTaskExists(task.parent) && ganttObject.getGlobalTaskIndex(task.parent) === 0)) {
          result = false
        }
      }
    })
  }
  return result
}

/**
 * 删除操作逻辑校验
 *    1.所选任务或所选任务的子任务包含已完成、变更中时，不可删除
 *    2.所选任务包含根节点时不可删除
 *    3.所选任务或所选任务的子任务含审批中时，可删除，但提示
 *    4.发布后，可控任务不可删除
 * @param ganttName
 * @param tasks
 * @param vueThis
 * @returns {boolean}
 */
function canDeleteCheck(ganttName, tasks, vueThis) {
  let result = true
  // 获取gannt操作限制策略
  let planStatusLockMap = store.getters.planStatusLockMap
  let planEditStatus = planStatusLockMap[vueThis.planInfoStatus]['ganttEdit']
  let controlTaskEdit = planStatusLockMap[vueThis.planInfoStatus]['controlTaskEdit']
  if (planEditStatus === 'false') {
    return false
  } else {
    if (ganttName) {
      let ganttObject = GanttObject.getGanttObject(ganttName)
      let taskEditMap = store.getters.taskStatusLockMap
      let selectedTaskIds = []
      let selTaskIds = ganttObject.getSelectedTasks()
      selTaskIds.forEach(function (id) {
        if (ganttObject.isTaskExists(id)) {
          let flag = true
          ganttObject.eachParent(function (task) {
            // 排除根节点和父节点也选中的节点
            if (flag && ganttObject.getGlobalTaskIndex(task.id) !== 0 && selTaskIds.indexOf(task.id) !== -1) {
              flag = false
            }
          }, id)
          if (flag && selectedTaskIds.indexOf(id) === -1) {
            selectedTaskIds.push(id)
          }
        }
      })
      selectedTaskIds.some(function (selTaskId) {
        let selTask = ganttObject.getTask(selTaskId)
        let editManagerStatus = taskEditMap[selTask.status]
        let indexNo = ganttObject.getGlobalTaskIndex(selTask.id)
        if (!result) {
          return true
        }
        // 发布后可控任务不可删除
        if (controlTaskEdit && controlTaskEdit === 'false' && selTask.weatherControl && selTask.weatherControl === '1') {
          result = false
          return true
        }
        if (indexNo === 0 || (editManagerStatus && editManagerStatus.indexOf(selTask.managerStatus) === -1 && indexNo !== 0)) {
          result = false
          return true
        }
        ganttObject.eachTask(function (task) {
          let chiManagerStatus = taskEditMap[task.status]
          let indexNo = ganttObject.getGlobalTaskIndex(task.id)
          // 发布后可控任务不可删除
          if (controlTaskEdit && controlTaskEdit === 'false' && task.weatherControl && task.weatherControl === '1') {
            result = false
            return true
          }
          if (indexNo === 0 || (chiManagerStatus && chiManagerStatus.indexOf(task.managerStatus) === -1 && indexNo !== 0)) {
            result = false
          }
        }, selTask.id)
      })
    }
  }
  return result
}

/**
 * 检查是否包含审批中任务
 * @param tasks
 */
function checkHasApproveTask(ganttName, tasks) {
  let result = true
  if (ganttName) {
    let ganttObject = GanttObject.getGanttObject(ganttName)
    tasks.some(function (selTask) {
      if (selTask.managerStatus !== '6406') {
        result = false
      }
      ganttObject.eachTask(function (task) {
        if (selTask.managerStatus !== '6406') {
          result = false
        }
      }, selTask.id)
    })
  }
  return result
}

/**
 * 计划排程模式切换
 * @param value
 * @param ganttName
 * @param tasks
 */
function changePlanScheduling(value, ganttName, tasks) {
  let ganttObject = GanttObject.getGanttObject(ganttName)
  let dpObject = GanttObject.getDpObject(ganttName)
  let taskStatusLockMap = store.getters.taskStatusLockMap
  let vueThis = store.getters.vueThis
  let allTaskIds = []
  ganttObject.eachSelectedTask(function (taskId) {
    let selTask = ganttObject.getTask(taskId)
    let selManagerStatus = taskStatusLockMap[selTask.status]
    if (selTask.autoScheduling !== value && ganttObject.getGlobalTaskIndex(taskId) !== 0 && selManagerStatus && selManagerStatus.indexOf(selTask.managerStatus) !== -1) {
      allTaskIds.push(taskId)
      if (ganttObject.hasChild(taskId)) {
        ganttObject.eachTask(function (task) {
          let editManagerStatus = taskStatusLockMap[task.status]
          if (task.autoScheduling !== value && ganttObject.getGlobalTaskIndex(task.id) !== 0 && editManagerStatus && editManagerStatus.indexOf(task.managerStatus) !== -1) {
            allTaskIds.push(task.id)
          }
        }, taskId)
      }
    }
  })
  if (allTaskIds && allTaskIds.length > 0) {
    // 自动切手动
    if (value === '2') {
      api['planGanttManager.changePlanScheduling']({ planInfoId: vueThis.planInfoId, pasteTaskIds: allTaskIds })
        .then(function (res) {
          if (res) {
            dpObject.ignore(function () {
              ganttObject.batchUpdate(function () {
                allTaskIds.forEach(function (taskId) {
                  let selTask = ganttObject.getTask(taskId)
                  selTask.autoScheduling = value
                  selTask.auto_scheduling = false
                  selTask.type = 'task'
                  ganttObject.updateTask(taskId)
                })
              })
            })
            vueThis.$message({
              message: '排程模式设置成功！',
              type: 'success'
            })
          } else {
            vueThis.$message({
              message: '排程模式设置失败！',
              type: 'error'
            })
          }
        })
        .catch((err) => {
          console.log(err, 'err')
          vueThis.$message({
            message: '排程模式设置失败！',
            type: 'error'
          })
        })
    } else {
      // 手动切自动
      ganttObject.batchUpdate(function () {
        allTaskIds.forEach(function (taskId) {
          let selTask = ganttObject.getTask(taskId)
          selTask.autoScheduling = value
          selTask.auto_scheduling = true
          if (ganttObject.hasChild(taskId) && ganttObject.getGlobalTaskIndex(taskId) !== 0) {
            selTask.type = 'project'
          } else {
            selTask.type = 'task'
          }
          updateforecastDate(selTask, ganttObject)
          ganttObject.updateTask(taskId)
        })
      })
      vueThis.$message({
        message: '排程模式设置成功！',
        type: 'success'
      })
    }
  }
}

// 检测任务是否包含（备料/齐套/生产）/设计标识，则无法新建下级
function checkHasProductTask(tasks) {
  let planType = tasks[0] ? tasks[0].planType : ''
  if (planType) {
    if (planType === '3101' || (planType.indexOf('3103') !== -1 && planType !== '3103')) {
      return true
    }
  }
}
// 检测是否为暂停或者禁止
function checkSwitchType(tasks) {
  let switchType = tasks[0] ? tasks[0].switchType : ''
  if (switchType) {
    if (switchType === '9010' || switchType === '9020') {
      return true
    }
  }
}

export { checkContentRoot, checkReadOnly, checkTaskReadonly, batchOwnerCheck }
