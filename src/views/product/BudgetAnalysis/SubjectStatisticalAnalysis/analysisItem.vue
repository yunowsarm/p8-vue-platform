<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import PlanGantt from '@/views/product/PlanGantt/index.vue'
export default {
  name: 'analysisItem',
  components:{
    CommonDialog,
    PlanGantt
  },
  props: {
    projectId: {
      type: String,
      require: true
    },
    id: {
      type: String,
      require: true
    },
    title: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      budgetData: [],
      actualData: [],
      barData: [],
      plan: {},
      dialogConfig: {
        modal: false
      },
      visible:false,
    }
  },
  watch: {
    id() {
      this.loadAll()
    }
  },
  mounted() {
    this.loadAll()
  },
  methods: {
    handleCancel(){
      this.visible = false
    },
    loadAll() {
      this.getBudgetAndActual()
      this.getBarData()
    },
    getBudgetAndActual() {
      const params = {
        sqlId: 'fff20dd8fb714157e9805abb9fa07937',
        reportParam: {},
        sqlParam: {
          wholeId: {
            mode: '=',
            relation: 'and',
            value: this.projectId
          },
          fsubjectId: {
            mode: '=',
            relation: 'and',
            value: this.id
          }
        },
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      }
      this.$api['kanbanComponent.getViewData'](params).then((res) => {
        if (res) {
          this.budgetData = res.map((item) => {
            return {
              name: item.NAME,
              value: item.AMOUNT || 0
            }
          })
          this.actualData = res.map((item) => {
            return {
              name: item.NAME,
              value: item.ACTUALAMOUNT || 0
            }
          })
          console.log(res, '饼图数据')
          this.$nextTick(() => {
            this.renderBudgetPie()
            this.renderActualPie()
          })
        }
      })
    },
    getBarData() {
      const params = {
        sqlId: 'b358526a1ff13c49f9af39157b8ebbc4',
        reportParam: {},
        sqlParam: {
          wholeId: {
            mode: '=',
            relation: 'and',
            value: this.projectId
          },
          fsubjectId: {
            mode: '=',
            relation: 'and',
            value: this.id
          }
        },
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      }
      this.$api['kanbanComponent.getViewData'](params).then((res) => {
        if (res) {
          console.log(res, '柱状图数据')
          this.barData = res
          this.$nextTick(() => {
            this.renderBarChart()
          })
        }
      })
    },
    renderBudgetPie() {
      const chart = this.$echarts.init(this.$refs.budgetPie)
      console.log(chart, '渲染各项目预算金额分析')
      chart.setOption({
        title: {
          text: '各项目预算金额分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: true,
          bottom: 0
        },
        series: [
          {
            type: 'pie',
            radius: '60%',
            label: {
              show: true
            },
            data: this.budgetData
          }
        ]
      })
    },
    renderActualPie() {
      const chart = this.$echarts.init(this.$refs.actualPie)
      console.log(chart, '渲染各项目实际执行金额分析')
      chart.setOption({
        title: {
          text: '各项目实际执行金额分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: true,
          bottom: 0
        },
        series: [
          {
            type: 'pie',
            radius: '60%',
            data: this.actualData
          }
        ]
      })
    },
    renderBarChart() {
      const chart = this.$echarts.init(this.$refs.barChart)
      console.log(chart, '渲染各项目实际执行金额分析')
      chart.setOption({
        title: {
          text: '按阶段统计预算执行情况',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['预算金额', '实际执行金额'],
          bottom: 0
        },
        xAxis: [
          {
            type: 'category',
            data: this.barData.map((item) => {
              return item.NAME
            })
          }
        ],
        yAxis: {
          type: 'value',
          name: '金额（元）'
        },
        series: [
          {
            name: '预算金额',
            type: 'bar',
            data: this.barData.map((item) => ({
              value: item.AMOUNT || 0,
              plan: item
            }))
          },
          {
            name: '实际执行金额',
            type: 'bar',
            data: this.barData.map((item) => ({
              value: item.ACTUALAMOUNT || 0,
              plan: item
            }))
          }
        ]
      })
      chart.on('click', (params) => {
        console.log(params.data.plan)
        console.log(this.$route.path)
        this.plan = {
          ...params.data.plan,
          route: this.$route.path
        }
        console.log(this.plan)
        this.visible = true
      })
    }
  }
}
</script>

<template>
  <div class="analysis-area">
    <h2 class="title">{{ title }}</h2>
    <div class="charts-row">
      <div ref="budgetPie" class="chart"></div>
      <div ref="actualPie" class="chart"></div>
      <div ref="barChart" class="chart wide"></div>
    </div>
    <common-dialog :title="plan.NAME || ''" width="90%" :dialog-config="dialogConfig" :showHandleBtn="false" :visible="visible" :dialog-height="600" @close="handleCancel">
      <template #dialog>
        <plan-gantt v-if='visible' :thirdMenuParam='plan' :isView='true'></plan-gantt>
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss">
.analysis-area {
  width: 100%;

  .title {
    padding: 10px;
    border-bottom: solid 1px #e6e6e6;
  }

  .charts-row {
    display: flex;

    .chart {
      width: 33%;
      height: 400px;
    }

    .chart.wide {
      width: 100%;
    }
  }
}
::v-deep .el-dialog__body {
  padding: 0 !important;
}
</style>
