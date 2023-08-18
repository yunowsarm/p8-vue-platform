<template>
  <div class="container">
    <div style="height: 100%;">
      <!-- <el-radio-group v-model="mergeParams.msgStatus"
                      class="messageRadioGroup"
                      style="width: 100%">
        <el-radio-button label="1501">未读</el-radio-button>
        <el-radio-button label="1505">已读</el-radio-button>
        <el-radio-button label>全部</el-radio-button>
      </el-radio-group> -->
      <common-tabs class="custom-common-tabs"
                   :active-tabs="activeTabs"
                   type="border-card"
                   :tabs-data="tabs"
                   :tabsConfig="{stretch: true}"
                   height="auto"
                   style="height: 100%;"
                   @tab-click="tabClick">
        <template #1501>
          <div class="listContainer">
            <infinite-list v-if="mergeParams.msgCatalog != null"
                           :list-api="messageListApi"
                           :active-item="currentIndex"
                           :search-params="mergeParams"
                           :removed-item="removedMsg"
                           @load="messageLoad"
                           @onSelect="triggerSelect">
              <template #list="{ item }">
                <span>
                  <el-row type="flex"
                          style="text-align: left"
                          class="overHiding">
                    <el-col :span="16">
                      <span class="left-span">
                        <i class="p8"
                           :class="statusIcon(item.msgStatus)"></i>
                      </span>
                      <span>{{ item.msgTitle }}</span>
                    </el-col>
                    <el-col :span="8"
                            style="text-align: right">
                      <i v-if="item.uploadFiles != null && item.uploadFiles.length > 0"
                         class="p8 icon-attachment"></i>
                      <i v-if="item.msgLink != null && item.msgLink != ''"
                         class="p8 icon-quote"></i>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="24">
                      <span class="msg-content overHiding">{{ item.msgContent }}</span>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="2"></el-col>
                    <el-col :xs="22"
                            :sm="22"
                            :md="22"
                            :lg="22"
                            :xl="22"
                            style="text-align: right">
                      <span class="msg-user">{{ item.senderName }}</span>
                      <span class="msg-time">{{ item.sendDate }}</span>
                    </el-col>
                  </el-row>
                </span>
              </template>
            </infinite-list>
          </div>
        </template>
        <template #1505>
          <div class="listContainer">
            <infinite-list v-if="mergeParams.msgCatalog != null"
                           :list-api="messageListApi"
                           :active-item="currentIndex"
                           :search-params="mergeParams"
                           :removed-item="removedMsg"
                           @load="messageLoad"
                           @onSelect="triggerSelect">
              <template #list="{ item }">
                <span>
                  <el-row type="flex"
                          style="text-align: left"
                          class="overHiding">
                    <el-col :span="16">
                      <span class="left-span">
                        <i class="p8"
                           :class="statusIcon(item.msgStatus)"></i>
                      </span>
                      <span style="font-weight: bold;">{{item.msgTitle}}</span>
                    </el-col>
                    <el-col :span="8"
                            style="text-align: right">
                      <i v-if="item.uploadFiles != null && item.uploadFiles.length > 0"
                         class="p8 icon-attachment"></i>
                      <i v-if="item.msgLink != null && item.msgLink != ''"
                         class="p8 icon-quote"></i>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="24">
                      <span  style="white-space: pre-wrap;" class="msg-content overHiding">{{item.msgContent}}</span>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="2"></el-col>
                    <el-col :xs="22" :sm="22" :md="22" :lg="22" :xl="22" style="text-align: right; padding-top: 10px;">
                      <span class="msg-user">{{ item.senderName }}</span>
                      <span class="msg-time">{{ item.sendDate }}</span>
                    </el-col>
                  </el-row>
                </span>
              </template>
            </infinite-list>
          </div>
        </template>
        <template #0>
          <div class="listContainer">
            <infinite-list v-if="mergeParams.msgCatalog != null"
                           :list-api="messageListApi"
                           :active-item="currentIndex"
                           :search-params="mergeParams"
                           :removed-item="removedMsg"
                           @load="messageLoad"
                           @onSelect="triggerSelect">
              <template #list="{ item }">
                <span>
                  <el-row type="flex"
                          style="text-align: left"
                          class="overHiding">
                    <el-col :span="16">
                      <span class="left-span">
                        <i class="p8"
                           :class="statusIcon(item.msgStatus)"></i>
                      </span>
                      <span>{{ item.msgTitle }}</span>
                    </el-col>
                    <el-col :span="8"
                            style="text-align: right">
                      <i v-if="item.uploadFiles != null && item.uploadFiles.length > 0"
                         class="p8 icon-attachment"></i>
                      <i v-if="item.msgLink != null && item.msgLink != ''"
                         class="p8 icon-quote"></i>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="24">
                      <span class="msg-content overHiding">{{ item.msgContent }}</span>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="2"></el-col>
                    <el-col :xs="22"
                            :sm="22"
                            :md="22"
                            :lg="22"
                            :xl="22"
                            style="text-align: right">
                      <span class="msg-user">{{ item.senderName }}</span>
                      <span class="msg-time">{{ item.sendDate }}</span>
                    </el-col>
                  </el-row>
                </span>
              </template>
            </infinite-list>
          </div>
        </template>
      </common-tabs>
    </div>
  </div>
