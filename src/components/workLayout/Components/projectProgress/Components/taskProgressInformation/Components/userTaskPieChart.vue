<template>
  <div id="myTaskChart" :style="{ height: tableCustomHeight }"></div>
</template>
<script>
import * as ECharts from 'echarts'
export default {
  name: 'UserTaskPieChart',
  props: {
    queryParam: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    queryParam: {
      handler(val) {
        this.initData()
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      tableCustomHeight: '',
      chartApi: 'commonP8Task.loadPlanChartData',
      initOptionData: {},
      myChart: {}
    }
  },
  created() {
    const dh = document.documentElement.clientHeight
    this.tableCustomHeight = dh - 340 + 'px'
  },
  mounted() {
    const that = this
    window.addEventListener('resize', () => {
      if (that.myChart && Object.keys(that.myChart).length > 0) {
        that.myChart.resize()
      }
    })
    that.$nextTick(function () {
      that.initData()
    })
  },
  methods: {
    drawLine() {
      const that = this
      // 基于准备好的dom，初始化echarts实例
      this.myChart = ECharts.init(document.getElementById('myTaskChart'))
      // 解决重复点击问题
      this.myChart.off('click')
      // 绘制图表
      this.myChart.setOption(this.initOptionData)
      // 饼图点击事件
      this.myChart.on('click', (data) => {
        that.$emit('pie-search', data.data.status)
      })
    },
    initData() {
      const that = this
      that.$api[that.chartApi](that.queryParam)
        .then((res) => {
          if (res && res[0]) {
            const taskFinishCount = res[0].taskFinishCount
            const taskUnStartCount = res[0].taskUnStartCount
            const taskStartCount = res[0].taskStartCount
            const series = [
              { value: taskUnStartCount, name: '未开始', status: '6020' },
              { value: taskStartCount, name: '进行中', status: '6050' },
              { value: taskFinishCount, name: '已完成', status: '6070' }
            ]

            const option = {
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
              },
              color: ['#C1C1C1', '#0AD1BD', '#0070C5'],
              legend: {
                orient: 'horizontal',
                bottom: 10,
                data: ['未开始', '进行中', '已完成']
              },
              series: [
                {
                  name: '完成情况',
                  type: 'pie',
                  legendHoverLink: true, // hover 时的联动高亮。
                  radius: ['27%', '40%'],
                  label: {
                    formatter: '{b|{b}: }{c} ({d}%)',
                    padding: [0, 7],
                    rich: {
                      a: {
                        color: '#999',
                        lineHeight: 22,
                        align: 'center'
                      },
                      b: {
                        lineHeight: 33
                      }
                    }
                  },
                  data: series
                }
              ]
            }
            that.initOptionData = option
          }
          that.drawLine()
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}
</script>
