import { GanttObject, progressRefreshCheck, updateforecastDate } from './ganttObject'
import moment from 'moment'
import { changeColor, changeGanttRemove, setNewTaskMap } from './changeGantt'
import api from '@/plugins/api'
import store from '@/plugins/store'
import axios from '@/plugins/axios'
import { requestUrl } from '@/utils/common.js'
import isDisable, {
  isNewChild,
  isNewSibling,
  isHasTask,
  isCompile,
  isSuspensionOrProhibition,
  taskStateAndReadonly,
  isWeave,
  isToBeDelivered,
  isHasProductTask,
  isApprovalCompleted,
  isAllowUpgrades,
  isSingleTask,
  isAllowDowngrade,
  isAllowDelete,
  isHasApproveTask,
  noSelfCreate,
  isApprovalReject,
  isReadOnly,
  isNoRoot,
  isHasDeliveredTask,
  isAllowResponsiblePerson,
  isAllowIssue,
  isAllowUndo,
  isHadRootAndReadOnly,
  isAllowPaste,
  isAllowAutoManual,
  isAllowChangeStyle,
  isGridView,
  isGanttView,
  isResourceView,
  isCriticalPath,
  isAllowImport,
  isExperienceImport,
  isDetailInfo,
  isNotStart
} from './isDisable'
export const CommandButtonData = [
  {
    id: 'create-children',
    icon: 'p8 icon-new-subordinate',
    title: '新建下级',
    help: '新建下级',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName === 'changeGantt') {
        noDpAddTask(1, 'Child', ganttName)
      } else {
        addTask(1, 'Child', ganttName)
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isSingleTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isNewChild(ganttName, tasks),
        () => isWeave(ganttName, tasks),
        () => isHasProductTask(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
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
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewChild(ganttName, tasks),
            () => isWeave(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks),
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
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
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewChild(ganttName, tasks),
            () => isWeave(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks),
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
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
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewChild(ganttName, tasks),
            () => isWeave(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks),
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
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
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewChild(ganttName, tasks),
            () => isWeave(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks),
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'createByNum',
        icon: 'p8 icon-new-subordinate',
        createNum: Number,
        title: '其他数量',
        help: '其他数量',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          if (ganttName === 'changeGantt') {
            noDpAddTask(vueThis.createNum, 'Child', ganttName)
          } else {
            addTask(vueThis.createNum, 'Child', ganttName)
          }
          vueThis.menuVisible = false
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewChild(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      }
    ]
  },
  {
    id: 'create-equative',
    icon: 'p8 icon-new-sibling',
    title: '新建同级',
    help: '新建同级',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName === 'changeGantt') {
        noDpAddTask(1, 'Before', ganttName)
      } else {
        // addTask(1, 'Before', ganttName)
        addTask(1, 'After', ganttName)
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isSingleTask(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isHadRootAndReadOnly(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isNewSibling(ganttName, tasks),
        // () => taskStateAndReadonly(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    },
    children: [
      {
        id: 'create-equative-two',
        icon: 'p8 icon-new-sibling',
        title: '2 条',
        help: '新建2条',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(2, 'Before', ganttName)
          } else {
            // addTask(2, 'Before', ganttName)
            addTask(2, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isHadRootAndReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewSibling(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'create-equative-four',
        icon: 'p8 icon-new-sibling',
        title: '4 条',
        help: '新建4条',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(4, 'Before', ganttName)
          } else {
            // addTask(4, 'Before', ganttName)
            addTask(4, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isHadRootAndReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewSibling(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'create-equative-six',
        icon: 'p8 icon-new-sibling',
        title: '6 条',
        help: '新建6条',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(6, 'Before', ganttName)
          } else {
            // addTask(6, 'Before', ganttName)
            addTask(6, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isHadRootAndReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewSibling(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'create-equative-eight',
        icon: 'p8 icon-new-sibling',
        title: '8 条',
        help: '新建8条',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          if (ganttName === 'changeGantt') {
            noDpAddTask(8, 'Before', ganttName)
          } else {
            // addTask(8, 'Before', ganttName)
            addTask(8, 'After', ganttName)
          }
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isSingleTask(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isHadRootAndReadOnly(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isNewSibling(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      }
    ]
  },
  {
    id: 'product-message',
    icon: 'p8 icon-trial-production',
    title: '添加生产信息',
    help: '添加生产信息',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.selectTaskId = tasks[0].id
      vueThis.productTaskEditVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => taskStateAndReadonly(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'outdent-task',
    icon: 'p8 icon-upgrade',
    title: '升级',
    help: '升级',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      thisGantt.performAction('outdentAction', thisGantt)
      const vueThis = store.getters.vueThis
      vueThis.selectMultipleTasks(tasks)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isApprovalCompleted(ganttName, tasks),
        () => isAllowUpgrades(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  // {
  //   id: 'task-sync',
  //   icon: 'p8 icon-refresh',
  //   title: '单条同步',
  //   help: '单条同步',
  //   clickFun: function (btn, ganttName, tasks) {
  //     const allTaskIds = []
  //     tasks.forEach(function (task) {
  //       allTaskIds.push(task.id)
  //     })
  //     batchSyncTask(ganttName, allTaskIds)
  //   },
  //   isDisableFun: function (btn, ganttName, tasks) {
  //     let result
  //     if (checkSwitchType(tasks)) {
  //       return true
  //     }
  //     if (tasks && tasks.length === 1) {
  //       result = false
  //     } else {
  //       result = true
  //     }
  //
  //     return result
  //   }
  // },
  {
    id: 'product-message-sync',
    icon: 'p8 icon-refresh',
    title: '添加生产信息',
    help: '添加生产信息',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      // let vueThis = store.getters.vueThis
      // todo 创建菜单
      const vueThis = store.getters.vueThis
      vueThis.selectTaskDate = tasks[0]
      vueThis.productTaskSaveVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isSingleTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'indent-task',
    icon: 'p8 icon-downgrade',
    title: '降级',
    help: '降级',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      thisGantt.performAction('indentAction', thisGantt)
      const vueThis = store.getters.vueThis
      vueThis.selectMultipleTasks(tasks)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowDowngrade(ganttName, tasks),
        () => isToBeDelivered(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'remove-tasks',
    icon: 'p8 icon-delete',
    title: '删除',
    help: '删除',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      if (ganttName === 'changeGantt') {
        if (tasks[0].infoType === 'create') {
          vueThis.delSaveChange(tasks)
          const thisGantt = GanttObject.getGanttObject(ganttName)
          const thisDp = GanttObject.getDpObject(ganttName)
          removeTasks(thisGantt, thisDp, ganttName)
        } else {
          vueThis.delSaveChange(tasks)
        }
      } else {
        const thisDp = GanttObject.getDpObject(ganttName)
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
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowDelete(ganttName, tasks),
        () => isHasApproveTask(ganttName, tasks),
        () => noSelfCreate(ganttName, tasks),
        () => isApprovalReject(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'product-task',
    icon: 'p8 icon-clear-non-production-tasks',
    title: '清空非生产任务数量',
    help: '清空非生产任务数量',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      const thisGantt = GanttObject.getGanttObject(ganttName)
      vueThis.planTypeDatas = thisGantt.serverList(thisGantt.config.plan_type)
      vueThis.ganttName = ganttName
      vueThis.productTaskVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isReadOnly(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'hierarchy-filter',
    type: 'select',
    userDefault: 'false',
    title: '层级',
    help: '层级',
    msg: '',
    clickFun: function (value, ganttName) {
      if (ganttName) {
        const ganttObject = GanttObject.getGanttObject(ganttName)
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
      const checks = [
        () => isSuspensionOrProhibition(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'plan-scheduling',
    type: 'select',
    userDefault: 'true',
    title: '排程模式设置',
    help: '排程模式设置',
    msg: '',
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
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isNoRoot(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'batch-owner',
    icon: 'p8 icon-person-manage',
    title: '批量设置责任人',
    help: '批量设置责任人',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.selectTaskOwnerId = tasks[0].owner_id
      batchOwner(ganttName)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isReadOnly(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowResponsiblePerson(ganttName, tasks),
        () => isHasDeliveredTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  // {
  //   id: 'batch-lock',
  //   icon: 'p8 icon-modify-password',
  //   title: '批量设置任务密级',
  //   help: '批量设置任务密级',
  //   clickFun: function (btn, ganttName, tasks) {
  //     const vueThis = store.getters.vueThis
  // 批量修改任务密级，若包含已下发的不能下发的限制逻辑,暂时注释
  // const result = tasks.some(item => item.managerStatus === '6404')
  // if (result) {
  //   vueThis.$message({
  //     message: '包含已下发状态的任务,不能设置密级',
  //     type: 'warning'
  //   })
  // } else {
  // }
  // batchLock(ganttName)
  // },
  //   isDisableFun: function (btn, ganttName, tasks) {
  //     let result = false
  //     if (checkSwitchType(tasks)) {
  //       return true
  //     }
  //     if (checkReadOnly(ganttName)) {
  //       result = true
  //     }
  //     return result
  //   }
  // },
  {
    id: 'batch-sync',
    icon: 'p8 icon-refresh',
    title: '全部同步',
    help: '全部同步',
    clickFun: function (btn, ganttName, tasks) {
      batchSyncTask(ganttName, [])
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'out-put-view',
    icon: 'p8 icon-view-output',
    title: '查看输出物',
    help: '查看输出物',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      const thisGantt = GanttObject.getGanttObject(ganttName)
      vueThis.planTypeDatas = thisGantt.serverList(thisGantt.config.plan_type)
      vueThis.ganttName = ganttName
      vueThis.outPutViewVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'issue-tasks',
    icon: 'p8 icon-task-distribute',
    title: '任务下发',
    help: '任务下发',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const thisDp = GanttObject.getDpObject(ganttName)
      if (thisGantt && thisDp) {
        thisGantt.confirm({
          text: '下发已选择的任务，包含这些任务的各级子任务和父任务将同时下发，是否继续?',
          ok: '确认',
          cancel: '取消',
          callback: function (result) {
            if (result) {
              issueTask(thisGantt, thisDp, tasks, ganttName)
            }
          }
        })
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isReadOnly(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowIssue(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable

    }
  },
  {
    id: 'issue-message',
    icon: 'p8 icon-issuance-notice',
    title: '通知下发',
    help: '通知下发',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.noticeShow()
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isCompile(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'demand-management',
    icon: 'p8 icon-task-distribute',
    title: '关联',
    help: '关联',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {

      const vueThis = store.getters.vueThis
      vueThis.relevanceOpen()
      const thisGantt = GanttObject.getGanttObject(ganttName)
      vueThis.taskList = thisGantt.serialize().data
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'undo-tasks',
    icon: 'p8 icon-revoke',
    title: '撤销',
    help: '撤销',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      if (thisGantt) {
        thisGantt.undo()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isAllowUndo(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'redo-tasks',
    icon: 'p8 icon-redo',
    title: '重做',
    help: '重做',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      if (thisGantt) {
        thisGantt.redo()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowUndo(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'copy-tasks',
    icon: 'p8 icon-copy',
    title: '复制',
    help: '复制',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      if (ganttName === 'changeGantt') {
        noDpCopy(thisGantt, tasks, vueThis)
      } else {
        const thisDp = GanttObject.getDpObject(ganttName)
        if (thisGantt && thisDp) {
          copyTask(thisGantt, tasks, vueThis)
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isHadRootAndReadOnly(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'paste-tasks',
    icon: 'p8 icon-paste',
    title: '粘贴',
    help: '粘贴',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      if (ganttName === 'changeGantt') {
        noDpPaste(thisGantt, tasks, vueThis)
      } else {
        const thisDp = GanttObject.getDpObject(ganttName)
        if (thisGantt && thisDp) {
          pasteTask(thisGantt, tasks, vueThis, 'only', thisDp)
        }
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowPaste(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSingleTask(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'plan-scheduling',
    icon: 'p8 icon-front-and-rear',
    title: '自动/手动排程',
    help: '自动/手动排程',
    msg: '',
    clickFun: function (btn, ganttName, tasks) { },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowAutoManual(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'color-red',
    icon: '#ff0000', // 页面显示style样式
    title: '红色',
    style: 'color:#ff0000;', // css样式
    help: '红色',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'color-blue',
    icon: '#00B0F0', // 页面显示style样式
    title: '蓝色',
    style: 'color:#00B0F0;', // css样式
    help: '蓝色',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'color-green',
    icon: '#00B050', // 页面显示style样式
    title: '绿色',
    style: 'color:#00B050;', // css样式
    help: '绿色',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'color-purple',
    icon: '#FFC000', // 页面显示style样式
    title: '橙色',
    style: 'color:#FFC000;', // css样式
    help: '橙色',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'font-bold',
    icon: 'p8 icon-B',
    title: '加粗',
    style: 'font-weight:bold;', // css样式
    help: '加粗',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'font-italic',
    icon: 'p8 icon-italic',
    title: '斜体',
    style: 'font-style:italic;', // css样式
    help: '斜体',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'font-underline',
    icon: 'p8 icon-underline',
    title: '下划线',
    style: 'text-decoration:underline;', // css样式
    help: '下划线',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'font-lineThrough',
    icon: 'p8 icon-shanchuxian',
    title: '删除线',
    style: 'text-decoration: line-through;', // css样式
    help: '删除线',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'removeStyle',
    icon: 'p8 icon-cancel-format',
    title: '取消样式',
    help: '取消样式',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      updateTaskStyle(ganttName, tasks, btn)
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isHasTask(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowChangeStyle(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'plan-edit-gantt',
    icon: 'p8 icon-edit-view',
    title: '编辑视图',
    help: '编辑视图',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
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
      const checks = [
        () => isGridView(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'plan-gantt',
    icon: 'p8 icon-gantt',
    title: 'gantt图',
    help: 'gantt图',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      vueThis.ganttBtnType = "ganttBtn"
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
      const checks = [
        () => isGanttView(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'plan-gantt-resource',
    icon: 'p8 icon-resource-view',
    title: '资源视图',
    help: '资源视图',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      vueThis.ganttBtnType = "ziyuanBtn"
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
      const checks = [
        () => isResourceView(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'full-screen',
    icon: 'p8 icon-full-screen',
    title: '全屏',
    help: '全屏',
    msg: '全屏',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      if(ganttName === 'taskStatisticsGantt'){
        vueThis.fullscreen(btn)
      }else{
        const thisGantt = GanttObject.getGanttObject(ganttName)
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
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      if (thisGantt) {
        thisGantt.templates.task_class = function (start, end, task) {
          if (!task.parent) {
            if (vueThis.ganttBtnType == 'ganttBtn') {
              return 'gantt_task_style'
            } else {
              return 'ziyuan_task_style'
            }
          }
        };
        if (thisGantt.config.highlight_critical_path) {
          thisGantt.config.highlight_critical_path = false
        } else {
          thisGantt.config.highlight_critical_path = true
        }
        thisGantt.render()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCriticalPath(ganttName, tasks),
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'excel-import',
    icon: 'p8 icon-excel-import',
    title: 'Excel导入',
    help: 'Excel导入',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      // vueThis.excelSecretGrade = tasks[0].secretGrade
      // vueThis.excelSecretGradeDisplay = tasks[0].secretGradeDisplay
      vueThis.importExcel = true
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const colums = thisGantt.getGridColumns()
      let columnConfigs = colums.map(item => {
        let columObj = {}
        if (item.editor) {
          // 创建一个虚拟的DOM元素
          let tempElement = document.createElement('div');
          tempElement.innerHTML = item.label;

          // 获取包含计划开始时间的元素
          let startTimeElement = tempElement.querySelector('.gantt_search');

          // 提取计划开始时间文本内容
          let startTime = startTimeElement.textContent.trim();

          // 输出提取的计划开始时间
          columObj.title = startTime
          columObj.dataIndex = item.name
        }
        return columObj
      })
      let columnFilter = []
      columnConfigs.forEach(function (element) {
        if (element.title && element.dataIndex) {
          columnFilter.push(element)
        }
      });
      vueThis.columnConfigs = columnFilter
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowImport(ganttName, tasks),
        () => isHasProductTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'project-import',
    icon: 'p8 icon-project-import',
    title: 'Project导入',
    help: 'Project导入',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      // vueThis.projectSecretGrade = tasks[0].secretGrade
      // vueThis.projectSecretGradeDisplay = tasks[0].secretGradeDisplay
      vueThis.importProject = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowImport(ganttName, tasks),
        () => isHasProductTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'excel-export',
    icon: 'p8 icon-excel-export',
    title: 'Excel导出',
    help: 'Excel导出',
    msg: 'Excel导出',
    clickFun: function (btn, ganttName, tasks, data, messages) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      // taskId如何获得？？
      const taskId = vueThis.taskId
      const planInfoId = vueThis.planInfoId
      const colums = thisGantt.getGridColumns()
      let columnConfigs = colums.map(item => {
        let columObj = {}
        if (item.editor) {
          // 创建一个虚拟的DOM元素
          let tempElement = document.createElement('div');
          tempElement.innerHTML = item.label;

          // 获取包含计划开始时间的元素
          let startTimeElement = tempElement.querySelector('.gantt_search');

          // 提取计划开始时间文本内容
          let startTime = startTimeElement.textContent.trim();

          // 输出提取的计划开始时间
          columObj.title = startTime
          columObj.dataIndex = item.name
        }
        return columObj
      })
      let filteredTasks = []
      thisGantt.eachTask((task) => {
        if (thisGantt.isTaskVisible(task.id)) {
          filteredTasks.push(task.id);
        }
      });
      //所有列的列名
      let columnList = colums.map(item => {
        let columObj = {}
        // 创建一个虚拟的DOM元素
        let tempElement = document.createElement('div');
        tempElement.innerHTML = item.label;

        // 获取包含计划开始时间的元素
        let startTimeElement = tempElement.querySelector('.gantt_search');

        // 提取计划开始时间文本内容
        let startTime = startTimeElement.textContent.trim();

        // 输出提取的计划开始时间
        columObj.title = startTime
        columObj.dataIndex = item.name
        return columObj
      })
      let columnFilter = []
      columnConfigs.forEach(function (element) {
        if (element.title && element.dataIndex) {
          columnFilter.push(element)
        }
      });
      let exportConfig = {
        columnConfigs: columnFilter,
        columnList: columnList,
        fileName: "计划管理",
        planInfoId: planInfoId,
        createPage: vueThis.createPage,
        taskId: vueThis.taskId,
        taskIdList: filteredTasks
      }
      api['planGanttManager.excelExport'](exportConfig, { responseType: 'blob' })
        .then((data) => {
          const date = new Date()
          // eslint-disable-next-line camelcase
          const file_name = `【计划编制数据导出】${vueThis.thirdMenuParam.NAME}-${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}_${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}m${String(date.getSeconds()).padStart(2, '0')}s`;
          // eslint-disable-next-line camelcase
          const file_type = 'xls'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
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
    msg: 'Project导出',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      const taskId = vueThis.taskId
      const planInfoId = vueThis.planInfoId

      api['planGanttManager.excelProject']({ planInfoId: planInfoId, dicType: 'ACTIVITY_TYPE', taskId: taskId }, { responseType: 'blob' })
        .then((data) => {
          const date = new Date()
          // eslint-disable-next-line camelcase
          const file_name = `【计划编制数据导出】${vueThis.thirdMenuParam.NAME}-${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}_${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}m${String(date.getSeconds()).padStart(2, '0')}s`;
          // eslint-disable-next-line camelcase
          const file_type = 'xml'
          const blob = new Blob([data.data], { type: 'application/octet-stream' })
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
    icon: 'p8 icon-SDM-xian',
    title: 'SDM批量推送',
    help: 'SDM批量推送',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      api['planGanttManager.async']({ planInfoId: tasks[0].planInfoId }).then((res) => {
        let erro = []
        let success = []
        let message = ''
        if (res) {
          res.forEach((item) => {
            if (item.CODE === '推送失败') {
              erro.push(item)
            }
            if (item.CODE === '推送成功') {
              success.push(item)
            }
          })
          vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
        }
        message = '推送成功：' + success.length + '条，' + '推送失败：' + erro.length + '条'
        thisGantt.unselectTask(tasks[0].id)
        if (res) {
          vueThis.$message({
            message: message,
            type: 'success'
          })
        }
        erro = []
        success = []
        message = ''
      })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowImport(ganttName, tasks),
        () => isHasProductTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'erp-many-pull',
    icon: 'p8 icon-ERP-xian',
    title: 'ERP批量推送',
    help: 'ERP批量推送',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      // let flag = true
      // tasks.forEach(el => {
      //   if (!el.qualityRequirement && el.parentId != null && el.parentId != '') {
      //     flag = false
      //     return flag
      //   }
      // })
      const checkQualityRequirement = tasks.every((item) => item.qualityRequirement && item.parent)
      const checkPosid = tasks.every((item) => item.posid && item.parent)
      const checkCompleteNum = tasks.every((item) => item.completeQuantity && item.parent)
      if (checkQualityRequirement && checkPosid && checkCompleteNum) {
        const ids = tasks.map((item) => item.id)
        api['planGanttManager.pushErpData']({ taskIdList: ids }).then((res) => {
          // let erro = []
          // let success = []
          // let message = ''
          if (res) {
            vueThis.$message({
              message: res,
              type: 'info'
            })
            vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
          }
          // else {
          //   vueThis.$message({
          //     message: '推送失败',
          //     type: 'error'
          //   })
          //   vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
          // }
        })
      } else {
        vueThis.$message({
          message: '质量要求、课题号、完成数量不能为空',
          type: 'error'
        })
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      let flag = false
      // let arr = []
      tasks.forEach((res) => {
        if (res.pushStatusNew === 'S') {
          flag = true
        }
      })
      if (flag) {
        return flag
      }

      if (checkSwitchType(tasks)) {
        return true
      }
      if (tasks.length === 0) {
        return true
      }
      if (vueThis.createPage === 'decompose') {
        return true
      }
      return false
    }
  },
  {
    id: 'erp-single-pull',
    icon: 'p8 icon-ERP-mian',
    title: 'ERP单条推送',
    help: 'ERP单条推送',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      if (tasks[0].qualityRequirement && tasks[0].completeQuantity && tasks[0].posid) {
        if (tasks.length === 1) {
          api['planGanttManager.pushErpData']({ taskIdList: [tasks[0].id] }).then((res) => {
            if (res) {
              vueThis.$message({
                message: res,
                type: 'info'
              })
              vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
            }
            // else {
            //   vueThis.$message({
            //     message: '推送失败',
            //     type: 'error'
            //   })
            //   vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
            // }
            // thisGantt.unselectTask(tasks[0].id)
          })
        } else {
          vueThis.$message({
            message: '请选择一条ERP计划类型的任务进行ERP推送！',
            type: 'warning'
          })
        }
      } else {
        vueThis.$message({
          message: '质量要求、课题号、完成数量不能为空',
          type: 'error'
        })
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      if (tasks[0].pushStatusNew === 'S') {
        return true
      }
      if (tasks.length === 1 && tasks[0].pushStatusContent) {
        btn.help = tasks[0].pushStatusContent
        btn.title = tasks[0].pushStatusContent
      }
      if (checkSwitchType(tasks)) {
        return true
      }
      if (vueThis.createPage === 'decompose') {
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
    clickFun: function (btn, ganttName, tasks) { },
    isDisableFun: function (btn, ganttName, tasks) {
      if (checkSwitchType(tasks)) {
        return true
      }
      return false
    }
  },
  {
    id: 'master-pull',
    icon: 'p8 icon-SDM-mian',
    title: 'SDM单条推送',
    help: 'SDM单条推送',
    clickFun: function (btn, ganttName, tasks) {
      const thisGantt = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      if (tasks.length === 1 && tasks[0].planType === '3112') {
        api['planGanttManager.async']({ taskId: tasks[0].id }).then((res) => {
          const message = '推送状态：' + res[0].CODE + '，信息：' + res[0].message
          if (res[0].CODE === '推送成功') {
            vueThis.$message({
              message: message,
              type: 'success'
            })
            vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
          } else {
            vueThis.$message({
              message: message,
              type: 'error'
            })
            vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
          }
          thisGantt.unselectTask(tasks[0].id)
        })
      } else {
        vueThis.$message({
          message: '请选择一条SDM计划类型的任务进行SDM推送！',
          type: 'warning'
        })
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      if (tasks[0].managerStatus === '6404') {
        return false
      }
      if (tasks[0].managerStatus !== '6404') {
        return true
      }
      if (tasks.length === 1 && tasks[0].pushStatusContent) {
        btn.help = tasks[0].pushStatusContent
        btn.title = tasks[0].pushStatusContent
      } else {
        btn.help = 'SDM单条推送'
        btn.title = 'SDM单条推送'
      }
      if (checkSwitchType(tasks)) {
        return true
      }
      if (vueThis.createPage === 'decompose') {
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
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      // vueThis.activitySecretGradeDisplay = tasks[0].secretGradeDisplay
      vueThis.activityImportType = 'children'
      vueThis.activityImportVisible = true
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks),
        () => isAllowImport(ganttName, tasks),
        () => isHasProductTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    },
    children: [
      {
        id: 'activity-import-children',
        icon: 'p8 icon-knowledge-base-import',
        title: '导入下级',
        help: '导入下级',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          vueThis.activityImportType = 'children'
          vueThis.activityImportVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          // 确保二级菜单跟一级菜单的disable状态一致
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isAllowImport(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'activity-import-before',
        icon: 'p8 icon-knowledge-base-import',
        title: '导入同级',
        help: '导入同级',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          vueThis.activityImportType = 'before'
          vueThis.activityImportVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          // 确保二级菜单跟一级菜单的disable状态一致
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isNoRoot(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isAllowImport(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      }
    ]
  },
  {
    id: 'my-experience',
    icon: 'p8 icon-my-experience-base',
    title: '我的经验库',
    help: '我的经验库',
    msg: '',
    clickFun: function (btn, ganttName, tasks) {
      // const vueThis = store.getters.vueThis
      // vueThis.myExperienceType = 'children'
      // vueThis.experienceLibrarySecretGradeDisplay = tasks[0].secretGradeDisplay
      // vueThis.myExperienceVisible = true
      // vueThis.queryParam.planId = vueThis.planInfoId
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isReadOnly(ganttName, tasks),
        () => isCompile(ganttName, tasks),
        () => isSuspensionOrProhibition(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    },
    children: [
      {
        id: 'my-experience-add',
        icon: 'p8 icon-add',
        title: '创建',
        help: '创建',
        msg: '创建',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          vueThis.createVisible = true
          // vueThis.myExperienceType = 'children'
          // vueThis.experienceLibrarySecretGradeDisplay = tasks[0].secretGradeDisplay
          // vueThis.myExperienceVisible = true
          // vueThis.queryParam.planId = vueThis.planInfoId
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isReadOnly(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            // () => isHasTask(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'my-experience-import-brother',
        icon: 'p8 icon-new-sibling',
        title: '导入同级',
        help: '导入同级',
        msg: '导入同级',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          vueThis.experienceBaseVisible = true
          vueThis.exportExperienceType = 'after'
          // vueThis.myExperienceType = 'children'
          // vueThis.experienceSecretGradeDisplay = tasks[0].secretGradeDisplay
          // vueThis.myExperienceImportVisible = true
          // vueThis.queryParam.planId = vueThis.planInfoId
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isReadOnly(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isHasTask(ganttName, tasks),
            () => isNoRoot(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isAllowImport(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks),
            () => isExperienceImport(ganttName, tasks),
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'my-experience-import-child',
        icon: 'p8 icon-new-subordinate',
        title: '导入下级',
        help: '导入下级',
        msg: '',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          vueThis.experienceBaseVisible = true
          vueThis.exportExperienceType = 'children'
          // vueThis.queryParam.planId = vueThis.planInfoId
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isHasTask(ganttName, tasks),
            () => isReadOnly(ganttName, tasks),
            () => isCompile(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks),
            () => isAllowImport(ganttName, tasks),
            () => isHasProductTask(ganttName, tasks),
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      },
      {
        id: 'my-experience-manage',
        icon: 'p8 icon-edit-view',
        title: '管理',
        help: '管理',
        msg: '管理',
        clickFun: function (btn, ganttName, tasks) {
          const vueThis = store.getters.vueThis
          vueThis.isManage = true
          vueThis.experienceBaseVisible = true
        },
        isDisableFun: function (btn, ganttName, tasks) {
          const checks = [
            () => isCompile(ganttName, tasks),
            () => isSuspensionOrProhibition(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      }
    ]
  },
  {
    id: 'create-version',
    icon: 'p8 icon-create-version',
    title: '创建版本',
    help: '创建版本',
    msg: '创建版本',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.createPlanVersion()
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'version-compare',
    icon: 'p8 icon-contrast',
    title: '比较',
    help: '比较',
    msg: '比较',
    clickFun: function (btn, ganttName, tasks) { },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'version-list',
    icon: 'p8 icon-version-list',
    title: '版本列表',
    help: '版本列表',
    msg: '版本列表',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.versionListVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isCompile(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'grid-setting',
    icon: 'p8 icon-version-list',
    title: '列设置',
    help: '列设置',
    msg: '列设置',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const ganttObject = GanttObject.getGanttObject(ganttName)
        const vueThis = store.getters.vueThis
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
    id: 'grid-cell-border-setting',
    icon: 'p8 icon-gridding',
    title: '添加/取消网格',
    help: '添加/取消网格',
    msg: '添加/取消网格',
    clickFun: function (btn, ganttName, tasks) {
      const updateData =
        store.getters.userSettingAll.PlanStyleClass && store.getters.userSettingAll.PlanStyleClass.length
          ? store.getters.userSettingAll.PlanStyleClass.find((i) => {
            return i.key === 'grid-cell-border'
          })
          : null
      const updataParams = {
        description: '计划编制: 缩放/列设置 / 添加/取消网格配置',
        type: 'PlanStyleClass',
        saveApi: '/framework/user/setting/save',
        id: (updateData && updateData.id) || '',
        key: 'grid-cell-border',
        value: JSON.stringify({
          type: 'PlanStyleClass',
          value: updateData && updateData.value.value === 'grid-cell-border-add' ? 'grid-cell-border-remove' : 'grid-cell-border-add'
        })
      }
      const url = requestUrl(updataParams.saveApi)
      axios
        .post(url, [updataParams], {
          headers: { Authorization: store.getters.token }
        })
        .then((res) => {
          const planGanttConfig =
            res.PlanStyleClass && res.PlanStyleClass.length
              ? res.PlanStyleClass.find((i) => {
                return i.key === 'grid-cell-border'
              })
              : null
          const ganttObject = GanttObject.getGanttObject(ganttName)
          let rootClass = ganttObject.$root.getAttribute('class')
          if (planGanttConfig && planGanttConfig.value.value) {
            if (rootClass) {
              rootClass = rootClass.replace(/(grid-cell-border-add|grid-cell-border-remove)/g, planGanttConfig.value.value)
            } else {
              rootClass = planGanttConfig.value.value
            }

            ganttObject.$root.setAttribute('class', rootClass)
          }
          // 更新vuex
          store.dispatch('SET_SETTING_ALL', res)
        })
        .catch((err) => {
          console.error('user.setting.save--err', err)
        })
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
    msg: '团队成员编辑',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.ganttGroupSetting = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isSuspensionOrProhibition(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'search-list',
    icon: 'p8 icon-sousuo',
    title: '查询',
    help: '查询',
    msg: '查询',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.searchType = true
        vueThis.ganttSearchVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'reset-list',
    icon: 'p8 icon-zhongzhi1',
    title: '重置',
    help: '重置',
    msg: '重置',
    clickFun: function (btn, ganttName, tasks) {
      const ganttObject = GanttObject.getGanttObject(ganttName)
      const vueThis = store.getters.vueThis
      if (JSON.stringify(vueThis.searchForm) !== '{}') {
        vueThis.searchForm = {}
        ganttObject.refreshData()
      }
      ganttObject.scrollTo(0, 0)
      ganttObject.render()
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'location-list',
    icon: 'p8 icon-dingwei',
    title: '定位',
    help: '定位',
    msg: '定位',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.searchForm = {}
        vueThis.loadGanttData(vueThis.planInfoId,true)
        vueThis.$emit('open', vueThis.myGantt)
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'statistic-list',
    icon: 'p8 icon-shujushitu',
    title: '统计信息',
    help: '统计信息',
    msg: '统计信息',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.ganttStatisticVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'menu-config',
    icon: 'p8 icon-menu-config',
    title: '菜单配置',
    help: '菜单配置',
    msg: '菜单配置',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.rightMenuConfigVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) { }
  },
  {
    id: 'detail-info',
    icon: 'p8 icon-task-details',
    title: '详细信息',
    help: '详细信息',
    msg: '详细信息',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.showDetail('view')
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isDetailInfo(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'change-history',
    icon: 'p8 icon-rizhiliebiao',
    title: '变更历史',
    help: '变更历史',
    msg: '变更历史',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.showChangeHistory()
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'examine-history',
    icon: 'p8 icon-daxingshiyanpingshen',
    title: '审批历史',
    help: '审批历史',
    msg: '审批历史',
    clickFun: function (btn, ganttName, tasks) {
      if (ganttName) {
        const vueThis = store.getters.vueThis
        vueThis.examineHistoryVisible = true
      }
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isHasTask(ganttName, tasks),
        () => isSingleTask(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    }
  },
  {
    id: 'suspend-config',
    icon: 'p8 icon-pause',
    title: '暂停',
    help: '暂停',
    msg: '暂停',
    clickFun: function (btn, ganttName, tasks) {
      const ids = []
      tasks.forEach(function (task) {
        ids.push(task.id)
      })
      const vueThis = store.getters.vueThis
      api['planGanttManager.changeSwitchType']({
        pasteTaskIds: ids,
        type: '9010'
      })
        .then(function (res) {
          const ganttObject = GanttObject.getGanttObject(ganttName)
          ids.forEach(function (id) {
            const selTask = ganttObject.getTask(id)
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
      const checks = [
        () => isNotStart(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    },
    children: [
      {
        id: 'unSuspend-config',
        icon: 'p8 icon-cancel-task-type',
        title: '解除暂停',
        help: '解除暂停',
        msg: '解除暂停',
        clickFun: function (btn, ganttName, tasks) {
          const ids = []
          tasks.forEach(function (task) {
            ids.push(task.id)
          })
          const vueThis = store.getters.vueThis
          api['planGanttManager.changeSwitchType']({
            pasteTaskIds: ids,
            type: '9000'
          })
            .then(function (res) {
              const ganttObject = GanttObject.getGanttObject(ganttName)
              ids.forEach(function (id) {
                const selTask = ganttObject.getTask(id)
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
          const checks = [
            () => isNotStart(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      }
    ]
  },
  {
    id:'expand-all',
    icon:'icon-zhankai p8',
    title:'全部展开',
    help:'全部展开',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.expandAll()
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id:'collapse-all',
    icon:'icon-shousuo p8',
    title:'全部折叠',
    help:'全部折叠',
    clickFun: function (btn, ganttName, tasks) {
      const vueThis = store.getters.vueThis
      vueThis.collapseAll()
    },
    isDisableFun: function (btn, ganttName, tasks) {
      return false
    }
  },
  {
    id: 'forbid-config',
    icon: 'p8 icon-termination',
    title: '终止',
    help: '终止',
    clickFun: function (btn, ganttName, tasks) {
      const ids = []
      tasks.forEach(function (task) {
        ids.push(task.id)
      })
      const vueThis = store.getters.vueThis
      api['planGanttManager.changeSwitchType']({
        pasteTaskIds: ids,
        type: '9020'
      })
        .then(function (res) {
          const ganttObject = GanttObject.getGanttObject(ganttName)
          ids.forEach(function (id) {
            const selTask = ganttObject.getTask(id)
            selTask.switchType = '9020'
            ganttObject.updateTask(id)
          })
          vueThis.$message({
            message: '终止成功！',
            type: 'success'
          })
        })
        .catch(() => {
          vueThis.$message({
            message: '终止失败！',
            type: 'error'
          })
        })
    },
    isDisableFun: function (btn, ganttName, tasks) {
      const checks = [
        () => isNotStart(ganttName, tasks)
      ]
      const res = isDisable(checks)
      store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
      return res.disable
    },
    children: [
      {
        id: 'forbid-config',
        icon: 'p8 icon-cancel-task-type',
        title: '解除终止',
        help: '解除终止',
        clickFun: function (btn, ganttName, tasks) {
          const ids = []
          tasks.forEach(function (task) {
            ids.push(task.id)
          })
          const vueThis = store.getters.vueThis
          api['planGanttManager.changeSwitchType']({
            pasteTaskIds: ids,
            type: ''
          })
            .then(function (res) {
              const ganttObject = GanttObject.getGanttObject(ganttName)
              ids.forEach(function (id) {
                const selTask = ganttObject.getTask(id)
                selTask.switchType = ''
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
          const checks = [
            () => isNotStart(ganttName, tasks)
          ]
          const res = isDisable(checks)
          store.dispatch('setButtonMsg', { id: this.id, msg: res.disable ? res.message : ''})
          return res.disable
        }
      }
    ]
  }
]

/**
 * 通用按钮禁用条件
 * @param ganttName
 * @param tasks
 * @returns {boolean}
 */
function isDisableFunCheck (ganttName, tasks, checkType) {
  let result = false
  const vueThis = store.getters.vueThis
  const ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && Object.keys(ganttObject).length > 0) {
    const taskIds = ganttObject.getSelectedTasks()
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
          const task = ganttObject.getTask(id)
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
function checkTaskReadonly (ganttName, tasks) {
  let result = false
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (taskId) {
    const task = ganttObject.getTask(taskId)
    if (task.readonly && !result) {
      result = {
        readonly: true,
        readonlyReason: task.readonlyReason
      }
    }
  })
  return result
}

/**
 * @Description 判断gantt的readonly属性值
 * @author fukai
 * @date 2020/5/21 19:49
 */
function checkReadOnly (ganttName) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject.config.copy) {
    return false
  }
  if (ganttObject && ganttObject.config.readonly) {
    if (ganttObject.config.readonly) {
      return {
        readonly: true,
        readonlyReason: ganttObject.config.readonlyReason
      }
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
function checkContentRoot (ganttName, tasks) {
  if (tasks.length === 0) {
    return true
  }
  let result = false
  const ganttObject = GanttObject.getGanttObject(ganttName)
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
function addTask (num, pos, ganttName) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  const dpObject = GanttObject.getDpObject(ganttName)
  let settingData = store.getters.userSettingAll.PlanButton && store.getters.userSettingAll.PlanButton[0] || {}
  let schedulingType = settingData.value && settingData.value.autoScheduling ? settingData.value.autoScheduling : ''
  if (ganttObject && dpObject) {
    const taskId = ganttObject.getSelectedId()
    const task = ganttObject.getTask(taskId)
    const taskIndexNo = ganttObject.getTaskIndex(taskId) // 分支indexNo
    const vueThis = store.getters.vueThis
    const type = 'task'
    let parentTask
    // const userMaxSecret = vueThis.$store.state.user.userInfo.confidentialiteList[vueThis.$store.state.user.userInfo.confidentialiteList.length - 1].id
    // if (task.secretGrade > userMaxSecret) {
    //   vueThis.$message.warning('低密人员不允许创建高密数据')
    //   return
    // }
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
          // secretGrade: parentTask.secretGrade,
          autoScheduling: schedulingType || parentTask.autoScheduling,
          createPage: vueThis.createPage,
          completeForm: ' '
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
        const afterIndexNo = taskIndexNo + 1 // 分支indexNo
        parentTask = ganttObject.getTask(task.parent)
        // 同级下方插入
        api['planGanttManager.createPlanGanttData']({
          name: '新任务',
          parent: taskId,
          insertNum: num,
          insertType: 'After',
          type: type,
          // secretGrade: parentTask.secretGrade,
          autoScheduling: schedulingType || parentTask.autoScheduling,
          createPage: vueThis.createPage,
          completeForm: ' '
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
          // secretGrade: task.secretGrade,
          autoScheduling: schedulingType || task.autoScheduling,
          createPage: vueThis.createPage,
          completeForm: ' '
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
function createTaskByDatas (ganttObject, datas, parentId, pos, taskName, msg, dpObject, indexNo) {
  const vueThis = store.getters.vueThis
  let extraList = vueThis.columnSettings.filter((item) => item.attributeType === '1')
  let extraTask = {}
  if (extraList && extraList.length) {
    extraList.forEach(el => {
      extraTask['kz' + el.id] = ''
    })
  }
  ganttObject.unselectTask()
  dpObject.ignore(function () {
    ganttObject.batchUpdate(function () {
      datas.forEach(function (item) {
        let scheduling = false
        if (item.autoScheduling === '1') {
          scheduling = true
        }
        const task = {
          id: item.id,
          name: taskName !== null ? taskName : item.name,
          progress: item.progress,
          start_date: item.start_date,
          dutyDeptName: item.dutyDeptName,
          end_date: item.end_date,
          duration: item.duration,
          forecastBeginDate: item.forecastBeginDate,
          forecastEndDate: item.forecastEndDate,
          parent: item.parent,
          status: item.status,
          planInfoId: item.planInfoId,
          monitorPoints: item.monitorPoints,
          owner_id: item.owner_id,
          realName: item.realName,
          auto_scheduling: scheduling,
          autoScheduling: item.autoScheduling,
          type: 'task',
          managerStatus: item.managerStatus,
          weatherControl: item.weatherControl,
          createSource: item.createSource,
          indexNo: item.indexNo,
          planType: item.planType,
          // secretGrade: item.secretGrade,
          $open: true,
          setts: item.setts,
          completeForm: item.completeForm,
          machineName: item.machineName,
          combinationName: item.combinationName,
          responsibilityPlanStartTime: item.responsibilityPlanStartTime,
          responsibilityPlanEndTime: item.responsibilityPlanEndTime,
          breakDownProject: item.breakDownProject,
          keyNodePlan: item.keyNodePlan,
          notes: item.notes,
          productQuantity: item.productQuantity,
          evaluation: item.evaluation,
          realEndDate: item.realEndDate,
          realBeginDate: item.realBeginDate,
          createBy: vueThis.$store.getters.userInfo.realName,
          createTime: moment().format('YYYY-MM-DD'),
          ...extraTask
        }
        console.log(extraTask,'======extraTask');
        switch (pos) {
          case 'Child':
            ganttObject.addTask(task, parentId, item.indexNo)
            // 父任务排程类型为自动时，更新排程
            const parentTask = ganttObject.getTask(parentId)
            if (parentTask.autoScheduling === '1' && parentTask.type === 'task' && ganttObject.getGlobalTaskIndex(parentTask.id) !== 0) {
              parentTask.type = 'project'
              parentTask.isLeaf = 1
              ganttObject.updateTask(parentId)
            }
            break
          case 'paste':
            let parTask = ganttObject.getTask(parentId)
            if (parentId === item.parent) {
              parTask = ganttObject.getTask(parentId)
              parTask.isLeaf = 1
              ganttObject.addTask(task, parentId, indexNo++)
            } else {
              parTask = ganttObject.getTask(item.parent)
              parTask.isLeaf = 1
              ganttObject.addTask(task, item.parent, item.indexNo)
            }
            // 父任务排程类型为自动时，更新排程
            if (parTask.autoScheduling === '1' && parTask.type === 'task' && ganttObject.getGlobalTaskIndex(parTask.id) !== 0) {
              parTask.type = 'project'
              parTask.isLeaf = 1
              ganttObject.updateTask(parTask.id)
            }
            break
          default:
            ganttObject.addTask(task, parentId, indexNo++)
            break
        }
        let filteredData = ganttObject.serialize();  // 获取当前显示的所有任务数据
        let filteredTasks = []
        filteredData.data.forEach((item) => {
                    if (ganttObject.isTaskVisible(item.id)) {
                      filteredTasks.push(item.id);
                    }
          });
        setTimeout(() => {
          if (filteredTasks.indexOf(task.id) === -1) {
            ganttObject.showTask(parentId)
            ganttObject.selectTask(parentId)
          } else {
            ganttObject.showTask(item.id)
            ganttObject.selectTask(item.id)
          }
        }, 1000)
      })
    })
  })
  if (progressRefreshCheck(vueThis)) {
    const allParTaskIds = []
    allParTaskIds.push(parentId)
    ganttObject.eachParent(function (t) {
      allParTaskIds.push(t.id)
    }, parentId)
    ganttObject.batchUpdate(function () {
      allParTaskIds.forEach(function (id) {
        if (ganttObject.isTaskExists(id)) {
          const parTask = ganttObject.getTask(id)
          parTask.progress = GanttObject.calculateProgress(parTask, ganttObject)
          // ganttObject.updateTask(id)
          vueThis.updateRootProgress(id, parTask.progress)
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


export function deleteKeyRemove (ganttName, tasks) {
  const thisGantt = GanttObject.getGanttObject(ganttName)
  const vueThis = store.getters.vueThis
  const thisDp = GanttObject.getDpObject(ganttName)
  if (thisGantt && thisDp) {
    vueThis.deleteCount++
    if (vueThis.deleteCount > 1) {
      return
    }
    let msg = '是否确认删除选中任务?'
    if (checkHasApproveTask(ganttName, tasks)) {
      msg = '删除任务包含已提交审批任务，是否确认删除?'
    }
    thisGantt.confirm({
      text: msg,
      ok: '确认',
      cancel: '取消',
      callback: function (result) {
        vueThis.deleteCount = 0
        if (result) {
          removeTasks(thisGantt, thisDp, ganttName)
        }
      }
    })
  }
}

/**
 * @Description 任务删除
 * @author fukai
 * @date 2020/5/8 15:33
 */
function removeTasks (ganttObject, dp, ganttName) {
  const selectedTaskIds = []
  const selTaskIds = ganttObject.getSelectedTasks()
  const vueThis = store.getters.vueThis
  let datas = null
  if (vueThis.selectedTasks.length > 0) {
    datas = vueThis.selectedTasks
    vueThis.selectedTasks = []
  } else {
    datas = vueThis.selectedTasks
  }
  let pushStatusTrue = false
  let pushStatusFalse = true
  datas.forEach((item) => {
    if (item.pushStatus && item.pushStatus !== '') {
      pushStatusTrue = true
    } else {
      pushStatusFalse = false
    }
  })
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
    // if (pushStatusTrue && !pushStatusFalse) {
    //   vueThis.$message.error('包含了SDM计划，不能删除')
    // }
    if (!pushStatusTrue && !pushStatusFalse) {
      removePlanGanttData(ganttObject, dp, ganttName, vueThis, selectedTaskIds)
    }
    if (pushStatusTrue) {
      api['planGanttManager.sdmPlanDelete']({ taskIds: selectedTaskIds }).then((res) => {
        if (res.result === true) {
          vueThis.$message({
            message: '删除成功',
            type: 'success'
          })
        }
        if (res.result === false) {
          vueThis.$message({
            message: res.message,
            type: 'warning'
          })
        }
        if (res.result === true) {
          removePlanGanttData(ganttObject, dp, ganttName, vueThis, selectedTaskIds)
        }
      })
    }
  }
}
function removePlanGanttData (ganttObject, dp, ganttName, vueThis, selectedTaskIds) {
  api['planGanttManager.removePlanGanttData']({ taskIds: selectedTaskIds })
    .then(function (res) {
      if (res && res === 'true') {
        const parTaskIds = []
        dp.ignore(function () {
          ganttObject.batchUpdate(function () {
            selectedTaskIds.forEach(function (id) {
              if (ganttObject.isTaskExists(id)) {
                // 删除任务后，自动父工期变为1天修改
                const parentTaskId = ganttObject.getTask(id).parent
                if (parentTaskId && ganttObject.isTaskExists(parentTaskId) && ganttObject.hasChild(parentTaskId)) {
                  const childIds = ganttObject.getChildren(parentTaskId)
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
          const allParTaskIds = []
          Array.from(new Set(parTaskIds)).forEach(function (item) {
            allParTaskIds.push(item)
            ganttObject.eachParent(function (t) {
              allParTaskIds.push(t.id)
            }, item)
          })
          ganttObject.batchUpdate(function () {
            Array.from(new Set(allParTaskIds)).forEach(function (id) {
              if (ganttObject.isTaskExists(id)) {
                const parTask = ganttObject.getTask(id)
                parTask.progress = GanttObject.calculateProgress(parTask, ganttObject)
                vueThis.updateRootProgress(id, parTask.progress)
                updateforecastDate(parTask, ganttObject)
              }
            })
          })
        }
        vueThis.taskCount = ganttObject.getTaskCount()
        vueThis.deleteTaskCallback();
        vueThis.selectedTasks = []
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
      console.error(err, 'err')
      vueThis.$message({
        message: '任务删除失败！',
        type: 'error'
      })
    })
}
/**
 * 任务复制
 * @param ganttObject
 * @param tasks
 */
function copyTask (ganttObject, tasks, vueThis) {
  vueThis.copyFlag = false
  const selectTaskIds = ganttObject.getSelectedTasks()
  const planInfoId = vueThis.planInfoId
  const copyTaskIds = []
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
    api['planGanttManager.copyTasks']({
      pasteTaskIds: copyTaskIds,
      planInfoId: planInfoId
    })
      .then(function (res) {
        if (res) {
          if (res) {
            if (res && res.tasks && res.tasks.length) {
              res.tasks.forEach(el => {
                el.managerStatus = '6403'
                el.realBeginDate = ''
                el.realEndDate = ''
              })
            }
            vueThis.copyTasks = res
            vueThis.$message({
              message: '复制成功！',
              type: 'success'
            })
          } else {
            vueThis.$message({
              message: '任务复制失败！',
              type: 'error'
            })
          }
        }
      })
      .catch((err) => {
        console.error(err, 'err')
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
function pasteTask (ganttObject, tasks, vueThis, type, dpObj) {
  if (vueThis.copyFlag) {
    const that = this
    if (vueThis.copyTasks.length > 0) {
      const selTask = tasks[0]
      const params = {
        createPage: vueThis.createPage,
        experienceInfoIds: vueThis.copyTasks,
        parentTaskId: selTask.id,
        planInfoId: vueThis.planInfoId,
        type: 'after'
      }
      vueThis.$api['MyExperience.importTaskEx'](params)
        .then((res) => {
          if (res === 'true') {
            vueThis.$message.success('粘贴成功')
            vueThis.loadGanttData(vueThis.planInfoId, vueThis.taskId, vueThis.createPage)
          } else {
            vueThis.$message.error('粘贴失败')
          }
        })
        .then((err) => {
          console.error(err + '错误信息')
        })
    } else {
      vueThis.$message.warning('请选择需要粘贴的数据')
    }
  } else {
    const copyTasks = vueThis.copyTasks
    if (copyTasks != null) {
      const selTask = tasks[0]
      const parentTask = ganttObject.getTask(selTask.parent)
      const selId = selTask.id
      const selIndexNo = ganttObject.getTaskIndex(selId) + 1 // 分支indexNo
      const planInfoId = vueThis.planInfoId
      api['planGanttManager.pasteTasks']({
        pasteData: copyTasks,
        parentId: parentTask.id,
        selectTaskId: selId,
        type: type,
        planInfoId: planInfoId,
        createPage: vueThis.createPage
      })
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
              message: '复制的任务已被删除，请重新复制任务后粘贴!',
              type: 'error'
            })
          }
        })
        .catch((err) => {
          console.error(err, 'err')
          vueThis.$message({
            message: '复制的任务已被删除，请重新复制任务后粘贴!',
            type: 'error'
          })
        })
    }
  }
}

/**
 * 任务样式添加及取消
 * @param {*} thisGantt
 * @param {*} thisDp
 * @param {*} tasks
 * @param {*} btnId
 */
function updateTaskStyle (ganttName, tasks, btn) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && btn) {
    const taskStyles = store.getters.taskStyles
    const selTaskStyles = {}
    let planInfoId = ''
    const vueThis = store.getters.vueThis
    tasks.forEach(function (task) {
      const oldTaskStyle = taskStyles[task.id] ? taskStyles[task.id] : ''
      if (planInfoId === '') {
        planInfoId = task.planInfoId
      }
      if (btn.id.startsWith('color-')) {
        // 颜色（只能有一个，设置新颜色时替换原先颜色）
        if (oldTaskStyle && oldTaskStyle.indexOf('color:') !== -1) {
          if (oldTaskStyle && oldTaskStyle.indexOf(btn.style) !== -1) {
          } else {
            const startIndex = oldTaskStyle.indexOf('color:')
            const endIndex = oldTaskStyle.indexOf('color:') + btn.style.length
            const reg1 = new RegExp(oldTaskStyle.substring(startIndex, endIndex), 'g')
            const reg2 = new RegExp('"', 'g')
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
        } else {
          selTaskStyles[task.id] = oldTaskStyle + btn.style
        }
      }
    })
    if (JSON.stringify(selTaskStyles) !== '{}') {
      api['planGanttManager.updateTaskStyle']({
        taskStyles: selTaskStyles,
        planInfoId: planInfoId
      })
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
          console.error(err, 'err')
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
function autoSchedulingCheck (ganttName) {
  let result = false
  const ganttObject = GanttObject.getGanttObject(ganttName)
  // 已完成时不可切换
  if (ganttObject && ganttObject.config.readonly) {
    if (ganttObject.config.readonly) {
      result = true
    }
  }
  // 编辑加锁时不可切换
  const vueThis = store.getters.vueThis
  if (vueThis.monitorLockMap && vueThis.monitorLockMap.taskEdit === '1') {
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
export function noDpAddTask (num, pos, ganttName) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject) {
    const taskId = ganttObject.getSelectedId()
    const task = ganttObject.getTask(taskId)
    const taskIndexNo = ganttObject.getTaskIndex(taskId) // 分支indexNo
    const vueThis = store.getters.vueThis
    const style = changeColor
    const parent = ganttObject.getTask(task.parent)
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
function noDpCreateTask (ganttObject, num, parent, pos, taskName, indexNo, autoScheduling, vueThis, style) {
  let schedule = false
  const formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
  if (autoScheduling === '1') {
    schedule = true
  }
  let extraList = vueThis.columnSettings.filter((item) => item.attributeType === '1')
  let extraTask = {}
  if (extraList && extraList.length) {
    extraList.forEach(el => {
      extraTask['kz' + el.id] = ''
    })
  }
  ganttObject.batchUpdate(function () {
    for (let i = 0; i < num; i++) {
      const task = {
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
        // secretGrade: parent.secretGrade,
        // secretGradeDisplay: parent.secretGradeDisplay,
        owner_id: '',
        auto_scheduling: schedule,
        autoScheduling: autoScheduling,
        managerStatus: vueThis.managerStatus,
        weatherControl: vueThis.weatherControl,
        createSource: vueThis.createSource,
        type: 'task',
        $open: true,
        ...extraTask
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
function noDpCopy (thisGantt, tasks, vueThis) {
  const selectTaskIds = thisGantt.getSelectedTasks()
  const copyTaskIds = []
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
function noDpPaste (ganttObject, tasks, vueThis) {
  if (vueThis.copyTasks && vueThis.copyTasks.length > 0) {
    const selectTask = tasks[0]
    const parentTasks = ganttObject.getTask(selectTask.parent)
    let selIndexNo = ganttObject.getTaskIndex(selectTask.id) + 1 // 分支indexNo
    const style = changeColor
    const idMap = {}
    ganttObject.batchUpdate(function () {
      vueThis.copyTasks.forEach(function (item) {
        // 添加任务
        let task
        if (idMap && idMap[item.parent]) {
          task = createTask(parentTasks, idMap[item.parent], vueThis, style, item, ganttObject)
          const parTask = ganttObject.getTask(item.parent)
          if (parTask.autoScheduling === '1' && parTask.type === 'task' && ganttObject.getGlobalTaskIndex(parTask.id) !== 0) {
            parTask.type = 'project'
          }
          ganttObject.addTask(task, idMap[item.parent], selIndexNo++)
        } else {
          task = createTask(parentTasks, parentTasks.id, vueThis, style, item, ganttObject)
          const parTask = ganttObject.getTask(selectTask.parent)
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
          const newM = []
          const monitorPoints = []
          vueThis.monitorPointDatas.forEach(function (item) {
            if (item.controlTimeType && item.controlTimeType === '0') {
              monitorPoints.push(item.monitorId)
            }
          })
          task.monitorPoints.split(',').forEach(function (mId) {
            const m = {
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
function createTask (parent, parentId, vueThis, style, copyTask, ganttObject) {
  const formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
  const task = {
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
function checkEditTask (ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    const taskIds = ganttObject.getSelectedTasks()
    if (taskIds && taskIds.length === 1 && vueThis.ganttName === 'planGantt') {
      const taskId = taskIds[0]
      const task = ganttObject.getTask(taskId)
      const planStatusLockMap = store.getters.planStatusLockMap
      const taskStatusLockMap = store.getters.taskStatusLockMap
      const planEditStatus = planStatusLockMap[vueThis.planInfoStatus].ganttEdit
      const editManagerStatus = taskStatusLockMap[task.status]
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
function checkCanIssue (ganttName, tasks) {
  let result = true
  const vueThis = store.getters.vueThis
  if (checkReadOnly(ganttName)) {
    return false
  }
  if (!tasks || tasks.length === 0 || vueThis.ganttName !== 'planGantt' || (vueThis.createPage !== 'compile' && vueThis.createPage !== 'decompose')) {
    return false
  }
  const planStatusLockMap = store.getters.planStatusLockMap
  const planEditStatus = planStatusLockMap[vueThis.planInfoStatus].refreshProgress // 进行中计划才可下发
  if (planEditStatus !== 'true') {
    return false
  }
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id) && result) {
      const task = ganttObject.getTask(id)
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
 * @param currentRowTask {Array} 当前行信息
 */
function issueTask (ganttObject, thisDp, currentRowTask, ganttName) {
  const taskIds = []
  const tasks = []
  const taskMsg = []
  const vueThis = store.getters.vueThis
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id)) {
      const task = ganttObject.getTask(id)
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
    api['planGanttManager.issuePlanTasks']({
      // secretGrade: currentRowTask.currentRowTask,
      userId: currentRowTask.owner_id,
      pasteTaskIds: taskIds,
      planInfoId: vueThis.planInfoId
    })
      .then((res) => {
        if (res == '6404') {
          // thisDp.ignore(function () {
          //   ganttObject.batchUpdate(function () {
          //     tasks.forEach(function (task) {
          //       task.managerStatus = res
          //       ganttObject.updateTask(task.id)
          //     })
          //   })
          // })
          vueThis.initGantt(vueThis.planInfoId, 'grid')
          vueThis.$message({
            message: '任务下发成功！',
            type: 'success'
          })
          vueThis.isSueTaskIds = taskIds
        } else {
          vueThis.$message({
            message: res,
            type: 'warning'
          })
        }
      })
      .catch((err) => {
        console.error(err, 'err')
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
function batchOwner (ganttName) {
  let startTaskId = ''
  let endTaskId = ''
  let startDate = null
  let endDate = null
  const vueThis = store.getters.vueThis
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id)) {
      const task = ganttObject.getTask(id)
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
 * 批量设置任务密级
 */
function batchLock () {
  // const vueThis = store.getters.vueThis
  // vueThis.ClassificationSelectVisible = true
}
/**
 * 同步计划时间到预计时间
 * @param ganttName
 */
function batchSyncTask (ganttName, allTaskIds) {
  const vueThis = store.getters.vueThis
  const ganttObject = GanttObject.getGanttObject(ganttName)
  const dpObject = GanttObject.getDpObject(ganttName)
  api['planGanttManager.batchSyncTask']({
    planInfoId: vueThis.planInfoId,
    pasteTaskIds: allTaskIds
  })
    .then(function (res) {
      if (res) {
        if (allTaskIds && allTaskIds.length > 0) {
          const formatFunc = ganttObject.date.date_to_str('%Y-%m-%d')
          dpObject.ignore(function () {
            ganttObject.batchUpdate(function () {
              allTaskIds.forEach(function (taskId) {
                const selTask = ganttObject.getTask(taskId)
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
      console.error(err, 'err')
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
function batchOwnerCheck (ganttName) {
  let result = {
    value: true
  }
  const vueThis = store.getters.vueThis
  const planStatusLockMap = store.getters.planStatusLockMap
  const planEditStatus = planStatusLockMap[vueThis.planInfoStatus].ganttEdit
  // const userMaxSecret = vueThis.$store.state.user.userInfo.confidentialiteList[vueThis.$store.state.user.userInfo.confidentialiteList.length - 1].id
  // 已提交完成计划不可操作
  if (planEditStatus !== 'true') {
    return false
  }
  const taskEditMap = store.getters.taskStatusLockMap
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.eachSelectedTask(function (id) {
    if (ganttObject.isTaskExists(id)) {
      const task = ganttObject.getTask(id)
      const editManagerStatus = taskEditMap[task.status]
      const indexNo = ganttObject.getGlobalTaskIndex(id)
      // if (task.secretGrade > userMaxSecret) {
      //   vueThis.$message.warning('低密人员不允许创建高密数据')
      //   result = false
      // }
      // 判断是否为根节点
      if (indexNo === 0) {
        result = {
          value: false,
          reason: "根节点不可设置责任人"
        };
      }

      // 判断任务状态是否有效
      if (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1 && indexNo !== 0) {
        result = {
          value: false,
          reason: "已完成、提交审批任务不可操作责任人"
        };
      }

      // 判断任务是否只读且满足特定条件
      if (task.readonly && (task.weatherControl === '1' || task.managerStatus === vueThis.issueStatus)) {
        result = {
          value: false,
          reason: "计划发布后可控任务不可操作责任人"
        };
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
function canIndentCheck (ganttName) {
  let result = true
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    const selectedTaskIds = []
    const vueThis = store.getters.vueThis
    const selTaskIds = ganttObject.getSelectedTasks()
    // 直接父子同时选中时，只留父
    selTaskIds.forEach(function (id) {
      if (ganttObject.isTaskExists(id)) {
        const selTask = ganttObject.getTask(id)
        if (selTaskIds.indexOf(selTask.parent) === -1) {
          selectedTaskIds.push(id)
        }
      }
    })
    const taskEditMap = store.getters.taskStatusLockMap
    selectedTaskIds.some(function (id) {
      if (ganttObject.isTaskExists(id)) {
        const task = ganttObject.getTask(id)
        const indexNo = ganttObject.getGlobalTaskIndex(id)
        const editManagerStatus = taskEditMap[task.status]
        const preTaskId = ganttObject.getPrevSibling(id)
        // 不为根 && 父存在 && 不为已完成、审批中、变更中
        if (indexNo !== 0 && preTaskId && ganttObject.isTaskExists(preTaskId) && editManagerStatus && editManagerStatus.indexOf(task.managerStatus) !== -1) {
          const preTask = ganttObject.getTask(preTaskId)
          const preIndexNo = ganttObject.getGlobalTaskIndex(preTaskId)
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
              const link = ganttObject.getLink(linkId)
              if (result && link.source === preTaskId) {
                result = false
              }
            })
          }
          if (result && task.$source && task.$source.length > 0) {
            task.$source.forEach(function (linkId) {
              const link = ganttObject.getLink(linkId)
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
function outdentCheck (ganttName, tasks) {
  let result = true
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    ganttObject.eachSelectedTask(function (taskId) {
      if (ganttObject.isTaskExists(taskId)) {
        const task = ganttObject.getTask(taskId)
        const indexNo = ganttObject.getGlobalTaskIndex(taskId)
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
function canDeleteCheck (ganttName, tasks, vueThis) {
  let result = true
  // 获取gannt操作限制策略
  const planStatusLockMap = store.getters.planStatusLockMap
  const planEditStatus = planStatusLockMap[vueThis.planInfoStatus].ganttEdit
  const controlTaskEdit = planStatusLockMap[vueThis.planInfoStatus].controlTaskEdit
  if (planEditStatus === 'false') {
    return false
  } else {
    if (ganttName) {
      const ganttObject = GanttObject.getGanttObject(ganttName)
      const taskEditMap = store.getters.taskStatusLockMap
      const selectedTaskIds = []
      const selTaskIds = ganttObject.getSelectedTasks()
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
        const selTask = ganttObject.getTask(selTaskId)
        const editManagerStatus = taskEditMap[selTask.status]
        const indexNo = ganttObject.getGlobalTaskIndex(selTask.id)
        if (!result) {
          return true
        }
        // 发布后可控任务不可删除
        if (controlTaskEdit && controlTaskEdit === 'false') {
          if (selTask.weatherControl && selTask.weatherControl === '1') {

            result = false
            return true
          } else if (selTask.managerStatus === '6404') {

            result = false
            return true
          }
        }
        if (indexNo === 0 || (editManagerStatus && editManagerStatus.indexOf(selTask.managerStatus) === -1 && indexNo !== 0)) {
          result = false
          return true
        }
        ganttObject.eachTask(function (task) {
          const chiManagerStatus = taskEditMap[task.status]
          const indexNo = ganttObject.getGlobalTaskIndex(task.id)
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
function checkHasApproveTask (ganttName, tasks) {
  let result = false
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    tasks.some(function (selTask) {
      if (selTask.managerStatus === '6406') {
        result = true
      }
      ganttObject.eachTask(function (task) {
        if (selTask.managerStatus === '6406') {
          result = true
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
function changePlanScheduling (value, ganttName, tasks) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  const dpObject = GanttObject.getDpObject(ganttName)
  const taskStatusLockMap = store.getters.taskStatusLockMap
  const vueThis = store.getters.vueThis
  const allTaskIds = []
  ganttObject.eachSelectedTask(function (taskId) {
    const selTask = ganttObject.getTask(taskId)
    const selManagerStatus = taskStatusLockMap[selTask.status]
    if (selTask.autoScheduling !== value && ganttObject.getGlobalTaskIndex(taskId) !== 0 && selManagerStatus && selManagerStatus.indexOf(selTask.managerStatus) !== -1) {
      allTaskIds.push(taskId)
      if (ganttObject.hasChild(taskId)) {
        ganttObject.eachTask(function (task) {
          const editManagerStatus = taskStatusLockMap[task.status]
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
      api['planGanttManager.changePlanScheduling']({
        planInfoId: vueThis.planInfoId,
        pasteTaskIds: allTaskIds
      })
        .then(function (res) {
          if (res) {
            dpObject.ignore(function () {
              ganttObject.batchUpdate(function () {
                allTaskIds.forEach(function (taskId) {
                  const selTask = ganttObject.getTask(taskId)
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
          console.error(err, 'err')
          vueThis.$message({
            message: '排程模式设置失败！',
            type: 'error'
          })
        })
    } else {
      // 手动切自动
      ganttObject.batchUpdate(function () {
        allTaskIds.forEach(function (taskId) {
          const selTask = ganttObject.getTask(taskId)
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
function checkHasProductTask (tasks) {
  if (tasks.length === 0) {
    return true
  }
  const planType = tasks[0] ? tasks[0].planType : ''
  if (planType) {
    if (planType === '3101' || (planType.indexOf('3103') !== -1 && planType !== '3103')) {
      return true
    }
  }
}
// 检测是否为暂停或者禁止
function checkSwitchType (tasks) {
  if (tasks.length === 0) {
    return true
  }
  const switchType = tasks[0] ? tasks[0].switchType : ''
  if (switchType) {
    if (switchType === '9010' || switchType === '9020') {
      return true
    }
  }
}

export { checkContentRoot, checkReadOnly, checkTaskReadonly, batchOwnerCheck }
