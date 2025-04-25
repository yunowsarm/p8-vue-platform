<template>
  <normal-layout>
    <template #north
              v-if="viewType === 'table'">
      <common-button :comp="comp"
                     :button-type="'round'"
                     :button-config="buttonConfig"></common-button>
      <div class="upload-box">
        <common-upload :files="files"
                       :toolbarWritingDisplay='toolbarWritingDisplay'
                       @upload="handleUpload"
                       @remove="handleRemove"></common-upload>
        <search-form-list ref="search"
                          label-width="100px"
                          :data-source="searchData"
                          @search="search"
                          @re-set="reSet"></search-form-list>
      </div>
    </template>
    <template #west>
      <div class="treeContain">
        <common-tree :tree-api="treeDataApi"
                     :tree-param="treeParam"
                     @select="onSelect"></common-tree>
      </div>
    </template>
    <template #center>
      <div v-if="viewType === 'table'">
        <common-table ref="table"
                      :comp="comp"
                      :style="{ height: tableHeight }"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      @select="recordSelected"
                      :pagination="true"></common-table>
      </div>
      <div v-if="cardData.length > 0">
        <el-row>
          <el-col :span="5"
                  v-for="r in cardData"
                  :key="r.id"
                  :offset="cardData.length > 0 ? 1 : 0">
            <el-card :body-style="{ padding: '0px' }">
              <img src=""
                   class="image" />
              <div style="padding: 14px">
                <span>{{ r.name }}</span>
                <div class="bottom clearfix">
                  <time class="time">{{ r.itemCreateTime }}</time>
                  <el-button type="text"
                             @click="download(r)"
                             class="button">下载</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <span v-else
            class="span-bg"></span>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="isVisibleDocumentViewDrawer"
                     :title="documentViewDrawerTitle"
                     :visible="isVisibleDocumentViewDrawer"
                     placement="top"
                     size="50%"
                     @close="documentViewDrawerClose">
        <template #drawer>
          <DocumentView :record="selectedRecord"
                        @cancel="isVisibleDocumentViewDrawer = false"
                        @close="documentViewDrawerClose"></DocumentView>
        </template>
      </common-drawer>
      <common-drawer v-if="isVisibleDocumentEditDrawer"
                     :title="documentEditDrawerTitle"
                     :visible="isVisibleDocumentEditDrawer"
                     placement="top"
                     size="50%"
                     @close="documentEditDrawerClose">
        <template #drawer>
          <DocumentEdit :record="selectedRecord"
                        @cancel="isVisibleDocumentEditDrawer = false"
                        @close="documentEditDrawerClose"></DocumentEdit>
        </template>
      </common-drawer>
    </template>
  </normal-layout>
</template>

<script>
import {
  P8NormalLayoutV1 as NormalLayout,
  P8Table as CommonTable,
  P8Tree as CommonTree,
  P8Drawer as CommonDrawer,
  P8Button as CommonButton,
  P8Upload as CommonUpload,
  P8Search as SearchFormList,
  Card,
  Button,
  Row,
  Col
} from 'p8-components-ui'

import DocumentEdit from './edit'
import DocumentView from './view'

