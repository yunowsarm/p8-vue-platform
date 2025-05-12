<template>
  <common-dialog title="上传背景图片"
                 :visible="visible"
                 width="50%"
                 :dialog-height="dialogpreviewHeight"
                 :show-handle-btn="false"
                 @close="handleCancel">
    <template #dialog>
      <el-alert :closable="false"
                title="注意:为保证图片能正常显示请尽量上传合适尺寸的图片(265 x 1125)px."
                type="warning"
                show-icon />
      <form-list ref="form"
                 label-width="20px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #systemNameSlot>
          <el-alert title="系统名称"
                    :closable="false"
                    type="info"></el-alert>
        </template>
      </form-list>

    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog, P8Form as FormList, P8Upload as CommonUpload } from 'p8-components-ui'
export default {
  name: 'AddTabs',
  components: {
    CommonDialog,
    FormList,
    CommonUpload
  },
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data () {
    return {
      dialogpreviewHeight: 500,
      saveApi: 'SystemSettings.saveMenuBgImages',
      dataSource: [
        {
          type: 'upload', // 控件类型
          labelText: '',
          fieldName: 'uploadFileJson',
          colLayout: 'singleCol',
          uploadConfig: {
            accept: '.png',
            isImage: true
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'picture-card' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      formData: {},
      modify: {}
    }
  },
  mounted () {
    this.getSettingData()
  },
  methods: {
    saved (res) { },
    rendered () {
      this.getSettingData()
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    handlePreview (data) {
      console.log("🚀 ~ handleUpload ~ data:", data)
    },
    async getSettingData () {
      let res = await this.$api['SystemSettings.loadMenuBgImages']()
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
      console.log(saveParams.uploadFileJson, 'saveParams.uploadFileJson');
      if (saveParams.uploadFileJson.length > 0) {
        saveParams.uploadFileJson.forEach(el => {
          el.filePath = el.url = el.customItem1
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
