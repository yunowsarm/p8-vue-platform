<template>
  <div style="height: 100%; position: relative;">
    <div class="header">
      <div class="activityButton">
        <div class="button"
             v-for="(item, index) in buttonList"
             :key="item.id"
             :class="{'is-disabled': isDisableFun(item)}">
          <el-tooltip effect="dark"
                      :content="item.title"
                      placement="top"
                      :key="index">
            <i :class="item.icon"
               @click="buttonClick(item)"></i>
          </el-tooltip>
        </div>
      </div>
      <!-- <search-form-list ref="search"
                        searchWidth="220px"
                        style="display: inline-block;vertical-align: middle;"
                        :dataSource="dataSource"
                        @search="search"
                        @re-set="reset">
      </search-form-list> -->
    </div>
    <div ref='myGantt'
         style='width:100%; height:calc(100% - 60px);'
         class="myActivityGantt"></div>
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
<style lang="scss" scoped>
#actionMenu {
  .el-menu--collapse {
    width: 164px;
  }
  .el-menu--collapse > .el-menu-item .el-submenu__icon-arrow,
  .el-menu--collapse > .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
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
.header {
  height: 50px;
  border-bottom: 1px solid #c6c6c6;
  margin-bottom: 10px;
}
.activityButton {
  width: 530px;
  line-height: 50px;
  display: inline-block;
  .button {
    display: inline-block;
    width: 25px;
    margin: 0 5px;
    i {
      font-size: 25px;
      color: #1890ff;
    }
  }
}
.search-wrapper {
  right: 15px;
  top: 5px;
}
.myActivityGantt {
  width: unset !important;
  padding-right: 10px;
  > div {
    width: 100%;
  }
}
.myActivityGantt ::v-deep {
  .gantt_layout_cell {
    border: none !important;
  }
  .gantt_grid_scale {
    border-bottom: 1px solid #c6c6c6 !important;
    background: #f0f2f4 !important;
    .gantt_grid_head_cell {
      background: #f0f2f4 !important;
      color: #000000 !important;
    }
  }
  .gantt_row {
    background-color: #fff;
    font-weight: 400 !important;
  }
  .gantt_row.odd {
    background-color: #f9f9f9;
  }
}
.is-disabled {
  cursor: not-allowed;
  i {
    color: #9ba0aa !important;
    pointer-events: none;
  }
}
</style>
<script>
import { Menu, Submenu, MenuItem } from 'p8-components-ui'
// import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
import { PlanRightMenuData } from '@/assets/commonJS/ganttJS/planRightMenuData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { outPutFlowGantt } from '@/assets/commonJS/ganttJS/outPutFlowGantt'
import { activityButtonData } from './activityButton'
import _ from 'lodash'
import Vue from 'vue'
// import { P8Search as SearchFormList } from 'p8-components-ui'
let myGantt
const ganttName = 'activityGantt'
export default {
  name: 'activityGantt',
  props: {
    activityInfoId: {
      type: String,
      default: null
    },
    row: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  components: {
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-menu-item': MenuItem,
    // SearchFormList
  },
  data () {
    return {
      menuVisible: false,
      currentTaskParentId: undefined,
      menuData: PlanRightMenuData,
      dropTop: '0px',
      dropLeft: '0px',
      selectedTasks: [],
      // buttonDatas: CommandButtonData,
      resourceConfig: {},
      resourceTemplates: {},
      selectTaskId: '',
      selectTaskName: '',
      planInfoStatus: '',
      detailVisible: false,
      mouseX: '',
      mouseY: '',
      buttonList: _.cloneDeep(activityButtonData),
      copyList: [],
      dataSource: [
        {
          type: 'text',
          labelText: '任务名称',
          fieldName: 'taskName',
          placeholder: '请输入任务名称'
        }
      ],
      logoList: []
    }
  },
  watch: {
    selectedTasks: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.callParentSelectTasks()
      }
    },
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
  mounted () {
    if (this.activityInfoId) {
      this.initGantt()
      this.callParentSelectTasks()
    }
  },
  async created () {
    let that = this
    await this.$api['dictionaryManagement.list']({ dicType: "ACTIVITY_TYPE" }).then(res => {
      that.logoList = res
      let list = []
      if (res && res.length) {
        res.forEach(el => {
          list.push({
            id: el.id,
            icon: el.icon,
            title: el.meaning,
            clickFun: function () {
              that.btnClick(el)
            },
            isDisableFun: function (tasks) {
              return that.isDisableFunCheck(tasks)
            }
          })
        })
      }
      that.buttonList.splice(7, 0, ...list)
    })
  },
  computed: {
    isDisableFun (item) {
      let that = this
      return function (item) {
        return item.isDisableFun(that.selectedTasks, that)
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
    buttonClick (btn) {
      btn.clickFun(this.selectedTasks, this, myGantt)
    },
    hideMenu () {
      this.menuVisible = false
    },
    initGantt (taskId) {
      // 清空原有数据
      if (myGantt) {
        myGantt.unselectTask()
        myGantt.parse({ tasks: [] })
        this.selectedTasks = []
        // myGantt = null
        GanttObject.setGanttObject(ganttName, {})
      }
      let vueThis = this
      // 初始化对象
      myGantt = outPutFlowGantt(ganttName, vueThis)
      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      // 加载数据
      this.loadGanttData(taskId)
    },
    loadGanttData (taskId) {
      this.$api['OutputFlow.loadAcivityData']({ activityInfoId: this.activityInfoId }).then(function (res) {
        if (res) {
          res.forEach(el => {
            el.durations = el.duration
          })
          // 初始化数据
          let datas = {
            tasks: res
          }
          myGantt.parse(datas)
          if (taskId) {
            myGantt.unselectTask();
            myGantt.selectTask(taskId);
          }
        }
      }).catch(function (error) {
        console.error('error' + error)
      })
    },
    btnClick (item) {
      if (this.selectedTasks && this.selectedTasks.length) {
        let that = this
        that.selectedTasks.forEach(el => {
          let task = myGantt.getTask(el.id)
          if (task) {
            task.type = item.id
            myGantt.updateTask(el.id)
          }
        })
      }
    },
    callParentSelectTasks () {
      this.$emit('select-task', this.selectedTasks, ganttName)
    },
    callExcelImportTasks () {
      let taskId = this.selectedTasks[0].id
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
      let taskId = this.selectedTasks.map(el => el.id)[0]
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
                that.loadGanttData(data[0].id)
                that.$emit('refrshDes')
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
                that.loadGanttData(data[0].id)
                that.$emit('refrshDes')
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
              that.loadGanttData(data[0].id)
              that.$emit('refrshDes')
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
      let that = this
      let taskId = this.selectedTasks.map(el => el.id)[0]
      myGantt.batchUpdate(function () {
        myGantt.deleteTask(taskId)
      })
      this.$emit('remove-task')
      Vue.$nextTick(() => {
        that.loadGanttData()
      })
      this.menuVisible = false
    },
    importTask () {
      this.callExcelImportTasks()
    },
    exportTask () {
      this.$api['OutputFlow.exportExcel']({ "activityInfoId": this.activityInfoId }, { responseType: 'blob' })
        .then((data) => {
          let fileName = this.row && this.row.length ? this.row[0].NAME : '活动管理'
          const date = new Date()
          const file_name = '【' + fileName + '】' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '_' + String(date.getHours()).padStart(2, '0') + '：' + String(date.getMinutes()).padStart(2, '0');
          const file_type = 'xlsx'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = `${file_name}.${file_type}`
          document.body.appendChild(link)
          link.click()
        })
        .finally(() => {
          // this.search.exportLoading = false
        })
    },
    // 活动描述名称修改保存后联动修改数据对应名称
    updateTaskName (obj) {
      // if (obj) {
      // let task = myGantt.getTask(obj.id)
      // if (task) {
      //   task.name = obj.name
      //   task.code = obj.code
      //   myGantt.refreshTask(obj.id)
      // }
      this.initGantt(obj.id)
      // }
    },
    saveData: function () {
      this.dataProcessor.sendData()
    },
    refreshData () {
      this.isFilter = true
      this.loadGanttData()
    },
    search () {

    },
    reset () {

    },
    isDisableFunCheck () {
      let tasks = this.selectedTasks
      let result = false
      if (tasks && tasks.length) {
        tasks.forEach(el => {
          if (el.type) {
            result = true
          }
          if (el.parent == 0) {
            result = true
          }
        })
      } else {
        result = true
      }
      return result
    }
  },
  beforeDestroy () {
    GanttObject.setGanttObject('activityGantt', {})
    myGantt.unselectTask()
    myGantt.parse({ tasks: [] })
    this.selectedTasks = []
    this.buttonList = []
    myGantt = null
  }
}
</script>
