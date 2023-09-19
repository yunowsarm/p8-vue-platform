<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div :id="id"
       :style="{ width: width, height: height }"></div>
</template>
<script>
export default {
  props: {
    currentComponentProps: {
      type: Object,
      default: () => { }
    },
    echartsId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      myChartDeptment: null,
      height: document.documentElement.clientHeight + 'px',
      width: '100%',
      id: null
    }
  },
  mounted () {
    this.id = this.echartsId
    this.$nextTick(function () {
      this.initChat()
    })
    window.addEventListener('resize', this.resizeChart)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },

  methods: {
    resizeChart () {
      this.myChartDeptment.resize()
    },
    initChat () {
      if (this.id) {
        var chartDom = document.getElementById(this.id)
        this.myChartDeptment = this.$echarts.init(chartDom)
        this.currentComponentProps && this.myChartDeptment.setOption(this.currentComponentProps)
      }
    }
  }
}
</script>

<style></style>
