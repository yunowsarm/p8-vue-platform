<template>
  <list-layout :header-visible="false">
    <template #center>
      <common-table v-if="columns.length" ref="table" :params="queryParam" api="formGenerator.getSqlexecute" :columns="columns" :pagination="true"></common-table>
    </template>
  </list-layout>
</template>
<style lang="scss" scoped></style>
<script>
import { P8Table as CommonTable, P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'TabsNavigationPreview',
  props: {
    sql: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogHeight: document.documentElement.clientHeight * 0.5,
      queryParam: { sql: this.sql },
      columns: []
    }
  },
  components: {
    ListLayout,
    CommonTable
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.$api['formGenerator.getSqlexecute']({ page: { current: 1, size: 1, orders: [] }, sql: this.sql }).then((res) => {
        const data = res.records
        const columns = []
        if (data && data.length) {
          Object.keys(data[0]).forEach((el) => {
            columns.push({
              title: el,
              dataIndex: el,
              align: 'center'
            })
          })
        }
        console.log(columns, '===columns')
        this.columns = columns
      })
    }
  }
}
</script>
