<template>
  <common-dialog title="人员选择"
                 class="dialogSelectUser"
                 :width="dialogWidth + 'px'"
                 :dialogHeight="dialogHeight"
                 v-if="visibleDislogMember && visible"
                 :visible="visibleDislogMember"
                 :dialogConfig="dialogConfig"
                 @handle-cancel="dialogMemberCancel"
                 @handle-ok="dialogMemberOk"
                 @close="dialogMemberCancel"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <normal-layout :normalLayout="normalLayout"
                     class="userSelect">
        <template #north>
          <div class="search-con">
            <div class="input-con"
                 :style="{width: 'calc(45% - 31px)'}">
              人员姓名:
              <el-input :style="{width: 'calc(100% - 70px)'}"
                        class="input-name"
                        placeholder="请输入人员姓名进行搜索"
                        clearable
                        v-model="userName"
                        size="mini"></el-input>
            </div>
            <div class="search-btn">
              <el-button icon="search"
                         size="mini"
                         type="primary"
                         @click="search">搜索</el-button>
            </div>
          </div>
        </template>
        <template #west>
          <div>
            <common-tree ref="tree"
                         v-if="visible"
                         :treeParam="treeParam"
                         :tree-api="treeApi"
                         :defaultExpandAll="defaultExpandAll"
                         :defaultExpandedKeys="defaultExpandedKeys"
                         @select="onSelect"
                         :treeConfig="treeConfig"></common-tree>
          </div>
        </template>
        <template #center>
          <!-- <div class="table-con"> -->
          <common-table ref="table"
                        v-if="visible"
                        :tableSetting="false"
                        :style="{height: customHeight + 'px'}"
                        :columns="columns"
                        :disabled-check-all="true"
                        :params="queryParam"
                        :api="tableApi"
                        :isRadioSelect="isRadioSelect"
                        @selection-change="handleTableSelectionChange"
                        @requested-table-data="requestedTableData">
          </common-table>
          <!-- </div> -->
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<script>
import { P8NormalLayout as NormalLayout, P8Dialog as CommonDialog, P8Tree as CommonTree, P8Table as CommonTable, Input, DatePicker } from 'p8-components-ui'

