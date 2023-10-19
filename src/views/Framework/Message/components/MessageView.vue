<template>
  <div class="container">
    <div class="messageTitle">
      <el-row type="flex" style="text-align: left; height: 22px; line-height: 22px">
        <el-col :span="20">
          <span class="left-span">
            <i class="p8 icon-message" style="color: #1890ff"></i>
          </span>
          <span class="title-span">
            {{ messageData.msgTitle }}
          </span>
          <span>
            <el-tag v-if="messageData.uploadFiles != null && messageData.uploadFiles.length > 0" size="mini" effect="plain" class="message-tag">
              <i class="p8 icon-jianhao"></i>
              <span class="tag-num">{{ messageData.uploadFiles.length }}</span>
            </el-tag>
            <el-tag v-if="messageData.msgLink != null && messageData.msgLink != ''" size="mini" effect="plain" class="message-tag">
              <i class="p8 icon-fenzu"></i>
            </el-tag>
          </span>
        </el-col>
        <el-col :span="4" style="text-align: right; padding-right: 5px">
          <span class="operate-span">
            <el-link :underline="false" @click="toggleStatus(messageData.id)"><i class="p8" :class="statusIcon" style="color: #1890ff"></i></el-link>
            <el-link :underline="false" @click="deleteMsg(messageData.id)"><i class="p8 icon-delete" style="color: #1890ff"></i></el-link>
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
      <div v-if="messageData.msgLink" class="contentBody">
        <component v-if="messageData.msgLink != null && messageData.msgLink != ''" :rote-name="messageData.entityId" :table-flex="320" :is="componentLoader" />
      </div>
    </VuePerfectScrollbar>
  </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { Row, Col, Tag, Link } from 'p8-components-ui'

export default {
  name: 'MessageView',
  components: {
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
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
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
        .catch((e) => {
          console.log(e)
        })
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

    .left-span {
      display: inline-block;
      width: 20px;
    }

    .title-span {
      font-size: 16px;
      font-weight: bold;
      margin-right: 20px;
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
    }

    .border-bottom {
      border-bottom: 1px solid #eeeef0;
    }
  }
}
</style>
