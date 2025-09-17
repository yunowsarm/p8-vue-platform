<template>
  <common-dialog :title="title"
                 :visible="visible"
                 width="350px"
                 @close="handleCancel"
                 :show-handle-btn="false"
                 :dialog-height="180">
    <template #dialog>
      <form-list ref="form"
                 label-width="50px"
                 :data-source="dataSource"
                 :form="formData"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :exist-default-btn="false"
                 :exist-custom-btn="true">
        <template #customBtn>
          <el-button type="primary"
                     @click="handleSubmit">确认</el-button>
        </template>
      </form-list>
    </template>
  </common-dialog>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  name: 'AddTabs',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    name: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    indexNo: {
      type: Number,
      default: () => {
        return 0
      }
    }
  },
  data () {
    return {
      formData: { name: '', indexNo: '' },
      dataSource: [
        {
          type: 'text',
          labelText: '名称',
          fieldName: 'name',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'number',
          labelText: '序号',
          fieldName: 'indexNo',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        }
      ]
    }
  },
  created () {
    this.formData.name = this.name
    this.formData.indexNo = this.indexNo
  },
  methods: {
    handleCancel () {
      this.$emit('handleCancel')
    },
    customValidate (saveParams) {
      this.$emit('handleOk', saveParams.name, saveParams.indexNo)
    },
    handleSubmit (e) {
      this.$refs.form.handleSubmit(e)
    }
  }
}
</script>
