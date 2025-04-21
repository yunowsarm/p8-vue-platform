<template>
  <div style="position: relative; padding-bottom: 50px;width:100%;height:calc(100% - 70px);">
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
<style lang="scss" scoped>
::v-deep .el-form-item > .el-form-item__content:first-child {
  margin-left: 0 !important;
}
</style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { otherEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'

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
    // secretGrade: {
    //   type: String
    // },
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
      nullity: '',
      saveApi: 'planGanttManager.specialSave',
      isCustomValidate: true,
      dataSource: [
        {
          // labelText: '特别说明信息',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'specialRequests', // 保存时格式，类似detailList[0].roleName
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
              type: 'textarea', // 控件类型
              fieldName: 'describes',
              colLayout: 'singleCol',
              placeholder: '特别说明', // 默认控件的空值文本
              fieldConfig: {
                rows: '6'
              }
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
        specialRequests: [],
        confidentialiteList: []
      },
      otherParam: {
        taskId: ''
      },
      oldSpecial: []
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
    saved (res) {
      if (res === 'true') {
        this.getSpecialData(this.taskId)
      }
    },
    customValidate (saveParams) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      const task = ganttObject.getTask(that.taskId)
      this.nullity = task.nullity
      if (this.nullity !== '1') {
        if (this.taskId) {
          let secretLevel = true
          // saveParams.specialRequests.forEach((val) => {
          //   val.uploadFiles.forEach((item) => {
          //     if (item.confidentialite > task.secretGrade) {
          //       secretLevel = false
          //     }
          //   })
          // })
          // if (!secretLevel) {
          //   this.$message({
          //     type: 'warning',
          //     message: '文件密级不可高于计划密级！'
          //   })
          //   return
          // }
          if (that.ganttName === 'planGantt') {
            // 计划编辑
            this.$refs.form.submitForm(saveParams, this.saveApi)
          } else if (that.ganttName === 'changeGantt') {
            // 计划变更
            const ganttObject = GanttObject.getGanttObject(that.ganttName)
            otherEditCheck(that.oldSpecial, that.formData.specialRequests, ganttObject, that.vueThis, that.taskId, 'special')
            that.vueThis.hasSave = true
            that.$message.success('保存成功！')
          }
        }
      } else {
        this.$message({
          type: 'warning',
          message: '该责任人已退出团队！不允许添加特别说明！'
        })
      }
    }
  }
}
</script>
