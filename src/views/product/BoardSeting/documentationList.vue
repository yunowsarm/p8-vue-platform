<template>
  <P8TableRender ref="tableRender"
                 class="planLayout"
                 :code="tableCode"
                 :reportParam="computedReportParam"
                 :west-tree-param="provideParams.searchParams">
    <template #FILE_NAME="{scope}">
      <span class="underline"
            @click="drillCol(scope.row)">{{ scope.row.FILE_NAME }}</span>
    </template>
  </P8TableRender>
</template>

<script>
export default {
  name: 'demandChart',
  props: {
    drillParam: {
      type: Object
    },
    reportParam: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      tableCode: 'documentList',
      provideParams: {
        searchParams: {}
      }
    }
  },
  computed: {
    computedReportParam () {
      return {
        ...this.reportParam,
        outPutType: this.drillParam?.outPutType?.valeue || null
      }
    }
  },
  components: {
  },
  beforeMount () { },
  mounted () { },
  destroyed () {
  },
  methods: {
    drillCol (item) {
      this.$download(item.IO_ID,item.FILE_NAME)
    }
  },
}

</script>
<style lang='scss' scoped>
</style>
