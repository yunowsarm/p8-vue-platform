<template>
  <div style="position: relative; padding-bottom: 50px">
    <form-list ref="form"
               @rendered="rendered"
               form-layout="vertical"
               :dataSource="dataSource"
               :api="saveApi"
               :form="formData"
               :exist-default-btn="existDefaultBtn">
    </form-list>
  </div>
  <!--  </div>-->
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

import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'PlanInputEdit',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    versionType: {
      type: String,
      default: null
    },
    versionId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      data: [],
      saveApi: '',
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
              listType: 'secret'// 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      formData: {
        inputRequests: [],
        confidentialiteList: []
      }
    }
  },
  watch: {
    taskId (val) {
      this.rendered()
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getCustomInputData()
      }
    },
    downloadOutputRequsetFile (item) {
      if (item.id) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(backJson => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = item.attFilePath
          document.body.appendChild(link)

          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }).finally(() => {
          // this.search.exportLoading = false
        })
      }
    },
    getCustomInputData () {
      let that = this
      that.$api['planGanttManager.getInputVersionData']({ taskId: that.taskId, versionId: that.versionId, versionType: that.versionType }).then(function (res) {
        let datas = []
        if (res) {
          datas = res
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
        that.formData = Object.assign({}, that.formData)
      }).catch(function (error) {
        console.error('error' + error)
      })
    }
  }
}
</script>
