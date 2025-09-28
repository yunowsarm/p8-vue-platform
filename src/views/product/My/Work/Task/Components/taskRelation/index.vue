<template>
  <pane-view paneTitle="关联任务"
             style="height: 100%"
             icon="p8 icon-guanlianrenwu">
    <template #paneTitle>
      <div v-if="!$store.getters.isMobile"
           class="pane-title-right"
           @click="rightClickHandle">
        <i class="p8 icon-youshoujin"
           style="color: #79bcfa;"></i>
      </div>
      <div v-else
           class="pane-title-right">
        <div v-show="isShow"
             class="pane-title-right"
             @click="arrowClickHandle">
          <i class="p8 icon-zuoshoujin"
             style="color: #79bcfa;"></i>
        </div>
        <div v-show="!isShow"
             class="pane-title-right"
             @click="rightClickHandle">
          <i class="p8 icon-youshoujin"
             style="color: #79bcfa;"></i>
        </div>
      </div>
    </template>
    <template #paneInfo>
      <div v-show="isShow"
           class="process">
        <front-to-back @rowClick="rowClick"></front-to-back>
      </div>
      <div v-show="isShow"
           class="tabs-taskinfo">
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
      dateTime: null,
      isShow: true
    }
  },
  methods: {
    rowClick (taskId) {
      this.taskId = taskId
      this.dateTime = new Date().getTime()
    },
    arrowClickHandle () {
      this.isShow = false
    },
    rightClickHandle () {
      if (window.innerWidth > 600) {
        this.$bus.$emit('split-pane-right')
      } else {
        this.isShow = true
      }
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
@media screen and (min-width: 300px) and (max-width: 600px) {
  .process {
    height: 100%;
  }
  .tabs-taskinfo {
    height: 100%;
  }
}
</style>
