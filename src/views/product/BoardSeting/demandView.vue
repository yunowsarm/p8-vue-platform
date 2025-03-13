<template>
  <P8TableRender ref="tableRender"
                 class="planLayout"
                 :tableRefresh='tableRefresh'
                 :code="tableCode"
                 :reportParam="reportParam"
                 :west-tree-param="provideParams.searchParams">
  </P8TableRender>
</template>

<script>
export default {
  name: 'demandChart',
  props: {
    drillParam: {
      type: Object
    }
  },
  data () {
    return {
      tableCode: '',
      reportParam: {},
      provideParams: {
        searchParams: {}
      }
    }
  },
  components: {
  },
  computed: {},
  beforeMount () { },
  mounted () {
    if (this.drillParam.type.value === '已保存') {
      this.tableCode = 'requirementsGatheringList'
    } else {
      this.tableCode = 'listOfRequirements'
      this.reportParam.ID = this.drillParam.id.value
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
</style>