import moment from 'moment'
export default {
  name: 'DialogSelectMember',
  props: {
    visibleDislogMember: {
      type: Boolean,
      default: false
    },
    isRadioSelect: {
      type: Boolean,
      default: false
    },
    existsData: {
      type: Array
    },
    loginFlag: {
      type: String,
      required: true
    },
    selectRoleId: {
      type: String,
      default: ''
    },
    loadingUserDeptStrategy: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      visible: false,
      normalLayout: {
        west: {
          xs: 8, sm: 8, md: 8, lg: 8, xl: 8
        },
        center: {
          xs: 16, sm: 16, md: 16, lg: 16, xl: 16
        }
      },
      columns: [
        {
          title: '',
          type: 'selection',
          reserveSelection: true,
          selectable: (row, index) => {
            if (this.existsData && this.existsData.length) {
              let data = this.existsData.filter(item => item.id === row.id)
              if (data && data.length) {
                return false
              } else {
                return true
              }
            }
            return true
          },
          width: 45,
          align: 'center',
          headerAlign: 'center',
        },
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '姓名',
          dataIndex: 'realName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '部门',
          dataIndex: 'departmentName',
          minWidth: 100,
          align: 'center'
        }],
      treeApi: 'userManager.deptTree',
      tableApi: 'userManager.list',
      userName: '',
      queryParam: {
        departmentId: '1',
        userName: '',
        // utilizationTimeRange: [moment().format('YYYY-MM-DD'), moment(new Date()).add(1, 'months').format('YYYY-MM-DD')],
        // startDate: moment().format('YYYY-MM-DD hh:mm:ss'), //  hh:mm:ss
        // endDate: moment(new Date()).add(1, 'months').format('YYYY-MM-DD hh:mm:ss'), // hh:mm:ss
        // roleId: '',
        // loadingUserDeptStrategy: ''

      },
      treeParam: {

      },
      tableSelectValue: [],
      dialogWidth: '50%',
      dialogHeight: 300,
      customHeight: 435,
      // 默认展开树节点
      defaultExpandAll: true,
      defaultExpandedKeys: ['1'],
      dialogConfig: {
        modal: true,
        'destroy-on-close': true,
        'append-to-body': true
      },
      fullscreen: false
    }
  },
  created () {
  },
  mounted () {
    this._initTableSize()
    window.addEventListener('resize', this._initTableSize)
    // this.$refs.tree.$refs.tree
  },
  beforeDestroy () {
    window.removeEventListener('resize', this._initTableSize)
  },
  methods: {
    // 默认选中页面已选的责任人
    requestedTableData (data) {
      const _this = this
      if (data.length) {
        this.$nextTick(() => {
          data.forEach((item) => {
            this.existsData.forEach(el => {
              if (item.id === el.id) {
                _this.$refs.table.$refs.table.setCurrentRow(item)
                _this.currentRow = item
                _this.$refs.table.$refs.table.toggleRowSelection(item, true)
              }
            })
          })
        })
      }
    },
    _initTableSize () {
      const vm = this
      let timer = null
      // 这里增加一个延迟保证不会触发频次不会太高,减少开销
      if (timer) return
      timer = setTimeout(() => {
        const ch = document.documentElement.clientHeight
        const cw = document.documentElement.clientWidth
        vm.dialogHeight = ch * 0.6 + 120
        vm.dialogWidth = cw * 0.5
        vm.customHeight = vm.fullscreen ? ch - 175 : vm.dialogHeight - 120
        timer = null
        vm.visible = true
      }, 300)
    },
    isfullscreen (isfullscreen) {
      this.fullscreen = isfullscreen
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 175
      } else {
        this.customHeight = this.dialogHeight - 120
      }
      this.$nextTick(() => {
        this.tableSelectValue.forEach(row => {
          this.$refs.table.$refs.table.toggleRowSelection(row)
        })
      })
    },
    search () {
      this.queryParam.userName = this.userName
      // 搜索
      // this.$refs.table.searchData()
    },
    datePickerChange (utilizationTimeRange) {

      // this.queryParam.startDate = moment(utilizationTimeRange[0]).format('YYYY-MM-DD HH:mm:ss')
      // this.queryParam.endDate = moment(utilizationTimeRange[1]).format('YYYY-MM-DD HH:mm:ss')
    },
    dialogMemberCancel () {
      this.tableSelectValue = []
      this.$emit('member-close', [])
    },
    dialogMemberOk () {
      let users = []
      if (this.isRadioSelect) {
        users = this.tableSelectValue
      } else {
        users = [...this.existsData, ...this.tableSelectValue]
      }
      const uniqueArray = users.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.id === value.id // 基于 id 字段去重
        ))
      );

      this.$emit('member-save', uniqueArray)
      this.tableSelectValue = []
    },
    onSelect (node) {
      this.queryParam.departmentId = node.id
      this.$refs.table.searchData()
    },
    handleTableSelectionChange (value) {
      this.tableSelectValue = value
    }
  },
  components: {
    NormalLayout,
    CommonDialog,
    CommonTree,
    CommonTable,
    'el-input': Input,
    'el-date-picker': DatePicker
  }
}
</script>
<style lang="scss" scpoed>
.search-con {
  display: flex;
  justify-content: space-between;
  padding-left: 15px;
  .date-range-con,
  .input-con {
    float: left;
    height: 30px;
  }
  .input-con {
    margin-left: 10px;
  }
  .search-btn {
    // float: right;
    width: 60px;
    height: 30px;
  }
}
// .el-date-editor.el-range-editor {
//   width: 200px;
// }
// .el-input--mini {
//   width: 200px !important;
// }
.table-con .small-table {
  overflow-y: auto;
}
.userSelect {
  box-sizing: border-box;
  height: 100%;
  padding: 10px;
  margin: 0;
  .normal-header {
    border-bottom: 1px solid #e1e1e1;
  }
  .normal-main .normal-center {
    height: 100%;
  }
}
.dialogSelectUser {
  .el-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
}
</style>
