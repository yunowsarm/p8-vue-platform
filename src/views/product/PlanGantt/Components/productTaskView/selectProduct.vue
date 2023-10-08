<template>
  <el-dialog title="选择图号" :visible.sync="visible" width="700px" :before-close="cancel" :style="{ '--height': renderDialogHeight + 'px' }" :append-to-body="true">
    <list-layout>
      <template #north>
        <el-button type="primary" @click="addMenu">新 建</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
        <search-form-list ref="search" :data-source="searchData" @search="search" @re-set="reSet"></search-form-list>
      </template>
      <template #center>
        <common-table
          ref="tableCom"
          :columns="columns"
          :params="queryParam"
          :flex="500"
          :api="tableApi"
          :custom-height="customHeight"
          :table-refresh="tableRefresh"
          :table-config="tableConfig"
          @row-click="rowClick"
          @row-dblclick="rowDblclick"
        >
          <template #opers="{ scope }">
            <span class="el-tooltip" tabindex="0">
              <button type="button" class="el-button el-button--text el-button--small">
                <span @click="opersClick(scope)">修改</span>
              </button>
            </span>
            <div class="el-divider el-divider--vertical"></div>
            <span class="el-tooltip" tabindex="0">
              <button type="button" class="el-button el-button--text el-button--small">
                <span @click="checkDelete(scope)">删除</span>
              </button>
            </span>
          </template>
        </common-table>
      </template>
      <template #drawer-panel>
        <common-drawer v-if="visibleModelEditDrawer" :drawer-config="drawerConfig" size="50%" :title="drawerTitle" :visible="visibleModelEditDrawer" @close="onEditModelClose">
          <template #drawer>
            <product-edit @save-success="saveCallback" :product-id="productId"></product-edit>
          </template>
        </common-drawer>
      </template>
    </list-layout>
  </el-dialog>
</template>
<style></style>
<script>
import { P8Table as CommonTable, P8ListLayout as ListLayout, Dialog, Button, P8Search as SearchFormList, P8Drawer as CommonDrawer } from 'p8-components-ui'

import ProductEdit from './productEdit'
import Vue from 'vue'
const mh = document.documentElement.clientHeight - 230
const columns = [
  {
    title: '序号',
    type: 'index',
    width: 55,
    align: 'center'
  },
  {
    title: '产品名称',
    dataIndex: 'mapName',
    minWidth: 300,
    align: 'left'
  },
  {
    title: '产品图号',
    dataIndex: 'mapCode',
    width: 180,
    align: 'center'
  },
  {
    title: '产品代号',
    dataIndex: 'productCode',
    width: 180,
    align: 'center'
  },
  {
    title: '操作',
    dataIndex: 'opers',
    scopedSlots: { customRender: 'custom' },
    align: 'center'
  }
]
const searchData = [
  {
    type: 'text', // 控件类型
    labelText: '产品图号 ', // 控件显示的文本
    fieldName: 'mapCode',
    placeholder: '请输入产品图号 '
  },
  {
    type: 'text', // 控件类型
    labelText: '产品名称', // 控件显示的文本
    fieldName: 'mapName',
    placeholder: '请输入产品名称', // 默认控件的空值文本
    fieldEvent: {
      click: 'clickEvent(this)'
    }
  },
  {
    type: 'text', // 控件类型
    labelText: '产品代号', // 控件显示的文本
    fieldName: 'productCode',
    placeholder: '请输入产品代号', // 默认控件的空值文本
    fieldEvent: {
      click: 'clickEvent(this)'
    }
  }
]

export default {
  name: 'SelectProject',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedProductInfoId: {
      type: String,
      default: ''
    }
  },
  components: {
    'el-dialog': Dialog,
    'el-button': Button,
    CommonTable,
    CommonDrawer,
    SearchFormList,
    ListLayout,
    ProductEdit
  },
  data() {
    return {
      renderDialogHeight: mh,
      customHeight: mh,
      tableConfig: {
        highlightCurrentRow: true
      },
      currentRow: {},
      queryParam: {},
      searchData: searchData,
      tableApi: 'productInfo.getProductList',
      columns: columns,
      drawerConfig: {
        modal: false,
        'modal-append-to-body': false,
        'append-to-body': true
      },
      visibleModelEditDrawer: false,
      drawerTitle: '',
      productId: ''
    }
  },
  methods: {
    addMenu() {
      this.productId = ''
      this.drawerTitle = '新建产品'
      this.visibleModelEditDrawer = true
    },
    opersClick(record) {
      this.productId = record.row.id
      this.drawerTitle = '修改产品'
      this.visibleModelEditDrawer = true
    },
    showMessage(obj, message, type) {
      obj.$message({
        message: message,
        type: type
      })
    },
    checkDelete(record) {
      const that = this
      if (that.selectedProductInfoId === record.row.id) {
        that
          .$alert('该产品已被使用，不可删除！', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
          .catch(() => {})
      } else {
        that.$api['productInfo.checkDelete']({ id: record.row.id }).then((res) => {
          if (res && res === 'true') {
            that.removeProduct(record)
          } else {
            that
              .$alert('该产品已被使用，不可删除！', '提示', {
                confirmButtonText: '确定',
                type: 'warning'
              })
              .catch(() => {})
          }
        })
      }
    },
    removeProduct(record) {
      const that = this
      that
        .$confirm(`是否要删除该条数据？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          that.$api['productInfo.removeProduct']({ id: record.row.id }).then((res) => {
            if (res && res === 'true') {
              that.showMessage(that, '删除失败', 'error')
              return false
            }
            that.showMessage(that, '删除成功', 'success')
            that.$refs.tableCom.searchData()
          })
        })
        .catch(() => {})
    },
    onEditModelClose() {
      this.visibleModelEditDrawer = false
      this.$refs.tableCom.searchData()
    },
    saveCallback() {
      this.visibleModelEditDrawer = false
      this.$refs.tableCom.searchData()
    },
    // 单击选中行
    rowClick(row, column, event) {
      this.currentRow = row
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblclick(row, column, event) {
      this.currentRow = row
      this.submit()
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
      this.$emit('close-modal', {})
    },
    submit() {
      this.$emit('close-modal', this.currentRow)
    },
    search(param) {
      const newParams = {
        ...param,
        ...(this.queryParam.roleName ? { roleName: this.queryParam.roleName } : {})
      }
      this.queryParam = newParams
      const that = this
      Vue.nextTick(function () {
        that.$refs.tableCom.queryList()
      })
    },
    reSet() {
      Object.keys(this.queryParam).forEach((key) => {
        this.queryParam[key] = ''
      })
      Vue.nextTick(function () {
        this.$refs.tableCom.searchData()
      })
    }
  }
}
</script>
