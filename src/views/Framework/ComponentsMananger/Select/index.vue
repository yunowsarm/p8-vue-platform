<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <normal-layout class="normalContain">
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
    <template #west>
      <common-tree :data="treeData"
                   @select="onTreeNodeSelect"
                   :tree-config="treeCfg"></common-tree>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :columns="columns"
                    :use-system-config-button="0"
                    :custom-button-data="customButtonData"
                    :params="queryParam"
                    :api="tableApi"
                    :pagination="true"></common-table>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleEditDrawer"
                     :title="drawerTitle"
                     :visible="visibleEditDrawer"
                     @close="onEditSelectionClose">
        <template #drawer>
          <selection-edit :id="recordId"
                          @cancel="onEditSelectionClose"
                          :selection-type-id="selectionTypeId"
                          @saveSuccess="onSave"></selection-edit>
        </template>
      </common-drawer>
    </template>
  </normal-layout>
</template>

<script>
import { P8Search as SearchFormList, P8Button as CommonButton, P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'

import SelectionEdit from './Components/edit'
import moment from 'moment'

const TREE_DATA = [
  {
    id: 'root',
    label: '选项类别',
    value: 'root',
    children: [
      {
        id: 1,
        label: '目录类',
        value: 1
      },
      {
        id: 2,
        label: '树形类',
        value: 2
      },
      {
        id: 3,
        label: '表格类',
        value: 3
      }
    ]
  }
]

export default {
  name: 'SelectPage',
  components: {
    NormalLayout,
    CommonTree,
    CommonButton,
    CommonTable,
    CommonDrawer,
    SelectionEdit,
    SearchFormList
  },
  data () {
    return {
      searchData: [
        {
          type: 'text',
          labelText: '名称',
          fieldName: 'selectionName',
          placeholder: '请输入名称'
        },
        {
          type: 'text',
          labelText: '编码',
          fieldName: 'selectionCode',
          placeholder: '请输入编码'
        }
      ],
      comp: this,
      customButtonData: [
        {
          id: 'btn-001',
          enable: '1',
          indexNumber: 1,
          eventHandle: 'onCreate',
          image: 'fdddfont icon-add-new',
          title: '新建',
          location: 'head'
        },
        {
          id: 'btn-002',
          enable: '1',
          indexNumber: 2,
          eventHandle: 'onUpdate',
          image: 'fdddfont icon-add-new',
          title: '修改',
          location: 'row'
        },
        {
          id: 'btn-003',
          enable: '1',
          indexNumber: 3,
          eventHandle: 'onDelete',
          image: 'fdddfont icon-add-new',
          title: '删除',
          location: 'row'
        },
        {
          id: 'btn-004',
          enable: '1',
          indexNumber: 4,
          eventHandle: 'onView',
          image: 'fdddfont icon-add-new',
          title: '预览',
          location: 'row'
        }
      ],
      visibleEditDrawer: false,
      drawerTitle: '',
      // buttons: BTN_DATA,
      treeData: TREE_DATA,
      selectionTypeId: 1,
      recordId: '',
      tableApi: 'selection.list',
      treeCfg: {
        'current-node-key': 1
      },
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '50',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '编码',
          dataIndex: 'selectionCode',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '名称',
          dataIndex: 'selectionName',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '类别',
          dataIndex: 'selectionType',
          align: 'left',
          headerAlign: 'left',
          formatter (row, column, cellValue, index) {
            let v = ''
            switch (cellValue) {
              case 1:
                v = '目录类'
                break
              case 2:
                v = '树形类'
                break
              case 3:
                v = '表格类'
                break
            }
            return v
          }
        },
        {
          title: '数据来源',
          dataIndex: 'dataSourceType',
          align: 'left',
          headerAlign: 'left',
          formatter (row, column, cellValue, index) {
            let v = ''
            switch (cellValue) {
              case 1:
                v = '数据字典'
                break
              case 2:
                v = 'SQL数据视图'
                break
            }
            return v
          }
        },
        {
          title: '创建人',
          dataIndex: 'createUser',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          formatter: function (row, column, cellValue, index) {
            let date = ''
            if (cellValue && cellValue !== '') {
              date = moment(cellValue).format('YYYY-MM-DD')
            }
            // console.log('date', date)
            return date
          },
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '修改人',
          dataIndex: 'updateUser',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '修改时间',
          dataIndex: 'updateTime',
          formatter: function (row, column, cellValue, index) {
            let date = ''
            if (cellValue && cellValue !== '') {
              date = moment(cellValue).format('YYYY-MM-DD')
            }
            // console.log('date', date)
            return date
          },
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          width: '150',
          scopedSlots: {
            customRender: 'operation'
          },
          align: 'left',
          headerAlign: 'left'
        }
      ],
      queryParam: {
        selectionType: 1
      }
    }
  },
  // computed: {
  //   queryParam() {
  //     return {selectionType: this.selectionTypeId}
  //   }
  // },
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
    onCreate () {
      this.recordId = ''
      if (this.selectionTypeId === 'root') {
        this.$message({ message: '请选择具体的子类别！', type: 'warning' })
        return
      }
      this.visibleEditDrawer = true
      this.drawerTitle = '新建'
    },
    onUpdate (record) {
      this.recordId = record.id
      this.selectionTypeId = record.selectionType
      this.visibleEditDrawer = true
      this.drawerTitle = '修改'
    },
    onEditSelectionClose () {
      this.selectionTypeId = this.queryParam.selectionType
      this.visibleEditDrawer = false
    },
    onTreeNodeSelect (node) {
      console.log('node', node)
      this.selectionTypeId = node.id
      this.queryParam.selectionType = node.id
      // this.$refs.table.searchData()
    },
    onSave (res) {
      console.log('修改页面关闭时的回调方法')
      this.$refs.table.searchData()
      this.onEditSelectionClose()
    },
    onDelete (record) {
      const that = this
      this.$confirm('是否确定要删除该选项？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['selection.remove']({
            id: record.id
          }).then((res) => {
            console.log(res)
            that.$refs.table.searchData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    onView (record) {
      this.$message.warning('预览功能暂未开发！')
    }
  }
}
</script>
<style lang="scss" scoped>
.normalContain ::v-deep .normal-center {
  padding: 0 15px;
}
.normalContain ::v-deep .normal-header {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
