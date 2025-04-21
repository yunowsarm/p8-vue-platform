<template>
  <div>
    <lock-unlock-form :plan-info-array='planInfoArray'
                      :content='content'
                      :showMonitorPoints='showMonitorPoints'
                      :monitorDutyType='monitorDutyType'
                      :monitorApi='monitorApi'
                      @close-lock-unlock='handleCancel'></lock-unlock-form>
    <span slot='footer'
          class='dialog-footer'>
    </span>
  </div>
</template>
<style lang="scss" scoped>
// .Dialog /deep/.el-dialog {
//   .el-dialog__body {
//     height: 200px;
//   }
// }
</style>
<script>

import { Dialog } from 'p8-components-ui'
import LockUnlockForm from './lockUnlockForm'

export default {
  name: 'LockUnlock',
  props: ['visible', 'content', 'showMonitorPoints', 'monitorDutyType', 'row'],
  components: {
    'el-dialog': Dialog,
    LockUnlockForm
  },
  created () {
    if (this.row.length > 0) {
      this.planInfoArray = []
      this.row.forEach(item => {
        this.planInfoArray.push(item.ID)
      })
    }
  },
  data () {
    return {
      confirmLoading: false,
      dialogHeight: 500,
      loading: false,
      bodyStyle: { paddingTop: 0, paddingLeft: 0, paddingRight: 0 },
      monitorApi: 'thirdPartInterface.loadLockUnlockFormData',
      planInfoArray: []
    }
  },
  methods: {
    handleCancel (e) {
      this.$emit('close')
    }
  }
}
</script>
