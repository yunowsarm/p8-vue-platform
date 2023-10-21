<template>
  <div>
    <form-list class="special-edit-form"
               ref="form"
               @rendered="rendered"
               @saved="saved"
               :dataSource="dataSource"
               :api="saveApi"
               :form="formData"
               :existDefaultBtn="false"
               :is-custom-validate="isCustomValidate"
               :other-param="otherParam"
               @custom-validate="customValidate">
    </form-list>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'SpecialEdit',
  components: {
    FormList
  },
  props: ['activityInfoId'],
  data () {
    return {
      saveApi: 'OutputFlow.specialSave',
      isCustomValidate: true,
      userRoles: [],
      dataSource: [
        {
          labelText: '特别说明',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          addFieldLayout: 'vertical',
          fieldName: 'specialRequests', // 保存时格式，类似detailList[0].roleName
          children: [
            {
              type: 'textarea', // 控件类型
              fieldName: 'specialRes',
              colLayout: 'singleCol',
              placeholder: '特别说明', // 默认控件的空值文本
              rules: [
                {
                  required: true,
                  message: '必填'
                }
              ]
            },
            {
              type: 'hidden',
              fieldName: 'id'
            },
            {
              type: 'upload', // 控件类型
              labelText: '上传附件', // 控件显示的文本
              labelWidth: '60px',
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              },
              listType: 'secret'// 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      formData: {
        specialRequests: [],
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
          this.getSpecialData(newValue)
        }
      },
      immediate: true
    }
  },
  mounted () {
  },
  methods: {
    rendered () {
      if (this.activityInfoId && this.activityInfoId !== '') {
        this.getSpecialData(this.activityInfoId)
      }
    },
    clickEvent () {

    },
    getSpecialData (activityInfoId) {
      let that = this
      that.otherParam.activityInfoId = activityInfoId
      that.$api['OutputFlow.specialInfo']({ activityInfoId: activityInfoId }).then(function (res) {
        if (res) {
          that.formData.specialRequests = res
        } else {
          that.formData.specialRequests = []
        }
        that.formData = Object.assign({}, that.formData)
      }).catch(function (error) {
        console.error('error' + error)
      })
    },
    saved (res) {
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
