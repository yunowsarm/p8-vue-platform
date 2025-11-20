<template>
  <div class="plan-progress">
    <div class="progress-item"
         v-for="(item, index) in data"
         :key="index">
      <div style="display: flex;margin-right: 20px;">
        <div class="title">{{ item.title }}</div>
        <div style="margin-top: 15px;">
          <el-tooltip effect="dark"
                      popper-class="testtooltip"
                      placement="top">
            <div slot="content">
              <p>计划进度情况：分为基线和预计两部分，两部分形成对比。</p>
              <p>基线：计划发布后要存储基线版本，此处是使用该版本中一级计划节点进行展示的，下方为时间轴，标注一级计划任务名称及完成时间。</p>
              <p>预估：以当前计划任务数据展示图形，具体逻辑为：数据展示一级节点计划及其名称，已完成的节点预估时间使用实际完成时间标注，其他状态节点预估时间计算方法为：max（前置任务预估完成时间，当前时间）+（1-完成进度百分比）* 工期。</p>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="timeline-wrapper"
           ref="timelineWrapper">
        <div class="timeline">
          <div class="timeline-item"
               v-for="(timelineItem, timelineIndex) in item.list"
               :key="timelineIndex">
            <div class="timeline-item-tail"
                 v-if="timelineIndex !== item.list.length - 1"
                 :style="{ backgroundColor: timelineItem.status === '6070' ? '#1a73e8' : '#90caf9' }"></div>
            <div class="progress-line"
                 v-if="timelineIndex !== item.list.length - 1 && timelineItem.status === '6050'"
                 :style="{ width: `${timelineItem.progress * 100}%`, backgroundColor: '#1a73e8' }"></div>
            <div class="timeline-item-node"
                 :style="{ backgroundColor: timelineItem.status === 'completed' || timelineItem.status !== '6020' ? '#1a73e8' : '#90caf9' }"></div>
            <div class="timeline-item-content">
              <div class="timeline-item-name"
                   :title="timelineItem.name">
                {{ timelineItem.name }}
              </div>
              <div class="timeline-item-date">
                {{ timelineItem.endDate }}
              </div>
            </div>
          </div>
        </div>
        <div class="timeline-container">

          <!-- 任务行 - 预估 -->
          <div v-if="item.title === '预估'"
               class="timeline-rows">
            <div style="height:100%;">
              <div v-for="(task, index) in estimateTasks"
                   :key="'estimate-' + index"
                   class="timeline-row">
                <div class="task-bar-container">
                  <div v-if="index / 2 !== 1 && index !== 0"
                       class="task-bar estimate-bar"
                       :style="{
left: `${task.startPercent}%`,
width: `${task.endPercent - task.startPercent}%`
}">
                    {{ task.name }}
                  </div>
                  <div v-else
                       class="task-bar estimate-bar"
                       :style="{
