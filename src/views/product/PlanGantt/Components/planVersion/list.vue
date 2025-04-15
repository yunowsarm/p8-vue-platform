<template>
  <div class="plan_version" style="width: 100%;height:100%">
    <div>
     <plan-attribute
      :task-id='selectTaskId1'
      ganttName='versionGantt1'
      otherGanttName='versionGantt2'
      :versionId='planVersionId1'>
    </plan-attribute>
    </div>
    <div>
      <plan-attribute
        :task-id='selectTaskId2'
        ganttName='versionGantt2'
        otherGanttName='versionGantt1'
        :versionId='planVersionId2'
        :versionType="versionType">
      </plan-attribute>
    </div>
 </div>
</template>

<style lang="scss">
.plan_version {
  display: flex;
  width: 100%;
  height:100%
}
</style>
<script>

import PlanAttribute from './Components/planAttribute'

export default {
  name: 'planInfoList',
  props: {
    planVersionId1: {
      type: String,
      default: null
    },
    planVersionId2: {
      type: String,
      default: null
    },
    selectTaskId1: {
      type: String,
      default: null
    },
    selectTaskId2: {
      type: String,
      default: null
    },
    planVersionNum1: {
      type: String,
      default: null
    },
    planVersionNum2: {
      type: String,
      default: null
    },
    versionType: {
      type: String,
      default: null
    }
  },
  components: {
    PlanAttribute
  },
  data () {
    return {

    }
  },
  computed: {

  },
  created () {
    if (!this.selectTaskId2) {
      this.$message({type: 'warning', message: `当前任务在${this.planVersionNum2}版本中不存在`})
    }
    if (!this.selectTaskId1) {
      this.$message({type: 'warning', message: `当前任务在${this.planVersionNum1}版本中不存在`})
    }
  },
  mounted () {

  },
  methods: {

  }
}
</script>
