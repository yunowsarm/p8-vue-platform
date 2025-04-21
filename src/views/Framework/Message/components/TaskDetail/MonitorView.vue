<script>
/**
 * 导入所需的组件库
 * @import Row from 'p8-components-ui' 用于布局和表单的UI组件
 */
import { Row } from 'p8-components-ui'

/**
 * MonitorView 组件定义
 * 该组件用于展示任务标识，根据提供的taskId加载相应的任务标识
 */
export default {
  name: 'MonitorView',
  components: {
    'el-row': Row
  },
  props: {
    /**
     * taskId 任务ID
     * 类型: String
     * 默认值: null
     * 用途: 根据任务ID获取任务标识
     */
    taskId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      /**
       * monitors 任务标识列表
       * 类型: Array
       * 用途: 存储任务标识的图标等信息
       */
      monitors: [],
      /**
       * taskMonitors 任务任务标识列表
       * 类型: Array
       * 用途: 存储当前任务的任务标识
       */
      taskMonitors: []
    }
  },
  created() {
    // 在组件创建时，调用 getMonitorData 方法获取任务标识
    this.getMonitorData(this.taskId)
  },
  methods: {
    /**
     * 根据任务ID获取任务标识
     * @param {String} taskId 任务ID
     */
    getMonitorData: function (taskId) {
      /**
       * 发起API请求，获取任务任务标识
       * 成功时处理响应数据，失败时输出错误信息并设置isEmpty为true
       */
      this.$api['planGanttManager.getTaskMonitorByTaskId']({ taskId: taskId, planChangeDetailId: null })
        .then((res) => {
          if (res && Array.isArray(res.monitorManagerResponses) && res.monitorManagerResponses.length > 0) {
            this.isEmpty = false
            this.monitors = res.ganttMenuResponses
            if (res.monitorManagerResponses && res.monitorManagerResponses.length > 0) {
              this.taskMonitors = res.monitorManagerResponses
              /**
               * 为每个任务监控项添加对应的图标
               * 通过查找任务标识列表中的匹配项来获取图标
               */
              this.taskMonitors.forEach((item) => {
                item.icon = this.monitors.find((monitor) => monitor.id === item.monitorId).icon
              })
            }
          }
        })
        .catch((error) => {
          console.error('API请求失败:', error)
        })
    }
  }
}
</script>

<template>
  <!-- 监控视图的模板 -->
  <div class="form-more-wrap">
    <!-- 如果数据为空，显示空状态 -->
    <el-empty v-if="!taskMonitors.length" class="custom_empty" :image-size="100"></el-empty>
    <!-- 根据任务任务标识的长度决定是否显示内容 -->
    <div v-else :class="{ 'form-more-content': taskMonitors.length }">
      <!-- 遍历任务任务标识，生成相应的监控项 -->
      <template v-for="(formItem, formIndex) in taskMonitors">
        <!-- 条件渲染，排除特定监控ID -->
        <el-row
          class="form-single-row"
          v-if="formItem.monitorId !== '1017'"
          :style="{ borderBottomWidth: taskMonitors.length > 1 && formIndex < taskMonitors.length - 1 ? '1px' : '0px' }"
          :gutter="10"
          :key="formIndex"
        >
          <!-- 图标盒子 -->
          <div class="icon_box">
            <i class="icon" :class="formItem.icon"></i>
          </div>
        </el-row>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 定义样式，包括布局、图标等样式 */
.form-more-wrap {
  box-sizing: border-box;
  padding: 10px;
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
}

.form-single-row:hover {
  background-color: #e5f0f9;
}

.icon_box {
  width: 12.5%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 32px;
  padding: 8px 0;
}

.icon {
  display: inline-block;
  text-align: center;
  font-size: 14px;
  line-height: 32px;
}

::v-deep .el-col-3 {
  width: 12.5%;
}
</style>
