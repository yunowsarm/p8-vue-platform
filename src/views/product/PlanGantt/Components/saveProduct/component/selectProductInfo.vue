<template>
  <el-dialog title="选择图号" :visible="visible" width="70%" height="500px" :before-close="cancel" :append-to-body="true">
    <list-layout>
      <template #north>
        <el-button type="primary" @click="createInfo">新 建</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
        <search-form-list ref="search" :data-source="searchData" @search="search"> </search-form-list>
      </template>
      <template #center>
        <div class="common-table" style="height: 500px">
          <el-table ref="table" height="450px" :max-height="flexHeight" :data="handleList.slice((currentPage - 1) * pageSize, currentPage * pageSize)" @row-click="rowClick">
            <el-table-column type="index" label="序号" align="center"></el-table-column>
            <el-table-column v-for="(item, index) in columns" :key="index" :prop="item.prop" :align="item.align" :type="item.type" :label="item.label" :width="item.width">
              <template slot-scope="scope">
                <template v-if="item.prop == 'operation'">
                  <span style="color: #0070c5" @click="update(scope.row)">修改</span>|<span style="color: #0070c5" @click="remove(scope.row)">删除</span>
                </template>
                <template v-else>
                  <span>{{ scope.row[item.prop] }}</span>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="handleList.length"
          >
          </el-pagination>
        </div>
        <edit v-if="createVisible" :visible="createVisible" :record="record" @close-modal="closeCreate" @save-success="saveCallback"></edit>
      </template>
    </list-layout>
  </el-dialog>
</template>

<script>
import { P8ListLayout as ListLayout, Dialog, Button, Table, TableColumn, Pagination, P8Search as SearchFormList } from 'p8-components-ui'

import Edit from './edit'

const mh = document.documentElement.clientHeight - 165
const columns = [
  {
    label: '产品名称',
    prop: 'mapName'
  },
  {
    label: '图号',
    prop: 'mapCode'
  },
  {
    label: '操作',
    prop: 'operation'
  }
]
export default {
  name: 'SelectProductInfo',
  props: ['selectedRow', 'visible'],
  components: {
    Edit,
    'el-dialog': Dialog,
    ListLayout,
    'el-button': Button,
    'el-table': Table,
    'el-table-column': TableColumn,
    'el-pagination': Pagination,
    SearchFormList
  },
  data() {
    return {
      tableConfig: {
        highlightCurrentRow: true
      },
      flexHeight: mh,
      currentRow: {},
      queryParam: {},
      tableApi: 'productInfo.getProductList',
      columns: columns,
      tableData: [],
      createVisible: false,
      handleList: [],
      // 当前页
      currentPage: 1,
      // 每页多少条
      pageSize: 10,
      record: '',
      searchData: [
        {
          type: 'text', // 控件类型
          labelText: '产品名称', // 控件显示的文本
          fieldName: 'mapName',
          placeholder: '请输入部门名称',
          defaultValue: null
        },
        {
          type: 'text', // 控件类型
          labelText: '图号', // 控件显示的文本
          fieldName: 'mapCode',
          placeholder: '请输入部门简称',
          defaultValue: null
        }
      ]
    }
  },
  mounted() {
    this.queryList()
  },
  methods: {
    queryList() {
      const that = this
      if (this.tableApi) {
        this.$api[this.tableApi]({ page: { current: 1, size: 14, orders: [] } }).then(function (res) {
          that.tableData = res.records
          that.handleList = res.records
        })
      }
    },
    rowClick(row, column, event) {
      this.currentRow = row
    },
    tableRefresh(param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    cancel() {
      this.$emit('close-dialog')
    },
    createInfo() {
      this.createVisible = true
    },
    submit() {
      this.$emit('close-dialog', this.currentRow)
    },
    search(param) {
      const newParams = { ...param }
      const that = this
      if (this.tableApi) {
        this.$api[this.tableApi](newParams).then(function (res) {
          that.tableData = res.records
          that.handleList = res.records
        })
      }
    },
    closeCreate() {
      this.createVisible = false
      this.record = ''
    },
    saveCallback(res) {
      this.createVisible = false
      this.queryList()
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    // 当前页
    handleCurrentChange(val) {
      this.currentPage = val
    },
    update(row) {
      if (row) {
        this.createVisible = true
        this.record = row.id
      }
    },
    remove(row) {
      if (row) {
        const that = this
        that
          .$confirm(`是否要删除该计划？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          .then(() => {
            let type = 'success'
            let msg = '删除成功！'
            that.$api['productInfo.removeProduct']({ id: row.id })
              .then((res) => {
                if (res && res.data) {
                  that.$message({
                    message: res.data.resultMsg,
                    type: 'warning'
                  })
                } else {
                  that.$refs.table.searchData()
                }
              })
              .catch(function (error) {
                type = 'error'
                msg = '删除失败！'
                console.error(error)
              })
            this.$message({
              message: msg,
              type: type
            })
          })
          .catch(() => {})
      }
    }
  }
}
</script>

<style scoped>
.el-dialog__body {
  height: 500px;
}
</style>
