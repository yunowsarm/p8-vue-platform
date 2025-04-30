<template>
  <list-layout class="listLayout"
               :class="{customHeight: taskId }">
    <template #north>
      <el-button type="primary"
                 size="mini"
                 @click="addForm">添加表单</el-button>
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
          <el-select v-model="scope.row.formId"
                     size="mini"
                     style="width: 100%"
                     clearable
                     filterable
                     placeholder="请选择"
                     @change="saveTableData(data)">
            <el-option v-for="item in renderData"
                       :key="item.id"
                       :label="item.desformName + '(' + item.desformCode + ')'"
                       :value="item.id"> </el-option>
          </el-select>
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
                 @click="saveForm">保存</el-button>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visible"
                     size="50%"
                     :visible='visible'
                     title="预览"
                     @close="drawerClose">
        <template #drawer>
          <form-render :record="{ desformCode: privewCode }" class="desformCode" pageType="view"></form-render>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Drawer as CommonDrawer, P8EditTable as EditableTable } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
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
  data () {
    return {
      visible: false,
      renderData: [],
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
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '编辑模式',
          dataIndex: 'editMode',
          width: 160,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否必填',
          dataIndex: 'isRequired',
          width: 160,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      reportParams: {
        tableData: []
      },
      editTableData: [],
      privewCode: '',
      taskFinish: null,
      ganttObject: null
    }
  },
  components: {
    EditableTable,
    ListLayout,
    CommonDrawer,
    FormRender
  },
  watch: {
    ganttName: {
      handler (val) {
        this.ganttObject = GanttObject.getGanttObject(this.ganttName)
      },
      immediate: true
    },
  },
  created () {
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then((res) => {
      let taskFinish = res.taskFinish && res.taskFinish.content ? res.taskFinish.content : ''
      if (taskFinish === '手动') {
        this.taskFinish = true
      }
    })
    this.$api['OutputFlow.formInfo']({}).then(res => {
      this.renderData = res
    })
    let api = 'OutputFlow.proceessFormInfo'
    let params = { activityInfoId: this.activityInfoId }
    if (this.taskId) {
      api = 'planGanttManager.taskFormInfo'
      params = { taskId: this.taskId }
    }
    this.$api[api](params).then(res => {
      this.editTableData = res
    })
  },
  methods: {
    saveTableData (data) {
      this.reportParams.tableData = data
    },
    deleteRow (scope) {
      this.$refs.editTable.remove(scope)
    },
    privew (row) {
      this.visible = true
      let el = this.renderData.find(item => item.id === row.formId)
      this.privewCode = el.desformCode
    },
    drawerClose () {
      this.visible = false
    },
    addForm () {
      if (this.taskId) {
        if (!this.taskFinish) {
          let hasChild = this.ganttObject.hasChild(this.taskId)
          if (hasChild) {
            this.$message({ type: 'warning', message: '当前任务为父任务且父任务完成方式为自动，所关联的表单将在执行时无法填写' })
          }
        }
      }
      this.$refs.editTable.add()
    },
    saveForm () {
      let saveData = this.reportParams.tableData
      let flag = true
      if (saveData && saveData.length) {
        saveData.forEach(el => {
          if (!el.formId || !el.editMode || !el.isRequired) {
            flag = false
          }
        })
      }
      if (flag) {
        let api = 'OutputFlow.proceessFormSave'
        let params = { activityInfoId: this.activityInfoId, processFormRequests: saveData }
        if (this.taskId) {
          api = 'planGanttManager.taskFormSave'
          params = { taskId: this.taskId, taskFormRequests: saveData }
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
            this.$message({ type: 'success', message: '保存成功' })
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
.desformCode ::v-deep .el-col.el-col-24.flex-right{
  display: none;
}
</style>
