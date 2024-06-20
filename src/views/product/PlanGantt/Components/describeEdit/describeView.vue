<template>
  <div style="position: relative; height: 520px">
    <form-list
      ref="form"
      @rendered="rendered"
      form-layout="vertical"
      @saved="saved"
      :data-source="dataSource"
      :api="saveApi"
      :is-custom-validate="isCustomValidate"
      @custom-validate="customValidate"
      :other-param="otherParam"
      :exist-default-btn="existDefaultBtn"
      :exist-custom-btn="existCustomBtn"
      :form="formData"
    >
    </form-list>
  </div>
</template>
<style scoped></style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import moment from 'moment'

export default {
  name: 'PlanDescribeView',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    ganttName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      saveApi: 'planGanttManager.describeSave',
      isCustomValidate: true,
      ownerDataOptions: [],
      existDefaultBtn: false,
      existCustomBtn: true,
      dataSource: [
        {
          labelText: '任务名称',
          type: 'view',
          fieldName: 'name',
          placeholder: '请输入任务名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '计划开始时间',
          fieldName: 'start_date',
          colLayout: 'doubleCol',
          placeholder: '选择计划开始时间',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          fieldName: 'end_date',
          colLayout: 'doubleCol',
          placeholder: '选择计划完成时间',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        // {
        //   type: 'view',
        //   labelText: '排程类型',
        //   fieldName: 'autoScheduling',
        //   colLayout: 'doubleCol',
        //   placeholder: '选择排程类型',
        //   options: [
        //     { 'label': '自动', 'value': '1' },
        //     { 'label': '手动', 'value': '2' }
        //   ]
        // },
        {
          type: 'view',
          labelText: '工期',
          fieldName: 'duration',
          colLayout: 'doubleCol',
          placeholder: '选择填写工期',
          min: 0,
          max: 99999
        },
        {
          type: 'view',
          labelText: '任务类型',
          fieldName: 'planType',
          colLayout: 'doubleCol',
          placeholder: '选择任务类型',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'ACTIVITY_TYPE' },
            label: 'label',
            value: 'value'
          },
          options: []
        },
        {
          type: 'view',
          labelText: '责任人',
          fieldName: 'owner_id',
          // colLayout: 'doubleCol',
          placeholder: '选择责任人',
          fieldConfig: {
            filterable: true
          },
          options: []
        },
        {
          labelText: '预计开始时间',
          type: 'view',
          fieldName: 'forecastBeginDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '预计完成时间',
          type: 'view',
          fieldName: 'forecastEndDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '实际开始时间',
          type: 'view',
          fieldName: 'realBeginDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '实际结束时间',
          type: 'view',
          fieldName: 'realEndDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '任务描述',
          type: 'view',
          fieldName: 'describes',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          }
        }
      ],
      formData: {},
      otherParam: {
        activityInfoId: ''
      },
      describes: '',
      oldFormData: {}
    }
  },
  watch: {
    taskId(val) {
      this.rendered()
    },
    ownerDataOptions(newValue) {
      if (newValue) {
        const options = []
        newValue.forEach(function (item) {
          options.push({ value: item.id, label: '[' + item.deptName + ']' + item.name + '-' + item.roleName })
        })
        const select = this.dataSource.filter((item) => item.fieldName === 'owner_id')
        select[0].options = options
      }
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted() {},
  methods: {
    rendered() {
      if (this.taskId && this.taskId !== '') {
        this.getDescribeData(this.taskId)
      }
    },
    getDescribeData(taskId) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      that.ownerDataOptions = ganttObject.serverList('resourceDatas')
      const task = ganttObject.getTask(taskId)
      that.formData.name = task.name

      that.formData.start_date = moment(task.start_date).format('YYYY-MM-DD')
      that.formData.end_date = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
      if (that.ownerDataOptions && that.ownerDataOptions.length > 0) {
        that.ownerDataOptions.some(function (item) {
          if (item.id === task.owner_id) {
            that.formData.owner_id = item.name
          }
        })
      }
      that.formData.autoScheduling = task.autoScheduling
      that.formData.duration = task.duration
      that.formData.planType = task.planType
      that.formData.forecastBeginDate = moment(task.forecastBeginDate).format('YYYY-MM-DD')
      that.formData.forecastEndDate = moment(task.forecastEndDate).format('YYYY-MM-DD')
      if (task.realBeginDate) that.formData.realBeginDate = moment(task.realBeginDate).format('YYYY-MM-DD')
      if (task.realEndDate) that.formData.realEndDate = moment(task.realEndDate).format('YYYY-MM-DD')
      // 获取描述信息
      that.$api['planGanttManager.getActivityInfoByTaskId']({ taskId: taskId })
        .then(function (res) {
          if (res) {
            that.formData.describes = res.describes
            that.describes = that.formData.describes
            that.otherParam.activityInfoId = res.activityInfoId
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            (that.ganttName === 'changeGantt' || that.ganttName === 'analysisGantt') &&
            that.vueThis.newTaskMap &&
            Object.keys(that.vueThis.newTaskMap).length > 0 &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('describes') !== -1
          ) {
            that.formData.describes = that.vueThis.newTaskMap[taskId].describes
          }
          that.oldFormData = that.formData
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved(res) {},
    customValidate(saveParams) {}
  }
}
</script>
