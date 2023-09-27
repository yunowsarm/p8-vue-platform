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
        <form-list ref="form" @rendered="rendered" :form="formData" @saved="saved" :data-source="dataSource" :api="saveApi"> </form-list>
      </template>
    </common-dialog>
  </div>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'Edit',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    record: {
      type: String
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
      saveApi: 'productInfo.productInfoSave',
      dataSource: [
        {
          type: 'text',
          labelText: '产品名称',
          fieldName: 'mapName',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          labelText: '图号',
          fieldName: 'mapCode',
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
  methods: {
    saved(res) {
      this.$emit('save-success', res)
    },
    rendered() {
      if (this.record && this.record !== '') {
        this.$api['productInfo.getProductInfo']({ id: this.record }).then((res) => {
          this.formData = res
          this.formData = Object.assign({}, this.formData)
        })
      }
    },
    handleCancel(e) {
      this.$emit('close-modal')
    }
  }
}
</script>

<style scoped></style>
