<template>
  <common-dialog title="团队人员选择"
                 :width="dialogWidth"
                 :dialogHeight="dialogHeight"
                 v-if="visibleDislogMember"
                 :visible="visibleDislogMember"
                 :dialogConfig="dialogConfig"
                 @handle-cancel="dialogMemberCancel"
                 @handle-ok="dialogMemberOk"
                 @close="dialogMemberCancel">
    <template #dialog>
      <normal-layout>
        <template #north>
          <div class="search-con">
            <div class="date-range-con">
              负荷分析时段:
              <el-date-picker class="date-range"
                              v-model="rangeDate"
                              unlink-panels
                              size="mini"
                              type="daterange"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期"
                              @change="datePickerChange"></el-date-picker>
            </div>
            <div class="input-con">
              人员姓名:
              <el-input class="input-name"
                        placeholder="请输入人员姓名进行搜索"
                        v-model="queryParam.userName"
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
          <common-tree ref="tree"
                       :treeParam='treeParam'
                       :tree-api="treeApi"
                       @select="onSelect"
                       @initTreeData="treeDataHandle"></common-tree>
        </template>
        <template #center>
          <!-- <div class="table-con"> -->
          <common-table ref="table"
                        :flex="tableFlex"
                        :columns="columns"
                        :params="queryParam"
                        :api="tableApi"
                        :tableSetting="false"
                        @selection-change="handleTableSelectionChange">
            <template #idleDaysCount="{scope}">
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
import { P8NormalLayout as NormalLayout, P8Dialog as CommonDialog, P8Tree as CommonTree, P8Table as CommonTable, Input, Button, DatePicker } from 'p8-components-ui'

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
    }
  },
  data () {
    const columns = [
      {
        title: '',
        type: 'selection',
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
      {
        title: '序号',
        type: 'index'
      },
      {
        title: '姓名',
        dataIndex: 'realName'
      },
      {
        title: '部门',
        dataIndex: 'deptName'
      }
      // {
      //   title: '负荷信息',
      //   dataIndex: 'idleDaysCount',
      //   scopedSlots: { customRender: 'custom' }
      // }
    ]
    return {
      columns,
      treeApi: 'ProjectApply.deptTreeByCurrent',
      tableApi: 'projectTeam.userList',
      rangeDate: [moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
      queryParam: {
        deptId: '',
        userName: '',
        startDate: moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD hh:mm:ss'), //  hh:mm:ss
        endDate: moment().format('YYYY-MM-DD hh:mm:ss') // hh:mm:ss
      },
      treeParam: {
        loginFlag: this.loginFlag
      },
      tableSelectValue: [],
      dialogWidth: '60%',
      dialogHeight: 300,
      tableFlex: 300,
      dialogConfig: {
        modal: true,
        'append-to-body': true
      }
    }
  },
  mounted () {
    const ch = document.documentElement.clientHeight
    const cw = document.documentElement.clientWidth
    this.dialogHeight = ch * 0.6
    this.dialogWidth = cw * 0.6 + 'px'
    this.tableFlex = ch * 0.4 + 50
  },
  methods: {
    search () {
      // 搜索
      this.$refs.table.searchData()
    },
    datePickerChange (rangeDate) {
      // moment
      this.queryParam.startDate = moment(rangeDate[0]).format('YYYY-MM-DD hh:mm:ss')
      this.queryParam.endDate = moment(rangeDate[1]).format('YYYY-MM-DD hh:mm:ss')
    },
    dialogMemberCancel () {
      // this.dialogConfig['modal-append-to-body'] = true
      // this.queryParam = {}
      this.tableSelectValue = []
      this.$emit('member-close', [])
    },
    dialogMemberOk () {
      // this.queryParam = {}
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
    selectable (row, index) {

    },
    treeDataHandle (data) {
      this.$nextTick(() => {
        this.$refs.tree.$refs.tree.setCurrentKey(data[0].id)
        this.queryParam.deptId = data[0].id
      })
    }
  },
  components: {
    NormalLayout,
    CommonDialog,
    CommonTree,
    CommonTable,
    IdleDays,
    'el-input': Input,
    'el-button': Button,
    'el-date-picker': DatePicker
  }
}
</script>
<style lang="scss" scoped>
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
.el-date-editor.el-range-editor {
  width: 200px;
}
.el-input--mini {
  width: 200px !important;
}
.table-con .small-table {
  overflow-y: auto;
}
</style>
