<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="预先设置审批人"
                 :visible="isView"
                 :show-handle-btn="false"
                 :dialog-config="dialogConfig"
                 @handle-cancel="handleCancel"
                 @close="handleCancel"
                 @handle-ok="handleOk"
                 width="700px"
                 :dialog-height="dialogHeight">
    <template #dialog>
      <form-list ref="form"
                 label-width="210px"
                 :data-source="selectUserBeforehandDataSourceCur"
                 :api="saveApi"
                 :form="selectUserBeforehandFormDataCur"
                 :is-custom-validate="isCustomValidate"
                 @saved="saved"
                 @custom-validate="customValidate"
                 @form-data-change="formDataChange">
      </form-list>
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
  data () {
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
  mounted () {
    // console.log(this.selectUserBeforehandDataSourceCur, this.selectUserBeforehandFormDataCur, 'selectUserBeforehandFormDataCurselectUserBeforehandFormDataCur')
    this.selectUserBeforehandFormDataCur = Object.assign({}, this.selectUserBeforehandFormData)
    this.selectUserBeforehandDataSourceCur = [].concat(this.selectUserBeforehandDataSource)
    this.dialogHeight = this.dialogHeight + this.selectUserBeforehandDataSource.length * 60
    this.isView = this.isSelectApproveUserBeforehandView
    this.selectUserBeforehandFormDataCur.signCollection = []
  },
  computed: {},
  methods: {
    saved (res) {
      this.isView = false
      this.$emit('saveSuccess')
      this.$emit('close-modal')
    },
    formDataChange (formSub) { },
    customValidate (saveParams) {
      this.isView = false
      this.$emit('commit', saveParams)
      this.$emit('saveSuccess')
      this.$emit('close-modal')
    },
    handleOk (e) {
      this.isView = false
      this.$emit('close-modal')
    },
    handleCancel (e) {
      this.isView = false
      this.$emit('close-modal')
    }
  }
}
</script>

<style scoped></style>
