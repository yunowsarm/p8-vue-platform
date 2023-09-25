<template>
  <div style="height: 100%; position: relative;">
    <div id='actionMenu'
         v-if='menuVisible'
         ref='actionMenu'
         :style='{top:dropdownTop,left:dropdownLeft}'
         class="actionMenu">
      <el-menu mode="vertical"
               :collapse="true">
        <el-submenu v-if="menuIsView(1)"
                    index="1">
          <span slot="title">
            <span @click="addTask(1,'Child')">
              <i class="p8 icon-new-subordinate"></i>
              <span>&nbsp;新建下级</span>
            </span>
          </span>
          <el-menu-item index="1-1">
            <div @click.stop="addTask(2,'Child')">2条</div>
          </el-menu-item>
          <el-menu-item index="1-2">
            <div @click.stop="addTask(4,'Child')">4条</div>
          </el-menu-item>
          <el-menu-item index="1-3">
            <div @click.stop="addTask(6,'Child')">6条</div>
          </el-menu-item>
          <el-menu-item index="1-4">
            <div @click.stop="addTask(8,'Child')">8条</div>
          </el-menu-item>
        </el-submenu>
        <el-submenu v-if="menuIsView(2)"
                    index="2">
          <span slot="title">
            <span @click="addTask(1,'After')">
              <i class="p8 icon-new-sibling"></i>
              <span>&nbsp;新建同级插入</span>
            </span>
          </span>
          <el-menu-item index="2-1">
            <div @click="addTask(2,'After')">2条</div>
          </el-menu-item>
          <el-menu-item index="2-2">
            <div @click="addTask(4,'After')">4条</div>
          </el-menu-item>
          <el-menu-item index="2-3">
            <div @click="addTask(6,'After')">6条</div>
          </el-menu-item>
          <el-menu-item index="2-4">
            <div @click="addTask(8,'After')">8条</div>
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-if="menuIsView(3)"
                      @click="outdent()"
                      index="3">
          <i class="p8 icon-upgrade"></i>
          <span>&nbsp;升级</span>
        </el-menu-item>
        <el-menu-item v-if="menuIsView(4)"
                      @click="indent()"
                      index="4">
          <i class="p8 icon-downgrade"></i>
          <span>&nbsp;降级</span>
        </el-menu-item>
        <el-menu-item v-if="menuIsView(5)"
                      @click="removeTask"
                      index="5">
          <i class="p8 icon-delete"></i>
          <span>&nbsp;删除</span>
        </el-menu-item>
        <el-menu-item v-if="menuIsView(6)"
                      @click="importTask"
                      index="6">
          <i class="p8 icon-excel-import"></i>
          <span>&nbsp;导入</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div ref='myGantt'
         style='width:100%; height: 100%;'></div>
  </div>
</template>
<style>
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '../../../../assets/commonJS/ganttJS/ganttObject.css';

/* .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
    -webkit-transform: rotateZ(-90deg);
    -ms-transform: rotate(-90deg);
    transform: rotateZ(-90deg);
  }

  .el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
    -webkit-transform: rotateZ(0deg);
    -ms-transform: rotate(0deg);
    transform: rotateZ(0deg);
  } */
</style>
<style lang="scss">
#actionMenu {
  .el-menu--collapse {
    width: 164px;
  }
  .el-menu--collapse > .el-menu-item .el-submenu__icon-arrow,
  .el-menu--collapse
    > .el-submenu
    > .el-submenu__title
    .el-submenu__icon-arrow {
    display: block;
    margin-top: -5px;
  }
  .el-menu--collapse > .el-menu-item span,
  .el-menu--collapse > .el-submenu > .el-submenu__title span {
    height: 100%;
    width: 100%;
    visibility: visible;
    line-height: 36px;
  }
}
</style>
<script>
import { Menu, Submenu, MenuItem } from 'p8-components-ui'
import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
import { PlanRightMenuData } from '@/assets/commonJS/ganttJS/planRightMenuData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { outPutFlowGantt } from '@/assets/commonJS/ganttJS/outPutFlowGantt'

