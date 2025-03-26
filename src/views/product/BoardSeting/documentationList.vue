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
    reportParam:{
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
    computedReportParam() {
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
      this.$api['documentManagement.download']({ attachmentId: item.IO_ID }, { responseType: 'blob' })
        .then((backJson) => {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = row.FILE_NAME
          document.body.appendChild(link)

          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
        .finally(() => {
          // this.search.exportLoading = false
        })
    }
  },
}

</script>
<style lang='scss' scoped>
</style>
