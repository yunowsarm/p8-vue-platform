<template>
  <div style="height: 100%">
    <list-layout class="listLayout"
                 :class="{customHeight: taskId }">
      <template #north>
        <el-button type="primary"
                   size="mini"
                   @click="addForm">添加表单
        </el-button>
      </template>
      <template #center>
        <editable-table ref="editTable"
                        :columns="columns"
                        :add-row="false"
                        :data="editTableData"
                        :change-table-data="editTableData"
                        :class="{editableCustomHeight: taskId }"
                        @save-param-data="saveTableData">
          <template #formId="{ scope, data }">
            <!-- 目录组件 -->
            <el-input
              :value="setFormName(scope.row)"
              readonly
              autosize
              placeholder="请选择"
              @click.native="openFormDialog(scope.$index)">
              <i class="el-icon-link"
                 slot="suffix"
                 type="link"
                 :style="{ cursor: 'pointer', fontSize: '16px', color: '#08c', lineHeight: '2' }"/>
            </el-input>
            <!--            <el-select v-model="scope.row.formId"-->
            <!--                       size="mini"-->
            <!--                       style="width: 100%"-->
            <!--                       clearable-->
            <!--                       filterable-->
            <!--                       placeholder="请选择"-->
            <!--                       @change="saveTableData(data)">-->
            <!--              <el-option v-for="item in renderData"-->
            <!--                         :key="item.id"-->
            <!--                         :label="item.desformName + '(' + item.desformCode + ')'"-->
            <!--                         :value="item.id"></el-option>-->
            <!--            </el-select>-->
          </template>
          <template #editMode="{ scope }">
            <el-radio-group v-model="scope.row.editMode"
                            size="mini">
              <el-radio-button label="单数据"
                               value="单数据"></el-radio-button>
              <el-radio-button label="多数据"
                               value="多数据"></el-radio-button>
            </el-radio-group>
          </template>
          <template #isRequired="{ scope }">
            <el-radio-group v-model="scope.row.isRequired"
                            size="mini">
              <el-radio-button label="是"
                               value="是"></el-radio-button>
              <el-radio-button label="否"
                               value="否"></el-radio-button>
            </el-radio-group>
          </template>
          <template #operation="{ scope }">
          <span>
            <i class="el-icon-view"
               title="预览"
               @click="privew(scope.row)"></i>
            <i style="margin-left: 5px;"
               class="el-icon-delete"
               title="删除"
               @click="deleteRow(scope)"></i>
          </span>
          </template>
        </editable-table>
        <el-button type="primary"
                   v-if="taskId"
                   size="mini"
                   style="float: right;margin-right: 10px;margin-top: 6px;"
                   @click="saveForm">保存
        </el-button>
      </template>
      <template #drawer-panel>
        <common-drawer v-if="visible"
                       size="50%"
                       :visible='visible'
                       title="预览"
                       @close="drawerClose">
          <template #drawer>
            <form-render :record="{ desformCode: privewCode }"
                         v-if="privewCode"
                         class="desformCode"
                         pageType="view"></form-render>
            <component v-else-if="formUrl" :is="componentUrl"></component>
            <iframe :src="templateSrc"></iframe>
          </template>
        </common-drawer>
      </template>
    </list-layout>
    <common-dialog v-if="formVisible"
                   title="选择表单"
                   :visible="formVisible"
                   :dialog-height="600"
                   @handle-cancel="closeFormDialog"
                   @close="closeFormDialog"
                   @handle-ok="handleOk">
      <template #dialog>
        <el-tabs v-model="activeName">
          <el-tab-pane label="内部表单" name="businessForm">
            <CommonTable :columns="formColumns"
                         class="customTable"
                         :pagination="false"
                         :table-setting="false"
                         :select-all-hidden="true"
                         :noApiTableData="renderData"
                         :isRadioSelect="true"
                         @select="select"
                         @row-dblclick="rowDblClick"></CommonTable>
          </el-tab-pane>
          <el-tab-pane label="模板表单" name="templateForm">
            <CommonTable :columns="templateColumns"
                         :pagination="false"
                         class="customTable"
                         :table-setting="false"
                         :select-all-hidden="true"
                         :noApiTableData="templateData"
                         :isRadioSelect="true"
                         @select="selectForTemplate"
                         @row-dblclick="rowDblClickForTemplate"></CommonTable>
          </el-tab-pane>
          <el-tab-pane label="自定义表单" name="customForm">
            <el-form>
              <el-form-item label="自定义表单名称">
                <el-input class="input"
                          v-model="customFormName"
                          placeholder="请输入表单名称"></el-input>
              </el-form-item>
              <el-form-item label="自定义表单地址">
                <el-input class="input"
                          v-model="customFormUrl"
                          placeholder="请输入表单地址 例：XXX/XXX/XXX"></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </template>
    </common-dialog>
  </div>
