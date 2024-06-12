<template>
  <common-dialog v-if="visibleMsgDrawer"
                 :visible="visibleMsgDrawer"
                 :width="dialogWidth"
                 :dialog-config="dialogConfig"
                 :show-handle-btn="false"
                 @close="visibleMsgClose"
                 :dialog-height="dialogHeight"
                 title="沟通消息">
    <template #dialog>
      <normal-layout :header-visible="false"
                     :split-default-left-width="defaultWidth">
        <template #north> </template>
        <template #west>
          <div class="left-panel"
               v-if="users.length > 0">
            <user v-for="(user, index) in users"
                  :key="index"
                  :user="user"
                  :selected="selectedUser === user"
                  @select="onSelectUser(user)" />
          </div>
        </template>
        <template #center>
          <div class="right-panel">
            <message-panel id="message"
                           ref="msg"
                           :user="selectedUser"
                           :messagesData="list"
                           @messageevent="messageevent"
                           @setUser="setUser"
                           @input="onMessage"
                           @searchShow="searchShow" />
            <message-view v-if="historyMsg"></message-view>
          </div>
        </template>
        <template #drawer-panel>

        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>

<script>
import User from './components/User'
import MessagePanel from './components/MessagePanel'
import MessageView from './components/MessageView'
import { P8Dialog as CommonDialog, P8NormalLayoutV1 as NormalLayout } from 'p8-components-ui'

export default {
  name: 'Information',
  components: { User, MessagePanel, CommonDialog, NormalLayout, MessageView },
  props: {
    visibleMsgDrawer: {
      type: Boolean
    },
    thirdMenuParam: {
      type: Object
    }
  },
  data () {
    return {
      historyMsg: false,
      dialogWidth: '800px',
      dialogHeight: 600,
      defaultWidth: 30,
      dialogConfig: {
        'append-to-body': true
      },
      selectedUser: {},
      list: [],
      users: [

        // {
        //   entityName: '项目-给珠穆朗玛峰装电梯',
        //   messageCount: 5
        // },
        // {
        //   entityName: '项目-给长城贴瓷砖',
        //   messageCount: 1
        // }
      ],
      dateTime: new Date().getTime()
    }
  },
  async created () {
    // this.selectedUser.hasNewMessages = false
    console.log(this.thirdMenuParam, '=============rrrrrrrrrrrrrrr');
    if (this.thirdMenuParam) {
      this.users.push(
        {
          entityName: this.thirdMenuParam.PROJECTNAME,
          entityId: this.thirdMenuParam.WHOLEDESCRIBEID,
          entityType: 'project'
        }
      )
    } else {
      // await this.getGroupAll()
    }
    this.onSelectUser()
    window.myWebSocket.on("privateMessage", (users) => {
      this.users.forEach(item => {
        users.forEach(user => {
          if (item.id === user.id) {
            item.messageCount = user.messageCount
          } else {
            this.users.push(user)
          }
        })
      })
      this.dateTime = new Date().getTime()
      // setTimeout(() => {
      // }, 5000)
    });
  },
  mounted () {
  },
  destroyed () {
    window.myWebSocket.off('privateMessage')
  },
  methods: {
    getGroupAll () {
      this.$api['documentManagement.getWebsocketGroupAll']().then(res => {
        if (res) {
          console.log(window.myWebSocket.data, '===============================获取新用户');
          this.users = res
        }
      })
    },
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
    searchShow (isShow) {
      console.log("🚀 ~ searchShow ~ isShow:", isShow)
      this.historyMsg = isShow

      if (isShow) {
        this.dialogWidth = '1100px'
        // document.getElementById("message").style.width = "60%";
        // document.getElementById("history").style.width = "40%";
      } else {
        this.dialogWidth = '800px'
        // document.getElementById("message").style.width = "100%";
        // document.getElementById("history").style.width = "40%";
      }
    },
    onSelectUser (user) {
      if (user) {
        this.selectedUser = user
      } else {
        this.selectedUser = this.users[0] ? this.users[0] : null
      }
      console.log("🚀 ~ onSelectUser ~ user:", this.users[0])

      this.list = []
      // if (user.hasNewMessages) {
      // this.messageevent(user)
      // }
      this.$api['documentManagement.getWebsocketById']({
        entityId: this.selectedUser ? this.selectedUser.entityId : '',
        entityType: this.selectedUser ? this.selectedUser.entityType : '',
        type: 'update'
      }).then(res => {
        // user.hasNewMessages = false
        if (res) {
          // this.selectedUser.sendSessionId = res[0].sendSessionId ? res[0].sendSessionId : null
          this.list = res
        }
      })
    }
  }
}
</script>

<style scoped>
.normal-layout {
  margin: 14px;
  padding-left: 0 !important;
}
.left-panel {
  height: 100%;
  color: #293137;
  overflow-y: auto;
  margin-right: 20px;
}
.right-panel {
  height: 100%;
  display: flex;
  width: 100%;
}
#message {
  width: 100%;
}
</style>
