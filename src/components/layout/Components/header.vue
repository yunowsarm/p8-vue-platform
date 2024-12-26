<template>
  <header class="header"
          :height="headerHeight">
    <!-- :style="{ 'background-color': theme, 'margin-bottom': '1px' }"> -->
    <!-- <span class="sysName">{{ systemName }}</span> -->
    <div class="slide-bar"
         v-if="!this.sidebarState.isHidden"
         @click="slideSidebar">
      <!-- v-show="$route.path !== '/dash'" -->
      <div class="slider p8"
           :class="{ 'icon-youzhedie1': !this.sidebarState.isOpen, 'icon-zuozhedie1': this.sidebarState.isOpen }"></div>
    </div>
    <div class="center">
      <header-shortcut />
      <header-subsystem />
    </div>

    <div class="settings">
      <ul>
        <li v-if="adminUserIdArr.indexOf($store.state.user.userId) === -1">
          <span>
            <!-- <i class="p8 icon-work-home" @click="$router.push({name:'Dashboard'})"> -->
            <el-badge v-if="messageCount > 0"
                      :value="messageCount"
                      :max="99"
                      class="itemNum">
              <el-tooltip content="沟通消息">
                <i class="p8 icon-shejigoutong"
                   @click="informationDrawer = true"></i>
              </el-tooltip>
            </el-badge>
            <el-tooltip v-else
                        content="沟通消息">
              <i class="p8 icon-shejigoutong"
                 @click="informationDrawer = true"></i>
            </el-tooltip>
          </span>
          <information v-if="informationDrawer"
                       ref="information"
                       :visibleMsgDrawer="informationDrawer"
                       @visibleMsgClose="visibleMsgClose"></information>
        </li>
        <!-- $route.path !== '/dash' && -->
        <li v-if="adminUserIdArr.indexOf($store.state.user.userId) === -1">
          <span>
            <!-- <i class="p8 icon-work-home" @click="$router.push({name:'Dashboard'})"> -->
            <el-tooltip content="工作首页">
              <i class="el-icon-s-home"
                 @click="$router.push({ name: 'Dashboard' })"></i>
            </el-tooltip>
          </span>
        </li>
        <!-- $route.path !== '/dash' && -->
        <li v-show="adminUserIdArr.indexOf($store.state.user.userId) === -1">
          <span @click="visibleMsgDrawer = true">
            <el-badge v-if="messageNum > 0"
                      :value="messageNum"
                      :max="99"
                      class="itemNum">
              <el-tooltip content="我的消息">
                <i class="p8 icon-message"></i>
              </el-tooltip>
            </el-badge>

            <el-tooltip content="我的消息"
                        v-else>
              <i class="p8 icon-message"></i>
            </el-tooltip>
          </span>
        </li>
        <!-- $route.path !== '/dash' &&  -->
        <li v-show="adminUserIdArr.indexOf($store.state.user.userId) === -1">
          <span @click="visibleProcessDrawer = true">
            <el-badge v-if="approvalTotalMsg > 0"
                      :value="approvalTotalMsg"
                      :max="99"
                      class="itemNum">
              <el-tooltip content="我的审批">
                <i class="p8 icon-approval"></i>
              </el-tooltip>
            </el-badge>
            <el-tooltip content="我的审批"
                        v-else>
              <i class="p8 icon-approval"></i>
            </el-tooltip>
          </span>
        </li>
        <!-- $route.path !== '/dash' &&  -->
        <li v-show="adminUserIdArr.indexOf($store.state.user.userId) === -1">
          <span @click="visibleDownloadDrawer = true">
            <el-tooltip content="我的下载">
              <i class="p8 icon-download-document-manage"></i>
            </el-tooltip>
          </span>
        </li>
        <li>
          <el-dropdown size="small">
            <span>
              <span class="name">{{ dayTime }}好！{{ userName }}</span>
              <i class="el-icon-arrow-down"
                 style="margin: 0 5px"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="modifyPassword">
                <i class="p8 icon-modify-password"></i>
                修改密码
              </el-dropdown-item>
              <!-- 功能未完成, 暂时注释 -->
              <el-dropdown-item @click.native="settingPersonal">
                <i class="p8 icon-personal-setting"></i>
                个性化设置
              </el-dropdown-item>
              <el-dropdown-item @click.native="dialogVisible = true">
                <i class="icon-size el-icon-info"></i>
                关于
              </el-dropdown-item>
              <el-dropdown-item @click.native="logout">
                <i class="p8 icon-logout"></i>
                注销
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
      </ul>
    </div>
    <div class="user">
      <el-dropdown size="small">
        <span class="avatar">{{ userName.slice(-1) }}</span>
        <el-dropdown-menu slot="dropdown">
          <div class="header_userInfo"
               v-if="userInfo.departmentName">
            <span class="title"
                  style="float: left; width: 46px">部门：</span>
            <span class="content"
                  v-if="userInfo.parentDept">{{ userInfo.parentDept }}-</span>
            <span class="content">{{ userInfo.departmentName }}</span>
          </div>
          <div class="header_userInfo">
            <span class="title"
                  style="float: left; width: 46px">角色：</span>
            <div style="float: left; width: 114px">
              <span class="content"
                    v-for="item in userInfo.userRoles"
                    :key="item.roleId">
                {{ item.roleName.trim() }}
                <span style="margin-left: 1px">;</span>
              </span>
            </div>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <common-drawer v-if="visibleProcessDrawer"
                   :visible="visibleProcessDrawer"
                   title="我的审批"
                   class="my_process"
                   @close="visibleProcessDrawer = false"
                   direction="ttb"
                   size="100%">
      <template #drawer>
        <process-approval class="drawer_approval"
                          @approved="approved"></process-approval>
      </template>
    </common-drawer>
    <common-drawer v-if="visibleMsgDrawer"
                   :visible="visibleMsgDrawer"
                   title="我的消息"
                   @close="visibleMsgDrawer = false"
                   direction="ttb"
                   size="100%">
      <template #drawer>
        <message ref="message"></message>
      </template>
    </common-drawer>
    <common-drawer v-if="visibleDownloadDrawer"
                   :visible="visibleDownloadDrawer"
                   title="我的下载"
                   @close="visibleDownloadDrawer = false"
                   direction="ttb"
                   size="100%">
      <template #drawer>
        <DocumentManagement view-type="card"></DocumentManagement>
      </template>
    </common-drawer>
    <el-dialog title="关于"
               v-if="dialogVisible"
               :visible.sync="dialogVisible"
               width="618px"
               :before-close="beforeClose">
      <div class="regards-box">
        <p><span class="regards-font">系统名称:&nbsp;&nbsp;&nbsp;</span><span>{{ systemName }}</span></p>
        <p><span class="regards-font">系统版本:&nbsp;&nbsp;&nbsp;</span><span>{{ regardsObj.systemVersion }}</span></p>
        <p><span class="regards-font">官网地址:&nbsp;&nbsp;&nbsp;</span><el-button type="text"
                     style="font-size: 15px;"
                     @click="openRZ">www.xardmu.com</el-button></p>
        <p><span class="regards-font">授权终止日期:&nbsp;&nbsp;&nbsp;</span><span>{{ regardsObj.authorizedExpires }}</span></p>
        <p><span class="regards-font">特征码:&nbsp;&nbsp;&nbsp;</span><span>{{ regardsObj.cpuSerialCode }}</span></p>
        <p v-for="(el,index) in AuthorizationInfoList"
           :key="index">
          <span class="regards-font">{{el.name}}&nbsp;&nbsp;</span><span>{{el.message}}</span>
        </p>
      </div>
    </el-dialog>
  </header>
