<template>
  <el-container class="main">
    <section>
      <img src="@/assets/image/other/404.png" alt="">
      <div class="content">抱歉！访问的页面不存在！</div>
      <el-button type="primary" size="large" class="gohome" @click="backToHome">返回首页</el-button>
    </section>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { Container, Button } from 'p8-components-ui'
export default {
  name: 'Page404',
  computed: {
    ...mapGetters(['homepage'])
  },
  methods: {
    backToHome() {
      this.$router.push({
        path: '/',
        replace: true
      })
    }
  },
  components: {
    'el-container': Container,
    'el-button': Button
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  background: $base-white-color;

  > section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-top: 10%;

    .content {
      font-size: 1.5rem;
    }

    .gohome {
      margin-top: 15px;
    }
  }
}
</style>
