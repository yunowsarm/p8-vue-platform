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
      <el-drawer v-if="drawerVisible"
                 :title="drawerTitle"
                 size="50%"
                 :append-to-body="true"
                 :destroy-on-close="true"
                 :wrapper-closable="false"
                 :visible.sync="drawerVisible"
                 @close="onDrawerClose">
        <form-render :record="{ desformCode: item.formCode }"
                     :dataViewId="formViewId"
                     :pageType="drawerContentView"
                     @save-success="formCloseRefresh"></form-render>
      </el-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
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
  async created () {
    let that = this
    let dynamicTagList = ['el-select', 'eject-select', 'tree-select'];
    await this.searchList();
    if (this.item.name) {
      if (this.approveType) {
        this.headerVisible = true
      } else {
        this.headerVisible = false
      }
      await this.$api['formGenerator.designerDetails']({ desformCode: this.item.formCode }).then(async res => {
        let fields = [];
        if (res.designJson) {
          fields = JSON.parse(res.designJson).fields;
        }
        if (fields && fields.length) {
          let columns = [];
          // 等待 getDynamicData 方法执行完成
          await this.getDynamicData(fields, dynamicTagList);
          // 使用 Promise.all 等待所有 forEach 内部的异步操作完成
          await Promise.all(fields.map(async item => {
            if (!item.__config__.hidden) {
              if (dynamicTagList.includes(item.__config__.tag)) {
                // 动态数据来源
                columns.push({
                  title: item.__config__.label,
                  minWidth: 120,
                  dataIndex: item.__config__.formFields,
                  align: 'center',
                  formatter: function (row) {
                    if (row[item.__config__.formFields]) {
                      let options = that.dynamicData[item.__config__.formFields].data;
                      let config = that.dynamicData[item.__config__.formFields].config;
                      if (config) {
                        let result = options.find(el => el[config.valueCol] === row[item.__config__.formFields]);
                        return result[config.labelCol] ? result[config.labelCol] : ''
                      } else {
                        let customConfig = {
                          labelCol: "cmeaning",
                          valueCol: "id"
                        }
                        let result = options.find(el => el[customConfig.valueCol] === row[item.__config__.formFields]);
                        return result[customConfig.labelCol] ? result[customConfig.labelCol] : ''
                      }
                    }
                  }
                });
              } else {
                columns.push({
                  title: item.__config__.label,
                  minWidth: 120,
                  dataIndex: item.__config__.formFields,
                  align: 'center',
                });
              }
            }
          }));
          if (this.headerVisible) {
            columns.push({
              title: '操作',
              fixed: 'right',
              width: 120,
              dataIndex: 'operation',
              scopedSlots: { customRender: 'custom' },
            });
          }
          this.columns = columns;
        }
      });
    }
  },
  methods: {
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
      this.formViewId = record.ID
    },
    viewForm (record) {
      // 查看
      this.drawerTitle = '查看'
      this.drawerVisible = true
      this.drawerContentView = 'view'
      this.formViewId = record.ID
    },
    removeForm (record) {
      // 删除
      const that = this
      let checkMsg = '是否确定要删除该数据吗？'
      this.$confirm(checkMsg, '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['taskManager.removeFormData'](
            {
              actOrTaskFormId: this.item.name,
              "vo": {
                "desFormId": this.item.formId,
                "dataIds": [record.ID]
              }
            }
          ).then((res) => {
            that.$refs.table.searchData()
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
    },
    formCloseRefresh (res) {
      this.$api['taskManager.taskFormDataSave']({ actOrTaskFormId: this.item.name, formDataId: res }).then(res => {
        this.drawerVisible = false
        this.searchList()
      })
    },
    async searchList () {
      this.editTableData = await this.$api['taskManager.taskFormdataList']({ actOrTaskFormId: this.item.name, formId: this.item.formId })
    },
    async getDynamicData (fields, dynamicTagList) {
      // 使用 Promise.all 等待所有 forEach 内部的异步操作完成
      await Promise.all(fields.map(async item => {
        if (!item.__config__.hidden) {
          if (dynamicTagList.includes(item.__config__.tag)) {
            // 动态数据来源
            const param = {
              id: item.__config__.selectComp,
              param: {},
              sqlParam: {},
              reportParam: {}
            };
            let res = await this.$api['formGenerator.getSelectionData'](param);
            this.dynamicData[item.__config__.formFields] = { config: JSON.parse(res.config), data: res.data };
          }
        }
      }))
    },
    checkBusinessForm () {
      if (this.$refs.table && this.$refs.table.tableData.length) {
        return true
      } else {
        return false
      }
    }
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer,
    FormRender
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
