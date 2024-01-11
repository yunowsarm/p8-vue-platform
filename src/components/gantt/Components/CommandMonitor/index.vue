<template>
  <div>
    <template v-for="(mon, index) in childGroups(monitorData)">
      <div class="child-group" :key="index">
        <command-button v-for="(config, index) in mon.configs" :key="index" :cbutton="config" :size="config.size" :current-records="currentRecords" :gantt-name="ganttName"></command-button>
      </div>
    </template>
  </div>
</template>

<script>
import iconAnnualOverallPlan from '@/assets/image/gantt/icon-annual-overall-plan.png'
import iconMilepost from '@/assets/image/gantt/icon-milepost.png'
import iconExclusiveProgram from '@/assets/image/gantt/icon-exclusive-program.png'
import iconMonthlyComprehensivePlan from '@/assets/image/gantt/icon-monthly-comprehensive-plan.png'
import iconCourtOrder from '@/assets/image/gantt/icon-court-order.png'
import iconProjectQuality from '@/assets/image/gantt/icon-project-quality.png'
import CommandButton from '../CommandButton'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { checkContentRoot, checkTaskReadonly } from '@/assets/commonJS/ganttJS/commandButtonData'
import { lockMonitor, lockIUDMonitor, lockIUDMonitorCheck } from '@/assets/commonJS/ganttJS/ganttLockUnLock'
import { mapGetters } from 'vuex'
import { updateMonitor } from '@/assets/commonJS/ganttJS/changeGantt'
// import { forEach } from 'lodash'

