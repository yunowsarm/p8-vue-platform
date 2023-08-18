<template>
  <common-dialog
    title="预先设置审批人"
    :visible="isView"
    :show-handle-btn="false"
    :dialog-config="dialogConfig"
    @handle-cancel="handleCancel"
    @close="handleCancel"
    @handle-ok="handleOk"
    width="700px"
    :dialog-height="dialogHeight"
  >
    <template #dialog>
      <form-list
        ref="form"
        label-width="150px"
        :data-source="selectUserBeforehandDataSourceCur"
        :api="saveApi"
        :form="selectUserBeforehandFormDataCur"
        :is-custom-validate="isCustomValidate"
        @saved="saved"
        @custom-validate="customValidate"
        @form-data-change="formDataChange"
      ></form-list>
    </template>
  </common-dialog>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'SelectApproveUserBeforehand',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    selectUserBeforehandFormData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isSelectApproveUserBeforehandView: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    selectUserBeforehandDataSource: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      saveApi: 'PersonalProcessApproval.setApproveUser',
      isCustomValidate: true,
      fullParams: {},
      selectUserBeforehandFormDataCur: {},
      selectUserBeforehandDataSourceCur: [],
      dialogHeight: 150,
      dialogConfig: {
        beforeClose: this.handleCancel,
        destroyOnClose: 'true',
        modal: false
      },
      isView: false
    }
  },
  mounted() {
    console.log(this.selectUserBeforehandDataSourceCur, this.selectUserBeforehandFormDataCur, 'selectUserBeforehandFormDataCurselectUserBeforehandFormDataCur')
    this.selectUserBeforehandFormDataCur = Object.assign({}, this.selectUserBeforehandFormData)
    this.selectUserBeforehandDataSourceCur = [].concat(this.selectUserBeforehandDataSource)
    this.dialogHeight = this.dialogHeight + this.selectUserBeforehandDataSource.length * 60
    this.isView = this.isSelectApproveUserBeforehandView
  },
  computed: {},
  methods: {
    saved(res) {
      this.isView = false
      this.$emit('saveSuccess')
      this.$emit('close-modal')
    },
    formDataChange(formSub) {},
    customValidate(saveParams) {
      this.isView = false
      this.$emit('commit', saveParams)
      this.$emit('saveSuccess')
      this.$emit('close-modal')
    },
    handleOk(e) {
      this.isView = false
      this.$emit('close-modal')
    },
    handleCancel(e) {
      this.isView = false
      this.$emit('close-modal')
    }
  }
}
</script>

<style scoped></style>
