<template>
  <div>
    <form-list labelWidth="100px"
               ref="form"
               :dataSource="dataSource"
               :form="formData"
               :api="saveApi"
               :is-custom-validate="isCustomValidate"
               @custom-validate="customValidate"
               @saved="saved"
               @rendered="rendered">
      <!-- <template #outputRequest>
        <div class="edit-outputdata-view">
          <div class="title">&nbsp;&nbsp;输出要求 </div>
          <ul class="file-list">
            <li v-for="(item) in outputRequest"
                :key="item.descriptionId">
              <p>{{item.descriptionStr}}</p>
            </li>
          </ul>
        </div>
      </template> -->
      <template #outputIo>
        <div class="edit-outputIo-view">
          <div class="title">输出物 </div>
        </div>
      </template>
    </form-list>
  </div>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'TaskManagerEdit',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: '00001'
    },
    outputRequest: {
      type: Array
    },
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    const dataSource = [
      // {
      //   type: 'blank',
      //   labelText: '',
      //   slotName: 'outputRequest',
      //   colLayout: ''
      // },
      {
        type: 'blank',
        labelText: '',
        slotName: 'outputIo',
        colLayout: ''
      },
      {
        labelText: '',
        type: 'addField',
        colLayout: 'singleCol',
        fieldName: 'uploadFileJson', // 保存时格式，类似detailList[0].roleName
        addFieldLayout: 'vertical',
        children: [
          {
            type: 'text',
            labelText: '输出物名称',
            fieldName: 'aorName',
            colLayout: 'singleCol',
            placeholder: '请输入',
            defaultValue: '',
            rules: [
              {
                required: true,
                message: '必填'
              }
            ]
          },
          {
            type: 'upload',
            labelText: '上传附件', // 控件显示的文本
            fieldName: 'uploadFiles',
            defaultValue: [],
            colLayout: 'singleCol',
            uploadConfig: {
              // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              limit: 1
            },
            listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
          },
          {
            type: 'text',
            fieldName: 'aorDetail',
            labelText: '补充说明',
            colLayout: 'singleCol',
            placeholder: '请填写',
            defaultValue: ''
          }
        ]
      }
    ]
    return {
      secretGrade: '',
      saveApi: 'taskManager.saveOutputIo',
      outputIoApi: 'taskManager.getOutputIo',
      dataSource,
      isCustomValidate: true,
      formData: Object.assign({}, {
        uploadFileJson: [],
        /**
         * confidentialiteList: 在增删行带附件中需处理成二维数组
         * confidentialiteList: [
         *   [ {confidentialite: ''} ]
         * ]
        */
        confidentialiteList: []
      })
    }
  },
  mounted () {
    this.getOutputIoData()
  },
  methods: {
    rendered () {

    },
    saved () {
      this.$emit('editSaveOK', 'output')
    },
    getOutputIoData () {
      let _this = this
      this.$api[this.outputIoApi]({ taskId: _this.taskId }).then(res => {
        // let uploadFileJson = res.uploadFileJson
        if (res && res.length) {
          res.forEach((item, index) => {
            _this.renderedFormData(item, index)
          })
        } else {
          _this.renderedFormData({})
        }
      })
    },
    renderedFormData (row, index) {
      if (Object.keys(row).length) {
        let tempObj = {
          uploadFiles: []
        }
        let tempFileObj = {}
        Object.keys(row).forEach(key => {
          if (key.indexOf('aor') !== -1) {
            tempObj[key] = row[key]
          }
          if (row['attFileName']) {
            if (key.indexOf('att') !== -1) {
              tempFileObj[this.keyHandle('att', key)] = row[key]
            }
          }
          tempObj.taskId = row.taskId
          tempObj.key = row.key
        })
        if (Object.keys(tempFileObj).length) {
          tempObj.uploadFiles.push(tempFileObj)
        }
        this.$set(this.formData.uploadFileJson, index, tempObj)
      } else {
        let tempObj = {}
        this.dataSource[this.dataSource.length - 1].children.forEach(item => {
          tempObj[item.fieldName] = item.defaultValue
        })
        this.$set(this.formData.uploadFileJson, 0, tempObj)
      }
    },
    /** rowInfo中 att-文件信息字段 key 的处理 */
    keyHandle (str, key) {
      let s = key.replace(str, '')
      s = s.replace(s[0], s[0].toLowerCase())
      return s
    },
    customValidate (saveParams) {
      let _this = this

      let params = { // params: 保存时请求接口所需的参数
        taskId: _this.taskId,
        uploadFileJson: []
      }
      let secretLevel = true
      saveParams.uploadFileJson.forEach(val => {
        val.uploadFiles.forEach(item => {
          if (item.confidentialite > this.thirdMenuParam.secretGrade) {
            secretLevel = false
          }
        })
      })
      if (!secretLevel) {
        this.$message({
          type: 'warning',
          message: '文件密级不可高于计划密级！'
        })
      } else {
        if (saveParams.uploadFileJson && saveParams.uploadFileJson.length) {
          saveParams.uploadFileJson.forEach((item, index) => {
            let tempObj = {}
            tempObj.aorId = item.aorId ? item.aorId : ''
            tempObj.aorName = item.aorName ? item.aorName : ''
            tempObj.aorDetail = item.aorDetail ? item.aorDetail : ''
            tempObj.taskId = item.taskId ? item.taskId : _this.taskId
            if (item.uploadFiles && item.uploadFiles.length) {
              tempObj.attId = item.uploadFiles[0].id ? item.uploadFiles[0].id : ''
              tempObj.attFilePath = item.uploadFiles[0].filePath ? item.uploadFiles[0].filePath : ''
              tempObj.attFileName = item.uploadFiles[0].fileName ? item.uploadFiles[0].fileName : ''
              tempObj.attFileType = item.uploadFiles[0].fileType ? item.uploadFiles[0].fileType : ''
              tempObj.attConfidentialite = item.uploadFiles[0].confidentialite ? item.uploadFiles[0].confidentialite : ''
            }
            _this.$set(params.uploadFileJson, index, tempObj)
          })
        }
        _this.$refs.form.submitForm(params, _this.saveApi)
      }
    },
    downloadOutputRequsetFile (item) { // 输出要求-文件下载
      if (item.attId) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.attId }, { responseType: 'blob' }).then(backJson => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = item.attFileName
          document.body.appendChild(link)

          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }).finally(() => {
          // this.search.exportLoading = false
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form.formList .el-row {
  height: auto;
}
.edit-outputdata-view {
  background-color: rgba(239, 239, 239, 0.5);
  position: relative;
  min-height: 40px;
  .title {
    font-weight: bold;
    position: absolute;
    left: -100px;
    width: 100px;
    height: 100%;
    text-align: center;
  }
  .file-list {
    li {
      box-sizing: border-box;
      list-style: decimal;
      padding: 0 10px;
      margin-left: 20px;
      &.not-last {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
      p {
        margin: 0;
        padding: 0;
      }
      p span.filename {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
.edit-outputIo-view {
  position: relative;
  .title {
    position: absolute;
    left: -100px;
    width: 100px;
    text-align: center;
    font-weight: bold;
  }
}
</style>
