<template>
  <list-layout>
    <template #north>
      <el-button type="primary"
                 round
                 @click="planVersionView()">对比</el-button>
      <search-form-list ref="search"
                        :dataSource='searchData'
                        @search='search'
                        @re-set='reSet'></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    width="100%"
                    :columns="columns"
                    :table-Refresh="tableRefresh"
                    :params="queryParam"
                    :api="tableApi"
                    :comp="comp"
                    @selection-change="handleSelectionChange"
                    :pagination=true>
      </common-table>
    </template>

    <template #drawer-panel>
      <common-drawer v-if="planVersionVisible"
                     size="100%"
                     :visible='planVersionVisible'
                     title="版本对比"
                     :drawerConfig="drawerConfig"
                     @close="planVersionClose">
        <template #drawer>
          <plan-version @save-success="planVersionClose"
                        :existDefaultBtn="false"
                        :planVersionId1="planVersionId1"
                        :planVersionId2="planVersionId2"
                        :planVersionNum1="planVersionNum1"
                        :planVersionNum2="planVersionNum2"
                        :versionType="versionType"
                        v-bind="$attrs"
                        :planInfoId="queryParam.planInfoId">
          </plan-version>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Search as SearchFormList } from 'p8-components-ui'

import PlanVersion from '../planVersion'

const columns = [
  {
    title: '',
    type: 'selection',
    reserveSelection: true,
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
    title: '版本号',
    dataIndex: 'backType',
    minWidth: 300,
    align: 'center'
  },
  {
    title: '版本说明',
    dataIndex: 'versionNote',
    minWidth: 300,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'adjustTime',
    width: 200,
    align: 'center'
  },
  {
    title: '创建人',
    dataIndex: 'adjustUser',
    width: 200,
    align: 'center'
  },
  {
    title: '创建部门',
    dataIndex: 'adjustDept',
    width: 200,
    align: 'center'
  }
]
export default {
  name: 'planVersionList',
  props: {
    planInfoId: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  components: {
    SearchFormList,
    CommonTable,
    CommonDrawer,
    PlanVersion,
    ListLayout
  },
  data () {
    return {
      comp: this,
      queryParam: {
        backType: '',
        planInfoId: this.planInfoId,
        page: {
          current: 1,
          orders: [],
          sieze: 20
        }
      },
      planVersionVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
      versionType: '',
      planVersionId1: '',
      planVersionId2: '',
      planVersionNum1: '',
      planVersionNum2: '',
      tableApi: 'planGanttManager.versionList',
      columns: columns,
      drawerConfig: {
        modal: false
      },
      searchData: [
        {
          type: 'text',
          labelText: '版本号',
          fieldName: 'backType',
          placeholder: '请输入版本号',
          fieldEvent: {
            'click': 'clickEvent(this)'
          }
        }
      ]
    }
  },
  mounted () {

  },
  methods: {

    tableRefresh (param) {
      param.then(() => {

      }).catch(() => {
        console.error('异步失败的操作')
      })
    },

    search (param) {
      let that = this
      let newParams = { ...param }
      that.queryParam = newParams
      that.queryParam.planInfoId = that.planInfoId
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach(key => { that.queryParam[key] = '' })
      that.queryParam.planInfoId = that.planInfoId
    },
    planVersionClose () {
      this.planVersionVisible = false
    },
    planVersionView () {
      this.versionType = ''
      if (this.selectedRows && this.selectedRows.length > 0) {
        if (this.selectedRows.length > 2) {
          this.$message({
            message: '最多选择两条数据',
            type: 'warning'
          })
        } else {
          if (this.selectedRows.length === 2) {
            let obj = {}
            let versionSort = []
            this.selectedRows.forEach((item, index) => {
              let version = item.backType.split('.')[2]
              obj[version] = index
              versionSort.push(version)
            })
            versionSort.sort(function (a, b) {
              return a - b;
            })
            this.planVersionId1 = this.selectedRows[obj[versionSort[0]]].id
            this.planVersionNum1 = this.selectedRows[obj[versionSort[0]]].backType
            this.planVersionId2 = this.selectedRows[obj[versionSort[1]]].id
            this.planVersionNum2 = this.selectedRows[obj[versionSort[1]]].backType
          } else {
            this.planVersionId1 = this.selectedRows[0].id
            this.planVersionNum1 = this.selectedRows[0].backType
            this.planVersionId2 = this.planInfoId
            this.planVersionNum2 = '当前计划'
            this.versionType = 'task'
          }
          this.planVersionVisible = true
        }
      } else {
        this.$message({
          message: '至少要选择一条数据',
          type: 'warning'
        })
      }
    },
    handleSelectionChange (val) {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.selectedRows = val
      val.map(item => {
        this.selectedRowKeys.push(item.id)
      })
    }
  }

}
</script>
