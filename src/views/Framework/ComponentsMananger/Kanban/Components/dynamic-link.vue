<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <component :is="componentLoader"
             v-bind="$attrs"
             v-on="$listeners"
             :code="componentsConfig.code"
             :record="{ desformCode: componentsConfig.codeForm }"
             :permission-vo="componentsConfig.permissionVo"
             :layout-config="componentsConfig"
             :kanban-config="componentsConfig"
             :key="renderTime" />
</template>
<script>
export default {
  name: 'dynamic-link',
  props: ['data'],
  data () {
    return {
      component: null,
      renderTime: new Date().getTime(),
      componentsConfig: {}
    }
  },
  computed: {
    /**
   * Dynamic component loader
   * 动态加载预设组件;
   * 组件开发必须放在 Dashboard/Components/ 目录下
   */
    componentLoader () {
      if (this.data.url) {
        if (this.data.url.indexOf('?') !== -1) {
          const list = this.data.url.split('?')
          const url = list[0]
          const parmars = list[1].split('&')
          const obj = {}
          parmars.forEach((item) => {
            const str = item.split('=')
            if (str[0] === 'code') {
              obj.code = str[1]
            }
          })
          this.componentsConfig = obj
          return () => import('@/views/' + url + '.vue')
        } else {
          return () => import(`@/views/${this.data.url}.vue`)
        }
      } else {
        return ''
      }
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
