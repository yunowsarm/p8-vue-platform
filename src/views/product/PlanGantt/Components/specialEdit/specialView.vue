<template>
  <div style="position: relative; width:100%;height:calc(100% - 2px);">
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
<style scoped></style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'PlanSpecialEdit',
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
      saveApi: 'planGanttManager.specialSave',
      isCustomValidate: true,
      existDefaultBtn: false,
      existCustomBtn: true,
      dataSource: [
        {
          // labelText: '特别说明信息',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'specialRequests', // 保存时格式，类似detailList[0].roleName
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
              type: 'view', // 控件类型
              fieldName: 'describes',
              colLayout: 'singleCol',
              placeholder: '特别说明', // 默认控件的空值文本
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
        specialRequests: [],
        confidentialiteList: []
      },
      otherParam: {
        taskId: ''
      },
      oldSpecial: [],
      isEmpty: false,
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted () { },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getSpecialData(this.taskId)
      }
    },
    getSpecialData (taskId) {

      const that = this
      that.otherParam = { taskId: taskId }
      that.$api['planGanttManager.specialInfo']({ taskId: taskId })
        .then(function (res) {
          if (res && Object.keys(res) && Object.keys(res).length > 0) {
            that.isEmpty = false
          } else {
            that.isEmpty = true
          }
          let datas = []
          if (res) {
            datas = res
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            (that.ganttName === 'changeGantt' || that.ganttName === 'analysisGantt') &&
            JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('special') !== -1
          ) {
            datas = that.vueThis.newTaskMap[taskId].special
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
          that.formData.specialRequests = datas
          that.oldSpecial = JSON.parse(JSON.stringify(datas))
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
