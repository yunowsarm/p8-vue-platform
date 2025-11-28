<template>
  <div class="content">
    <table-render code="PLAN_WARNING"
                  :specialRoteName='specialRoteName ?? $route.name'
                  :west-tree-param="reportParam"
                  :report-param="reportParam"></table-render>
  </div>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'PlanWarning',
  props: {
    specialRoteName:{
      type: String,
      default: null
    },
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      record: null,
      reportParam: {
        PLAN_INFO_ID: this.thirdMenuParam.ID || this.thirdMenuParam.WHOLEID,
        warnType: 'budget'
      }
    }
  },
  components: {
    TableRender,
    ListLayout
  }
  // created() {
  //
  //   this.reportParam.PLAN_INFO_ID = this.thirdMenuParam.ID
  //
  // }
}
</script>
<style scoped>
.content {
  width: calc(100% - 29px) !important;
  height: calc(100% - 20px) !important;
  margin: 15px 15px 0 15px;
}
</style>
