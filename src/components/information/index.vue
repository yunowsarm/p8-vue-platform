<template>
  <common-dialog v-if="visible"
                 :visible="visible"
                 :width="dialogWidth"
                 :dialog-config="dialogConfig"
                 @isfullscreen="handleFullscreen"
                 :show-handle-btn="false"
                 @close="visibleMsgClose"
                 :dialog-height="dialogHeight"
                 title="沟通消息">
    <template #dialog>
      <normal-layout :header-visible="false"
                     :split-default-left-width="defaultWidth">
        <template #north> </template>
        <template #west>
          <el-input v-if="!thirdMenuParam"
                    v-model="projectName"
                    style="width:90%; margin-bottom: 10px;"
                    placeholder="请输入项目名称"
                    @change="handleEnter"></el-input>
          <div class="left-panel"
               v-if="users.length > 0">

            <user v-for="(user, index) in users"
                  :key="index"
                  :user="user"
                  :selected="user.entityId === selectedUser.entityId"
                  @select="onSelectUser(user, true)" />
          </div>
        </template>
        <template #center>
          <div class="right-panel">
            <message-panel id="message"
                           ref="msg"
                           v-if="selectedUser.entityId"
                           :user="selectedUser"
                           :messagesData="list"
                           @messageevent="messageevent"
                           @setUser="setUser"
                           @input="onMessage" />
          </div>
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>

<script>
import User from './components/User'
import MessagePanel from './components/MessagePanel'
import { P8Dialog as CommonDialog, P8NormalLayoutV1 as NormalLayout } from 'p8-components-ui'

export default {
  name: 'Information',
  components: { User, MessagePanel, CommonDialog, NormalLayout },
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
      visible: this.visibleMsgDrawer,

      dialogWidth: '60%',
      dialogHeight: document.documentElement.clientHeight - 200,
      defaultWidth: 25,
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
      dateTime: new Date().getTime(),
      projectName: '',
      isChange: false
    }
  },
  created () {
    if (this.thirdMenuParam) {
      this.users.push(
        {
          entityName: this.thirdMenuParam.PROJECTNAME,
          entityId: this.thirdMenuParam.WHOLEDESCRIBEID,
          entityType: 'project'
        }
      )
      this.onSelectUser()
    } else {
      this.$api['documentManagement.getWebsocketGroupAll']().then(res => {
        if (res) {
          let count = 0
          this.users = res
          res.forEach(item => {
            count = count + item.messageCount
          })
          this.$store.dispatch('setMessageCount', count)
        }
      })
    }
  },
  mounted () {
    window.myWebSocket.on("messageevent", (users) => {
      this.setUser()
    });
  },
  destroyed () {
    window.myWebSocket.off('messageevent')
  },
  methods: {
    handleFullscreen () {
      this.selectedUser.contentText = this.$refs.msg.contentText
    },
    handleEnter () {
      this.isChange = false
      this.setUser(this.projectName)
    },
    visibleMsgClose () {
      this.visible = false
      this.$emit('visibleMsgClose')
    },
    setUser (val) {
      if (this.thirdMenuParam) {
        return false
      }
      // if (val !== 'read') {
      //   return false
      // }
      this.$api['documentManagement.getWebsocketGroupAll']({ entityName: this.projectName }).then(res => {
        if (res.length > 0) {
          let count = 0
          if (!this.thirdMenuParam) {
            this.users = res
          }
          res.forEach(item => {
            count = count + item.messageCount
          })
          this.$store.dispatch('setMessageCount', count)
        } else {
          this.selectedUser = {}
          this.users = []
        }
      })
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
      window.myWebSocket.emit('sendMessageGroupChat', params)
    },
    async onSelectUser (user, val) {
      if (user) {
        this.selectedUser = user
      } else {
        this.selectedUser = this.users[0] ? this.users[0] : null
      }
      if (val) {
        this.selectedUser.contentText = ''
      }
      this.list = []
      await this.$api['documentManagement.getWebsocketById']({
        entityId: this.selectedUser ? this.selectedUser.entityId : '',
        entityType: this.selectedUser ? this.selectedUser.entityType : '',
        type: 'update',
        page: {
          current: 1,
          size: 10,
          total: 0,
          orders: [{ column: 'createTime', asc: false }],
          pages: 0
        }
      }).then(res => {
        if (res) {
          res.records.forEach(item => {
            this.list.unshift(item)
          })
        }
      })
      // 实时刷新消息数
      await this.$api['documentManagement.getWebsocketGroupAll']({ entityName: this.projectName }).then(res => {
        if (res.length > 0) {
          let count = 0
          res.forEach(item => {
            count = count + item.messageCount
          })
          this.$store.dispatch('setMessageCount', count)
        } else {
          this.$store.dispatch('setMessageCount', 0)
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
}
#message {
  width: 100%;
}
</style>
