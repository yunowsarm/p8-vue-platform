<template>
  <div>
    <common-dialog :visible="visible"
                   width="70%"
                   @close="handleCancel"
                   :show-handle-btn="false"
                   :dialog-config="dialogConfig"
                   :close-on-click-modal="false"
                   :close-on-press-escape="false">
      <template #dialog>
        <common-table ref="table"
                      :style="{ height: dialogHeight - 60 + 'px' }"
                      :comp="comp"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :pagination="false"
                      @select="select"
                      :table-config="tableConfig"
                      @row-click="rowClick"
                      @row-dblclick="rowDblclick"></common-table>
        <div style="float: right; padding-right: 20px">
          <el-button type="primary"
                     @click="save">确定</el-button>
        </div>
      </template>
    </common-dialog>
  </div>
</template>

<script>
import { P8Dialog as CommonDialog, P8Table as CommonTable, Button } from 'p8-components-ui'

import { getTableHeightInDialog } from '@/utils/common'

export default {
  name: 'SelectProjectClassify',
  components: {
    CommonTable,
    CommonDialog,
    'el-button': Button
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    record: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    const columns = [
      {
        title: '',
        type: 'selection',
        width: 45,
        align: 'center',
        headerAlign: 'center'
      },
      {
        title: '序号',
        type: 'index',
        width: 45,
        align: 'center'
      },
      {
        title: '项目类别/类型名称',
        dataIndex: 'name',
        align: 'left'
      }
    ]
    return {
      dialogConfig: {
        modal: true,
        appendToBody: true,
        modalAppendToBody: true
      },
      isCustomValidate: true,
      visibleHandlerName: false,
      dialogHeight: getTableHeightInDialog(),
      comp: this,
      queryParam: {},
      columns: columns,
      tableApi: 'baseData.classifyTreeData',
      tableConfig: {
        highlightCurrentRow: true,
        showOverflowTooltip: true
      },
      selectedRow: [],
      formData: {}
    }
  },
  methods: {
    handleCancel () {
      this.$emit('close-field')
    },
    select (selection, row) {
      if (row.children !== null) {
        row.children.forEach((v) => {
          if (v.children != null) {
            v.children.forEach((c) => {
              this.$refs.table.$refs.table.toggleRowSelection(c)
              let isRepeat = 0
              this.selectedRow.forEach((value, index) => {
                if (value.id === c.id) {
                  isRepeat = 1
                  this.$refs.table.$refs.table.toggleRowSelection(c, false)
                  this.selectedRow.splice(index, 1)
                }
              })
              if (isRepeat !== 1) {
                this.selectedRow.push(c)
              }
            })
          } else {
            this.$refs.table.$refs.table.toggleRowSelection(v)
            let isRepeat = 0
            this.selectedRow.forEach((value, index) => {
              if (value.id === v.id) {
                isRepeat = 1

                this.$refs.table.$refs.table.toggleRowSelection(v, false)
                this.selectedRow.splice(index, 1)
              }
            })
            if (isRepeat !== 1) {
              this.selectedRow.push(v)
            }
          }
        })
      } else {
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
        let isRepeat = 0
        this.selectedRow.forEach((value, index) => {
          if (value.id === row.id) {
            isRepeat = 1
            this.$refs.table.$refs.table.toggleRowSelection(row, false)
            this.selectedRow.splice(index, 1)
          }
        })
        if (isRepeat !== 1) {
          this.selectedRow.push(row)
        }
      }
    },
    // 单击选中行
    rowClick (row, column, event) {
      // this.$refs.table.$refs.table.toggleRowSelection(row)
      // this.selectedRow.push(row)
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblclick (row, column, event) {
      // this.$refs.table.$refs.table.clearSelection()
      // this.$refs.table.$refs.table.toggleRowSelection(row)
      // this.selectedRow = row
      // this.save()
    },
    save () {
      let that = this
      let data = {
        parentId: that.record.id,
        projectClassify: that.selectedRow
      }
      if (that.selectedRow && that.selectedRow.length > 0) {
        this.$api['basicDataRelation.relatedProjectClassify'](data).then(function (res) {
          if (res === true) {
            that.$message({
              message: '关联成功',
              type: 'success'
            })
            that.$emit('saveCallback')
          } else if (res === 'repeat') {
            that.$message({
              message: '关联重复',
              type: 'warning'
            })
          } else {
            that.$message({
              message: '关联失败',
              type: 'warning'
            })
          }
        })
      }
    },
    repeat (row) { }
  }
}
</script>

<style scoped></style>
