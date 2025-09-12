<template>
  <div style="height: calc(100% - 20px); margin: 10px 10px 0px 10px">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="任务完成审批" name="first">
        <table-render ref="tableRender" :report-param="reportParam" code="historicalApprovalRecordTable">
          <template #OPERATION="{ scope }">
            <el-button type="text" v-if="toolbarWritingDisplay === '0'" @click="view(scope.row)">查看</el-button>
            <el-tooltip v-if="toolbarWritingDisplay === '1'" placement="top" content="查看">
              <el-button type="text" icon="p8 icon-chakan" @click="view(scope.row)"></el-button>
            </el-tooltip>
            <el-button type="text" v-if="toolbarWritingDisplay === '2'" icon="p8 icon-chakan" @click="view(scope.row)">查看</el-button>
          </template>
        </table-render>
      </el-tab-pane>
    </el-tabs>
    <common-drawer v-if="analysisVisible" size="100%" class="manager-drawer" title="审批查看" :visible="analysisVisible" @close="onDrawerClose">
      <template #drawer>
        <div class="approveContent">
          <common-tabs class="custom-tabs" type="border-card" :active-tabs="activeTabs" :has-full-screen="true" :keep-bottom="true" @tab-click="tabsClick" :tabs-data="tabs">
            <template #approval>
              <taskApproveView :business-key="taskId" page-type="view"></taskApproveView>
            </template>
            <template #bpmn>
              <bpm-view
                v-if="processDefId !== '' && activeTabs == 'bpmn'"
                :style="{ height: tabsHeight, margin: '0px 0px 2px -333px !important;' }"
                :is-smart-form="true"
                :process-obj="{
                  processDefinitionId: processDefId,
                  processInstanceId: processInstId
                }"
              ></bpm-view>
            </template>
            <template #history>
              <ProcessHistoryList
                v-if="processInstId && activeTabs == 'history'"
                :columns="historyColumns"
                :process-inst-id="processInstId"
                :business-key="taskId"
                ref="ProcessHistory"
                :style="{ height: historyHeight + 'px' }"
                :table-flex="tableFlex"
              ></ProcessHistoryList>
            </template>
          </common-tabs>
        </div>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
import taskApproveView from '@/views/product/My/Work/Task/Components/taskApproveView'
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
  data() {
    return {
      activeName: 'first',
      comp: this,
      analysisVisible: false,
      selectRow: {},
      reportParam: {
        businessKey: this.taskId
      },
      toolbarWritingDisplay: '0',
      processInstId: '',
      processDefId: '',
      tableFlex: 315,
      historyHeight: document.documentElement.clientHeight - 100,
      historyColumnsTemp: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '计划名称',
          dataIndex: 'businessChildName',
          sortable: false,
          align: 'left'
        },
        {
          title: '审批意见',
          dataIndex: 'opinion',
          sortable: false,
          align: 'left'
        },
        {
          title: '审批结果',
          dataIndex: 'yesOrNo',
          sortable: false,
          width: '100px',
          align: 'center'
        },
        {
          title: '审批人',
          dataIndex: 'approveUser',
          sortable: false,
          width: '100px',
          align: 'center'
        },
        {
          title: '审批节点',
          dataIndex: 'processTaskName',
          sortable: false,
          align: 'center'
        },
        {
          title: '审批时间',
          dataIndex: 'approvalTime',
          sortable: false,
          width: '140px',
          align: 'center'
        }
      ]
    }
  },
  mounted() {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = '0'
    }
  },
  methods: {
    view(row) {
      this.analysisVisible = true
      this.selectRow = row
    },
    onDrawerClose() {
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
