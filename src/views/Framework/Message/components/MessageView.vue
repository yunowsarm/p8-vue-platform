<template>
  <div class="container">
    <div class="messageTitle">
      <el-row type="flex" style="text-align: left; height: 22px; line-height: 22px">
        <el-col :span="20" class="flex-row">
          <span class="left-span">
            <i class="p8 icon-message iconColor" style="color: #1890ff"></i>
          </span>
          <el-tooltip effect="light" :content="messageData.msgTitle" placement="top-start">
            <span class="title-span">
              {{ messageData.msgTitle }}
            </span>
          </el-tooltip>

          <span>
            <el-tag v-if="messageData.uploadFiles != null && messageData.uploadFiles.length > 0" size="mini" effect="plain" class="message-tag">
              <i class="p8 icon-jianhao"></i>
              <span class="tag-num">{{ messageData.uploadFiles.length }}</span>
            </el-tag>
          </span>
        </el-col>
        <el-col :span="4" style="text-align: right; padding-right: 5px">
          <span class="operate-span">
            <el-link :underline="false" @click="toggleStatus(messageData.id)"><i class="p8 iconColor" :class="statusIcon" style="color: #1890ff"></i></el-link>
            <el-link :underline="false" @click="deleteMsg(messageData.id)"><i class="p8 icon-delete iconColor" style="color: #1890ff"></i></el-link>
          </span>
        </el-col>
      </el-row>
      <el-row type="flex" style="text-align: left; padding: 5px 0">
        <el-col :span="24">
          <span class="msg-user">{{ messageData.senderName }}</span>
          <span class="msg-time">{{ messageData.sendDate }}</span>
        </el-col>
      </el-row>
    </div>
    <VuePerfectScrollbar class="messageContent" style="overflow: auto">
      <div class="contentBody border-bottom" v-if="hasHtmlTag(messageData.msgContent)" v-html="messageData.msgContent"></div>
      <div class="contentBody border-bottom" v-else>{{ messageData.msgContent }}</div>
      <div v-if="messageData.uploadFiles != null && messageData.uploadFiles.length > 0" class="contentBody border-bottom">
        <div>{{ messageData.uploadFiles.length }} 个附件</div>
        {{ messageData.uploadFiles }}
      </div>
      <div v-if="messageData.msgLink" class="contentBody" style='height: calc(100% - 70px)'>
        <component v-if="messageData.msgLink" :businessKey="messageData.entityId" :rote-name="messageData.entityId" :table-flex="320" :key='renderKey' :is="componentLoader" :task-id='messageData.entityId' />
      </div>
    </VuePerfectScrollbar>
  </div>
</template>

<script>
import TaskDetail from './TaskDetail/index.vue'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { Row, Col, Tag, Link } from 'p8-components-ui'
import PlanAttribute from '@/views/product/PlanGantt/Components/planAttribute/index.vue'

export default {
  name: 'MessageView',
  components: {
    TaskDetail,
    PlanAttribute,
    'el-row': Row,
    'el-col': Col,
    'el-tag': Tag,
    'el-link': Link,
    VuePerfectScrollbar
  },
  props: {
    messageData: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    // componentLoader () {
    //   return () => import('@/views/' + this.messageData.msgLink)
    // },
    statusIcon() {
      let icon = ''
      if (this.messageData.msgStatus === '1501') {
        icon = 'icon-message'
      } else {
        icon = 'icon-plan-examine'
      }

      return icon
    }
  },
  watch: {
    messageData: {
      handler(val) {
        if (val.msgLink) {
          this.componentLoader = () => import('@/views/' + val.msgLink)
          this.renderKey = new Date().getTime()
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      renderKey: new Date().getTime(),
      componentLoader: null
    }
  },
  methods: {
    toggleStatus(id) {
      this.$emit('onToggleStatus', id, '1501')
    },
    deleteMsg(id) {
      this.$confirm('是否要删除该消息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$emit('onDeleteMsg', id)
        })
        .catch((e) => {})
    },
    hasHtmlTag(str) {
      return /<[^>]*>/i.test(str)
    }
  }
}
</script>

<style lang="scss" scoped>
$titleHeight: 70px;
$paddingLeft: 10px;
.container {
  height: 100%;

  .messageTitle {
    color: #606266;
    padding-left: $paddingLeft;
    padding-top: 10px;
    height: $titleHeight;
    border-bottom: 1px solid #eeeef0;
    box-sizing: border-box;

    .el-row {
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .flex-row {
      display: flex;
      flex-direction: row;
    }

    .left-span {
      display: inline-block;
      width: 20px;
    }

    .title-span {
      flex: 1;
      font-size: 16px;
      font-weight: bold;
      margin-right: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .msg-user {
      padding-left: 24px;
      padding-right: 10px;
    }

    .message-tag {
      width: 42px;
      height: 20px;
      text-align: center;
      margin-right: 5px;
      background: #ecf5ff;
      border-color: #178fff;
      font-size: 12px;

      i {
        color: #f6a63d;
        font-size: 15px;
      }

      .tag-num {
        margin-left: 2px;
        color: #178fff;
      }
    }

    .operate-span {
      i {
        margin: 0px 5px 0px 5px;
      }
    }
  }

  .messageContent {
    height: calc(100% - #{$titleHeight} - 2px);
    font-size: 14px;

    .contentBody {
      padding: 15px 25px 15px 35px;
      ::v-deep .el-row .el-col{
        height: auto;
      }
    }

    .border-bottom {
      border-bottom: 1px solid #eeeef0;
    }
  }
}
</style>
