<template>
  <normal-Layout :header-visible="false" layoutCode='MY_APPROVE'>
    <template #west>
      <div class="treeContain"
           style="height: 100%">
        <approve-catalog :msg-count="msgCatalogCount"
                         :key="dateTime"
                         :un-read-total="unReadTotal"
                         :search-params="searchParams"
                         :select-node-id="selectNodeId"
                         @selectNode="queryMsgList"></approve-catalog>
      </div>
    </template>
    <template #center>
      <nlcr-Layout :header-visible="false"
                   :normal-layout="layoutConfig"
                   class="customNlcr"
                   :platform-visible="true"
                   :left-use-perfect-scrollbar="false">
        <template #center>
          <approve-list :search-params="searchParams"
                        @select="select"
                        @refreshList="refreshList"
                        :key="renderTime"
                        :distinguish-ids="distinguishIds"
                        :charge-ids="chargeIds"
                        ref="approveList"></approve-list>
        </template>
        <template #right>
          <!-- 待处理 -->
          <approve-view v-if="searchParams.msgCatalog === 'APPROVE_TYPE_02_01' && pendingSelected"
                        :selected-approval="pendingSelected"
                        :search-params="searchParams"
                        :data-source="approveDataSource"
                        @approved="approved" />
          <!-- 已处理 || 审批中 || 已审批 -->
          <history v-else-if="distinguishIds.includes(searchParams.msgCatalog) && historySelected"
                   :selected-approval="historySelected"
                   :search-params="searchParams" />
          <span v-else
                class="span-bg"></span>
        </template>
      </nlcr-Layout>
    </template>
  </normal-Layout>

</template>

<script>
import {P8NormalLayoutV1 as NormalLayout, P8NlcrLayout as nlcrLayout } from 'p8-components-ui'

import ApproveCatalog from './components/ApproveCatalog'
import ApproveList from './components/ApproveList'
import ApproveView from './components/ApproveView'
import History from './components/history'

