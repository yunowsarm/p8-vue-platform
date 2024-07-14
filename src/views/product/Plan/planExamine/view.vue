<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <table-render code="planAssessmentByDept"
                :headerVisible="false"
                :reportParam="reportParam">
  </table-render>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
export default {
  name: 'View',
  components: {
    TableRender
  },
  props: {
    row: {
      // 给报表所传参数
      type: Array,
      default: () => {
        return []
      }
    },
    businessKey: {
      type: String
    }
  },
  data () {
    return {
      reportParam: {
        PM_ASSESSMENT_ID: this.businessKey ? this.businessKey : this.row[0].ID
      }
    }
  },
  mounted () {
  },
  methods: {

  }
}
</script>
