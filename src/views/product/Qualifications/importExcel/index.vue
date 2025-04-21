<template>
  <div>
    <form-list label-width="100px"
               ref="form"
               :data-source="dataSource"
               :form="formData"
               :api="saveApi"
               :is-custom-validate="isCustomValidate"
               :visible.sync="visibleImportExcel"
               @custom-validate="customValidate"
               @saved="saved"
               @rendered="rendered">
      <template #outputRequest>
        <div class="edit-outputdata-view">
          <div class="title">导入模板:</div>
          <ul class="file-list">
            <li>
              <p>
                模板下载:
                <span class="filename">
                  <el-link type="success"
                           :underline="true"
                           @click="downLoadMyList">资格要求管理模版</el-link>
                </span>
              </p>
            </li>
          </ul>
        </div>
      </template>
      <template #outputIo>
        <div class="edit-outputIo-view"
             v-if="visibleImportExcel">
          <div class="title">Excel:导入模板</div>
        </div>
      </template>
    </form-list>
  </div>
</template>
<script>
import { P8Form as FormList, Link, Notification } from 'p8-components-ui'
export default {
  name: 'ImportExcel',
  components: {
    FormList,
    'el-link': Link,
    Notification
  },
  props: {
    taskId: {
      type: String,
      default: '00001'
    },
  },
  data () {
    const dataSource = [
      {
        type: 'blank',
        labelText: '',
        slotName: 'outputRequest',
        colLayout: ''
      },
      {
        type: 'blank',
        labelText: '',
        slotName: 'outputIo',
        colLayout: ''
      },
      {
        type: 'upload',
        labelText: '', // 控件显示的文本
        fieldName: 'uploadFileJson',
        defaultValue: [],
        colLayout: 'singleCol',
        uploadConfig: {
          drag: true, // 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          limit: 1
        },
        listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
      }
    ]
    return {
      saveApi: 'qualifications.importExcel',
      dataSource,
      isCustomValidate: true,
      importExcel: true,
      visibleImportExcel: true,
      formData: Object.assign(
        {},
        {
          uploadFileJson: []
        }
      )
    }
  },
  mounted () {
  },
  methods: {
    rendered () { },
    saved (res) {
      if (res.length > 0) {
        let messages = '<ol> '
        res.forEach((message) => {
          messages += '<li> ' + message + ' </li>'
        })
        messages += '</ol>'
        Notification.warning({
          title: '导入警告信息',
          dangerouslyUseHTMLString: true,
          message: messages
        })
      }
      this.formData.uploadFileJson = []
      this.$emit('save-success', 'output')
    },
    customValidate (saveParams) {
      const params = {
        // params: 保存时请求接口所需的参数
        taskId: this.taskId,
        createSource: '0',
        uploadFileJson: []
      }
      if (saveParams.uploadFileJson && saveParams.uploadFileJson.length) {
        saveParams.uploadFileJson.forEach((item, index) => {
          const tempObj = {}
          tempObj.aorId = this.taskId
          tempObj.aorName = item.aorName ? item.aorName : ''
          tempObj.aorDetail = item.aorDetail ? item.aorDetail : ''
          tempObj.taskId = item.taskId ? item.taskId : this.taskId
          tempObj.attId = item.id
          tempObj.attFilePath = item.filePath
          tempObj.attFileName = item.fileName
          tempObj.attFileType = item.fileType
          tempObj.attConfidentialite = item.confidentialite
          this.$set(params.uploadFileJson, index, tempObj)
        })
      }
      this.$refs.form.submitForm(params, this.saveApi)
    },
    downLoadMyList () {
      this.$api['qualifications.downloadTemplate']({ attachmentId: "Requirement.xlsx" }, { responseType: 'blob' })
      .then((data) => {
          const date = new Date()
          const fileName = '资格要求管理模版' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          const fileType = 'xlsx'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = `${fileName}.${fileType}`
          document.body.appendChild(link)
          link.click()
        })
        .catch(() => {
          this.$message({
            message: 'excel下载失败！',
            type: 'error'
          })
        })
    },
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
    position: absolute;
    left: -100px;
    width: 100px;
    height: 100%;
    text-align: center;
    background-color: rgba(239, 239, 239, 0.5);
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
  }
}
</style>
