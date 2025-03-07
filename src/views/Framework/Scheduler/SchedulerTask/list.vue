<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :select-records="multipleSelection"
                     :button-config="buttonConfig"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"
                      :menu-state="menuStateObj"
                      @selection-change="handleSelectionChange">
          >
        </common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="schedulerTaskEditDrawer"
                     :title="drawerTitle"
                     :visible="schedulerTaskEditDrawer"
                     @close="onEditSchedulerTaskClose">
        <template #drawer>
          <scheduler-task-edit @saveSuccess="saveCallback"
                               @cancel="schedulerTaskEditDrawer = false"
                               :record="record"></scheduler-task-edit>
        </template>
      </common-drawer>
      <common-drawer v-if="schedulerTaskViewDrawer"
                     title="查看定时任务"
                     :visible="schedulerTaskViewDrawer"
                     @close="onViewSchedulerTaskClose">
        <template #drawer>
          <scheduler-task-view @saveSuccess="saveCallback"
                               @cancel="schedulerTaskViewDrawer = false"
                               :record="record"></scheduler-task-view>
        </template>
      </common-drawer>
      <scheduler-task-option #drawer-panel
                             v-if="visible"
                             @close-option="closeOption"
                             :visible="visible"
                             :title="drawerTitle"
                             :scheduler-task-array="selectedRowKeys"></scheduler-task-option>
    </template>
  </list-layout>
</template>

<script>
import Vue from 'vue'
import { P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer, P8ListLayout as ListLayout, P8Search as SearchFormList } from 'p8-components-ui'

import schedulerTaskEdit from '@/views/Framework/Scheduler/SchedulerTask/edit'
import schedulerTaskOption from '@/views/Framework/Scheduler/SchedulerTask/option'
import schedulerTaskView from '@/views/Framework/Scheduler/SchedulerTask/view'

