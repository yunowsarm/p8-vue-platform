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
        type: 'datetimeRange',
        labelText: '预计起止日期',
        fieldName: 'beginEndTime',
        colLayout: 'singleCol',
        placeholder: ['开始日期', '完成日期'],
        fieldConfig: {
          style: 'width: 100%',
          'value-format': 'yyyy-MM-dd'
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
        beginEndTime: [],
        content: ''
      },
      saveApi: 'taskManager.progressFeedback'
    }
  },
  watch: {

  },
  mounted () {
    let _this = this
    this.$api['taskManager.taskInfo']({ taskId: _this.planInfoParams.TASKID }).then(res => {
      this.formData.beginEndTime = [res.forecastBeginDate, res.forecastEndDate]
      this.formData.content = res.content
    })
  },
  methods: {
    customValidate () {
      let obj = {
        pmTaskProgressFeedback: {
          forecastBeginDate: this.formData.beginEndTime[0],
          forecastEndDate: this.formData.beginEndTime[1],
          content: this.formData.content,
          planInfoId: this.planInfoParams.PLANINFOID,
          pmProjectTasksId: this.planInfoParams.TASKID,
          status: this.planInfoParams.STATUS
        }
      }
      this.$api['taskManager.progressFeedback'](obj).then(res => {
        this.$message.success('保存成功')
      })
    }
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
