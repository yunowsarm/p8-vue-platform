<template>
  <el-tabs class="taskTabs"
           v-model="tabsActiveName"
           @tab-click="tabsClick"
           style="height: 100%;">
    <el-tab-pane label="任务信息">
      <task-info-view :dataSource="dataSource"
                      :taskId="taskId"
                      :api="taskApi"
                      ref="taskinfo"></task-info-view>
    </el-tab-pane>
    <el-tab-pane label="输出物">
      <form-list labelWidth="100px"
                 :existDefaultBtn="false"
                 ref="formExportation"
                 :dataSource="dataSourceExportation"
                 :form="formDataExportation">
        <template #outputIo>
          <div class="edit-outputIo-view">
            <p class="title">输出物&nbsp;&nbsp;&nbsp;&nbsp; <span v-if="formDataExportation.uploadFileJson.length === 0">暂无数据</span> </p>
          </div>
        </template>
      </form-list>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { P8Form as FormList, Tabs, TabPane } from 'p8-components-ui'
import TaskInfoView from './TaskPane'
export default {
  name: 'TabsTask',
  components: {
    TaskInfoView,
    FormList,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  },
  props: ['taskId'],
  data () {
    const dataSource = [
      {
        type: 'view',
        labelText: '任务名称',
        fieldName: 'name', // taskName
        colLayout: ''
      },
      {
        type: 'blank',
        labelText: '进度',
        slotName: 'status',
        colLayout: 'singleCol'
      },
      {
        type: 'blank',
        labelText: '状态',
        slotName: 'managerStatusDisplay',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '工期(天)',
        fieldName: 'duration',
        colLayout: ''
      },
      {
        type: 'blank',
        labelText: '超期/剩余天数',
        slotName: 'durationDay',
        colLayout: ''
      },
      {
        type: 'blank',
        labelText: '完成百分比',
        slotName: 'progress',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '计划周期',
        fieldName: 'forecastDate',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '预计周期',
        fieldName: 'planDate',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '实际周期',
        fieldName: 'realDate',
        colLayout: ''
      }
    ]
    return {
      tabsActiveName: '0',
      dataSource,
      taskApi: 'taskManager.taskInfo',
      formDataExportation: {
        uploadFileJson: []
      },
      dataSourceExportation: [
        {
          type: 'blank',
          labelText: '',
          slotName: 'outputIo',
          colLayout: ''
        },
        {
          labelText: '',
          type: 'addField',
          colLayout: 'singleCol',
          fieldName: 'uploadFileJson', // 保存时格式，类似detailList[0].roleName
          addFieldLayout: 'vertical',
          isView: true,
          children: [
            {
              type: 'view',
              labelText: '提交物名称',
              fieldName: 'aorName',
              colLayout: 'singleCol',
            },
            {
              type: 'uploadView',
              labelText: '上传附件', // 控件显示的文本
              fieldName: 'projectDesignFile',
              defaultValue: [],
              colLayout: 'singleCol',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
                limit: 1
              },
              listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            },
            {
              type: 'view',
              fieldName: 'aorDetail',
              labelText: '补充说明',
              colLayout: 'singleCol',
              placeholder: '请填写',
              defaultValue: ''
            }
          ]
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    tabsClick () {
      if (this.tabsActiveName === '1') {
        this.$api['taskManager.getOutputIo']({ taskId: this.taskId }).then(res => {
          this.formDataExportation.uploadFileJson = res
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.taskTabs ::v-deep .el-tabs__header {
  margin: 0;
}
.taskTabs ::v-deep .el-tabs__nav-wrap {
  background-color: #ffffff;
  padding: 0 6px;
  &::after {
    height: 0px;
  }
}
.taskTabs ::v-deep .el-tabs__content {
  padding: 0 10px;
  height: calc(100% - 25px);
}
.taskTabs ::v-deep .el-tab-pane {
  height: 100%;
}
::v-deep .el-tabs--top {
  height: calc(100% - 10px) !important;
}
::v-deep .el-form-item ::v-deep .el-form-item__content {
  margin-left: 0;
}
.taskTabs ::v-deep .el-tabs__nav-wrap {
  background-color: #f5f7fa;
  padding: 0 14px;
  &::after {
    height: 0px;
  }
}
</style>
