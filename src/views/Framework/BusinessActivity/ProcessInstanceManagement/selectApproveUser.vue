<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="选择节点审批人"
                 :visible="isView"
                 :show-handle-btn="false"
                 :dialog-config="dialogConfig"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 width="60%"
                 @close="handleCancel"
                 :dialog-height="dialogHeight">
    <template #dialog>
      <form-list ref="form"
                 label-width="200px"
                 :data-source="selectUserDataSourceCur"
                 :api="saveApi"
                 :form="selectUserFormDataCur"
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
  name: 'SelectApproveUser',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    selectUserFormData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isSelectApproveUserView: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    selectUserDataSource: {
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
      selectUserFormDataCur: {},
      selectUserDataSourceCur: [],
      dialogHeight: 80,
      dialogConfig: {
        // beforeClose: this.handleCancel,
        // destroyOnClose: 'true',
        modal: false
      },
      isView: false
    }
  },
  mounted () {
    this.selectUserFormDataCur = Object.assign({}, this.selectUserFormData)
    this.selectUserDataSourceCur = [].concat(this.selectUserDataSource)
    console.log(this.selectUserDataSource, '====selectUserDataSource')
    this.dialogHeight = this.dialogHeight + this.selectUserDataSource.length * 50
    this.isView = this.isSelectApproveUserView
  },
  computed: {},
  methods: {
    saved (res) {
      this.$emit('close-modal')
    },
    formDataChange (formSub) { },
    customValidate (saveParams) {
      let approveUserSet = []
      Object.keys(saveParams).forEach((k) => {
        if (k && k.indexOf('task') !== -1) {
          let m = {}
          m.taskId = k.replace('task', '')
          Object.keys(saveParams).forEach((kk) => {
            if (kk && kk.indexOf('user') !== -1 && m.taskId === kk.replace('user', '')) {
              if (saveParams[kk] instanceof Array) {
                m.userId = saveParams[kk]
              } else {
                m.userId = [saveParams[kk]]
              }
            }

            if (kk && kk.indexOf('isMultiple') !== -1 && m.taskId === kk.replace('isMultiple', '')) {
              m.isMultiple = saveParams[kk]
            }
          })
          approveUserSet.push(m)
        }
      })
      let id = approveUserSet[0].userId[0]
      if (id === '') {
        this.handleCancel()
      } else {
        this.$refs.form.submitForm({ approveUserSet: approveUserSet }, this.saveApi)
      }
    },
    handleOk (e) { },
    handleCancel () {
      this.$confirm(`不指定下一节点审批人可能导致无人审批该任务，确定要继续吗？`, '警告', {
        confirmButtonText: '不指定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.isView = false
          this.$emit('close-modal')
        })
        .catch(() => {
          this.isView = false
          this.$emit('close-modal')
        })
    }
  }
}
</script>

<style scoped></style>
