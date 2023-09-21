<template>
  <div class="layout">
    <headers ref="headers" @approved="approved"></headers>
    <section class="section">
      <quick-menu ref="queikMenu" @my-approval="myApproval"></quick-menu>
      <div class="main-content">
        <notice @message="messageChange"></notice>
        <project-progress></project-progress>
      </div>
    </section>
  </div>
</template>
<script>
import headers from '@/components/layout/Components/header'
import QuickMenu from './Components/QuickMenu'
import notice from './Components/Notice'
import ProjectProgress from './Components/projectProgress'
export default {
  name: 'WorkLayout',
  components: {
    headers,
    QuickMenu,
    notice,
    ProjectProgress
  },
  methods: {
    myApproval () {
      this.$refs.headers.visibleProcessDrawer = true
    },
    messageChange (val) {
      this.$refs.headers.visibleMsgDrawer = true
      let _this = this
      setTimeout(() => {
        _this.$refs.headers.$refs.message.selectNodeId = val
      })
    },
    approved () {
      this.$refs.queikMenu.initData()
    }
  }
}
</script>
<style lang="scss" scoped>
.layout{
  width:100%;
  height:100%;
  background:$base-bg-color;

  .section{
    width: 100%;
    height: 100%;
    display:flex;
  }

  .main-content{
    width:calc(100% - 340px);
    flex:1 auto;
    display: inherit;
    flex-direction: column;
    transition:all .3s ease-in-out 0s;

    .main-wrapper{
      flex:1;
    }
  }
}
</style>
