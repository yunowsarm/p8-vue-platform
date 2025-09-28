<template>
  <div style="height: 100%; width: 100%">
    <div v-if="isMobile">
      <common-tabs
        class="custom-common-tabs"
        :active-tabs="activeTabs"
        type="border-card"
        :tabs-data="mobileCatalogData"
        :tabs-config="{ stretch: true }"
        height="auto"
        style="height: 100%"
        @tab-click="tabClick"
      >
      </common-tabs>
      <approve-list
        :search-params="searchParams"
        @select="select"
        @refreshList="refreshList"
        :key="renderTime"
        :distinguish-ids="distinguishIds"
        :charge-ids="chargeIds"
        ref="approveList"
      ></approve-list>
      <common-drawer v-if="viewVisible" :title="viewTitle" :visible="viewVisible" placement="top" size="100%" @close="closeView">
        <template #drawer>
          <!-- 待处理 -->
          <approve-view
            v-if="searchParams.msgCatalog === 'APPROVE_TYPE_02_01' && pendingSelected"
            :selected-approval="pendingSelected"
            :search-params="searchParams"
            :data-source="approveDataSource"
            @approved="approved"
          />
          <!-- 已处理 || 审批中 || 已审批 -->
          <history v-else-if="distinguishIds.includes(searchParams.msgCatalog) && historySelected" :selected-approval="historySelected" :search-params="searchParams" />
          <span v-else class="span-bg"></span>
        </template>
      </common-drawer>
    </div>
    <normal-Layout v-else :header-visible="false" layoutCode="MY_APPROVE">
      <template #west>
        <div class="treeContain" style="height: 100%">
          <approve-catalog
            :msg-count="msgCatalogCount"
            :key="dateTime"
            :catalog-data="catalogData"
            :un-read-total="unReadTotal"
            :search-params="searchParams"
            :select-node-id="selectNodeId"
            @selectNode="queryMsgList"
          ></approve-catalog>
        </div>
      </template>
      <template #center>
        <nlcr-Layout :header-visible="false" :normal-layout="layoutConfig" class="customNlcr" :platform-visible="true" :left-use-perfect-scrollbar="false">
          <template #center>
            <approve-list
              :search-params="searchParams"
              @select="select"
              @refreshList="refreshList"
              :key="renderTime"
              :distinguish-ids="distinguishIds"
              :charge-ids="chargeIds"
              ref="approveList"
            ></approve-list>
          </template>
          <template #right>
            <!-- 待处理 -->
            <approve-view
              v-if="searchParams.msgCatalog === 'APPROVE_TYPE_02_01' && pendingSelected"
              :selected-approval="pendingSelected"
              :search-params="searchParams"
              :data-source="approveDataSource"
              @approved="approved"
            />
            <!-- 已处理 || 审批中 || 已审批 -->
            <history v-else-if="distinguishIds.includes(searchParams.msgCatalog) && historySelected" :selected-approval="historySelected" :search-params="searchParams" />
            <span v-else class="span-bg"></span>
          </template>
        </nlcr-Layout>
      </template>
    </normal-Layout>
  </div>
</template>

<script>
import { P8NormalLayoutV1 as NormalLayout, P8NlcrLayout as nlcrLayout, P8Tabs as CommonTabs, P8Drawer as CommonDrawer } from 'p8-components-ui'

import ApproveCatalog from './components/ApproveCatalog'
import ApproveList from './components/ApproveList'
import ApproveView from './components/ApproveView'
import History from './components/history'
import videoViewing from '@/views/Framework/System/guiDe/components/videoPlayer.vue'

export default {
  name: 'MyApprove',
  components: {
    videoViewing,
    'normal-Layout': NormalLayout,
    'nlcr-Layout': nlcrLayout,
    'approve-catalog': ApproveCatalog,
    'approve-list': ApproveList,
    'approve-view': ApproveView,
    CommonTabs,
    CommonDrawer,
    History
  },
  data() {
    return {
      viewVisible: false,
      viewTitle:'',
      catalogData: [],
      mobileCatalogData: [],
      activeTabs: 'APPROVE_TYPE_02_01',
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
          xs: 5,
          sm: 5,
          md: 5,
          lg: 5,
          xl: 5
        },
        center: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
          xl: 6
        },
        right: {
          xs: 13,
          sm: 13,
          md: 13,
          lg: 13,
          xl: 13
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
  computed: {
    isMobile() {
      return this.$store.getters.isMobile
    }
  },
  mounted() {

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
      this.$api['processApproval.getCatalog']({ dicType: 'APPROVE_TYPE' }).then((res) => {
        this.catalogData = res
        let ids = ['APPROVE_TYPE_02_01', 'APPROVE_TYPE_02_02', 'APPROVE_TYPE_01_01', 'APPROVE_TYPE_01_02']
        const tab_1 = res.find(item => item.id === 'APPROVE_TYPE_02_01')
        const tab_2 = res.find(item => item.id === 'APPROVE_TYPE_02_02')
        const tab_3 = res.find(item => item.id === 'APPROVE_TYPE_01_01')
        const tab_4 = res.find(item => item.id === 'APPROVE_TYPE_01_01')
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
      if(this.isMobile){
        this.closeApproveView()
      }
      this.userCatalogCount()
    },
    approved(taskId) {
      console.log(taskId,'taskId')
      this.approvedTaskId = taskId
      this.$refs.approveList.refreshList()
      this.userCatalogCount()
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
      if(this.isMobile){
        this.viewTitle = r.processName
        this.viewVisible = true
      }
    },
    closeApproveView(){
      this.viewVisible = false
    },
    tabClick(nodeData) {
      console.log(nodeData, 'nodeData')
      this.queryMsgList({
        id: nodeData.name
      })
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
      // const params = queryParam != null ? queryParam : this.searchParams
      this.$api[this.userCatalogCountApi]().then((res) => {
        this.msgCatalogCount = res
        this.loadCatalog()
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

        //
        //
        //
      })
    },
    catalogCount (catalogId) {
      console.log(this.msgCatalogCount,'msgCatalogCount2')
      let countObj
      if (catalogId === '') {
        countObj = { noread: this.unReadTotal }
      } else {
        countObj = this.msgCatalogCount.find((value) => value.value === catalogId)
      }
      const o = { ...{ read: 0, noread: 0, num: 0 }, ...countObj }
      return o
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

.normal-layout {
  box-shadow: 0px 0px 4px #a3a3a3;
  margin: 10px;
  height: calc(100% - 20px);
  ::v-deep .normal-main .splitBtn > i {
    z-index: 1;
  }
  ::v-deep .normal-main .normal-center {
    padding: 0;
  }
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
::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}

@media (max-width: 600px) {
  ::v-deep #tab-APPROVE_TYPE_02_01,
  ::v-deep #tab-APPROVE_TYPE_02_02{
    background: #69F456;
    color: #272e3b;
    //background: rgba(0,150,136,0.15);
    //color: #009688;
  }
  ::v-deep #tab-APPROVE_TYPE_02_01.is-active,
  ::v-deep #tab-APPROVE_TYPE_02_02.is-active{
    background: #ffffff;
    color: #272e3b;
  }
  ::v-deep #tab-APPROVE_TYPE_01_01,
  ::v-deep #tab-APPROVE_TYPE_01_02{
    background: #E7F551;
    color: #272e3b;
    //background: rgba(233,152,0,0.15);
    //color: #ff9800;
  }
  ::v-deep #tab-APPROVE_TYPE_01_01.is-active,
  ::v-deep #tab-APPROVE_TYPE_01_02.is-active{
    background: #ffffff;
    color: #272e3b;
  }
}
</style>
