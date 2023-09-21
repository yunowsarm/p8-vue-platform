<template>
  <el-dialog title="选择经费节点" width="60%" :visible="visible" append-to-body destroy-on-close @close="handleCancel">
    <list-layout>
      <template #north>
        <el-button type="primary" @click="handleOk">确 定</el-button>
      </template>
      <template #center>
        <div class="common-table">
          <div :class="{ 'small-table': true }" :style="{ height: flexHeight }">
            <el-table ref="table" height="100%" stripe :data="data" row-key="id" @row-click="handleRowClick" @selection-change="handleSelectionChange">
              <el-table-column type="selection" align="center" width="50"> </el-table-column>
              <el-table-column type="index" label="序号" align="center" width="50"> </el-table-column>
              <el-table-column prop="content" label="经费节点" align="center" width="260"> </el-table-column>
              <el-table-column prop="money" label="预算（万元）" align="center" width="260"> </el-table-column>
              <el-table-column prop="years" label="预算时间" align="center"> </el-table-column>
            </el-table>
          </div>
          <div class="panination">
            <el-pagination background layout="total, prev, pager, next" :current-page="page.current" :page-size="page.size" :total="page.total" @current-change="changePage"></el-pagination>
          </div>
        </div>
      </template>
    </list-layout>
  </el-dialog>
</template>
<script>
import { Dialog, Button, Table, TableColumn, Pagination, P8ListLayout as ListLayout } from 'p8-components-ui'

import Vue from 'vue'

export default {
  name: 'AddRevenue',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    disabledRow: {
      type: Array,
      default: () => []
    },
    otherParam: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      flexHeight: '350px',
      queryParam: {},
      userParam: {},
      data: [], // 列表数据
      page: {
        current: 1,
        size: 10,
        total: 0,
        orders: []
      }, // 分页
      selectedRows: [],
      treeConfig: {
        'expand-on-click-node': false,
        'check-on-click-node': true
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    'el-button': Button,
    'el-table': Table,
    'el-table-column': TableColumn,
    'el-pagination': Pagination,
    ListLayout
  },
  mounted() {
    this.refresh()
  },
  methods: {
    handleCancel() {
      this.$refs.table.clearSelection()
      this.$emit('close-dialog', this.selectedRows, this.otherParam)
    },
    handleOk(e) {
      const that = this
      let type = 'success'
      let msg = '关联成功！'

      if (that.selectedRows.length === 0) {
        that.$message({
          message: '请选择经费节点',
          type: 'error'
        })
      } else {
        that.otherParam.revenueBudgetId = that.selectedRows.id

        that.$api['TaskRevenueInfo.saveRelation'](that.otherParam)
          .then((res) => {
            if (res && res === 'yes') {
              that.$emit('close-dialog', that.selectedRows, that.otherParam)
            } else {
              type = 'error'
              msg = '关联失败！'
            }
          })
          .catch((err) => {
            type = 'error'
            msg = '关联失败！'
            console.error(error)
          })
        that.$message({
          message: msg,
          type: type
        })
      }
    },
    // 当用户手动勾选数据行的 Checkbox 时触发的事件,确保只能选中一项数据

    handleSelectionChange(selection) {
      if (selection.length > 1) {
        this.$refs.table.clearSelection()
        this.$refs.table.toggleRowSelection(selection.pop(), true)
      } else {
        this.selectedRows = selection.pop()
      }
    },
    handleRowClick(row, c, e) {
      this.$refs.table.toggleRowSelection(row, true)
    },
    search() {
      const newParams = { ...this.userParam, ...(this.queryParam.departmentId ? { departmentId: this.queryParam.departmentId } : {}) }
      this.queryParam = newParams
      const that = this
      Vue.nextTick(function () {
        that.searchData()
      })
    },
    searchData() {
      // 查询列表数据时调用列表数据接口
      this.refresh()
    },
    changePage(pageNo) {
      // 分页时调用列表数据接口
      this.page.current = pageNo
      this.refresh()
    },
    refresh() {
      const params = {
        ...this.userParam,
        ...this.queryParam,
        ...this.otherParam,
        page: {
          current: this.page.current ? this.page.current : 1,
          size: this.page.size ? this.page.size : 10,
          orders: this.page.orders ? this.page.orders : []
        }
      }
      const that = this
      that.$api['TaskRevenueInfo.getRelationData'](params)
        .then(function (res) {
          const data = res.records
          data.forEach(function (item, idx) {
            item.key = item.id
          })
          that.data = data

          that.page = {
            total: res.total,
            current: res.current,
            size: res.size,
            orders: res.orders
          }
        })
        .catch(function (error) {
          console.error(error)
        })
    }
  }
}
</script>

<style lang="scss">
.common-table {
  &.flex-table {
    display: flex;
    flex-direction: column;
  }
  .small-table {
    width: 100%;
    flex: 1;
    display: inherit;
    // thead th, tbody td { padding: 7px 0 !important; }
  }
  .panination {
    margin: 9px 0;
    display: flex;
    flex: none;
    justify-content: flex-end;
  }
}
</style>
