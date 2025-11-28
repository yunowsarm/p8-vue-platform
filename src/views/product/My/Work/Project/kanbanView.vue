<template>
  <kanban-view :kanbanConfig='kanbanConfig'
               :thirdMenuParam="reportParam"
               :row="row"></kanban-view>
</template>

<script>
import kanbanView from '@/views/Framework/System/KanbanDesign/kanbanView.vue'
export default {
  components: {
    kanbanView
  },
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      kanbanConfig: {
        id: 'ff9956cad8447699886c361c6f2a424d',
        code: 'projectOverivew'
      },
      reportParam: {
        wholeId: this.row[0].WHOLE_ID
      }
    }
  }
}
</script>

<style>
</style>