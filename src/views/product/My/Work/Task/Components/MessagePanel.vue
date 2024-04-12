<template>
  <div>
    <common-drawer v-if="isVisibleDocumentEditDrawer"
                   title="沟通信息"
                   :visible="isVisibleDocumentEditDrawer"
                   placement="top"
                   :size="drawerSize"
                   @close="documentEditDrawerClose">
      <template #drawer>
        <div class="drawer-center">
          <div v-if="isShow"
               class="drawer-letf">
            <search-form-list :comp="comp"
                              search-width="100%"
                              search-contain-width="100%"
                              ref="search"
                              :data-source="searchData"
                              @search="search"
                              @re-set="reSet"></search-form-list>
            <div class="chat-box-left">
              <div class="msg-box-left"
                   @scroll="handleScroll"
                   ref="list">
                <div v-for="(i,index) in messagesData"
                     :key="index"
                     class="msg">
                  <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                  <div class="use-style">
                    <div>
                      <span>{{ i.sendUserName }}</span>
                      <span>{{ i.itemCreateTime }}</span>
                      <div class="user-msg">
                        <span class="left">{{i.content}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="load-msg"
                     v-if="loading">Loading<i class="el-icon-loading"></i></div>
              </div>
            </div>
          </div>
          <div class="drawer-right">
            <div class="chat-box">
              <div class="msg-box"
                   :style="{width: msgRightWidth}"
                   ref="msg-box">
                <div v-for="(i,index) in messagesList"
                     :key="index"
                     class="msg"
                     :style="i.sendUser == userId?'flex-direction:row-reverse':''">
                  <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                  <div class="use-style">
                    <div v-if="i.sendUser === userId"
                         class="text-align">
                      <span>{{ i.itemCreateTime }}</span>
                      <div class="user-msg">
                        <span class="right">{{i.content}}</span>
                      </div>
                    </div>
                    <div v-else>
                      <span>{{ i.itemCreateTime }}</span>
                      <span>{{ i.sendUserName }}</span>
                      <div class="user-msg">
                        <span class="left">{{i.content}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="input-box">
                <i class="el-icon-search"
                   @click="searchShow"></i>
                <span class="span-icon"
                      @click="callOut">@</span>
                <textarea class="input-textarea"
                          ref="textareaRef"
                          v-model="contentText">
              </textarea>
              </div>
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
      </template>
    </common-drawer>
    <resource-select v-if="resourceSelectVisible"
                     :visible="resourceSelectVisible"
                     :plan-info-id="thirdMenuParamTemp.PLANINFOID"
                     @closed="resourceSelectclosed"
                     @resource-selected="resourceSelected">
    </resource-select>
  </div>
</template>

<script>
import moment from 'moment'
import ResourceSelect from '@/components/information/components/resourceSelect.vue'
import {
  P8Drawer as CommonDrawer,
  P8Search as SearchFormList
} from 'p8-components-ui'
export default {
  components: {
    CommonDrawer,
    SearchFormList,
    ResourceSelect
  },
  props: ['isVisibleDocumentEditDrawer', 'thirdMenuParamTemp'],
  data () {
    return {
      comp: this,
      loading: false,
      page: 1,
      searchData: [
        {
          type: 'text',
          labelText: '发送人',
          fieldName: 'sendUserName',
          placeholder: '请输入发送人名称'
          // fieldEvent: {
          //   click: 'clickEvent(this)'
          // }
        },
        {
          type: 'text',
          labelText: '发送内容',
          fieldName: 'content',
          placeholder: '请输入发送内容'
        },
        {
          type: 'datetimeRange',
          labelText: '起止时间',
          fieldName: 'cycleTime',
          placeholder: ['开始日期', '结束日期']
        }
      ],
      popoverType: false,
      isShow: false,
      drawerSize: '30%',
      ws: null,
      userId: this.$store.state.user.userId, // 当前用户ID
      username: this.$store.getters.name, // 当前用户昵称
      avatar: this.$store.getters.avatar, // 当前用户头像
      messagesList: [], // 聊天记录的数组
      messagesData: [], // 聊天记录的数组
      msgRightWidth: '100%',
      contentText: "", // input输入的值
      resourceSelectVisible: false,
      selectUserIds: []
    };
  },
  mounted () {
    this.onSelectUser('update')
    // setTimeout(() => {
    //   this.scrollBottm();
    // }, 100);
    // this.$refs.textareaRef.focus()
    // 组件挂载时，订阅事件
    window.myWebSocket.on('messageevent', (data) => {
      if (this.$store.state.user.userId !== data.sendUser) {
        this.messagesList.push(data)
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
    search (params) {
      this.onSelectUser('history', params)
    },
    reSet () {
      this.onSelectUser('history')
    },
    searchShow () {
      this.isShow = !this.isShow
      if (this.isShow) {
        this.drawerSize = '50%'
        this.msgRightWidth = '60%'
      } else {
        this.drawerSize = '30%'
        this.msgRightWidth = '100%'
      }
      this.onSelectUser('history')
    },
    callOut () {
      this.resourceSelectVisible = true
    },
    resourceSelectclosed () {
      this.resourceSelectVisible = false
    },
    resourceSelected (rows) {
      let names = ''
      rows.forEach(item => {
        this.selectUserIds.push(item.userId)
        names = names + ' @' + item.name + ' '
      })
      this.contentText = this.contentText + names
      this.resourceSelectVisible = false
    },
    documentEditDrawerClose () {
      this.$emit('success')
    },
    handleScroll () {
      const list = this.$refs.list;
      if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
        // this.loadMore();
      }
    },
    onSelectUser (val, parameters) {
      this.messagesData = []
      // if (user.hasNewMessages) {
      // this.messageevent(user)
      // }
      let params = {
        entityId: '001',
        entityType: 'chat'
      }
      if (val === 'history') {
        params.history = val
      }
      if (val === 'update') {
        params.type = val
      }
      this.$api['documentManagement.getWebsocketById']({ ...params, ...parameters }).then(res => {
        // user.hasNewMessages = false
        if (res) {
          // this.selectedUser.sendSessionId = res[0].sendSessionId ? res[0].sendSessionId : null
          if (val === 'history') {
            this.messagesData = res
          } else {
            this.messagesList = res
          }
          setTimeout(() => {
            this.scrollBottm();
          }, 100);
        }
      })
    },
    onSubmit () {
      if (this.contentText === '') {
        this.popoverType = false
        return
      }
      this.popoverType = true
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
        // avatar: this.avatar,
        content: this.contentText,
        avatar: this.$store.getters.avatar, // 当前用户头像
        entityId: '001',
        entityType: 'chat',
        selectUserIds: this.selectUserIds
      };
      window.myWebSocket.emit('sendMessageGroupChat', params)
      this.contentText = "";
      this.selectUserIds = []
      setTimeout(() => {
        this.scrollBottm();
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
::v-deep .search-wrapper {
  float: none !important;
}
.drawer-center {
  display: flex;
  flex-direction: row;
  background: white;
  height: 100%;
}
.drawer-letf {
  width: 40%;
  border-right: 2px #f2f2f2 solid;
}
.drawer-right {
  width: 60%;
}
.chat-box-left {
  margin: 0 auto;
  background: white;
  position: absolute;
  height: 95%;
  width: 40%;
}
.msg-box-left {
  height: calc(100% - 17px);
  overflow-x: hidden;
}
.chat-box {
  margin: 0 auto;
  background: white;
  position: absolute;
  height: 94%;
  width: 100%;
}
.msg-box {
  height: calc(100% - 204px);
  overflow-x: hidden;
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
    // position: absolute;
  }
  .use-style {
    display: flex;
    flex-direction: column;
    width: 81%;
  }
  .text-align {
    text-align: end;
  }
  .user-msg {
    width: 100%;
    // position: absolute;
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
.input-box {
  position: absolute;
  bottom: 40;
  width: 100%;
  // box-shadow: 0 0 2px #ccc;
  border-top: 2px #f2f2f2 solid;
}
.input-textarea {
  height: 120px;
  width: 100%;
  resize: none;
  border: none;
  outline-color: rgb(255, 255, 255);
  // padding-left: 15px;
}
.btn {
  position: absolute;
  right: 10px;
  bottom: 5px;
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
  color: #252424;
}
</style>
