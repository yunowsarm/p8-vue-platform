<template>
  <form-list ref="form"
             @rendered="rendered"
             @saved="saved"
             :data-source="dataSource"
             :api="saveApi"
             :is-custom-validate="true"
             @custom-validate="customValidate"
             :form="formData">
  </form-list>

</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'Contract',
  components: {
    FormList
  },
  props: {
    row: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      dialogpreviewHeight: 500,
      saveApi: 'relevanceContract.contractImport',
      dataSource: [
        {
          type: 'upload', // 控件类型
          labelText: '合同附件',
          fieldName: 'uploadFileJson',
          colLayout: 'singleCol',
          uploadConfig: {
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      formData: {},
      modify: {}
    }
  },
  mounted () {
    // this.getSettingData()
  },
  methods: {
    saved (res) { },
    rendered () {
      // this.getSettingData()
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    handlePreview (data) {
      console.log("🚀 ~ handleUpload ~ data:", data)
    },
    async getSettingData () {
      let res = await this.$api['SystemSettings.loadMenuBgImages']({ entityName: 'BP_THEME' })
      if (res) {
        this.getFileUrl(res) // 获取图片流
      }
    },
    // 获取图片流
    getFileUrl (uploadFileJson) {
      const that = this
      uploadFileJson.map((item) => {
        if (item.id) {
          that.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
            item.filePath = window.URL.createObjectURL(new Blob([res.data]))
          })
        }
      })
      that.modify.uploadFileJson = uploadFileJson
      that.formData = Object.assign({}, that.modify)
    },
    customValidate (saveParams) {
      if (saveParams.uploadFileJson.length > 0) {
        saveParams.uploadFileJson.forEach(item => {
          item.aorName = item.aorName
          item.aorDetail = item.aorDetail
          item.taskId = item.taskId
          item.attId = item.id
          item.attFilePath = item.filePath
          item.attFileName = item.fileName
          item.attFileType = item.fileType
          item.attConfidentialite = item.confidentialite
        });
      }
      this.$refs.form.submitForm(saveParams, this.saveApi)
      this.$emit('handleCancel')
    },
    handleUpload (data) {
      console.log("🚀 ~ handleUpload ~ data:", data)
      this.uploadFileJson.push(data)

    },
    handleRemove (data) {
      if (data.id) {
        this.$api['SystemSettings.removeMenuBgImage']({ attId: data.id }).then((res) => {
          this.$message.success('删除成功')
        })
      }
    }
  }
}
</script>
