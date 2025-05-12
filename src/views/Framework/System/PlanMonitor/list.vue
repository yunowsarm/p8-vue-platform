<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-config="buttonConfig"
                     :button-type="'round'"
                     :special-rote-name="roteName"></common-button>
      <search-form-list ref="search"
                        :data-source="searchDatasource"
                        :addFuzzySearch="true"
                        @search="search"
                        @re-set="reset"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :table-config="tableConfig"
                      :columns="columns"
                      :tree="treeParams"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"
                      @icon-click="iconClick"
                      :special-rote-name="roteName">
          <template #icon="{ scope }">
            <i :class="scope.row.icon"
               :style="{color: scope.row.color}"></i>
          </template>
        </common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visiblePlanLogoEditDrawer"
                     :title="drawerTitle"
                     :visible="visiblePlanLogoEditDrawer"
                     @close="onEditPlanLogoClose">
        <template #drawer>
          <plan-logo-edit @save-success="saveCallback"
                          :id="id"
                          :name="name"
                          :record="record"></plan-logo-edit>
        </template>
      </common-drawer>
      <common-drawer v-if="visiblePlanLogoDetailsDrawer"
                     :title="drawerTitle"
                     :visible="visiblePlanLogoDetailsDrawer"
                     @close="onDetailsPlanLogoClose">
        <template #drawer>
          <plan-logo-details @save-Success="onDetailsPlanLogoClose"
                             :id="id"
                             :name="name"
                             :record="record"></plan-logo-details>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<script>
import { P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer, P8ListLayout as ListLayout, P8Search as SearchFormList } from 'p8-components-ui'

import PlanLogoEdit from '@/views/Framework/System/PlanMonitor/edit'
import PlanLogoDetails from '@/views/Framework/System/PlanMonitor/details'

const columns = [
  {
    title: '序号',
    type: 'index',
    align: 'center',
    width: '50',
    headerAlign: 'center'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 60,
    scopedSlots: { customRender: 'custom' },
    align: 'center'
  },
  {
    title: '标识名称',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: '标识描述',
    dataIndex: 'describes',
    align: 'center'
  },
  {
    title: '时间控制',
    dataIndex: 'controlTimeType',
    formatter (row, column, cellValue, index) {
      let v = ''
      switch (cellValue) {
        case '0':
          v = '是'
          break
        case '1':
          v = '否'
          break
      }
      return v
    },
    align: 'center'
  },
  {
    title: '是否固定',
    dataIndex: 'constantMarkType',
    formatter (row, column, cellValue, index) {
      let v = ''
      switch (cellValue) {
        case '0':
          v = '是'
          break
        case '1':
          v = '否'
          break
      }
      return v
    },
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'type',
    formatter (row, column, cellValue, index) {
      let v = ''
      switch (cellValue) {
        case '0':
          v = '已停用'
          break
        case '1':
          v = '已启用'
          break
      }
      return v
    },
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    width: 160,
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    align: 'center'
  }
]

export default {
  name: 'PlanLogoList',
  components: {
    PlanLogoEdit,
    PlanLogoDetails,
    CommonTable,
    CommonButton,
    CommonDrawer,
    ListLayout,
    SearchFormList
  },
  props: {
    roteName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      visiblePlanLogoEditDrawer: false,
      visiblePlanLogoDetailsDrawer: false,
      queryParam: {},
      treeParams: {},
      tableApi: 'PlanMonitor.planLogoListData',
      advanced: false,
      columns: columns,
      id: '',
      name: '',
      record: {},
      scroll: {},
      tableConfig: {
        defaultExpandAllRows: true
      },
      searchData: [],
      buttonConfig: {
        icon: 'edit'
      },
      searchDatasource: [
        {
          type: 'text',
          labelText: '标识名称',
          fieldName: 'name',
          placeholder: '请输入标识名称'
        },
        {
          type: 'select',
          labelText: '状态',
          fieldName: 'type',
          placeholder: '请选择状态',
          options: [
            {
              label: '未启用',
              value: '0'
            },
            {
              label: '已启用',
              value: '1'
            }
          ],
        }
      ]
    }
  },
  mounted () { },
  computed: {},
  methods: {
    createPlanLogo () {
      this.id = ''
      this.drawerTitle = '新建计划标识'
      this.visiblePlanLogoEditDrawer = true
    },
    iconClick (record) { },
    updatePlanLogo (record) {
      this.id = record.id
      this.name = record.name
      this.record = record
      this.drawerTitle = '修改计划标识'
      this.visiblePlanLogoEditDrawer = true
    },
    detailPlanLogo (record) {
      this.id = record.id
      this.record = record
      this.name = record.name
      //  this.parentId = record.id;
      this.drawerTitle = '查看计划标识'
      this.visiblePlanLogoDetailsDrawer = true
    },
    removePlanLogo (record) {
      const that = this
      this.$confirm(`是否确定要删除该计划标识？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          record.status = '0'
          that.$api['PlanMonitor.removePlanLogo']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
            that.$message({ message: `操作成功！`, type: 'success' })
          })
        })
        .catch(() => {
          that.$message({ message: `删除计划标识失败！`, type: 'error' })
        })
    },
    startPlanLogo (record) {
      const that = this
      let type = null
      this.$confirm(`是否确定要启用该计划标识？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          type = '1'
          that.$api['PlanMonitor.planLogoUseState']({ id: record.id, type: type }).then((res) => {
            that.$refs.table.searchData()
            that.$message({ message: `启用计划标识成功！`, type: 'success' })
          })
        })
        .catch(() => {
          that.$message({ message: `启用计划标识失败！`, type: 'error' })
        })
    },
    stopPlanLogo (record) {
      const that = this
      let type = null
      this.$confirm(`是否确定要停用该计划标识？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          type = '0'
          that.$api['PlanMonitor.planLogoUseState']({ id: record.id, type: type }).then((res) => {
            that.$refs.table.searchData()
            that.$message({ message: `停用计划标识成功！`, type: 'success' })
          })
        })
        .catch(() => {
          that.$message({ message: `停用计划标识失败！`, type: 'error' })
        })
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.onEditPlanLogoClose()
    },
    onEditPlanLogoClose () {
      this.visiblePlanLogoEditDrawer = false
    },
    onDetailsPlanLogoClose () {
      this.visiblePlanLogoDetailsDrawer = false
    },
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    search (param) {
      this.queryParam = param
    },
    reset () {
      this.queryParam = {}
    },
  }
}
</script>
<style scoped></style>
