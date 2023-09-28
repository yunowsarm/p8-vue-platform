<template>
  <div>
    <div class="box">
      <div id="monitorChart"></div>
      <el-divider class="line" direction="vertical"></el-divider>
      <div class="detail_box">
        <div>
          <div class="total_num">{{ totalNum }}</div>
          <div class="tital_text">任务标识总数</div>
        </div>
        <div class="monitor_list">
          <div class="monitor_item" v-for="(item, index) in list" :key="index">
            <span :class="item.icon"></span>
            <span class="text">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="box">
      <div id="statusChart"></div>
      <el-divider class="line" direction="vertical"></el-divider>
      <div class="detail_box">
        <div>
          <div class="total_num">{{ totalStatusNum }}</div>
          <div class="tital_text">任务状态总数</div>
        </div>
        <div class="monitor_list">
          <div class="monitor_item" v-for="(item, index) in list2" :key="index">
            <span :class="item.icon"></span>
            <span class="text">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="box">
      <div id="typeChart"></div>
      <el-divider class="line" direction="vertical"></el-divider>
      <div class="detail_box">
        <div>
          <div class="total_num">{{ totalTypeNum }}</div>
          <div class="tital_text">任务状态总数</div>
        </div>
        <div class="monitor_list">
          <div class="monitor_item" v-for="(item, index) in list3" :key="index">
            <span :class="item.icon"></span>
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
  data() {
    return {
      list: [],
      list2: [],
      list3: [],
      myChart: null,
      myChart2: null,
      myChart3: null,
      initOptionData: {},
      initOptionData2: {},
      initOptionData3: {},
      totalNum: 0,
      totalStatusNum: 0,
      totalTypeNum: 0
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
    this.getDataMonitor()
    this.getDataStatus()
    this.getDataTaskType()
  },
  methods: {
    getDataMonitor() {
      const that = this
      this.totalNum = 0
      this.$api['planGanttManager.getPlanStatisticData']({ planInfoId: this.planInfoId }).then((res) => {
        if (res) {
          this.list = res.map((ele) => {
            this.totalNum = ele.totalCount || 0
            return {
              icon: ele.icon,
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
        that.initMonitorChart()
      })
    },
    initMonitorChart() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById('monitorChart'))
      // 绘制图表
      this.myChart.setOption(this.initOptionData)
    },
    getDataStatus() {
      const that = this
      this.$api['planGanttManager.getPlanStatusData']({ planInfoId: this.planInfoId }).then((res) => {
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
              data: this.list2
            }
          ]
        }
        that.initOptionData2 = option
        that.initStatusChart()
      })
    },
    initStatusChart() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart2 = echarts.init(document.getElementById('statusChart'))
      // 绘制图表
      this.myChart2.setOption(this.initOptionData2)
    },
    getDataTaskType() {
      const that = this
      this.$api['planGanttManager.getPlanTaskTypeData']({ planInfoId: this.planInfoId }).then((res) => {
        if (res) {
          this.totalTypeNum = 0
          this.list3 = res.map((ele) => {
            this.totalNum = ele.totalCount || 0
            this.totalTypeNum += Number(ele.taskCount) || 0
            return {
              icon: ele.icon,
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
              data: this.list3
            }
          ]
        }
        that.initOptionData3 = option
        that.initTaskTypeChart()
      })
    },
    initTaskTypeChart() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart3 = echarts.init(document.getElementById('typeChart'))
      // 绘制图表
      this.myChart3.setOption(this.initOptionData3)
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  align-items: center;
  height: 140px;
  #monitorChart {
    height: 100%;
    width: 300px;
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