</template>
<script>
import {
  P8ListLayout as ListLayout,
  P8Dialog as CommonDialog,
  P8Drawer as CommonDrawer,
  P8Table as CommonTable,
  P8EditTable as EditableTable
} from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import {GanttObject} from '@/assets/commonJS/ganttJS/ganttObject'
import {defineAsyncComponent} from "vue";

export default {
  name: 'businessForm',
  props: {
    activityInfoId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    ganttName: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      templateSrc:'',
      htmlDemo:null,
      selectFormId: '',
      activeName: 'businessForm',
      formColumns: [
        {
          title: '',
          width: 35,
          type: 'selection'
        },
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center',
          headerAlign: 'center'
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
      templateColumns:[
        {
          title: '',
          width: 35,
          type: 'selection'
        },
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '模板编号',
          dataIndex: 'templateCode',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '模板名称',
          dataIndex: 'templateName',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '模板描述',
          dataIndex: 'templateRemake',
          align: 'left',
          headerAlign: 'left'
        },
        {
          title: '模板状态',
          dataIndex: 'templateState',
          align: 'left',
          headerAlign: 'left'
        }
      ],
      customFormName: '',
      customFormUrl: '',
      currentFormIndex: -1,
      formVisible: false,
      visible: false,
      renderData: [],
      templateData:[],
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 70,
        },
        {
          title: '业务表单',
          dataIndex: 'formId',
          minWidth: 200,
          align: 'center',
          scopedSlots: {customRender: 'custom'}
        },
        {
          title: '编辑模式',
          dataIndex: 'editMode',
          width: 160,
          align: 'center',
          scopedSlots: {customRender: 'custom'}
        },
        {
          title: '是否必填',
          dataIndex: 'isRequired',
          width: 160,
          align: 'center',
          scopedSlots: {customRender: 'custom'}
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'custom'}
        }
      ],
      reportParams: {
        tableData: []
      },
      editTableData: [],
      privewCode: '',
      formUrl: '',
      taskFinish: null,
      ganttObject: null
    }
  },
  components: {
    EditableTable,
    ListLayout,
    CommonDialog,
    CommonDrawer,
    FormRender,
    CommonTable
  },
  computed: {
    token(){
      return this.$store.getters.token
    },
    componentUrl() {
      if (!this.formUrl) return null
      const componentPath = this.formUrl
      return defineAsyncComponent(() =>
        import('@/views/' + (componentPath.startsWith('/') ? componentPath.slice(1) : componentPath) + '.vue')
      );
    }
  },
  watch: {
    ganttName: {
      handler(val) {
        this.ganttObject = GanttObject.getGanttObject(this.ganttName)
      },
      immediate: true
    },
    activityInfoId: {
      handler(val) {
        let api = 'OutputFlow.proceessFormInfo'
        let params = {activityInfoId: val}
        this.$api[api](params).then(res => {
          this.editTableData = res
        })
      },
    }
  },
  created() {
    console.log('表单！！！')
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then((res) => {
      let taskFinish = res.taskFinish && res.taskFinish.content ? res.taskFinish.content : ''
      if (taskFinish === '手动') {
        this.taskFinish = true
      }
    })
    this.$api['OutputFlow.formInfo']({}).then(res => {
      this.renderData = res
    })
    this.$api['OutputFlow.getTemplateList']({}).then(res => {
      this.templateData = res
    })
    let api = 'OutputFlow.proceessFormInfo'
    let params = {activityInfoId: this.activityInfoId}
    if (this.taskId) {
      api = 'planGanttManager.taskFormInfo'
      params = {taskId: this.taskId}
    }
    this.$api[api](params).then(res => {
      this.editTableData = res
    })
  },
  methods: {
    setFormName(row){
      if(row.formType !== 'customForm'){
        return this.filterForm(row)
      }else if(row.formUrl){
        return `${row.formName}(${row.formUrl})`
      }else{
        return ''
      }
    },
    selectTemplate(rows) {
      this.selectFormId = rows[0].ID
    },
    // 通过id展示表单名称和编码
    filterForm(row) {
      if(row.formType === 'businessForm'){
        const form = this.renderData.find(item => item.id === row.formId)
        return `${form.desformName}(${form.desformCode})`
      }else if(row.formType === 'templateForm'){
        const template = this.templateData.find(item => item.id === row.formId)
        return `${row.formName || template.templateName}(${row.formCode || template.templateCode})`
      }

    },
    // 打开选择表单对话框
    openFormDialog(index) {
      this.currentFormIndex = index //  记录行数据的下标
      this.formVisible = true
    },
    // 关闭选择表单对话框
    closeFormDialog() {
      this.currentFormIndex = -1  // 清空当前行书记的下标
      this.selectFormId = ''   // 清空选择的表单
      this.customFormUrl = ''
      this.customFormName = ''
      this.formVisible = false
    },
    // 选择和双击模板表单
    selectForTemplate(rows) {
      this.selectFormIdForTemplate = rows[0].id  // 记录选择的表单
    },
    rowDblClickForTemplate(row) {
      const i = this.currentFormIndex;
      this.$set(this.editTableData[i], 'formType', this.activeName)
      this.$set(this.editTableData[i], 'formId', row.id)
      this.formVisible = false
    },
    // 选择和双击内部表单
    select(rows) {
      this.selectFormId = rows[0].id  // 记录选择的表单
    },
    rowDblClick(row) {
      const i = this.currentFormIndex;
      this.$set(this.editTableData[i], 'formType', this.activeName)
      this.$set(this.editTableData[i], 'formId', row.id)
      this.formVisible = false
    },
    handleOk() {
      const i = this.currentFormIndex
      this.$set(this.editTableData[i], 'formType', this.activeName)
      //  formUrl（自定义表单）与formId（内部表单）为互斥
      if (this.activeName === "businessForm") {
        this.$set(this.editTableData[i], 'formUrl', '')
        this.$set(this.editTableData[i], 'formName', '')
        this.$set(this.editTableData[i], 'formId', this.selectFormId)
      } else if (this.activeName === 'customForm') {
        this.$set(this.editTableData[i], 'formId', '')
        this.$set(this.editTableData[i], 'formUrl', this.customFormUrl)
        this.$set(this.editTableData[i], 'formName', this.customFormName)
      }else if(this.activeName === "templateForm"){
        this.$set(this.editTableData[i], 'formUrl', '')
        this.$set(this.editTableData[i], 'formName', '')
        this.$set(this.editTableData[i], 'formId', this.selectFormIdForTemplate)
      }
      this.closeFormDialog()
    },
    saveTableData(data) {
      this.reportParams.tableData = data
    },
    deleteRow(scope) {
      this.$refs.editTable.remove(scope)
    },
    privew(row) {
      if (row.formType === 'businessForm') {
        let el = this.renderData.find(item => item.id === row.formId)
        this.privewCode = el.desformCode
        this.visible = true
      } else if(row.formType === 'customForm') {
        this.formUrl = row.formUrl
        this.visible = true
      }else if(row.formType === 'templateForm'){
        const { jmreportUrl } = this.$sysConfig.API_DEFAULT_CONFIG;
        const URL = `${jmreportUrl}/view/${row.formId}?token=${this.token}&func=${this.$route.meta.title}`
        window.open(URL, '_blank')
      }
    },
    drawerClose() {
      this.visible = false
      this.formUrl = null
      this.privewCode = null
    },
    addForm() {
      if (this.taskId) {
        if (!this.taskFinish) {
          let hasChild = this.ganttObject.hasChild(this.taskId)
          if (hasChild) {
            this.$message({
              type: 'warning',
              message: '当前任务为父任务且父任务完成方式为自动，所关联的表单将在执行时无法填写'
            })
          }
        }
      }
      this.$refs.editTable.add()
    },
    saveForm() {
      let saveData = this.reportParams.tableData
      let flag = true
      if (saveData && saveData.length) {
        saveData.forEach(el => {
          if ((!el.formId && !el.formUrl) || !el.editMode || !el.isRequired) {
            flag = false
          }
        })
      }
      let codes = saveData.map(el => el.formId)
      if (new Set(codes).size !== codes.length) {
        this.$message.warning('业务表单不可重复')
        return
      }
      if (flag) {
        let api = 'OutputFlow.proceessFormSave'
        let params = {activityInfoId: this.activityInfoId, processFormRequests: saveData}
        if (this.taskId) {
          api = 'planGanttManager.taskFormSave'
          params = {taskId: this.taskId, taskFormRequests: saveData}
          let task = this.ganttObject.getTask(this.taskId)
          if (saveData.length) {
            task.hasBusinessForm = 'true'
          } else {
            task.hasBusinessForm = 'false'
          }
          this.ganttObject.updateTask(this.taskId)
        }
        this.$api[api](params).then(res => {
          if (this.taskId) {
            this.$message({type: 'success', message: '保存成功'})
          }
        })
      } else {
        this.$message.error('请完善业务表单信息')
      }
      return flag
    }
  }
}
</script>
<style lang="scss" scoped>
.listLayout {
  margin: 0;
  padding: 0;

  ::v-deep .list-header {
    padding: 10px 1px !important;
  }

  ::v-deep .list-main {
    padding: 0;
    margin: 0;
    height: 100%;
  }

  ::v-deep .list-layout {
    margin: 0;
    height: 100%;
  }

  .el-icon-delete,
  .el-icon-view {
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;

    &:hover {
      color: $base-light-color;
    }
  }
}

.customHeight {
  height: 300px;
}

.editableCustomHeight {
  height: 210px !important;
}

.desformCode ::v-deep .el-col.el-col-24.flex-right {
  display: none;
}
.customTable {
  ::v-deep .panination {
    display: none;
  }
}
</style>