let myGantt
const ganttName = 'activityGantt'
export default {
  name: 'activityGantt',
  props: {
    activityInfoId: {
      type: String,
      default: null
    }
  },
  components: {
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-menu-item': MenuItem
  },
  data () {
    return {
      menuVisible: false,
      currentTaskParentId: undefined,
      menuData: PlanRightMenuData,
      dropTop: '0px',
      dropLeft: '0px',
      selectedTasks: [],
      buttonDatas: CommandButtonData,
      resourceConfig: {},
      resourceTemplates: {},
      selectTaskId: '',
      selectTaskName: '',
      planInfoStatus: '',
      detailVisible: false,
      mouseX: '',
      mouseY: ''
    }
  },
  watch: {
    selectedTasks: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.callParentSelectTasks()
      }
    },
    menuVisible: function (newVal, oldVal) {
      // alert(111)
      if (newVal) {
        setTimeout(() => {
          document.addEventListener('click', this.hideMenu)
        })
      } else {
        document.removeEventListener('click', this.hideMenu)
      }
    }
  },
  mounted () {
    if (this.activityInfoId) {
      this.initGantt(this.activityInfoId)
      this.callParentSelectTasks()
    }
  },
  computed: {
    isDisable () {
      let that = this
      return function (btnConfig) {
        let btnData = that.buttonDatas.filter(btn => btn.id === btnConfig.buttonId)
        return btnData[0].isDisableFun(null, ganttName, this.selectedTasks)
      }
    },
    buttonData () {
      let that = this
      return function (btnConfig) {
        let btnData = that.buttonDatas.filter(btn => btn.id === btnConfig.buttonId)
        return btnData[0]
      }
    },
    menuIsView (menuKey) {
      let that = this
      return function (menuKey) {
        let disabled = []
        if (that.currentTaskParentId === '0') {
          disabled = [2, 3, 4, 5]
        }
        return !disabled.find(k => k === menuKey)
      }
    }
  },
  methods: {
    hideMenu () {
      this.menuVisible = false
    },
    initGantt (activityInfoId) {
      // 清空原有数据
      if (myGantt) {
        GanttObject.setGanttObject(ganttName, {})
      }
      let vueThis = this
      // 初始化对象
      console.log(ganttName,'====ganttName');
      myGantt = outPutFlowGantt(ganttName, vueThis)
      console.log(myGantt,'===myGantt');
      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      // 加载数据
      this.$api['OutputFlow.loadAcivityData']({ activityInfoId: activityInfoId }).then(function (res) {
        if (res) {
          // 初始化数据
          let datas = {
            tasks: res
          }
          myGantt.parse(datas)
        }
      }).catch(function (error) {
        console.error('error' + error)
      })
    },
    btnClick (btn) {
      this.menuVisible = false
      btn.clickFun(null, ganttName, this.selectedTasks)
    },
    callParentSelectTasks () {
      this.$emit('select-task', this.selectedTasks, ganttName)
    },
    callExcelImportTasks () {
      let taskId = this.taskId
      this.$emit('importExcel', taskId, ganttName)
    },
    mouseMove (e) {
      if (this.menuVisible) {
        if ((this.mouseY - 30) > e.clientY || (this.mouseY + 30) < e.clientY || (this.mouseX - 30) > e.clientX || (this.mouseX + 30) < e.clientX) {
          this.menuVisible = false
        }
      }
    },
    addTask (num, pos) {
      let that = this
      // 模拟添加
      let taskId = this.taskId
      let task = myGantt.getTask(taskId)
      let parent = task.parent
      switch (pos) {
        case 'Before':
          // 同级上方插入
          // 根节点不可插入
          if (myGantt.getGlobalTaskIndex(taskId) !== 0) {
            that.$api['OutputFlow.saveNode']({
              name: '新活动',
              parent: taskId,
              insertNum: num,
              insertType: 'Before'
            }).then(function (res) {
              let data = res
              if (data) {
                myGantt.batchUpdate(function () {
                  data.forEach(function (item) {
                    let task = {
                      id: item.id,
                      name: '新活动',
                      open: true
                    }
                    myGantt.addTask(task, parent, myGantt.getTaskIndex(taskId))
                  })
                })
                myGantt.refreshData()
              }
            }).catch(function (error) {
              console.error('error' + error)
            })
          } else {
            that.$notification['error']({
              message: '操作提示',
              description: '根节点不可新建同级！'
            })
          }
          break
        case 'After':
          // 同级下方插入
          if (myGantt.getGlobalTaskIndex(taskId) !== 0) {
            that.$api['OutputFlow.saveNode']({
              name: '新活动',
              parent: taskId,
              insertNum: num,
              insertType: 'After'
            }).then(function (res) {
              let data = res
              if (data) {
                let nextTaskId = myGantt.getNextSibling(taskId)
                let indexNo = myGantt.getGlobalTaskIndex(taskId) + 1
                if (nextTaskId) {
                  indexNo = myGantt.getGlobalTaskIndex(nextTaskId)
                }
                myGantt.batchUpdate(function () {
                  data.forEach(function (item) {
                    let task = {
                      id: item.id,
                      name: '新活动',
                      open: true
                    }
                    myGantt.addTask(task, parent, indexNo)
                  })
                })
                myGantt.refreshData()
              }
            }).catch(function (error) {
              console.error('error' + error)
            })
          } else {
            that.$notification['error']({
              message: '操作提示',
              description: '根节点不可新建同级！'
            })
          }
          break
        case 'Child':
          // 新建下级
          that.$api['OutputFlow.saveNode']({
            name: '新活动',
            parent: taskId,
            insertNum: num,
            insertType: 'Child'
          }).then(function (res) {
            let data = res

            if (data) {
              myGantt.batchUpdate(function () {
                data.forEach(function (item) {
                  let task = {
                    id: item.id,
                    parent: item.parent,
                    name: '新活动',
                    open: true
                  }
                  myGantt.addTask(task, taskId, 100000)
                  // dp.setUpdated(item.flowId, true, "created");
                })
              })
              myGantt.refreshData()
            }
          }).catch(function (error) {
            console.error('error' + error)
          })
          break
      }
      this.menuVisible = false
    },
    // 降级
    indent () {
      myGantt.performAction('indentAction')
    },
    // 升级
    outdent () {
      myGantt.performAction('outdentAction')
    },
    // 删除
    removeTask () {
      let taskId = this.taskId
      myGantt.batchUpdate(function () {
        myGantt.deleteTask(taskId)
      })
      this.$emit('remove-task')
      this.menuVisible = false
    },
    importTask () {
      this.callExcelImportTasks()
    },
    // 活动描述名称修改保存后联动修改数据对应名称
    updateTaskName (obj) {
      if (obj) {
        let task = myGantt.getTask(obj.id)
        if (task) {
          task.name = obj.name
          task.code = obj.code
          myGantt.refreshTask(obj.id)
        }
      }
    },
    saveData: function () {
      this.dataProcessor.sendData()
    },
    refreshData () {
      this.isFilter = true
      myGantt.refreshData()
    }
  }
}
</script>
