<template>
  <div>
    <form-list ref="form"
               @rendered="rendered"
               form-layout="vertical"
               @saved="saved"
               :dataSource="dataSource"
               :api="saveApi"
               :form="formData"
               :existDefaultBtn="false"
               :is-custom-validate="isCustomValidate"
               @custom-validate="customValidate">
    </form-list>
  </div>
</template>
<style scoped>
</style>
<script>
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'OutputEdit',
  components: {
    FormList
  },
  props: ['activityInfoId'],
  data () {
    return {
      saveApi: 'OutputFlow.outputSave',
      isCustomValidate: true,
      dataSource: [
        {
          type: 'hidden',
          fieldName: 'id'
        },
        {
          type: 'hidden',
          fieldName: 'activityInfoId'
        },
        {
          labelText: '输出要求',
          type: 'textarea',
          fieldName: 'describes',
          placeholder: '请输入输出要求',
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
          listType: 'secret'// 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      formData: {
        confidentialiteList: []
      },
      otherParam: {}
    }
  },
  watch: {
    activityInfoId: {
      handler (newValue, oldValue) {
        if (newValue && newValue !== '') {
          this.activityInfoId = newValue
          this.getOutputData(newValue)
        } else {
          this.activityInfoId = null
          this.formData = Object.assign({}, {})
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    rendered () {
      if (this.activityInfoId && this.activityInfoId !== '') {
        this.getOutputData(this.activityInfoId)
      }
    },
    clickEvent () {

    },
    getOutputData (activityInfoId) {
      let that = this
      that.$api['OutputFlow.outputInfo']({ activityInfoId: activityInfoId }).then(function (res) {
        if (res) {
          that.formData.id = res.id
          that.formData.activityInfoId = that.activityInfoId
          that.formData.describes = res.describes
          let files = []
          if (res.attachments && res.attachments.length > 0) {
            files = res.attachments
          }
          that.formData.uploadFiles = files
        } else {
          that.formData.activityInfoId = that.activityInfoId
          that.formData.id = null
          that.formData.describes = null
          that.formData.uploadFiles = []
        }
        that.formData = Object.assign({}, that.formData)
      }).catch(function (error) {
        console.error('error' + error)
      })
    },
    saved (res) {
      if (res === 'true') {
        this.getOutputData(this.activityInfoId)
      }
      this.$emit('saveSuccess', null)
    },
    handleChange (info) {

    },
    customValidate (saveParams) {
      this.$emit('saveAll')
    }
  }

}

</script>
