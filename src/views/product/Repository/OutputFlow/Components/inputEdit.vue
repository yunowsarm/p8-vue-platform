<template>
  <div style="margin-top: 24px;">
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
    <el-tag type="success"
            style="margin-bottom: 10px">前置输出物</el-tag>
    <div>
      <pre-form-list class="pre-form-list"
                     ref="form1"
                     :existDefaultBtn="false"
                     @rendered="preRendered"
                     @saved="preSaved"
                     :dataSource="preDataSource"
                     :api="preSaveApi"
                     :form="preFormData">
      </pre-form-list>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.baseTitle {
  height: 35px;
  margin-top: 5px;
  text-align: center;
}

.baseContent {
  margin-top: 5px;
  text-align: left;
}
.pre-form-list {
  & ::v-deep .el-form-item--small.el-form-item {
    margin-bottom: 0px;
    margin-top: -6px;
    margin-left: -34px;
  }
}
</style>
<script>

import { Tag, P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'InputEdit',
  components: {
    'el-tag': Tag,
    'form-list': FormList,
    'pre-form-list': FormList
  },
  props: ['activityInfoId'],
  data () {
    return {
      saveApi: 'OutputFlow.inputSave',
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
          labelText: '输入要求',
          type: 'textarea',
          fieldName: 'describes',
          placeholder: '请输入输入要求',
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
          listType: 'text'// 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      formData: {
        confidentialiteList: []
      },
      preSaveApi: '',
      preDataSource: [
        {
          labelText: '',
          type: 'addField', // 控件类型--增删行
          isView: true,
          colLayout: 'singleCol',
          addFieldLayout: 'vertical',
          fieldName: 'preDatas', // 保存时格式，类似detailList[0].roleName
          children: [
            {
              labelText: '活动名称',
              type: 'view', // 控件类型
              fieldName: 'name',
              colLayout: 'singleCol'
            },
            {
              type: 'view', // 控件类型
              fieldName: 'code',
              colLayout: 'singleCol',
              labelText: '活动编号' // 默认控件的空值文本
            },
            {
              type: 'view', // 控件类型
              fieldName: 'describes',
              colLayout: 'singleCol',
              labelText: '输出要求' // 默认控件的空值文本
            },
            {
              type: 'uploadView', // 控件类型
              labelText: '补充要求', // 控件显示的文本
              fieldName: 'attachments',
              colLayout: 'singleCol',
              filesLayout: 'row',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              },
              listType: 'text'// 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      preFormData: {
        preDatas: [],
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
          this.getInputData(newValue)
        } else {
          this.data = null
          this.activityInfoId = null
        }

        if (newValue && newValue !== '') {
          this.activityInfoId = newValue
          this.getCustomInputData(newValue)
        } else {
          this.activityInfoId = null
          this.formData = Object.assign({}, {})
        }
      }
    }
  },
  mounted () {
    if (this.activityInfoId && this.activityInfoId !== '') {
      this.getInputData(this.activityInfoId)
    }
  },
  methods: {
    getInputData (activityInfoId) {
      let that = this
      that.$api['OutputFlow.inputInfo']({ activityInfoId: activityInfoId }).then(function (res) {
        if (res) {
          that.preFormData.preDatas = res
        } else {
          that.preFormData.preDatas = []
        }
      }).catch(function (error) {
        console.error('error' + error)
      })
    },
    rendered () {
      if (this.activityInfoId && this.activityInfoId !== '') {
        this.getCustomInputData(this.activityInfoId)
      }
    },
    clickEvent () {

    },
    getCustomInputData (activityInfoId) {
      let that = this
      that.$api['OutputFlow.customInputInfo']({ activityInfoId: activityInfoId }).then(function (res) {
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
        this.getCustomInputData(this.activityInfoId)
      }
      this.$emit('saveSuccess', null)
    },
    handleChange (info) {

    },
    customValidate (saveParams) {
      this.$emit('saveAll')
    },
    preRendered () {
      if (this.activityInfoId && this.activityInfoId !== '') {
        this.getInputData(this.activityInfoId)
      }
    },
    preSaved () {
    }
  }
}
</script>
