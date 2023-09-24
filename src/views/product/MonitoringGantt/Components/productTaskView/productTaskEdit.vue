<template>
  <common-dialog
    :title="title"
    :visible="visible"
    destroy-on-close
    @close="handleCancel"
    width="60%"
    :dialog-height="350"
    :show-handle-btn="false"
    :dialog-config="dialogConfig"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #dialog>
      <form-list ref="form" @rendered="rendered" :form="formData" @saved="saved" :data-source="dataSource" :api="saveApi">
        <template #mapCode>
          <el-input v-model="formData['mapCode']" readonly autosize placeholder="请选择图号" @click.native="showModal()">
            <i class="el-icon-link" slot="suffix" type="link" :style="{ cursor: 'pointer', fontSize: '16px', color: '#08c' }"></i>
          </el-input>
        </template>
      </form-list>
      <select-product v-if="productVisible" :visible="productVisible" :selected-product-info-id="selectedProductInfoId" @close-modal="closeModal"></select-product>
    </template>
  </common-dialog>
</template>

<style scoped></style>

<script>
import { P8Form as FormList, Input, P8Dialog as CommonDialog } from 'p8-components-ui'

import SelectProduct from './selectProduct'
export default {
  name: 'ProductTaskEdit',
  components: {
    'el-input': Input,
    FormList,
    SelectProduct,
    CommonDialog
  },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    taskName: {
      type: String,
      default: ''
    },
    planInfoId: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean
    },
    title: {
      type: String,
      default: '填写生产计划'
    }
  },
  data() {
    return {
      saveApi: 'productTask.productTaskEditSave',
      productVisible: false,
      selectedProductInfoId: '',
      dataSource: [
        {
          type: 'view',
          labelText: '任务名称',
          fieldName: 'taskName',
          colLayout: 'doubleCol'
        },
        {
          type: 'hidden',
          fieldName: 'id'
        },
        {
          type: 'hidden',
          fieldName: 'projectTasksId'
        },
        {
          type: 'hidden',
          fieldName: 'planInfoId'
        },
        {
          type: 'text',
          labelText: '批次号',
          fieldName: 'batchNumber',
          placeholder: '请输入批次号',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '图号',
          slotName: 'mapCode',
          fieldName: 'mapCode',
          placeholder: '请选择图号',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'select',
          labelText: '完成形式',
          fieldName: 'finishType',
          colLayout: 'doubleCol',
          placeholder: '请选择完成形式',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'FINISH_TYPE' }
          },
          options: []
        },
        {
          type: 'view',
          labelText: '产品名称',
          fieldName: 'name',
          colLayout: 'doubleCol'
        },

        {
          type: 'text',
          labelText: '数量',
          fieldName: 'amount',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          labelText: '产品代号',
          fieldName: 'productCode',
          placeholder: '请输入产品代号',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'select',
          labelText: '计量单位',
          fieldName: 'unit',
          colLayout: 'doubleCol',
          placeholder: '请选择计量单位',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'UNITS_TYPE' }
          },
          options: []
        },
        {
          type: 'text',
          labelText: '配合部门',
          fieldName: 'matchDept',
          placeholder: '请输入配合部门',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '同步状态',
          fieldName: 'guid',
          colLayout: 'doubleCol'
        }
      ],
      formData: {},
      dialogConfig: {
        modal: true,
        appendToBody: true,
        modalAppendToBody: true
      }
    }
  },
  created() {},
  methods: {
    showMessage(obj, message, type) {
      obj.$message({
        message: message,
        type: type
      })
    },
    rendered() {
      this.getProductTaskDetail()
    },
    getProductTaskDetail() {
      const that = this
      this.$api['productTask.getProductTaskDetail']({ projectTasksId: that.taskId, planInfoId: that.planInfoId })
        .then(function (res) {
          that.formData.taskName = that.taskName
          that.formData.planInfoId = that.planInfoId
          that.formData.projectTasksId = that.taskId
          const param = { ...res, ...that.formData }
          that.formData = Object.assign({}, param)
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    showModal() {
      this.selectedProductInfoId = this.formData.productInfoId
      this.productVisible = true
    },
    closeModal(row) {
      if (row && row.id) {
        this.formData.productInfoId = row.id
        this.formData.mapCode = row.mapCode
        this.formData.name = row.mapName
      }
      this.productVisible = false
    },
    saved(res) {
      this.$emit('close-dialog', res)
    },
    handleOk(e) {
      this.$emit('close-dialog')
    },
    handleCancel(e) {
      this.$emit('close-dialog')
    }
  }
}
</script>
