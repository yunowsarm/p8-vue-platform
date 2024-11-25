<template>
  <div style="position: relative; height: 300px">
    <form-list ref="form"
               @rendered="rendered"
               form-layout="vertical"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :isShouEnter="false"
               :form="formData"
               :is-custom-validate="isCustomValidate"
               :other-param="otherParam"
               @custom-validate="customValidate">
    </form-list>
  </div>
</template>
<style scoped></style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
import { linksEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'

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
  data () {
    return {
      saveApi: 'planGanttManager.saveDependence',
      isCustomValidate: true,
      monitorDataOptions: [],
      dataSource: [
        {
          labelText: '前置关系',
          type: 'addField',
          colLayout: 'singleCol',
          fieldName: 'ganttLinkResponse',
          addFieldLayout: 'vertical',
          children: [
            {
              type: 'hidden',
              fieldName: 'id'
            },
            {
              type: 'select',
              fieldName: 'type',
              colLayout: 'doubleCol',
              fieldConfig: {
                filterable: true
              },
              options: []
            },
            {
              type: 'treeSelect',
              multiple: false,
              labelText: '前置任务',
              fieldName: 'source',
              defaultValue: [],
              placeholder: '选择责任部门',
              optionUrl: {
                api: 'ProjectApply.deptTree',
                params: {}
              },
              treeData: []
            },
            {
              type: 'number',
              labelText: '偏移天数',
              fieldName: 'lag',
              colLayout: 'doubleCol',
              defaultValue: 0,
              fieldConfig: {
                disabled: false
              }
            }
          ]
        }
      ],
      formData: {
        ganttLinkResponse: []
      },
      otherParam: {
        taskId: ''
      },
      oldLinkDatas: []
    }
  },
  watch: {},
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted () { },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getLinkDatas(this.taskId)
      }
    },
    getLinkDatas (taskId) {
      const that = this
      that.otherParam.taskId = taskId
      that.$api['planGanttManager.getDependenceByTaskId']({ taskId: taskId })
        .then(function (res) {
          if (res) {
            that.formData.ganttLinkResponse = res.ganttLinkResponse ? res.ganttLinkResponse : []
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            that.ganttName === 'changeGantt' &&
            JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('links') !== -1
          ) {
            that.formData.ganttLinkResponse = that.vueThis.newTaskMap[taskId].links
          }
          that.oldLinkDatas = that.formData.ganttLinkResponse
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved (res) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      const ganttDp = GanttObject.getDpObject(that.ganttName)
      ganttDp.ignore(function () {
        ganttObject.batchUpdate(function () {
          if (that.oldLinkDatas && that.oldLinkDatas.length > 0) {
            that.oldLinkDatas.forEach(function (item) {
              ganttObject.deleteLink(item.id)
            })
          }
          if (res) {
            res.forEach(function (item) {
              ganttObject.addLink(item)
            })
          }
        })
      })
    },
    customValidate (saveParams) {
      /**
       * 标识变更记录逻辑：
       *    1.编辑加锁任务添加依赖时，记录变更
       *    2.任务历史标识中包含加锁标识且加锁标识锁定列包含依赖关系创建时，记录变更
       *    3.新增依赖影响到锁定层级任务时，记录变更
       *    4.新增依赖影响到的任务包含锁定标识且标识锁定列包含依赖关系创建时，记录变更
       */
      const that = this
      if (that.taskId) {
        if (that.ganttName === 'planGantt') {
          that.$refs.form.submitForm(saveParams, that.saveApi)
        } else if (that.ganttName === 'changeGantt') {
          const ganttObject = GanttObject.getGanttObject(that.ganttName)
          const task = ganttObject.getTask(that.taskId)
          linksEditCheck(that.oldLinkDatas, that.formData.ganttLinkResponse, ganttObject, that.vueThis, task)
        }
      }
    }
  }
}
</script>
