<template>
  <div class="ai-form">
    <!-- 遮罩层 -->
    <div v-if="showMask" class="ai-mask">
      <div class="mask-content">
        <div class="loading-spinner"></div>
        <div class="mask-text">正在分析...</div>
        <el-button v-show="showStopBtn" class="stop-btn" type="danger" size="mini" @click="stopAnalysis">停止分析</el-button>
      </div>
    </div>
    <!-- 输入区域 -->
    <div v-if="files.length" class="file-list">
      <div v-for="file in files" :key="file.uid" class="file-item">
        <i class="el-icon-document"></i>
        <span class="file-name">{{ file.fileName }}</span>
        <i class="el-icon-delete delete-icon" @click="handleRemove(file)"></i>
      </div>
    </div>
    <div class="input-area">
      <el-input type="textarea" :rows="5" resize="none" placeholder="请输入要求描述" @keydown.enter.native="handleKeyDown"
        v-model="userInput"></el-input>
      <div class="button-area">
        <!-- <div v-if="loading" style="flex: 1;margin-left: 10px">AI正在思考...</div> -->
        <common-upload class="upload_button" :files="files" uploadSlot :uploadConfig="uploadConfig" listType="custom" @upload="handleUpload"
          @remove="handleRemove">
          <div slot="upload">
            <el-button type="primary" round size="mini">上传附件</el-button>
          </div>
        </common-upload>
        <el-tooltip :disabled="!!files.length" effect="dark" content="请上传文档"
          placement="top">
          <el-button class="send_button" :disabled="!files.length" type="primary" round size="mini"
            @click="sendMessage">确定
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { P8Upload as CommonUpload } from 'p8-components-ui'
export default {
  components: {
    CommonUpload
  },
  props: {
    formCode:{
      type: String,
      default: ''
    },
    // 表单配置描述文本
    description: {
      type: [],
      default: () => {
        return []
      }
    },
    // 表单Json结构
    formJson: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      uploadConfig:{
        accept:'.doc,.docx'
      },
      userInput: '',
      files: [],
      loading: false,
      showMask: false, // 新增遮罩控制变量
      taskId:'',
      workFlowRunId:''
    }
  },
  computed: {
    showStopBtn(){
      return this.taskId && this.workFlowRunId
    },
    completeDescription() {
      const data = {
        description: this.description,
        formJson: this.formJson,
        userInput: this.userInput,
        requirements: `
        1.通过分析文档和用户输入的要求（userInput）给formJson中的字段赋值
        2.formJson中的字段必须符合description配置要求;
        3.字段的值尽量可以通过分析文档生成，避免为空`
      }
      return JSON.stringify(data, null, 2)
    }
  },
  created() {
    window.myWebSocket.on('getDocParseFormMessageMessage', (data) => {
      // 判断ai进程
      if(data.taskId && data.workFlowRunId){
        // ai已进入进程，可以终止
        this.taskId = data.taskId
        this.workFlowRunId = data.workFlowRunId
      }else{
        this.taskId = ''
        this.workFlowRunId = ''
      }
      // ai返回的最终结果
      if(data.type === 'end'){
        try {
          // 尝试解析 data.content
          const parsedContent = JSON.parse(data.content);
          this.$emit('handleAIFill', parsedContent);
          this.$emit('hidePopover');
          this.files = [];
          this.userInput = '';
          this.showMask = false;
        } catch (error) {
          this.showMask = false;
          // 解析失败，输出错误信息
          console.error('解析 data.content 时出错:', error);
          // 可以根据需求添加更多的错误处理逻辑，比如提示用户
          this.$message.error('解析 AI 返回结果时出错，请稍后重试');

        }
      }
    })
  },
  mounted() {

  },
  destroyed () {
    window.myWebSocket.off('getDocParseFormMessageMessage')
  },
  methods: {
    handleUpload(file) {
      this.files.push(file)
      this.$emit('updatePopper')
    },
    handleRemove(file) {
      this.files = this.files.filter(f => f !== file)
      this.$emit('updatePopper')
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
      console.log('sendMessage', this.completeDescription)
      this.showMask = true; // 打开遮罩

      this.$api['formGenerator.generateFormFromDocument']({
        formCode: this.formCode,
        files: this.files,
        prompt: this.completeDescription,
        formJson: JSON.stringify(this.formJson)
      }).then((res) => {
        if(res){
          this.showMask = true
        }
      }).catch((error) => {
        this.$message.error('请求失败')
      })
    },
    stopAnalysis() {
      this.$api['formGenerator.stopParseDocFormResult']({
        formCode: this.formCode,
        taskId: this.taskId,
        workFlowRunId: this.workFlowRunId
      }).then((res) => {
        if(res){
          this.showMask = false
        }
      }).catch((error) => {

      })
    }
  }
}
</script>

<style lang="scss" scoped>
.input-area {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
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
    align-items: center;

    .send_button,
    .upload_button {
      height: 28px;
      flex-shrink: 0;
      margin-left: 10px;
    }
  }
}

::v-deep .el-textarea__inner {
  border: none;
}

.file-list {
  margin-bottom: 8px;

  .file-item {
    display: flex;
    align-items: center;
    border-radius: 4px;

    .el-icon-document {
      margin-right: 8px;
      color: #909399;
    }

    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .delete-icon {
      color: #909399;
      cursor: pointer;
      padding: 4px;
      font-size: 16px;

      &:hover {
        color: #f56c6c;
      }
    }
  }
}
.ai-mask {
  position: fixed;
  z-index: 9999;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  .mask-content {
    background: #fff;
    border-radius: 8px;
    padding: 36px 32px 24px 32px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 220px;
  }
  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #409EFF;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  .mask-text {
    font-size: 16px;
    color: #333;
    margin-bottom: 18px;
    letter-spacing: 2px;
  }
  .stop-btn {
    align-self: center;
  }
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
</style>
