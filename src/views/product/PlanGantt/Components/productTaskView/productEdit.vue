<template>
  <div>
    <form-list ref="form" @rendered="rendered" :form="formData" @saved="saved" :data-source="dataSource" :api="saveApi"> </form-list>
  </div>
</template>

<style scoped></style>

<script>
import { P8Form as FormList } from 'p8-components-ui'

const dataSourceTemp = [
  {
    type: 'text',
    labelText: '产品名称',
    fieldName: 'mapName',
    placeholder: '请输入产品名称',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'text',
    labelText: '产品图号',
    fieldName: 'mapCode',
    placeholder: '请输入产品图号',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'text',
    labelText: '产品代号',
    fieldName: 'productCode',
    placeholder: '请输入产品代号',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  }
]

export default {
  name: 'ProductEdit',
  components: {
    FormList
  },
  props: {
    visible: {
      type: Boolean
    },
    title: {
      type: String
    },
    productId: {
      type: String
    }
  },
  data() {
    return {
      confirmLoading: false,
      saveApi: 'productInfo.productInfoSave',
      dataSource: [],
      formData: {}
    }
  },
  created() {
    this.formTrigger()
  },
  methods: {
    formTrigger() {
      this.dataSource = Object.assign([], dataSourceTemp)
    },
    showMessage(obj, message, type) {
      obj.$message({
        message: message,
        type: type
      })
    },
    rendered() {
      if (this.productId && this.productId !== '') {
        this.getProductInfo(this.productId)
      }
    },
    getProductInfo(productId) {
      const that = this
      this.$api['productInfo.getProductInfo']({ id: productId })
        .then(function (res) {
          that.formData = Object.assign({}, res)
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    saved(res) {
      this.$emit('save-success', res)
    },
    handleOk(e) {
      this.$emit('close-modal')
    },
    handleCancel(e) {
      this.$emit('close-modal')
    }
  }
}
</script>
