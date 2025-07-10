<template>
  <list-layout style="margin: 0;"
               :headerVisible="headerVisible">
    <template #north>
      <el-button :comp="comp"
                 type="primary"
                 @click="createForm">新建</el-button>
    </template>
    <template #center>
      <common-table ref="table"
                    v-if="columns.length"
                    :comp="comp"
                    :columns="columns"
                    class="customTable"
                    :no-api-table-data="editTableData"
                    :pagination="false">
        <template #operation="{ scope }">
          <el-button v-if="headerVisible" type="text"
                     @click.stop="updateForm(scope.row)">修改</el-button>
          <el-button type="text"
                     @click.stop="viewForm(scope.row)">查看</el-button>
          <el-button v-if="headerVisible" type="text"
                     @click.stop="removeForm(scope.row)">删除</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <el-drawer v-if="drawerVisible"
                 :title="drawerTitle"
                 size="50%"
                 :append-to-body="true"
                 :destroy-on-close="true"
                 :wrapper-closable="false"
                 :visible.sync="drawerVisible"
                 @close="onDrawerClose">
        <iframe :src="frameSrc" style="height: 99%;width: 100%;border: none"></iframe>
<!--        <form-render :record="{ desformCode: item.formCode }"-->
<!--                     :dataViewId="formViewId"-->
<!--                     :pageType="drawerContentView"-->
<!--                     @save-success="formCloseRefresh"></form-render>-->
      </el-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
export default {
  name: 'DepartmentIndex',
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
      formViewId: '',
      dynamicData: {},
      headerVisible: true
    }
  },
  computed:{
    token() {
      return this.$store.getters.token
    },

    frameSrc(){
      let iframeSrc
      console.log("行ID:",this.formViewId)
      if(this.formViewId){
        if(this.drawerContentView === 'edit'){
          iframeSrc = `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}/edit/${this.formViewId}?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.drawerContentView}`
        }else if(this.drawerContentView === 'view'){
          iframeSrc = `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}/detail/${this.formViewId}?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.drawerContentView}`
        }
      }else{
        if(this.drawerContentView === 'edit'){
          iframeSrc = `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.drawerContentView}`
        }
        // else if(this.drawerContentView === 'view'){
        //   iframeSrc =  `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}/detail?token=${this.token}&actOrTaskFormId=${this.item.name}`
        // }
      }
      console.log(iframeSrc)
      return iframeSrc
    }
  },
  async created () {
    if (this.item.name) {
      if (this.approveType) {
        this.headerVisible = true
      } else {
        this.headerVisible = false
      }
    }
    await this.searchList();
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
      this.drawerContentView = 'edit'
      this.formViewId = ''
    },
    updateForm (record) {
      // 修改
      this.drawerTitle = '修改'
      this.drawerVisible = true
      this.drawerContentView = 'edit'
      this.formViewId = record[this.idField]
    },
    viewForm (record) {
      // 查看
      this.drawerTitle = '查看'
      this.drawerVisible = true
      this.drawerContentView = 'view'
      this.formViewId = record[this.idField]
    },
    removeForm (record) {
      debugger
      let dataIds = []
      let id = record[this.idField]
      if(id){
        dataIds.push(id)
      }
      // 删除
      const that = this
      let checkMsg = '是否确定要删除该数据吗？'
      this.$confirm(checkMsg, '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['taskManager.removeTemplateData'](
            {
              actOrTaskFormId: this.item.name,
              "vo": {
                "desFormId": this.item.formId,
                "dataIds": dataIds
              }
            }
          ).then((res) => {
            that.searchList()
          })
        })
        .catch(() => {

        })
    },
    onDrawerClose () {
      // 抽屉关闭
      this.drawerVisible = false
      this.drawerContentView = ''
      this.drawerTitle = ''
      this.formViewId = ''
      this.searchList()
    },
    // formCloseRefresh (res) {
    //   this.$api['taskManager.taskFormDataSave']({ actOrTaskFormId: this.item.name, formDataId: res }).then(res => {
    //     this.drawerVisible = false
    //     this.searchList()
    //   })
    // },
    async searchList () {
      const res = await this.$api['taskManager.taskTemplateList']({ actOrTaskFormId: this.item.name, formId: this.item.formId })
      this.idField = res.idField
      this.editTableData = res.data || []
      if(!res.field.length) return
      let columns = res.field.map(item => {
        return {
          title: item.label,
          minWidth: 100,
          dataIndex: item.field,
          align: 'center',
        }
      });
      columns.push({
        title: '操作',
        fixed: 'right',
        width: this.headerVisible ? 160 : 80,
        dataIndex: 'operation',
        scopedSlots: { customRender: 'custom' },
      });
      this.columns = columns;
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
