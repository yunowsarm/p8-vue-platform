<template>
  <div>
    <!-- <p style="color: red; font-size: 14px; font-weight: bolder; text-align: right; line-height: 30px; margin-right: 10px">密级：{{ excelSecretGradeDisplay }}</p> -->
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
          <div class="title">导入说明：</div>
          <!-- <ul class="file-list"
              v-for="(item, index) in outputRequest"
              :key="item.attId"
              :class="{ 'not-last': index < outputRequest.length - 1 }"> -->
          <!-- <li>
              <p>
                模板下载:
                <span class="filename">
                  <el-link type="success"
                           :underline="true"
                           @click="downloadOutputRequsetFile(item)">{{ item.attFileName }}</el-link>
                </span>
              </p>
            </li> -->
          <!-- <li> -->
          <!-- <p>导入说明: {{ item.descriptionStr }}</p> -->
          <p>通过excel导出的文件，将当前计划下的所有任务更新</p>
          <p>excel导出的来源为：计划管理-计划编制-excel导出</p>
          <p class="importantSty">excel导入文件可以修改的属性为：计划编制列表的列头带有修改图标的属性</p>
          <!-- </li>
          </ul> -->
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
    // eslint-disable-next-line vue/no-unused-components
    Notification
  },
  props: {
    taskId: {
      type: String,
      default: '00001'
    },
    planInfoId: {
      type: String,
      default: ''
    },
    excelSecretGradeDisplay: {
      type: String,
      default: '00001'
    },
    excelSecretGrade: {
      type: String,
      default: '00001'
    },
    outputRequest: {
      type: Array
    },
    columnConfigs: {
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
      saveApi: 'planGanttManager.importExcel',
      checkOutApi: 'planGanttManager.importExcelCheckOut',
      outputIoApi: 'planGanttManager.importExcel',
      dataSource,
      isCustomValidate: true,
      importExcel: true,
      visibleImportExcel: true,
      formData: Object.assign(
        {},
        {
          uploadFileJson: []
          /**
           * confidentialiteList: 在增删行带附件中需处理成二维数组
           * confidentialiteList: [
           *   [ {confidentialite: ''} ]
           * ]
           */
          // confidentialiteList: []
        }
      )
    }
  },
  // mounted () {
  //      this.renderedFormData({})
  //    },
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
    getOutputIoData () {
      const _this = this
      this.$api[this.outputIoApi]({ taskId: _this.taskId }).then((res) => {
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
        const tempObj = {
          uploadFiles: []
        }
        const tempFileObj = {}
        // Object.keys(row).forEach(key => {
        //   if (key.indexOf('aor') !== -1) {
        //     tempObj[key] = row[key]
        //   }
        //   if (row['attFileName']) {
        //     if (key.indexOf('att') !== -1) {
        //       tempFileObj[this.keyHandle('att', key)] = row[key]
        //     }
        //   }
        //   tempObj.taskId = row.taskId
        //   tempObj.key = row.key
        // })
        if (Object.keys(tempFileObj).length) {
          tempObj.uploadFiles.push(tempFileObj)
        }
        this.$set(this.formData.uploadFileJson, index, tempObj)

        // let confidentDefaultValue = [ { confidentialite: tempFileObj.confidentialite } ]
        // this.$set(this.formData.confidentialiteList, index, confidentDefaultValue)
      } else {
        const tempObj = Object.assign(
          {},
          {
            uploadFileJson: []
          }
        )
        // this.dataSource[this.dataSource.length - 1].children.forEach(item => {
        //   tempObj[item.fieldName] = item.defaultValue
        // })
        this.$set(this.formData, 0, tempObj)
        // this.formData.confidentialiteList = []
      }
    },
    /** rowInfo中 att-文件信息字段 key 的处理 */
    keyHandle (str, key) {
      let s = key.replace(str, '')
      s = s.replace(s[0], s[0].toLowerCase())
      return s
    },
    customValidate (saveParams) {
      this.$refs.form.isDisable = true

      const params = {
        // params: 保存时请求接口所需的参数
        planInfoId: this.planInfoId,
        createSource: '0',
        uploadFileJson: [],
        columnConfigs: this.columnConfigs
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
      if (Number(this.excelSecretGrade) < Number(params.uploadFileJson[0].attConfidentialite)) {
        this.$message.warning('文件密级高于计划密级!')
        this.$refs.form.isDisable = false
      } else {
        this.$api['planGanttManager.importExcelCheckOut'](params)
          .then((data) => {
            this.$refs.form.isDisable = false
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
              this.$refs.form.isDisable = true
              this.$refs.form.submitForm(params, this.saveApi)
            }
          })
          .finally(() => {
            // this.search.exportLoading = false
          })
      }
    },
    downloadOutputRequsetFile (item) {
      // 输出要求-文件下载
      if (item.attId) {
        this.$api['SystemSettings.getTemplateFileUrl']({ attachmentId: item.path }, { responseType: 'blob' })
          .then((backJson) => {
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(new Blob([backJson.data]))
            link.download = item.attFilePath
            document.body.appendChild(link)
            // link.click()
            // window.URL.revokeObjectURL(link.href)
            // document.body.removeChild(link)
            if (document.createEvent) {
              // 主流浏览器
              const e = document.createEvent('MouseEvent')
              e.initEvent('click', false, false)
              link.dispatchEvent(e)
            }
            setTimeout(function () {
              // 兼容Firefox/4 bug#https://stackoverflow.com/questions/30694453/blob-createobjecturl-download-not-working-in-firefox-but-works-when-debugging#
              window.URL.revokeObjectURL(link.href)
              document.body.removeChild(link)
            }, 100)
          })
          .finally(() => {
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
.importantSty{
  color: red;
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
