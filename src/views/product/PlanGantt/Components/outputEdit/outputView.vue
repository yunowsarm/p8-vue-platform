<template>
  <div style="position: relative; padding-bottom: 25px;width: 100%;height: calc(100% - 30px);">
    <form-list ref="form"
               v-if="!isEmpty"
               @rendered="rendered"
               form-layout="vertical"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :form="formData"
               :is-custom-validate="isCustomValidate"
               :exist-default-btn="existDefaultBtn"
               :exist-custom-btn="existCustomBtn"
               :other-param="otherParam"
               @custom-validate="customValidate">
    </form-list>
    <div v-if="isEmpty"
         style="height: 100%;width:100%;display: flex; justify-content: center; align-items: center;">
      <el-empty class="custom_empty"
                :image-size="100"></el-empty>
    </div>
  </div>
</template>
<style scoped>
.custom_empty {
  padding: 0;
}
</style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { mapGetters } from 'vuex'

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
    },
    formWidth: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      saveApi: 'planGanttManager.outputSave',
      isCustomValidate: true,
      existDefaultBtn: false,
      existCustomBtn: true,
      isEmpty: false,
      dataSource: [
        {
          // labelText: '输出信息',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'outputRequests', // 保存时格式，类似detailList[0].roleName
          addFieldLayout: 'vertical',
          isView: true,
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
              type: 'view',
              labelText: '输出要求', // 控件显示的文本
              fieldName: 'describes',
              placeholder: '请输入输出要求',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              }
            },
            {
              type: 'view',
              labelText: '输出类型', // 控件显示的文本
              fieldName: 'outPutTypeDisplay',
              placeholder: '请输入输出类型',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              }
            },
            {
              type: 'uploadView', // 控件类型
              labelText: '上传附件', // 控件显示的文本
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              filesLayout: 'row',
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
    toLink (k) {
      this.$api['thirdPartInterface.getA5FileLink']({ taskId: this.taskId })
        .then((res) => {
          if (res) {
            let url = res.fileLink
            if (url.substring(0, 10) === 'VISIT_URL=') {
              url = res.fileLink.substring(10)
            }
            window.open(url, '_blank')
          }
        })
        .catch(() => { })
    },
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getOutputData(this.taskId)
      }
    },
    getOutputData (taskId) {
      const that = this
      that.otherParam = { taskId: taskId }
      that.$api['planGanttManager.outputInfo']({ taskId: taskId, planChangeDetailId: this.vueThis.changeRecordId })
        .then(function (res) {
          let datas = []
          if (Array.isArray(res) && res.length > 0) {
            that.isEmpty = false
            datas = res
          } else {
            that.isEmpty = true
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            (that.ganttName === 'changeGantt' || that.ganttName === 'analysisGantt') &&
            JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('output') !== -1
          ) {
            that.isEmpty = false
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
          that.formData.outputRequests = datas
          that.oldOutput = JSON.parse(JSON.stringify(datas))
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved (res) { },
    customValidate (saveParams) { }
  }
}
</script>
