<template>
  <common-dialog title="参数映射" :visible="visible" @handle-cancel="handleCancel" @handle-ok="handleOk" @close="handleCancel" width="40%" :dialog-height="dialogHeight">
    <template #dialog>
      <list-layout :header-visible="false">
        <template #center>
          <common-table ref="table" :columns="columns" :no-api-table-data="noApiTableData" :pagination="false" :table-setting="false">
            <template #after="{ scope }">
              <el-input v-model="scope.row.after"></el-input>
            </template>
          </common-table>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<script>
import { Input } from 'element-ui'
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog, P8Table as CommonTable } from 'p8-components-ui'
export default {
  name: 'ParamsMap',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    paramsList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dialogHeight: 320,
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center'
        },
        {
          title: '导航参数',
          dataIndex: 'before',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '映射参数',
          dataIndex: 'after',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      noApiTableData: JSON.parse(JSON.stringify(this.paramsList))
    }
  },
  components: {
    'el-input': Input,
    ListLayout,
    CommonDialog,
    CommonTable
  },
  methods: {
    handleCancel() {
      this.$emit('close')
    },
    handleOk(e) {
      this.$emit('handleOk', this.noApiTableData)
    }
  }
}
</script>
