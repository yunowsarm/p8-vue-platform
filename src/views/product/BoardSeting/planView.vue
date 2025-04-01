<template>
  <div>
    <div :id="chartId"
         class="chart-container"
         ref="chartContainer"></div>
    <common-dialog v-if="visibleDrawerOther"
                   :title="drawerTitle"
                   :visible="visibleDrawerOther"
                   :dialog-config="dialogConfig"
                   :show-handle-btn="false"
                   :dialog-height="dialogHeight"
                   :width="dialogWidth"
                   @isfullscreen="isfullscreen"
                   @close="onEditResourcesCloseOther">
      <template #dialog>
        <taskList :layout-config="layoutConfig"
                  :isThisMonthTask="isThisMonthTask"
                  :status="status"></taskList>
      </template>
    </common-dialog>
  </div>
</template>

<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
// import taskList from './taskList.vue'
import taskList from '@/views/product/My/Work/Task/index.vue'
export default {
  name: 'userTaskPieChart',
  props: {
    type: {
      type: String
    },
    rowData: {
      type: Object
    }
  },
  data () {
    return {
      layoutConfig: {
        layoutCode: 'MyTask',
        layoutVersion: 'latest'
      },
      dateTime: '',
      dialogConfig: {
        modal: true
      },
      dialogWidth: '80%',
      dialogHeight: 720,
      myChart: null,
      visibleDrawer: false,
      visibleDrawerOther: false,
      drawerTitle: '我的任务',
      status: [],
      chartData: {},
      chartId: new Date().getTime() + '1'
    }
  },
  components: {
    CommonDialog,
    taskList
  },
  computed: {},
  beforeMount () { },
  mounted () {
    const observer = new ResizeObserver(() => {
      this.myChart && this.myChart.resize();
    });
    observer.observe(this.$refs.chartContainer);
    this.$nextTick(function () {
      this.initChart()
      window.addEventListener('resize', this.resizeChart)
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
    // 记得销毁观察器
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    isfullscreen (isfullscreen) {

    },
    initData (data) {
      this.$nextTick(function () {
        this.initChart(data)
        this.myChart = this.$echarts.init(this.$refs.chartContainer)
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
    handleOk () {

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
        // userId: this.rowData.SYSUSER_ID
        sqlId: 'c7b7eb84a961daa4202accf33b13a91d'
      }
      let datas = []

      const [err, res] = await this.$to(this.$api['kanbanComponent.getViewData'](params))
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
      let TASKDONERATE = 0
      datas = res.map(item => {
        if (item.ROW_ID === '已完成') {
          TASKDONERATE = Math.round(item.TASKDONERATE * 100) + '%'
        }
        return {
          name: item.ROW_ID,
          value: item.TASKDONECOUNT
        }
      })
      option = {
        tooltip: {
          trigger: 'item'
        },
        title: {
          text: '我的计划完成率',
          left: 'center'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          bottom: '10'
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: TASKDONERATE, // 中间显示的内容
              fontSize: 20,
              fontWeight: 'bold'
            },
            labelLine: {
              show: false
            },
            data: datas
          }
        ]
      };

      this.myChart.setOption(option, true)
      this.myChart.off('click')
      this.myChart.on('click', (par) => {
        if (par.name === '未完成') {
          this.status = ['6050', '6020']
          this.isThisMonthTask = '3'
        } else {
          this.status = ['6070']
          this.isThisMonthTask = '2'
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
.chart-container {
  width: 100%;
  min-height: 250px; /* 设置最小高度 */
}
::v-deep .el-dialog__body {
  padding: 0 !important;
}
</style>