export default {
  name: 'SchedulerTaskList',
  components: {
    CommonTable,
    CommonButton,
    CommonDrawer,
    ListLayout,
    SearchFormList,
    schedulerTaskEdit,
    schedulerTaskOption,
    schedulerTaskView
  },
  props: {
    columns: {
      type: Array,
      default: function () {
        return [
          {
            title: '',
            width: 45,
            align: 'center',
            headerAlign: 'center',
            type: 'selection'
          },
          {
            title: '序号',
            type: 'index',
            width: '50',
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '名称',
            dataIndex: 'name',
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '类型',
            dataIndex: 'type',
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '状态',
            dataIndex: 'status',
            formatter (row, column, cellValue, index) {
              let v = ''
              switch (cellValue) {
                case '0':
                  v = '停用'
                  break
                case '1':
                  v = '启用'
                  break
              }
              return v
            },
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '执行状态',
            dataIndex: 'statusExecute',
            formatter (row, column, cellValue, index) {
              let v = ''
              switch (cellValue) {
                case '0':
                  v = '未运行'
                  break
                case '1':
                  v = '定时任务已启动'
                  break
              }
              return v
            },
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '时机',
            dataIndex: 'timing',
            formatter (row, column, cellValue, index) {
              let v = ''
              switch (cellValue) {
                case 'immediately':
                  v = '立即执行+定时轮询'
                  break
                case 'polling':
                  v = '定时轮询'
                  break
              }
              return v
            },
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '定时策略',
            dataIndex: 'cron',
            align: 'left',
            headerAlign: 'left'
          },
          {
            title: '操作',
            fixed: 'right',
            dataIndex: 'operation',
            width: 120,
            scopedSlots: { customRender: 'operation' },
            align: 'left',
            headerAlign: 'left'
          }
        ]
      }
    },
    searchData: {
      type: Array,
      default: function () {
        return [
          {
            type: 'text',
            labelText: '名称',
            fieldName: 'name',
            placeholder: '选择输入名称',
            colLayout: 'doubleCol'
          },
          {
            type: 'text',
            labelText: '类型',
            fieldName: 'type',
            placeholder: '选择输入类型',
            colLayout: 'doubleCol'
          },
          {
            type: 'select',
            labelText: '状态',
            fieldName: 'status',
            options: [
              { label: '禁用', value: '0' },
              { label: '启用', value: '1' }
            ],
            colLayout: 'doubleCol'
          },
          {
            type: 'select',
            labelText: '执行状态',
            fieldName: 'statusExecute',
            options: [
              { key: '0', label: '未运行', value: '0' },
              { key: '1', label: '运行中', value: '1' }
            ],
            colLayout: 'doubleCol'
          },
          {
            type: 'select',
            labelText: '时机',
            fieldName: 'timing',
            options: [
              { key: 'immediately', label: '立即执行+定时轮询', value: 'immediately' },
              { key: 'polling', label: '定时轮询', value: 'polling' }
            ],
            colLayout: 'doubleCol'
          }
        ]
      }
    },
    menuStateObj: {
      type: Array,
      default: function () {
        return [
          {
            id: '090205', // 启用
            hidden: {
              field: 'status',
              status: ['1'],
              title: ['启用']
            }
          },
          {
            id: '090206', // 禁用
            hidden: {
              field: 'status',
              status: ['0'],
              title: ['禁用']
            }
          }
        ]
      }
    }
  },
  data () {
    return {
      comp: this,
      queryParam: {},
      tableApi: 'schedulerTask.list',
      isView: null,
      drawerTitle: '',
      entityId: '',
      record: {},
      schedulerTaskEditDrawer: false,
      schedulerTaskViewDrawer: false,
      selectedRowKeys: [],
      multipleSelection: [],
      selectedRows: [],
      disabledRow: [],
      visible: false,
      buttonConfig: {
        icon: 'edit'
      }
    }
  },
  mounted () { },
  methods: {
    handleSelectionChange (val) {
      this.selectedRowKeys = []
      this.multipleSelection = val
      val.map((item) => {
        this.selectedRowKeys.push(item.id)
      })
    },
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {

        })
    },
    schedulerTaskCreate () {
      this.drawerTitle = '新建定时任务'
      this.schedulerTaskEditDrawer = true
    },
    schedulerTaskModify (record) {
      this.drawerTitle = '修改定时任务'
      this.record = record
      this.schedulerTaskEditDrawer = true
    },
    schedulerTaskView (record) {
      this.record = record
      this.schedulerTaskViewDrawer = true
    },
    schedulerTaskForbidden (record) {
      let that = this
      this.$confirm('是否确定要禁用该定时任务？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          record.status = '0'
          that.$api['schedulerTask.forbiddenOrNormal'](record).then((res) => {
            that.$refs.table.searchData()
            that.$refs.table.clearSelection()
            that.$message({ message: '已停用，如需运行该任务请先启用后再执行启动操作。', type: 'success' })
          })
        })
        .catch(() => { })
    },
    schedulerTaskNormal (record) {
      // this.$refs.table.commonConfirm({
      //   api: 'schedulerTask.forbiddenOrNormal',
      //   params: record,
      //   content: '是否确定要启用该定时任务？',
      //   successMsg: 'ssssssssss',
      //   cancelMsg: 'fffffffffff'
      // })
      let that = this
      this.$confirm('是否确定要启用该定时任务？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          record.status = '1'
          that.$api['schedulerTask.forbiddenOrNormal'](record).then((res) => {
            that.$refs.table.searchData()
            that.$refs.table.clearSelection()
            that.$message({ message: '已启用，如需运行该任务请执行启动操作。', type: 'success' })
          })
        })
        .catch(() => { })
    },
    schedulerTaskDeadActive () {
      this.drawerTitle = '启动/停止'
      if (this.selectedRowKeys.length > 0) {
        this.visible = true
      } else {
        this.$message({ message: '没有已勾选的任务。', type: 'error' })
      }
    },
    schedulerTaskDelete (record) {
      let that = this
      this.$confirm('是否确定要删除该定时任务？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['schedulerTask.delete']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
            that.$message({ message: '删除成功', type: 'success' })
          })
        })
        .catch(() => { })
    },
    schedulerTaskStart (record) {
      let that = this
      this.$confirm('是否确定要启动该定时任务？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['schedulerTask.futureLaunch']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
            // resolve()
            that.$message({ message: '已启动', type: 'success' })
          })
        })
        .catch(() => { })
    },
    schedulerTaskStop (record) {
      let that = this
      this.$confirm('是否确定要停止该定时任务？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['schedulerTask.futureShutdown']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
            // resolve()
            that.$message({ message: '已停止', type: 'success' })
          })
        })
        .catch(() => { })
    },
    closeOption (optionType) {

      let that = this
      if (Object.keys(optionType).length > 0) {
        let msg = ''
        if (optionType.optionType) {
          msg = '启动'
          let existsDisable = that.multipleSelection.some((item, index) => {
            return item.status === '0'
          })
          if (existsDisable) {
            that.$message({ message: '定时任务已停用，请启用后再次进行启动', type: 'warning' })
            that.visible = false
            return
          }
        } else {
          msg = '停止'
        }
        that.$api['schedulerTask.futureLaunchOrStop']({
          ids: that.selectedRowKeys,
          optionType: optionType.optionType
        }).then((res) => {
          that.$refs.table.searchData()
          // resolve()
          that.$message({ message: '任务已' + msg, type: 'success' })
          that.visible = false
        })
      } else {
        that.visible = false
      }
    },
    onEditSchedulerTaskClose () {
      this.schedulerTaskEditDrawer = false
      this.record = {}
      this.$refs.table.searchData()
    },
    onViewSchedulerTaskClose () {
      this.schedulerTaskViewDrawer = false
      this.$refs.table.searchData()
      this.record = {}
    },
    saveCallback () {
      this.onEditSchedulerTaskClose()
    },
    search (param) {
      this.queryParam = { ...param, ...(this.queryParam.roleName ? { roleName: this.queryParam.roleName } : {}) }
      let that = this
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach((key) => (that.queryParam[key] = undefined)) //
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    }
  }
}
</script>

<style scoped></style>
