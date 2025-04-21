<template>
  <el-container class="main">
    <section>
      <div class="content">抱歉!您访问的页面权限不够.请返回.</div>
      <el-button type="primary" class="gohome" @click="backToHome">回首页 :P</el-button>
    </section>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { Container, Button } from 'p8-components-ui'
export default {
  name: 'Page401',
  computed: {
    ...mapGetters(['homepage'])
  },
  methods: {
    backToHome() {
      this.$router.push({
        name: this.homepage.name,
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
  display: flex;
  @include flexCenter;

  > section {
    display: inherit;
    @include flexCenter;
    flex-direction: column;
    width: 400px;
    height: 200px;
    margin-top: 15%;
    background-color: darken($base-light-color, 2%);
    border-radius: 15px;

    .content {
      font-size: 1.7rem;
    }

    .gohome {
      margin-top: 15px;
    }
  }
}
</style>
