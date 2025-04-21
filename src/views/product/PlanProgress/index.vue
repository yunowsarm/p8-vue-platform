<template>
  <div class="plan-progress">
    <div class="progress-item" v-for="(item, index) in data" :key="index">
      <div class="title">{{ item.title }}</div>
      <div class="timeline-wrapper" ref="timelineWrapper">
        <div class="timeline">
          <div
            class="timeline-item"
            v-for="(timelineItem, timelineIndex) in item.list"
            :key="timelineIndex"
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
  mounted() {
    this.$nextTick(() => {
      const wrappers = this.$refs.timelineWrapper;
      if (wrappers) {
        wrappers.forEach(wrapper => {
          wrapper.addEventListener('wheel', this.handleWheel, { passive: false });
        });
      }
    });
  },
  beforeDestroy() {
    const wrappers = this.$refs.timelineWrapper;
    if (wrappers) {
      wrappers.forEach(wrapper => {
        wrapper.removeEventListener('wheel', this.handleWheel);
      });
    }
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
    },
    handleWheel(e) {
      e.preventDefault();
      const wrapper = e.currentTarget;
      wrapper.scrollLeft += e.deltaY;
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
    padding: 30px 0;  // 调整上下间距

    .title {
      font-size: 24px;
      margin-right: 20px;  // 增加标题右侧间距
      font-weight: bold;
      padding-top: 8px;    // 标题垂直对齐
    }
  }
}

.timeline-wrapper {
  width: 100%;
  flex: 1;
  overflow-x: overlay;
  overflow-y: hidden; // 新增垂直方向溢出隐藏
  box-sizing: border-box;
  padding-bottom: 30px;
  height: calc(100px + 30px);

  // 调整时间轴实际高度
  .timeline {
    height: 100px; // 确保实际内容高度不超过容器
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    display: none;
    background: transparent;
  }

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
  height: 100px;      // 增加时间轴整体高度

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
      left: 0;        // 修改圆点位置
      top: 0;
      width: 12px;
      height: 12px;
      background: $theme-color;
      border-radius: 50%;
    }

    .timeline-item-tail {
      position: absolute;
      top: 5px;
      left: 12px;     // 修改连接线起始位置
      height: 2px;
      width: calc(100% - 12px);  // 调整连接线宽度
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
</style>
