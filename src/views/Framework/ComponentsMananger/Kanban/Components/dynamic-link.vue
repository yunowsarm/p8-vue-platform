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
