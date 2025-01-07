<script>
// 导入 Anchor 组件，用于创建锚点导航
import { P8Anchor as Anchor } from 'p8-components-ui'
// 导入任务描述组件
import describeView from './DescribeView.vue' // 任务描述
// 导入任务标识组件
import MonitorView from './MonitorView.vue' // 任务标识
// 导入前置任务组件
import DependenceView from './DependenceView.vue' // 前置任务
// 导入输入要求组件
import inputView from './InputView.vue' // 输入要求
// 导入输出要求组件
import OutputView from './OutputView.vue' // 输出要求
// 导入已提交的输出物组件
import getOutPutView from './GetOutputView.vue' // 已提交的输出物
// 导入特别说明组件
import SpecialView from './SpecialView.vue' // 特别说明
// 导入关联需求组件
import relevanceList from '@/views/product/PlanGantt/Components/planAttribute/relevanceList.vue' // 关联需求

// 定义任务详情组件
export default {
  name: 'TaskDetail',
  components: {
    relevanceList,
    getOutPutView,
    OutputView,
    Anchor,
    describeView,
    MonitorView,
    DependenceView,
    inputView,
    SpecialView
  },
  props: {
    // 任务ID，用于获取任务相关数据
    taskId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 锚点菜单配置
      anchorMenu: [
        { label: '任务描述', value: 'describeKey', icon: 'p8 icon-jindu' },
        { label: '任务标识', value: 'monitorKey', icon: 'p8 icon-rizhiliebiao1' },
        { label: '前置任务', value: 'dependenceKey', icon: 'p8 icon-xuanxiang1' },
        { label: '输入要求', value: 'inputKey', icon: 'p8 icon-shuruyaoqiu', hideLabel: true },
        { label: '输出要求', value: 'outputKey', icon: 'p8 icon-shuchuyaoqiu', hideLabel: true },
        { label: '特别说明', value: 'specialKey', icon: 'p8 el-icon-warning-outline' },
        { label: '关联需求', value: 'demandKey', icon: 'p8 icon-a-xuqiu1' }
      ],
      // 当前激活的输出标签页
      activeOutput: 'outputKey'
    }
  }
}
</script>

<template>
  <!-- 使用 Anchor 组件创建锚点导航 -->
  <Anchor placement="left" :menu="anchorMenu" style-sheet="tabs">
    <!-- 锚点内容区域 -->
    <template #describeKey>
      <!-- 任务描述组件 -->
      <describe-view :task-id="taskId"></describe-view>
    </template>
    <template #monitorKey>
      <!-- 任务标识组件 -->
      <monitor-view :task-id="taskId"></monitor-view>
    </template>
    <template #dependenceKey>
      <!-- 前置任务组件 -->
      <dependence-view :task-id="taskId"></dependence-view>
    </template>
    <template #inputKey>
      <!-- 输入要求组件 -->
      <input-view :task-id="taskId"></input-view>
    </template>
    <template #outputKey>
      <!-- 输出要求和已提交输出物的标签页 -->
      <el-tabs v-model="activeOutput" type="border-card">
        <el-tab-pane label="输出要求" name="outputKey">
          <!-- 输出要求标签页内容 -->
          <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 输出要求</span>
          <output-view :task-id="taskId"></output-view>
        </el-tab-pane>
        <el-tab-pane label="已提交输出物" name="getOutputKey">
          <!-- 已提交输出物标签页内容 -->
          <span slot="label"><i class="p8 icon-yitijiaoshuchuwu"></i> 已提交输出物</span>
          <getOutPutView :task-id="taskId"></getOutPutView>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template #specialKey>
      <!-- 特别说明组件 -->
      <special-view :task-id="taskId"></special-view>
    </template>
    <template #demandKey>
      <!-- 关联需求组件 -->
      <relevance-list :task-id="taskId"></relevance-list>
    </template>
  </Anchor>
</template>

<style scoped lang="scss">
.p8-anchor {
  box-sizing: border-box;
  padding-left: 20px;
}

::v-deep .p8-anchor-content--wrap .scroll-area {
  padding-right: 20px;
}
//::v-deep .p8-anchor-slider--wrap .scroll-area{
//  padding: 10px 0;
//}

::v-deep .p8-anchor-slider {
  width: auto !important;
}
</style>
