<template>
  <common-dialog v-if="visible"
                 :visible="visible"
                 :width="dialogWidth"
                 :dialog-config="dialogConfig"
                 :show-handle-btn="false"
                 @close="visibleMsgClose"
                 :dialog-height="dialogHeight"
                 title="历史消息">
    <template #dialog>
      <div class="listContainer">
        <infinite-list :key="timeKey"
                       ref="infList"
                       class="finiteList"
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
                  <span style="margin-right: 20px;">{{ item.sendUserName }}</span>
                  <span class="msg-time">{{ item.itemCreateTime }}</span>
                </el-col>
              </el-row>
              <el-row type="flex"
                      style="text-align: left">
                <el-col :span="24">
                  <span v-if="item.styleType"
                        style="font-size: 15px;"
                        v-html="item.content"></span>
                  <span v-else
                        class="msg-content">{{ item.content }}</span>
                </el-col>
              </el-row>
            </span>
          </template>
        </infinite-list>
      </div>
      <common-dialog v-if="visibleFeedback"
                     :visible="visibleFeedback"
                     :width="dialogWidth"
                     :dialog-config="dialogConfig"
                     :show-handle-btn="false"
                     @close="visibleFeedbackClose"
                     :dialog-height="dialogHeight"
                     title="历史反馈">
        <template #dialog>
          <history-table :row="selsectRows"></history-table>
        </template>
      </common-dialog>
    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog, P8InfiniteScroll as InfiniteList } from 'p8-components-ui'
import historyTable from "@/views/product/Plan/planExamine/historyTable.vue";
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
    },
    visible: {
      type: Boolean
    }
  },
  components: {
    'infinite-list': InfiniteList,
    CommonDialog,
    historyTable
  },
  data () {
    return {
      visibleFeedback: false,
      selsectRows: [],
      dialogConfig: {
        'append-to-body': true
      },
      dialogHeight: document.documentElement.clientHeight - 243,
      dialogWidth: '50%',
      messageListApi: 'documentManagement.getWebsocketById',
      currentIndex: null,
      mergeParams: {
        ...this.searchParams,
        page: {
          size: 10,
          total: 0,
          orders: [{ column: 'createTime', asc: false }],
          pages: 0
        }
      },
      timeKey: new Date().getTime()
    }
  },
  mounted () {
    window.historyClick = this.historyClick.bind(this)
  },
  methods: {
    historyClick (id) {
      let arr = [{
        ID: id
      }]
      this.selsectRows = arr
      this.visibleFeedback = true
    },
    triggerSelect (item, index) {
      if (index && index == this.currentIndex) {
        return
      }
      this.currentIndex = index
    },
    messageLoad (data, current) {
      if (data && current && current === 1) {
        this.currentIndex = 0
      }
    },
    visibleMsgClose () {
      this.visible = false
      this.$emit('visibleHistory')
    },
    history (id) {
      this.visibleFeedback = true
    },
    visibleFeedbackClose () {
      this.visibleFeedback = false
    }
  }
}
</script>

<style lang="scss" scoped>
$icon-span-width: 20px;

.listContainer {
  border-left: 1px #e1e1e1 solid;
  width: 98%;
  padding: 15px;
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
.finiteList {
  overflow-x: hidden !important;
}
</style>
