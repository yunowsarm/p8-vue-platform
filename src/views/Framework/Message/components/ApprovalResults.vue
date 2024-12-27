<script>
import History from '@/views/Framework/BusinessActivity/ProcessApproval/history.vue'

export default {
  name: 'ApprovalResults',
  components: { History },
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      approvalData: null,
      isDataLoaded: false
    }
  },
  created () {
    this.getApprovalData(this.taskId)
  },
  methods: {
    async getApprovalData (taskId) {
      try {
        if (!taskId) {
          console.error('Task ID is invalid')
          return
        }

        const [data] = await this.$api['PersonalProcessApproval.getApproveContentViewUrl']({ taskId: taskId })
        debugger
        if (!data || !data.processInstanceId) {
          console.warn('Invalid or missing data from API')
          return
        }

        const { records } = await this.$api['PersonalProcessApproval.processHistoryList']({
          processInstId: data.processInstanceId,
          businessKey: data.value.businessKey || data.value.changeId,
          page: {
            current: 1,
            size: 5,
            orders: []
          }
        })
        if (records && records.length > 0) {
          const i = records.length - 1
          this.approvalData = records[i]
        } else {
          console.warn('No records found in the response')
        }

        this.isDataLoaded = true // 数据加载完成后设置标志位为 true
      } catch (error) {
        console.error('Error fetching approval data:', error)
      }
    }
  }
}
</script>

<template>
  <div>
    <History v-if="isDataLoaded" :selected-approval="approvalData" /> <!-- 根据标志位条件渲染 History 组件 -->
  </div>
</template>

<style scoped lang="scss">
/* 你的样式代码 */
</style>
