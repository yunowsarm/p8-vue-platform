<template>
  <common-dialog title="团队人员选择"
                 :width="dialogWidth + 'px'"
                 :dialogHeight="dialogHeight"
                 v-if="visibleDislogMember"
                 :visible="visibleDislogMember"
                 :dialogConfig="dialogConfig"
                 @handle-cancel="dialogMemberCancel"
                 @handle-ok="dialogMemberOk"
                 @close="dialogMemberCancel"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <normal-layout :normalLayout="normalLayout">
        <template #north>
          <div class="search-con">
            <div class="date-range-con"
                 :style="{width: '315px'}">
              负荷分析时段:
              <el-date-picker :style="{width: 'calc(100% - 100px)'}"
                              class="date-range"
                              v-model="utilizationTimeRange"
                              unlink-panels
                              size="mini"
                              type="daterange"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期"
                              @change="datePickerChange"></el-date-picker>
            </div>
            <div class="input-con"
                 :style="{width: '250px'}">
              人员姓名:
              <el-input :style="{width: 'calc(100% - 80px)'}"
                        class="input-name"
                        placeholder="请输入人员姓名进行搜索"
                        v-model="queryParam.realName"
                        size="mini"></el-input>
            </div>
            <!-- <div class="search-btn">
              <el-button icon="search"
                         size="mini"
                         type="primary"
                         @click="search">搜索</el-button>
            </div> -->
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
                        :params="queryParam"
                        :api="tableApi"
                        @row-click="handleTableRowClick"
                        @selection-change="handleTableSelectionChange"
                        @row-dblclick="rowDblclick">
            <template #idleDaysCount="{ scope }">
              <idle-days :row="scope.row"></idle-days>
            </template>
          </common-table>
          <!-- </div> -->
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<script>
import { P8NormalLayout as NormalLayout, P8Dialog as CommonDialog, P8Tree as CommonTree, P8Table as CommonTable, Input, DatePicker } from 'p8-components-ui'

import IdleDays from './IdleDays'

import moment from 'moment'
export default {
  name: 'DialogSelectMember',
  props: {
    visibleDislogMember: {
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
  watch: {
    selectRoleId: {
      handler (val) {
        this.queryParam.roleId = val
        // this.treeParam.selectRoleId = val
      },
      immediate: true
    },
    loadingUserDeptStrategy: {
      handler (val) {
        this.treeParam.loadingUserDeptStrategy = val
        this.queryParam.loadingUserDeptStrategy = val
      },
      immediate: true
    }
  },
  data () {
    const columns = [
      {
        title: '',
        type: 'selection',
        reserveSelection: true,
        selectable: (row, index) => {
          if (this.existsData && this.existsData.length) {
            let data = this.existsData.filter(item => item.sysuserId === row.id)
            if (data && data.length) {
              return false
            } else {
              return true
            }
          }
          return true
        }
      },
      // {
      //   title: '序号',
      //   type: 'index',
      //   width: 55,
      //   align: 'center'
      // },
      {
        title: '姓名',
        dataIndex: 'realName',
        minWidth: 100,
        align: 'center'
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        minWidth: 100,
        align: 'center'
      },
      {
        title: '负荷信息',
        minWidth: 150,
        dataIndex: 'idleDaysCount',
        scopedSlots: { customRender: 'custom' },
        align: 'center'
      }
    ]
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
      columns,
      treeApi: 'userManager.deptTreeByUserDepartment',
      tableApi: 'teamManager.roleUserList',
      utilizationTimeRange: [moment().format('YYYY-MM-DD'), moment(new Date()).add(1, 'months').format('YYYY-MM-DD')],
      queryParam: {
        deptId: '',
        realName: '',
        utilizationTimeRange: [moment().format('YYYY-MM-DD'), moment(new Date()).add(1, 'months').format('YYYY-MM-DD')],
        // startDate: moment().format('YYYY-MM-DD hh:mm:ss'), //  hh:mm:ss
        // endDate: moment(new Date()).add(1, 'months').format('YYYY-MM-DD hh:mm:ss'), // hh:mm:ss
        roleId: '',
        loadingUserDeptStrategy: ''

      },
      treeParam: {
        loginFlag: this.loginFlag,
        selectRoleId: '',
        loadingUserDeptStrategy: ''
      },
      tableSelectValue: [],
      dialogWidth: '60%',
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
    let that = this
    this.$api['userManager.deptTreeByUserDepartment']({ loginFlag: this.loginFlag }).then(res => {
      // that.queryParam.deptId = res[1].id
      that.visible = true
      // that.$refs.table.searchData()
    })
  },
  mounted () {
    this._initTableSize()
    window.addEventListener('resize', this._initTableSize)
    // this.$refs.tree.$refs.tree
  },
  computed: {
    treeConfig () {
      return { 'current-node-key': this.queryParam.deptId }
    }
  },
  // destroyed () {
  //   this.selectRoleId = ''
  // },
  beforeDestroy () {
    window.removeEventListener('resize', this._initTableSize)
  },
  methods: {
    _initTableSize () {
      const vm = this
      let timer = null
      // 这里增加一个延迟保证不会触发频次不会太高,减少开销
      if (timer) return
      timer = setTimeout(() => {
        const ch = document.documentElement.clientHeight
        const cw = document.documentElement.clientWidth
        vm.dialogHeight = ch * 0.6 + 120
        vm.dialogWidth = cw * 0.6
        vm.customHeight = vm.fullscreen ? ch - 175 : vm.dialogHeight - 120
        timer = null
      }, 300)
    },
    isfullscreen (isfullscreen) {
      this.fullscreen = isfullscreen
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 175
      } else {
        this.customHeight = this.dialogHeight - 120
      }
    },
    search () {
      // 搜索
      this.$refs.table.searchData()
    },
    datePickerChange (utilizationTimeRange) {
      this.queryParam.utilizationTimeRange = utilizationTimeRange
      // this.queryParam.startDate = moment(utilizationTimeRange[0]).format('YYYY-MM-DD HH:mm:ss')
      // this.queryParam.endDate = moment(utilizationTimeRange[1]).format('YYYY-MM-DD HH:mm:ss')
    },
    dialogMemberCancel () {
      this.tableSelectValue = []
      this.$emit('member-close', [])
    },
    dialogMemberOk () {
      this.$emit('member-close', this.tableSelectValue)
      this.tableSelectValue = []
    },
    onSelect (node) {
      this.queryParam.deptId = node.id
      this.$refs.table.searchData()
    },
    handleTableSelectionChange (value) {
      this.tableSelectValue = value
    },
    handleTableRowClick (row) {
      // 单击行 -- 勾选处理
      if (this.existsData.filter(item => item.sysuserId === row.id).length) { // existsData 人员列表中已经存在当前行(说明勾选禁止)
        return
      }
      let isSelect = this.tableSelectValue.filter(item => item.id === row.id).length
      this.$refs.table.$refs.table.toggleRowSelection(row, !isSelect)
    },
    rowDblclick (row, column, event) {
      let arr = []
      arr.push(row)
      this.$emit('member-close', arr)
    }
  },
  components: {
    NormalLayout,
    CommonDialog,
    CommonTree,
    CommonTable,
    IdleDays,
    'el-input': Input,
    'el-date-picker': DatePicker
  }
}
</script>
<style lang="scss" scpoed>
.search-con {
  .date-range-con,
  .input-con {
    float: left;
    height: 30px;
  }
  .input-con {
    margin-left: 10px;
  }
  .search-btn {
    float: right;
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
</style>
