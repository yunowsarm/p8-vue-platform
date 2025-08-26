<template>
  <div style="height: 100%;width:100%;">
    <div v-if="viewVisible"
         class="viewVisible">
    </div>
    <P8TableRender v-else
                   ref="tableRender"
                   class="planLayout"
                   code="relevanceContractList"
                   :reportParam="reportParam"
                   :west-tree-param="provideParams.searchParams">
    </P8TableRender>
  </div>
</template>

<script>
export default {
  name: 'linedContract',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    },
    configParmars: {
      type: Object,
      default: () => {
        return {}
      }
    },
    businessKey: {
      type: String
    }
  },
  data () {
    return {
      viewVisible: false,
      reportParam: {
        project_id: ''
      },
      provideParams: {
        searchParams: {}
      }
    }
  },
  components: {
  },
  computed: {},
  beforeMount () { },
  created () {
    if (this.row && this.row.length) {
      this.id = this.row[0].ID ? this.row[0].ID : this.row[0].id
      this.reportParam.project_id = this.row[0].ID ? this.row[0].ID : this.row[0].id
    } else {
      if (this.businessKey) {
        this.id = this.businessKey
        this.reportParam.project_id = this.businessKey
      } else {
        this.id = this.configParmars ? this.configParmars.id : ''
        this.reportParam.project_id = this.configParmars ? this.configParmars.id : ''
      }
      if (!this.id) {
        this.viewVisible = true
        return this.$message({
          message: '请先创建项目',
          type: 'warning'
        })
      }
    }
  },
  destroyed () {
  },
  methods: {
  },
  watch: {

  }
}

</script>
<style lang='scss' scoped>
.viewVisible {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
