<template>
  <list-layout :headerVisible="false">
    <template #center>
      <P8TableRender ref="tableRender"
                     code="problemManagement"
                     specialRoteName='problem_management'
                     :west-tree-param="reportParam"
                     :report-param="reportParam"
                     @sendProblem="sendProblem"></P8TableRender>
    </template>
    <template #drawer-panel>
      <common-dialog :title="drawerTitle"
                     v-if="dialogVisible"
                     :visible="dialogVisible"
                     :show-handle-btn="false"
                     width="40%"
                     class="commonDialog"
                     @close="onEditViewSecretLevelClose">
        <template #dialog>
          <P8FormDataEdit :record="{ desformCode: codeForm }"
                          :prop-param="propParam"
                          v-bind="$attrs"
                          @saveForm="saveForm" />
        </template>
      </common-dialog>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'problemManagement',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {

    return {
      comp: this,
      drawerTitle: '派发',
      dialogVisible: false,
      record: {},
      propParam: {},
      codeForm: 'issueDistribution',
      selectRows: [],
      reportParam: {
        LINKED_ITEM_WHOLE: this.row[0] ? this.row[0].WHOLE_ID : null
      }
    }
  },
  methods: {
    onEditViewSecretLevelClose () {
      this.dialogVisible = false
      this.selectRows = []
    },
    sendProblem (rows) {
      console.log("🚀 ~ sendProblem ~ rows11111111111111111:", rows)
      this.selectRows = rows
      if (rows && rows.length) {
        this.dialogVisible = true
      } else {
        this.$message({ type: 'warning', message: '请选择数据' })
      }
    },
    saveForm (formData) {
      let form = formData.primary.table
      let ids = this.selectRows.map(el => el.ID)
      let param = {
        owner: form.OWNER,
        verifier: form.VERIFIER,
        copyTo: form.COPY_TO,
        deadline: form.DEADLINE,
        ids: ids
      }
      this.$api['qualityIssues.issueDistribution'](param).then(res => {
        if (res) {
          this.$message({ type: 'success', message: '派发成功!' })
          this.onEditViewSecretLevelClose()
          this.$refs.tableRender.CloseAndRefresh()
        }
      })
    }
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDialog,
  }
}
</script>
<style lang="scss" scoped>
.commonDialog ::v-deep .el-dialog__body {
  padding: 0;
}
</style>
