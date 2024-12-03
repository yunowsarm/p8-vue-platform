<template>
  <pane-view paneTitle="任务详细信息"
             icon="p8 icon-renwuxiangxixinxi">
    <template #paneTitle>
      <div class="pane-title-right"
           @click="arrowClickHandle">
        <i class="p8 icon-zuoshoujin"
           style="color: #79bcfa;"></i>
      </div>
    </template>
    <template #paneInfo>
      <task-pane-view :dataSource="dataSource"
                      :isShow="true"
                      :api="taskApi"
                      :apiParams="taskApiParams"></task-pane-view>
    </template>
  </pane-view>
</template>
<script>

import PaneView from '../layout/Pane'
import TaskPaneView from './TaskPane'
export default {
  name: 'TaskInfoView',
  inject: ['getPlanInfo'],
  components: {
    TaskPaneView,
    PaneView
  },
  computed: {

  },
  data () {
    const dataSource = [
      {
        type: 'view',
        labelText: '所属计划',
        fieldName: 'planName', // taskName
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '任务名称',
        fieldName: 'name', // taskName
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '任务类型',
        fieldName: 'planTypeDisplay', // taskName
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '进度',
        slotName: 'status',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '状态',
        slotName: 'managerStatusDisplay',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '标识',
        slotName: 'managerStatus',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '工期(天)',
        fieldName: 'duration',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '超期/剩余天数',
        slotName: 'durationDay',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '绩效',
        fieldName: 'achievements',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '比例',
        slotName: 'proportion',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '完成度',
        slotName: 'progress',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '预计周期',
        fieldName: 'forecastDate',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '计划周期',
        fieldName: 'planDate',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '实际周期',
        fieldName: 'realDate',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '',
        slotName: 'dateline',
        colLayout: 'singleCol',
        formItemConfig: {
          'label-width': '0px'
        }
      }
    ]
    return {
      dataSource,
      taskApi: 'taskManager.taskInfo',
      taskApiParams: {}
    }
  },
  mounted () {
    this.taskApiParams.taskId = this.getPlanInfo().TASKID
  },
  methods: {
    arrowClickHandle () {
      this.$bus.$emit('split-pane-left')
    }
  }
}
</script>
<style lang="scss" scoped>
.pane-title-right {
  float: right;
  font-size: 16px;
}
</style>