left: `${task.startPercent}%`,
width: `${task.endPercent - task.startPercent}%`
}">
                    {{ task.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="item.title === '基线'"
               class="timeline-rows">
            <div style="height:100%;">
              <div v-for="(task, index) in baselineTasks"
                   :key="'baseline-' + index"
                   class="timeline-row-bottom">
                <div class="task-bar-container">
                  <div v-if="index / 2 !== 1 && index !== 0"
                       class="task-bar baseline-bar flex-pos"
                       :style="{
left: `${task.startPercent}%`,
width: `${task.endPercent - task.startPercent}%`
}">
                    {{ task.name }}
                  </div>
                  <div v-else
                       class="task-bar baseline-bar"
                       :style="{
left: `${task.startPercent}%`,
width: `${task.endPercent - task.startPercent}%`
}">
                    {{ task.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlanProgress',
  inject: ['provideParams'],
  props: {
    thirdMenuParam: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      data: [
        {
          title: '预估',
          list: []
        },
        {
          title: '基线',
          list: []
        }
      ],
      // 预估任务数据（百分比基于整个时间轴）
      estimateTasks: [],
      forecastEstimate: [],
      // 基线任务数据
      baselineTasks: [],
      baselineEstimate: []
    }
  },
  computed: {
    planInfoId () {
      return this.thirdMenuParam.ID
    }
  },
  created () {
    this.$watch('provideParams.searchParams', (val) => { }, {
      deep: true
    })
    this.getPlanProgress()
  },
  mounted () {
    // this.$nextTick(() => {
    //   const wrappers = this.$refs.timelineWrapper;
    //   if (wrappers) {
    //     wrappers.forEach(wrapper => {
    //       wrapper.addEventListener('wheel', this.handleWheel, { passive: false });
    //     });
    //   }
    // });
  },
  beforeDestroy () {
    // const wrappers = this.$refs.timelineWrapper;
    // if (wrappers) {
    //   wrappers.forEach(wrapper => {
    //     wrapper.removeEventListener('wheel', this.handleWheel);
    //   });
    // }
  },
  methods: {
    getPlanProgress () {
      this.estimateTasks = []
      this.forecastEstimate = []
      this.baselineTasks = []
      this.baselineEstimate = []
      this.$api['planInfoManager.loadPlanProgressSituation']({ planInfoId: this.planInfoId })
        .then((res) => {
          this.data[0].list = res.forecast
          this.data[1].list = res.baseline
          if (res['forecast-estimate'].length > 0) {
            res['forecast-estimate'].forEach((item, index) => {
              let obj = item
              // obj.name = obj.name + '(里程碑)'
              if (index === 0) {
                obj.startPercent = 0
              } else {
                obj.startPercent = this.getDate(res.forecast[index - 1].beginDate, item.beginDate) + this.estimateTasks[index - 1].startPercent
                // obj.startPercent = this.getDate(res.forecast[index - 1].beginDate, item.beginDate) + this.estimateTasks[index - 1].startPercent
                // obj.endPercent = this.getDate(item.beginDate, item.endDate) + this.estimateTasks[index - 1].endPercent
              }
              if (this.getDate(item.beginDate, item.endDate) < 12) {
                obj.endPercent = 12
              } else {
                obj.endPercent = this.getDate(item.beginDate, item.endDate)
              }
              this.estimateTasks.push(obj)
            })
          }
          if (res['baseline-estimate'].length > 0) {
            res['baseline-estimate'].forEach((item, index) => {
              let obj = item
              obj.name = obj.name + '(里程碑)'
              if (index === 0) {
                obj.startPercent = 0
              } else {
                obj.startPercent = this.getDate(res.baseline[index - 1].beginDate, item.beginDate)
                // obj.startPercent = this.getDate(res.baseline[index - 1].beginDate, item.beginDate) + this.baselineTasks[index - 1].startPercent
                // obj.endPercent = this.getDate(item.beginDate, item.endDate) + this.baselineTasks[index - 1].endPercent
              }
              if (this.getDate(item.beginDate, item.endDate) < 12) {
                obj.endPercent = 12
              } else {
                obj.endPercent = this.getDate(item.beginDate, item.endDate)
              }
              this.baselineTasks.push(obj)
            })
          }
        })
        .catch((err) => {
          console.log(err, 'err')
        })
    },
    getDate (start, end) {
      const timeDiff = new Date(end).getTime() - new Date(start).getTime()
      return Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    },
    handleWheel (e) {
      e.preventDefault();
      const wrapper = e.currentTarget;
      wrapper.scrollLeft += e.deltaY;
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-progress {
  height: 90%;
  box-sizing: border-box;
  padding: 50px 20px 10px 80px;
}
.progress-item {
  width: 100%;
  height: 200px;
  display: flex;
  // padding: 30px 0 0; // 调整上下间距
  flex-direction: row;
}

.title {
  font-size: 24px;
  font-weight: bold;
  padding-top: 8px; // 标题垂直对齐
}
.timeline-wrapper {
  width: 100%;
  flex: 1;
  overflow-x: overlay;
  overflow-y: overlay; // 新增垂直方向溢出隐藏
  box-sizing: border-box;
  height: 210px;

  // 调整时间轴实际高度
  .timeline {
    height: 80px; // 确保实际内容高度不超过容器
  }

  // &::-webkit-scrollbar {
  //   width: 6px;
  //   height: 6px;
  //   display: none;
  //   background: transparent;
  // }

  &:hover {
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: block;
    }
  }
}

.timeline {
  width: 100%;
  flex: 1;
  display: flex;
  min-width: fit-content;
  height: 100px; // 增加时间轴整体高度

  .timeline-item {
    margin-top: 12px;
    position: relative;
    width: 250px;
    min-width: 250px;

    &:last-child {
      width: auto;
      min-width: auto;
    }
    // 移除了 padding: 0 15px;

    .timeline-item-node {
      position: absolute;
      left: 0; // 修改圆点位置
      top: 0;
      width: 15px;
      height: 15px;
      background: $theme-color;
      border-radius: 50%;
    }
    .timeline-item-plan {
      position: absolute;
      left: 0; // 修改圆点位置
      top: 0;
      width: 12px;
      height: 12px;
      border: 1px $theme-color solid;
      border-radius: 10px;
    }

    .timeline-item-tail {
      position: absolute;
      top: 5px;
      left: 13px;
      height: 2px;
      width: calc(100% - 14px);
      background-color: $theme-color-opacity;
    }

    .timeline-item-content {
      width: 100%;
      white-space: nowrap;
      margin-top: 20px;
      text-align: start;
      font-size: 14px;
      line-height: 20px;
      padding-right: 20px;

      .timeline-item-name {
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.el-button-group {
  position: absolute;
  left: 90px;
}
.timeline-container {
  width: 100%;
  // margin: 20px auto;
  // padding: 20px;
  // background-color: #fff;
  // border-radius: 8px;
  // box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.timeline-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.timeline-legend {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 10px;
}
.plan-color {
  width: 16px;
  height: 16px;
  border-radius: 10px;
}

.estimate-plan {
  border: 1px #4285f4 solid;
}
.estimate-color {
  background-color: #4285f4; /* 蓝色 */
}

.baseline-color {
  background-color: #61cdb4; /* 红色 */
}

.legend-text {
  color: #555;
  font-size: 14px;
}

.timeline-axis {
  position: relative;
  height: 30px;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
}

.axis-tick {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
}

.tick-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  color: #666;
  transform: translateX(-50%);
}

.tick-line {
  height: 8px;
  width: 1px;
  background-color: #ddd;
  margin-left: 50%;
}

.timeline-rows {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 130px;
  // overflow: auto;
}

.timeline-row {
  height: 20px;
  width: 100%;
  // position: absolute; // 是否重叠
}
.timeline-row2 {
  height: 20px;
  width: 100%;
  // position: absolute; // 是否重叠
}
.timeline-row-bottom {
  height: 20px;
  width: 100%;
}
.flex-pos {
  // margin-top: 10px;
}
.task-name {
  width: 150px;
  font-size: 14px;
  color: #333;
  padding-right: 10px;
  text-align: right;
}

.task-bar-container {
  flex: 1;
  height: 18px;
  position: relative;
  // overflow: auto;
  // overflow-y: hidden;
}

.task-bar {
  position: absolute;
  height: 18px;
  // top: 50%;
  // transform: translateY(-50%);
  border-radius: 30px;
  text-align: left;
}

.estimate-bar {
  background-color: #4285f4;
  opacity: 0.8;
}

.baseline-bar {
  background-color: #61cdb4;
  opacity: 0.8;
}
</style>

