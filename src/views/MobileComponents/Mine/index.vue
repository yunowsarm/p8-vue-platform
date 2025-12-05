<template>
  <div class="my-page">
    <!-- 顶部个人信息 -->
    <div class="user-header">
      <div class="avatar">{{ userName.slice(-1) }}</div>
      <div class="info">
        <div class="name">{{ userName }}</div>
        <div class="dept">{{ userInfo.parentDept }} - {{ userInfo.departmentName }}</div>
      </div>
    </div>

    <!-- 分组：系统操作 -->
    <div class="menu-list">
      <cell title="切换服务" icon="el-icon-s-operation" @click="switchServer" />
      <cell title="修改密码" icon="el-icon-lock" @click="changePassword" />
      <cell title="关于系统" icon="el-icon-info" @click="openAbout" />

      <div class="split"></div>

      <cell title="退出登录" icon="p8 icon-logout" @click="logout" is-danger />
    </div>
    <common-drawer v-if="modifyPasswordVisible" :visible="modifyPasswordVisible" title="" @close="modifyPasswordVisible = false" direction="ttb" size="100%">
      <template #drawer>
        <modifyPassWord @close="modifyPasswordVisible = false"></modifyPassWord>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import cell from './components/Cell.vue'
import { getSession } from '@/service/expands/session'
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
import modifyPassWord from '@/components/layout/Components/ModifyPassword/index'

export default {
  components: { cell, CommonDrawer, modifyPassWord },
  data() {
    return {
      modifyPasswordVisible: false
    }
  },
  computed: {
    userName() {
      return this.$store.getters.userName
    },
    userInfo() {
      return this.$store.getters.userInfo
    }
  },
  methods: {
    switchServer() {
      if (window.plus) {
        plus.storage.removeItem('current_app_service')
        const w = plus.webview.create('_www/config.html', 'config')
        w.show()
      }
    },
    changePassword() {
      const that = this
      this.$api['SystemSettings.checkBaseConfig']().then((res) => {
        if (res) {
          // that.$router.replace({ path: '/modify-password' })
          that.modifyPasswordVisible = true
        } else {
          that.$message({ type: 'error', message: '当前用户信息是从外部系统集成获取,此功能已禁用' })
        }
      })
    },
    openAbout() {
      this.$router.push('/about')
    },
    logout() {
      this.$confirm('是否要退出系统?', '提醒', {
        lockScroll: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
        .then(() => {
          this.$store.dispatch('userLogout').then(() => {
            // location.reload()
            if (getSession('SET_LOGIN_NEW') === 'loginNew') {
              this.$router.replace({ path: '/loginNew' })
            } else {
              this.$router.replace({ path: '/login' })
            }
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.my-page {
  background: #f6f7f9;
}

.user-header {
  display: flex;
  padding: 20px;
  background: white;
}

.avatar {
  width: 60px;
  height: 60px;
  background: #409eff;
  border-radius: 50%;
  color: white;
  font-size: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info {
  margin-left: 15px;
}

.name {
  font-size: 18px;
  font-weight: 600;
}

.dept {
  color: #999;
  margin-top: 6px;
}

.split {
  height: 12px;
  background: #f6f7f9;
}
</style>