import Vue from 'vue'
export default {
  name: 'DocumentManagement',
  components: {
    NormalLayout,
    CommonTable,
    CommonTree,
    CommonDrawer,
    CommonButton,
    DocumentEdit,
    DocumentView,
    CommonUpload,
    SearchFormList,
    'el-card': Card,
    'el-button': Button,
    'el-row': Row,
    'el-col': Col
  },
  props: {
    files: {
      type: Array,
      default: () => []
    },
    viewType: {
      type: String,
      default: () => {
        return 'table'
      }
    }
  },
  data: function () {
    return {
      tableHeight: document.documentElement.clientHeight * 0.9 - 150 + 'px',
      comp: this,
      classify: [],
      queryParam: {},
      tableApi: 'documentManagement.listPage',
      cardApi: 'documentManagement.list',
      treeDataApi: 'documentManagement.getAllDicByCodeType',
      cardData: [],
      treeParam: { dicType: 'DOCUMENT_CLASSIFY' },
      isTreeSelectView: false,
      isVisibleDocumentViewDrawer: false,
      isVisibleDocumentEditDrawer: false,
      documentEditDrawerTitle: '文档修改',
      documentViewDrawerTitle: '文档查看',
      selectedRecord: undefined,
      uploadFiles: [],
      drawerConfig: {
        modal: false
      },
      buttonConfig: {
        icon: 'edit'
      },
      searchData: [
        {
          type: 'text',
          labelText: '文件名称',
          fieldName: 'name',
          placeholder: '请输入文件名称',
          colLayout: 'singleCol'
        }
      ],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '文件名称',
          dataIndex: 'name',
          width: 250,
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '文件描述',
          dataIndex: 'description',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '上传人',
          dataIndex: 'createUserName',
          width: 100,
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '上传时间',
          dataIndex: 'itemCreateTime',
          width: 140,
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          align: 'left',
          headerAlign: 'left'
        }
      ],
      toolbarWritingDisplay: 'true'
    }
  },
  mounted () {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = 'true'
    }
    this.isTreeSelectView = true
    if (this.viewType !== 'table') {
      this.queryData()
    }
  },
  methods: {
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {

        })
    },
    onSelect (node) {
      this.queryParam.classify = node.id
      this.queryData()
    },
    save () {
      const this_ = this
      this.$api['documentManagement.save']({ uploadFiles: this.uploadFiles, classify: this.queryParam.classify ? this.queryParam.classify : 'dc_0101' }).then((res) => {
        this_.$message({
          message: '操作成功',
          type: 'success'
        })
        this_.queryData()
        this_.uploadFiles = []
      })
    },
    queryData (params) {
      const this_ = this
      this.queryParam = { ...this.queryParam, ...params }
      if (this_.viewType === 'table') {
        Vue.nextTick(function () {
          this_.$refs.table.queryList()
        })
      } else {
        this.$api[this_.cardApi](this.queryParam).then((res) => {
          this_.cardData = res
        })
      }
    },
    documentViewDrawerClose () {
      this.isVisibleDocumentViewDrawer = false
    },
    documentEditDrawerClose () {
      this.$refs.table.searchData()
      this.isVisibleDocumentEditDrawer = false
    },
    recordSelected (record) {
      this.selectedRecord = record
    },
    view (record) {
      this.selectedRecord = record
      this.isVisibleDocumentViewDrawer = true
    },
    edit (record) {
      this.selectedRecord = record
      this.isVisibleDocumentEditDrawer = true
    },
    delete (record) {
      const this_ = this
      this.selectedRecord = record
      this.$confirm(`是否确定要删除该附件？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this_.$api['documentManagement.delete']({ id: record.id }).then((res) => {
            this_.queryData()
          })
        })
        .catch((e) => {

        })
    },
    handleUpload (file) {
      this.uploadFiles.push(file)
      this.save()
    },
    handleRemove (file) {
      const removeIndex = this.uploadFiles.findIndex((fileItem) => fileItem.filePath === file.filePath)
      this.uploadFiles.splice(removeIndex, 1)
      this.save()
    },
    download (r) {
      if (!r.attachmentId) {
        this.$message({
          type: 'error',
          message: '文件不存在'
        })
        return
      }
      this.$api['documentManagement.download']({ attachmentId: r.attachmentId }, { responseType: 'blob' })
        .then((backJson) => {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = r.name
          document.body.appendChild(link)

          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
        .finally(() => { })
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
      this.queryData(searchData)
    }
  }
}
</script>
<style lang="scss" scoped>
.upload-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}

.clearfix:after {
  clear: both;
}

.treeContain {
  width: 100%;
  height: calc(100% - 50px);
  overflow: auto;
  box-sizing: border-box;
}
// .search-wrapper {
// float: left;
// }
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
.normalUpload ::v-deep {
  .normal-header {
    height: 60px;
  }
  .normal-center {
    height: calc(100% - 60px);
  }
}
::v-deep.normal-header {
  height: 55px !important;
}
</style>
