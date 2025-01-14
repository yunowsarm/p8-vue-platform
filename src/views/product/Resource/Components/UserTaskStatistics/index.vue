<template>
  <div>
    <common-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      :width="dialogWidth"
      :showHandleBtn="dialogShowBtn"
      :dialogConfig="dialogConfig"
      :dialogHeight="dialogHeight"
      @close="dialogClose"
      @handle-cancel="dialogClose"
      @isfullscreen="isfullscreen"
    >
      <template #dialog>
        <div class="filter-form">
          <span style="font-weight: bold; font-size: 15px">统计范围：</span>
          <el-radio-group v-model="filterParam" @input="filterData">
            <el-radio label="1">本项目</el-radio>
            <el-radio label="2">跨负责项目</el-radio>
            <el-radio label="3">全部项目</el-radio>
          </el-radio-group>
        </div>
          <P8TableRender class='table_body' ref="tableRender" :code="tableConfig.code" :pagination='tableConfig.pagination' :permission-vo="tableConfig.permissionVo" :reportParam="tableConfig.sqlParam">
            <template #leafCount="{ scope }">
              <div class="task-count">
                <template v-if="scope.row.isAllProject">
                  <el-link @click.stop="opentDialogUserTask(scope.row,scope.column)">{{ scope.row.leafCount }}<i class="el-icon-view el-icon--right"></i></el-link>
                </template>
                <template v-else>
                  <span>{{ scope.row.leafCount }}</span>
                </template>
              </div>
            </template>
            <template #nonLeafCount="{ scope }">
              <div class="task-count">
                <template v-if="scope.row.isAllProject">
                  <el-link @click.stop="opentDialogUserTask(scope.row,scope.column)">{{ scope.row.nonLeafCount }}<i class="el-icon-view el-icon--right"></i></el-link>
                </template>
                <template v-else>
                  <span>{{ scope.row.nonLeafCount }}</span>
                </template>
              </div>
            </template>
            <template #allCount="{ scope }">
              <div class="task-count">
                <template v-if="scope.row.isAllProject">
                  <el-link @click.stop="opentDialogUserTask(scope.row,scope.column)">{{ scope.row.allCount }}<i class="el-icon-view el-icon--right"></i></el-link>
                </template>
                <template v-else>
                  <span>{{ scope.row.allCount }}</span>
                </template>
              </div>
            </template>
          </P8TableRender>
      </template>
    </common-dialog>
    <dialog-user-task v-if="visibleDialogUserTask" :dialogVisible="visibleDialogUserTask" :table-config="userTaskConfig" @close="closeDialogUserTask()"></dialog-user-task>
  </div>
</template>

<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import DialogUserTask from '../DialogUserTask/index.vue'

export default {
  name: 'DialogUserTaskStatistics',
  components: {
    CommonDialog,
    DialogUserTask
  },
  props: {
    tableConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dialogTitle: {
      type: String,
      default: '人员任务统计'
    },
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogWidth: {
      type: String,
      default: '60%'
    },
    dialogShowBtn: {
      type: Boolean,
      default: false
    },
    dialogConfig: {
      type: Object,
      default: () => {
        return {
          modal: true,
          'destroy-on-close': true,
          'append-to-body': true
        }
      }
    }
  },
  data() {
    return {
      visibleDialogUserTask:false,
      filterParam: '1',
      userTaskConfig:{
        code: 'undertakeTaskDetails',
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      },
      dialogHeight: 200,
      cutomHeight: 500
    }
  },
  mounted() {
    const dh = document.documentElement.clientHeight
    this.dialogHeight = dh * 0.7
  },
  methods: {
    opentDialogUserTask(row,column){
      const queryType = {
        mode: '=',
        relation: 'and',
        value: row.typeId
      }
      let nodeType = null
      if(column.title === '父任务'){
        nodeType = {
          mode: '=',
          relation: 'and',
          value: '10'
        }
      }else if(column.title === '子任务'){
        nodeType = {
          mode: '=',
          relation: 'and',
          value: '11'
        }
      }
      this.userTaskConfig.sqlParam ={...this.tableConfig.sqlParam,queryType,nodeType}
      this.visibleDialogUserTask = true
    },
    closeDialogUserTask() {
      this.visibleDialogUserTask = false
    },
    filterData(val) {
      this.$refs.tableRender.$refs.xTable.params.sqlParam.projectType.value = val
    },
    dialogClose() {
      this.$emit('close')
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.cutomHeight = document.documentElement.clientHeight - 115
      } else {
        this.cutomHeight = 500
      }
    }
  }
}
</script>

<style scoped>
.filter-form {
  margin: 12px;
}
.table_body ::v-deep .normal-layout{
  height: calc(100% - 70px);
}
</style>
