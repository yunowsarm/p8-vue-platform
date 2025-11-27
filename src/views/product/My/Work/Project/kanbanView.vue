<template>
  <kanban-view :kanbanConfig='kanbanConfig'
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
    }
  }
}
</script>

<style>
</style>