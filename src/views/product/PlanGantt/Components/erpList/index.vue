<template>
  <div>
    <erp-qt-index v-if="isShowQTView" :plan-type-param="planTypeParam" :attention-erp-tasks="attentionErpTasks" @close-modal="closeModal"></erp-qt-index>
    <erp-task-index v-if="isShowTaskView" :plan-type-param="planTypeParam" :attention-erp-tasks="attentionErpTasks" @close-modal="closeModal"></erp-task-index>
    <erp-bl-index v-if="isShowBLView" :plan-type-param="planTypeParam" :attention-erp-tasks="attentionErpTasks" @close-modal="closeModal"></erp-bl-index>
  </div>
</template>
<script>
import ErpQtIndex from './Components/erpQTIndex'
import ErpTaskIndex from './Components/erpTaskIndex'
import ErpBlIndex from './Components/erpBLIndex'

export default {
  name: 'ErpList',
  components: {
    ErpQtIndex,
    ErpTaskIndex,
    ErpBlIndex
  },
  props: {
    planTypeParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      isShowQTView: false,
      isShowTaskView: false,
      isShowBLView: false,
      attentionErpTasks: []
    }
  },
  created() {
    const that = this
    if (this.planTypeParam && Object.keys(this.planTypeParam)) {
      const taskName = this.planTypeParam.taskName
      const planType = this.planTypeParam.planType
      this.$api['erpTask.selectAttentionErpTask'](this.planTypeParam).then((res) => {
        if (res && res.length > 0) {
          res.forEach(function (row, idx) {
            that.attentionErpTasks.push(row.erpId)
          })
        }
        if (taskName.indexOf('备料') !== -1 && planType === '310301') {
          this.isShowBLView = true
        } else if (taskName.indexOf('齐套') !== -1 && planType === '310302') {
          this.isShowQTView = true
        } else {
          this.isShowTaskView = true
        }
      })
    }
  },
  methods: {
    closeModal(tableSelectValue) {
      const erpTaskId = []
      if (tableSelectValue && tableSelectValue.length > 0) {
        tableSelectValue.forEach(function (row, idx) {
          erpTaskId.push(row.id)
        })
      }
      this.$api['erpTask.saveAttentionErpTask']({ ...this.planTypeParam, erpTaskId: erpTaskId, oldErpTaskIds: this.attentionErpTasks }).then((res) => {
        if (res) {
          this.$emit('save-success', tableSelectValue.length)
        }
      })
    }
  }
}
</script>
