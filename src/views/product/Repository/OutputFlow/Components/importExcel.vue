<template>
  <form-list labelWidth="100px"
             ref="form"
             :dataSource="dataSource"
             :form="formData"
             :api="saveApi"
             :existDefaultBtn="false"
             :is-custom-validate="isCustomValidate"
             @custom-validate="customValidate"
             @saved="saved"
             @rendered="rendered">
    <template #outputRequest>
      <div class="edit-outputdata-view">
        <div class="title">导入模板: </div>
        <ul class="file-list"
            v-for="(item,index) in outputRequest"
            :key="item.attId"
            :class="{ 'not-last': index < outputRequest.length -1 }">
          <li>
            <p>模板下载:
              <span class="filename">
                <el-link type="success"
                         :underline="true"
                         @click="downloadOutputRequsetFile(item)">{{item.attFileName}}</el-link>
              </span>
              <!-- <span class="filename" @click="downloadOutputRequsetFile(item)">{{item.attFileName}}
                </span> -->
            </p>
          </li>
          <li>
            <p>导入说明: {{item.descriptionStr}}</p>
          </li>
        </ul>
      </div>
    </template>
    <template #outputIo>
      <div class="edit-outputIo-view">
        <div class="title">Excel: </div>
      </div>
    </template>
  </form-list>
</template>
<script>
import { P8Form as FormList, Link } from 'p8-components-ui'

export default {
  name: 'ImportExcel',
  components: {
    FormList,
    'el-link': Link
  },
  props: {
    taskId: {
      type: String,
      default: '00001'
    },
    outputRequest: {
      type: Array
    }
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
      saveApi: 'OutputFlow.importExcel',
      outputIoApi: 'OutputFlow.importExcel',
      dataSource,
      isCustomValidate: true,
      formData: Object.assign({}, {
        uploadFileJson: []
        /**
         * confidentialiteList: 在增删行带附件中需处理成二维数组
         * confidentialiteList: [
         *   [ {confidentialite: ''} ]
         * ]
        */
        // confidentialiteList: []
      })
    }
  },
  methods: {
    rendered () {

    },
    saved () {
      this.$emit('saveSuccess', 'success')
    },
    /** rowInfo中 att-文件信息字段 key 的处理 */
    keyHandle (str, key) {
      let s = key.replace(str, '')
      s = s.replace(s[0], s[0].toLowerCase())
      return s
    },
    customValidate (saveParams) {

      let params = { // params: 保存时请求接口所需的参数
        taskId: this.taskId,
        uploadFileJson: []
      }
      if (saveParams.uploadFileJson && saveParams.uploadFileJson.length) {
        saveParams.uploadFileJson.forEach((item, index) => {
          let tempObj = {}
          tempObj.aorId = this.taskId
          tempObj.aorName = item.aorName
          tempObj.aorDetail = item.aorDetail
          tempObj.taskId = item.taskId
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
    downloadOutputRequsetFile (item) { // 输出要求-文件下载
      if (item.attId) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.attId }, { responseType: 'blob' }).then(backJson => {

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
