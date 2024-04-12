<template>
  <common-drawer v-if="visibleMsgDrawer"
                 :visible="visibleMsgDrawer"
                 title="沟通消息"
                 @close="visibleMsgClose"
                 size="50%">
    <template #drawer>
      <div class="content">
        <div class="left-panel"
             v-if="users.length > 0">
          <!-- <user v-for="(user, index) in users"
                :key="index"
                :user="user"
                :selected="selectedUser === user"
                @select="onSelectUser(user)" /> -->
        </div>
        <div class="right-panel">
          <message-panel ref="msg"
                         :user="selectedUser"
                         :messagesData="list"
                         @messageevent="messageevent"
                         @setUser="setUser"
                         @input="onMessage" />
        </div>
      </div>
    </template>
  </common-drawer>
</template>

<script>
import User from './components/User'
import MessagePanel from './components/MessagePanel'
import { P8Drawer as CommonDrawer } from 'p8-components-ui'

export default {
  name: 'Information',
  components: { User, MessagePanel, CommonDrawer },
  props: {
    visibleMsgDrawer: {
      type: Boolean
    }
  },
  data () {
    return {
      selectedUser: null,
      list: [],
      users: [],
      dateTime: new Date().getTime()
    }
  },
  created () {
    this.onSelectUser()
    // this.selectedUser.hasNewMessages = false
    // this.$api['documentManagement.getWebsocketAll']().then(res => {
    //   if (res) {
    //     console.log(window.myWebSocket.data, '===============================获取新用户');
    //     this.users = [...window.myWebSocket.data, ...res]
    //   }
    // })
    window.myWebSocket.on("privateMessage", (users) => {
      console.log('11111111111111111111111111111');
      this.users.forEach(item => {
        users.forEach(user => {
          if (item.id === user.id) {
            item.messageCount = user.messageCount
          } else {
            this.users.push(user)
          }
        })
      })
      console.log(this.users, '=============================this.users');
      this.dateTime = new Date().getTime()
      // setTimeout(() => {
      // }, 5000)
    });
  },
  mounted () { },
  destroyed () {
    window.myWebSocket.off('privateMessage')
  },
  methods: {
    visibleMsgClose () {
      this.$emit('visibleMsgClose')
    },
    setUser (users) {
      this.users.forEach(item => {
        users.forEach(user => {
          if (item.id === user.id) {
            item.messageCount = user.messageCount
          }
        })
      })
      this.dateTime = new Date().getTime()
    },
    messageevent (user) {
      this.users.forEach(item => {
        if (item.sessionId === user.sessionId) {
          item.messageCount = 0
        }
      })
      this.dateTime = new Date().getTime()
    },
    onMessage (params) {
      console.log("socketsocketsocketsocketsocketsocket:", window.myWebSocket)
      window.myWebSocket.emit('sendMessageGroupChat', params)
    },
    onSelectUser (user) {
      this.list = []
      // if (user.hasNewMessages) {
      // this.messageevent(user)
      // }
      this.$api['documentManagement.getWebsocketById']({
        entityId: '001',
        entityType: 'chat',
        type: 'update'
      }).then(res => {
        // user.hasNewMessages = false
        if (res) {
          this.selectedUser = res[0]
          // this.selectedUser.sendSessionId = res[0].sendSessionId ? res[0].sendSessionId : null
          this.list = res
        }
      })
    }
  }
}
</script>

<style scoped>
.box-card {
  height: 80%;
  width: 80%;
}
.content {
  background: #f6f6f7;
  display: flex;
  flex-direction: row;
  height: calc(100% - 35px);
  margin: 10px 10px;
}
.left-panel {
  width: 30%;
  background-color: #e4e4e6;
  color: #293137;
  overflow-y: auto;
}
.right-panel {
  width: 100%;
}
</style>