</template>

<script>
import { Dropdown, DropdownMenu, DropdownItem, Badge, Tooltip, P8Drawer as CommonDrawer, Notification } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import HeaderShortcut from './HeaderShortcut'
import { getGreetingTime } from '@/utils/common'
// import { PLATFORM_PREFIX_NAME } from '@/config/settings'
import HeaderSubsystem from './HeaderSubsystem'
import ProcessApprovalIndex from '@/views/Communication/MyApprove/list.vue'
import DocumentManagement from '@/views/Framework/System/DocumentManagement/index.vue'
import Message from '@/views/Framework/Message'
import Information from '@/components/information/index.vue'

export default {
  name: 'Headers',
  data () {
    return {
      dayTime: '',
      commonDialog: null,
      // system_name: PLATFORM_PREFIX_NAME,
      visibleProcessDrawer: false,
      visibleMsgDrawer: false,
      visibleDownloadDrawer: false,
      approvalPendingTotal: 0,
      messageNumTotal: 0,
      objColor: {
        themeColor: ''
      },
      informationDrawer: false,
      dialogVisible: false,
      regardsObj: {},
      adminUserIdArr: ['SYS_USER001', 'SYS_USER009', 'SYS_USER012', 'SYS_USER010', 'SYS_USER000'], // 五元id
      AuthorizationInfoList: []
    }
  },
  computed: {
    ...mapGetters(['approvalTotalMsg', 'messageCount', 'token', 'userName', 'avatar', 'headerHeight', 'sidebarState', 'userInfo', 'messageNum', 'systemName', 'theme', 'imageUrl']),
  },
  mounted () {
    const this_ = this
    this_.getAuthorizationInfo()
    this.getSystemAbout()

    this.dayTime = getGreetingTime()
    setInterval(function () {
      this_.approvalTotal()
    }, 60000)
    this_.approvalTotal()
    this_.getMsgTotal()
    this_.approvalMsg()
    this_.noticeMsg()
    this.$store.dispatch('getMessageNum')
  },
  watch: {
    // messageNum (val, oldVal) {
    //   const _this = this
    //   if (val.length) {
    //     val.map((item) => {
    //       if (item.id === '18') {
    //         _this.messageNumTotal = item.noread
    //       }
    //     })
    //   }
    // }
    // theme (val, oldVal) {
    //   let color = this.fromHex(this.theme)
    //   if (this.imageUrl) {
    //     this.$set(this.objColor, 'themeColor', 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + 0.6 + ')')

    //   } else {
    //     this.$set(this.objColor, 'themeColor', this.theme)
    //   }
    // },
    // imageUrl (val, oldVal) {
    //   let color = this.fromHex(this.theme)
    //   this.$set(this.objColor, 'themeColor', 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + 0.6 + ')')
    // }
  },
  methods: {
    getAuthorizationInfo () {
      this.$api['user.getAuthorizationInfo']({}).then(res => {
        this.AuthorizationInfoList = res
      })
    },
    openRZ () {
      window.open('https://www.xardmu.com/')
    },
    beforeClose () {
      this.dialogVisible = false
    },
    getSystemAbout () {
      this.$api['projectTeamSetting.getSystemAbout']().then(res => {
        if (res) {
          this.regardsObj = res
        }
      })
    },
    visibleMsgClose () {
      this.informationDrawer = false
      // this.getMsgTotal()
    },
    approvalTotal () {
      let that = this
      this.$api['PersonalProcessApproval.approvalPendingTotal']().then((res) => {
        that.$store.dispatch('setApprovalMessageCount', res)
      })
    },
    getMsgTotal () {
      this.$api['documentManagement.getWebsocketGroupAll']({ entityName: this.projectName }).then(res => {
        if (res.length > 0) {
          let count = 0
          res.forEach(item => {
            count = count + item.messageCount
          })
          this.unreadMessageCount = count
          this.$store.dispatch('setMessageCount', count)
        }
      })
    },
    approvalMsg () {
      const that = this
      this.$api['PersonalProcessApproval.findMessageInfo']({ id: null }).then((res) => {
        if (res) {
          const msg = '审批消息'
          Notification.success({
            title: msg,
            message: '您有新的' + msg + '！',
            type: 'success',
            position: 'bottom-right',
            onClick () {
              that.visibleProcessDrawer = true
            }
          })
        }
      })
    },
    noticeMsg () {
      const that = this
      this.$api['PersonalProcessApproval.checkNoticeMsg']({ id: null }).then((res) => {
        if (res) {
          const msg = '通知消息'
          Notification.success({
            title: msg,
            message: '您有新的' + msg + '！',
            type: 'success',
            position: 'bottom-right',
            onClick () {
              that.visibleMsgDrawer = true
            }
          })
        }
      })
    },
    approved () {
      this.approvalTotal()
      this.$emit('approved')
    },
    // messageTotal () {
    //   this.$api['userMessage.myMessageTotal']().then(res => {
    //     this.$store.dispatch('setMessageCount', res)
    //   })
    // },
    slideSidebar () {
      this.$store.dispatch('collapseSidebar', !this.sidebarState.isOpen)
    },
    settingPersonal () {
      this.$router.push({ name: 'PersonalSettings' })
    },
    modifyPassword () {
      const that = this
      this.$api['SystemSettings.checkBaseConfig']().then((res) => {
        if (res) {
          that.$router.replace({ path: '/modify-password' })
        } else {
          that.$message({ type: 'error', message: '当前用户信息是从外部系统集成获取,此功能已禁用' })
        }
      })
    },
    logout () {
      this.$confirm('是否要退出系统?', '提醒', {
        lockScroll: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
        .then(() => {
          this.$store.dispatch('userLogout').then(() => {
            location.reload()
          })
        })
        .catch(() => { })
    },
    fromHex (color) {
      const t = {}
      const bits = color.length == 4 ? 4 : 8 // 假设是shorthand。 #fff, 那么bits为4位, 每一位代表的个属性, 其他的为8位 每两位代表一个属性 #ffffff00
      const mask = (1 << bits) - 1 // 表示字节占位符。 向左移4位或8位，var a = (1 << 4 ) - 1 -> 10000 - 1,  a.toString(2); // 1111。或者 8位的 1111 1111
      color = Number('0x' + color.substr(1)) // #ff0000 转变为16进制0xff0000;
      if (isNaN(color)) {
        return null // Color
      }
      ;['b', 'g', 'r'].forEach(function (x) {
        const c = color & mask
        color >>= bits
        t[x] = bits == 4 ? 17 * c : c // 0xfff ， 一个f应该代表 255, 应该当[0-255]，按15等份划分，每一等份间隔 17。
      })
      t.a = 1
      return t // Color
    }
  },
  components: {
    CommonDrawer,
    HeaderShortcut,
    HeaderSubsystem,
    DocumentManagement,
    'process-approval': ProcessApprovalIndex,
    'el-dropdown': Dropdown,
    'el-badge': Badge,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    message: Message,
    'el-tooltip': Tooltip,
    Information
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.header {
  display: flex;
  flex: none;
  height: 50px;
  padding: 0;
  // color: lighten($base-light-color, 100%);
  background: #04224e;
  border-bottom: 1px solid $base-line-color;

  .sysName {
    font-size: $font-size-medium;
    font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
    font-weight: 500;
    color: $base-white-color;
    line-height: 50px;
    letter-spacing: 1px;
    margin: 0 5px 0 10px;
  }

  .center {
    position: relative;
    // padding-left:5px;
    flex: 1;
    display: flex;
  }

  .slide-bar {
    width: 45px;
    height: 100%;
    display: inherit;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1.3rem;
    border-right: 1px solid $base-line-color;
    .slider {
      transition: all 0.3s ease 0s;
      color: $base-dark-color;
      font-size: $font-size-medium;

      &.collapsed {
        transform: rotateZ(90deg);
      }
    }

    // &:hover {
    //   background-color: lighten($base-white-color, 12%);
    // }
  }

  .user {
    display: inherit;
    @include flexCenter();

    span {
      display: inline-block;
      color: $base-white-color;

      &.avatar {
        width: 30px;
        height: 30px;
        margin-right: 34px;
        margin-left: 5px;
        border-radius: 30px;
        background: $base-light-color;
        overflow: hidden;
        cursor: pointer;
        color: $base-white-color;
        line-height: 30px;
        text-align: center;

        > img {
          width: 30px;
          height: 30px;
        }
      }
      // &.name { }
    }
  }

  .settings {
    ul {
      display: flex;
      flex-direction: row;
      height: 100%;

      li {
        font-size: 1rem;
        display: inherit;
        flex: 1 auto;
        padding: 0 6px;
        cursor: pointer;

        span {
          display: inherit;
          @include flexCenter;
          // color:$base-light-color;
          color: $base-dark-color;

          &.name {
            font-size: $font-size-mini;
          }

          > i.el-icon-arrow-down {
            font-size: $font-size-small;
          }

          > i:not(.el-icon-arrow-down) {
            font-size: $font-size-large;
          }
        }

        span:before {
          margin-right: 5px;
        }

        > div {
          display: inherit;
          @include flexCenter;
          font-size: 1rem;
          font-weight: 400;
          color: $base-light-color;
        }

        .itemNum {
          font-size: 20px;
          margin-right: 10px;
        }
      }

      .p8:before {
        margin-right: 5px;
      }
    }
  }
}

// fixes dropmenu icon
.el-dropdown-menu {
  i {
    margin-right: 5px;
  }
}

// 用户部门、角色信息
div.header_userInfo {
  width: 170px;
  line-height: 25px;
  padding: 0 15px;
  color: #606266;
}
::v-deep .el-drawer__body {
  background-color: #fcfcfc;
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
.header {
  // height: pxTorem(70px);
  // margin-bottom: 1px;
  background-color: #fff;
  // border-bottom: pxTorem(1px) solid $base-line-color;

  .sysName {
    line-height: pxTorem(50px);
  }

  .user {
    span {
      $avatarNum: pxTorem(30px);
      &.avatar {
        width: $avatarNum;
        height: $avatarNum;
        border-radius: $avatarNum;
        line-height: $avatarNum;
        font-size: $font-size-small;
        margin-right: pxTorem(34px);
        margin-left: pxTorem(5px);
      }
    }
  }

  .settings {
    ::v-deep .el-badge__content {
      font-size: $font-size-mini;
      height: pxTorem(18px);
      line-height: pxTorem(18px);
      border-radius: pxTorem(10px);
      @include remCalc(padding, 0px, 6px);
    }
  }
}
.regards-box {
  text-align: start;
  padding: 5px 14%;
  line-height: 25px;
}
.regards-font {
  font-weight: bold;
}
.icon-size {
  font-size: 16px;
}
.dialogHeight {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
