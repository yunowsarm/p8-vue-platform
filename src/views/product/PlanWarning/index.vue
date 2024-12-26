<template>
  <list-layout :header-visible="false">
    <template #center>
      <table-render code="PLAN_WARNING" :west-tree-param="reportParam" :report-param="reportParam"></table-render>
    </template>
  </list-layout>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'PlanWarning',
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      record: null,
      reportParam: {
        PLAN_INFO_ID: this.thirdMenuParam.ID
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
