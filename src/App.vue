<template>
  <router-view />
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { io } from 'socket.io-client'

export default {
  name: 'App',
  data () {
    return {
      user: this.$store.state.user,
      conunt: 0
    }
  },
  computed: {
    ...mapGetters(['token', 'userId', 'userInfo'])
  },
  watch: {
    token: {
      handler (val) {
        if (val) {
          this.getJson()
        }
      },
      immediate: true
    },
    userInfo: {
      handler (val) {
        if (val.id) {
          this.initWebSocket(val.id, val.realName)
        }
      },
      immediate: true
    }
  },
  mounted () {
    window.socketType = null
  },
  methods: {
    initWebSocket (id, name) {
      let that = this
      // 判断页面有没有存在websocket连接
      if (window.WebSocket) {
        // window.myWebSocket.close();
        // let sip = '房间号'
        // 填写本地IP地址 此处的 :9101端口号 要与后端配置的一致！
        // 线上使用，直接获取浏览器地址
        const URL = window.location.protocol + '//' + window.location.hostname + ':' + SOCKET_PORT + '?sendUserName=' + name + '&sendUser=' + id + '&authorization=' + this.token
        // 本地开发使用
        // const URL = SOCKET_URL + '?sendUserName=' + name + '&sendUser=' + id + '&authorization=' + this.token
        const socket = io(URL, { autoConnect: true, transports: ['websocket'] }) // 连接到服务器
        window.myWebSocket = socket
        window.myWebSocket.connect()
        socket.on('messageevent', (data) => {
          let count = this.$store.getters.messageCount
          // let taskMessageCount = this.$store.state.user.taskMessageCount
          this.$store.dispatch('setMessageCount', ++count)
          // this.$store.dispatch('setTasketMessageCount', ++taskMessageCount)
          this.message()
        })
        socket.on('getApproveNum', (data) => {
          let count = this.$store.getters.approvalTotalMsg
          this.$store.dispatch('setApprovalMessageCount', ++count)
        })
        socket.on('getMessageNum', (data) => {
          let count = this.$store.getters.messageNum
          this.$store.commit('SET_MESSAGENUM', ++count)
        })
        window.myWebSocket.on('connectSuccess', (res) => {
          if (that.conunt === 0) {
            // that.$message.success('websocket连接成功')
            window.socketType = false
          }
          that.conunt++
        })
        // 连接失败时自动重新连接
        window.myWebSocket.on('reconnect_failed', () => {
          that.conunt = 0
          console.log('*******************重新连接失败，自动重连*****************')
          // window.myWebSocket.off('reconnect') // 取消所有的重连事件监听
          // window.myWebSocket.close() // 关闭连接
          this.$message.error('websocket重新连接失败，自动重连中...')
          window.socketType = true
          // this.$message({
          //   message: "重新连接失败，自动重连中...",
          //   type: 'error',
          //   duration: 5000,
          //   showClose: true
          // })
          window.myWebSocket.connect()
        })
        window.myWebSocket.on('connect_error', (err) => {
          that.conunt = 0
          console.log('*******************连接失败，自动重连*****************')
          this.$message.error('websocket连接失败，自动重连中...')
          window.socketType = true
          // this.$message({
          //   message: "连接失败，自动重连中...",
          //   type: 'error',
          //   duration: 5000,
          //   showClose: true
          // })
          window.myWebSocket.connect()
        });
      }
    },
    message () {
      // 设置初始标题
      var originalTitle = document.title;

      // 闪烁标题的定时器
      var blinkInterval = setInterval(function () {
        document.title = (document.title === originalTitle) ? "新消息到达,请注意查收!" : originalTitle;
      }, 1000);

      // 播放声音提示
      // var audio = new Audio('./msg.mp3');
      // audio.play();

      // 显示通知
      if ("Notification" in window) {
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            var notification = new Notification("新消息到达", {
              body: "请注意查收！"
            });
          }
        });
      }

      // 在用户关闭或切换页面时停止所有定时器，并将标题恢复为原始标题
      window.addEventListener('focus', function () {
        clearInterval(blinkInterval);
        document.title = originalTitle;
      });
    },
    getJson () {
      axios
        .get('/static/iconfont/iconfont.json', {
          headers: { Authorization: this.token }
        })
        .then((res) => {
          const iconList = []
          res.data.glyphs.forEach((item) => {
            iconList.push('icon-' + item.font_class)
          })
          const p8font = {
            key: 'p8',
            title: 'P8 Icon',
            icons: iconList
          }
          localStorage.setItem('p8font', JSON.stringify(p8font))
        })
    }
  },
  beforeDestroy () {
    window.myWebSocket.off('messageevent')
    window.myWebSocket.off('privateMessage')
    window.myWebSocket.off('reconnect_failed')
    window.myWebSocket.off('connectSuccess')
    window.myWebSocket.close()
  }
}
</script>
