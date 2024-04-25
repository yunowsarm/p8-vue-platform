<template>
  <div class="content-box">
    <!-- <div class="header">
      <status-icon :connected="user.connected" />{{ user.sendUserName }}
    </div> -->
    <div class="drawer-right">
      <div class="chat-box">
        <div class="msg-box"
             :style="{width: msgRightWidth}"
             ref="msg-box">
          <div v-for="(i,index) in messagesList"
               :key="index"
               class="msg"
               :style="i.sendUser == userId?'flex-direction:row-reverse':''">
            <!-- <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar> -->
            <div class="use-style">
              <!-- 自己 -->
              <div v-if="i.sendUser === userId"
                   class="text-align">
                <span>{{ i.itemCreateTime }}</span>
                <!-- <span>{{ i.receiverUser }}</span> -->
                <div class="user-msg">
                  <span class="right">{{i.content}}</span>
                </div>
              </div>
              <div v-else>
                <!-- 游客 -->
                <span>{{ i.itemCreateTime }}</span>
                <span>{{ i.sendUserName }}</span>
                <div class="user-msg">
                  <span class="left">{{i.content}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="contentText-box">
          <textarea class="contentText-textarea"
                    autofocus
                    ref="textareaRef"
                    v-model="contentText">
              </textarea>
        </div>
      </div>
      <el-popover placement="top-end"
                  width="100"
                  v-model="popoverType"
                  trigger="click"
                  content="不能发送空白消息">
        <el-button class="btn"
                   slot="reference"
                   type="primary"
                   @click="onSubmit()">发送</el-button>
      </el-popover>
    </div>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon";
import moment from 'moment'
export default {
  name: "MessagePanel",
  components: {
    StatusIcon,
  },
  props: ['user', 'messagesData'],
  data () {
    return {
      popoverType: false,
      userId: this.$store.state.user.userId, // 当前用户ID
      // receiverUser: this.$store.getters.name, // 当前用户昵称
      // avatar: this.$store.getters.avatar, // 当前用户头像
      msgRightWidth: '100%',
      contentText: "", // input输入的值
      messagesList: this.messagesData
    };
  },
  watch: {
    messagesData (val, oldVal) {
      this.messagesList = val
      setTimeout(() => {
        this.scrollBottm();
      }, 100);
      // this.$refs.textareaRef.focus()
    }
  },
  mounted () {
    this.$refs.textareaRef.focus();
    console.log(window, 'myWebSocket' + this.$store.state.user.userId);
    setTimeout(() => {
      this.scrollBottm();
    }, 100);
    // this.$refs.textareaRef.focus()
    // 组件挂载时，订阅事件
    window.myWebSocket.on('messageevent', (data) => {
      console.log(document.title, '================11===============document.title');
      if (this.$store.state.user.userId !== data.sendUser) {
        this.messagesList.push(data)
        // this.message()
        // this.$emit('messageevent', this.user)
        setTimeout(() => {
          this.scrollBottm();
        }, 100);
      }
    })
    window.myWebSocket.on("privateMessage", (data) => {
      this.$emit('setUser', data)
    });
  },
  destroyed () {
    window.myWebSocket.off('privateMessage')
    window.myWebSocket.off('messageevent')
  },
  methods: {
    // message () {
    //   // 设置初始标题
    //   var originalTitle = document.title;

    //   // 闪烁标题的定时器
    //   var blinkInterval = setInterval(function () {
    //     document.title = (document.title === originalTitle) ? "\u{1F49B} 新消息到达,请注意查收！ \u{1F49A}" : originalTitle;
    //     console.log(document.title, '================22===============document.title');
    //   }, 1000);

    //   // 显示通知
    //   if ("Notification" in window) {
    //     Notification.requestPermission().then(function (permission) {
    //       if (permission === "granted") {
    //         var notification = new Notification("新消息到达", {
    //           body: "请注意查收！"
    //         });
    //       }
    //     });
    //   }

    //   // 在用户关闭或切换页面时停止所有定时器，并将标题恢复为原始标题
    //   window.addEventListener('focus', function () {
    //     clearInterval(blinkInterval);
    //     document.title = originalTitle;
    //   });

    // },
    onSubmit () {
      // this.user.hasNewMessages = false
      // this.$emit('messageevent', this.user)
      if (this.contentText === '') {
        this.popoverType = false
        return
      }
      // this.$refs.textareaRef.focus()
      this.messagesList.push(
        {
          itemCreateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          // sessionId: this.user.sessionId,
          // sendSessionId: this.user.sendSessionId,
          // userId: '1',
          sendUser: this.$store.state.user.userId,
          sendUserName: this.$store.state.user.userName,
          content: this.contentText,
          avatar: this.$store.getters.avatar, // 当前用户头像
          entityId: '001',
          entityType: 'chat'
        }
      )
      let params = {
        itemCreateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        // sessionId: this.user.sessionId,
        // sendSessionId: this.user.sendSessionId,
        // userId: '1',
        sendUser: this.$store.state.user.userId,
        sendUserName: this.$store.state.user.userName,
        content: this.contentText,
        avatar: this.$store.getters.avatar, // 当前用户头像
        entityId: '001',
        entityType: 'chat'
      };
      this.contentText = "";
      this.popoverType = true
      this.$emit('input', params)
      setTimeout(() => {
        this.scrollBottm();
        this.$refs.textareaRef.focus()
      }, 100);
    },
    // 滚动条到底部
    scrollBottm () {
      let el = this.$refs["msg-box"];

      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.content-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}
.header {
  margin: 20px 10px;
}
/* .contentText {
  width: 80%;
  resize: none;
  padding: 10px;
  line-height: 1.5;
  border-radius: 5px;
  border: 1px solid #000;
} */

/* .send-button {
  vertical-align: top;
} */

.drawer-right {
  width: 100%;
  height: calc(100% - 40px);
}
/* .chat-box-left {
  margin: 0 auto;
  background: white;
  position: absolute;
  height: 95%;
  width: 40%;
} */
/* .msg-box-left {
  height: calc(100% - 17px);
  overflow: auto;
  margin-top: 30px;
} */
.chat-box {
  height: 100%;
}
.msg-box {
  height: 70%;
  overflow: auto;
}
.msg {
  width: 97%;
  min-height: 2.5rem;
  margin: 1rem 0.5rem;
  position: relative;
  display: flex;
  justify-content: flex-start !important;
  .user-head {
    min-width: 2.5rem;
    width: 20%;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #f1f1f1;
    display: flex;
    justify-content: center;
    align-items: center;
    .head {
      width: 1.2rem;
      height: 1.2rem;
    }
  }
  .use-style {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .text-align {
    text-align: end;
  }
  .user-msg {
    width: 100%;
    word-break: break-all;
    position: relative;
    span {
      display: inline-block;
      padding: 0.5rem 0.7rem;
      border-radius: 0.5rem;
      margin-top: 0.2rem;
      font-size: 0.88rem;
    }
    .left {
      background: #f5f5f5;
      animation: toLeft 0.5s ease both 1;
    }
    .right {
      background: #53a8ff;
      color: white;
      animation: toright 0.5s ease both 1;
    }
    @keyframes toLeft {
      0% {
        opacity: 0;
        transform: translateX(-10px);
      }
      100% {
        opacity: 1;
        transform: translateX(0px);
      }
    }
    @keyframes toright {
      0% {
        opacity: 0;
        transform: translateX(10px);
      }
      100% {
        opacity: 1;
        transform: translateX(0px);
      }
    }
  }
}
.contentText-box {
  height: 30%;
  width: 100%;
  border-top: 2px #f2f2f2 solid;
  overflow-y: visible;
}
.contentText-textarea {
  width: 100%;
  height: 100%;
  resize: none;
  border: none;
  outline-color: rgb(255, 255, 255);
}
.btn {
  position: absolute;
  right: 20px;
  bottom: 30px;
}
.el-icon-search {
  font-size: 20px;
  margin: 5px;
}
.load-msg {
  text-align: center;
  margin-bottom: 20px;
}
</style>
