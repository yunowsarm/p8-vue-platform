<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"></common-button>
      <search-form-list ref="search"
                        label-width="100px"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <normal-layout :header-visible="false">
        <template #west>
          <common-tree :tree-api="treeApi"
                       ref="tree"
                       :indent="26"
                       :node-slot="true"
                       :tree-config="treeConfig"
                       @select="onSelect">
            <template #tree="{ node }">
              <div style="display: flex; width: 100%">
                <i class="p8 tree_icon icon-fill-in-approval-comments"></i>
                <span class="labelShow">{{ node.label }}</span>
                <span class="iconOperation">
                  <i class="p8 tree_icon icon-modify2"
                     @click.stop="classifyModify(node.data)"></i>
                  <i class="p8 tree_icon icon-remove"
                     @click.stop="classifyRemove(node.data)"></i>
                </span>
              </div>
            </template>
          </common-tree>
        </template>
        <template #center>
          <common-table ref="table"
                        :comp="comp"
                        :table-config="tableConfig"
                        :columns="columns"
                        :params="queryParam"
                        :has-w-b-s="true"
                        :api="tableApi"
                        :table-refresh="tableRefresh"
                        :pagination="false">
            <template #icon="{ scope }">
              <i :class="[scope.row.icon ? scope.row.icon : '']"
                 :style="{ 'font-size': '18px', color: scope.row.color }"></i>
            </template>
          </common-table>
        </template>
        <template #drawer-panel>
          <common-drawer v-if="visibleClassifyEditDrawer"
                         :title="drawerTitle"
                         :visible="visibleClassifyEditDrawer"
                         @close="onEditClassifyClose"
                         :size="drawerSize">
            <template #drawer>
              <classify-edit @save-success="saveCallback"
                             @cancel="visibleClassifyEditDrawer = false"
                             :row-id="rowId"></classify-edit>
            </template>
          </common-drawer>
          <common-drawer v-if="visibleOptionEditDrawer"
                         :title="drawerTitle"
                         :visible="visibleOptionEditDrawer"
                         @close="onEditOptionClose"
                         :size="drawerSize">
            <template #drawer>
              <option-edit @save-success="saveOptionCallback"
                           @cancel="visibleOptionEditDrawer = false"
                           :row-id="rowId"
                           :tree-id="treeId"
                           :record="record"></option-edit>
            </template>
          </common-drawer>
        </template>
      </normal-layout>
    </template>
  </list-layout>
</template>

