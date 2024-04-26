<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="选择组件"
                 :visible="visible"
                 :dialog-height="600"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 @close="handleCancel">
    <template #dialog>
      <el-tabs class="tabs"
               v-model="activeName">
        <el-tab-pane label="内部组件"
                     name="first">
          <normal-layout :header-visible="true">
            <template #west>
              <common-tree :data="treeData"
                           :tree-param="treeParam"
                           :tree-config="{ 'default-checked-keys': ['0'], 'default-checked-keys': ['table'] }"
                           :default-expand-all="true"
                           @select="onSelect"></common-tree>
            </template>
            <template #north>
              <search-form-list ref="search"
                                :dataSource="searchData"
                                @search="search"
                                @re-set="reSet"></search-form-list>
            </template>
            <template #center>
              <common-table ref="table"
                            :columns="columns"
                            :params="queryParam"
                            :api="tableApi"
                            :pagination="true"
                            :table-setting="false"
                            :select-all-hidden="true"
                            @select="select"
                            @row-dblclick="rowDblClick">
                <template #operation="{ scope }">
                  <el-button type="text"
                             @click="preview(scope.row)">预览</el-button>
                </template>
              </common-table>
            </template>
            <template #drawer-panel>
              <common-drawer title="预览"
                             :visible="functionTestVisible"
                             size="100%"
                             @close="functionTestVisible = false">
                <template #drawer>
                  <table-render :code="record.code"
                                :report-param="{}"></table-render>
                </template>
              </common-drawer>
            </template>
          </normal-layout>
        </el-tab-pane>
        <el-tab-pane label="自定义组件"
                     name="second">
          <div class="input-flex">
            <div>自定义组件地址&nbsp;&nbsp;&nbsp;</div>
            <el-input class="input"
                      v-model="inputUrl"
                      placeholder="请输入 例：XXX/XXX/XXX"></el-input>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 0 !important;
}
::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}
.tabs {
  height: 100%;
}
.input-flex {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.input {
  width: 75%;
}
</style>
<script>
import { Button } from 'element-ui'
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Dialog as CommonDialog, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Search as SearchFormList } from 'p8-components-ui'
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
const componentData = {
  table: {
    url: 'Framework/ComponentsMananger/Grid/Components/tableRender',
    columns: [
      {
        title: '',
        width: 35,
        type: 'selection'
      },
      {
        title: '序号',
        type: 'index',
        width: 55,
        align: 'center'
      },
      {
        title: '报表编码',
        dataIndex: 'code',
        minWidth: 120,
        align: 'center'
      },
      {
        title: '报表名称',
        dataIndex: 'name',
        minWidth: 120,
        align: 'center'
      },
      {
        title: '描述',
        dataIndex: 'content',
        minWidth: 150,
        align: 'center'
      },
      {
        title: '创建人',
        dataIndex: 'createBy',
        minWidth: 80,
        align: 'center'
      },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        scopedSlots: { customRender: 'custom' },
        minWidth: 80,
        align: 'center'
      }
    ],
    api: 'formGenerator.tableList',
    searchData: [
      {
        type: 'text',
        labelText: '表格名字',
        fieldName: 'name',
        placeholder: '请输入表格名字'
      },
      {
        type: 'text',
        labelText: '表格编码',
        fieldName: 'code',
        placeholder: '请输入表格编码'
      }
    ]
  },
  form: {
    url: 'Framework/ComponentsMananger/Form/Components/Components/edit',
    columns: [
      {
        title: '',
        width: 35,
        type: 'selection'
      },
      {
        title: '序号',
        type: 'index',
        width: 55,
        align: 'center'
      },
      {
        title: '表单编码',
        dataIndex: 'desformCode',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '表单名称',
        dataIndex: 'desformName',
        align: 'left',
        headerAlign: 'left'
      },
      // {
      //   title: '数据源',
      //   dataIndex: 'cgFormTableName'
      // },
      {
        title: '表单状态',
        dataIndex: 'desformStatus',
        formatter: function (row, column, cellValue, index) {
          let date = ''
          if (cellValue === '0') {
            date = '未发布'
          } else if (cellValue === '1') {
            date = '已发布'
          }
          return date
        },
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '描述',
        dataIndex: 'desformDesc',
        align: 'left',
        headerAlign: 'left'
      }
    ],
    api: 'formGenerator.formList',
    searchData: [
      {
        type: 'text',
        labelText: '表单名称',
        fieldName: 'desformName',
        placeholder: '请输入表单名称'
      },
      {
        type: 'text',
        labelText: '表单编码',
        fieldName: 'desformCode',
        placeholder: '请输入表单编码'
      }
    ]
  },
  layout: {
    url: '',
    columns: [
      {
        title: '',
        width: 35,
        type: 'selection'
      },
      {
        title: '序号',
        type: 'index',
        width: 60,
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '状态',
        minWidth: 80,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'isEnabledDisplay'
      },
      {
        title: '布局名称',
        minWidth: 180,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'layoutName'
      },
      {
        title: '布局编号',
        minWidth: 120,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'layoutCode'
      },
      {
        title: '类型',
        minWidth: 100,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'layoutTypeDisplay'
      },
      {
        title: '渲染器',
        minWidth: 120,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'rendererDisplay'
      },
      {
        title: '渲染器版本',
        minWidth: 100,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'rendererVersion'
      },
      {
        title: '描述',
        minWidth: 200,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'description'
      },
      {
        title: '布局调用链接',
        minWidth: 200,
        align: 'left',
        headerAlign: 'left',
        dataIndex: 'url',
        formatter: function (row) {
          return row.rendererRendererComponent + '?code=' + row.layoutCode + '&version=' + row.version
        }
      }
    ],
    api: 'desLayout.list',
    searchData: [
      {
        type: 'text',
        labelText: '布局名称',
        fieldName: 'layoutName',
        placeholder: '请输入布局名称'
      },
      {
        type: 'text',
        labelText: '布局编号',
        fieldName: 'layoutCode',
        placeholder: '请输入布局编号'
      }
    ]
  },
  kanban: {
    url: '',
    columns: [
      {
        title: '',
        width: 35,
        type: 'selection'
      },
      {
        title: '序号',
        type: 'index',
        width: '55px',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '看板编码',
        dataIndex: 'code',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '看板名称',
        dataIndex: 'name',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '描述',
        dataIndex: 'describe',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '排序号',
        dataIndex: 'indexNo',
        align: 'left',
        headerAlign: 'left',
        width: '80px'
      },
      {
        title: '看板调用链接',
        dataIndex: 'compType',
        width: '180px',
        formatter: (row, column, cellValue, index) => {
          return 'Framework/System/KanbanDesign/kanbanView' + '?id=' + row.id + '&code=' + row.code
        },
        align: 'left',
        headerAlign: 'left'
      }
    ],
    api: 'kanbanView.list',
    searchData: [
      {
        type: 'text', // 组件名称
        labelText: '看板名称', // 控件显示的文本
        fieldName: 'name',
        defaultValue: '',
        placeholder: '请输入看板名称'
      },
      {
        type: 'text', // 组件名称
        labelText: '看板编码', // 控件显示的文本
        fieldName: 'code',
        defaultValue: '',
        placeholder: '请输入看板编码'
      }
    ]
  }
}
export default {
  name: 'SelectComponents',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data () {
    return {
      activeName: 'first',
      inputUrl: '',
      queryParam: {},
      treeParam: {},
      selectedRow: null,
      functionTestVisible: false,
      record: null,
      treeApi: '',
      tableApi: 'formGenerator.tableList',
      treeData: [
        { id: 'table', label: '表格组件' },
        { id: 'form', label: '表单组件' },
        { id: 'layout', label: '布局组件' },
        { id: 'kanban', label: '看板组件' }
      ],
      columns: [
        {
          title: '',
          width: 35,
          type: 'selection'
        },
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center'
        },
        {
          title: '报表编码',
          dataIndex: 'code',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '报表名称',
          dataIndex: 'name',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '描述',
          dataIndex: 'content',
          minWidth: 150,
          align: 'center'
        },
        {
          title: '创建人',
          dataIndex: 'createBy',
          minWidth: 80,
          align: 'center'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
          minWidth: 80,
          align: 'center'
        }
      ],
      type: 'table',
      searchData: [
        {
          type: 'text',
          labelText: '表格名字',
          fieldName: 'name',
          placeholder: '请输入表格名字'
        },
        {
          type: 'text',
          labelText: '表格编码',
          fieldName: 'code',
          placeholder: '请输入表格编码'
        }
      ]
    }
  },
  components: {
    'el-button': Button,
    NormalLayout,
    CommonTree,
    CommonDialog,
    CommonTable,
    CommonDrawer,
    TableRender,
    SearchFormList
  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },
    handleOk (e) {
      let params
      if (this.activeName === 'first') {
        switch (this.type) {
          case 'table':
            params = {
              id: this.selectedRow.id,
              name: this.selectedRow.name,
              code: this.selectedRow.code,
              url: 'Framework/ComponentsMananger/Grid/Components/tableRender'
            }
            break
          case 'form':
            params = {
              id: this.selectedRow.id,
              name: this.selectedRow.desformName,
              dataViewId: '',
              permissionVo: { router: this.$route.name },
              codeForm: this.selectedRow.desformCode,
              url: 'Framework/ComponentsMananger/Form/Components/Components/edit'
            }
            break
          case 'layout':
            params = {
              id: this.selectedRow.id,
              name: this.selectedRow.layoutName,
              layoutCode: this.selectedRow.layoutCode,
              layoutVersion: this.selectedRow.version,
              url: this.selectedRow.rendererRendererComponent
            }
            break
          case 'kanban':
            params = {
              id: this.selectedRow.id,
              name: this.selectedRow.name,
              code: this.selectedRow.code,
              url: 'Framework/System/KanbanDesign/kanbanView'
            }
            break
        }
      } else {
        params = {
          url: this.inputUrl
        }
      }
      this.$emit('handleOk', params)
    },
    onSelect (obj) {
      const that = this
      this.columns = componentData[obj.id].columns
      this.tableApi = componentData[obj.id].api
      this.searchData = componentData[obj.id].searchData
      this.type = obj.id
      that.$nextTick(() => {
        this.$refs.table.searchData()
      })
    },
    select (selection, row) {
      this.$refs.table.clearSelection()
      this.$refs.table.toggleRowSelection(row)
      this.selectedRow = row
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblClick (row, column, event) {
      this.$refs.table.clearSelection()
      this.$refs.table.toggleRowSelection(row)
      this.selectedRow = row
      this.handleOk()
    },
    preview (row) {
      this.record = Object.assign({}, row)
      this.functionTestVisible = true
    },
    search (queryParam) {
      this.queryParam = queryParam
    },
    reSet () {
      this.queryParam = {}
    }
  }
}
</script>
