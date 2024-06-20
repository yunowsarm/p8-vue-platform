<template>
  <form-list ref="form"
             @rendered="rendered"
             form-layout="vertical"
             @saved="saved"
             :data-source="dataSource"
             :api="saveApi"
             :form="formData"
             :is-custom-validate="isCustomValidate"
             :other-param="otherParam"
             @custom-validate="customValidate">
  </form-list>
</template>
<style scoped></style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { otherEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'

export default {
  name: 'PlanOutputEdit',
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
      saveApi: 'planGanttManager.outputSave',
      isCustomValidate: true,
      dataSource: [
        {
          // labelText: '输出信息',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'outputRequests', // 保存时格式，类似detailList[0].roleName
          addFieldLayout: 'vertical',
          children: [
            {
              type: 'hidden',
              fieldName: 'id'
            },
            {
              type: 'hidden',
              fieldName: 'activityInfoId'
            },
            {
              labelText: '输出要求',
              type: 'textarea',
              fieldName: 'describes',
              placeholder: '请输入输出要求',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              },
              rules: [{ required: true, message: '输出要求不能为空' }]
            },
            {
              type: 'select',
              labelText: '输出类型',
              fieldName: 'outputType',
              colLayout: 'singleCol',
              optionUrl: {
                api: 'thirdPartInterface.getDic',
                params: { dicType: 'TYPE_OF_OUTPUT' }
              },
              options: []
            },
            {
              type: 'upload', // 控件类型
              labelText: '上传附件', // 控件显示的文本
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              },
              listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      formData: {
        outputRequests: [],
        confidentialiteList: []
      },
      otherParam: {
        taskId: ''
      },
      oldOutput: []
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted () { },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getOutputData(this.taskId)
      }
    },
    getOutputData (taskId) {
      const that = this
      that.otherParam = { taskId: taskId }
      that.$api['planGanttManager.outputInfo']({ taskId: taskId })
        .then(function (res) {
          let datas = []
          if (res) {
            datas = res
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            that.ganttName === 'changeGantt' &&
            JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('output') !== -1
          ) {
            datas = that.vueThis.newTaskMap[taskId].output
          }
          // 附件日期处理
          if (datas && datas.length > 0) {
            datas.forEach(function (att) {
              if (att.uploadFiles && att.uploadFiles.length > 0) {
                att.uploadFiles.forEach(function (t) {
                  t.itemCreateTime = null
                })
              } else {
                att.uploadFiles = []
              }
            })
          }
          if (!datas.length) {
            datas.push({
              describes: '',
              outputType: '',
              uploadFiles: []
            })
          }
          that.formData.outputRequests = datas
          that.oldOutput = JSON.parse(JSON.stringify(datas))
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved (res) {
      if (res === 'true') {
        this.getOutputData(this.taskId)
      }
    },
    customValidate (saveParams) {
      const that = this
      if (that.taskId) {
        if (that.ganttName === 'planGantt') {
          // 计划编辑
          this.$refs.form.submitForm(saveParams, this.saveApi)
        } else if (that.ganttName === 'changeGantt') {
          // 计划变更
          const ganttObject = GanttObject.getGanttObject(that.ganttName)
          otherEditCheck(that.oldOutput, that.formData.outputRequests, ganttObject, that.vueThis, that.taskId, 'output')
          that.vueThis.hasSave = true
        }
      }
    }
  }
}
</script>
