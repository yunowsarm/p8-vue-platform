<template>
  <div style="height: 100%; position: relative">
    <div v-if="menuVisible" class="actionMenu" :style="{ top: dropdownTop, left: dropdownLeft }">
      <el-menu>
        <el-submenu>
          <span slot="title"
            ><span @click="addTask(1, 'Child')"> <i class="el-icon-setting"></i><span>新建下级</span> </span></span
          >
          <el-menu-item>
            <div @click.stop="addTask(2, 'Child')">2条</div>
          </el-menu-item>
          <el-menu-item>
            <div @click.stop="addTask(4, 'Child')">4条</div>
          </el-menu-item>
          <el-menu-item>
            <div @click.stop="addTask(6, 'Child')">6条</div>
          </el-menu-item>
          <el-menu-item>
            <div @click.stop="addTask(8, 'Child')">8条</div>
          </el-menu-item>
        </el-submenu>
        <!--<el-submenu>-->
        <!--<span slot='title'><span @click='addTask(1,'Before')'><i class='el-icon-setting'></i><span>新建同级上方插入</span></span></span>-->
        <!--<a-menu-item><div @click='addTask(2,'Before')'>2条</div></a-menu-item>-->
        <!--<a-menu-item><div @click='addTask(4,'Before')'>4条</div></a-menu-item>-->
        <!--<a-menu-item><div @click='addTask(6,'Before')'>6条</div></a-menu-item>-->
        <!--<a-menu-item><div @click='addTask(8,'Before')'>8条</div></a-menu-item>-->
        <!--</el-submenu>-->
        <el-submenu>
          <span slot="title"
            ><span @click="addTask(1, 'Before')"> <i class="el-icon-setting"></i><span>新建同级插入</span> </span></span
          >
          <el-menu-item>
            <div @click="addTask(2, 'Before')">2条</div>
          </el-menu-item>
          <el-menu-item>
            <div @click="addTask(4, 'Before')">4条</div>
          </el-menu-item>
          <el-menu-item>
            <div @click="addTask(6, 'Before')">6条</div>
          </el-menu-item>
          <el-menu-item>
            <div @click="addTask(8, 'Before')">8条</div>
          </el-menu-item>
        </el-submenu>
        <el-menu-item @click="outdent()">
          <i class="el-icon-setting"></i>
          <span>升级</span>
        </el-menu-item>
        <el-menu-item @click="indent()">
          <i class="el-icon-setting"></i>
          <span>降级</span>
        </el-menu-item>
        <el-menu-item @click="removeTask">
          <i class="el-icon-setting"></i>
          <span>删除</span>
        </el-menu-item>
        <el-menu-item @click="processImprove">
          <i class="el-icon-setting"></i>
          <span>导入</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div style="height: 700px" ref="gantt"></div>
  </div>
</template>

