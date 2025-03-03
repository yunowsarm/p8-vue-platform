<template>
  <div class="plan-progress">
    <div class="progress-item" v-for="(item, index) in data" :key="index">
      <div class="title">{{ item.title }}</div>
      <div class="timeline">
        <div
          class="timeline-item"
          v-for="(timelineItem, timelineIndex) in item.list"
          :key="timelineIndex"
          :style="{
            '--item-count': item.list.length,
            '--item-index': timelineIndex + 1
          }"
        >
          <div class="timeline-item-tail" v-if="timelineIndex !== item.list.length - 1" :style="{ backgroundColor: timelineItem.status === '6070' ? '#1a73e8' : '#90caf9' }"></div>
          <div class="progress-line" v-if="timelineIndex !== item.list.length - 1 && timelineItem.status === '6050'" :style="{ width: `${timelineItem.progress * 100}%`, backgroundColor: '#1a73e8' }"></div>
          <div class="timeline-item-node" :style="{ backgroundColor: timelineItem.status === 'completed' || timelineItem.status !== '6020' ? '#1a73e8' : '#90caf9' }"></div>
          <div class="timeline-item-content">
            <div class="timeline-item-name" :title="timelineItem.name">
              {{ timelineItem.name }}
            </div>
            <div class="timeline-item-date">
              {{ timelineItem.endDate }}
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
  data() {
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
      ]
    }
  },
  computed: {
    planInfoId() {
      return this.thirdMenuParam.ID
    }
  },
  created() {
    this.$watch('provideParams.searchParams', (val) => {}, {
      deep: true
    })
    this.getPlanProgress()
  },
  methods: {
    getPlanProgress() {
      this.$api['planGanttManager.loadTaskProgressSituation']({ planInfoId: this.planInfoId })
        .then((res) => {
          this.data[0].list = res.forecast
          this.data[1].list = res.baseline
        })
        .catch((err) => {
          console.log(err, 'err')
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-progress {
  height: 100%;
  box-sizing: border-box;
  padding: 20px 80px;

  .progress-item {
    width: 100%;
    display: flex;
    padding: 50px 0;

    .title {
      font-size: 24px;
      margin-right: 30px;
      font-weight: bold;
    }
  }
}

.timeline {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: space-between;

  .timeline-item {
    margin-top: 12px;
    position: relative;
    min-width: 0;

    // 动态计算宽度
    &:not(:last-child) {
      width: calc(100% / var(--item-count) + 70px * var(--item-index));
    }

    // 最后一个项保持自动宽度
    &:last-child {
      width: auto;
    }

    .timeline-item-node {
      left: -1px;
      width: 12px;
      height: 12px;
      background: $theme-color;
      border-radius: 50%;
    }

    .timeline-item-tail {
      position: absolute;
      top: 5px;
      left: 12px;
      height: 2px;
      width: 100%;
      background-color: $theme-color-opacity;
    }

    .progress-line {
      position: absolute;
      top: 5px;
      left: 12px;
      height: 2px;
      //background-color: red; // 红色进度线
      z-index: 1; // 确保进度线在默认线之上
    }

    .timeline-item-content {
      width: 100%;
      white-space: nowrap;
      margin-top: 10px;
      text-align: start;
      font-size: 14px;
      line-height: 20px;
      padding-right: 30px;

      .timeline-item-name {
        margin-bottom: 10px;
        overflow: hidden; // 超出部分隐藏
        text-overflow: ellipsis; // 超出部分显示省略号
      }
    }
  }
}
</style>
