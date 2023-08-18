<template>
  <common-dialog
    title="选择人员"
    :visible="visible"
    :dialog-config="dialogConfig"
    :dialog-height="dialogHeight"
    @isfullscreen="handleFullscreen"
    @handle-cancel="handleCancel"
    @handle-ok="handleOk"
    @close="handleCancel"
  >
    <template #dialog>
      <normal-layout :normal-layout="normalLayout" :split-default-left-width="35" v-bind="normalLayoutConfig">
        <template #north>
          <el-input placeholder="请输入人员姓名进行搜索" size="mini" v-model="userParam.userName" style="width: 250px"></el-input>
          <el-button style="margin-left: 8px" icon="search" size="mini" type="primary" @click="search">搜索</el-button>
          <el-button style="margin-left: 8px" size="mini" @click="reSet">重置</el-button>
        </template>
        <template #west>
          <common-tree
            :tree-api="treeOptions.treeApi"
            :tree-param="treeOptions.treeParam"
            :disabled-row="treeOptions.disabledRow"
            :default-expand-all="treeOptions.defaultExpandAll"
            :default-expanded-keys="treeOptions.defaultExpandedKeys"
            @initTreeData="initTreeData"
            @select="onSelect"
            :tree-config="treeOptions.treeConfig"
          ></common-tree>
        </template>
        <template #center>
          <common-table
            ref="table"
            :table-config="tableConfig"
            :columns="columns"
            :params="queryParam"
            :api="tableApi"
            :pagination="true"
            :is-radio-select="getRadioSelect"
            @requested-table-data="handleRequested"
            @select="select"
            @select-all="selectAll"
            @row-click="rowClick"
            @row-dblclick="rowDblClick"
          ></common-table>
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<script>
import { Input, Button } from 'element-ui'
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Dialog as CommonDialog, P8Table as CommonTable } from 'p8-components-ui'

export default {
  name: 'P8SelectUser',
  componentName: 'P8SelectUser',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    normalLayout: {
      type: Object,
      default: () => {
        return {
          west: {
            xs: 10,
            sm: 9,
            md: 8,
            lg: 7,
            xl: 6
          },
          center: {
            xs: 14,
            sm: 15,
            md: 16,
            lg: 17,
            xl: 18
          }
        }
      }
    },
    normalLayoutConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disabledRow: {
      type: Array,
      default: () => []
    },
    selectRows: {
      type: Array,
      default: () => []
    },
    otherParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selectType: {
      type: String,
      default: '0'
    },
    dialogConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dialogHeight: {
      type: Number,
      default: 474
    },
    tableConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    treeOptions: {
      type: Object,
      default: () => {
        return {
          treeApi: 'userManager.deptTree',
          treeParam: {},
          disabledRow: ['1'],
          defaultExpandAll: true,
          defaultExpandedKeys: ['1'],
          treeConfig: {
            'expand-on-click-node': false,
            'check-on-click-node': true
          }
        }
      }
    }
  },
  data() {
    return {
      flexHeight: '350px',
      queryParam: {
        userName: null,
        departmentId: null
      },
      userParam: {
        userName: ''
      },
      data: [], // 列表数据
      checkedGh: [],
      page: {
        current: 1,
        size: 10,
        total: 0,
        orders: []
      }, // 分页
      selectedRow: null,
      selectedRows: [],
      reserveSelection: true,
      tableApi: 'userManager.list',
      columns: [
        {
          title: '',
          width: 35,
          type: 'selection',
          selectable: (row, index) => {
            return this.checkSelect(row, index)
          }
        },
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center'
        },
        {
          title: '用户名',
          dataIndex: 'realName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '所属部门',
          dataIndex: 'departmentName',
          minWidth: 260,
          align: 'center'
        }
      ]
    }
  },
  components: {
    'el-input': Input,
    'el-button': Button,
    NormalLayout,
    CommonTree,
    CommonDialog,
    CommonTable
  },
  computed: {
    getRadioSelect() {
      if (this.selectType === '0') {
        return false
      } else {
        return true
      }
    }
  },
  mounted() {},
  methods: {
    handleFullscreen() {},
    handleCancel() {
      this.$refs.table.clearSelection()
      this.selectedRow = null
      this.selectedRows = []
      this.$emit('close-dialog', this.selectedRows, this.otherParam)
    },
    handleOk(e) {
      this.$emit('close-dialog', this.selectedRows, this.otherParam)
    },
    initTreeData(data) {
      this.$emit('initTreeData', data)
    },
    onSelect(obj) {
      this.queryParam.departmentId = obj.id
    },
    select(selection, row) {
      this.selectedRow = row
      this.selectedRows = selection
    },
    selectAll(selection) {
      this.selectedRows = selection
    },
    // 单击选中行
    rowClick(row, column, event) {
      let check = this.isCheck(this.disabledRow, row)
      if (check) {
        if (this.getRadioSelect) {
          let checkRow = row
          let checkRows = [row]
          if (!this.selectedRow) {
            this.$refs.table.toggleRowSelection(row)
          } else if (this.selectedRow && this.selectedRow.id === row.id) {
            checkRow = null
            checkRows = []
            this.$refs.table.setCurrentRow()
            this.$refs.table.toggleRowSelection(row)
          } else {
            this.$refs.table.clearSelection()
            this.$refs.table.toggleRowSelection(row)
          }
          this.selectedRow = checkRow
          this.selectedRows = checkRows
        }
      }
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblClick(row, column, event) {
      let check = this.isCheck(this.disabledRow, row)
      if (check) {
        this.$refs.table.clearSelection()
        this.$refs.table.toggleRowSelection(row)
        this.selectedRows[0] = row
        this.handleOk()
      }
    },
    checkSelect(row, index) {
      if (this.disabledRow.includes(row.id)) {
        return false
      } else {
        return true
      }
    },
    handleRequested(data) {
      let selectRows = this.selectRows
      data.forEach((item, idx) => {
        selectRows.forEach((el) => {
          if (el === item.id) {
            let isCheck = this.selectedRows.some((i) => {
              return i.id === el
            })
            if (!isCheck) {
              this.$refs.table.toggleRowSelection(item, true)
            }
          }
        })
      })
    },
    search() {
      this.queryParam.userName = this.userParam.userName
    },
    reSet() {
      this.queryParam.userName = ''
      this.userParam.userName = ''
    },
    isCheck(disabledRow, row) {
      if (disabledRow.includes(row.id)) {
        return false
      } else {
        return true
      }
    }
  }
}
</script>
