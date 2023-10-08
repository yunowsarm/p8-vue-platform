<template>
  <div style="width: 100%">
    <el-tabs v-model="activeOutput" type="border-card">
      <el-tab-pane label="增加的输入物" name="inputKey">
        <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 增加的输入物</span>
        <div style="position: relative; padding-bottom: 50px">
          <form-list ref="form" @rendered="rendered" form-layout="vertical" :data-source="dataSource" :api="saveApi" :form="formData" :exist-default-btn="existDefaultBtn" :other-param="otherParam">
          </form-list>
        </div>
      </el-tab-pane>
      <el-tab-pane label="前置输出物" name="getPreOutputKey">
        <span slot="label"><i class="p8 icon-xuanxiang1"></i> 前置输出物</span>
        <div v-if="data">
          <div v-for="(item, index) in data" :key="index">
            <el-row type="flex">
              <el-col :span="3" class="baseTitle">任务名称</el-col>
              <el-col :span="21" class="baseContent">{{ item.taskName }}</el-col
              ><br />
            </el-row>
            <div v-for="(input, inIndex) in item.inputDatas" :key="inIndex + index">
              <el-row type="flex">
                <el-col :span="3" class="baseTitle">输入要求</el-col>
                <el-col :span="21" class="baseContent">{{ input.describes }}</el-col
                ><br />
              </el-row>
              <el-row type="flex">
                <el-col :span="3" class="baseTitle">补充要求</el-col>
                <el-col :span="21" class="baseContent">
                  <div v-for="attr in input.uploadFiles" :key="attr.label" :value="attr.value">
                    <el-row type="flex">
                      <el-col :span="12" class="baseTitle"
                        ><span @click="downloadOutputRequsetFile(attr)">{{ attr.fileName }}</span></el-col
                      >
                      <el-col :span="12" class="baseContent">{{ attr.confidentialite }}</el-col
                      ><br />
                    </el-row>
                  </div>
                </el-col>
              </el-row>
            </div>
            <el-divider></el-divider>
          </div>
        </div>
        <div v-else style="height: 24px"></div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style scoped>
.baseTitle {
  height: 35px;
  margin-top: 5px;
  text-align: center;
}
.baseContent {
  margin-top: 5px;
  text-align: left;
}
</style>
<script>
import { Row, Col, Divider, Tag, P8Form as FormList } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
import { checkInputData } from '@/assets/commonJS/ganttJS/changeGantt'

export default {
  name: 'PlanInputEdit',
  components: {
    'el-row': Row,
    'el-col': Col,
    'el-divider': Divider,
    'el-tag': Tag,
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
      data: [],
      activeOutput: 'inputKey',
      saveApi: 'planGanttManager.inputSave',
      isCustomValidate: true,
      existDefaultBtn: false,
      dataSource: [
        {
          labelText: '',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'inputRequests', // 保存时格式，类似detailList[0].roleName
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
              labelText: '输入要求',
              type: 'view',
              fieldName: 'describes',
              placeholder: '请输入输入要求',
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
      oldInput: []
    }
  },
  watch: {},
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted() {
    if (this.taskId && this.taskId !== '') {
      this.getInputData(this.taskId)
    }
  },
  methods: {
    getInputData(taskId) {
      const that = this
      that.$api['planGanttManager.inputInfo']({ taskId: taskId })
        .then(function (res) {
          if (res) {
            that.data = res
          }
          // 变更进入时先查看newTaskMap中是否存在对应前置任务，存在时检查对应输入是否修改，若修改显示修改后的数据
          if (that.ganttName === 'changeGantt') {
            const ganttObject = GanttObject.getGanttObject(that.ganttName)
            const task = ganttObject.getTask(taskId)
            if (task.$target && task.$target.length > 0 && Object.keys(that.vueThis.newTaskMap).length > 0) {
              that.data = checkInputData(ganttObject, that.vueThis, task, that.data)
            } else {
              that.data = []
            }
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    downloadOutputRequsetFile(item) {
      if (item.id) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' })
          .then((backJson) => {
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(new Blob([backJson.data]))
            link.download = item.attFilePath
            document.body.appendChild(link)

            link.click()
            window.URL.revokeObjectURL(link.href)
            document.body.removeChild(link)
          })
          .finally(() => {
            // this.search.exportLoading = false
          })
      }
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
            (that.ganttName === 'changeGantt' || that.ganttName === 'analysisGantt') &&
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
    }
  }
}
</script>