<style lang="scss" scoped>
.iconOperation {
  width: 50px;
  float: right;
}
.labelShow {
  display: inline-block;
  width: calc(100% - 51px);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
::v-deep .commonTree.el-tree > .el-tree-node {
  width: 100%;
  padding-right: 16px;
}
// ::v-deep .splitBtn {
//   display: none !important;
// }
::v-deep .list-main {
  padding: 0 !important;
}
::v-deep .normal-layout {
  padding-left: 0 !important;
}
.tree_icon {
  color: #a9a9a9;
}
</style>
<script>
import { P8Search as SearchFormList, P8ListLayout as ListLayout, P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import classifyEdit from './classifyEdit'
import optionEdit from './optionEdit'
const columns = [
  {
    title: '序号',
    type: '',
    dataIndex: 'WBS',
    width: '50px'
  },
  {
    title: '选项名称',
    dataIndex: 'meaning',
    minWidth: '150',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '字典编码',
    dataIndex: 'minorcode',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '排序号',
    dataIndex: 'orderNo',
    minWidth: '70',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '停用状态',
    dataIndex: 'isDeleteDisplay',
    minWidth: '80',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    minWidth: '50',
    align: 'left',
    headerAlign: 'left',
    scopedSlots: {
      customRender: 'custom'
    }
  },
  {
    title: '主数据编码',
    dataIndex: 'sourceDataNo',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'operation',
    width: '120',
    scopedSlots: {
      customRender: 'operation'
    },
    align: 'left',
    headerAlign: 'left'
  }
]
export default {
  name: 'UserList',
  components: {
    NormalLayout,
    CommonTree,
    CommonButton,
    CommonTable,
    CommonDrawer,
    classifyEdit,
    optionEdit,
    ListLayout,
    SearchFormList
  },
  data () {
    return {
      searchData: [
        {
          type: 'text',
          labelText: '选项名称',
          fieldName: 'meaning',
          placeholder: '请输入选项名称'
        },
        {
          type: 'text',
          labelText: '字典编码',
          fieldName: 'minorcode',
          placeholder: '请输入字典编码'
        },
        {
          type: 'radioButton',
          labelText: '停用状态',
          options: [
            {
              value: '0',
              label: '启用'
            },
            {
              value: '1',
              label: '停用'
            }
          ],
          fieldName: 'isDelete',
          placeholder: ''
        }
      ],
      treeConfig: {
        'highlight-current': true,
        'current-node-key': '31'
      },
      drawerSize: '40%',
      drawerTitle: '',
      visibleClassifyEditDrawer: false,
      visibleOptionEditDrawer: false,
      treeApi: 'dictionaryManagement.dictCategoryTree',
      queryParam: {
        dicType: '-1'
      },
      tableApi: 'dictionaryManagement.list',
      columns: columns,
      rowId: '',
      tableConfig: {},
      treeId: '',
      comp: this,
      record: {}
    }
  },
  computed: {},
  mounted () { },
  methods: {
    search (param) {
      let that = this
      if (param) {
        that.queryParam = { ...param, ...that.queryParam }
      }
    },
    reSet () {
      let that = this
      that.queryParam = {
        dicType: '-1'
      }
    },
    onSelect (node) {
      if (node.layersParams) {
        this.queryParam.dicType = node.layersParams.dicType
      } else {
        this.queryParam.dicType = '-1'
      }
      this.treeId = node.id
    },
    // 新建分类
    createCategory () {
      this.rowId = ''
      this.drawerTitle = '新建分类'
      this.visibleClassifyEditDrawer = true
    },
    // 分类修改
    classifyModify (node) {
      this.drawerTitle = '修改分类'
      this.rowId = node.id
      this.visibleClassifyEditDrawer = true
    },
    // 分类删除
    classifyRemove (node) {
      const that = this
      this.$confirm(`确定要删除该分类吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['dictionaryManagement.remove']({
            id: node.id
          }).then((res) => {
            that.$message({ type: 'success', message: '删除成功' })
            that.$refs.tree.initTreeData()
            that.$refs.table.searchData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 导出SQL脚本
    exportSQL () {
      const that = this
      that.$api['dictionaryManagement.exportSQL']({}, { responseType: 'blob' }).then((data) => {
        const date = new Date()
        const file_name = '数据字典SQL导出' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        const file_type = 'sql'
        const blob = new Blob([data.data], { type: 'application/text' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.download = `${file_name}.${file_type}`
        document.body.appendChild(link)
        link.click()
      })
    },

    // 新建选项
    createDict () {
      this.rowId = ''
      this.record = {}
      this.drawerTitle = '新建选项'
      this.visibleOptionEditDrawer = true
    },
    // 修改 选项
    update (row) {
      this.rowId = row.id
      this.record = row
      this.drawerTitle = '修改选项'
      this.visibleOptionEditDrawer = true
    },
    // 启用 选项
    openingUp (row) {
      const that = this
      this.$confirm(`确定要启用该选项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['dictionaryManagement.openingUp']({ id: row.id }).then((res) => {
            if (res) {
              that.$message({ type: 'success', message: '操作成功' })
              that.$refs.table.searchData()
            }
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 停用 选项
    deactivate (row) {
      const that = this
      this.$confirm(`确定要停用该选项吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['dictionaryManagement.deactivate']({ id: row.id }).then((res) => {
            if (res) {
              that.$message({ type: 'success', message: '操作成功' })
              that.$refs.table.searchData()
            }
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 删除 选项
    remove (record) {
      const that = this
      this.$confirm(`是否确定要删除该人员？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['dictionaryManagement.remove']({
            id: record.id
          }).then((res) => {
            that.$refs.table.searchData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    onEditClassifyClose () {
      this.visibleClassifyEditDrawer = false
    },
    saveCallback () {
      this.$refs.tree.initTreeData()
      this.$refs.table.searchData()
      this.visibleClassifyEditDrawer = false
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    onEditOptionClose () {
      this.visibleOptionEditDrawer = false
    },
    saveOptionCallback () {
      this.$refs.table.searchData()
      this.onEditOptionClose()
    }
  }
}
</script>
