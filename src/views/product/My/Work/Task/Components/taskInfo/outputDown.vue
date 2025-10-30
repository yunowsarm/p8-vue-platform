<template>
  <table-render code="outputInfo"
                :report-param="reportParam1">
                <template #FILE_NAME="{ scope }">
                    <span style="text-decoration:underline;cursor: pointer;" @click="fileDownLoad(scope.row)">{{scope.row.FILE_NAME}}</span>
                </template>
  </table-render>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender'
export default {
  name: 'NormalLayoutAndTree',
  components: {
    TableRender
  },
  props: ['reportParam'],
  data () {
    return {
      reportParam1: {
        ID: ''
      }
    }
  },
  created () {
    this.reportParam1.ID = this.reportParam.ID ? this.reportParam.ID : ''
  },
  methods: {
    fileDownLoad (row) {
        // 输出要求-文件下载
      if (row.IO_ID) {
          this.$download(row.IO_ID,row.FILE_NAME)
        }
    }
  }
}
</script>
