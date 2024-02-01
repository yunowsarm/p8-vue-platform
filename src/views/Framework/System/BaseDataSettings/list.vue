<template>
  <list-layout>
    <template #center>
      <div id="table-contain">
        <el-table :data="tableData"
                  row-key="id"
                  style="width: 100%"
                  max-height="600"
                  border
                  default-expand-all
                  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
          <el-table-column prop="name"
                           label="名称"
                           sortable></el-table-column>
          <el-table-column prop="operation"
                           label="操作"
                           width="150"
                           sortable>
            <template slot-scope="scope">
              <el-button type="text"
                         v-if="scope.row.type !== 'PROJECT_CLASSIFY'"
                         style="color: #0070c5"
                         @click="relate(scope.row)">关联</el-button>
              <span v-if="scope.row.type !== 'PROJECT_CLASSIFY'"
                    style="color: #eeeef0">&nbsp;|</span>
              <el-button type="text"
                         v-if="scope.row.type !== 'PROJECT_CLASSIFY'"
                         style="color: #0070c5"
                         @click="cancel(scope.row)">&nbsp;取消关联</el-button>
              <el-button type="text"
                         v-if="scope.row.type === 'PROJECT_CLASSIFY'"
                         style="color: #0070c5"
                         @click="cancel(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
    <template #drawer-panel>
      <select-field-classify v-if="visibleField"
                             :visible="visibleField"
                             @saveCallback="saveCallback"
                             :record="record"
                             @close-field="closeField"></select-field-classify>
      <select-project-classify v-if="visibleProject"
                               :visible="visibleProject"
                               @saveCallback="saveCallback"
                               :record="record"
                               @close-field="closeProject"></select-project-classify>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, Table, TableColumn, Button } from 'p8-components-ui'

import SelectFieldClassify from './components/selectFieldClassify'
import SelectProjectClassify from './components/selectProjectClassify'
export default {
  name: 'List',
  components: {
    SelectProjectClassify,
    SelectFieldClassify,
    ListLayout,
    'el-button': Button,
    'el-table': Table,
    'el-table-column': TableColumn
  },
  props: {
    roteName: {
      type: String,
      default: ''
    }
  },
  data () {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        align: 'center'
      },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        width: '100',
        scopedSlots: {
          customRender: 'operation'
        },
        align: 'center'
      }
    ]
    return {
      comp: this,
      tableApi: 'basicDataRelation.list',
      columns,
      tableData: [],
      queryParams: {},
      treeParams: {},
      tableConfig: {
        defaultExpandAllRows: true
      },
      visibleField: false,
      visibleProject: false,
      record: []
    }
  },
  mounted () {
    this.queryList()
  },
  methods: {
    queryList () {
      let page = {
        current: 1,
        orders: [],
        size: 16
      }
      let that = this
      this.$api[this.tableApi]({ page: page }).then(function (res) {
        that.tableData = res
      })
    },
    relate (record) {
      if (record.type !== 'OWNER_TYPE') {
        this.visibleField = true
        this.record = record
      } else {
        this.visibleProject = true
        this.record = record
      }
    },
    cancel (record) {
      let that = this
      that
        .$confirm('是否要取消关联？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          let type = 'success'
          let msg = '取消成功！'
          that.$api['basicDataRelation.cancelRelation'](record)
            .then((res) => {
              if (!res) {
                that.$message({
                  message: '取消失败',
                  type: 'warning'
                })
              } else {
                that.queryList()
              }
            })
            .catch(function (error) {
              type = 'error'
              msg = '取消失败！'
              console.log(error, 'error')
            })
          this.$message({
            message: msg,
            type: type
          })
        })
        .catch(() => { })
    },
    closeField () {
      this.visibleField = false
    },
    closeProject () {
      this.visibleProject = false
    },
    saveCallback () {
      this.visibleProject = false
      this.visibleField = false
      this.queryList()
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    }
  }
}
</script>

<style scoped></style>
