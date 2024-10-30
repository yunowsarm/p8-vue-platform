<template>
  <nlcr-Layout :header-visible="false" :normal-layout="layoutConfig" class="customNlcr" :platform-visible="true" :left-use-perfect-scrollbar="false">
    <template #left>
      <div class="treeContain" style="height: 100%">
        <approve-catalog :msg-count="msgCatalogCount" :un-read-total="unReadTotal" :search-params="searchParams" :select-node-id="selectNodeId" @selectNode="queryMsgList"></approve-catalog>
      </div>
    </template>
    <template #center>
      <approve-list :search-params="searchParams" @select="select" :key="renderTime" :distinguish-ids="distinguishIds" :charge-ids="chargeIds" ref="approveList"></approve-list>
    </template>
    <template #right>
      <!-- 待处理 -->
      <approve-view v-if="searchParams.msgCatalog === 'APPROVE_TYPE_02_01' && pendingSelected" :selected-approval="pendingSelected" :data-source="approveDataSource" @approved="approved" />
      <!-- 已处理 || 审批中 || 已审批 -->
      <history v-else-if="distinguishIds.includes(searchParams.msgCatalog) && historySelected" :selected-approval="historySelected" />
      <span v-else class="span-bg"></span>
    </template>
  </nlcr-Layout>
</template>

<script>
import { P8NlcrLayout as nlcrLayout } from 'p8-components-ui'

import ApproveCatalog from './components/ApproveCatalog'
import ApproveList from './components/ApproveList'
import ApproveView from './components/ApproveView'
import History from './components/history'

export default {
  name: 'MyApprove',
  components: {
    'nlcr-Layout': nlcrLayout,
    'approve-catalog': ApproveCatalog,
    'approve-list': ApproveList,
    'approve-view': ApproveView,
    History
  },
  data() {
    return {
      chargeIds: ['APPROVE_TYPE_01_02', 'APPROVE_TYPE_02_02'],
      distinguishIds: ['APPROVE_TYPE_01_01', 'APPROVE_TYPE_01_02', 'APPROVE_TYPE_02_02'],
      toggleMsgStatusApi: 'userMessage.toggleStatus',
      deleteMsgApi: 'userMessage.delete',
      pendingSelected: null,
      historySelected: null,
      userCatalogCountApi: 'userMessage.userCatalogCount',
      userUnReadMessageCountApi: 'userMessage.userUnReadMessageCount',
      layoutConfig: {
        left: {
          xs: 3,
          sm: 3,
          md: 3,
          lg: 3,
          xl: 3
        },
        center: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
          xl: 6
        },
        right: {
          xs: 15,
          sm: 15,
          md: 15,
          lg: 15,
          xl: 15
        }
      },
      searchParams: {
        msgCatalog: 'APPROVE_TYPE_02_01',
        assigneeUserId: this.$store.state.user.userInfo.id
      },
      renderTime: new Date() + '',
      currentMessage: null,
      msgCatalogCount: [],
      unReadTotal: 0,
      selectNodeId: 'APPROVE_TYPE01' // 我的审批-审批树：默认选中'审批中'，id为'19'
    }
  },
  mounted() {
    this.userCatalogCount()
    // this.userUnReadMessageCount()
  },
  methods: {
    approved(taskId) {
      this.approvedTaskId = taskId
      this.$refs.approveList.refreshList()
    },
    selectMessage(messageData) {
      this.currentMessage = null
      this.currentMessage = messageData
    },
    select(r) {
      if (this.distinguishIds.includes(this.searchParams.msgCatalog)) {
        this.historySelected = r
      } else {
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
      }
    },
    queryMsgList(nodeData) {
      this.searchParams.msgCatalog = nodeData.id
      this.searchParams.assigneeUserId = ''
      this.searchParams.startUserId = ''
      this.renderTime = new Date() + ''
      if (nodeData.id === 'APPROVE_TYPE_01_02' || nodeData.id === 'APPROVE_TYPE_01_01') {
        this.searchParams.startUserId = this.$store.state.user.userInfo.id
      } else if (nodeData.id === 'APPROVE_TYPE_02_02' || nodeData.id === 'APPROVE_TYPE_02_01') {
        this.searchParams.assigneeUserId = this.$store.state.user.userInfo.id
      }
    },
    userCatalogCount(queryParam) {
      const params = queryParam != null ? queryParam : this.searchParams
      this.$api[this.userCatalogCountApi](params).then((res) => {
        this.msgCatalogCount = res
      })
    },
    // userUnReadMessageCount (queryParam) {
    //   this.$api[this.userUnReadMessageCountApi](queryParam).then(res => {
    //     if (res && res.messageCount) {
    //       this.unReadTotal = res.messageCount
    //     }
    //   })
    // },
    toggleStatus(msgId) {
      const msgIdArray = [msgId]
      const _this = this
      this.$api[this.toggleMsgStatusApi]({ idList: msgIdArray }).then((res) => {
        if (res && res.length > 0) {
          _this.currentMessage.msgStatus = res[0].msgStatus
          _this.userCatalogCount()
          _this.$store.dispatch('getMessageNum') // 获取消息信息已读未读条数
        }

        // console.log('isReload:', _this.isReload)
        // console.log('currentMessage', this.currentMessage)
        // console.log('toggleMsgStatusApi:', res)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.treeContain {
  /*padding-left: 10px;*/
  width: 100%;
  height: calc(100% - 50px);
  overflow: auto;
  box-sizing: border-box;
}
.list-div {
  height: calc(100% - 40px);
}
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  /* margin-top: 25px; */
}
.drawer_approval {
  box-shadow: 0px 0px 4px #a3a3a3;
}
.customNlcr {
  height: calc(100% - 66px);
  margin: 14px;
  .search-wrapper {
    float: left;
  }
  ::v-deep .splitBtn {
    z-index: 1;
  }
  ::v-deep .icon-youzhedie {
    left: -4px !important;
  }
}
</style>
