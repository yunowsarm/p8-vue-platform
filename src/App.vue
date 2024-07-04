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
      user: this.$store.state.user
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
  mounted () { },
  methods: {
    initWebSocket (id, name) {
      // 判断页面有没有存在websocket连接
      if (window.WebSocket) {
        // let sip = '房间号'
        // 填写本地IP地址 此处的 :9101端口号 要与后端配置的一致！
        const URL = SOCKET_URL + '?sendUserName=' + name + '&sendUser=' + id
        const socket = io(URL, { autoConnect: false, transports: ['websocket'] }) // 连接到服务器
        window.myWebSocket = socket
        window.myWebSocket.connect()
        // socket.on("privateMessage", (data) => {
        //   console.log(data, '==========APP=============privateMessage')
        // });
        socket.on('messageevent', (data) => {
          console.log(data, '==========APP=============messageevent')
          // if (this.$store.state.user.userId !== data.sendUser) {
          // let count = this.$store.getters.messageCount
          // console.log("🚀 ~ socket.on ~ count:", count)
          // this.$store.dispatch('setMessageCount', count++)
          this.message()
          // }
        })
        // 连接失败时取消自动重新连接
        window.myWebSocket.on('reconnect_failed', () => {
          console.log('重连失败，取消自动重连')
          window.myWebSocket.off('reconnect') // 取消所有的重连事件监听
          window.myWebSocket.close() // 关闭连接
        })
      }
    },
    message () {
      // 设置初始标题
      var originalTitle = document.title;

      // 闪烁标题的定时器
      var blinkInterval = setInterval(function () {
        document.title = (document.title === originalTitle) ? "\u{1F49B} 新消息到达,请注意查收! \u{1F49A}" : originalTitle;
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
  }
}
</script>
