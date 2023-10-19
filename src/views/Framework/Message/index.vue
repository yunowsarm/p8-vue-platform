<template>
  <nlcr-Layout :header-visible="false"
               :normal-layout="layoutConfig"
               class="customNlcr"
               :platformVisible="true"
               :left-use-perfect-scrollbar="false">
    <template #left>
      <div style="padding: 10px">
        <search-form-list search-width="90%"
                          search-contain-width="90%"
                          label-width="70px"
                          ref="search"
                          :data-source="searchConfig"
                          @search="search"
                          @re-set="reSet"></search-form-list>
      </div>
      <div class="treeContain">
        <message-catalog :msg-count="msgCatalogCount"
                         :un-read-total="unReadTotal"
                         :search-params="searchParams"
                         :select-node-id="selectNodeId"
                         @selectNode="queryMsgList"></message-catalog>
      </div>
    </template>
    <template #center>
      <message-list :search-params="searchParams"
                    ref="messagList"
                    @select="selectMessage"
                    @refreshCount="userCatalogCount"
                    @toggleStatus="toggleStatus"
                    :removed-msg="deletedMsg"></message-list>
    </template>
    <template #right>
      <message-view v-if="currentMessage != null"
                    :message-data="currentMessage"
                    @onToggleStatus="toggleStatus"
                    @onDeleteMsg="deleteMsg"></message-view>
      <span v-else
            class="span-bg"></span>
    </template>
  </nlcr-Layout>
</template>

<script>
import { P8NlcrLayout as nlcrLayout, P8Search as SearchFormList } from 'p8-components-ui'

import MessageCatalog from './components/MessageCatalog'
import MessageList from './components/MessageList'
import MessageView from './components/MessageView'

export default {
  name: 'IndexVue',
  components: {
    'nlcr-Layout': nlcrLayout,
    'search-form-list': SearchFormList,
    'message-catalog': MessageCatalog,
    'message-list': MessageList,
    'message-view': MessageView
  },
  data () {
    return {
      toggleMsgStatusApi: 'userMessage.toggleStatus',
      deleteMsgApi: 'userMessage.delete',
      userCatalogCountApi: 'userMessage.userCatalogCount',
      userUnReadMessageCountApi: 'userMessage.userUnReadMessageCount',
      layoutConfig: {
        left: {
          xs: 8,
          sm: 6,
          md: 4,
          lg: 4,
          xl: 4
        },
        center: {
          xs: 8,
          sm: 8,
          md: 6,
          lg: 6,
          xl: 6
        },
        right: {
          xs: 8,
          sm: 10,
          md: 13,
          lg: 13,
          xl: 13
        }
      },
      searchConfig: [
        {
          type: 'text',
          labelText: '关键字',
          fieldName: 'msgKeyWord',
          placeholder: '请输入标题或内容',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '发件人',
          fieldName: 'senderName',
          placeholder: '请输入发件人名称',
          colLayout: 'singleCol'
        },
        {
          type: 'datetimeRange',
          labelText: '发件时间',
          fieldName: 'datetimeRange',
          colLayout: 'singleCol',
          placeholder: '选择发件时间',
          fieldConfig: {
            'value-format': 'yyyy-MM-dd'
          }
        }
      ],
      searchParams: {
        msgCatalog: ''
      },
      currentMessage: null,
      deletedMsg: null,
      msgCatalogCount: [],
      unReadTotal: 0,
      selectNodeId: '18' // 我的消息-消息树：默认选中'消息类型'，id为'18'
    }
  },
  mounted () {
    this.userCatalogCount()
    // this.userUnReadMessageCount()
  },
  methods: {
    search (queryParam) {
      let searchDate = {}
      if (queryParam.datetimeRange) {
        searchDate = { sendBeginTime: queryParam.datetimeRange[0], sendEndTime: queryParam.datetimeRange[1] }
      }

      console.log('searchDate', searchDate)

      let catalogCountParams = { ...queryParam, ...searchDate }
      this.userCatalogCount(catalogCountParams)

      this.searchParams = { msgCatalog: this.searchParams.msgCatalog, ...catalogCountParams }
      console.log('searchParams', this.searchParams)
    },
    reSet () { },
    selectMessage (messageData) {
      console.log('message:', messageData)
      this.currentMessage = null
      this.currentMessage = messageData
    },
    queryMsgList (nodeData) {
      this.searchParams.msgCatalog = nodeData.id
    },
    userCatalogCount (queryParam) {
      let params = queryParam != null ? queryParam : this.searchParams
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
    toggleStatus (msgId,status) {
      let msgIdArray = [msgId]
      let _this = this
      this.$api[this.toggleMsgStatusApi]({ idList: msgIdArray, msgStatus: status }).then((res) => {
        if (res && res.length > 0) {
          _this.currentMessage.msgStatus = res[0].msgStatus
          _this.userCatalogCount()
          _this.$store.dispatch('getMessageNum') // 获取消息信息已读未读条数
        }
      })
    },
    deleteMsg (msgId) {
      let msgIdArray = [msgId]
      let _this = this
      this.$api[this.deleteMsgApi]({ idList: msgIdArray }).then((res) => {
        this.deletedMsg = msgId
        _this.userCatalogCount()
        // _this.userUnReadMessageCount()
        _this.$store.dispatch('getMessageNum') // 获取消息信息已读未读条数
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
.customNlcr{
  height: calc(100% - 36px);
  box-shadow: 0px 0px 4px #a3a3a3;
  .search-wrapper{
    float: left;
  }
}
</style>
