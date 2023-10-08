<template>
  <el-container class="custom-cr-layout">
    <el-container>
      <el-main>
        <slot name="left"></slot>
      </el-main>
      <el-footer>
          <slot name="bottom"></slot>
        </el-footer>
    </el-container>
    <el-aside :width="asideWidth">
      <slot name="right"></slot>
    </el-aside>
  </el-container>
</template>
<script>
import { Container, Main, Aside, Footer } from 'p8-components-ui'
export default {
  name: 'LeftRightLayout',
  props: {
    asideWidth: {
      type: String,
      default: '350px'
    }
  },
  components: {
    'el-container': Container,
    'el-main': Main,
    'el-aside': Aside,
    'el-footer': Footer
  }
}
</script>
<style lang="scss">
  .custom-cr-layout.el-container {
    height: 100%;
    .el-main {
      margin: 0 10px 0 5px;
      overflow: hidden;
      height: 100%;
      background: #ffffff;
    }
    .el-footer{
      padding: 0 38px 0px 4px
    }
    .el-aside {
      background-color: #ffffff;
    }
  }

</style>
