<!---->
<template>
  <div style="height: 100%">
    <div ref="myGantt" style="width: 100%; height: calc(100% - 56px)"></div>
    <el-button type="primary" size="medium" style="float: right; margin: 10px" @click="createTasks">添加到当前计划</el-button>
  </div>
</template>
<style lang="scss" scoped>
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '@/assets/commonJS/ganttJS/ganttObject.css';

.edit_gantt_user_list {
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;

  span {
    padding: 5px;
    border-bottom: #cccccc;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
<script>
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { TaskPreview } from '../js/TaskPreview'

let myGantt
export default {
  name: 'PlanGantt',
  props: {
    taskData: {
      type: String,
      default: () => {
        return '{}'
      }
    }
  },
  data() {
    return {
      planInfoId: '',
      ganttName: 'TaskPreview',
      taskClassifyDatas: [],
      monitorPointDatas: [],
      dependentDatas: [],
      searchForm: {},
      columnSettings: [],
      reminderList: [],
      monitorLockMap: {}, // 标识锁定状态
      managerStatusMap: {}, // 管理状态全部数据
      taskStatusMap: {},
      issueStatus: '', // 任务待下发状态
      extendMap: {},
      viewType: 'grid', // 视图类型，默认只显示列表
      extraMap: {}
    }
  },
  computed: {
    taskList() {
      return JSON.parse(this.taskData).newTaskListByView || []
    },
    links() {
      return JSON.parse(this.taskData).projectTasksPredecessorsListByView || []
    }
  },
  created() { },
  mounted() {
    this.initGantt(this.projectId, this.viewType)
  },
  methods: {
    async initGantt() {
      const vueThis = this
      // 清空原有数据
      this.selectedTasks = []
      myGantt = GanttObject.getGanttObject(vueThis.ganttName)
      if (myGantt) {
        GanttObject.setGanttObject(vueThis.ganttName, {})
        myGantt.destructor()
      }
      // 初始化对象
      myGantt = TaskPreview(vueThis.ganttName, vueThis)
      myGantt.config.scale_height = 50
      myGantt.config.layout = GanttObject.layout4
      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      this.$bus.$emit('ganttInit')
      // 加载数据
      this.loadGanttData(this.projectId)
    },
    loadGanttData() {
      // 初始化数据
      const datas = {
        tasks: this.taskList,
        links: this.links
      }
      myGantt.parse(datas)

      myGantt.batchUpdate(function () {
        myGantt.eachTask(function (task) {
          // 判断是否为根节点（根据业务逻辑，根节点通常没有父节点）
          myGantt.open(task.id)
        })
      })
    },
    createTasks() {
      this.$api['planGanttManager.createTasks']({ ...JSON.parse(this.taskData) })
        .then((res) => {
          if (res) {
            this.$emit('success')
          } else {
            this.$message({
              type: 'error',
              message: '添加失败'
            })
          }
        })
        .catch((err) => {
          this.$message({
            type: 'error',
            message: '添加失败'
          })
        })
    }
  }
}
</script>
