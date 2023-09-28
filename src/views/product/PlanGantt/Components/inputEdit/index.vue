<template>
  <div>
    <el-tabs v-model="activeOutput" type="border-card">
      <el-tab-pane label="输入要求" name="inputKey">
        <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 输入要求</span>
        <div style="position: relative; padding-bottom: 50px">
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
      </el-tab-pane>
      <el-tab-pane label="前置任务输出物" name="getPreOutputKey">
        <span slot="label"><i class="p8 icon-xuanxiang1"></i> 前置任务输出物</span>
        <form-list ref="form1" @rendered="preRendered" @saved="preSaved" :data-source="preDataSource" :exist-default-btn="existDefaultBtn" :api="preSaveApi" :form="preFormData"> </form-list>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss" scoped>
.baseTitle {
  height: 35px;
  margin-top: 5px;
  text-align: center;
}

.baseContent {
  margin-top: 5px;
  text-align: left;
}
::v-deep .el-form-item > .el-form-item__content:first-child {
  margin-left: 0 !important;
}
</style>
<script>
import { Tag, P8Form as FormList } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
import { checkInputData, otherEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'

export default {
  name: 'PlanInputEdit',
  components: {
    'el-tag': Tag,
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    secretGrade: {
      type: String
    },
    ganttName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      activeOutput: 'inputKey',
      data: [],
      saveApi: 'planGanttManager.inputSave',
      isCustomValidate: true,
      existDefaultBtn: false,
      dataSource: [
        {
          // labelText: '输入信息',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'inputRequests', // 保存时格式，类似detailList[0].roleName
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
              labelText: '输入要求',
              type: 'textarea',
              fieldName: 'describes',
              placeholder: '请输入输入要求',
              colLayout: 'singleCol',
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
              listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      formData: {
        inputRequests: [],
        confidentialiteList: []
      },
      otherParam: {
        taskId: ''
      },
      oldInput: [],
      preSaveApi: '',
      preDataSource: [
        {
          labelText: '',
          type: 'addField', // 控件类型--增删行
          isView: true,
          colLayout: 'singleCol',
          addFieldLayout: 'vertical',
          fieldName: 'preDatas', // 保存时格式，类似detailList[0].roleName
          children: [
            {
              labelText: '任务名称',
              type: 'view', // 控件类型
              fieldName: 'taskName',
              colLayout: 'singleCol'
            },
            {
              type: 'view', // 控件类型
              fieldName: 'describes',
              colLayout: 'singleCol',
              labelText: '输出要求' // 默认控件的空值文本
            },
            {
              type: 'uploadView', // 控件类型
              labelText: '补充要求', // 控件显示的文本
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              filesLayout: 'row',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              },
              listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      preFormData: {
        preDatas: [],
        confidentialiteList: []
      },
      nullity: ''
    }
  },
  watch: {},
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted() {
    // if (this.taskId && this.taskId !== '') {
    //   this.getInputData(this.taskId)
    // }
  },
  methods: {
    getInputData(taskId) {
      const that = this
      that.$api['planGanttManager.inputInfo']({ taskId: taskId })
        .then(function (res) {
          if (res && res.length > 0) {
            res.forEach(function (item) {
              if (item.inputDatas && item.inputDatas.length > 0) {
                item.inputDatas.forEach(function (data) {
                  that.preFormData.preDatas.push(data)
                })
              }
            })
          }
          // 变更进入时先查看newTaskMap中是否存在对应前置任务，存在时检查对应输入是否修改，若修改显示修改后的数据
          if (that.ganttName === 'changeGantt') {
            const ganttObject = GanttObject.getGanttObject(that.ganttName)
            const task = ganttObject.getTask(taskId)
            if (task.$target && task.$target.length > 0 && Object.keys(that.vueThis.newTaskMap).length > 0) {
              that.preFormData.preDatas = checkInputData(ganttObject, that.vueThis, task, that.data)
            } else {
              that.preFormData.preDatas = []
            }
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    rendered() {
      if (this.taskId && this.taskId !== '') {
        this.getCustomInputData(this.taskId)
      }
    },
    getCustomInputData(taskId) {
      const that = this
      that.otherParam = { taskId: taskId }
      that.$api['planGanttManager.customInputInfo']({ taskId: taskId })
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
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('input') !== -1
          ) {
            datas = that.vueThis.newTaskMap[taskId].input
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
          that.formData.inputRequests = datas
          that.oldInput = JSON.parse(JSON.stringify(datas))
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    saved(res) {
      if (res) {
        this.getCustomInputData(this.taskId)
      }
    },
    customValidate(saveParams) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      const task = ganttObject.getTask(that.taskId)
      this.nullity = task.nullity
      if (this.nullity !== '1') {
        if (that.taskId) {
          let secretLevel = true
          saveParams.inputRequests.forEach((val) => {
            val.uploadFiles.forEach((item) => {
              if (item.confidentialite > task.secretGrade) {
                secretLevel = false
              }
            })
          })
          if (!secretLevel) {
            this.$message({
              type: 'warning',
              message: '文件密级不可高于计划密级！'
            })
            return
          }
          if (that.ganttName === 'planGantt') {
            // 计划编辑
            this.$refs.form.submitForm(saveParams, this.saveApi)
          } else if (that.ganttName === 'changeGantt') {
            // 计划变更
            const ganttObject = GanttObject.getGanttObject(that.ganttName)
            otherEditCheck(that.oldInput, that.formData.inputRequests, ganttObject, that.vueThis, that.taskId, 'input')
            that.vueThis.hasSave = true
            that.$message.success('保存成功！')
          }
        }
      } else {
        this.$message({
          type: 'warning',
          message: '该责任人已退出团队！不允许添加输入物！'
        })
      }
    },
    preRendered() {
      if (this.taskId && this.taskId !== '') {
        this.getInputData(this.taskId)
      }
    },
    preSaved() {}
  }
}
</script>
