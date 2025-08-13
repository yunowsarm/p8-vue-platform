<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <normal-layout class="process-approval-layout"
                 layoutCode='PROCESS_APPROVAL'
                 :header-visible="false"
                 :full-height="true"
                 :normal-layout="layoutConfig">
    <template #west>
      <common-tabs class="custom-common-tabs"
                   :active-tabs="activeTabs"
                   type="border-card"
                   :tabs-data="tabs"
                   height="auto"
                   @tab-click="tabClick">
        <template #pending_label>
          <!-- <el-badge :value="pendingTotal"
                    :max="99"
                    class="item"></el-badge> -->
        </template>
        <template #pending>
          <pending-list v-if="activeTabs === 'pending'"
                        :approved-task-id="approvedTaskId"
                        :refresh-flag="refreshFlag"
                        @itemClick="select"
                        @selection="selectionChange"
                        ref="pending"></pending-list>
        </template>

        <template #claim_label>
          <el-badge :value="claimTotal"
                    :max="99"
                    class="item"
                    type="warning"></el-badge>
        </template>
        <template #claim>
          <claim-list :approved-task-id="approvedTaskId"
                      @itemClick="claimSelect"
                      ref="claim"></claim-list>
        </template>

        <template #history>
          <history-list v-if="activeTabs === 'history'"
                        @itemClick="historySelect"
                        :refresh-flag="refreshFlag"
                        ref="history"></history-list>
        </template>

        <template #initiated>
          <initiated-list v-if="activeTabs === 'initiated'"
                          @itemClick="initiatedSelected"
                          :refresh-flag="refreshFlag"
                          ref="initiated"></initiated-list>
        </template>
      </common-tabs>
      <!--   批量审批弹出框   -->
      <batch-approval v-if="batchApprovalVisible"
                      :dialog-visible="batchApprovalVisible"
                      :selection="selection"
                      @close="batchApprovalClose"
                      @approved="approved"></batch-approval>
      <!--  批量审批按钮    -->
      <el-tooltip placement="top"
                  content="没有选择行记录时不可进行批量审批操作"
                  :disabled="selection.length !== 0">
        <span class="commonButton-style">
          <el-button type="primary"
                     :disabled="selection.length === 0"
                     @click="batchApproval"> 批量审批</el-button>
        </span>
      </el-tooltip>
      <refresh-btn class="refresh-style"
                   @refresh="refreshHandle"></refresh-btn>
    </template>
    <template #center>
      <approval v-if="activeTabs == 'pending' && pendingSelected"
                :selected-approval="pendingSelected"
                :data-source="approveDataSource"
                @approved="approved" />
      <claim v-else-if="activeTabs == 'claim' && claimSelected"
             :selected-approval="claimSelected"
             @approved="approved" />
      <history v-else-if="activeTabs == 'history' && historySelected"
               :selected-approval="historySelected" />
      <initiated v-else-if="activeTabs == 'initiated' && initiatedSelected"
                 :selected-approval="initiatedSelected" />
      <span v-else
            class="span-bg"></span>
    </template>
  </normal-layout>
</template>

<script>
import { P8Tabs as CommonTabs, P8NormalLayoutV1 as NormalLayout, Badge } from 'p8-components-ui'

import PendingList from './pendingList'
import ClaimList from './claimList'
import HistoryList from './historyList'
import InitiatedList from './initiatedList'
import Approval from './approval'
import Claim from './claim'
import History from './history'
import Initiated from './initiated'

import RefreshBtn from './refreshBtn'
import BatchApproval from './batchApproval'

