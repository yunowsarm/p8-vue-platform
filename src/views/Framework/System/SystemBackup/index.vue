<script>
import tableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import { P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'SystemBackup',
  components: {
    tableRender,
    CommonDialog
  },
  data() {
    return {
      // 表格组件的唯一标识码
      code: 'SystemBackupRecord',
      // 控制弹窗显示状态
      visible: false,
      // 弹窗标题：备份/恢复
      title: '',
      // 备注信息
      notes: '',
      // 当前选中的记录行
      selectedRow: null,
      // 表格刷新的key
      renderKey: new Date().getTime()
    }
  },
  methods: {
    // 点击备份按钮的处理函数
    backup() {
      this.title = '备份'
      this.visible = true
    },

    // 点击恢复按钮的处理函数
    recover(rows) {
      this.title = '恢复'
      this.selectedRow = rows[0]
      this.visible = true
    },

    // 弹窗确认按钮的处理函数
    handle() {
      if (this.title === '备份') {
        this.handleBackup()
      } else if (this.title === '恢复') {
        this.handleRecover()
      } else {
        this.visible = false
      }
    },

    // 执行备份操作
    async handleBackup() {
      const loading = this.$loading({
        lock: true,
        text: '正在备份',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        const res = await this.$api['systemBackup.executeBackup']({
          backupType: 'full',
          notes: this.notes
        })

        if (res) {
          this.$message.success('备份成功')
          this.resetDialog()
          this.renderKey = new Date().getTime()
        }
      } finally {
        loading.close()
      }
    },

    // 执行恢复操作
    async handleRecover() {
      const loading = this.$loading({
        lock: true,
        text: '正在恢复',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        const res = await this.$api['systemBackup.executeRestore']({
          backupId: this.selectedRow.ID,
          targetDatabase: '',
          notes: ''
        })

        if (res) {
          this.$message.success('恢复成功，请等待服务重启')
          this.resetDialog()
        }
      } finally {
        loading.close()
      }
    },

    // 重置弹窗状态
    resetDialog() {
      this.visible = false
      this.selectedRow = null
      this.notes = ''
    },

    // 取消按钮的处理函数
    handleCancel() {
      this.resetDialog()
    }
  }
}
</script>

<template>
  <div class="system-backup">
    <el-button class="backup-button" type="primary" @click="backup">备份</el-button>
    <table-render
      :key="renderKey"
      ref="tableRender"
      :code="code"
      @recover="recover"
    />
    <common-dialog
      :visible="visible"
      :title="title"
      width="500px"
      :dialog-height="200"
      @close="handleCancel"
      :show-handle-btn="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <template #dialog>
        <el-input
          v-model="notes"
          type="textarea"
          placeholder="请输入备注"
          :rows="7"
          resize="none"
        />
        <div class="dialog-footer">
          <el-button type="primary" @click="handle">确定</el-button>
        </div>
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss">
.system-backup {
  height: calc(100% - 28px);
  margin: 14px;
  border-radius: 5px;
  padding: 0 20px;
}
.backup-button{
  margin: 14px 0;
}
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

::v-deep .normal-layout .normal-main .normal-center {
  padding-left: 0;
}

::v-deep .normal-layout {
  height: calc(100% - 60px);
}
</style>
