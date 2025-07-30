<template>
  <pane-view paneTitle="关联任务"
             icon="p8 icon-guanlianrenwu">
    <template #paneTitle>
      <div class="pane-title-right"
           @click="arrowClickHandle">
        <i class="p8 icon-youshoujin"
           style="color: #79bcfa;"></i>
      </div>
    </template>
    <template #paneInfo>
      <div class="process">
        <front-to-back @rowClick="rowClick"></front-to-back>
      </div>
      <div class="tabs-taskinfo">
        <tabs-task :key="dateTime"
                   :taskId="taskId"></tabs-task>
      </div>
    </template>
  </pane-view>
</template>
<script>
import PaneView from '../layout/Pane'
import FrontToBack from './frontToBack'
import TabsTask from './centerTabsTask'
export default {
  name: 'TaskRelation',
  props: {},
  components: {
    PaneView,
    FrontToBack,
    TabsTask
  },
  data () {
    return {
      taskId: '',
      dateTime: null
    }
  },
  methods: {
    rowClick (taskId) {
      this.taskId = taskId
      this.dateTime = new Date().getTime()
    },
    arrowClickHandle () {
      this.$bus.$emit('split-pane-right')
    }
  }
}
</script>
<style lang="scss" scoped>
.pane-title-right {
  float: right;
  font-size: 16px;
}
.process {
  height: 50%;
  box-sizing: border-box;
}
.tabs-taskinfo {
  height: 50%;
  box-sizing: border-box;
}
.knowledge {
  height: 30%;
  box-sizing: border-box;
}
</style>
