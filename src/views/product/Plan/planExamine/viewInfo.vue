<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <table-render code="planAssessmentByDeptData"
                ref="table"
                :reportParam="reportParam">
    <template #ASSESSMENTSTATUS="{scope}">
      <span v-if="scope.row.PLANASSESSMENTSTATUS !== '776e7590c4084a8ad00fb6b0dfe2a114'">{{scope.row.ASSESSMENTSTATUSDISPLAY}}</span>
      <el-select v-else
                 v-model="scope.row.ASSESSMENTSTATUS"
                 clearable
                 style="width: 100%"
                 @change="save(scope.row)">
        <el-option v-for="item in options"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"> </el-option>
      </el-select>
    </template>
    <template #REMARKS="{scope}">
      <span v-if="scope.row.PLANASSESSMENTSTATUS !== '776e7590c4084a8ad00fb6b0dfe2a114'">{{scope.row.REMARKS}}</span>
      <el-input v-else
                v-model="scope.row.REMARKS"
                @change="save(scope.row)"></el-input>
    </template>
  </table-render>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
export default {
  name: 'AssessInfo',
  components: {
    TableRender
  },
  props: {
    reportParam: {
      // 给报表所传参数
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      reportParam: {
        DEPTID: this.reportParam.DEPTID,
        columnType: this.reportParam.property
      },
      options: []
    }
  },
  mounted () {
    this.$api['thirdPartInterface.getDic']({ dicType: 'ASSESSMENT_RESULTS' }).then(res => {
      this.options = res
    })
  },
  methods: {
    save (row) {
      this.$api['planExamine.saveAssessmentByData']({
        id: row.ID,
        assessmentStatus: row.ASSESSMENTSTATUS,
        remarks: row.REMARKS
      }).then(res => {
        if (res) {
          this.$message.success('保存成功')
          this.$refs.table.omponentRefresh()
        }
      })
    }
  }
}
</script>
