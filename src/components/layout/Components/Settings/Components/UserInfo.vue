<template>
  <div class="user-info">
    <div class="tips">
      <div class="vertical_line"></div>
      用户基本信息
    </div>
    <el-form class="form_list" label-width="100px">
      <el-form-item label="用户名: ">
        {{ userAccount }}
      </el-form-item>
      <el-form-item label="用户昵称: ">
        {{ userName }}
      </el-form-item>
      <el-form-item label="所属角色: ">
        {{ userRoles }}
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { Form, FormItem } from 'p8-components-ui'
import { mapGetters } from 'vuex'
export default {
  name: 'UserInfo',
  computed: {
    ...mapGetters(['userAccount', 'userName']),
    userRoles() {
      const roles = this.$store.getters.roles
      const roleNames = roles.map((r) => r.roleName)
      return roleNames ? roleNames.join(', ') : ''
    }
  },
  components: {
    'el-form': Form,
    'el-form-item': FormItem
  }
}
</script>
<style lang="scss" scoped>
.tips {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin: 8px 8px 8px 26px;
}
.vertical_line {
  margin-right: 8px;
  width: 3px;
  height: 16px;
  background: $theme-color;
}
.form_list {
  margin-left: 40px;
}
</style>
