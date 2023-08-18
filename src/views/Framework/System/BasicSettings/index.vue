<template>
  <div style="overflow: auto">
    <el-card class="card_box">
      <form-list
        ref="form"
        label-width="150px"
        @rendered="rendered"
        @saved="saved"
        :data-source="dataSource1"
        :api="saveApi"
        :is-custom-validate="true"
        @custom-validate="customValidate"
        :form="formData"
      >
        <template #systemNameSlot>
          <el-alert title="系统名称" :closable="false" type="info"></el-alert>
        </template>
      </form-list>
    </el-card>
    <el-card class="card_box">
      <form-list
        ref="form"
        label-width="150px"
        @rendered="rendered"
        @saved="saved"
        :data-source="dataSource2"
        :api="saveApi"
        :is-custom-validate="true"
        @custom-validate="customValidate"
        :form="formData"
      >
        <template #systemOperation>
          <el-alert title="系统运行" :closable="false" type="info"></el-alert>
        </template>
        <template #systemModel>
          <el-radio-group v-model="formData.systemModel" size="small">
            <el-radio-button label="systemModel1">正常模式</el-radio-button>
            <el-radio-button label="systemModel2">维护模式</el-radio-button>
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
.formList.el-form > .el-row.formBtn {
  height: auto;
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 100%;
  border-top: 1px solid #e1e1e1;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding-bottom: 9px;
  padding-top: 9px;
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
  name: 'BasicSettingsEdit',
  components: {
    FormList,
    'el-alert': Alert,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton
  },
  data() {
    return {
      saveApi: 'SystemSettings.saveBasicSetting',
      dataSource1: [
        {
          type: 'hidden',
          fieldName: 'id',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          slotName: 'systemNameSlot',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '中文名称',
          fieldName: 'systemName',
          placeholder: '请输入中文名称',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          labelText: '英文名称',
          fieldName: 'systemNameEn',
          placeholder: '请输入英文名称',
          colLayout: 'doubleCol'
        },
        {
          type: 'upload', // 控件类型
          labelText: '系统Logo',
          fieldName: 'uploadFileJson',
          colLayout: 'singleCol',
          uploadConfig: {
            limit: 1,
            accept: '.jpeg,.jpg,.gif,.png',
            isImage: true
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'picture-card' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      dataSource2: [
        {
          type: 'blank',
          slotName: 'systemOperation',
          colLayout: 'singleCol'
        },
        {
          labelText: '运行模式',
          type: 'blank',
          slotName: 'systemModel',
          colLayout: 'singleCol'
        }
      ],
      formData: {},
      modify: {}
    }
  },
  mounted() {},
  methods: {
    rendered() {
      this.getSettingData()
    },
    clickEvent() {
      console.log('click')
    },
    getSettingData() {
      let that = this
      that.$api['SystemSettings.getBasicSetting']()
        .then(function (res) {
          res.settings.forEach(function (item) {
            that.modify[item.key] = item.value
          })
          if (res.uploadFileJson) {
            that.getFileUrl(res.uploadFileJson) // 获取图片流
          } else {
            that.modify.uploadFileJson = []
            that.formData = Object.assign({}, that.modify)
          }
        })
        .catch(function (error) {
          console.log('error' + error)
        })
    },
    // 获取图片流
    getFileUrl(uploadFileJson) {
      let that = this
      uploadFileJson.map((item) => {
        if (item.id) {
          that.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
            // item.urlTemp = window.URL.createObjectURL(new Blob([res.data]))
            item.filePath = window.URL.createObjectURL(new Blob([res.data]))
          })
        }
      })
      that.modify.uploadFileJson = uploadFileJson
      that.formData = Object.assign({}, that.modify)
    },
    customValidate(params) {
      let saveParams = {}
      let settings = [
        {
          key: 'systemName', // 系统名称
          value: params.systemName
        },
        {
          key: 'systemNameEn', // 英文名称
          value: params.systemNameEn
        },
        {
          key: 'systemModel', // 运行模式
          value: params.systemModel
        }
      ]
      let uploadFileJson = params.uploadFileJson ? params.uploadFileJson : []
      saveParams.uploadFileJson = uploadFileJson
      if (saveParams.uploadFileJson[0]) {
        saveParams.uploadFileJson[0].confidentialite = '9001'
        if (!saveParams.uploadFileJson[0].id) {
          saveParams.uploadFileJson[0].filePath = saveParams.uploadFileJson[0].url = saveParams.uploadFileJson[0].customItem1
        }
      }

      saveParams.settings = settings
      console.log(saveParams)
      this.$refs.form.submitForm(saveParams, this.saveApi)
    },
    saved(res) {}
  }
}
</script>
