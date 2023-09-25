<template>
  <!-- <div> -->
  <div class="login_home">
    <header class="header"
            :style="{'border-color': objColor.themeColor }"
            :height="headerHeight">
      <div class="border-name">
        <span class="sysName">{{ systemName }}</span>
      </div>
      <div style="display: flex">
        <div class="settings">
          <ul>
            <!-- $route.path !== '/dash' && -->
            <li v-show="adminUserIdArr.indexOf($store.state.user.userId) === -1">
              <span @click="visibleMsgDrawer = true">
                <el-badge v-if="messageNumTotal > 0"
                          :value="messageNumTotal"
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
                <el-badge v-if="approvalPendingTotal > 0"
                          :value="approvalPendingTotal"
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
                <span class="title">部门：</span>
                <span class="content"
                      v-if="userInfo.parentDept">{{ userInfo.parentDept }}-</span>
                <span class="content">{{ userInfo.departmentName }}</span>
              </div>
              <div class="header_userInfo">
                <span class="title"
                      style="float: left; width: 36px">角色：</span>
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
      </div>
    </header>
    <div class="home_content">
      <div class="my_work"
           :style="{'border-color': objColor.themeColor, 'box-shadow': '2px 0px 8px ' + objColor.themeColor }">
        <div class="my_work_item"
             v-for="item in shortcutMenuData"
             :key="item.id">
          <div class="item_title"
               :style="{ 'background-color': objColor.themeColor }">{{item.name}}</div>
          <div class="item_custom">
            <div v-for="child in item.children"
                 :key="child.id"
                 @click="jumpTo(child.id)">
              <i style="font-size: 26px"
                 :class="child.icon"></i>
              <span style="margin: 6px 0;">{{child.name}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="component_custom"></div>
    </div>
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
    <common-drawer v-if="visibleProcessDrawer"
                   :visible="visibleProcessDrawer"
                   title="我的审批"
                   @close="visibleProcessDrawer = false"
                   direction="ttb"
                   size="100%">
      <template #drawer>
        <process-approval @approved="approved"></process-approval>
      </template>
    </common-drawer>
  </div>
</template>
<style rel="stylesheet/scss" lang="scss" scoped>
.header {
  display: flex;
  flex: none;
  height: 50px;
  padding: 0;
  // color: lighten($base-light-color, 100%);
  background: #04224e;
  justify-content: space-between;
  border-bottom: 1px solid $base-line-color;

  .sysName {
    font-size: $font-size-medium;
    font-family: Source Han Sans CN;
    font-weight: bolder;
    color: $base-dark-color;
    line-height: 50px;
    letter-spacing: 1px;
    margin: 0 5px 0 10px;
  }

  .center {
    position: relative;
    // padding-left:5px;
    flex: 1;
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
  width: 150px;
  line-height: 25px;
  padding: 0 15px;
  color: #606266;
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
.login_home {
  width: 100%;
  height: 100%;
  .home_content {
    width: 100%;
    height: calc(100% - 51px);
    .my_work {
      width: 20%;
      background: #fafafa;
      border-right: 1px solid;
      height: 100%;
      .my_work_item {
        .item_title {
          color: white;
          text-align: center;
          padding: 15px;
        }
        .item_custom {
          display: flex;
          cursor: pointer;
          flex-wrap: wrap;
          & > div {
            width: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            box-sizing: border-box;
          }
        }
      }
    }
  }
  .component_custom {
  }
  .header {
    // height: pxTorem(70px);
    // margin-bottom: 1px;
    background-color: #fff;
    border-bottom: pxTorem(1px) solid;

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
}
</style>
<script>
import { mapGetters } from 'vuex'
import Message from '@/views/Framework/Message'
import { getGreetingTime } from '@/utils/common'
import ProcessApprovalIndex from '@/views/Communication/MyApprove/list.vue'
import { Dropdown, DropdownMenu, DropdownItem, Badge, Tooltip, P8Drawer as CommonDrawer, P8ListLayout as ListLayout, Notification } from 'p8-components-ui'
export default {
  name: 'MyExperienceBase',
  components: {
    ListLayout,
    CommonDrawer,
    message: Message,
    'el-badge': Badge,
    'el-tooltip': Tooltip,
    'el-dropdown': Dropdown,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    'process-approval': ProcessApprovalIndex
  },
  props: {},
  data () {
    return {
      dayTime: '',
      shortcutMenuData: [
        {
          name: '我的工作',
          id: '1',
          children: [
            {
              name: '我的工作',
              id: 'myWork',
              icon: 'icon-xitongguanli p8'
            },
            {
              name: '我的审批',
              id: 'myApprove',
              icon: 'icon-shenpineirong p8'
            }
          ]
        },
        {
          name: '快捷入口',
          id: '2',
          children: [
            {
              name: '国铁项目',
              id: 'nationalRailwayProject',
              icon: 'icon p8 icon-train1'
            },
            {
              name: '捷力项目',
              id: 'jieliProject',
              icon: 'icon-xiangmuguanli p8'
            }
          ]
        }
      ],
      visibleMsgDrawer: false,
      visibleProcessDrawer: false,
      messageNumTotal: 0,
      approvalPendingTotal: 0,
      adminUserIdArr: ['SYS_USER001', 'SYS_USER009', 'SYS_USER012', 'SYS_USER010', 'SYS_USER000'],
      objColor: {
        themeColor: ''
      }
    }
  },
  created () {
  },
  watch: {
    messageNum (val, oldVal) {
      const _this = this
      if (val.length) {
        val.map((item) => {
          if (item.id === '18') {
            _this.messageNumTotal = item.noread
          }
        })
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'userName', 'avatar', 'headerHeight', 'sidebarState', 'userInfo', 'messageNum', 'systemName', 'theme'])
  },
  mounted () {
    console.log('mounted');
    this.dayTime = getGreetingTime()
    let this_ = this
    this_.approvalTotal()
    this_.noticeMsg()
    this_.approvalMsg()
    this.$store.dispatch('getMessageNum')
    setInterval(function () {
      this_.approvalTotal()
      // this_.approvalMsg()
      this_.noticeMsg()
    }, 60000)
    setInterval(function () {
      this_.$store.dispatch('getMessageNum') // 获取消息信息已读未读条数
    }, 60000)
    this.getColor()
  },
  methods: {
    getColor () {
      this.$set(this.objColor, 'themeColor', this.theme)
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
    jumpTo (id) {
      if (id === 'myWork') {
        this.$router.push('/MyTask')
      } else if (id === 'myApprove') {
        this.visibleProcessDrawer = true
      } else if (id === 'nationalRailwayProject') {
        this.$router.push('/dash')
      } else if (id === 'jieliProject') {
        this.$router.push('/dash')
      }
    },
    approvalTotal () {
      this.$api['PersonalProcessApproval.approvalPendingTotal']().then((res) => {
        this.approvalPendingTotal = res
      })
    },
    approved () {
      this.approvalTotal()
      this.$emit('approved')
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
  }
}
</script>
