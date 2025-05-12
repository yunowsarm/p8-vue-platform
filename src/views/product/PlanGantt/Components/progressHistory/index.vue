<template>
  <div style="height: 100%; margin-top: 40px;">
    <common-tabs class="custom-common-tabs"
                 :active-tabs="activeTabs"
                 type="border-card"
                 :tabs-data="tabs"
                 @tab-click="tabClick"
                 height="100%">
      <template #history>
        <common-table ref="table"
                      v-if="activeTabs == 'history'"
                      :columns="columns"
                      :table-setting="false"
                      :params="queryParam"
                      :api="tableApi"
                      :pagination="false"></common-table>
      </template>
      <template #undone>
        <common-table ref="table"
                      v-if="activeTabs == 'undone'"
                      :api="tableApi2"
                      :params="tableParams2"
                      :columns="columns2"
                      :pagination="false"
                      :tableSetting="false">
        </common-table>
      </template>
      <template v-for="item in businessForm" v-slot:[item.name]>
        <FormRender v-if="item.editMode === '单数据'"
                      :ref="item.name"
                      :item="item"
                      class="businessForm"
                      :approveType="false"
                      :key="item.name"></FormRender>
          <multiple-form-table v-else-if="item.editMode === '多数据'"
                               :ref="item.name"
                               :key="item.name"
                               :approveType="false"
                               :item="item"></multiple-form-table>
      </template>
    </common-tabs>
  </div>
</template>

<script>
import { P8Table as CommonTable, P8Tabs as CommonTabs } from 'p8-components-ui'
import multipleFormTable from '@/views/product/My/Work/Task/Components/taskOperating/components/multipleFormTable'
import FormRender from '@/views/product/My/Work/Task/Components/taskOperating/components/formRender.vue'
export default {
  components: { CommonTable, CommonTabs, multipleFormTable, FormRender },
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      activeTabs: 'history',
      tabs: [
        {
          label: '进度反馈',
          name: 'history'
        },
        {
          label: '未完成反馈',
          name: 'undone'
        }
      ],
      tableApi: 'taskManager.progressFeedbackHistory',
      queryParam: { taskId: this.taskId },
      allStatus: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '55px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '状态',
          dataIndex: 'statusDisplay',
          align: 'center'
        },
        {
          title: '完成度',
          dataIndex: 'progress',
          formatter: (row) => {
            return Math.round(row.progress * 100) + '%'
          },
          align: 'center'
        },
        {
          title: '进度说明',
          minWidth: 200,
          dataIndex: 'content',
          align: 'center'

        },
        {
          title: '反馈时间',
          dataIndex: 'itemCreateTime',
          align: 'center',
          width: 160
        }
      ],
      tableApi2: 'taskManager.deviationReasonsHistory',
      tableParams2: { taskId: this.taskId },
      columns2: [
        {
          title: '序号',
          type: 'index',
          width: '55px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '偏离类型',
          dataIndex: 'deviationTypeDisplay',
          width: '100px',
          align: 'center'
        },
        {
          title: '偏离原因',
          dataIndex: 'deviationCauses',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '偏离影响',
          dataIndex: 'deviationImpact',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '进展情况',
          dataIndex: 'deviationProgress',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '解决方案',
          dataIndex: 'solutions',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '反馈时间',
          dataIndex: 'itemCreateTime',
          align: 'left'
        }
      ],
      businessForm: []
    }
  },
  watch: {
    taskId(val){
      this.tableParams2.taskId = val
      this.queryParam.taskId = val
      this.save()
    }
  },
  created () {
    this.$api['planGanttManager.taskFormInfo']({ taskId: this.taskId }).then(res => {
      res.forEach(el => {
        this.businessForm.push({label: el.formName, name: el.id, formCode: el.formCode, editMode: el.editMode, formId: el.formId})
      })
      let index = this.tabs.findIndex(item => item.name === 'history')
      if (index !== -1) {
        this.tabs.splice(index + 1, 0, ...this.businessForm)
      }
    })
    this.save()
  },
  methods: {
    tabClick (target) {
      this.activeTabs = target.name
    },
    save(){
      this.$api['planGanttManager.reminder']({ entityId: this.taskId }).then(res => { 
        // this.$emit('templateMounted')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-common-tabs {
  height: calc(100% - 40px);
  margin-top: 37px;
}
.businessForm {
  padding: 0 !important;
}
</style>
