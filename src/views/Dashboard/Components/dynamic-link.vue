<template>
  <component :is="componentLoader" ref="component" v-bind="$attrs" v-on="$listeners" :key="renderTime" />
</template>
<script>
// import _debounce from 'lodash/debounce'
export default {
  name: 'DynamicLink',
  props: ['data'],
  data() {
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
    componentLoader() {
      if (!this.data.component.url) {
        return
      }
      console.log(this.data.component.url, '----this.data.component.url')
      return () => import(`@/views/${this.data.component.url}.vue`)
    }
  },
  mounted() {},
  beforDestroyed() {},
  methods: {
    reload() {
      this.$nextTick(function () {
        this.renderTime = new Date().getTime()
      })
    }
  }
}
</script>
