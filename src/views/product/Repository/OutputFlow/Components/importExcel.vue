<template>
  <form-list labelWidth="100px"
             ref="form"
             :dataSource="dataSource"
             :form="formData"
             :api="saveApi"
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
            <p>
              导入类型：
            </p>
            <p>
              (1)模板导入：通过下载上方模板，按照大纲级别，将文档中的活动导入为选中活动的下级
            </p>
            <p>
              (2)更新导入：通过excel导出的文件，将当前所有活动更新。excel导出的来源为：知识库管理-产出流程管理-活动管理-excel导出
            </p>
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
        type: 'select', // 控件类型
        fieldName: 'createSource',
        labelText: '导入类型',
        clearable: true,
        colLayout: 'doubleCol',
        options: [
          {
            label: '模板导入',
            value: 'insert'
          },
          {
            label: '更新导入',
            value: 'update'
          }
        ],
        rules: [
          {
            required: true,
            message: '必选'
          }
        ]
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

      this.$api['OutputFlow.importExcelCheckout'](params).then(data => {
        if (data.length > 0) {
          let messages = '<ol> <li> 导入错误信息 </li>'
          data.forEach((message) => {
            messages += '<li> ' + message + ' </li>'
          })
          messages += '</ol>'
          Notification.error({
            title: '导入错误信息',
            dangerouslyUseHTMLString: true,
            message: messages
          })
        } else {
          this.$refs.form.submitForm(params, this.saveApi)
        }
      })
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
