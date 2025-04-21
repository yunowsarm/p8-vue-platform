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
      <input-view :task-id="taskId"
                  :gantt-name="ganttName"></input-view>
    </div>
    <div class="task_detail_item">
      <el-tabs style="width:100%"
               v-model="activeOutput"
               type="border-card">
        <el-tab-pane label="输出要求"
                     name="outputKey">
          <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 输出要求</span>
          <output-view :task-id="taskId"
                       :gantt-name="ganttName"></output-view>
        </el-tab-pane>
        <el-tab-pane label="已提交输出物"
                     name="getOutputKey">
          <span slot="label"><i class="p8 icon-yitijiaoshuchuwu"></i> 已提交输出物</span>
          <getOutPutView @saveSuccess="saveCallback"
                         :task-id="taskId"
                         :gantt-name="ganttName"></getOutPutView>
        </el-tab-pane>
      </el-tabs>
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
      activeOutput: 'outputKey'
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
