<template>
  <div style="position: relative; height: 300px">
    <form-list
      ref="form"
      @rendered="rendered"
      form-layout="vertical"
      @saved="saved"
      :data-source="dataSource"
      :api="saveApi"
      :form="formData"
      :is-custom-validate="isCustomValidate"
      :other-param="otherParam"
      @custom-validate="customValidate"
    >
    </form-list>
  </div>
</template>
<style scoped></style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
import { monitorPointsEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'

export default {
  name: 'MonitorEdit',
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
      saveApi: 'planGanttManager.saveTaskMonitorInfo',
      isCustomValidate: true,
      monitorDataOptions: [],
      dataSource: [
        {
          labelText: '任务标识',
          type: 'addField',
          colLayout: 'singleCol',
          fieldName: 'monitorManagerRequests',
          addFieldLayout: 'vertical',
          children: [
            {
              type: 'hidden',
              fieldName: 'id'
            },
            {
              type: 'select',
              fieldName: 'monitorId',
              colLayout: 'doubleCol',
              fieldConfig: {
                filterable: true
              },
              options: []
            },
            {
              type: 'datetime',
              labelText: '开始时间',
              fieldName: 'logBeginTime',
              colLayout: 'doubleCol',
              placeholder: '选择计划开始时间',
              fieldConfig: {
                'value-format': 'yyyy-MM-dd'
              },
              rules: [
                {
                  required: true,
                  message: '必填'
                }
              ]
            },
            {
              type: 'datetime',
              labelText: '完成时间',
              fieldName: 'logEndTime',
              colLayout: 'doubleCol',
              placeholder: '选择计划完成时间',
              fieldConfig: {
                'value-format': 'yyyy-MM-dd'
              },
              rules: [
                {
                  required: true,
                  message: '必填'
                }
              ]
            }
          ]
        }
      ],
      formData: {
        monitorManagerRequests: []
      },
      otherParam: {
        taskId: ''
      },
      oldMonitorDatas: [],
      monitorPointsMap: {}
    }
  },
  watch: {
    monitorDataOptions(newValue, oldValue) {
      const that = this
      if (newValue && newValue.length > 0) {
        const select = that.dataSource[0].children.filter((item) => item.fieldName === 'monitorId')
        const newOptions = []
        newValue.forEach(function (item) {
          newOptions.push({ label: item.title, value: item.id })
          that.monitorPointsMap[item.monitorId] = item
        })
        select[0].options = newOptions
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
        this.getMonitorData(this.taskId)
      }
    },
    getMonitorData(taskId) {
      const that = this
      that.otherParam.taskId = taskId
      that.monitorDataOptions = that.vueThis.monitorPointDatas
      that.$api['planGanttManager.getTaskMonitorByTaskId']({ taskId: taskId })
        .then(function (res) {
          if (res) {
            that.formData.monitorManagerRequests = res.monitorManagerResponses ? res.monitorManagerResponses : []
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            that.ganttName === 'changeGantt' &&
            JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('monitors') !== -1
          ) {
            that.formData.monitorManagerRequests = that.vueThis.newTaskMap[taskId].monitors
          }
          that.oldMonitorDatas = that.formData.monitorManagerRequests
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved(res) {
      const that = this
      if (res && res === 'true') {
        let monitorIds = ''
        if (that.formData.monitorManagerRequests && that.formData.monitorManagerRequests.length > 0) {
          that.formData.monitorManagerRequests.forEach(function (item) {
            if (monitorIds) {
              monitorIds = monitorIds + ',' + item.monitorId
            } else {
              monitorIds = item.monitorId
            }
          })
        }
        const ganttObject = GanttObject.getGanttObject(that.ganttName)
        ganttObject.getTask(that.taskId).monitorPoints = monitorIds
        ganttObject.updateTask(that.taskId)
      }
    },
    customValidate(saveParams) {
      /**
       * 标识变更记录逻辑：
       *    可控任务添加、取消标识时，记录变更
       */
      const that = this
      if (that.taskId) {
        if (that.ganttName === 'planGantt') {
          // 计划编辑
          that.$refs.form.submitForm(saveParams, that.saveApi)
        } else if (that.ganttName === 'changeGantt') {
          // 计划变更
          const ganttObject = GanttObject.getGanttObject(that.ganttName)
          const task = ganttObject.getTask(that.taskId)
          // 变更逻辑处理
          monitorPointsEditCheck(that.oldMonitorDatas, that.formData.monitorManagerRequests, that.vueThis, task, ganttObject)
        }
      }
    }
  }
}
</script>
