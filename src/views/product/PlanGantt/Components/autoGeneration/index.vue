<template>
  <div class="ai-chat">
    <!-- 聊天窗口 -->
    <div class="chat-window" ref="chatWindow">
      <div v-if="aiMessages[key].messages.length === 0" class="placeholder-message">还没有消息哦，快输入您的要求吧。</div>
      <div v-for="(message, index) in aiMessages[key].messages" :key="index" :class="['message', message.sender]">
        <div class="text">{{ message.text }}</div>
      </div>
      <div v-if="aiMessages[key] && aiMessages[key].state === 'start'" class="ai">
        <span>{{ aiMessages[key].loadingText }}</span>
        <i class="el-icon-loading" style="font-size: 16px"></i>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input type="textarea" :rows="5" resize="none" placeholder="请输入要求描述" @keydown.enter.native="handleKeyDown" v-model="userInput"></el-input>
      <div class="button-area">
        <el-tooltip :disabled="!!userInput.trim() || aiMessages[key].state === 'start'" v-model="showTip" effect="dark" content="请输入您的要求" placement="top">
          <el-button class="send_button" :disabled="aiMessages[key].state === 'start' || !userInput.trim()" type="primary" size="small" round @click="sendMessage">发送 </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    planInfoId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showTip: false,
      messages: [], // 存储聊天消息
      userInput: '', // 用户输入的内容
      aiMessages: {}
    }
  },
  computed: {
    key() {
      return `${this.userId}-${this.planInfoId}`
    },
    ...mapGetters(['userId', 'userName'])
  },
  created() {
    // 组件加载时初始化对话记录
    this.initChatHistory()
  },
  mounted() {
    window.myWebSocket.on('getIntelligenceMessage', (data) => {
      if (data.key === this.key) {
        if (data.type === 'start') {
          this.$set(this.aiMessages[this.key], 'state', data.type)
          this.$set(this.aiMessages[this.key], 'loadingText', data.message)
          // this.saveChatHistory()
          this.scrollToBottom()
        } else {
          this.$set(this.aiMessages[this.key], 'state', data.type)
          this.$set(this.aiMessages[this.key], 'loadingText', '')
          this.$set(this.aiMessages[this.key].messages, this.aiMessages[this.key].messages.length, { sender: 'ai', text: data.message })
          // this.saveChatHistory()
          this.scrollToBottom()
          this.$emit('refreshAiData')
        }
        console.log(this.aiMessages[this.key].loadingText)
        console.log(this.aiMessages[this.key].messages)
        this.$forceUpdate()
      }
    })
  },
  methods: {
    initChatHistory() {
      // 从 localStorage 加载所有用户的对话记录
      const storedMessages = localStorage.getItem('aiMessages')
      if (storedMessages) {
        this.aiMessages = JSON.parse(storedMessages)
        this.scrollToBottom()
      }

      // 如果当前用户没有对话记录，则初始化一个
      if (!this.aiMessages[this.key]) {
        this.aiMessages[this.key] = {
          state: '',
          loadingText: '',
          messages: []
        }
        // 保存到 localStorage
        // this.saveChatHistory()
      }
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

      // 添加用户消息
      const userMessage = { sender: 'user', text: this.userInput }
      this.aiMessages[this.key].messages.push(userMessage)
      // this.saveChatHistory()
      this.$api['planGanttManager.aiGeneratedSendDescribe']({ planId: this.planInfoId, describe: this.userInput }).then((res) => {
        if (res) {
          // 清空输入框
          this.userInput = ''
          this.scrollToBottom()
        }
      })
    },
    saveChatHistory() {
      // 将 aiMessages 对象转换为 JSON 字符串并存储到 localStorage
      localStorage.setItem('aiMessages', JSON.stringify(this.aiMessages))
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
  background-color: #f0f2f5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chat-window {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f9f9f9;
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

  .text {
    max-width: 70%;
    padding: 10px 16px;
    border-radius: 8px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
  }

  &.user .text {
    background-color: #409eff;
    background-color: #6200ea;
    color: white;
  }

  &.ai .text {
    background-color: #ebeef5;
    background-color: #e0e0e0;
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

    .send_button {
      float: right;
      flex-shrink: 0;
    }
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
</style>
