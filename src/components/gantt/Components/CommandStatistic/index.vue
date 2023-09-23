<template>
  <div class="box">
    <div id="ganttChart"></div>
    <el-divider class="line" direction="vertical"></el-divider>
    <div class="detail_box">
      <div>
        <div class="total_num">{{ totalNum }}</div>
        <div class="tital_text">任务标识总数</div>
      </div>
      <div class="monitor_list">
        <div class="monitor_item" v-for="(item, index) in list" :key="index">
          <span class="p8 icon-copy"></span>
          <span class="text">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'CommandStatistic',
  data() {
    return {
      list: [],
      myChart: null,
      initOptionData: {}
    }
  },
  props: {
    planInfoId: {
      type: String,
      default: ''
    },
    ganttName: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      const that = this
      this.totalNum = 0
      this.$api['planGanttManager.getPlanStatisticData']({ planInfoId: this.planInfoId }).then((res) => {
        console.log('🚀 ~ file: index.vue:25 ~ getData ~ res:', res)
        if (res) {
          this.list = res.map((ele) => {
            this.totalNum += ele.taskCount || 0
            return {
              name: ele.name,
              value: ele.taskCount
            }
          })
        }
        const option = {
          tooltip: {
            trigger: 'item'
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 20,
            top: 20,
            bottom: 20,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            formatter: function (name) {
              return name
            }
          },
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['30%', '50%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                position: 'center',
                formatter: `${this.totalNum}\n任务总数`,
                fontSize: '13'
              },
              labelLine: {
                show: false
              },
              data: this.list
            }
          ]
        }
        that.initOptionData = option
        that.initChart()
      })
    },
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById('ganttChart'))
      // 绘制图表
      this.myChart.setOption(this.initOptionData)
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  align-items: center;
  height: 140px;
  #ganttChart {
    height: 100%;
    width: 240px;
  }
  .line {
    margin: 0 16px;
    height: 70%;
  }
  .detail_box {
    display: flex;
    align-items: center;
    height: 100%;
    text-align: center;
    .total_num {
      margin-bottom: 4px;
      font-size: 26px;
    }
    .tital_text {
      margin-top: 4px;
      font-size: 16px;
    }
    .monitor_list {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      justify-content: space-between;
      height: 56px;
    }
    .monitor_item {
      margin-left: 8px;
      height: 20px;
      color: #6c9aff;
      .text {
        margin-left: 6px;
      }
    }
  }
}
</style>
