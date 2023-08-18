<template>
  <common-dialog title="预览结果" :visible="visible" :show-handle-btn="false" :dialog-height="dialogHeight" @handle-cancel="handleCancel" @close="handleCancel">
    <template #dialog>
      <list-layout :header-visible="false">
        <template #center>
           <common-table v-if="columns.length" ref="table" :params="queryParam" api="formGenerator.getSqlexecute" :columns="columns" :pagination="true"></common-table>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
</style>
<script>
import { Input, Button } from 'element-ui'
import { P8Dialog as CommonDialog, P8Table as CommonTable, P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'TabsNavigationPreview',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    sql: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogHeight: document.documentElement.clientHeight * 0.5,
      queryParam: {sql: this.sql},
      columns: []
    }
  },
  components: {
    'el-input': Input,
    'el-button': Button,
    ListLayout,
    CommonDialog,
    CommonTable
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
        this.$api['formGenerator.getSqlexecute']({page: {current: 1, size: 1, orders: []},sql: this.sql}).then(res => {
            let data = res.records
            let columns = []
            if(data && data.length){
                Object.keys(data[0]).forEach(el => {
                    columns.push({
                        title: el,
                        dataIndex: el,
                        align: 'center'
                    })
                })
            }
            console.log(columns,'===columns');
            this.columns = columns
        })
    },
    handleCancel() {
      this.$emit('close')
    }
  }
}
</script>
