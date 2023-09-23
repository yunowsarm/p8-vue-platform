<template>
  <div class="task_detail"
       style="height: 100%">
    <div class="task_detail_item">
      <div class='item_title'>
        <i class="icon-jindu p8"></i><span>{{record.taskName}}</span>
      </div>
      <describe-view :task-id="taskId"
                     :record='record'
                     :gantt-name="ganttName"></describe-view>
    </div>
    <div class="task_detail_item">
      <div class='item_title'>
        <i class="icon-rizhiliebiao p8"></i><span>任务标识</span>
      </div>
      <monitor-view :task-id="taskId"
                    :gantt-name="ganttName"></monitor-view>
    </div>
    <div class="task_detail_item">
      <div class='item_title'>
        <i class="icon-wodegongzuo p8"></i><span>前置任务</span>
      </div>
      <dependence-view :task-id="taskId"
                       :gantt-name="ganttName"></dependence-view>
    </div>
    <div class="task_detail_item">

    </div>
    <div class="task_detail_item">

    </div>
    <div class="task_detail_item">

    </div>
  </div>
</template>

<script>
import DescribeView from './describeView'
import MonitorView from '@/views/product/PlanGantt/Components/monitorEdit/monitorView'
import DependenceView from '@/views/product/PlanGantt/Components/dependenceEdit/dependenceView'
import InputView from '@/views/product/PlanGantt/Components/inputEdit/inputView'
import OutputView from '@/views/product/PlanGantt/Components/outputEdit/outputView'
import getOutPutView from '@/views/product/PlanGantt/Components/getOutputKeyView/outputViews'
import { P8Anchor as Anchor } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
export default {
  name: 'Detail',
  props: ['taskId', 'ganttName', 'record'],
  components: {
    getOutPutView,
    InputView,
    Anchor,
    DescribeView,
    MonitorView,
    OutputView,
    DependenceView
  },
  watch: {},
  mounted: function () {
    // isView为true时是修改页面，为false时是查看页面
    if (this.taskId && this.ganttName) {
      const ganttObject = GanttObject.getGanttObject(this.ganttName)
    }
  },
  data () {
    return {
      headerVisible: false,
      isEdit: true,
      anchorMenu: [
        { label: '任务描述', value: 'describeKey' },
        { label: '任务标识', value: 'monitorKey' },
        { label: '前置任务', value: 'dependenceKey' },
        { label: '输入', value: 'inputKey' },
        { label: '输出', value: 'outputKey' },
        { label: '输出物查看', value: 'getOutputKey' }
      ]
    }
  },
  methods: {
    onSelect (tab, event) {
      this.activeKey = tab.name
    },
    saveCallback (res) { }
  }
}
</script>
<style lang="scss" scoped>
.task_detail {
  .task_detail_item {
    font-size: 14px;
    padding: 15px;
    display: flex;
    align-items: center;
    flex-direction: column;
    .item_title {
      width: 100%;
    }
  }
}
</style>
