<template>
  <div>
    <form-list ref="form"
               :dataSource="dataSource"
               :existDefaultBtn="false"
               label-width="90px"
               :form="formData">
    </form-list>
    <div class="submit">
      <el-button type="primary"
                 @click="customValidate">保存</el-button>
    </div>
  </div>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import moment from 'moment'
export default {
  name: 'meeting',
  inject: ['getPlanInfo'],
  props: {
    id: {
      type: String
    }
  },
  computed: {
    planInfoParams () {
      return this.getPlanInfo()
    }
  },
  data () {
    const dataSource = [
      {
        type: 'datetime',
        labelText: '预计开始时间',
        fieldName: 'forecastBeginDate',
        colLayout: 'singleCol',
        placeholder: '请选择预计开始时间',
        fieldConfig: {
          style: 'width: 100%',
          'value-format': 'yyyy-MM-dd',
          clearable: true,
          'picker-options': this.startPickerOptions()
        }
      },
      {
        type: 'datetime',
        labelText: '预计完成时间',
        fieldName: 'forecastEndDate',
        colLayout: 'singleCol',
        placeholder: '请选择预计完成时间',
        fieldConfig: {
          style: 'width: 100%',
          'value-format': 'yyyy-MM-dd',
          clearable: true,
          'picker-options': this.endPickerOptions()
        }
      },
      {
        type: 'textarea',
        labelText: '进度说明',
        colLayout: 'singleCol',
        placeholder: '说明内容',
        fieldName: 'content'
      }
    ]
    return {
      dataSource,
      formData: {
        forecastBeginDate: '',
        forecastEndDate: '',
        content: ''
      },
      saveApi: 'taskManager.progressFeedback'
    }
  },
  watch: {

  },
  created () {
    let _this = this
    this.$api['taskManager.taskInfo']({ taskId: _this.planInfoParams.TASKID }).then(res => {
      this.formData.content = res.content
      this.formData.forecastBeginDate = res.forecastBeginDate ? res.forecastBeginDate: ''
      this.formData.forecastEndDate = res.forecastEndDate ? res.forecastEndDate : ''
      this.formData = Object.assign({}, this.formData)
    })
  },
  methods: {
    customValidate () {
      let obj = {
        pmTaskProgressFeedback: {
          forecastBeginDate: this.formData.forecastBeginDate,
          forecastEndDate: this.formData.forecastEndDate,
          content: this.formData.content,
          planInfoId: this.planInfoParams.PLANINFOID,
          pmProjectTasksId: this.planInfoParams.TASKID,
          status: this.planInfoParams.STATUS,
          customItem1: this.planInfoParams.MANAGERSTATUS
        }
      }
      this.$api['taskManager.progressFeedback'](obj).then(res => {
        this.$message.success('保存成功')
        this.$bus.$emit('refresh')
      })
    },
    startPickerOptions () {
      return {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') > moment(this.formData.forecastEndDate).format('YYYY-MM-DD')
          return timeSpace
        }
      }
    },
    endPickerOptions () {
      return {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') < moment(this.formData.forecastBeginDate).format('YYYY-MM-DD')
          return timeSpace
        }
      }
    },
  },
  components: {
    FormList
  }
}
</script>
<style lang="scss" scoped>
.submit {
  position: absolute;
  right: 30px;
  bottom: 8px;
}
</style>
