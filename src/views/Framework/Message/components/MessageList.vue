<template>
  <div class="container">
    <div style="height: 100%">
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
                   :tabs-config="{ stretch: true }"
                   height="auto"
                   style="height: 100%"
                   @tab-click="tabClick">
        <template #1501>
          <div class="listContainer"
               v-if="activeTabs == '1501'">
            <div class="messageHeader">
              <!-- 全选目前只支持全选已加载的数据 -->
              <!-- <span @click="selectAll" style="cursor: pointer;">{{flag ? '全选' : '取消全选'}}</span> -->
              <span class="other">
                <i class="el-icon-refresh iconColor"
                   title="重载"
                   @click="refresh"></i>
                <i class="p8 icon-plan-examine iconColor"
                   title="已读"
                   @click="getIdsSendApi('标记为已读','userMessage.toggleStatus','1505')"></i>
                <!-- <i class="p8 icon-message" title="未读" style="pointer-events:none; color:#ababab; cursor:not-allowed !important;" @click="getIdsSendApi('标记为未读','userMessage.toggleStatus','1501')"></i> -->
                <i class="p8 icon-delete iconColor"
                   title="删除"
                   @click="getIdsSendApi('删除','userMessage.delete')"></i>
              </span>
            </div>
            <infinite-list :key="timeKey"
                           ref="infList"
                           class="finiteList"
                           v-if="mergeParams.msgCatalog != null"
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
                      <span style="display:inline-block;line-height: 68px;width:15px;"><el-checkbox @click.native="stopDefault($event)"
                                     v-model="item.ischeck"></el-checkbox></span>
                      <span class="left-span">
                        <i class="p8"
                           :class="statusIcon(item.msgStatus)"></i>
                      </span>
                      <span>{{ item.msgTitle }}</span>
                    </el-col>
                    <el-col :span="8"
                            style="text-align: right">
                      <i v-if="item.uploadFiles != null && item.uploadFiles.length > 0"
                         class="p8 icon-jianhao"></i>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="24">
                      <span class="msg-content overHiding msg_content_height"
                            v-if="hasHtmlTag(item.msgContent)"
                            v-html="item.msgContent"></span>
                      <span class="msg-content overHiding"
                            v-else>{{ item.msgContent }}</span>
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
          <div class="listContainer"
               v-if="activeTabs == '1505'">
            <div class="messageHeader">
              <!-- 全选目前只支持全选已加载的数据 -->
              <!-- <span @click="selectAll" style="cursor: pointer;">{{flag ? '全选' : '取消全选'}}</span> -->
              <span class="other">
                <i class="el-icon-refresh iconColor"
                   title="重载"
                   @click="refresh"></i>
                <!-- <i class="p8 icon-plan-examine" title="已读" style="pointer-events:none; color:#ababab; cursor:not-allowed !important;" @click="getIdsSendApi('标记为已读','userMessage.toggleStatus','1505')"></i> -->
                <i class="p8 icon-message iconColor"
                   title="未读"
                   @click="getIdsSendApi('标记为未读','userMessage.toggleStatus','1501')"></i>
                <i class="p8 icon-delete iconColor"
                   title="删除"
                   @click="getIdsSendApi('删除','userMessage.delete')"></i>
              </span>
            </div>
            <infinite-list :key="timeKey"
                           ref="infList"
                           class="finiteList"
                           v-if="mergeParams.msgCatalog != null"
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
                      <span style="display:inline-block;line-height: 68px;width:15px;"><el-checkbox @click.native="stopDefault($event)"
                                     v-model="item.ischeck"></el-checkbox></span>
                      <span class="left-span">
                        <i class="p8"
                           :class="statusIcon(item.msgStatus)"></i>
                      </span>
                      <span style="font-weight: bold">{{ item.msgTitle }}</span>
                    </el-col>
                    <el-col :span="8"
                            style="text-align: right">
                      <i v-if="item.uploadFiles != null && item.uploadFiles.length > 0"
                         class="p8 icon-jianhao"></i>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="24">
                      <span style="white-space: pre-wrap"
                            class="msg-content overHiding msg_content_height"
                            v-if="hasHtmlTag(item.msgContent)"
                            v-html="item.msgContent"></span>
                      <span style="white-space: pre-wrap"
                            class="msg-content overHiding"
                            v-else>{{ item.msgContent }}</span>
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
                            style="text-align: right; padding-top: 10px">
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
          <div class="listContainer"
               v-if="activeTabs == '0'">
            <div class="messageHeader">
              <!-- 全选目前只支持全选已加载的数据 -->
              <!-- <span @click="selectAll" style="cursor: pointer;">{{flag ? '全选' : '取消全选'}}</span> -->
              <span class="other">
                <i class="el-icon-refresh iconColor"
                   title="重载"
                   @click="refresh"></i>
                <i class="p8 icon-plan-examine iconColor"
                   title="已读"
                   @click="getIdsSendApi('标记为已读','userMessage.toggleStatus','1505')"></i>
                <i class="p8 icon-message iconColor"
                   title="未读"
                   @click="getIdsSendApi('标记为未读','userMessage.toggleStatus','1501')"></i>
                <i class="p8 icon-delete iconColor"
                   title="删除"
                   @click="getIdsSendApi('删除','userMessage.delete')"></i>
              </span>
            </div>
            <infinite-list :key="timeKey"
                           ref="infList"
                           class="finiteList"
                           v-if="mergeParams.msgCatalog != null"
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
                      <span style="display:inline-block;line-height: 68px;width:15px;"><el-checkbox @click.native="stopDefault($event)"
                                     v-model="item.ischeck"></el-checkbox></span>
                      <span class="left-span">
                        <i class="p8"
                           :class="statusIcon(item.msgStatus)"></i>
                      </span>
                      <span>{{ item.msgTitle }}</span>
                    </el-col>
                    <el-col :span="8"
                            style="text-align: right">
                      <i v-if="item.uploadFiles != null && item.uploadFiles.length > 0"
                         class="p8 icon-jianhao"></i>
                    </el-col>
                  </el-row>
                  <el-row type="flex"
                          style="text-align: left">
                    <el-col :span="24">
                      <span class="msg-content overHiding msg_content_height"
                            v-if="hasHtmlTag(item.msgContent)"
                            v-html="item.msgContent"></span>
                      <span class="msg-content overHiding"
                            v-else>{{ item.msgContent }}</span>
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
      tabs: [
        { label: '未读', name: '1501', icon: 'icon-weidu' },
        { label: '已读', name: '1505', icon: 'icon-yidu' },
        { label: '全部', name: '0', icon: 'icon-quanbu' }
      ],
      activeTabs: '1501',
      timeKey: new Date().getTime(),
      flag: true
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
    // this.myMessageGroup()
  },
  watch: {
    searchParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.mergeParams = { ...newVal, msgStatus: '1501' }
        this.activeTabs = '1501'
      },
      immediate: true
    }
  },
  methods: {
    tabClick (val) {
      this.flag = true
      this.mergeParams.msgStatus = val.name
      if (val.name == '0') {
        this.mergeParams.msgStatus = ''
      }
      this.activeTabs = val.name
    },
    triggerSelect (item, index) {
      if (index && index == this.currentIndex) {
        return
      }
      this.currentIndex = index
      this.$emit('select', item, index)
      this.$emit('toggleStatus', item.id, '1505')
      setTimeout(() => {
        this.myMessageGroup()
      }, 1000)
    },
    saveNotice () {
      this.$api['PersonalProcessApproval.saveNoticeMsg']({ id: null }).then((res) => { })
    },
    myMessageGroup () {
      let that = this
      this.$api['PersonalProcessApproval.myMessageGroup']().then((res) => {
        if (res) {
          let magCount = 0
          res.forEach(el => {
            magCount = magCount + Number(el.msgCount)
            if (el.isRead === '1501') {
              that.tabs[0].label = `未读(${el.msgCount ? Number(el.msgCount) : 0})`
            }
            if (el.isRead === '1505') {
              that.tabs[1].label = `已读(${el.msgCount ? Number(el.msgCount) : 0})`
            }
          })
          that.tabs[2].label = `全部(${magCount})`
        }
      })
    },
    messageLoad (data, current) {
      if (data && current && current === 1) {
        this.currentIndex = 0
      }
    },
    hasHtmlTag (str) {
      return /<[^>]*>/i.test(str)
    },
    // selectAll () {
    //   this.$refs.infList.infiniteList.forEach(el => {
    //     el.ischeck = this.flag
    //   })
    //   this.$refs.infList.infiniteList = Object.assign([],this.$refs.infList.infiniteList)
    //   this.flag = !this.flag
    // },
    refresh () {
      this.flag = true
      this.timeKey = new Date().getTime()
    },
    getIdsSendApi (message, api, status) {
      let list = this.$refs.infList.infiniteList.filter(el => el.ischeck)
      let ids = list.map(el => el.id)
      if (ids.length) {
        let that = this
        this.$confirm('是否要将选中的消息' + message + '？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$api[api]({ idList: ids, msgStatus: status }).then((res) => {

            that.flag = true
            // if (!status) {
            that.timeKey = new Date().getTime()
            // } else {
            //   list.forEach(el => {
            //     el.msgStatus = status
            //     el.ischeck = false
            //   })
            // }
            that.$emit('refreshCount')
            that.$store.dispatch('getMessageNum')
          })
        })
      } else {
        this.$message({ type: 'warning', message: '请选择要操作的数据' })
      }
    },
    stopDefault (e) {
      e.stopPropagation();
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
  .msg_content_height {
    display: inline-block;
    height: 50px;
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
      display: inline-block;
      width: calc(100% - 20px);
    }
    .msg-user {
      padding-right: 10px;
    }

    .left-span {
      display: inline-block;
      width: $icon-span-width;
    }
  }
  .infinite-list-wrapper .infinite-list .infinite-list-item {
    padding: 15px;
    border-bottom: 1px solid #eeeef0;
  }
}
.custom-common-tabs {
  ::v-deep .el-tabs {
    height: 100% !important;
  }
  ::v-deep .el-tabs .el-tabs__content {
    height: calc(100% - 40px);
  }
  ::v-deep .el-tabs--border-card {
    border: none;
  }
}
.messageHeader {
  padding-bottom: 10px;
  .iconColor {
    color: rgb(24, 144, 255);
    font-size: 16px;
    margin: 0 5px;
    cursor: pointer;
  }
  .other {
    float: right;
  }
}
.finiteList {
  overflow-x: hidden !important;
}
::v-deep .msg-content img {
  display: none;
}
</style>