export default {
  name: 'MyApprove',
  components: {
    'normal-Layout': NormalLayout,
    'nlcr-Layout': nlcrLayout,
    'approve-catalog': ApproveCatalog,
    'approve-list': ApproveList,
    'approve-view': ApproveView,
    History
  },
  data () {
    return {
      chargeIds: ['APPROVE_TYPE_01_02', 'APPROVE_TYPE_02_02'],
      distinguishIds: ['APPROVE_TYPE_01_01', 'APPROVE_TYPE_01_02', 'APPROVE_TYPE_02_02'],
      toggleMsgStatusApi: 'userMessage.toggleStatus',
      deleteMsgApi: 'userMessage.delete',
      pendingSelected: null,
      historySelected: null,
      userCatalogCountApi: 'processApproval.userAssigneeCount',
      userUnReadMessageCountApi: 'userMessage.userUnReadMessageCount',
      layoutConfig: {
        left: {
          xs: 0,
          sm: 0,
          md: 0,
          lg: 0,
          xl: 0
        },
        center: {
          xs: 8,
          sm: 8,
          md: 8,
          lg: 8,
          xl: 8
        },
        right: {
          xs: 16,
          sm: 16,
          md: 16,
          lg: 16,
          xl: 16
        }
      },
      searchParams: {
        msgCatalog: 'APPROVE_TYPE_02_01',
        assigneeUserId: this.$store.state.user.userInfo.id
      },
      renderTime: new Date() + '',
      dateTime: new Date() + '',
      currentMessage: null,
      msgCatalogCount: [],
      unReadTotal: 0,
      selectNodeId: 'APPROVE_TYPE01' // 我的审批-审批树：默认选中'审批中'，id为'19'
    }
  },
  mounted () {
    this.userCatalogCount()
    // this.userUnReadMessageCount()
  },
  methods: {
    closeView(){
      console.log(this.$refs.approveList)
      this.$refs.approveList.currentIndex = null
      this.viewVisible = false
    },
    loadCatalog() {
      this.$api['userMessage.catalog']({ dicType: 'APPROVE_TYPE' }).then((res) => {
        this.catalogData = res
        let ids = ['APPROVE_TYPE_02_01', 'APPROVE_TYPE_02_02', 'APPROVE_TYPE_01_01', 'APPROVE_TYPE_01_02']
        const tab_1 = res.find(item => item.id === 'APPROVE_TYPE_02_01')
        const tab_2 = res.find(item => item.id === 'APPROVE_TYPE_02_02')
        const tab_3 = res.find(item => item.id === 'APPROVE_TYPE_01_01')
        const tab_4 = res.find(item => item.id === 'APPROVE_TYPE_01_02')
        const tabs = [tab_1,tab_2,tab_3,tab_4]
        this.mobileCatalogData = tabs.map((item) => {
            return {
              label: `${item.cmeaning}(${this.catalogCount(item.id).num})`,
              name: item.cminorcode
            }
          })
      })
    },
    refreshList() {
      this.userCatalogCount()
      this.dateTime = new Date().getTime()
    },
    approved (taskId) {
      this.approvedTaskId = taskId
      this.$refs.approveList.refreshList()
      this.userCatalogCount()
    },
    selectMessage (messageData) {
      this.currentMessage = null
      this.currentMessage = messageData
    },
    select (r) {
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
    queryMsgList (nodeData) {
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
    userCatalogCount (queryParam) {
      // const params = queryParam != null ? queryParam : this.searchParams
      this.$api[this.userCatalogCountApi]().then((res) => {
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
    toggleStatus (msgId) {
      const msgIdArray = [msgId]
      const _this = this
      this.$api[this.toggleMsgStatusApi]({ idList: msgIdArray }).then((res) => {
        if (res && res.length > 0) {
          _this.currentMessage.msgStatus = res[0].msgStatus
          _this.userCatalogCount()
          _this.$store.dispatch('getMessageNum') // 获取消息信息已读未读条数
        }

        //
        //
        //
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
.normal-layout{
  box-shadow: 0px 0px 4px #a3a3a3;
  margin: 10px;
  height: calc(100% - 20px);
  ::v-deep .normal-main .normal-center{
    padding: 0;
  }
}
.customNlcr {
  margin: 0;
  height: 100%;
  box-shadow: 0px 0px 4px #a3a3a3;

  ::v-deep .search-wrapper {
    float: left;
    right: 0;
  }

  ::v-deep .icon-youzhedie {
    left: -4px !important;
  }
}
::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}

@media (max-width: 600px) {
  ::v-deep #tab-APPROVE_TYPE_02_01,
  ::v-deep #tab-APPROVE_TYPE_02_02{
    //background: #69F456;
    //color: #272e3b;
    background: rgba(202, 235, 215, 0.4);
    color: #009688;
  }
  ::v-deep #tab-APPROVE_TYPE_02_01.is-active,
  ::v-deep #tab-APPROVE_TYPE_02_02.is-active{
    background: #ffffff;
    color: #272e3b;
  }
  ::v-deep #tab-APPROVE_TYPE_01_01,
  ::v-deep #tab-APPROVE_TYPE_01_02{
    //background: #E7F551;
    //color: #272e3b;
    background: rgba(249, 223, 174, 0.4);
    color: #ff9800;
  }
  ::v-deep #tab-APPROVE_TYPE_01_01.is-active,
  ::v-deep #tab-APPROVE_TYPE_01_02.is-active{
    background: #ffffff;
    color: #272e3b;
  }
}
.approve-content-mobile{
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  .approve-list-mobile{
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    ::v-deep .ps-container{
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        overscroll-behavior: contain;
    }
    //.approve-list{
    //  flex:1;
    //  overflow-y: auto;
    //  -webkit-overflow-scrolling: touch;
    //  touch-action: pan-y;
    //  overscroll-behavior: contain;
    //}
  }
}
</style>
