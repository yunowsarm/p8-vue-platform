<template>
  <common-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    :width="dialogWidth"
    :showHandleBtn="dialogShowBtn"
    :dialogConfig="dialogConfig"
    :dialogHeight="dialogHeight"
    @close="dialogClose"
    @handle-cancel="dialogClose"
    @isfullscreen="isfullscreen"
  >
    <template #dialog>
      <P8TableRender ref="tableRender" :code="tableConfig.code" :permission-vo="tableConfig.permissionVo" :reportParam="tableConfig.sqlParam"> </P8TableRender>
    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'DialogUserTask',
  components: {
    CommonDialog
  },
  props: {
    tableConfig:{
      type:Object,
      default: () => {
        return {}
      }
    },
    dialogTitle: {
      type: String,
      default: '任务明细'
    },
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogWidth: {
      type: String,
      default: '50%'
    },
    dialogShowBtn: {
      type: Boolean,
      default: false
    },
    dialogConfig: {
      type: Object,
      default: () => {
        return {
          modal: true,
          'destroy-on-close': true,
          'append-to-body': true
        }
      }
    }
  },
  data() {
    return {
      dialogHeight: 200,
      cutomHeight: 500,
    }
  },
  mounted() {
    const dh = document.documentElement.clientHeight
    this.dialogHeight = dh * 0.6
  },
  methods: {
    dialogClose() {
      this.$emit('close')
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.cutomHeight = document.documentElement.clientHeight - 115
      } else {
        this.cutomHeight = 500
      }
    }
  }
}
</script>

<style scoped>

</style>
