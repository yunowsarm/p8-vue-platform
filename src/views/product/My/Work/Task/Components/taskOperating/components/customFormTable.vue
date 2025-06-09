<template>
  <list-layout style="margin: 0;"
               :headerVisible="headerVisible">
    <template #north>
      <el-button :comp="comp"
                 type="primary"
                 @click="createForm">新建</el-button>
    </template>
    <template #center>
      <component v-show="false" ref="form" :is="componentUrl"></component>
      <common-table ref="table"
                    :comp="comp"
                    :columns="columns"
                    class="customTable"
                    :no-api-table-data="editTableData"
                    :pagination="false">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click.stop="updateForm(scope.row)">修改</el-button>
          <el-button type="text"
                     @click.stop="viewForm(scope.row)">查看</el-button>
          <el-button type="text"
                     @click.stop="removeForm(scope.row)">删除</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <el-drawer :title="drawerTitle"
                 ref="drawer"
                 size="50%"
                 :append-to-body="true"
                 :destroy-on-close="true"
                 :wrapper-closable="false"
                 :visible.sync="drawerVisible"
                 @close="onDrawerClose">
        <component :is="componentUrl" :dataView="formView" :pageType="drawerContentView" @save-success="formCloseRefresh" @close="onDrawerClose"></component>
      </el-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import {defineComponent} from "vue";
export default {
  name: 'customFormTable',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    approveType: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      columns: [],
      comp: this,
      drawerTitle: null,
      drawerVisible: false,
      drawerContentView: '',
      editTableData: [],
      formView: null,
      dynamicData: {},
      headerVisible: true
    }
  },
  computed:{
    componentUrl(){
      const componentPath = this.item.formUrl
      const path = componentPath.startsWith('/') ? componentPath.slice(1) : componentPath;
      return defineComponent(require(`@/views/${path}.vue`).default);
    }
  },
  created () {

  },
  mounted() {
    if (this.item.name) {
      this.headerVisible = this.approveType;
      const fieldsInfo = this.$refs.form.fieldsInfo
      let columns = fieldsInfo.map(item => {
        return {
          title: item.label,
          minWidth: 100,
          dataIndex: item.key,
          align: 'center',
        }
      });
      if (this.headerVisible) {
        columns.push({
          title: '操作',
          fixed: 'right',
          width: 160,
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
        });
      }
      this.columns = columns;
      this.searchList();
    }

  },
  methods: {
    checkBusinessForm () {
      if (this.$refs.table && this.$refs.table.tableData.length) {
        return true
      } else {
        return false
      }
    },
    createForm () {
      this.drawerTitle = '新建'
      this.drawerVisible = true
      this.drawerContentView = 'add'
      this.formView = ''
    },
    updateForm (record) {
      // 修改
      this.drawerTitle = '修改'
      this.drawerVisible = true
      this.drawerContentView = 'edit'
      this.formView = record
    },
    viewForm (record) {
      // 查看
      this.drawerTitle = '查看'
      this.drawerVisible = true
      this.drawerContentView = 'view'
      this.formView = record
    },
    removeForm (record) {
      let checkMsg = '是否确定要删除该数据吗？'
      this.$confirm(checkMsg, '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          const index = this.editTableData.findIndex(item => item.id === record.id);
          if (index !== -1) {
            this.editTableData.splice(index,1)
          }
          // that.$api['taskManager.removeFormData'](
          //   {
          //     actOrTaskFormId: this.item.name,
          //     "vo": {
          //       "desFormId": this.item.formId,
          //       "dataIds": [record.ID]
          //     }
          //   }
          // ).then((res) => {
          //   that.searchList()
          // })
        })
        .catch(() => {

        })
    },
    onDrawerClose () {
      // 抽屉关闭
      this.drawerVisible = false
      this.drawerTitle = ''
    },
    formCloseRefresh (res,type) {
      if(type === 'add'){
        this.editTableData.push(res)
      }else if(type === 'edit'){
        const index = this.editTableData.findIndex(item => item.id === res.id);
        if (index !== -1) {
          this.$set(this.editTableData, index, res);
        }
      }
      this.drawerVisible = false
      this.$message({
        message: '提交成功！',
        type: 'success'
      })
    },
    async searchList () {
      this.editTableData = await this.$api['taskManager.taskFormdataList']({ actOrTaskFormId: this.item.name, formId: this.item.formId })
    },
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer
  }
}
</script>

<style lang="scss" scoped>
.customTable {
  ::v-deep .panination {
    display: none;
  }
}
</style>
