<template>
  <div>
    <div class="box">
      <div id="monitorChart"></div>
      <el-divider class="line"
                  direction="vertical"></el-divider>
      <div class="detail_box">
        <div>
          <div class="total_num">{{ totalMonitorNum }}</div>
          <div class="tital_text">任务标识总数</div>
        </div>
        <div class="monitor_list">
          <div class="monitor_item"
               v-for="(item, index) in list"
               :key="index">
            <el-tooltip effect="dark"
                        :content="item.name"
                        placement="top">
              <span :class="item.icon"></span>
            </el-tooltip>
            <span class="text">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <el-divider class="line"
                  direction="vertical"></el-divider>
      <div class="detail_box">
        <div>
          <div class="total_num">{{ totalTypeNum }}</div>
          <div class="tital_text">任务类型总数</div>
        </div>
        <div class="monitor_list">
          <div class="monitor_item"
               v-for="(item, index) in list3"
               :key="index">
            <el-tooltip effect="dark"
                        :content="item.name"
                        placement="top">
              <span :class="item.icon"></span>
            </el-tooltip>
            <span class="text">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'CommandStatistic',
  data () {
    return {
      list: [],
      list2: [],
      list3: [],
      myChart: null,
      initOptionData: {},
      totalNum: 0,
      totalMonitorNum: 0,
      totalTypeNum: 0
    }
  },
  props: {
    projectId: {
      type: String,
      default: ''
    },
    ganttName: {
      type: String,
      default: ''
    }
  },
  watch: {
    projectId (val) {
      this.getDataStatus()
      this.getDataMonitor()
      this.getDataTaskType()
    }
  },
  created () {
    this.getDataStatus()
    this.getDataMonitor()
    this.getDataTaskType()
  },
  methods: {
    getDataStatus () {
      const that = this
      this.$api['planGanttManager.getPlanStatusAllData']({ projectId: this.projectId }).then((res) => {
        if (res) {
          this.totalStatusNum = 0
          this.list2 = res.map((ele) => {
            this.totalNum = ele.totalCount || 0
            this.totalStatusNum += Number(ele.taskCount) || 0
            return {
              icon: ele.icon,
              name: ele.name,
              value: ele.taskCount
            }
          })
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
                  fontSize: '10'
                },
                labelLine: {
                  show: false
                },
                data: this.list2
              }
            ]
          }
          that.initOptionData = option
          that.initMonitorChart()
        }
      })
    },
    initMonitorChart () {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById('monitorChart'))
      // 绘制图表
      this.myChart.setOption(this.initOptionData)
    },
    getDataMonitor () {
      const that = this
      this.$api['planGanttManager.getPlanStatisticAllData']({ projectId: this.projectId }).then((res) => {
        if (res) {
          this.list = res.map((ele) => {
            this.totalMonitorNum = Number(ele.totalCount) || 0
            return {
              icon: ele.icon,
              name: ele.name,
              value: ele.taskCount
            }
          })
        }
      })
    },
    getDataTaskType () {
      const that = this
      this.$api['planGanttManager.getPlanTaskTypeAllData']({ projectId: this.projectId }).then((res) => {
        if (res) {
          this.list3 = res.map((ele) => {
            this.totalTypeNum = Number(ele.totalCount) || 0
            return {
              icon: ele.icon,
              name: ele.name,
              value: ele.taskCount
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  align-items: center;
  height: 110px;
  #monitorChart {
    height: 100%;
    width: 250px;
  }
  #statusChart {
    height: 100%;
    width: 300px;
  }
  #typeChart {
    height: 100%;
    width: 300px;
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
      // display: flex;
      // flex-direction: column;
      // flex-wrap: wrap;
      // justify-content: space-between;
      display: grid;
      grid-auto-flow: column;
      grid-gap: 5px;
      grid-template-rows: 25px 25px;
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
