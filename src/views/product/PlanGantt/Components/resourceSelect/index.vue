<template>
  <common-dialog :title="title"
                 @close="handleCancel"
                 :visible="visible"
                 :dialog-config="dialogConfig"
                 :show-handle-btn="true"
                 :dialog-height="dialogHeight"
                 :width="dialogWidth"
                 @handle-ok="handleOk"
                 @handle-cancel="handleCancel"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <el-tabs class="resource_tab"
               v-model="activeName">
        <el-tab-pane v-if="tabsShow('team')"
                     label="团队用户"
                     name="team">
          <list-layout>
            <template #north>
              <div class="input-con">
                <el-input v-model="searchName"
                          class="input-name input-search-name"
                          :placeholder="DutyPersonsMessage === '' ? '支持人员名称、部门、角色模糊查询，例如：李四、lisi、部门1、计划经理' : DutyPersonsMessage"
                          size="small"
                          @change="inputChange" />
                <el-button style="margin-left: 15px"
                           type="primary"
                           size="mini"
                           @click="search"> 搜索 </el-button>
              </div>
              <i v-if="tableV"
                 class="el-icon-d-arrow-right"
                 @click="
                  () => {
                    tableV = !tableV
                    resourceWidth = '100%'
                  }
                " />
            </template>
            <template #center>
              <div id="table-contain">
                <div class="resourceList"
                     :style="{ width: resourceWidth }">
                  <common-table ref="tableCom"
                                :columns="columns"
                                :params="queryParam"
                                :api="tableApi"
                                :table-refresh="tableRefresh"
                                :table-config="tableConfig"
                                :table-setting="false"
                                :disabled-check-all="true"
                                is-radio-select
                                @row-click="rowClick"
                                @select="select"
                                @row-dblclick="rowDblclick"
                                @requested-table-data="requestedTableData">
                    <template #taskCount="{ scope }">
                      <i v-if="scope.row.taskCount > 0"
                         class="p8 icon-conflict"
                         @click="showUserLoad(scope.row)" />
                    </template>
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
                <div class="resourceLoad">
                  <common-table v-if="tableV"
                                ref="table"
                                :columns="columnsT"
                                :params="queryParamT"
                                :api="tableApiT"
                                :table-refresh="tableRefreshT"
                                :table-config="tableConfigT"
                                :table-setting="false">
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
              </div>
            </template>
          </list-layout>
        </el-tab-pane>
        <el-tab-pane v-if="tabsShow('user')"
                     label="系统用户"
                     name="user">
          <UserSelect :visible="true"
                      @sysUserSelect="sysUserSelect"
                      @dbClickUser="dbClickUser" />
        </el-tab-pane>
        <el-tab-pane v-if="tabsShow('dept')"
                     label="部门派发"
                     name="dept">
          <DeptSelect @deptChange="deptChange" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.state-out {
  color: red;
}
.state-working {
  color: green;
}
.date-range-con,
.input-con {
  display: flex;
  justify-content: flex-end;
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
.input-search-name {
  width: 450px !important;
  display: inline-block !important;
}
.table-con .small-table {
  overflow-y: auto;
}
.resourceList {
  float: left;
  width: calc(50% - 5px);
  height: 100%;
}
.resourceLoad {
  float: right;
  width: 50%;
  height: 100%;
}
.resource_tab {
  height: 100%;
}
</style>
<script>
import Vue from 'vue'
import { P8Table as CommonTable, P8Dialog as CommonDialog, P8ListLayout as ListLayout, Input } from 'p8-components-ui'
import UserSelect from './UserSelect.vue'
import DeptSelect from './deptSelect.vue'
export default {
  name: 'ResourceSelect',
  components: {
    'el-input': Input,
    CommonTable,
    CommonDialog,
    ListLayout,
    DeptSelect,
    UserSelect
  },
  inject: {
    DutyPersonsMessage: {
      default: '',
      from: 'DutyPersonsMessage'
    }
  },
  props: ['startTaskId', 'endTaskId', 'planInfoId', 'visible', 'selectTaskOwnerId', 'showType', 'selectModel'],
  data () {
    return {
      comp: this,
      title: '选择责任人',
      dialogWidth: '60%',
      dialogHeight: 580,
      tableV: false,
      dialogConfig: {
        modal: false
      },
      activeName: '',
      currentRow: null,
      selectType: '',
      tableApi: 'planGanttManager.planResourceLoad',
      searchName: '',
      queryParam: {
        planInfoId: this.planInfoId,
        startTaskId: this.startTaskId,
        endTaskId: this.endTaskId,
        searchName: ''
      },
      tableConfig: {
        'highlight-current-row': true
      },
      resourceWidth: '100%',
      customHeight: 462,
      columns: [],
      columnsT: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 60
        },
        {
          title: '项目名称',
          dataIndex: 'projectName',
          sortable: false
        },
        {
          title: '计划名称',
          dataIndex: 'planName',
          sortable: false
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          sortable: false
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
          title: '计划开始时间',
          dataIndex: 'planBeginDate',
          align: 'center',
          width: 110,
          sortable: false
        },
        {
          title: '计划完成时间',
          dataIndex: 'planEndDate',
          align: 'center',
          width: 110,
          sortable: false
        }
      ],
      queryParamT: {
        planInfoId: this.planInfoId,
        startTaskId: this.startTaskId,
        endTaskId: this.endTaskId,
        userId: ''
      },
      tableApiT: 'planGanttManager.resourceTaskLoad',
      tableConfigT: {}
    }
  },
  computed: {
    tabsShow () {
      return (type) => {
        return this.selectModel.includes(type)
      }
    }
  },
  created () {
    this.activeName = this.selectModel[0]
    console.log('🚀 ~ created ~ this.activeName:', this.activeName)
  },
  mounted () {
    if (this.showType === '1' || this.showType === '2' || this.showType === '3') {
      this.columns = [
        {
          title: '',
          width: 35,
          type: 'selection',
          selectable: function (row, index) {
            if (row.weatherOut === '1') {
              return false
            }
            return true
          }
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 60
        },
        {
          title: '人员',
          dataIndex: 'name',
          align: 'center',
          width: 85
        },
        {
          title: '部门',
          dataIndex: 'deptName',
          align: 'center',
          minWidth: 130
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
    } else {
      this.columns = [
        {
          title: '',
          width: 35,
          type: 'selection',
          selectable: function (row, index) {
            if (row.weatherOut === '1') {
              return false
            }
            return true
          }
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 60
        },
        {
          title: '人员',
          dataIndex: 'name',
          align: 'center',
          width: 85
        },
        // {
        //   title: '涉密等级',
        //   dataIndex: 'userLevelDis',
        //   width: 120,
        //   align: 'center'
        // },
        {
          title: '部门',
          dataIndex: 'deptName',
          align: 'center',
          minWidth: 130
        },
        {
          title: '角色',
          dataIndex: 'roleName',
          align: 'center',
          minWidth: 130
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
        // {
        //   title: '负载',
        //   dataIndex: 'taskCount',
        //   align: 'center',
        //   width: 60,
        //   scopedSlots: { customRender: 'custom' }
        // }
      ]
    }
  },
  methods: {
    inputChange (val) {
      this.queryParam.searchName = val
    },
    // 单击选中行
    rowClick (row, column, event) {
      if (row.weatherOut === '0') {
        this.$refs.tableCom.$refs.table.clearSelection()
        if (this.currentRow) {
          if (this.currentRow.id === row.id) {
            this.$refs.tableCom.$refs.table.toggleRowSelection(row, false)
            this.currentRow = null
          } else {
            this.$refs.tableCom.$refs.table.toggleRowSelection(row, true)
            this.currentRow = row
          }
        } else {
          this.$refs.tableCom.$refs.table.toggleRowSelection(row, true)
          this.currentRow = row
        }
        this.selectType = 'team'
      }
    },
    // 勾选复选框选中行
    select (selection, row) {
      if (!row) {
        this.$refs.tableCom.$refs.table.clearSelection()
      }
      // this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
      this.selectType = 'team'
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblclick (row, column, event) {
      if (row.weatherOut === '0') {
        this.$refs.tableCom.$refs.table.clearSelection()
        this.$refs.tableCom.$refs.table.toggleRowSelection(row)
        this.currentRow = row
        this.selectType = 'team'
        this.submit()
      }
    },
    showUserLoad (row) {
      if (row.weatherOut === '0') {
        this.getUserTaskInfo(row)
        this.tableV = true
        this.resourceWidth = 'calc( 50% - 5px )'
      }
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
      const _this = this
      if (data.length) {
        this.$nextTick(() => {
          data.forEach((item) => {
            if (item.id === _this.selectTaskOwnerId) {
              _this.$refs.tableCom.$refs.table.setCurrentRow(item)
              _this.currentRow = item
              _this.$refs.tableCom.$refs.table.toggleRowSelection(item, true)
            }
          })
        })
      }
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    submit () {
      this.$emit('resource-selected', this.currentRow.id, this.currentRow, this.selectType)
    },
    sysUserSelect (row) {
      this.selectType = 'user'
      this.currentRow = row
    },
    dbClickUser (row) {
      this.selectType = 'user'
      this.currentRow = row
      this.submit()
    },
    deptChange (row) {
      this.selectType = 'dept'
      this.currentRow = row
      this.submit()
    },
    search () {
      const that = this
      this.queryParam.searchName = this.searchName
      Vue.nextTick(function () {
        that.$refs.tableCom.searchData()
      })
    },
    handleCancel () {
      this.$emit('closed')
    },
    getUserTaskInfo (row) {
      this.$set(this.queryParamT, 'resourceId', row.id)
    },
    tableRefreshT (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
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
