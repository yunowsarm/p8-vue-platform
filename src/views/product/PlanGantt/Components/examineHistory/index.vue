<template>
  <div style="height: calc(100% - 20px);margin: 10px 10px 0px 10px;">
    <el-tabs v-model="activeName">
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
              <el-button type="text"
                         icon="p8 icon-chakan"
                         @click="view(scope.row)"></el-button>
            </el-tooltip>
            <el-button type="text"
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
        <div class="approveContent">
          <common-tabs class="custom-tabs"
                       type="border-card"
                       :active-tabs="activeTabs"
                       :hasFullScreen="true"
                       :keepBottom="true"
                       @tab-click="tabsClick"
                       :tabs-data="tabs">
            <template #approval>
              <taskApproveView :businessKey="taskId"
                               pageType="view"></taskApproveView>
            </template>
            <template #bpmn>
              <bpm-view v-if="processDefId !== '' && activeTabs == 'bpmn'"
                        :style="{ height: tabsHeight, margin: '0px 0px 2px -333px !important;'}"
                        :isSmartForm="true"
                        :process-obj="{
              processDefinitionId: processDefId,
              processInstanceId: processInstId
            }"></bpm-view>
            </template>
            <template #history>
              <ProcessHistoryList v-if="processInstId && activeTabs == 'history'"
                                  :columns="historyColumns"
                                  :process-inst-id="processInstId"
                                  :business-key="taskId"
                                  ref="ProcessHistory"
                                  :style="{ height: historyHeight + 'px' }"
                                  :table-flex="tableFlex"></ProcessHistoryList>
            </template>
          </common-tabs>
        </div>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import { P8Drawer as CommonDrawer, P8Tabs as CommonTabs, P8ProcessApproval as BpmView } from 'p8-components-ui'
import taskApproveView from '@/views/product/My/Work/Task/Components/taskApproveView';
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import ProcessHistoryList from '@/views/Framework/BusinessActivity/ProcessApproval/processHistoryList.vue'
export default {
  name: 'ExamineHistory',
  components: { ProcessHistoryList, CommonTabs, BpmView, CommonDrawer, taskApproveView, TableRender },
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
      tabs: [
        {
          label: '审批内容',
          name: 'approval',
          icon: 'icon-shenpineirong'
        },
        {
          label: '流程跟踪视图',
          name: 'bpmn',
          icon: 'icon-liuchenggenzongshitu'
        },
        {
          label: '审批历史',
          name: 'history',
          icon: 'icon-shenpilishi'
        }
      ],
      activeTabs: 'approval',
      comp: this,
      analysisVisible: false,
      selectRow: {},
      selectedApproval: {},
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
  mounted () {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = '0'
    }
  },
  methods: {

    tabsClick (val) {
      this.activeTabs = val.name
    },
    view (row) {
      this.analysisVisible = true
      this.selectRow = row
      this.processDefId = row.PROCESS_DEF_ID
      this.processInstId = row.PROCESS_INST_ID
    },
    onDrawerClose () {
      this.analysisVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .normal-layout {
  height: calc(100% - 0px) !important;
}
.approveContent {
  height: 100%;
  overflow: auto;
  .bpmnDiagram {
    height: 500px;
  }
  .contentBody {
    height: 100%;
  }
}
::v-deep .el-tabs {
  height: 98% !important;
}
</style>