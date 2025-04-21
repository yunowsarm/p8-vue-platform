<template>
  <div class="login-wrapper">
    <div class="content">抱歉!系统正在维护中,请联系管理员</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Container, Button } from 'p8-components-ui'
export default {
  name: 'Maintain',
  computed: {
    ...mapGetters(['homepage'])
  },
  methods: {},
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'el-container': Container,
    // eslint-disable-next-line vue/no-unused-components
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

    .gohome {
      margin-top: 15px;
    }
  }
}
.login-wrapper {
  // position: absolute;
  height: 100%;
  width: 100%;
  background-position: center 0;
  background-repeat: no-repeat;
  background-size: cover;
  // transition: opacity .5s ease-in-out;
  background-image: url(../../assets/image/login/bg_ChinaAerospace.png);
  .content {
    /*width: 300px;*/
    height: 50px;
    text-align: center;
    line-height: 50px;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    left: 50%;
    color: white;
    font-size: 2rem;
  }
}
</style>
