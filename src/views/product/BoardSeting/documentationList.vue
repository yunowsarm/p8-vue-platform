<template>
  <P8TableRender ref="tableRender"
                 class="planLayout"
                 :code="tableCode"
                 :reportParam="reportParam"
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
    type: {
      type: String
    },
    rowData: {
      type: Object
    }
  },
  data () {
    return {
      tableCode: 'documentList',
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
  },
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
