<template>
  <form-table ref="formtable"
              :formData="formData"
              :formType="formType"
              :tableApi="tableApi"
              :tableParams="tableParams"
              :columns="columns"
              :tabsName="tabsName"
              @submit="deviateSubmit"></form-table>
</template>
<script>
import FormTable from './FormTable'
import moment from 'moment'
export default {
  name: 'Deviate',
  components: {
    FormTable
  },
  props: {
    tabsName: {
      type: String
    }
  },
  inject: ['getPlanInfo'],
  computed: {
    planInfoParams () {
      return this.getPlanInfo()
    }
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '55px',
        align: 'center'
      },
      {
        title: '未完成原因分类',
        dataIndex: 'deviationTypeDisplay',
        width: '120',
        align: 'center'
      },
      {
        title: '未完成原因',
        dataIndex: 'deviationCauses',
        columnConfig: { // 表格列内容过长隐藏并显示Tooltip
          'show-overflow-tooltip': true
        },
        align: 'left'
      },
      {
        title: '偏离影响',
        dataIndex: 'deviationImpact',
        columnConfig: { // 表格列内容过长隐藏并显示Tooltip
          'show-overflow-tooltip': true
        },
        align: 'left'
      },
      {
        title: '进展情况',
        dataIndex: 'deviationProgress',
        columnConfig: { // 表格列内容过长隐藏并显示Tooltip
          'show-overflow-tooltip': true
        },
        align: 'left'
      },
      {
        title: '解决方案',
        dataIndex: 'solutions',
        columnConfig: { // 表格列内容过长隐藏并显示Tooltip
          'show-overflow-tooltip': true
        },
        align: 'left'
      },
      {
        title: '反馈时间',
        dataIndex: 'itemCreateTime',
        align: 'left'
      }
    ]
    return {
      formType: {
        constType: 'Deviate',
        overdue: false
      },
      formData: {
        deviationType: '',
        deviationTypeDisplay: '',
        deviationCauses: '', // 偏离原因
        deviationImpact: '', // 偏离影响
        deviationProgress: '',
        solutions: '' // 偏离备注,
      },
      tableApi: 'taskManager.deviationReasonsHistory',
      tableParams: { taskId: this.getPlanInfo().TASKID },
      id: '',
      columns
    }
  },
  mounted () {
    this.getLastHistory()
  },
  methods: {
    getLastHistory () {
      const _this = this
      this.$api[this.tableApi]({
        taskId: _this.getPlanInfo().TASKID
      }).then(res => {
        if (res && res[0] && res[0].id) {
          _this.id = res[0].id
        }
        if (res && res.length) {
          let data = res[0]
          Object.keys(_this.formData).forEach(key => {
            _this.formData[key] = data[key]
          })
        }
      })
    },
    deviateSubmit (form) {
      let params = this.submitParamsHandle(form)
      let that = this
      this.$api['taskManager.deviationReasons'](params).then(res => {
        if (res) {
          that.$message({
            message: '偏离原因提交成功！',
            type: 'success'
          })
          that.setMessage(form)
        }
      })
    },
    setMessage (formData) {

      let obj = Object.assign({}, formData)
      obj.planName = this.getPlanInfo().PLANNAME
      obj.name = this.getPlanInfo().NAME
      obj.deviationProgress = obj.progress
      obj.taskId = this.getPlanInfo().taskId
      obj.type = '2'
      let params = {
        itemCreateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        sendUser: this.$store.state.user.userId,
        sendUserName: this.$store.state.user.userName,
        content: '',
        entityId: this.getPlanInfo().WHOLEDESCRIBEID,
        entityType: 'project',
        taskRequest: obj
      };
      window.myWebSocket.emit('taskCommitByData', params)
    },
    submitParamsHandle (form) {
      let _this = this
      let deviate = ['deviationType', 'deviationCauses', 'deviationImpact', 'deviationProgress', 'solutions']
      let params = {
        pmTaskDeviationCauses: {
          planInfoId: _this.planInfoParams.PLANINFOID,
          pmProjectTasksId: _this.planInfoParams.TASKID,
          id: _this.id
        }
      }
      deviate.forEach(key => {
        if (key === 'deviationProgress') {
          params.pmTaskDeviationCauses.progress = form[key]
        } else {
          params.pmTaskDeviationCauses[key] = form[key]
        }
      })
      return params
    }
  }
}
</script>
<style lang="scss">
</style>
