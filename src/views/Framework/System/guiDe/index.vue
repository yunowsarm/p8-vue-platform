<template>
    <list-layout class="list-layout">
      <template #north>
        <el-button type="primary"
                   @click="restoreDeleted()">恢复删除项</el-button>
        <search-form-list ref="search"
                          label-width="100px"
                          :data-source="searchData"
                          @search="search"
                          @re-set="reSet"></search-form-list>
      </template>
      <template #center>
        <common-table ref="table"
                      class="table"
                      :comp="comp"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :use-tree-format="true"
                      :table-config="tableConfig"
                      :use-tree-p-id="useTreePId"
                      :table-setting="false"
                      :pagination="false">
          <template #operatingManual="{ scope }">
            <i class="p8 icon-caozuoshouce" style="cursor: pointer;color:black;" @click="openManual(scope.row)"> </i>
          </template>
          <template #videoTutorials="{ scope }">
            <i class="p8 icon-shipin" style="cursor: pointer;color:black;" @click="openVideo(scope.row)"></i>
          </template>
          <template #operation="{ scope }">
            <el-button type="text"
                       @click="deletePrivew(scope.row)">删除</el-button>
          </template>
        </common-table>
      </template>
      <template #drawer-panel>
        <common-drawer v-if="isVisibleHistoryDrawer"
                       title="视频教程"
                       :visible="isVisibleHistoryDrawer"
                       placement="top"
                       size="100%"
                       @close="isVisibleHistoryDrawer = false"
                       >
          <template #drawer>
            <videoViewing v-if="isVisibleHistoryDrawer" :record="record"></videoViewing>
          </template>
        </common-drawer>
        <common-drawer v-if="isVisiblePDFdrawer"
                       title="操作手册"
                       :visible="isVisiblePDFdrawer"
                       placement="top"
                       size="100%"
                       @close="isVisiblePDFdrawer = false"
                       >
          <template #drawer>
            <PDFpreview v-if="isVisiblePDFdrawer" :record="record"></PDFpreview>
          </template>
        </common-drawer>
      </template>
    </list-layout>
  </template>
  
  <script>
  import {
    P8ListLayout as ListLayout,
    P8Table as CommonTable,
    P8Drawer as CommonDrawer,
    P8Search as SearchFormList,
  } from 'p8-components-ui'
  import videoViewing from './components/videoPlayer.vue'
  import PDFpreview from './components/PDFpreview.vue'
  export default {
    name: 'myNetworkDisk',
    components: {
      ListLayout,
      CommonTable,
      CommonDrawer,
      SearchFormList,
      videoViewing,
      PDFpreview
    },
    props: {
    },
    data: function () {
      return {
        comp: this,
        tableConfig: {
            'default-expand-all': true
        },
        queryParam: {body: {}},
        tableApi: 'SystemSettings.loadBootstrapMenuList',
        isVisibleHistoryDrawer: false,
        isVisiblePDFdrawer: false,
        searchData: [
          {
            type: 'text',
            labelText: '功能/场景名称',
            fieldName: 'title',
            placeholder: '请输入文件功能/场景',
            colLayout: 'singleCol'
          }
        ],
        useTreePId: 'parentId',
        columns: [
        //   {
        //     title: '序号',
        //     type: 'index',
        //     width: 55,
        //   },
          {
            title: '功能/场景',
            dataIndex: 'title',
            align: 'left',
            minWidth: 260
          },
          {
            title: '操作手册',
            dataIndex: 'operatingManual',
            align: 'center',
            scopedSlots: { customRender: 'custom' }
          },
          {
            title: '视频教程',
            dataIndex: 'videoTutorials',
            align: 'center',
            scopedSlots: { customRender: 'custom' }
          },
          {
            title: '操作',
            fixed: 'right',
            dataIndex: 'operation',
            scopedSlots: { customRender: 'custom' },
            width: 140,
            align: 'center'
          }
        ],
        record: {}
      }
    },
    computed: {
    },
    mounted () {
    },
    methods: {
      restoreDeleted () {
        this.$confirm('是否确定要恢复所有删除项？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$api['SystemSettings.restore']({ body: {} })
              .then((res) => {
                if (res) {
                  this.$message.success('恢复成功')
                  this.$refs.table.searchData()
                }
              })
          })
          .catch((e) => {
          })
      },
      deletePrivew (row) {
        this.$confirm('是否确定要删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$api['SystemSettings.delete']({ menuId: row.id })
              .then((res) => {
                if (res) {
                  this.$message.success('删除成功')
                  this.$refs.table.searchData()
                }
              })
          })
          .catch((e) => {
          })
      },
      reSet () {
        const this_ = this
        Object.keys(this_.queryParam).forEach((key) => {
          this_.queryParam[key] = null
        })
        Vue.nextTick(function () {
          this_.$refs.table.searchData()
        })
      },
      search (searchData) {
        this.queryParam = searchData
      },
      openVideo (row) {
        this.record = row
        this.isVisibleHistoryDrawer = true
      },
      openManual (row) {
        this.record = row
        this.isVisiblePDFdrawer = true
      }
    }
  }
  </script>
  <style lang="scss" scoped>
  </style>
  