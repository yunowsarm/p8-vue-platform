<template>
  <div>
    <common-dialog
      :title="title"
      :visible="visible"
      destroy-on-close
      @close="handleCancel"
      width="70%"
      :show-handle-btn="false"
      :dialog-config="dialogConfig"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <template #dialog>
        <form-list ref="form" @rendered="rendered" :form="formData" @saved="saved" :data-source="dataSource" :api="saveApi">
          <template #productInfoId>
            <el-input v-model="formData.productInfoId" @click.native="visibleInfoID = true"> </el-input>
          </template>
        </form-list>
      </template>
    </common-dialog>
    <select-product-info v-if="visibleInfoID" :visible="visibleInfoID" @close-dialog="closeVisibleInfo"></select-product-info>
  </div>
</template>
<script>
import { P8Form as FormList, P8Dialog as CommonDialog, Input } from 'p8-components-ui'

import SelectProductInfo from './component/selectProductInfo'

export default {
  name: 'SaveProduct',
  components: {
    SelectProductInfo,
    FormList,
    CommonDialog,
    'el-input': Input
  },
  props: {
    record: {
      type: Object
    },
    visible: {
      type: Boolean
    },
    title: {
      type: String
    }
  },
  data() {
    return {
      saveApi: 'productTask.productTaskEditSave',
      dataSource: [
        {
          type: 'view',
          labelText: '任务名称',
          fieldName: 'taskName',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          labelText: '批次号',
          fieldName: 'batchNumber',
          colLayout: 'doubleCol'
        },
        {
          type: 'blank',
          labelText: '图号',
          fieldName: 'productInfoId',
          slotName: 'productInfoId',
          colLayout: 'doubleCol',
          placeholder: '请选择图号',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: '数量',
          fieldName: 'amount',
          colLayout: 'doubleCol'
        },
        {
          type: 'select',
          labelText: '完成形式',
          fieldName: 'finishType',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'PRODUCT_FINISH_COMPLETION' }
          },
          options: [],
          rules: [{ required: true, message: '必填' }]
        },
        {
          type: 'text',
          labelText: '产品名称',
          fieldName: 'name',
          colLayout: 'doubleCol'
        },
        {
          type: 'select',
          labelText: '计量单位',
          fieldName: 'unit',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'PRODUCT_METER_UNIT' }
          },
          options: [],
          rules: [{ required: true, message: '必填' }]
        },
        {
          type: 'text',
          labelText: '产品代号',
          fieldName: 'productCode',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          labelText: '配合部门',
          fieldName: 'matchDept',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          labelText: '同步状态',
          fieldName: 'customItem2',
          colLayout: 'doubleCol'
        }
      ],
      formData: {},
      visibleInfoID: false,
      dialogConfig: {
        modal: true,
        appendToBody: true,
        modalAppendToBody: true
      }
    }
  },
  mounted() {},
  methods: {
    saved(res) {
      this.$emit('save-success', res)
    },
    rendered() {
      this.formData.taskName = 'this.record.name'
      this.formData.projectTasksId = 'this.record.id'
      this.formData = Object.assign({}, this.formData)
      if (this.record && this.record !== '') {
        this.formData.taskName = this.record.name
        this.formData.projectTasksId = this.record.id
        this.formData = Object.assign({}, this.formData)
      }
    },
    closeVisibleInfo(selectedRows) {
      this.visibleInfoID = false
      if (selectedRows) {
        this.formData.productInfoId = selectedRows.mapCode
        this.formData.name = selectedRows.mapName
        this.formData = Object.assign({}, this.formData)
      }
    },
    handleCancel(e) {
      this.$emit('close-modal')
    }
  }
}
</script>

<style scoped></style>
