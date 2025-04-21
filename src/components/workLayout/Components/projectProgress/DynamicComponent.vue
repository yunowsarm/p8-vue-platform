<template>
  <component :is="componentLoader" class="component-wrapper"/>
</template>
<script>
/**
 * Dynamic component loader
 * 动态加载预设组件;
 * 组件开发必须放在 Dashboard/Components/ 目录下
 */
export default {
  name: 'PersonDynamicComponent',
  props: {
    com: {
      type: String,
      required: true
    }
  },
  computed: {
    componentLoader () {
      return () => import(`@/${this.com}.vue`)
    }
  }
}
</script>
<style scoped>
.component-wrapper{
  flex:1 auto;
  width:100%;
  height:100%;
  box-sizing: border-box;
}
</style>
