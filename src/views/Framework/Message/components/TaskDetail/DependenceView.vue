<script>
export default {
  /**
   * 组件名称
   */
  name: 'DependenceView',
  /**
   * 组件属性
   * @param {String} taskId - 任务ID，默认为null
   */
  props: {
    taskId: {
      type: String,
      default: null
    }
  },
  /**
   * 组件数据
   * @returns {Object} 返回组件数据对象
   */
  data() {
    return {
      ganttLinkResponse: [],
      tempOptions: [
        { icon: 'p8 icon-wanchengzhikaishi', type: '0' },
        { icon: 'p8 icon-kaishizhikaishi', type: '1' },
        { icon: 'p8 icon-wanchengzhiwancheng', type: '2' },
        { icon: 'p8 icon-kaishizhiwancheng', type: '3' }
      ],
      statusStyle: [
        { status: '6020', text: '未开始', color: '#f85359' },
        { status: '6050', text: '进行中', color: '#1bbf9e' },
        { status: '6070', text: '已完成', color: '#1890ff' }
      ]
    }
  },
  /**
   * 实例创建时获取数据
   */
  created() {
    this.getLinkDatas(this.taskId)
  },
  /**
   * 组件方法
   * @param {String} taskId - 任务ID
   */
  methods: {
    getLinkDatas(taskId) {
      this.$api['planGanttManager.getDependenceByTaskId']({ taskId: taskId }).then((res) => {
        if (res && Array.isArray(res.ganttLinkResponse) && res.ganttLinkResponse.length > 0) {
          this.isEmpty = false
          this.ganttLinkResponse = res.ganttLinkResponse
          this.ganttLinkResponse.forEach(item => {
            item.icon = this.tempOptions.find(i => i.type === item.type).icon
            item.color = this.statusStyle.find(i => i.text === item.sourceStatus).color
          })
        } else {
          this.isEmpty = true
        }
      })
    }
  }
}
</script>

<template>
  <div class="form-more-wrap">
    <el-empty v-if="!ganttLinkResponse.length" class="custom_empty" :image-size="100"></el-empty>
    <div v-else>
      <template v-for="(item, index) in ganttLinkResponse">
        <el-row
          class="form-single-row"
          v-if="item.monitorId !== '1017'"
          :style="{ borderBottomWidth: ganttLinkResponse.length > 1 && index < ganttLinkResponse.length - 1 ? '1px' : '0px' }"
          :gutter="10"
          :key="index"
        >
          <el-col :span='3'>
            <div class='flex-center'>
              <i :class='item.icon'></i>
            </div>
          </el-col>
          <el-col :span='10'>
            <span>
              {{item.sourceName}}
            </span>
            <span class='plan_progress' :style='{ backgroundColor: item.color }'>
              {{item.sourceStatus}}
            </span>
          </el-col>
          <el-col :span='5'>
            <span>
              滞后(/天)： {{item.lag}}
            </span>
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-more-wrap {
  box-sizing: border-box;
}

.form-more-wrap {
  border: 1px solid #e1e1e1;
  border-radius: 4px;
}

.formList.el-form > .el-row .el-form-item__content {
  line-height: 32px;
}

.form-single-row {
  border-bottom-style: solid;
  border-bottom-color: #e1e1e1;
  display: flex;
  align-items: center;
  line-height: 32px;
  padding: 8px 0;
}

.form-single-row:hover {
  background-color: #e5f0f9;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan_progress {
  color: #ffffff;
  padding: 0 5px;
}
</style>
