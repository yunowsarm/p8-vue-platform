<template>
  <common-dialog
    :title="title"
    @close="handleCancel"
    :visible="visible"
    :dialog-config="dialogConfig"
    :show-handle-btn="true"
    :dialog-height="dialogHeight"
    :width="dialogWidth"
    @handle-ok="handleOk"
    @handle-cancel="handleCancel"
    @isfullscreen="isfullscreen"
  >
    <template #dialog>
      <form-list ref="form" :form="formData" :data-source="dataSource" @saved="saved" :exist-default-btn="false"> </form-list>
    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog, P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'ClassificationSelection',
  props: {
    record: {
      type: Object
    },
    visible: {
      type: Boolean
    }
  },
  components: {
    FormList,
    CommonDialog
  },
  data() {
    return {
      title: '选择任务密级',
      dialogWidth: '30%',
      dialogHeight: 200,
      currentRow: {
        secretGrade: ''
      },
      dialogConfig: {
        modal: false
      },
      formData: {
        secretGrade: ''
      },
      customHeight: 462,
      dataSource: [
        {
          type: 'select',
          labelText: '密级',
          fieldName: 'secretGrade',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'SECRET_LEVEL' }
          },
          options: []
        }
      ]
    }
  },
  methods: {
    handleOk() {
      this.currentRow.secretGrade = this.formData.secretGrade
      if (this.currentRow && Object.keys(this.currentRow).length > 0) {
        this.submit()
      } else {
        this.$message({
          message: '请选择密级！',
          type: 'warning'
        })
      }
    },
    handleCancel() {
      this.$emit('closed')
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 170
      } else {
        this.customHeight = 462
      }
    },
    saved(res) {},
    submit() {
      this.$emit('ClassificationSelect', this.currentRow)
    }
    // customValidate(saveParams){
    //
    // }
  }
}
</script>

<style></style>
