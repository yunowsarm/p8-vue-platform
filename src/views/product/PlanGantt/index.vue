<template>
  <div>
    <Gantt :api="ganttApi" :params="ganttParams"></Gantt>
  </div>
</template>

<script>
import Gantt from '@/components/Gantt/index'
export default {
  name: 'PlanGanttManage',
  components: {
    Gantt
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      ganttApi: 'PlatGantt.getPlanGanttData',
      ganttParams: {
        id: this.thirdMenuParam.ID
      }
    }
  },
  created() {
    console.log('🚀 ~ file: index.vue:16 ~ reportParam:', this.thirdMenuParam)
  }
}
</script>

<style lang="scss" scoped></style>
