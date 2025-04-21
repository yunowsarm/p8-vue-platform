<template>
  <div>
    <el-radio-group v-model="activeName"
                    size="mini"
                    @input="btnClick">
      <el-radio-button type="primary"
                       plain
                       v-for="(item, index) in userRoleBtnList"
                       :label="index"
                       :key="index">{{ item.name }}</el-radio-button>
    </el-radio-group>
    <div :id="chartId"
         style="height: 280px;"></div>
  </div>
</template>

<script>
export default {
  name: 'userTaskRadarChart',
  props: {
    chartId: {
      type: String
    },
    btnType: {
      type: String
    },
    rowData: {
      type: Object
    }
  },
  data () {
    return {
      myChart: null,
      activeName: '',
      userRoleBtnList: [],
      dataList: [],
      indicator: []
    }
  },
  components: {
  },
  computed: {},
  beforeMount () { },
  mounted () {
    this.$nextTick(function () {
      this.initChart()
    })
    window.addEventListener('resize', this.resizeChart)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    btnClick (index) {
      this.activeName = this.userRoleBtnList[index].id
      this.draw(this.indicator[index], [this.dataList[index]])
    },
    initData (btnType) {
      this.$nextTick(function () {
        this.initChart(btnType)
      })
    },
    resizeChart () {
      this.myChart.resize()
    },
    async initChart (btnType) {
      if (this.myChart) {
        this.myChart.dispose()
      }
      var chartDom = document.getElementById(this.chartId)
      this.myChart = this.$echarts.init(chartDom)
      var option
      var params = {
        userId: this.rowData.SYSUSER_ID
      }
      const [err, res] = await this.$to(this.$api['qualifications.getUserGrade'](params))
      if (!err) {
        this.myChart.hideLoading()
        if (res.length === 0 || !res) {
          return this.myChart.setOption({
            title: {
              text: '暂无数据',
              x: 'center',
              y: 'center',
              textStyle: {
                fontSize: 18,
                fontWeight: 'normal'
              }
            }
          }, true)
        }
      }
      this.indicator = []
      this.dataList = []
      this.userRoleBtnList = []
      res.forEach((item, index) => {
        let str = item.roleName + '-' + item.qualificationName
        this.userRoleBtnList.push({
          name: str,
          id: index
        })
        let arr = []
        let indicator2 = []
        item.assumptionList.forEach(el => {
          indicator2.push({
            name: el.qualificationRequirements,
            max: 100
          })
          arr.push(el.score)
        })
        this.dataList.push({
          value: arr,
          name: '分值',
          areaStyle: {
            color: 'rgba(216, 200, 255, 0.7)'
          }
        })
        this.indicator.push(indicator2)
      })
      this.activeName = this.userRoleBtnList[0].id
      this.draw(this.indicator[0], [this.dataList[0]])
    },
    draw (indicator, dataList) {
      var option
      option = {
        tooltip: {
          trigger: 'item'
        },
        radar: {
          indicator: indicator,
          center: ['50%', '50%'],
          radius: 80
        },
        series: [
          {
            type: 'radar',
            data: dataList
          }
        ]
      };
      option && this.myChart.setOption(option, true)
      this.myChart.off('click')
    }
  },
  watch: {
    'btnType': {
      handler (newVal, oleVal) {
        this.initData(newVal)
      },
      deep: true
    },
  }
}

</script>
<style lang='scss' scoped>
</style>
