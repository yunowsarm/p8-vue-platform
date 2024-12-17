<template>
  <div style="overflow: auto">
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource1"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #interface>
          <el-alert title="界面风格"
                    :closable="false"
                    type="info"></el-alert>
        </template>
        <template #systemThemeType>
          <el-radio-group v-model="formData.systemThemeType"
                          size="small">
            <el-radio-button label="systemThemeType1">主题1</el-radio-button>
            <el-radio-button label="systemThemeType2">主题2</el-radio-button>
            <el-radio-button label="systemThemeType3">主题3</el-radio-button>
          </el-radio-group>
        </template>
      </form-list>
    </el-card>
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource2"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #tool>
          <el-alert title="工具栏样式"
                    :closable="false"
                    type="info"></el-alert>
        </template>
      </form-list>
    </el-card>
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource3"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #assembly>
          <el-alert title="组件响应方式"
                    :closable="false"
                    type="info"></el-alert>
        </template>
        <template #pageViewType>
          <el-radio-group v-model="formData.pageViewType"
                          size="small">
            <el-radio-button label="pageViewType1">页码分页</el-radio-button>
            <el-radio-button label="pageViewType2">滚动分页</el-radio-button>
          </el-radio-group>
        </template>
      </form-list>
    </el-card>
  </div>
</template>
<style scoped>
.el-alert--info.is-light {
  font-weight: 900;
  margin-left: -145px;
  background-color: white;
  color: black;
}
.main-router {
  height: 100% !important;
}
.card_box {
  margin: 16px;
}
</style>
<script>
import { P8Form as FormList, Alert, RadioGroup, RadioButton } from 'p8-components-ui'

export default {
  name: 'AppearanceEdit',
  components: {
    FormList,
    'el-alert': Alert,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton
  },
  data () {
    return {
      saveApi: 'SystemSettings.saveAppearanceSettings',
      dataSource1: [
        {
          type: 'blank',
          slotName: 'interface',
          colLayout: 'singleCol'
        },
        {
          labelText: '主题风格',
          type: 'blank',
          slotName: 'systemThemeType',
          colLayout: 'doubleCol'
        },
        {
          type: 'upload', // 控件类型
          labelText: '登录背景图',
          fieldName: 'uploadFileJson',
          colLayout: 'doubleCol',
          uploadConfig: {
            limit: 1,
            accept: '.jpeg,.jpg,.gif,.png'
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'picture-card' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      dataSource2: [
        {
          type: 'blank',
          slotName: 'tool',
          colLayout: 'singleCol'
        },
        {
          labelText: '显示文字',
          type: 'switch',
          fieldName: 'toolbarTextDisplay',
          colLayout: 'singleCol'
        },
        {
          labelText: '紧凑布局',
          type: 'switch',
          fieldName: 'toolbarCompactLayout',
          colLayout: 'singleCol'
        }
      ],
      dataSource3: [
        {
          type: 'blank',
          slotName: 'assembly',
          colLayout: 'singleCol'
        },
        {
          labelText: '列表分页方式',
          type: 'blank',
          slotName: 'pageViewType',
          colLayout: 'singleCol'
        },
        {
          labelText: '启用抽屉模式',
          type: 'switch',
          fieldName: 'componentEnableDrawer',
          colLayout: 'singleCol'
        }
      ],
      formData: {},
      modify: {}
    }
  },
  mounted () { },
  methods: {
    rendered () {
      this.getSettingData()
    },
    clickEvent () {

    },
    getSettingData () {
      let that = this
      that.$api['SystemSettings.getAppearanceSettings']()
        .then(function (res) {
          res.settings.forEach(function (item) {
            that.modify[item.key] = item.value === 'true' ? true : item.value === 'false' ? false : item.value
          })
          that.getFileUrl(res.uploadFileJson) // 获取图片流
        })
        .catch(function (error) {

        })
    },
    // 获取图片流
    getFileUrl (uploadFileJson) {
      let that = this
      if (uploadFileJson.length > 0) {
        uploadFileJson.map((item) => {
          if (item.id) {
            that.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
              item.urlTemp = window.URL.createObjectURL(new Blob([res.data]))
            })
          }
        })
        that.modify.uploadFileJson = uploadFileJson
      }
      if (that.modify.toolbarTextDisplay === 'false') {
        that.modify.toolbarTextDisplay = false
      } else {
        that.modify.toolbarTextDisplay = true
      }
      that.formData = Object.assign({}, that.modify)
    },
    customValidate (params) {
      let saveParams = {}
      let settings = [
        {
          key: 'systemThemeType', // 系统主题
          value: params.systemThemeType
        },
        {
          key: 'toolbarTextDisplay', // 工具栏启用文字
          value: params.toolbarTextDisplay
        },
        {
          key: 'toolbarCompactLayout', // 工具栏紧凑布局
          value: params.toolbarCompactLayout
        },
        {
          key: 'pageViewType', // 列表分页方式
          value: params.pageViewType
        },
        {
          key: 'componentEnableDrawer', // 组件响应方式
          value: params.componentEnableDrawer
        }
      ]
      let uploadFileJson = params.uploadFileJson ? params.uploadFileJson : []
      saveParams.uploadFileJson = uploadFileJson
      if (saveParams.uploadFileJson[0]) {
        saveParams.uploadFileJson[0].confidentialite = '9001'
      }

      saveParams.settings = settings

      this.$refs.form.submitForm(saveParams, this.saveApi)
    },
    saved (res) { }
  }
}
</script>
