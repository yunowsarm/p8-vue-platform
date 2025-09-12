<template>
  <div class="container">
    <div style="height: 100%; background: white">
      <div class="listContainer">
        <div style="padding: 10px 0px; display: flex; width: 100%">
          <search-form-list search-width="70%"
                            search-contain-width="130%"
                            label-width="70px"
                            ref="search"
                            :data-source="searchConfig"
                            :addFuzzySearch="true"
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
        <div class="tagsSearch"
             :key="tabEenderTime">
          <el-tooltip v-for="item in visibleTags"
                      :key="item.id"
                      :open-delay="300"
                      :content="item.name"
                      placement="top">
            <el-tag :class="{ isActive: activeIds.includes(item.name), 'tag-item': true, isSearch: searchTabs == item.name }"
                    @click="tagClick(item)">
              {{ truncateName(item.name) }}
            </el-tag>
          </el-tooltip>
          <el-tag v-if="showMoreButton"
                  class="more-button"
                  type="info"
                  @click="showAllTags"> 更多</el-tag>
          <el-tag v-if="showAllTagsClicked"
                  class="more-button"
                  type="info"
                  @click="hideAllTags"> 收起</el-tag>
        </div>
        <infinite-list :list-api="messageListApi"
                       :style="{ height: getHeight }"
                       :active-item="currentIndex"
                       :key="renderTime"
                       :search-params="mergeParams"
                       @load="messageLoad"
                       @onSelect="triggerSelect">
          <template #list="{ item }">
            <div style="padding: 10px">
              <el-row type="flex"
                      style="text-align: left; align-items: center; margin-bottom: 12px; justify-content: space-between"
                      class="overHiding">
                <el-col :span="8">
                  <span class="msg-processName overHiding">{{ item.processName }}</span>
                </el-col>
                <el-col :span="16"
                        style="display: flex; align-items: center; justify-content: end; width: 148px">
                  <span>
                    <el-button v-if="mergeParams.msgCatalog === 'APPROVE_TYPE_01_01' && item.processName !== '合同审批流程'"
                               type="text"
                               style="margin: 0 4px"
                               @click.stop="withdrawApproval(item)">撤回审批</el-button>
                    <i class="el-icon-user-solid element_icon"></i>{{ item.startUser }}
                  </span>
                  <span style="padding-left: 10px">{{ startTimeSplice(item.startTime) }}</span>
                </el-col>
              </el-row>
              <template v-if="item.approveInfoConfig && Object.keys(item.approveInfoConfig).length">
                <el-row type="flex"
                        v-for="(el, index) in Object.keys(item.approveInfoConfig)"
                        :key="index"
                        style="text-align: left">
                  <el-col :span="24">
                    <div class="msg-content overHiding"
                         v-if="item.approveInfoConfig[el] && item.approveInfoConfig[el].label">
                      {{ item.approveInfoConfig[el].label }}：
                      <el-tooltip v-if="item.approveInfoConfig[el].value && item.approveInfoConfig[el].value.length > 10"
                                  effect="dark"
                                  :content="item.approveInfoConfig[el].value"
                                  placement="left">
                        <span>{{ item.approveInfoConfig[el].value }}</span>
                      </el-tooltip>
                      <span v-else>{{ item.approveInfoConfig[el].value }}</span>
                    </div>
                  </el-col>
                </el-row>
              </template>
              <template v-else>
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
                    <span class="msg-content overHiding">产品名称：{{ item.projectInfoApproval && (item.projectInfoApproval.modelCode || '') }}</span>
                  </el-col>
                </el-row>
              </template>
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
        },
        {
          type: 'select',
          labelText: '标签筛选',
          fieldName: 'tabsName',
          colLayout: 'singleCol',
          placeholder: '请选择',
          options: []
        }
      ],
      renderTime: new Date() + '',
      messageListApi: 'processApproval.pendingList',
      currentIndex: null,
      mergeParams: {
        page: {
          current: 1,
          size: 15,
          total: 0,
          orders: [{ column: 're.start_time', asc: false }],
          pages: 0
        }
      },
      approvalList: [],
      showAll: false, // 是否显示全部标签
      tagHeight: null,
      activeIds: [],
      searchTabs: '',
      tabEenderTime: new Date().getTime(),
      showAllTagsClicked: false
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
    },
    // 计算属性：默认显示的标签
    visibleTags () {
      this.$nextTick(() => {
        const element = document.querySelector('.tagsSearch') // 获取第一个匹配的元素
        this.tagHeight = element.offsetHeight
      })
      return this.showAll ? this.approvalList : this.approvalList.slice(0, 10)
    },
    // 计算属性：是否显示“更多”按钮
    showMoreButton () {
      return this.approvalList.length > 10 && !this.showAll
    },
    getHeight () {
      return 'calc(100% - ' + this.tagHeight + 'px)'
    }
  },
  created () {
    if (this.chargeIds.includes(this.searchParams.msgCatalog)) {
      this.messageListApi = 'PersonalProcessApproval.approvalHistoryList'
      this.mergeParams.page.orders = [{ column: 'pinst.start_time_', asc: false }]
    }
  },
  mounted () {
    const element = document.querySelector('.tagsSearch') // 获取第一个匹配的元素
    this.tagHeight = element.offsetHeight
  },
  watch: {
    searchParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.mergeParams = Object.assign(this.mergeParams, newVal)
        this.getList()
      },
      immediate: true
    }
  },
  methods: {
    withdrawApproval (item) {
      this.$confirm('是否要撤回审批', '提示', {
        confirmButtonText: '撤回',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const params = {
          withdrawList: [
            {
              businessKey: item.businessKey,
              processDefinitionKey: item.processKey,
              processName: item.processName,
              pageAddress: 'Framework/Message/components/ApprovalWithdraw.vue'
            }
          ]
        }
        this.$api['baseData.withdraw'](params).then((res) => {
          if (res.result) {
            this.$message({
              type: 'success',
              message: '审批已撤回'
            })
            this.$emit('refreshList')
          } else {
            this.$message({
              type: 'error',
              message: '审批撤回失败'
            })
          }
        })
      })
    },
    getList () {
      let state = ''
      if (this.mergeParams.msgCatalog == 'APPROVE_TYPE_02_01' || this.mergeParams.msgCatalog == 'APPROVE_TYPE_01_01') {
        state = 'ACTIVE'
      }
      if (this.mergeParams.msgCatalog == 'APPROVE_TYPE_02_02' || this.mergeParams.msgCatalog == 'APPROVE_TYPE_01_02') {
        state = 'COMPLETED'
      }
      this.$api['processApproval.listData']({
        state: state,
        assigneeUserId: this.mergeParams.assigneeUserId,
        startUserId: this.mergeParams.startUserId
      }).then((res) => {
        this.approvalList = res
        this.selectOptions = this.approvalList.map((el) => {
          return { label: el.name, value: el.name }
        })
        this.searchConfig.forEach((el) => {
          if (el.fieldName == 'tabsName') {
            el.options = this.selectOptions
          }
        })
      })
    },
    // 截取名称，超过4个字符追加省略号
    truncateName (name) {
      let textLength = 6
      return name.length > textLength ? `${name.slice(0, textLength)}...` : name
    },
    // 显示全部标签
    showAllTags () {
      this.showAll = true
      this.showAllTagsClicked = true // 设置为已点击“更多”按钮
    },
    hideAllTags () {
      this.showAll = false
      this.showAllTagsClicked = false // 设置为未点击“更多”按钮
    },
    tagClick (item) {
      const index = this.activeIds.indexOf(item.name)
      if (index > -1) {
        // 如果包含 item.id，则移除
        this.activeIds.splice(index, 1)
      } else {
        // 如果不包含 item.id，则添加
        this.activeIds.push(item.name)
      }
      this.mergeParams.tagNameList = this.activeIds
      this.renderTime = new Date() + ''
    },
    reSet () {
      let that = this
      this.mergeParams.searchBoxParam = undefined
      that.mergeParams.processName = ''
      that.mergeParams.senderName = ''
      that.mergeParams.startEndTime = []
      this.searchTabs = ''
      this.activeIds = []
      that.renderTime = new Date() + ''
    },
    ascendingTime () {
      // 时间升序
      if (this.chargeIds.includes(this.searchParams.msgCatalog)) {
        this.mergeParams.page.orders = [{ column: 'pinst.start_time_', asc: false }]
      } else {
        this.mergeParams.page.orders = [{ column: 're.start_Time', asc: false }]
      }
      this.renderTime = new Date() + ''
    },
    descendingOrderTime () {
      // 时间降序
      if (this.chargeIds.includes(this.searchParams.msgCatalog)) {
        this.mergeParams.page.orders = [{ column: 'pinst.start_time_', asc: true }]
      } else {
        this.mergeParams.page.orders = [{ column: 're.start_Time', asc: true }]
      }
      this.renderTime = new Date() + ''
    },
    refreshList () {
      this.renderTime = new Date() + ''
      this.$emit('refreshList')
      setTimeout(() => {
        this.tabEenderTime = new Date().getTime()
      }, 500)
    },
    search (queryParam) {
      this.mergeParams = Object.assign(this.mergeParams, queryParam)
      this.renderTime = new Date() + ''
      if (queryParam.tabsName) {
        this.searchTabs = queryParam.tabsName
      } else {
        this.searchTabs = ''
      }
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
      margin: 0px 2px !important;
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
      text-overflow: ellipsis;
      width: 100%;
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

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.more-button {
  cursor: pointer;
}

.tagsSearch {
  max-height: 120px;
  overflow-y: auto;
  margin-left: 8px;
}

.isActive {
  background: #3373c2 !important;
  color: white;
}

.isSearch {
  background: #3c5d86;
  color: white;
}
</style>
