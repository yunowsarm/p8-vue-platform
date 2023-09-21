<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"></common-button>
      <el-button type="primary"
                 round
                 @click="createThird">新建</el-button>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :columns="columns"
                    :params="queryParam"
                    :api="tableApi"
                    :pagination="true">
                    <template #operation="{scope}">
                      <el-button type="text" round @click="updateThird(scope.row)">修改</el-button>
                      <el-divider direction="vertical"></el-divider>
                      <el-button type="text" round @click="deleteThird(scope.row)" :disabled="scope.row.type == '0'">删除</el-button>
                    </template>
                    </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleThirdDrawer"
                     :title="drawerTitle"
                     :visible="visibleThirdDrawer"
                     size="60%"
                     @close="visibleThirdDrawer = false">
        <template #drawer>
          <edit :id="id" :type="type" @saveSuccess="onEditThird"></edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<style></style>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer } from 'p8-components-ui'
import edit from './Components/edit.vue'
const columns = [
  {
    title: '序号',
    type: 'index',
    align: 'center',
    width: '50'
  },
  {
    title: '项目类型',
    dataIndex: 'projectTypeDisplay',
    minWidth: 150,
    align: 'center'
  },
  {
    title: '描述',
    dataIndex: 'describe',
    minWidth: 200,
    align: 'center'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 150,
    scopedSlots: { customRender: 'custom' },
    align: 'center'
  }
]
export default {
  name: 'RetryList',
  components: {
    ListLayout,
    CommonTable,
    CommonButton,
    CommonDrawer,
    edit
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      visibleThirdDrawer: false,
      queryParam: {},
      tableApi: 'taskAttribute.listData',
      columns: columns,
      id: '',
      type: '',
    }
  },
  methods: {
    createThird () {
      this.id = ''
      this.type = ''
      this.drawerTitle = '新建'
      this.visibleThirdDrawer = true
    },
    updateThird (record) {
      this.id = record.id
      this.type = record.type
      this.drawerTitle = '修改'
      this.visibleThirdDrawer = true
    },
    onEditThird () {
      this.visibleThirdDrawer = false
      this.$refs.table.searchData()
    },
    deleteThird (record) {
      this.$api['taskAttribute.delete']({id: record.id}).then(res => {
        if (res) {
          this.$refs.table.searchData()
        }
      })
    }
  }
}
</script>
