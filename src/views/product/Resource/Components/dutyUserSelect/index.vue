<template>
  <common-dialog :title="title"
                 @close="handleCancel"
                 :visible="visible"
                 :dialogConfig="dialogConfig"
                 :showHandleBtn="true"
                 :dialog-height="dialogHeight"
                 :width="dialogWidth"
                 @handle-ok="handleOk"
                 @handle-cancel="handleCancel"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <list-layout class="layoutClass"
                   :headerVisible="false">
        <template #north>
          <!-- <div class="input-con">
            <el-input class="input-name input-search-name"
                      placeholder="责任人模糊查询"
                      v-model="userName"
                      size="small"></el-input>
          </div>
          <el-button type="primary"
                     @click="searchTable">搜索
          </el-button> -->
        </template>
        <template #center>
          <div id="table-contain">
            <common-table ref='tableCom'
                          :columns='ruleOutSelf ? queryColumns : columns'
                          :params='ruleOutSelf ? queryParam : params'
                          :api='ruleOutSelf ? queryTableApi : tableApi'
                          :table-Refresh='tableRefresh'
                          :table-config='tableConfig'
                          :pagination="false"
                          :tableSetting="false"
                          :disabledCheckAll="true"
                          @row-click="rowClick"
                          @select="select"
                          @row-dblclick='rowDblclick'
                          @requested-table-data="requestedTableData">
              <template #userState="{ scope }">
                <div class="userState">
                  <span v-if="scope.row.departureTime"
                        class="state-out">已退出</span>
                  <span v-else
                        class="state-working">团队中</span>
                </div>
              </template>
            </common-table>
          </div>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.date-range-con,
.input-con {
  float: left;
  height: 30px;
  width: 300px;
}
.input-con {
  margin-left: 10px;
}
.search-btn {
  float: right;
  height: 30px;
}
.el-icon-d-arrow-right {
  float: right;
  font-size: 20px;
  margin-top: 6px;
  cursor: pointer;
}
.icon-conflict {
  cursor: pointer;
  font-size: 20px;
  color: #ff0000;
}
.input-search-name.el-input--mini {
  width: 470px !important;
}
.table-con .small-table {
  overflow-y: auto;
}
.resourceList {
  float: left;
  width: calc(50% - 5px);
}
.resourceLoad {
  float: right;
  width: 50%;
}
::v-deep .list-header {
  height: 50px !important;
  background-color: #e9ecef !important;
}
.layoutClass::v-deep .list-main {
  padding: 0;
}
.state-out {
  color: red;
}
.state-working {
  color: green;
}
</style>
<script>
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog, P8Table as CommonTable } from 'p8-components-ui'

import { Button, Input } from 'element-ui'

import Vue from 'vue'
export default {
  name: 'UserSelect',
  components: {
    'el-input': Input,
    'el-button': Button,
    CommonTable,
    CommonDialog,
    ListLayout
  },
  props: ['visible', 'selectTaskDutyDeptId', 'id', 'userId', 'ruleOutSelf'],
  data () {
    return {
      comp: this,
      title: '责任人选择',
      dialogWidth: '800px',
      dialogHeight: 580,
      tableV: false,
      userName: '',
      dialogConfig: {
        modal: false
      },
      tableApi: 'teamManager.lgetResponsibleist',
      queryTableApi: 'teamManager.getProjectTeamUser',
      params: {
        wholeDescribeId: this.id
      },
      queryParam: {
        userName: this.userName,
        wholeDescribeId: this.id,
        userId: this.ruleOutSelf ? this.userId : ''
      },
      tableConfig: {
        'highlight-current-row': true
      },
      resourceWidth: '100%',
      customHeight: 600,
      columns: [
        {
          title: '',
          minWidth: 35,
          type: 'selection',
          selectable: (row, index) => {
            if (!row.departureTime) {
              return true
            }
          }
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          minWidth: 50
        },
        {
          title: '角色名称',
          dataIndex: 'realName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '部门名称',
          dataIndex: 'deptName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '状态',
          dataIndex: 'userState',
          scopedSlots: {
            customRender: 'custom'
          },
          align: 'center',
          width: 80,
        },
        {
          title: '未完成数',
          dataIndex: 'taskUndoneCount',
          align: 'center',
          minWidth: 90
        },
        {
          title: '总数',
          dataIndex: 'taskCount',
          align: 'center',
          minWidth: 90
        }
      ],
      queryColumns: [
        {
          title: '',
          minWidth: 35,
          type: 'selection',
          selectable: (row, index) => {
            if (row.departureTime) {
              return false
            }
          }
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          minWidth: 50
        },
        {
          title: '角色名称',
          dataIndex: 'projectTeamRoleName',
          align: 'center',
          minWidth: 200
        },
        {
          title: '角色',
          dataIndex: 'realName',
          align: 'center',
          minWidth: 200
        },
        {
          title: '部门名称',
          dataIndex: 'deptName',
          align: 'center',
          minWidth: 200
        },
        {
          title: '状态',
          dataIndex: 'userState',
          scopedSlots: {
            customRender: 'custom'
          },
          align: 'center',
          width: 80,
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    // 单击选中行
    rowClick (row, column, event) {
      this.$refs.tableCom.$refs.table.clearSelection()
      this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
    },
    // 勾选复选框选中行
    select (selection, row) {
      this.$refs.tableCom.$refs.table.clearSelection()
      this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblclick (row, column, event) {
      this.$refs.tableCom.$refs.table.clearSelection()
      this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
      this.submit()
    },
    isfullscreen (isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 170
      } else {
        this.customHeight = 462
      }
    },
    // 默认选中页面已选的责任人
    requestedTableData (data) {
      let _this = this
      if (data.length) {
        this.$nextTick(() => {
          data.map(item => {
            if (item.id === _this.selectTaskDutyDeptId) {
              _this.$refs.tableCom.$refs.table.setCurrentRow(item)
              _this.$refs.tableCom.$refs.table.toggleRowSelection(item, true)
            }
          })
        })
      }
    },
    tableRefresh (param) {
      param.then(() => {
        console.log('异步成功后端做的操作')
      }).catch(() => {
        console.error('异步失败的操作')
      })
    },
    searchTable () {
      if (this.ruleOutSelf) {
        this.queryParam.userName = this.userName
      } else {
        this.params.userName = this.userName
      }
      this.$refs.tableCom.searchData()
    },
    submit () {
      let eventName = this.ruleOutSelf ? 'ruleOutSelfUserSelected' : 'dutyUserSelected'
      this.$emit(eventName, this.currentRow)
    },
    search () {
      let that = this
      Vue.nextTick(function () {
        that.$refs.tableCom.searchData()
      })
    },
    handleCancel () {
      this.$emit('closed')
    },
    handleOk () {
      if (this.currentRow && Object.keys(this.currentRow).length > 0) {
        this.submit()
      } else {
        this.$message({
          message: '请选择责任人！',
          type: 'warning'
        })
      }
    }
  }

}

</script>
