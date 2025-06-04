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
        <template :slot="item"
                  v-for="item in slotList"
                  slot-scope="{ scope }">
          <i :class="scope.row[item]"
             :key="item"></i>
        </template>
        <template #operation="{ scope }">
          <template v-if="headerVisible">
            <el-button type="text"
                       @click.stop="updateForm(scope.row)">修改</el-button>
            <el-button type="text"
                       @click.stop="viewForm(scope.row)">查看</el-button>
            <el-button type="text"
                       @click.stop="removeForm(scope.row)">删除</el-button>
          </template>
          <template v-else>
            <el-button type="text"
                       @click.stop="viewForm(scope.row)">查看</el-button>
          </template>
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
                 :modal="false"
                 @close="onDrawerClose">
        <div style="font-size: 14px;color: #606266;height: 55px;"
             v-if="drawerContentView == 'edit' && PREDECESSORSNUMBER">
          <span style="text-align: right;float: left; width: 90px;line-height: 55px;">关联前置任务</span>
          <el-input style="position: relative;width: calc(100% - 110px);line-height: 55px; padding-left: 10px;"
                    v-model="formName"
                    placeholder="弹出选择"
                    @click.native="selectBeforeTaskFun"></el-input>
        </div>
        <div style="font-size: 14px;color: #606266;padding-top: 20px;height: 45px;"
             v-else-if="(drawerContentView == 'view' && PREDECESSORSNUMBER) || isApprove">
          <span style="text-align: right;float: left; width: 100px; line-height: 32px;">关联前置任务</span>
          <span style="width: calc(100% - 120px); line-height: 55px; margin-left: 10px; background: #f5f8fb; height: 30px; line-height: 32px; display: inline-block;">
            {{formName}}
            <el-button type="text"
                       style="margin-left: 10px;"
                       @click="viewFormNew">查看</el-button>
          </span>
        </div>
        <form-render :record="{ desformCode: item.formCode }"
                     :style="{'height': (PREDECESSORSNUMBER || isApprove) ? 'calc(100% - 55px)' : '100%'}"
                     :dataViewId="formViewId"
                     :pageType="drawerContentView"
                     @save-success="formCloseRefresh"></form-render>
      </el-drawer>
      <el-drawer v-if="drawerVisibleNew"
                 :title="drawerTitleNew"
                 size="80%"
                 :append-to-body="true"
                 :destroy-on-close="true"
                 :wrapper-closable="false"
                 :visible.sync="drawerVisibleNew"
                 @close="onDrawerCloseNew">
        <selectBeforeTask :record="{ desformCode: item.formCode }"
                          :dataViewId="formViewId"
                          :pageType="drawerContentView"
                          :taskId="taskId"
                          :selectFormDataId="selectFormDataId"
                          @handleOk="handleOk"></selectBeforeTask>
      </el-drawer>
      <el-drawer v-if="viewDrawerVisible"
                 title="查看前置任务"
                 :visible.sync="viewDrawerVisible"
                 size="50%"
                 :append-to-body="true"
                 :destroy-on-close="true"
                 :wrapper-closable="false"
                 style="z-index:99999;"
                 :before-close="viewDrawerClose">
        <form-render ref="form"
                     :dataViewId="selectFormDataId"
                     :record="{ desformCode: selectFormCode }"
                     pageType="view"></form-render>
      </el-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import selectBeforeTask from './selectBeforeTask'
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
    },
    taskId: {
      type: String,
      default: ''
    },
    PREDECESSORSNUMBER: {
      type: Number,
      default: 0
    },
    isApprove: {
      type: Boolean,
      default: false
    },
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
      headerVisible: true,
      drawerTitleNew: '',
      drawerVisibleNew: false,
      formName: '',
      viewDrawerVisible: false,
      selectFormDataId: '',
      selectFormCode: '',
      slotList: []
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
        if (res && res.designJson) {
          fields = JSON.parse(res.designJson).fields;
        }
        if (fields && fields.length) {
          let columns = [];
          this.slotList = []
          // 等待 getDynamicData 方法执行完成
          await this.getDynamicData(fields, dynamicTagList);
          // 使用 Promise.all 等待所有 forEach 内部的异步操作完成
          await Promise.all(fields.map(async item => {
            if (!item.__config__.hidden && item.__config__.tagIcon !== 'table') {
              if (dynamicTagList.includes(item.__config__.tag)) {
                columns.push({
                  title: item.__config__.label,
                  minWidth: 120,
                  dataIndex: item.__vModel__,
                  align: 'center',
                  formatter: function (row) {
                    if (row[item.__vModel__]) {
                      let options = that.dynamicData[item.__vModel__].data;
                      let config = that.dynamicData[item.__vModel__].config;
                      if (config) {
                        let result = options.find(el => el[config.valueCol] === row[item.__vModel__]);
                        return result[config.labelCol] ? result[config.labelCol] : ''
                      } else {
                        let customConfig = {
                          labelCol: "cmeaning",
                          valueCol: "id"
                        }
                        let result = options.find(el => el[customConfig.valueCol] === row[item.__vModel__]);
                        return result[customConfig.labelCol] ? result[customConfig.labelCol] : ''
                      }
                    }
                  }
                });
              } else if (item.__config__.tagIcon == 'time-range' || item.__config__.tagIcon == 'date-range') {
                columns.push({
                  title: item.__config__.label,
                  minWidth: 180,
                  dataIndex: item.__vModel__,
                  align: 'center',
                  formatter: function (row) {
                    let file1 = row[item.__config__.formFields[0]]
                    let file2 = row[item.__config__.formFields[1]]
                    if (file1 && file2) {
                      if (item.__config__.tagIcon == 'time-range') {
                        return file1.split(' ')[1] + '~' + file2.split(' ')[1]
                      } else if (item.__config__.tagIcon == 'date-range') {
                        return file1.split(' ')[0] + '~' + file2.split(' ')[0]
                      }
                    }
                  }
                })
              }
              else if (item.__config__.tagIcon == 'time' || item.__config__.tagIcon == 'date') {
                columns.push({
                  title: item.__config__.label,
                  minWidth: 100,
                  dataIndex: item.__config__.formFields,
                  align: 'center',
                  formatter: function (row) {
                    if (item.__config__.tagIcon == 'time') {
                      if (row[item.__config__.formFields]) {
                        return row[item.__config__.formFields].split(' ')[1].slice(0, -3) || ''
                      } else {
                        return ''
                      }
                    } else if (item.__config__.tagIcon == 'date') {
                      if (row[item.__config__.formFields]) {
                        return row[item.__config__.formFields].split(' ')[0] || ''
                      } else {
                        return ''
                      }
                    }
                  }
                });
              }
              else if (item.__config__.tagIcon == 'p8-upload') {
                columns.push({
                  title: item.__config__.label,
                  minWidth: 120,
                  dataIndex: item.__config__.formFields,
                  align: 'center',
                  formatter: function (row) {
                    //   return ''
                  }
                });
              }
              else if (item.__config__.tagIcon == 'p8-icon-select') {
                columns.push({
                  title: item.__config__.label,
                  minWidth: 120,
                  dataIndex: item.__config__.formFields,
                  scopedSlots: { customRender: 'custom' },
                  align: 'center',
                });
                this.slotList.push(item.__config__.formFields)
              }
              else {
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
              width: 160,
              dataIndex: 'operation',
              scopedSlots: { customRender: 'custom' },
            });
          } else {
            columns.push({
              title: '操作',
              fixed: 'right',
              width: 80,
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
      this.$api['taskManager.queryFrontInfo']({ actOrTaskFormId: this.item.name, formDataId: this.formViewId }).then(res => {
        if (res && res[0]) {
          this.formName = res[0].formName
          this.selectFormDataId = res[0].formDataId ? res[0].formDataId : ''
          this.selectFormCode = res[0].formCode ? res[0].formCode : ''
        }
      })
    },
    viewForm (record) {
      // 查看
      this.drawerTitle = '查看'
      this.drawerVisible = true
      this.drawerContentView = 'view'
      this.formViewId = record.ID
      this.$api['taskManager.queryFrontInfo']({ actOrTaskFormId: this.item.name, formDataId: this.formViewId }).then(res => {
        if (res && res[0]) {
          this.formName = res[0].formName
          this.selectFormDataId = res[0].formDataId ? res[0].formDataId : ''
          this.selectFormCode = res[0].formCode ? res[0].formCode : ''
        }
      })
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
    },
    formCloseRefresh (res) {
      this.$api['taskManager.taskFormDataSave']({ actOrTaskFormId: this.item.name, formDataId: res, frontFormIds: this.frontFormIds, frontDataIds: this.frontDataIds }).then(res => {
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
    },
    selectBeforeTaskFun () {
      this.drawerVisibleNew = true
    },
    onDrawerCloseNew () {
      this.drawerVisibleNew = false
      this.viewDrawerVisible = false
    },
    handleOk (rows, treeNode) {
      this.frontFormIds = [treeNode.data.id]
      this.frontDataIds = rows.map(el => el.ID)
      this.formName = treeNode.label
      this.onDrawerCloseNew()
    },
    viewFormNew () {
      this.viewDrawerVisible = true
    },
    viewDrawerClose () {
      this.viewDrawerVisible = false
    }
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer,
    FormRender,
    selectBeforeTask
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
