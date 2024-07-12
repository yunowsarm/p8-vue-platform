<template>
  <div class="content-box">
    <!-- <div class="header">
      <status-icon :connected="user.connected" />{{ user.sendUserName }}
    </div> -->
    <div class="drawer-right">
      <div class="chat-box">
        <div class="msg-box"
             :style="{width: msgRightWidth}"
             ref="msgBox"
             @scroll="handleScroll">
          <div class="refresh-wrapper"
               ref="refreshWrapper">
            <div v-if="!loading"
                 class="refresh-text">没有更多了</div>
            <div v-else
                 class="refresh-text">加载中...</div>
          </div>
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
                <div class="user-msg">
                  <span class="right">{{i.content}}</span>
                  <!-- <span class="content-card">{{i.content}}</span> -->
                </div>
              </div>
              <div v-else>
                <!-- 游客 -->
                <span style="margin-right: 20px;">{{ i.sendUserName }}</span>
                <span>{{ i.itemCreateTime }}</span>
                <div class="user-msg">
                  <span class="left">{{i.content}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="contentText-box">
          <i class="el-icon-search"
             @click="searchShow"></i>
          <span class="span-icon"
                @click="callOut">@</span>
          <textarea class="contentText-textarea"
                    autofocus
                    ref="textareaRef"
                    @keydown.enter="onSubmit()"
                    @focus="focus()"
                    v-model="contentText">
              </textarea>
        </div>
      </div>
      <el-button class="btn"
                 slot="reference"
                 type="primary"
                 @click="onSubmit()">发送</el-button>
    </div>
    <resource-select v-if="resourceSelectVisible"
                     :visible="resourceSelectVisible"
                     :entityId="entityId"
                     @closed="resourceSelectclosed"
                     @resource-selected="resourceSelected">
    </resource-select>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon";
import moment from 'moment'
import ResourceSelect from '@/components/information/components/resourceSelect.vue'
export default {
  name: "MessagePanel",
  components: {
    StatusIcon,
    ResourceSelect
  },
  props: ['user', 'messagesData'],
  data () {
    return {
      userId: this.$store.state.user.userId, // 当前用户ID
      // receiverUser: this.$store.getters.name, // 当前用户昵称
      // avatar: this.$store.getters.avatar, // 当前用户头像
      msgRightWidth: '100%',
      contentText: "", // input输入的值
      messagesList: this.messagesData,
      resourceSelectVisible: false,
      selectUserIds: [],
      entityId: '',
      loading: false,
      page: {
        current: 1,
        size: 10,
        total: 0,
        orders: [{ column: 'createTime', asc: false }],
        pages: 0
      }
    };
  },
  watch: {
    messagesData (val, oldVal) {
      this.messagesList = val
      this.contentText = ''
      setTimeout(() => {
        this.scrollBottm();
      }, 100);
      // this.$refs.textareaRef.focus()
    }
  },
  mounted () {
    if (this.user) {
      this.entityId = this.user.entityId
      this.contentText = this.user.contentText
    }
    this.$refs.textareaRef.focus();
    setTimeout(() => {
      this.scrollBottm();
    }, 100);
    // 组件挂载时，订阅事件
    window.myWebSocket.on('messageevent', (data) => {
      if (this.user.entityId === data.entityId) {
        this.messagesList.push(data)
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
    fetchData () {
      // // 模拟异步加载数据
      // setTimeout(() => {
      let that = this
      this.page.current++
      // 假设这里是异步获取数据的操作，比如调用接口等
      this.$api['documentManagement.getWebsocketById']({
        entityId: this.user ? this.user.entityId : '',
        entityType: this.user ? this.user.entityType : '',
        type: 'update',
        page: this.page
      }).then(res => {
        that.loading = false;  // 加载完成后取消 loading 状态
        if (res.records.length > 0) {
          let arr = []
          res.records.forEach(item => {
            arr.unshift(item)
          })
          that.messagesList = [...arr, ...that.messagesList]
          that.$refs.msgBox.scrollTop = 500 * 3
        } else {
          that.$refs.msgBox.scrollTop = 0;
        }

      })
      // }, 1000); // 模拟延迟加载
    },
    handleScroll () {
      const container = this.$refs.msgBox;
      // 检测是否在顶部并且向下拉动
      if (container.scrollTop < 10) {
        this.loading = true;
        this.fetchData();  // 触发加载数据
      }
    },
    // 清空已读消息
    focus () {
      // this.$api['documentManagement.getWebsocketById']({
      //   entityId: this.user ? this.user.entityId : '',
      //   entityType: this.user ? this.user.entityType : '',
      //   type: 'update',
      //   page: this.page
      // }).then(res => {
      //   // this.$emit('onSelectUser')
      // })
    },
    onSubmit () {
      // 阻止默认的回车行为（如换行）
      event.preventDefault();
      const encoder = new TextEncoder();
      const encoded = encoder.encode(this.contentText);
      if (encoded.length > 1000) {
        return this.$message.warning('文字超出限制无法发出！')
      }
      if (this.contentText === '') {
        return
      }
      // 获取当前时间的 Date 对象
      let now = new Date();
      // 获取本地时间与 UTC 时间的偏移量（以分钟为单位）
      let offsetMinutes = now.getTimezoneOffset();
      // 北京时间与 UTC 的时区偏移量是 +8 小时
      let offsetBeijing = 8 * 60;
      // 计算北京时间的毫秒数
      let beijingTime = now.getTime() + (offsetBeijing + offsetMinutes) * 60 * 1000;
      // 创建包含北京时间的 Date 对象

      console.log(beijingTime);

      this.messagesList.push(
        {
          itemCreateTime: moment(beijingTime).format('YYYY-MM-DD HH:mm:ss'),
          // sessionId: this.user.sessionId,
          // sendSessionId: this.user.sendSessionId,
          // userId: '1',
          sendUser: this.$store.state.user.userId,
          sendUserName: this.$store.state.user.userName,
          content: this.contentText,
          avatar: this.$store.getters.avatar, // 当前用户头像
          entityId: this.user ? this.user.entityId : '',
          entityType: this.user ? this.user.entityType : ''
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
        entityId: this.user ? this.user.entityId : '',
        entityType: this.user ? this.user.entityType : '',
        selectUserIds: this.selectUserIds
      };

      this.$emit('input', params)
      setTimeout(() => {
        this.scrollBottm();
        this.contentText = "";
        this.$refs.textareaRef.focus()
      }, 100);
    },
    callOut () {
      this.entityId = this.user.entityId
      this.resourceSelectVisible = true
    },
    resourceSelected (rows) {
      let names = ''
      rows.forEach(item => {
        this.selectUserIds.push(item.userId)
        names = names + ' @' + item.name + ' '
      })
      if (this.contentText !== undefined) {
        this.contentText = this.contentText + names
      } else {
        this.contentText = names
      }
      this.resourceSelectVisible = false
    },
    resourceSelectclosed () {
      this.resourceSelectVisible = false
    },
    searchShow () {
      this.isShow = !this.isShow
      let params = {
        entityId: this.user ? this.user.entityId : '',
        entityType: this.user ? this.user.entityType : '',
        history: 'history'
      }
      this.$emit('searchShow', this.isShow, params)
    },
    scrollBottm () {
      let el = this.$refs.msgBox;
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
  position: relative;
}
.header {
  margin: 20px 10px;
}
.drawer-right {
  width: 100%;
  height: calc(100% - 40px);
}
.chat-box {
  height: 100%;
}
.msg-box {
  height: 400px; /* 设置容器的高度，使其可以滚动 */
  overflow-y: auto; /* 显示滚动条 */
}
.refresh-wrapper {
  text-align: center;
  padding: 10px 0;
  color: #999;
}
// .msg .user-msg .right {
//   text-align: start;
// }
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
      max-width: 300px;
      text-align: start;
    }
    .right {
      background: #53a8ff;
      color: white;
      animation: toright 0.5s ease both 1;
      max-width: 300px;
      text-align: start;
    }
    .content-card {
      border-radius: 10px; /* 圆角 */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 阴影 */
      background: #0d1130;
      color: white;
      animation: toright 0.5s ease both 1;
      max-width: 300px;
      text-align: start;
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
  height: calc(100% - 400px);
  width: 100%;
  border-top: 2px #f2f2f2 solid;
  overflow-y: visible;
}
.contentText-textarea {
  width: 98%;
  height: 80%;
  resize: none;
  border: none;
  outline-color: rgb(255, 255, 255);
}
.btn {
  position: absolute;
  right: 10px;
  bottom: 0px;
}
.el-icon-search {
  font-size: 20px;
  margin: 5px;
}
.load-msg {
  text-align: center;
  margin-bottom: 20px;
}
.span-icon {
  font-size: 20px;
  color: #606592;
}
</style>