</template>

<script>
import { Row, Col, RadioGroup, RadioButton, P8InfiniteScroll as InfiniteList, P8Tabs as CommonTabs } from 'p8-components-ui'

export default {
  name: 'MessageList',
  props: {
    searchParams: {
      type: Object,
      default: () => { }
    },
    removedMsg: {
      type: String,
      default: null
    }
  },
  components: {
    'el-row': Row,
    'el-col': Col,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton,
    'infinite-list': InfiniteList,
    CommonTabs
  },
  data () {
    return {
      messageListApi: 'userMessage.list',
      currentIndex: null,
      mergeParams: {
        msgCatalog: null,
        msgStatus: '1501'
      },
      tabs: [{ label: '未读', name: '1501', icon: 'icon-weidu' }, { label: '已读', name: '1505', icon: 'icon-yidu' }, { label: '全部', name: '0', icon: 'icon-quanbu' }],
      activeTabs: '1501'
    }
  },
  computed: {
    statusIcon () {
      return function (status) {
        let icon = ''
        if (status === '1501') {
          icon = 'icon-message'
        } else {
          icon = 'icon-plan-examine'
        }

        return icon
      }
    }
  },
  mounted () {
    // this.saveNotice()
  },
  watch: {
    searchParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.mergeParams = { ...newVal, msgStatus: '1501' }
      },
      immediate: true
    }
  },
  methods: {
    tabClick (val) {
      this.mergeParams.msgStatus = val.name
    },
    triggerSelect (item, index) {
      this.currentIndex = index
      this.$emit('select', item, index)
    },
    saveNotice () {
      this.$api['PersonalProcessApproval.saveNoticeMsg']({ id: null }).then((res) => { })
    },
    messageLoad (data, current) {
      if (data && current && current === 1) {
        this.currentIndex = 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$icon-span-width: 20px;

.container {
  height: 100%;

  .messageRadioGroup .el-radio-button {
    width: calc(100% / 3);

    .el-radio-button__inner {
      width: 100%;
    }
  }

    .listContainer {
      font-size: 14px;
      height: calc(100% - 54px);

    .el-row {
      margin-bottom: 5px;
      .el-col {
        color: #606266;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
    .msg-content {
      padding-left: $icon-span-width;
    }
    .msg-user {
      padding-right: 10px;
    }

    .left-span {
      display: inline-block;
      width: $icon-span-width;
    }
  }
  .infinite-list-wrapper .infinite-list .infinite-list-item{
    padding: 15px;
    border-bottom: 1px solid #EEEEF0;
  }
}
.custom-common-tabs {
  /deep/ .el-tabs .el-tabs__content {
    height: calc(100% - 65px);
  }
  /deep/ .el-tabs--border-card{
    border: none;
  }
}
</style>
