<template>
  <div class="container">
    <div style="height: 100%;background: white">
      <div class="listContainer">
        <div style="padding: 10px 0px;display: flex;width: 100%;">
          <search-form-list search-width="70%"
                            search-contain-width="130%"
                            label-width="70px"
                            ref="search"
                            :data-source="searchConfig"
                            @search="search"
                            @re-set="reSet"></search-form-list>
          <div class="btn_list">
            <el-tooltip content="刷新">
              <el-button type="primary"
                         size="mini"
                         @click="refreshList"
                         icon="el-icon-refresh-right"></el-button>
            </el-tooltip>

            <el-tooltip content="时间正序">
              <el-button type="primary"
                         size="mini"
                         @click="ascendingTime"
                         icon="el-icon-caret-bottom"></el-button>
            </el-tooltip>

            <el-tooltip content="时间倒序">
              <el-button type="primary"
                         size="mini"
                         @click="descendingOrderTime"
                         icon="el-icon-caret-top"></el-button>
            </el-tooltip>
          </div>
        </div>
        <infinite-list :list-api="messageListApi"
                       :active-item="currentIndex"
                       :key="renderTime"
                       :search-params="mergeParams"
                       @load="messageLoad"
                       @onSelect="triggerSelect">
          <template #list="{ item }">
            <div style="padding: 10px">
              <el-row type="flex"
                      style="text-align: left;align-items: center;margin-bottom: 12px;justify-content: space-between;"
                      class="overHiding">
                <el-col :span="8">
                  <span class="msg-processName overHiding">{{ item.processName }}</span>
                </el-col>
                <el-col :span="16"
                        style="display: flex;align-items: center;justify-content: end;width: 148px">
                  <span>
                    <i class="el-icon-user-solid element_icon"></i>{{item.startUser}}
                  </span>
                  <span style="padding-left: 10px">{{startTimeSplice(item.startTime)}}</span>
                </el-col>
              </el-row>
              <el-row type="flex"
                      style="text-align: left">
                <el-col :span="24">
                  <span class="msg-content overHiding">项目名称：{{ item.projectInfoApproval && (item.projectInfoApproval.projectName || '') }}</span>
                </el-col>
              </el-row>
              <el-row type="flex"
                      style="text-align: left">
                <el-col :span="24">
                  <span class="msg-content overHiding">项目类型：{{ item.projectInfoApproval && (item.projectInfoApproval.projectType || '') }}</span>
                </el-col>
              </el-row>
              <el-row type="flex"
                      style="text-align: left">
                <el-col :span="24">
                  <span class="msg-content overHiding">型号代号：{{ item.projectInfoApproval && (item.projectInfoApproval.modelCode || '') }}</span>
                </el-col>
              </el-row>
            </div>
          </template>
        </infinite-list>
      </div>
    </div>
  </div>
</template>

<script>
import { Row, Col, RadioGroup, Tooltip, RadioButton, P8InfiniteScroll as InfiniteList, P8Tabs as CommonTabs, P8Search as SearchFormList } from 'p8-components-ui'

export default {
  name: 'ApproveList',
  props: {
    searchParams: {
      type: Object,
      default: () => { }
    },
    distinguishIds: {
      type: Array,
      default: () => []
    },
    chargeIds: {
      type: Array,
      default: () => []
    }
  },
  components: {
    'el-row': Row,
    'el-col': Col,
    'el-radio-group': RadioGroup,
    'search-form-list': SearchFormList,
    'el-radio-button': RadioButton,
    'el-tooltip': Tooltip,
    'infinite-list': InfiniteList,
    CommonTabs
  },
  data () {
    return {
      searchConfig: [
        {
          type: 'text',
          labelText: '流程名称',
          fieldName: 'processName',
          placeholder: '请输入流程名称',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '提交人',
          fieldName: 'senderName',
          placeholder: '请输入提交人名称',
          colLayout: 'singleCol'
        },
        {
          type: 'datetimeRange',
          labelText: '提交时间',
          fieldName: 'startEndTime',
          colLayout: 'singleCol',
          placeholder: '选择提交时间',
          fieldConfig: {
            'value-format': 'yyyy-MM-dd'
          }
        }
      ],
      renderTime: new Date() + '',
      messageListApi: 'PersonalProcessApproval.pendingApprovalList',
      currentIndex: null,
      mergeParams: {
        page: {
          current: 1,
          size: 15,
          total: 0,
          orders: [{ column: 'pinst.start_time_', asc: false }],
          pages: 0
        }
      }
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
    },
    startTimeSplice () {
      return function (date) {
        let timeStr = ''
        if (date) {
          timeStr = date.slice(0, 10)
        }

        return timeStr
      }
    }
  },
  created () {
    if (this.chargeIds.includes(this.searchParams.msgCatalog)) {
      this.messageListApi = 'PersonalProcessApproval.historyApprovalList'
      this.mergeParams.page.orders = [{ column: 't.start_Time', asc: false }]
    }
  },
  mounted () {
  },
  watch: {
    searchParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.mergeParams = Object.assign(this.mergeParams, newVal)
      },
      immediate: true
    }
  },
  methods: {
    reSet () {
      let that = this
      that.mergeParams.processName = ''
      that.mergeParams.senderName = ''
      that.mergeParams.startEndTime = []
      that.renderTime = new Date() + ''
    },
    ascendingTime () { // 时间升序
      if (this.chargeIds.includes(this.searchParams.msgCatalog)) {
        this.mergeParams.page.orders = [{ column: 't.start_Time', asc: false }]
      } else {
        this.mergeParams.page.orders = [{ column: 'pinst.start_time_', asc: false }]
      }
      this.renderTime = new Date() + ''
    },
    descendingOrderTime () { // 时间降序
      if (this.chargeIds.includes(this.searchParams.msgCatalog)) {
        this.mergeParams.page.orders = [{ column: 't.start_Time', asc: true }]
      } else {
        this.mergeParams.page.orders = [{ column: 'pinst.start_time_', asc: true }]
      }
      this.renderTime = new Date() + ''
    },
    refreshList () {
      this.renderTime = new Date() + ''
    },
    search (queryParam) {
      this.mergeParams = Object.assign(this.mergeParams, queryParam)
      this.renderTime = new Date() + ''
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

  .btn_list {
    display: flex;
    height: 30px;
    margin-left: 10px;
    .el-button {
      margin: 0px !important;
      padding: 0px 8px;
    }
  }
  .messageRadioGroup .el-radio-button {
    width: calc(100% / 3);

    .el-radio-button__inner {
      width: 100%;
    }
  }

  .listContainer {
    font-size: 14px;
    height: calc(100% - 54px);
    .search-wrapper {
      margin-left: 10px;
    }
    .el-input__inner {
      height: 32px !important;
    }
    .el-row {
      margin-bottom: 5px;
      .el-col {
        color: #606266;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
    .msg-processName {
      // display: inline-block;
      // padding-left: $icon-span-width;
      // margin: 5px 0px;
      font-weight: 600;
    }
    .msg-content {
      margin: 5px 0px;
      display: inline-block;
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
</style>
