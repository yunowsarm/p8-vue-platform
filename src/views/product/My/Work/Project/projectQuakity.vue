<template>
  <div class="content">
    <table-render code="problemManagement"
                  specialRoteName='problem_management'
                  :west-tree-param="reportParam"
                  :report-param="reportParam"></table-render>
  </div>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
export default {
  name: 'PlanWarning',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
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
        LINKED_ITEM_WHOLE: this.row[0].WHOLE_ID
      }
    }
  },
  created () {

  },
  components: {
    TableRender
  }
}
</script>
<style scoped>
.content {
  width: calc(100% - 29px) !important;
  height: calc(100% - 20px) !important;
  margin: 15px 15px 0 15px;
}
</style>
