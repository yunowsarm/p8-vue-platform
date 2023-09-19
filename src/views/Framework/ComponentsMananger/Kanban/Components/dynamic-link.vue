<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <component :is="componentLoader"
             v-bind="$attrs"
             v-on="$listeners"
             :key="renderTime" />
</template>
<script>
export default {
  name: 'dynamic-link',
  props: ['data'],
  data () {
    return {
      component: null,
      renderTime: new Date().getTime()
    }
  },
  computed: {
    /**
   * Dynamic component loader
   * 动态加载预设组件;
   * 组件开发必须放在 Dashboard/Components/ 目录下
   */
    componentLoader () {
      if (!this.data.url) {
        return
      }
      return () => import(`@/views/${this.data.url}.vue`)
    }
  },
  mounted () { },
  methods: {
    reload () {
      this.$nextTick(function () {
        this.renderTime = new Date().getTime()
      })
    }
  }
}
</script>
