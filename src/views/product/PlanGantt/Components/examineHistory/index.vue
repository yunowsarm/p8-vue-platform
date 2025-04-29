<template>
  <div style="height: calc(100% - 20px);margin: 10px 10px 0px 10px;">
    <el-tabs v-model="activeName"
             @tab-click="handleClick">
      <el-tab-pane label="任务完成审批"
                   name="first">
        <table-render ref="tableRender"
                      :reportParam="reportParam"
                      code="historicalApprovalRecordTable">
          <template #OPERATION="{scope}">
            <el-button type='text'
                       v-if="toolbarWritingDisplay === '0'"
                       @click="view(scope.row)">查看</el-button>
            <el-tooltip v-if="toolbarWritingDisplay === '1'"
                        placement="top"
                        content="查看">
              <el-button type="primary"
                         icon="p8 icon-chakan"
                         @click="view(scope.row)"></el-button>
            </el-tooltip>
            <el-button type="primary"
                       v-if="toolbarWritingDisplay === '2'"
                       icon="p8 icon-chakan"
                       @click="view(scope.row)">查看</el-button>
          </template>
        </table-render>
      </el-tab-pane>
    </el-tabs>
    <common-drawer v-if="analysisVisible"
                   size="100%"
                   class="manager-drawer"
                   title="审批查看"
                   :visible="analysisVisible"
                   @close="onDrawerClose">
      <template #drawer>
        <taskApproveView :businessKey="taskId"
                         pageType="view"></taskApproveView>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
import taskApproveView from '@/views/product/My/Work/Task/Components/taskApproveView';
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'

export default {
  name: 'ExamineHistory',
  components: { CommonDrawer, taskApproveView, TableRender },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    planInfoId: {
      type: String,
      default: ''
    },
    createPage: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      activeName: 'first',
      comp: this,
      analysisVisible: false,
      selectRow: {},
      reportParam: {
        businessKey: this.taskId
      },
      toolbarWritingDisplay: '0'
    }
  },
  mounted () {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = '0'
    }
  },
  methods: {
    view (row) {
      this.analysisVisible = true
      this.selectRow = row
    },
    onDrawerClose () {
      this.analysisVisible = false
    }
  }
}
</script>

<style scoped>
::v-deep .normal-layout {
  height: calc(100% - 0px) !important;
}
</style>