let button = {}
export default {
  name: 'CommandMonitor',
  components: {
    CommandButton
  },
  props: {
    planInfoId: String,
    currentRecords: Array,
    ganttName: String,
    rowNum: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      ganttObjectData: {},
      formatDatas: {
        'p8 icon-annual-overall-plan': iconAnnualOverallPlan,
        'p8 icon-court-order': iconCourtOrder,
        'p8 icon-exclusive-program': iconExclusiveProgram,
        'p8 icon-monthly-comprehensive-plan': iconMonthlyComprehensivePlan,
        'p8 icon-milepost': iconMilepost,
        'p8 icon-project-quality': iconProjectQuality
      },
      monitorData: []
    }
  },
  watch: {
    currentRecords: function (newVal, oldVal) {
      const _this = this
      if (JSON.stringify(button) !== '{}' && button.id.startsWith('format-') && newVal) {
        if (!button.isDisableFun(button, this.ganttName, newVal)) {
          button.clickFun(button, this.ganttName, newVal)
        } else {
          const thisGantt = _this.ganttObjectData.getGanttObject(this.ganttName)
          thisGantt.message({
            text: '当前任务无法标识！',
            expire: 3000
          })
        }
      }
    },
    planInfoId: function (newVal, oldVal) {
      if (newVal) {
        this.planInfoId = newVal
        this.loadMonitorData(newVal)
      }
    }
  },
  computed: {
    childGroups() {
      const that = this
      return function (data) {
        const configArray = []
        let childGroup = { configs: [] }
        data.map((item, index) => {
          // 绑定disable和click
          const isDisableFun = that.isDisableFun()
          const clickFun = that.clickFun()
          item.isDisableFun = isDisableFun
          item.clickFun = clickFun
          if (!item.size) {
            item.size = 'small'
          }
          if (item.id !== 'cancelSel') {
            const chlBtn = [
              {
                id: 'format-' + item.id,
                title: item.title + '格式刷',
                icon: 'p8 icon-mark-format-brush',
                parentIcon: item.icon,
                help: item.title + '格式刷',
                clickFun: that.clickFun(),
                isDisableFun: that.isDisableFun()
              },
              {
                id: 'delete-' + item.id,
                title: '取消' + item.title,
                icon: 'p8 icon-remove',
                help: '取消' + item.title,
                clickFun: that.clickFun(),
                isDisableFun: that.isDisableFun()
              }
            ]
            item.children = chlBtn
          }

          if (item.size === 'large') {
            if (childGroup.configs.length > 0) {
              configArray.push(childGroup)
              childGroup = { configs: [] }
            }
            childGroup.configs.push(item)
            configArray.push(childGroup)
            childGroup = { configs: [] }
          } else if (item.size === 'small') {
            if (childGroup.configs.length < this.rowNum) {
              childGroup.configs.push(item)
            }
            if (childGroup.configs.length === this.rowNum || data.length === index + 1) {
              configArray.push(childGroup)
              childGroup = { configs: [] }
            }
          } else if (item.size === 'mini') {
            // 只显示图标
            if (childGroup.configs.length < this.rowNum) {
              childGroup.configs.push(item)
            }
            if (childGroup.configs.length === this.rowNum || data.length === index + 1) {
              configArray.push(childGroup)
              childGroup = { configs: [] }
            }
          }
        })
        return configArray
      }
    },
    ...mapGetters(['vueThis', 'taskStatusLockMap'])
  },
  mounted() {
    this.loadMonitorData(this.planInfoId)
    this.initGanttObject()
  },
  methods: {
    initGanttObject() {
      this.ganttObjectData = GanttObject
    },
    loadMonitorData(planInfoId) {
      // 加载标识数据
      const that = this
      this.$api['planGanttManager.loadMonitorPointData']({ planInfoId: planInfoId })
        .then(async function (res) {
          if (res) {
            // let info = await that.getMonitorPointInfo(planInfoId)
            // if (info[0]) {
            //   res.forEach(item => {
            //     if (item.id === '1015') item.hintTitle = `${item.title}（${info.join(',')}）`
            //   })
            // }
            res.forEach((item) => {
              if (item.id !== '1024' && item.id !== '1023') {
                that.monitorData.push(item)
              }
            })
            // that.monitorData = res
            // 添加取消按钮
            const cancelSel = {
              id: 'cancelSel',
              title: '取消标识格式刷',
              picUrl: '',
              icon: 'p8 icon-mouse-pointer',
              size: 'small',
              help: '取消标识格式刷'
            }
            that.monitorData.push(cancelSel)
            // that.monitorData = that.monitorData.filter(r => r.id !== '1022')
            that.monitorData = that.monitorData.filter((r) => r.id !== '1030')
            that.$store.dispatch('setButtons', { btns: that.monitorData, type: 'monitor' })
          }
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    isDisableFun() {
      // 标识逻辑
      const that = this
      const mIdArr = ['1015', 'format-1015', 'delete-1015', 'format-1008', '1008', 'delete-1008']
      return function (btn, ganttName, tasks) {
        // 我的工作--我的任务-计划分解--计划分解页面不可标记责任令和月度计划。
        const createPage = that.vueThis.createPage || ''
        if (createPage === 'compile' && that.vueThis.planEditLock) {
          return true
        }
        // 如果是任务分解，非当前人员创建的，只能编辑责任人
        const userId = that.$store.getters.userInfo.id
        const ele = tasks.find((task) => {
          return task.createUserId && task.createUserId != userId
        })
        if (window.createPage === 'decompose' && ele && ele.id) {
          return true
        }
        if (createPage === 'decompose') {
          if (mIdArr.includes(btn.id)) {
            return true
          }
        }
        // return true
        const switchType = tasks[0] ? tasks[0].switchType : ''
        if (switchType) {
          if (switchType === '9010' || switchType === '9020') {
            return true
          }
        }
        if (btn.id === '1030' || btn.id === 'format-1030') {
          return true
        }
        if (ganttName === 'planResolveGantt' && (btn.id === '1012' || btn.id === 'format-1012' || btn.id === 'delete-1012')) {
          return true
        }
        if (ganttName === 'planResolveGantt' && tasks.length > 0) {
          const thisGantt = that.ganttObjectData.getGanttObject(ganttName)
          if (!checkResolve(thisGantt, tasks[0])) {
            return true
          }
        }
        if (btn != null && ganttName) {
          const thisGantt = that.ganttObjectData.getGanttObject(ganttName)
          // 标识id
          const mId = btn.id
          // gantt为readonly=true时，不可选
          if (thisGantt && thisGantt.config.readonly) {
            return true
          }
          if (that.vueThis.readOnly) {
            return true
          }
          const monitorLocks = Object.keys(that.vueThis.monitorLockMap)
          // 责任令新增加锁后，不可操作
          if (lockIUDMonitor(that.vueThis.monitorLockMap)) {
            if (mId === '1015') {
              return true
            }
          }

          // 取消选中按钮
          if (mId === 'cancelSel' && JSON.stringify(button) === '{}') {
            return true
          }
          // 计划标识加锁后，不可操作
          if (mId !== 'cancelSel') {
            if (mId.indexOf('format') !== -1 || mId.indexOf('delete') !== -1) {
              const monId = mId.split('-')[1]
              if (lockMonitor(that.vueThis.monitorLockMap, monId)) {
                return true
              }
            } else {
              if (lockMonitor(that.vueThis.monitorLockMap, mId)) {
                return true
              }
            }
          }
          // 当项目有策划标志为true时 方可标记责任令
          // if (that.vueThis.selectRecord.length === 1 && !that.vueThis.selectRecord[0].projectDesignFlag) {
          //   if (mId === '1015' || mId === 'format-1015') {
          //     return true
          //   }
          // }
          // 当项目责任令标识不为ZRLS102时 方可标记责任令
          // if (that.vueThis.selectRecord.length === 1 && that.vueThis.selectRecord[0].zrlState === 'ZRLS102') {
          //   if (mId === '1015' || mId === 'format-1015') {
          //     return true
          //   }
          // }
          if (tasks && tasks.length > 0) {
            // 包含根节点时，不可选
            if (checkContentRoot(ganttName, tasks)) {
              return true
            }
            // 任务的readonly属性为true时，不可操作
            if (checkTaskReadonly(ganttName, tasks)) {
              // 已下发的任务readonly=true,单独判断责任令解锁标志
              if (!lockIUDMonitorCheck(that.vueThis.monitorLockMap)) {
                return true
              }
            }
            // 变更中已删除任务不可操作
            if (ganttName === 'changeGantt') {
              let result = false
              tasks.some(function (task) {
                if (task.infoType && task.infoType === 'delete') {
                  result = true
                  return true
                }
              })
              if (result) {
                return result
              }
            }
            // 月度计划、责任令计划为“提交审批”、“已完成”时，不可再取消其标识。与责任令锁也需要联动。
            const banIds = '1008,1015,1012,1014,1018,1020,delete-1008,delete-1015,delete-1012,delete-1014,delete-1018,delete-1020'
            if (ganttName === 'planGantt' && banIds.includes(mId)) {
              const managerStatusArr = ['6406', '6409']
              const result = tasks.some((task) => {
                if (managerStatusArr.includes(task.managerStatus)) {
                  return true
                } else {
                  return false
                }
              })
              if (result) {
                return result
              }
            }
            // 计划编制 责任令标识及格式刷
            if (ganttName === 'planGantt' && mIdArr.includes(mId)) {
              let result = false
              // 父任务为月度计划或责任令时子不可标记责任令
              result = tasks.some((task) => {
                if (checkResolveTwo(thisGantt, task)) {
                  return true
                }
              })
              // 有新增加锁标识 不能用责任令格式刷
              if (lockIUDMonitor(that.vueThis.monitorLockMap) && btn.id === 'format-1015') {
                result = true
              }

              if (result) {
                return result
              }
            }
            if (ganttName === 'planGantt' && mIdArr.includes(mId)) {
              let result = false

              // 子计划是责任令时，其父计划不可标记为责任令和月度计划。
              tasks.some((task) => {
                if (checkResolveThree(thisGantt, task)) {
                  result = true
                  return true
                }
              })
              if (result) {
                return result
              }
              // 有新增加锁标识 不能用责任令格式刷
              if (lockIUDMonitor(that.vueThis.monitorLockMap) && btn.id === 'format-1015') {
                result = true
              }

              if (result) {
                return result
              }
            }
            if (mId.startsWith('delete-')) {
              // 取消标识按钮
              const taskCheck = tasks.some((t, i) => {
                if (t.monitorPoints && t.monitorPoints.indexOf(mId.substring(7)) !== -1) {
                  // 院所标识同时存在不可取消所标识
                  if (mId.substring(7) === '1030' && t.monitorPoints.indexOf('1022') !== -1) {
                  } else {
                    let flag = true
                    // 如果有删除标识加锁 责任令不能取消
                    if (monitorLocks && monitorLocks.length > 0) {
                      monitorLocks.forEach((monitorLock) => {
                        if (monitorLock === '101503' && that.vueThis.monitorLockMap[monitorLock] === '1') {
                          if (mId.substring(7) === '1015') {
                            flag = false
                          }
                        }
                      })
                    }
                    return flag
                  }
                }
              })
              return !taskCheck
            } else {
              // 依赖标识
              const relyIds = btn.relyIds != null ? btn.relyIds.split(',') : null
              // 互斥标识
              const mutexIds = btn.mutexIds != null ? btn.mutexIds.split(',') : null
              // 判断
              const taskCheck = tasks.some((t, i) => {
                // 如果选中行已包含当前标识，不可选
                if (t.monitorPoints && t.monitorPoints.indexOf(mId) !== -1) {
                  return true
                }
                // 没有依赖标识，不可选
                if (relyIds != null && relyIds.length > 0) {
                  if (t.monitorPoints) {
                    return relyIds.some((rId, index) => {
                      if (t.monitorPoints.indexOf(rId) === -1) {
                        return true
                      }
                    })
                  } else {
                    return true
                  }
                }
                // 存在互斥标识，不可选
                if (mutexIds != null && mutexIds.length > 0) {
                  if (t.monitorPoints) {
                    return mutexIds.some((rId, index) => {
                      if (t.monitorPoints.indexOf(rId) !== -1) {
                        return true
                      }
                    })
                  } else {
                    return false
                  }
                }
              })
              return taskCheck
            }
          } else {
            // 格式刷
            if (mId.startsWith('format-') && JSON.stringify(button) !== '{}') {
              return true
            }
            if (!mId.startsWith('format-') && JSON.stringify(button) === '{}') {
              return true
            }
          }
        }
        return false
      }
    },
    clickFun() {
      const that = this
      return function (btn, ganttName, tasks) {
        if (btn != null && ganttName) {
          const thisGantt = that.ganttObjectData.getGanttObject(ganttName)
          // 标识id
          const mId = btn.id
          // if (mId === '1015') {
          //   tasks.forEach(function (task) {
          //     if (that.vueThis.selectRecord.length === 1 && that.vueThis.selectRecord[0].zrlState === 'ZRLS104') {
          //       task.managerStatus = '6404'
          //     }
          //   })
          // }
          // 取消标识选中
          if (mId === 'cancelSel') {
            button = {}
            document.getElementById('couerDiv').style.cursor = null
            thisGantt.eachSelectedTask(function (id) {
              if (thisGantt.isTaskExists(id)) {
                thisGantt.unselectTask(id)
              }
            })
          }

          // 点击格式刷时清空选中任务
          if (JSON.stringify(button) === '{}' && mId.startsWith('format-')) {
            thisGantt.eachSelectedTask(function (id) {
              if (thisGantt.isTaskExists(id)) {
                thisGantt.unselectTask(id)
              }
            })
          }
          if (tasks && tasks.length > 0) {
            const monitorPointsMap = {}
            that.vueThis.monitorPointDatas.forEach(function (item) {
              monitorPointsMap[item.monitorId] = item
            })
            if (mId.startsWith('delete-')) {
              // 取消标识按钮
              thisGantt.batchUpdate(function () {
                tasks.forEach(function (task) {
                  let point = mId.substring(7)
                  if (task.monitorPoints && task.monitorPoints.indexOf(point) !== -1) {
                    if (task.monitorPoints.indexOf(point + ',') !== -1) {
                      point = point + ','
                    } else if (task.monitorPoints.indexOf(',' + point) !== -1) {
                      point = ',' + point
                    }
                    task.monitorPoints = task.monitorPoints.replace(point, '')
                    // 计划编制 责任令编制默认“院发责任令分解项目”，“关键节点计划”为否 责任令开始时间完成时间 为 空
                    if (ganttName === 'planGantt' && mId === 'delete-1015') {
                      task.breakDownProject = ''
                      task.keyNodePlan = ''
                      task.responsibilityPlanStartTime = ''
                      task.responsibilityPlanEndTime = ''
                      task.setts = ''
                      task.completeForm = ''
                      task.machineName = ''
                      task.combinationName = ''
                      task.notes = ''
                    }
                    // 计划编制 月度计划标识取消是 "评价要素"为 空
                    if (ganttName === 'planGantt' && mId === 'delete-1008') {
                      task.evaluation = ''
                    }
                    thisGantt.updateTask(task.id)
                    if (that.ganttName === 'changeGantt') {
                      updateMonitor(that.vueThis.taskMonitorMap, task, that.vueThis, monitorPointsMap, point, 'remove', thisGantt)
                    }
                  }
                })
              })
            } else if (mId !== 'cancelSel') {
              let monitorPointsId = btn.id
              if (btn.id.startsWith('format-')) {
                monitorPointsId = monitorPointsId.replace('format-', '')
                // 防止格式化的互斥标识
                const currentMonitor = that.monitorData.find((item) => {
                  return item.id === monitorPointsId
                })
                let status = false
                tasks.forEach((task) => {
                  let arr = []
                  if (task.monitorPoints) {
                    arr = task.monitorPoints.split(',')
                  }
                  if (arr.includes(currentMonitor.mutexIds)) {
                    status = true
                  }
                })
                if (status) {
                  that.$message.error(`选中的任务中，包含${currentMonitor.title}所互斥的标识`)
                  return
                }
              }

              thisGantt.batchUpdate(function () {
                tasks.forEach(function (task) {
                  // 任务属性readonly为ture  并且不是责任令的不可添加标识

                  if (!task.readonly || monitorPointsId === '1015') {
                    if (task.monitorPoints) {
                      if (task.monitorPoints.indexOf(monitorPointsId) === -1) {
                        task.monitorPoints = task.monitorPoints + ',' + monitorPointsId
                        if (ganttName === 'planGantt' && (mId === '1015' || mId === 'format-1015')) {
                          task.breakDownProject = '0'
                          task.keyNodePlan = '0'
                          task.responsibilityPlanEndTime = task.forecastEndDate
                          task.responsibilityPlanStartTime = task.forecastBeginDate
                        }
                        thisGantt.updateTask(task.id)
                        thisGantt.refreshData()
                      }
                    } else {
                      // 计划编制 责任令编制默认“院发责任令分解项目”，“关键节点计划”为否 责任令开始时间完成时间 默认预计开始和预计完成时间
                      if (ganttName === 'planGantt' && (mId === '1015' || mId === 'format-1015')) {
                        task.breakDownProject = '0'
                        task.keyNodePlan = '0'
                        task.responsibilityPlanEndTime = task.forecastEndDate
                        task.responsibilityPlanStartTime = task.forecastBeginDate
                      }
                      task.monitorPoints = monitorPointsId
                      thisGantt.updateTask(task.id)
                    }
                    if (that.ganttName === 'changeGantt') {
                      updateMonitor(that.vueThis.taskMonitorMap, task, that.vueThis, monitorPointsMap, monitorPointsId, 'add', thisGantt)
                    }
                  }
                })
              })
            }
          } else if (mId.startsWith('format-')) {
            // 标识点击格式刷
            button = btn
            document.getElementById('couerDiv').style.cursor = 'url(' + that.formatDatas[btn.parentIcon] + '),auto'
            // 刷新标识按钮显示
            that.monitorData.forEach(function (item) {
              item.isDisableFun(item, ganttName, tasks)
              if (item.children && item.children.length > 0) {
                item.children.forEach(function (child) {
                  child.isDisableFun(child, ganttName, tasks)
                })
              }
            })
          }
        }
      }
    }
  }
}

function checkResolve(ganttObject, task) {
  if (task.parent) {
    const parentTask = ganttObject.getTask(task.parent)
    if (parentTask.dutyUserId === parentTask.nowUserId) {
      return true
    } else {
      return checkResolve(ganttObject, parentTask)
    }
  } else {
    return false
  }
}

// 如果所选任务的所有父级有一个有月度计划或者责任令表示则禁用
function checkResolveTwo(ganttObject, task) {
  if (task.parent) {
    const parentTask = ganttObject.getTask(task.parent)
    if (parentTask.monitorPoints && (parentTask.monitorPoints === '1015' || parentTask.monitorPoints === '1008')) {
      return true
    } else {
      return checkResolveTwo(ganttObject, parentTask)
    }
  } else {
    return false
  }
}
function checkResolveThree(ganttObject, task) {
  let check = false
  if (ganttObject.hasChild(task.id)) {
    ganttObject.eachTask(function (t) {
      if (t.monitorPoints && t.monitorPoints === '1015') {
        check = true
        return true
      } else {
        return checkResolveThree(ganttObject, t)
      }
    }, task.id)
  }
  return check
}
</script>

<style scoped>
.group .child-group {
  float: left;
}
</style>