<script>
import { Menu, Submenu, MenuItem } from 'p8-components-ui'
import { gantt } from 'p8-dhtmlx-gantt'
let dp
export default {
  name: 'Gantt',
  components: {
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-menu-item': MenuItem
  },
  props: {
    tasks: {
      type: Object,
      default() {
        return { data: [], links: [] }
      }
    },
    flowId: {
      type: String,
      default: ''
    },
    loadTaskUrl: {
      type: Function,
      default: null
    },
    updateTaskUrl: {
      type: Function,
      default: null
    },
    createTaskUrl: {
      type: Function,
      default: null
    },
    deleteTaskUrl: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      isFilter: false,
      dataProcessor: null,
      menuVisible: false,
      dropdownTop: '0px',
      dropdownLeft: '0px',
      taskId: ''
    }
  },
  mounted: function () {
    gantt.clearAll()
    const vueThis = this
    gantt.plugins({
      multiselect: true,
      undo: true
    })

    gantt.config.grid_width = 600
    gantt.config.order_branch = true
    gantt.config.order_branch_free = true
    gantt.config.date_format = '%Y-%m-%d %H:%i' // 初始化日期
    gantt.config.lightbox = false // 禁止lightbox
    gantt.config.cascade_delete = false // 禁用联级删除
    gantt.config.layout = {
      css: 'gantt_container',
      rows: [
        {
          cols: [
            { view: 'grid', id: 'grid', scrollX: 'scrollHor', scrollY: 'scrollVer' },
            { resizer: true, width: 1 },
            { view: 'scrollbar', scroll: 'y', id: 'scrollVer' }
          ]
        }
      ]
    }
    gantt.config.columns = [
      {
        name: 'flag',
        label: '操作',
        width: '15',
        align: 'center',
        template: function (task) {
          return '<span onclick="gantt.taskOperations(event,' + task.id + ')">√√</span>'
        }
      },
      { name: 'id', hide: true },
      // {name: 'sortorder',hide: true},
      { name: 'wbs', label: '大纲', width: '35', align: 'left', template: gantt.getWBSCode },
      { name: 'text', label: '活动名称', tree: true, align: 'left' },
      { name: 'code', label: '活动编号', width: '35', align: 'center' }
    ]

    gantt.task_operations = function taskOperations(event, taskId) {
      const x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft + 10
      const y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop + 10
      vueThis.menuVisible = true
      vueThis.dropdownTop = y + 'px'
      vueThis.dropdownLeft = x + 'px'
      vueThis.taskId = taskId
    }

    const cascadeAction = {
      indentAction: true,
      outdentAction: true
    }

    const actions = {
      indentAction: function indent(taskId) {
        let prevId = gantt.getPrevSibling(taskId)
        while (gantt.isSelectedTask(prevId)) {
          const prev = gantt.getPrevSibling(prevId)
          if (!prev) break
          prevId = prev
        }
        if (prevId) {
          const newParent = gantt.getTask(prevId)
          newParent.updateType = 'indent'
          gantt.moveTask(taskId, gantt.getChildren(newParent.id).length, newParent.id)
          newParent.type = gantt.config.types.project
          newParent.$open = true

          gantt.batchUpdate(function () {
            const task = gantt.getTask(taskId)
            task.updateType = 'indent'
            gantt.updateTask(taskId)
            gantt.updateTask(newParent.id)

            task.updateType = ''
            newParent.updateType = ''
          })
          return taskId
        }
        return null
      },
      outdentAction: function outdent(taskId, initialIndexes, initialSiblings) {
        const curTask = gantt.getTask(taskId)
        const oldParent = curTask.parent
        curTask.updateType = 'outdent'
        const oldParenrPar = gantt.getTask(oldParent).parent
        if (gantt.isTaskExists(oldParent) && oldParent !== gantt.config.root_id && oldParenrPar !== gantt.config.root_id) {
          // 升级不能升到和根平级
          let index = gantt.getTaskIndex(oldParent) + 1
          const prevSibling = initialSiblings[taskId].first

          if (gantt.isSelectedTask(prevSibling)) {
            index += initialIndexes[taskId] - initialIndexes[prevSibling]
          }
          gantt.moveTask(taskId, index, gantt.getParent(curTask.parent))
          if (!gantt.hasChild(oldParent)) {
            gantt.getTask(oldParent).type = gantt.config.types.task
          }

          // 区分升降级
          const task = gantt.getTask(taskId)
          task.updateType = 'outdent'
          gantt.updateTask(taskId)
          gantt.updateTask(oldParent)
          curTask.updateType = ''
          task.updateType = ''
          return taskId
        }
        return null
      }
    }

    gantt.performAction = function (actionName) {
      const action = actions[actionName]
      gantt.batchUpdate(function () {
        const indexes = {}
        const siblings = {}
        gantt.eachSelectedTask(function (taskId) {
          indexes[taskId] = gantt.getTaskIndex(taskId)
          siblings[taskId] = {
            first: null
          }
          let currentId = taskId
          while (gantt.isTaskExists(gantt.getPrevSibling(currentId)) && gantt.isSelectedTask(gantt.getPrevSibling(currentId))) {
            currentId = gantt.getPrevSibling(currentId)
          }
          siblings[taskId].first = currentId
        })

        const updated = {}
        gantt.eachSelectedTask(function (taskId) {
          if (cascadeAction[actionName]) {
            if (!updated[gantt.getParent(taskId)]) {
              const updatedId = action(taskId, indexes, siblings)
              updated[updatedId] = true
            } else {
              updated[taskId] = true
            }
          } else {
            action(taskId, indexes)
          }
        })
      })
    }

    // 行选中事件-根节点不可选中
    gantt.attachEvent('onTaskSelected', (id) => {
      if (gantt.getGlobalTaskIndex(id) !== 0) {
        this.$emit('task-selected', id)
      } else {
        gantt.unselectTask()
      }
    })

    // 初始化gantt容器
    gantt.init(this.$refs.gantt)

    // 初始化数据
    const datas = { tasks: [] }
    if (this.flowId) {
      const that = this
      that
        .loadTaskUrl({ flowId: this.flowId })
        .then(function (res) {
          if (res.data && res.data.content) {
            const data = res.data.content
            if (data && data.treeData) {
              datas.tasks = data.treeData
              gantt.parse(datas)
            }
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
      // 初始化数据控制器
      dp = gantt.createDataProcessor(function (entity, action, data, id) {
        switch (action) {
          // case 'create':
          //     return new gantt.Promise(function(resolve, reject) {
          //         return resolve({tid: id});
          //     });
          //     break;
          case 'update':
            vueThis
              .updateTaskUrl({ ganttVo: data })
              .then(function (res) {
                if (res.data && res.data.content && res.data.content.vo && res.data.content.vo.ganttVo) {
                  return { update: true }
                } else {
                  gantt.ext.undo.undo()
                }
              })
              .catch(function (error) {
                console.error('error' + error)
                gantt.ext.undo.undo()
              })
            break
          case 'delete':
            const keys = []
            keys.push(id)
            vueThis
              .deleteTaskUrl({ keys: keys })
              .then(function (res) {
                if (res.data && res.data.content === 'success') {
                  vueThis.$notification.success({
                    message: '操作提示',
                    description: '删除成功！'
                  })
                  return { action: 'deleted' }
                } else {
                  vueThis.$notification.error({
                    message: '操作提示',
                    description: '删除失败！'
                  })
                  gantt.ext.undo.undo()
                }
              })
              .catch(function (error) {
                console.error('error' + error)
                gantt.ext.undo.undo()
              })
            break
        }
      })
    }
  },
  destroyed() {
    dp.destructor()
  },
  watch: {
    menuVisible: function (newVal, oldVal) {
      if (newVal) {
        setTimeout(() => {
          document.addEventListener('click', this.hideMenu)
        })
      } else {
        document.removeEventListener('click', this.hideMenu)
      }
    }
  },
  methods: {
    destructorDp() {
      dp.destructor()
    },
    hideMenu() {
      this.menuVisible = false
    },
    addTask(num, pos) {
      const that = this
      // 模拟添加
      const taskId = this.taskId
      const task = gantt.getTask(taskId)
      const parent = task.parent
      switch (pos) {
        case 'Before':
          // 同级上方插入
          // 根节点不可插入
          if (gantt.getGlobalTaskIndex(taskId) !== 0) {
            that
              .createTaskUrl({ flName: '新活动', parentId: taskId, insertNum: num, insertType: 'Before' })
              .then(function (res) {
                if (res.data && res.data.content && res.data.content.vo) {
                  gantt.batchUpdate(function () {
                    res.data.content.vo.forEach(function (item) {
                      const task = {
                        id: item.flowId,
                        text: '新活动',
                        open: true
                      }
                      gantt.addTask(task, parent, gantt.getTaskIndex(taskId))
                    })
                  })
                  gantt.refreshData()
                }
              })
              .catch(function (error) {
                console.error('error' + error)
              })
          } else {
            that.$notification.error({
              message: '操作提示',
              description: '根节点不可新建同级！'
            })
          }
          break
        // case 'After':
        //     //同级下方插入
        //     gantt.batchUpdate(function () {
        //         for (let i = 0; i < num; i++) {
        //             gantt.addTask({
        //                 text: '新活动',
        //                 open: true
        //             }, parent, gantt.getTaskIndex(taskId)+1);
        //         }
        //     })
        //     break
        case 'Child':
          // 新建下级
          that
            .createTaskUrl({ flName: '新活动', parentId: taskId, insertNum: num, insertType: 'Child' })
            .then(function (res) {
              if (res.data && res.data.content && res.data.content.vo) {
                gantt.batchUpdate(function () {
                  res.data.content.vo.forEach(function (item) {
                    const task = {
                      id: item.flowId,
                      parent: item.parentId,
                      text: '新活动',
                      open: true
                    }
                    gantt.addTask(task, taskId, 100000)
                    // dp.setUpdated(item.flowId, true, 'created')
                  })
                })
                gantt.refreshData()
              }
            })
            .catch(function (error) {
              console.error('error' + error)
            })
          break
      }
      this.menuVisible = false
    },
    // 降级
    indent() {
      gantt.performAction('indentAction')
    },
    // 升级
    outdent() {
      gantt.performAction('outdentAction')
    },
    // 删除
    removeTask() {
      const taskId = this.taskId
      gantt.batchUpdate(function () {
        gantt.deleteTask(taskId)
      })
      this.menuVisible = false
    },
    processImprove() {},
    // 活动描述名称修改保存后联动修改数据对应名称
    updateTaskName(obj) {
      if (obj) {
        const task = gantt.getTask(obj.flowId)
        if (task) {
          task.text = obj.flName
          task.code = obj.flCode
          gantt.refreshTask(obj.flowId)
        }
      }
    },
    saveData: function () {
      this.dataProcessor.sendData()
    },

    refreshData() {
      this.isFilter = true
      gantt.refreshData()
    }
  }
}
</script>
<style>
.actionMenu {
  width: 180px;
  position: fixed;
  z-index: 999;
  border: 1px solid #eeeeee;
}
.ant-menu-vertical > .ant-menu-item,
.ant-menu-vertical > .ant-menu-submenu > .ant-menu-submenu-title {
  height: 28px;
  line-height: 28px;
}
.ant-dropdown-menu-submenu-title .anticon {
  font-size: 14px;
  margin-right: 8px;
}
.ant-dropdown-menu-submenu-title span:not(.ant-dropdown-menu-submenu-arrow) {
  margin-right: 5px;
}
</style>
