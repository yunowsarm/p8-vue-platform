<template>
  <common-dialog :title="customTitle(monitorName)" @close="handleCancel" :visible="visible" :dialog-config="dialogConfig" :show-handle-btn="false" :dialog-height="200">
    <template #dialog>
      <form-list
        ref="form"
        :data-source="dataSource"
        @rendered="rendered"
        :api="saveApi"
        @saved="saved"
        :is-custom-validate="isCustomValidate"
        @custom-validate="customValidate"
        :form="formData"
        :other-param="otherParam"
      >
      </form-list>
    </template>
  </common-dialog>
</template>
<style scoped></style>
<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'MonitorTimeManger',
  components: {
    FormList,
    CommonDialog
  },
  props: ['taskId', 'monitorId', 'monitorName', 'visible', 'taskName'],
  data() {
    return {
      saveApi: 'planGanttManager.monitorTimeSave',
      title: '',
      isCustomValidate: true,
      dataSource: [
        {
          type: 'hidden',
          fieldName: 'id',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          fieldName: 'name',
          labelText: '任务名称',
          colLayout: 'singleCol'
        },
        {
          type: 'datetimeRange',
          labelText: '起始时间',
          fieldName: 'beginEndTime',
          colLayout: 'singleCol',
          placeholder: ['开始日期', '完成日期'],
          rules: [{ required: true, message: '必须选择日期' }],
          fieldConfig: {
            style: 'width: 100%',
            'value-format': 'yyyy-MM-dd'
          }
        }
      ],
      dialogConfig: {
        modal: false
      },
      formData: {},
      otherParam: {}
    }
  },
  computed: {
    customTitle() {
      return function (monitorName) {
        return monitorName + ' 标识时间修改'
      }
    }
  },
  mounted() {},
  methods: {
    rendered() {
      if (this.taskId && this.taskId !== '' && this.monitorId && this.monitorId !== '') {
        this.getInfoData(this.taskId, this.monitorId)
      }
    },
    customValidate(saveParams) {
      const beginEndTime = saveParams.beginEndTime
      if (beginEndTime.length === 2) {
        saveParams.logBeginTime = beginEndTime[0]
        saveParams.logEndTime = beginEndTime[1]
        this.$refs.form.submitForm(saveParams, this.saveApi)
      } else {
      }
    },
    getInfoData(taskId, monitorId) {
      const that = this
      that.formData.name = that.taskName
      that.$api['planGanttManager.monitorTimeInfo']({ taskId: taskId, monitorId: monitorId })
        .then(function (res) {
          if (res) {
            that.formData.id = res.id
            that.formData.name = that.taskName
            that.formData.beginEndTime = [res.logBeginTime, res.logEndTime]
          }
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved(res) {
      this.$emit('save-success', res)
    },
    handleCancel() {
      this.$emit('save-success', true)
    }
  }
}
</script>
