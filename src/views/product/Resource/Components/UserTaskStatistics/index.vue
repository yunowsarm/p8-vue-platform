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
            <el-radio v-for='item in statisticalRange' :label="item.value" :key='item.value'>
              <span>{{item.name}}</span>
              <el-tooltip placement="top"
                          :content="item.tip">
                <i v-if="item.tip"
                   class="p8 icon-help-tips"></i>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </div>
          <P8TableRender class='table_body' ref="tableRender" :code="tableConfig.code" :pagination='tableConfig.pagination' :permission-vo="tableConfig.permissionVo" :reportParam="tableConfig.sqlParam">
            <template #leafCount="{ scope }">
              <div class="task-count">
                <template v-if="isAllowView(scope.row)">
                  <el-link @click.stop="opentDialogUserTask(scope.row,scope.column)">{{ scope.row.leafCount }}<i class="el-icon-view el-icon--right"></i></el-link>
                </template>
                <template v-else>
                  <span>{{ scope.row.leafCount }}</span>
                </template>
              </div>
            </template>
            <template #nonLeafCount="{ scope }">
              <div class="task-count">
                <template v-if="isAllowView(scope.row)">
                  <el-link @click.stop="opentDialogUserTask(scope.row,scope.column)">{{ scope.row.nonLeafCount }}<i class="el-icon-view el-icon--right"></i></el-link>
                </template>
                <template v-else>
                  <span>{{ scope.row.nonLeafCount }}</span>
                </template>
              </div>
            </template>
            <template #allCount="{ scope }">
              <div class="task-count">
                <template v-if="isAllowView(scope.row)">
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
      statisticalRange:[
        {
          name:'本项目',
          value:'1',
          tip:'仅统计团队人员在“当前所属项目”中的任务情况，支持钻取任务详情。'
        },
        {
          name:'跨负责项目',
          value:'2',
          tip:'统计该人员在“当前登陆人项目权限下”其所参与的“权限内”项目中的任务情况，支持钻取任务详情。'
        },
        {
          name:'全部项目',
          value:'3',
          tip:'统计该人员在其所参与的“所有”项目中的任务情况，登录人无“所有项目”权限时,不支持钻取任务详情。'
        }
      ],
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
    isAllowView(row){
      const {isAllProject} = row
      const statisticalRange = this.filterParam
      if(statisticalRange === '3'){
        return !!isAllProject;
      }else{
        return true
      }
    },
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
      const projectType = {
        mode: '=',
        relation: 'and',
        value: this.filterParam
      }
      this.userTaskConfig.sqlParam ={...this.tableConfig.sqlParam,projectType,queryType,nodeType}
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
