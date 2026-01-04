<script>
import appMain from './main'
import { mapGetters } from 'vuex'
export default {
  name: 'MobileLayout',
  components: {
    appMain
  },
  data () {
    return {
      tabs: [
        { title: '主页', path: '/home', icon: 'el-icon-house', badge: '' },
        { title: '消息', path: '/message', icon: 'el-icon-message', badge: '' },
        { title: '审批', path: '/approval', icon: 'el-icon-brush', badge: '' },
        { title: '我的', path: '/mine', icon: 'el-icon-user', badge: '' }
      ]
    }
  },
  computed: {
    ...mapGetters(['messageNum', 'approvalTotalMsg']),
    showBackButton () {
      const currentPath = this.$route.path
      return !this.tabs.some(tab => tab.path === currentPath)
    }
  },
  created () {
    this.$store.dispatch('getMessageNum')
    this.approvalTotal()
  },
  watch: {
    $route () {
      this.$store.dispatch('getMessageNum')
      this.approvalTotal()
    },
    messageNum: {
      handler (val) {
        this.tabs[1].badge = val
      },
      immediate: true
    },
    approvalTotalMsg: {
      handler (val) {
        this.tabs[2].badge = val
      },
      immediate: true
    }
  },
  methods: {
    approvalTotal () {
      this.$api['PersonalProcessApproval.approvalPendingTotal']().then((res) => {
        this.$store.dispatch('setApprovalMessageCount', res)
      })
    },
    goBack () {
      this.$router.go(-1)
    },
    go (path) {
      this.$router.replace(path)
    }
  }
}
</script>

<template>
  <div class="mobile-layout">
    <div class="mobile-header">
      <div v-show="showBackButton"
           class="header-left top-text"
           @click="goBack">
        <i class="el-icon-arrow-left"></i>
      </div>
      <div class="header-title top-text">{{ $route.meta.title || '默认标题' }}</div>
      <!--      <div class="header-right"></div>-->
    </div>
    <app-main class="app-main"></app-main>
    <div class="tab-bar">
      <div v-for="item in tabs"
           :key="item.path"
           class="tab-item"
           :class="{ active: $route.path === item.path }"
           @click="go(item.path)">
        <el-badge :value="item.badge"
                  :hidden="!item.badge || item.badge <= 0">
          <div class="icon-box">
            <i class="tab-icon"
               :class="item.icon"></i>
          </div>
        </el-badge>
        <span>{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .mobile-header {
    position: relative;
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    .top-text {
      margin-top: 15px;
    }
    .header-left {
      position: absolute;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
    }

    .header-right {
      width: 30px;
    }
  }

  .app-main {
    flex: 1;
    //overflow: auto;
  }
  .tab-bar {
    height: 55px;
    display: flex;
    justify-content: space-around;
    background: #f7f9fd;
    border-top: 1px solid #eee;
    z-index: 999;
  }
  .tab-item {
    height: 100%;
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .icon-box {
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      .tab-icon {
        font-size: 24px;
      }
    }
  }
  .tab-item.active {
    color: #409eff;
  }
}
::v-deep .main-router {
  height: 100% !important;
}
</style>
