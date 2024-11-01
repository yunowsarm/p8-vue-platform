<template>
  <div>
    <div :id="chartId"
         style="height: 280px;"></div>
    <common-drawer v-if="visibleDrawerOther"
                   :title="drawerTitle"
                   :visible="visibleDrawerOther"
                   placement="top"
                   direction="ttb"
                   size="100%"
                   @close="onEditResourcesCloseOther">
      <template #drawer>
        <userTaskPieChartTable :status="status"
                               :chartData="chartData"></userTaskPieChartTable>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
import userTaskPieChartTable from './userTaskPieChartTable'
export default {
  name: 'userTaskPieChart',
  props: {
    chartId: {
      type: String
    },
    type: {
      type: String
    },
    rowData: {
      type: Object
    }
  },
  data () {
    return {
      myChart: null,
      visibleDrawer: false,
      visibleDrawerOther: false,
      drawerTitle: '查看',
      status: '',
      chartData: {}
    }
  },
  components: {
    CommonDrawer,
    userTaskPieChartTable
  },
  computed: {},
  beforeMount () { },
  mounted () {
    this.$nextTick(function () {
      this.initChart()
    })
    window.addEventListener('resize', this.resizeChart)
    this.params = {
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    initData (data) {
      this.$nextTick(function () {
        this.initChart(data)
      })
    },
    onEditResourcesClose () {
      this.visibleDrawer = false
    },
    onEditResourcesCloseOther () {
      this.visibleDrawerOther = false
    },
    resizeChart () {
      this.myChart.resize()
    },
    async initChart (data) {
      if (this.myChart) {
        this.myChart.dispose()
      }
      var chartDom = document.getElementById(this.chartId)
      this.myChart = this.$echarts.init(chartDom)
      var option
      var params = {
        // planEndArr: this.searchFormDashboar.endDate,
        // type: 'KY',
        // planEndMonth: data && data !== '' ? data : ''
        userId: this.rowData.SYSUSER_ID
      }
      let datas = []
      if (this.type == 'projectCategory') {
        const [err, res] = await this.$to(this.$api['qualifications.historyTaskByProjectType'](params))
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
        datas = res.map(item => {
          return {
            name: item.projectTypeName,
            value: item.percentage,
            projectTypeId: item.projectTypeId,
          }
        })
      }
      if (this.type == 'TaskCategory') {
        const [err, res] = await this.$to(this.$api['qualifications.historyTaskByPlanType'](params))
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
        datas = res.map(item => {
          return {
            name: item.planTypeName,
            value: item.percentage,
            planTypeId: item.planTypeId,
          }
        })
        this.chartData.planTypeId = res[0].planTypeId
      }
      if (this.type == 'taskId') {
        const [err, res] = await this.$to(this.$api['qualifications.historyTaskByMonitorPoint'](params))
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
        datas = res.map(item => {
          return {
            name: item.name,
            value: item.percentage,
            monitorPointId: item.monitorPointId
          }
        })
      }
      option = {
        series: [
          {
            // name: 'Access From',
            type: 'pie',
            radius: '50%',
            data: datas,
            label: {
              formatter: '{b}: {c} %'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      option && this.myChart.setOption(option, true)
      this.myChart.off('click')
      this.myChart.on('click', (par) => {
        console.log(par, 'parparparparpar');
        this.status = par.name
        if (this.type == 'projectCategory') {
          this.chartData = {
            userId: this.rowData.SYSUSER_ID,
            projectTypeId: par.data.projectTypeId
          }
        }
        if (this.type == 'TaskCategory') {
          this.chartData = {
            userId: this.rowData.SYSUSER_ID,
            planTypeId: par.data.planTypeId
          }
        }
        if (this.type == 'taskId') {
          this.chartData = {
            userId: this.rowData.SYSUSER_ID,
            monitorPointId: par.data.monitorPointId
          }
        }
        this.visibleDrawerOther = true
      })
    }
  },
  watch: {
    'rightM': {
      handler (newVal, oleVal) {
        this.initData(newVal)
      },
      deep: true
    },
  }
}

</script>
<style lang='scss' scoped>
// /deep/ .el-drawer__body {
//   height: calc(48% - 100px);
// }
// /deep/ .el-drawer__body .common-table .small-table {
//   height: calc(48% - 200px) !important;
// }
</style>
