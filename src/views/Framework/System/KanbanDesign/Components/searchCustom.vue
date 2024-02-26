<template>
  <common-dialog title="查询条件配置"
                 class="searchCustom"
                 :visible="visible"
                 @handle-cancel="handleCancel"
                 @handle-ok="componentsHandleOk"
                 @close="handleCancel"
                 width="60%">
    <template #dialog>
      <editable-table :columns="columns"
                      :add-row="true"
                      :data="editTableData"
                      :change-table-data="editTableData"
                      height="100%"
                      @save-param-data="saveTableData">
        <template #type="{ scope, data }">
          <el-select v-model="scope.row.type"
                     clearable
                     @change="saveTableData(data, scope)">
            <el-option label="文本框"
                       value="text"></el-option>
            <el-option label="目录组件"
                       value="select"></el-option>
            <el-option label="树组件"
                       value="treeSelect"></el-option>
            <el-option label="日期"
                       value="datetime"></el-option>
            <el-option label="时间范围"
                       value="datetimeRange"></el-option>
          </el-select>
        </template>
        <template #fieldName="{ scope }">
          <el-input v-model="scope.row.fieldName"
                    style="width: 100%"
                    clearable></el-input>
        </template>
        <template #labelText="{ scope }">
          <el-input v-model="scope.row.labelText"
                    style="width: 100%"
                    clearable></el-input>
        </template>
        <template #selectCode="{ scope, data }">
          <!-- 文本框 -->
          <div v-if="scope.row.type === 'text'">
            <el-input clearable
                      v-model="scope.row.selectCode"></el-input>
          </div>
          <!-- 目录组件 -->
          <div v-if="scope.row.type === 'select'">
            <el-select v-model="scope.row.selectCode"
                       style="width: 100%"
                       clearable
                       filterable
                       @change="saveTableData(data)">
              <el-option v-for="item in renderData"
                         :key="item.selectionCode"
                         :label="item.selectionName + '(' + item.selectionCode + ')'"
                         :value="item.selectionCode"> </el-option>
            </el-select>
          </div>
          <!-- 树组件 -->
          <div v-if="scope.row.type === 'treeSelect'">
            <el-select v-model="scope.row.selectCode"
                       style="width: 100%"
                       clearable
                       filterable
                       @change="saveTableData(data)">
              <el-option v-for="item in treeData"
                         :key="item.selectionCode"
                         :label="item.selectionName + '(' + item.selectionCode + ')'"
                         :value="item.selectionCode"> </el-option>
            </el-select>
          </div>
          <!-- 日期 -->
          <div v-if="scope.row.type === 'datetime'">
            <el-date-picker v-model="scope.row.selectCode"
                            type="date"
                            clearable
                            placeholder="选择日期"> </el-date-picker>
          </div>
          <!-- 时间范围 -->
          <div v-if="scope.row.type === 'datetimeRange'">
            <el-date-picker v-model="scope.row.selectCode"
                            type="daterange"
                            unlink-panels
                            style="width: 100%"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"> </el-date-picker>
          </div>
        </template>
        <template #searchConfig="{ scope }">
          <el-button type="text"
                     @click="settingClick(scope.row,scope.$index)">点击设置</el-button>
        </template>
      </editable-table>
      <searchConfig v-if="settingVisible"
                    :visible="settingVisible"
                    :widgets="widgets"
                    :record="record"
                    @close="settingVisible = false"
                    @saveSuccess="saveSuccess"></searchConfig>
    </template>
  </common-dialog>
</template>
<script>
import { P8EditTable as EditableTable, P8Dialog as CommonDialog } from 'p8-components-ui'
import searchConfig from './searchConfig.vue'
export default {
  name: 'SearchCustom',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Array,
      default: () => {
        return []
      }
    },
    widgets: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      settingVisible: false,
      renderData: [],
      treeData: [],
      columns: [
        {
          title: '查询模式',
          dataIndex: 'type',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询目标字段',
          dataIndex: 'fieldName',
          minWidth: 160,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询文本',
          dataIndex: 'labelText',
          minWidth: 160,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '选项组件',
          dataIndex: 'selectCode',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询设置',
          dataIndex: 'searchConfig',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        }
      ],
      reportParams: {
        tableData: []
      },
      editTableData: [],
      record: {}
    }
  },
  components: {
    EditableTable,
    CommonDialog,
    searchConfig
  },
  mounted () {
    this.$api['selection.list']({ selectionType: 1, page: { current: 1, size: -1, orders: [] } }).then((res) => {
      this.renderData = res.records
    })
    this.$api['selection.list']({ selectionType: 2, page: { current: 1, size: -1, orders: [] } }).then((res) => {
      this.treeData = res.records
    })
    const that = this
    this.$nextTick(() => {
      that.editTableData = that.editData
    })
  },
  methods: {
    saveTableData (data) {
      if (data && data.length) {
        data.forEach(el => {
          if (!el.labelText && !el.fieldName && !el.type && !el.parameterSource) {
            el.parameterSource = '报表参数'
          }
        })
      }
      this.reportParams.tableData = data
    },
    handleCancel () {
      this.$emit('close')
    },
    componentsHandleOk () {
      this.$emit('handleOk', this.reportParams.tableData)
    },
    settingClick (row, index) {
      this.index = index
      this.record = row
      this.settingVisible = true
    },
    saveSuccess (form) {
      this.reportParams.tableData[this.index].replaceFiled = form
      this.editTableData[this.index].replaceFiled = form
      this.settingVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 0;
}
</style>
