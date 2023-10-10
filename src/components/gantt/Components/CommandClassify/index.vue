<template>
  <div>
    <template v-for="(mon, index) in childGroups(classifyData)">
      <div class="child-group" :key="index">
        <command-button v-for="(config, index) in mon.configs" :key="index" :cbutton="config" :size="config.size" :current-records="currentRecords" :gantt-name="ganttName"></command-button>
      </div>
    </template>
  </div>
</template>

<script>
import CommandButton from '../CommandButton'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { GanttResolveObject } from '@/assets/commonJS/ganttJS/resolve/resolveGanttObject'
import { mapGetters } from 'vuex'
import { generateTree } from '@/utils/generateTree'
import { beforeUpdateTask, setNewTaskMap } from '@/assets/commonJS/ganttJS/changeGantt'
import indexDisable from './indexDisable'

export default {
  name: 'CommandClassify',
  mixins: [indexDisable],
  components: {
    CommandButton
  },
  props: {
    planInfoId: String,
    taskId: {
      type: String,
      default: ''
    },
    specialPlan: String,
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
      classifyData: []
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
          if (item.children && item.children.length > 0) {
            item.children.forEach(function (child) {
              child.clickFun = that.clickFun()
              child.isDisableFun = that.isDisableFun()
            })
          }
        })
        return configArray
      }
    },
    ...mapGetters(['vueThis'])
  },
  mounted() {
    // 加载标识数据
    const that = this
    let dicType = ''
    if (this.specialPlan === 'SPECIAL_PLAN_0_01' || this.specialPlan === 'SPECIAL_PLAN_0_02' || this.specialPlan === 'SPECIAL_PLAN_0_03') {
      dicType = 'ACTIVITY_TYPE_SP'
    } else {
      dicType = 'ACTIVITY_TYPE'
    }
    this.$api['planGanttManager.loadTaskClassifyData']({ dicType })
      .then(function (res) {
        if (res) {
          that.classifyData = generateTree(res, 'parentId', res[0].parentId)
          // 添加取消按钮
          const cancelSelClassify = {
            id: 'cancelSelClassify',
            title: '取消任务类型',
            icon: 'p8 icon-cancel-task-type',
            size: 'small',
            help: '取消任务类型'
          }
          const productClassify = {
            id: '3103',
            title: '生产/试制',
            icon: 'p8 icon-trial-production',
            size: 'small'
          }
          that.classifyData.forEach(function (data) {
            if (data.id === '3103') {
              data.children.unshift(productClassify)
            }
          })
          that.classifyData.push(cancelSelClassify)
          that.$store.dispatch('setButtons', { btns: that.classifyData, type: 'classify' })
        }
      })
      .catch(function (error) {
        console.error(error)
      })
    this.initGanttObject()
    window.isDisableFun = this.isDisableFun
  },
  methods: {
    initGanttObject() {
      if (this.ganttName === 'planResolveGantt') {
        this.ganttObjectData = GanttResolveObject
      } else {
        this.ganttObjectData = GanttObject
      }
    },
    isDisableFun() {
      const that = this
      // 标识逻辑
      return (btn, ganttName, tasks) => {
        if (tasks.length === 0) {
          return true
        }
        if (window.createPage === 'compile' && that.vueThis.planEditLock) {
          return true
        }
        // 如果是任务分解，且角色为计划员，只能编辑责任人
        const roles = that.$store.getters.userInfo.userRoles.map((role) => {
          return role.roleId
        })
        if (window.createPage === 'decompose' && roles.includes('SYS_ROLE077')) {
          return true
        }
        const switchType = tasks[0] ? tasks[0].switchType : ''
        if (switchType) {
          if (switchType === '9010' || switchType === '9020') {
            return true
          }
        }
        if (btn.id === 'cancelSelClassify') {
          if (tasks[0].planType !== '') {
            return false
          }
        }
        return this.isDisable(btn, ganttName, tasks)
      }
    },
    clickFun() {
      const that = this
      return function (btn, ganttName, tasks) {
        const switchType = tasks[0] ? tasks[0].switchType : ''
        if (switchType) {
          if (switchType === '9010' || switchType === '9020') {
            return
          }
        }
        if (btn != null && ganttName) {
          const thisGantt = that.ganttObjectData.getGanttObject(ganttName)
          // 任务类型id
          const mId = btn.id
          // 选中任务再点击任务类型
          if (tasks && tasks.length > 0) {
            // 取消任务类型选中
            thisGantt.batchUpdate(function () {
              if (mId === 'cancelSelClassify') {
                // 取消前校验
                that.beforeCancelPlanType(thisGantt, tasks)
              } else {
                // 设置前校验
                that.beforeSetPlanType(thisGantt, tasks, btn).then((res) => {
                  if (res) {
                    tasks.forEach(function (task) {
                      that.updatePlanType(thisGantt, task, mId)
                    })
                  }
                })
                // let isCcontinue = that.beforeSetPlanType(thisGantt, tasks, btn)
                // if (isCcontinue) {
                //   tasks.forEach(function (task) {
                //     that.updatePlanType(thisGantt, task, mId)
                //   })
                // }
              }
            })
          }
        }
        this.isDisableFun()
        window.isDisable()
      }
    },
    checkTaskOtherDisable(thisGantt, tasks, btn) {
      const that = this
      let taskCheck = false
      const mId = btn.id
      const mParentId = btn.parentId
      if (mId === '3103' || mParentId === '3103') {
        if (tasks && tasks.length > 1) {
          // taskCheck = true
          /**
           * 多选禁用逻辑
           */
          taskCheck = that.multipleDisable(thisGantt, btn, tasks)
        } else if (tasks && tasks.length === 1) {
          tasks.forEach(function (task) {
            const level = thisGantt.calculateTaskLevel(task)
            const parentTask = thisGantt.getTask(task.parent)
            if (that.taskId) {
              // 显示情况判断级别应该根据不同界面判断根节点 我的任务页面   /* 为任务叶子节点并且有父任务 */
              if (level >= 1 && !thisGantt.hasChild(task.id)) {
                if (parentTask.planType === '3103') {
                  taskCheck = false
                } else {
                  taskCheck = true
                }
              } else {
                taskCheck = true
              }
              if (mId === '3103' && level >= 1) {
                taskCheck = false
              }
            } else {
              if (level > 1 && !thisGantt.hasChild(task.id)) {
                if (parentTask.planType === '3103') {
                  taskCheck = false
                } else {
                  taskCheck = true
                }
              } else {
                taskCheck = true
              }
              if (mId === '3103' && level >= 1) {
                taskCheck = false
              }
            }
          })
        }
      }
      return taskCheck
    },
    multipleDisable(Gantt, btn, tasks) {
      let taskCheck = false
      const mId = btn.id
      const mParentId = btn.parentId
      // 生产试制: 选中所有数据planType为空为false，否则true
      const hasChildLoopPT = (data) => {
        let bool = false
        data.forEach((item) => {
          Gantt.getChildren(item.id).forEach((i) => {
            if (Gantt.getTask(i).children) {
              hasChildLoopPT(Gantt.getTask(i).children)
            }
            bool = !!Gantt.getTask(i).planType
            if (bool) {
              throw new Error()
            }
          })
        })
        return bool
      }
      // 七大类: 选中所有数据为父是否是生产试制,选中所有数据planType为空为false，否则true
      const hasNextLoop = (data) => {
        // 同级pid相同满足为true
        // bool = data.every(item => {
        //   return Gantt.getParent(item.id) === Gantt.getParent(data[0].id)
        // })
        // step 1 不能有子
        const bool = data.some((item) => {
          return Gantt.hasChild(item.id)
        })

        if (bool) {
          return true
        }
        // step 2 父是生产试制
        // eslint-disable-next-line no-unused-expressions
        // bool ? (data.every(item => { return Gantt.getTask(Gantt.getParent(item.id)).planType === '3103' }) ? bool = true : bool = false) : ''
        const bool1 = data.every((item) => {
          return Gantt.getTask(Gantt.getParent(item.id)).planType === '3103'
        })
        if (!bool1) {
          return true
        }
        // step 3 选中所有数据planType为空
        // eslint-disable-next-line no-unused-expressions
        // bool ? bool = !data.every(item => { return !item.planType }) : bool = true
        const bool2 = data.some((item) => {
          return item.planType
        })
        if (bool2) {
          return true
        }
        return false
      }
      /**
       * 多选设置生产试制
       */
      if (mId === '3103') {
        // 计划类型是否都为空
        taskCheck = hasChildLoopPT(tasks)
      }
      /**
       * 多选设置七大类
       */
      if (mParentId === '3103') {
        taskCheck = hasNextLoop(tasks)
      }
      // true 禁用
      return taskCheck
    },
    beforeCancelPlanType(thisGantt, tasks) {
      const that = this
      tasks.forEach(function (task) {
        if (task.planType && task.planType.indexOf('3103') !== -1) {
          that.updateProductPlanType(thisGantt, task, '')
        } else {
          if (task.planType) {
            that.updatePlanType(thisGantt, task, '')
          }
        }
      })
    },
    async beforeSetPlanType(thisGantt, tasks, btn) {
      const that = this
      let isCcontinue = true
      const mId = btn.id
      if (mId === '手动添加“生产/试制”标识') {
        //   3103：父生产/试制类型     310303：子生产/试制类型 可以手动标记
        isCcontinue = false
      } else {
        if (mId.indexOf('3103') !== -1) {
          // isCcontinue = false
          // 单选
          if (tasks.length === 1) {
            isCcontinue = false
            that.checkProductPlanType(thisGantt, tasks, btn)
            // 多选
          } else if (tasks.length > 1) {
            await that
              .checkProductPlanTypeTwo(thisGantt, tasks, btn)
              .then((res) => {
                res.some((i) => i === false) ? (isCcontinue = false) : (isCcontinue = true)
              })
              .catch((e) => {
                e.alContent &&
                  that.$alert(e.alContent, e.alTitle, {
                    confirmButtonText: '确定'
                  })
                isCcontinue = false
              })
          }
        } else {
          tasks.some((t, i) => {
            if (t.planType && t.planType.indexOf('3103') !== -1) {
              that.updateProductPlanType(thisGantt, t, '')
            }
          })
        }
      }
      return isCcontinue
    },
    checkProductPlanType(thisGantt, tasks, btn) {
      const that = this
      tasks.forEach(function (task) {
        that.$api['productTask.queryNameByType']({ planType: btn.id })
          .then(function (res) {
            if (res && res.nameKey) {
              that.editProductionMark(thisGantt, task, res.nameKey, btn.id, btn.title)
            }
          })
          .catch(function (error) {
            console.error(error)
          })
      })
    },
    async checkProductPlanTypeTwo(thisGantt, tasks, btn) {
      const that = this
      return Promise.all(
        tasks.map(function (task) {
          // eslint-disable-next-line promise/param-names
          return new Promise((resolve, reject) => {
            that.$api['productTask.queryNameByType']({ planType: btn.id })
              .then(function (res) {
                if (res && res.nameKey) {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  const callBackData = that.editProductionMarkTwo(thisGantt, task, res.nameKey, btn.id, btn.title)
                  callBackData.checkValue ? resolve(callBackData) : reject(callBackData)
                }
              })
              .catch(function (error) {
                console.error(error)
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({ alContent: '', alTitle: '', checkValue: false })
              })
          })
        })
      )
    },
    // editProductionMark拷贝，把提示框去掉
    editProductionMarkTwo(thisGantt, task, nameKey, mId, title) {
      const that = this
      const parentNode = thisGantt.getTask(task.parent) // 父任务
      const recordName = task.name // 任务名称

      const nameKeys = nameKey.split(',')
      if (nameKey === '外包件齐套' && recordName === '外包件齐套') {
        const alContent = '必须包含外包件名称，如：光码盘外包件齐套'
        const alTitle = ''
        return { alContent, alTitle, checkValue: false }
      }
      // 生产/试制任务可以主动标记
      if (nameKey === '生产/试制') {
        that.updateProductPlanType(thisGantt, task, mId)
        return { alContent: '', alTitle: '', checkValue: true }
      }
      const markFlag = nameKeys.some(function (item) {
        return recordName.indexOf(item) !== -1
      })
      /* 任务名称中包含备料数组中的某一个元素则符合生产标记规则 */
      if (markFlag) {
        that.updateProductPlanType(thisGantt, task, mId)
      } else {
        const alContent = '活动名称应包含[' + nameKey + ']字段'
        const alTitle = ''
        return { alContent, alTitle, checkValue: markFlag }
      }
      return { alContent: '', alTitle: '', checkValue: markFlag }
    },
    editProductionMark(thisGantt, task, nameKey, mId, title) {
      const that = this
      const parentNode = thisGantt.getTask(task.parent) // 父任务
      const recordName = task.name // 任务名称

      const nameKeys = nameKey.split(',')
      if (nameKey === '外包件齐套' && recordName === '外包件齐套') {
        const alContent = '必须包含外包件名称，如：光码盘外包件齐套'
        const alTitle = ''
        that.$alert(alContent, alTitle, {
          confirmButtonText: '确定'
        })
        return
      }
      // 生产/试制任务可以主动标记
      if (nameKey === '生产/试制') {
        that.updateProductPlanType(thisGantt, task, mId)
        return
      }
      const markFlag = nameKeys.some(function (item) {
        return recordName.indexOf(item) !== -1
      })
      /* 任务名称中包含备料数组中的某一个元素则符合生产标记规则 */
      if (markFlag) {
        that.updateProductPlanType(thisGantt, task, mId)
        // 同时需要判断父亲任务id应该是必须包含交付关键字 （20210318 去除父节点的校验）
        // if (parentNode.name.indexOf('交付') !== -1 || parentNode.name.indexOf('生产') !== -1 || parentNode.name.indexOf('投产') !== -1) {
        //   that.updateProductPlanType(thisGantt, task, mId)
        // } else {
        //   // that.vueThis.$message({
        //   //   message: '当前活动父亲任务生产类型所设活动名称规则，必须包含交付、生产、投产关键字规则，否则无法保存。',
        //   //   type: 'error',
        //   //   duration: 5000,
        //   //   showClose: true,
        //   //   onClose: (v) => {
        //   //     v.close()
        //   //   }
        //   // })
        //   // that.$confirm({
        //   //   message: '当前活动父亲任务生产类型所设活动名称规则，必须包含交付、生产、投产关键字规则，否则无法保存。',
        //   //   type: 'error'
        //   // })
        //   const alContent = '当前活动父亲任务生产类型所设活动名称规则，必须包含交付、生产、投产关键字规则，否则无法保存。'
        //   const alTitle = ''
        //   that.$alert(alContent, alTitle, {
        //     confirmButtonText: '确定'
        //   })
        // }
      } else {
        // 需要执行存储过程
        // that.vueThis.$message({
        //   message: '当前活动生产类型所设活动名称规则，应符合' + title + '规则，否则无法保存。主要包括[' + nameKey + ']',
        //   type: 'error',
        //   duration: 5000,
        //   showClose: true,
        //   onClose: (v) => {
        //     v.close()
        //   }
        // })
        // const alContent = '当前活动生产类型所设活动名称规则，应符合' + title + '规则，否则无法保存。主要包括[' + nameKey + ']'
        const alContent = '当前活动名称应包含[' + nameKey + ']字段'
        const alTitle = ''
        that.$alert(alContent, alTitle, {
          confirmButtonText: '确定'
        })
      }
    },
    updateProductPlanType(thisGantt, task, mId) {
      const that = this
      // let parentTask = thisGantt.getTask(task.parent)
      if (mId) {
        // that.updatePlanType(thisGantt, parentTask, '3103')
        that.updatePlanType(thisGantt, task, mId)
      } else {
        // 当为子任务时 删除父及自身 当为父任务时 删除子及自身
        const parentId = ''
        that.updatePlanType(thisGantt, task, mId)
        if (thisGantt.hasChild(task.id)) {
          that.updatePlanType(thisGantt, task, mId)
          that.deleteProductPlanType(task.id, '')
          // thisGantt.eachTask(function (t) {
          //   if (t.planType && t.planType.indexOf('3103') !== -1) {
          //     that.updatePlanType(thisGantt, t, mId)
          //     that.deleteProductPlanType(t.id, '')
          //   }
          // }, task.id)
        } else {
          // 当同级存在生产/试制标识时不能删除父节点标识(去除此项限定)
          // let productNum = 0
          // thisGantt.eachTask(function (t) {
          //   if (t.planType && t.planType.indexOf('3103') !== -1) {
          //     productNum++
          //   }
          // }, task.parent)
          // if (productNum === 0) {
          //   parentId = task.parent
          //   that.updatePlanType(thisGantt, parentTask, mId)
          // }
        }
        that.deleteProductPlanType(task.id, parentId)
      }
    },
    deleteProductPlanType(projectTasksId, parentId) {
      // 删除挂接的产品
      const that = this
      that.$api['productTask.deleteProductPlanType']({ projectTasksId: projectTasksId, parentId: parentId })
        .then(function (res) {
          if (res) {
          }
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    updatePlanType(thisGantt, task, mId) {
      const that = this
      const parentTask = thisGantt.getTask(task.parent)
      if (mId && mId !== '3103' && mId !== '310303' && mId !== '') {
        if (parentTask && parentTask.batchNumber) {
          console.log('parentTask.batchNumber', parentTask.batchNumber)
          task.batchNumber = parentTask.batchNumber
          task.mapCode = parentTask.mapCode
          task.mapName = parentTask.mapName
          task.productCode = parentTask.productCode
          const child = thisGantt.getChildren(task.parent)
          let hasSameType = true
          child.forEach(function (childId) {
            const taskData = thisGantt.getTask(childId)
            if (taskData.planType === mId) {
              hasSameType = false
            }
          })
          if (hasSameType) {
            task.productQuantity = parentTask.productQuantity
          }
        }
      } else {
        task.batchNumber = mId && mId === '310303' ? parentTask.batchNumber : ''
        task.mapCode = ''
        task.mapName = ''
        task.productCode = ''
        task.productQuantity = ''
      }
      task.planType = mId
      beforeUpdateTask(thisGantt, that.vueThis.ganttName, task.id)
      thisGantt.updateTask(task.id)
      // 缓存数据
      setNewTaskMap(that.vueThis, thisGantt.getTask(task.id), null, 'task')
    }
  }
}
</script>
<style scoped>
.group .child-group {
  float: left;
}
</style>