export default {
  name: 'ProcessApproval',
  components: {
    CommonTabs,
    NormalLayout,
    PendingList,
    ClaimList,
    HistoryList,
    Approval,
    Initiated,
    InitiatedList,
    Claim,
    History,
    'el-badge': Badge,
    RefreshBtn,
    BatchApproval
  },
  data () {
    return {
      activeTabs: 'pending',
      pendingSelected: null,
      approveDataSource: [],
      claimSelected: null,
      historySelected: null,
      initiatedSelected: null,
      selection: [],
      batchApprovalVisible: false,
      claimTotal: 0,
      pendingTotal: 0,
      approvedTaskId: '',
      layoutConfig: {
        west: {
          xs: 11,
          sm: 10,
          md: 10,
          lg: 9,
          xl: 9
        },
        center: {
          xs: 13,
          sm: 14,
          md: 14,
          lg: 15,
          xl: 15
        }
      },
      tabs: [
        {
          label: '待处理',
          name: 'pending',
          icon: 'icon-daichuli'
        },
        // {
        //   label: '待认领',
        //   name: 'claim'
        // },
        {
          label: '已处理',
          name: 'history',
          icon: 'icon-yichuli'
        }
        // {
        //   label: '我发起的',
        //   name: 'initiated'
        // }
      ],
      refreshFlag: 1
    }
  },
  mounted () {
    const this_ = this
    this_.saveRemind()
    setInterval(function () {
      // if (this_.$refs &&
      //   this_.$refs.claim &&
      //   this_.$refs.pending) {
      //   this_.claimTotal = this_.$refs.claim.$data.pageInfo.total
      //   this_.pendingTotal = this_.$refs.pending.$data.pageInfo.total
      // }
      if (this_.$refs && this_.$refs.pending) {
        this_.pendingTotal = this_.$refs.pending.$data.pageInfo.total
      }
    }, 300)
  },
  computed: {},
  methods: {
    refreshHandle (flag) {
      this.refreshFlag = flag
      this.$refs.pending.$refs.table.clearSelection()
      this.selection = []
    },
    saveRemind () {
      this.$api['PersonalProcessApproval.saveApproveMsg']({ id: null }).then((res) => { })
    },
    select (r) {
      const options = [{ label: '通过', value: '1' }]
      if (r && (r.isMultipleInstance === '0' || r.taskDefKey.indexOf('notMultiInstance') !== -1)) {
        options.push({ label: '完善计划', value: '0' })
      }
      this.approveDataSource = [
        {
          type: 'radio', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'doubleCol',
          options: options,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'doubleCol',
          placeholder: '请输入审批意见'
        }
      ]
      this.pendingSelected = r
    },
    claimSelect (r) {
      this.claimSelected = r
    },
    historySelect (r) {
      this.historySelected = r
    },
    initiatedSelect (r) {
      this.initiatedSelected = r
    },
    approved (taskId) {
      this.approvedTaskId = taskId
      this.$emit('approved')
    },
    tabClick (target) {
      this.activeTabs = target.name
      this.refreshFlag = 0
    },
    batchApproval (record) {
      this.batchApprovalVisible = true
    },
    batchApprovalClose () {
      this.batchApprovalVisible = false
      this.refreshHandle(true)
    },
    reSearchTableData () {
      this.$refs.pending.$refs.table.searchData()
    },
    selectionChange (selection) {
      this.selection = selection
    }
  }
}
</script>

<style lang="scss" scoped>
// 隐藏 el-tabs列表上的border
.custom-common-tabs {
  height: calc(100% - 46px) !important;
  border: 0px;
  ::v-deep &.el-tabs--border-card {
    .el-tabs__nav {
      border: none;
      background: #f5f7fa;
    }
    .el-tabs__content {
      padding: 0;
    }
    .el-tabs__nav-wrap {
      margin-bottom: 0;
    }
  }
}
.process-approval-layout.normal-layout {
  box-shadow: 0px 0px 4px #a3a3a3;
  ::v-deep .normal-west {
    .scroll-area {
      height: 100% !important;
    }
  }
}
.refresh-style {
  position: absolute;
  right: 20px;
  top: 4px;
  z-index: 10;
}
.commonButton-style {
  position: absolute;
  right: 111px;
  top: 4px;
  z-index: 10;
}
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
.custom-common-tabs ::v-deep .el-tabs--border-card {
  border: none;
  box-shadow: none;
}
</style>
