<template>
  <div class="ai-chat">
    <!-- 聊天窗口 -->
    <div class="chat-window" ref="chatWindow" @scroll="handleScroll">
      <!-- 加载更多提示 -->
      <div v-if="messages.length > 0" class="load-more-tip">
        <span v-if="loading">加载中...</span>
        <span v-else-if="noMore">已无更多消息</span>
      </div>

      <!-- 现有的消息列表 -->
      <div v-if="messages.length === 0" class="placeholder-message">还没有消息哦，快输入您的要求吧。</div>
      <div v-for="(message, index) in messages" :key="index">
        <div v-if="!!message.content" :class="['message', message.sendUser === userId ? 'user' : 'ai']">
          <el-button v-if="message.styleType" class="task_preview" type="text" @click="taskPreview(message.content)">点击查看数据 </el-button>
          <div v-else class="text">{{ message.content }}</div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input type="textarea" :rows="5" resize="none" placeholder="请输入要求描述" @keydown.enter.native="handleKeyDown" v-model="userInput"></el-input>
      <div class="button-area">
        <el-button class="stop_button" type="primary" size="small" round @click="stopWorkFlow">停止 </el-button>
        <el-tooltip :disabled="tooltipDisabled" v-model="showTip" effect="dark" :content="tooltipContent" placement="top">
          <el-button class="send_button" :disabled="sendDisabled" type="primary" size="small" round @click="sendMessage">发送 </el-button>
        </el-tooltip>
      </div>
    </div>
    <common-dialog
      title="预览"
      width="90%"
      v-if="taskPreviewVisible"
      :visible="taskPreviewVisible"
      :show-handle-btn="false"
      @close="taskPreviewVisible = false"
      :is-view-cs-footer="false"
      :dialog-height="700"
    >
      <template #dialog>
        <task-preview v-if="taskPreviewVisible" :task-data="taskPreviewData" @success="successCreateTasks"></task-preview>
      </template>
    </common-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TaskPreview from '@/views/product/PlanGantt/Components/autoGeneration/components/TaskPreview.vue'
import { P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  components: {
    CommonDialog,
    TaskPreview
  },
  props: {
    planInfoId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false, // 是否正在加载更多
      noMore: false, // 是否还有更多数据
      taskPreviewVisible: false,
      taskPreviewData: [],
      showTip: false,
      messages: [], // 存储聊天消息
      userInput: '', // 用户输入的内容
      page: {
        current: 1,
        size: 10,
        total: 0,
        orders: [{ column: 'createTime', asc: false }],
        pages: 0
      }
    }
  },
  computed: {
    key() {
      return `${this.userId}-${this.planInfoId}`
    },
    tooltipContent() {
      return '请输入您的要求'
    },
    // 新增：发送按钮禁用条件
    sendDisabled() {
      return !this.userInput.trim()
    },
    // 新增：tooltip禁用条件
    tooltipDisabled() {
      // 只有在非工作流进行中且有输入内容时才禁用tooltip
      return !!this.userInput.trim()
    },
    ...mapGetters(['userId', 'userName'])
  },
  created() {
    // 组件加载时初始化对话记录
    this.initChatHistory()
  },
  mounted() {
    window.myWebSocket.on('getIntelligenceMessage', (data) => {
      if (data.entityId === this.planInfoId) {
        this.$set(this.messages, this.messages.length, data)
        this.scrollToBottom()
        this.$emit('refreshAiData')
        this.$forceUpdate()
      }
    })
  },
  methods: {
    stopWorkFlow(){
      this.$api['planGanttManager.stopWorkFlow']({
        taskId: this.planInfoId,
        type:'plan'
      }).then(() => {})
    },
    // 处理滚动事件
    handleScroll() {
      const chatWindow = this.$refs.chatWindow
      // 当滚动到顶部时加载更多
      if (chatWindow.scrollTop === 0 && !this.loading && !this.noMore) {
        this.loadMoreMessages()
      }
    },

    // 加载更多消息
    loadMoreMessages() {
      this.loading = true
      this.page.current += 1

      this.$api['planGanttManager.getWebsocketById']({
        entityId: this.planInfoId,
        entityType: 'plan',
        sessionId:this.userId,
        page: this.page
      }).then((res) => {
        if (res && res.records.length > 0) {
          // 将新消息添加到列表开头
          this.messages = [...res.records.reverse(), ...this.messages]

          // 保持滚动位置
          this.$nextTick(() => {
            const chatWindow = this.$refs.chatWindow
            chatWindow.scrollTop = 10 // 略微偏移，防止触发新的加载
          })
        } else {
          this.noMore = true
        }
      }).finally(() => {
        this.loading = false
      })
    },

    // 修改初始化方法
    initChatHistory() {
      this.loading = true
      this.page.current = 1
      this.noMore = false

      this.$api['planGanttManager.getWebsocketById']({
        entityId: this.planInfoId,
        entityType: 'plan',
        sessionId:this.userId,
        page: this.page
      }).then((res) => {
        if (res) {
          this.messages = [...res.records.reverse()]
          this.scrollToBottom()
          // 如果第一页数据不足一页，说明没有更多数据了
          if (res.records.length < this.page.size) {
            this.noMore = true
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleKeyDown(event) {
      // 如果是普通回车键（没有按下 Ctrl 或 Shift）
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault() // 阻止默认换行行为
        this.sendMessage() // 触发发送逻辑
      }
      // 如果是 Shift + Enter，允许默认换行行为
    },
    sendMessage() {
      if (this.userInput.trim() === '') {
        this.showTip = true
        return
      }
      const userMessage = { sendUser: this.userId, content: this.userInput }
      this.messages.push(userMessage)
      this.$api['planGanttManager.aiGeneratedSendDescribe']({ planId: this.planInfoId, describe: this.userInput }).finally(() => {
        this.userInput = ''
        this.scrollToBottom()
      })
    },
    taskPreview(content) {
      this.taskPreviewData = content
      this.taskPreviewVisible = true
    },
    successCreateTasks() {
      this.taskPreviewVisible = false
      this.$emit('refreshAiData')
      this.$message({
        type: 'success',
        message: '添加成功'
      })
    },
    // 设置滚动条到最底部
    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindow
        chatWindow.scrollTop = chatWindow.scrollHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  //max-width: 600px;
  margin: 0 auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chat-window {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #ffffff;
}

.message {
  margin-bottom: 12px;
  display: flex;

  &.user {
    justify-content: flex-end;
  }

  &.ai {
    justify-content: flex-start;
  }

  .task_preview {
    padding: 10px 16px;
    border-radius: 16px;
    font-size: 14px;
    background-color: #ebeef5;
  }

  .text {
    max-width: 70%;
    padding: 10px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
  }

  &.user .text {
    background-color: #409eff;
    color: white;
  }

  &.ai .text {
    background-color: #ebeef5;
    color: #303133;
  }
}

.input-area {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #ebeef5;
  //padding: 16px;
  background-color: #ffffff;

  .el-input {
    flex: 1;
    margin-right: 12px;
    border: none;
  }

  .button-area {
    padding: 6px;
    display: flex;
    justify-content: flex-end;
  }
}

.placeholder-message {
  text-align: center;
  color: #999;
  margin-top: 20px;
}

::v-deep .el-textarea__inner {
  border: none;
}

::v-deep .el-dialog__body {
  padding: 0 !important;
}
.load-more-tip {
  text-align: center;
  padding: 10px 0;
  color: #999;
  font-size: 12px;
}
</style>
