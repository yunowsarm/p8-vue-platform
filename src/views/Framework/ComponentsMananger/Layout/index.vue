<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :custom-button-data="customButtonData"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        labelWidth="100px"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :params="queryParam"
                    :columns="columns"
                    :table-config="tableConfig"
                    :table-refresh="tableRefresh"
                    :pagination="true"
                    :api="tableApi"> </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="drawerVisible"
                     direction="ttb"
                     size="100%"
                     @close="onDrawerClose">
        <template #drawer>
          <department-edit-view @saveSuccess="saveCallback"
                                :record-id="recordId"></department-edit-view>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8Search as SearchFormList, P8Button as CommonButton, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import departmentEditView from '@/views/Framework/ComponentsMananger/Layout/Components/edit.vue'
export default {
  name: 'Department',
  data () {
    return {
      queryParam: {},
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
      ],
      customButtonData: [
        {
          'id': 'btn-001',
          'enable': '1',
          'indexNumber': 1,
          'eventHandle': 'create',
          'image': 'fdddfont icon-add-new',
          'title': '新建',
          'location': 'head'
        }
      ],
      columns: [
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
        // {
        //   title: '布局调用链接',
        //   minWidth: 200,
        //   align: 'left',
        //   headerAlign: 'left',
        //   dataIndex: 'url',
        //   formatter: function (row) {
        //     return row.rendererRendererComponent + '?code=' + row.layoutCode + '&version=' + row.version
        //   }
        // },
        {
          title: '操作',
          width: 120,
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      tableApi: 'desLayout.list',
      comp: this,
      drawerTitle: null,
      drawerVisible: false,
      recordId: null,
      tableConfig: {
        'default-expand-all': true
      }
    }
  },
  methods: {
    search (param) {
      let that = this
      if (param) {
        that.queryParam = param
      }
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach(key => { that.queryParam[key] = null })
    },
    create () {
      this.drawerTitle = '新建布局'
      this.drawerVisible = true
      this.recordId = null
    },
    update (record) {
      // 修改
      this.drawerTitle = '修改布局'
      this.drawerVisible = true
      this.recordId = record.id
    },
    delete (record) {
      // 删除
      let that = this
      this.$confirm('是否确定要删除该布局？', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['desLayout.remove']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
          })
        })
        .catch(() => {
          console.log('取消')
        })
    },
    // 禁用
    disabledLayout (record) {
      let that = this
      this.$confirm('是否确定要禁用该布局？', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['desLayout.disabled']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
          })
        })
        .catch(() => {
          console.log('取消')
        })
    },
    // 启用
    enabledLayout (record) {
      let that = this
      this.$confirm('是否确定要启用该布局？', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['desLayout.enabled']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
          })
        })
        .catch(() => {
          console.log('取消')
        })
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('table--异步成功后端做的操作')
        })
        .catch(() => {
          console.log('table--异步失败的操作')
        })
    },
    onDrawerClose () {
      this.drawerVisible = false
      this.drawerTitle = null
    },
    saveCallback (res) {
      this.$refs.table.searchData()
      this.onDrawerClose()
    },
    layoutAddress (record) {
      let url = record.rendererRendererComponent + '?code=' + record.layoutCode + '&version=' + record.version
      this.$confirm(url, '布局配置地址', {
        confirmButtonText: '复制',
        showCancelButton: false,
        type: 'info'
      }).then(() => {
        (function () {
          document.oncopy = function (e) {
            e.clipboardData.setData('text', url);
            e.preventDefault();
            document.oncopy = null;
          }
      })(url);
      document.execCommand('Copy');
      this.$message({
          type: 'success',
          message: '已复制到粘贴板'
        });
      })
    }
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer,
    departmentEditView,
    SearchFormList
  }
}
</script>

<style lang="scss" scoped></style>
