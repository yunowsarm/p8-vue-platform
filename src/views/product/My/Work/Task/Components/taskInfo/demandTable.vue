<template>
  <table-render code="requirementsList"
                :report-param="reportParam">
  </table-render>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender'
export default {
  name: 'NormalLayoutAndTree',
  components: {
    TableRender
  },
  props: ['taskId'],
  data () {
    return {
      reportParam: {
        TASK_ID: this.taskId
      }
    }
  }
}
</script>
