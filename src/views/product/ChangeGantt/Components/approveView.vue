<template>
  <div style="height: 100%">
    <div class="couerDivClass" id="couerDiv">
      <div class="top" :style="{ height: changeInfoHeight }">
        <form-list
          ref="form"
          @rendered="rendered"
          :form="formData"
          :data-source="flag ? dataSource1 : dataSource"
          :api="saveApi"
          :exist-default-btn="existDefaultBtn"
          :exist-custom-btn="existCustomBtn"
          :other-param="otherParam"
        >
          <template #weatherChange>
            <el-select v-model="formData.weatherChange" :disabled="weatherChangeDisabled" placeholder="请选择是否产生变更记录" @change="selectChange">
              <el-option v-for="item in optionsW" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </template>
        </form-list>
      </div>
      <el-button type="primary" size="mini" @click="approveViewDetail">{{ '查看计划详情' }}</el-button>
      <ApproveViewDetail
        v-if="isApproveViewDetailView"
        :plan-info-id="planInfoId"
        :create-page="createPage"
        :read-only-visible="readOnlyVisible"
        :approve-content-view="approveContentView"
        :is-view="isApproveViewDetailView"
        @close="closeApproveViewDetail"
      ></ApproveViewDetail>
    </div>
  </div>
</template>
<style lang="scss">
.couerDivClass {
  height: calc(100% - 2px) !important;
  padding-top: 1px;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 2 !important;
}
.top {
  position: relative;
  margin-bottom: 8px;
  background: $base-white-color;
  border: 1px solid $base-line-color;
  border-radius: 6px;
  overflow: hidden;
}
.bottom {
  height: calc(100% - 250px);
  position: relative;
  border: 1px solid $base-line-color;
  border-radius: 6px;
  box-shadow: 5px 5px 13px $base-bg-shadow;
  background: $base-white-color;
  overflow: hidden;
}
</style>
<script>
import { Select, Option, Button, P8Form as FormList } from 'p8-components-ui'

import ApproveViewDetail from './approveViewDetail'
export default {
  name: 'SubmitChange',
  components: {
    FormList,
    'el-select': Select,
    'el-option': Option,
    'el-button': Button,
    ApproveViewDetail
  },
  props: {
    approveContentView: {
      type: Object,
      default: null
    },
    compType: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      saveApi: 'planChange.changeRecordInfoUpdateType',
      isCustomValidate: true,
      title: '计划变更提交',
      readOnlyVisible: true,
      existDefaultBtn: false,
      hasPlanInfoId: false,
      isApproveViewDetailView: false,
      createPage: 'planChange',
      planInfoId: '',
      changeInfoHeight: '250px',
      existCustomBtn: true,
      weatherChangeDisabled: false,
      dialogConfig: {
        modal: false
      },
      optionsW: [
        { label: '是', value: '0' },
        { label: '否', value: '1' }
      ],
      dataSource: [
        {
          type: 'view',
          labelText: '计划名称',
          fieldName: 'planInfoName',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '变更原因',
          fieldName: 'reasonChangeDisp',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '变更原因分类',
          fieldName: 'changeTypeDisp',
          colLayout: 'singleCol'
        },
        {
          labelText: '原因描述',
          type: 'view',
          fieldName: 'reason',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'uploadView',
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          defaultValue: [],
          colLayout: 'singleCol',
          uploadConfig: {
            // , // 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
            // limit: 1
          },
          listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        },
        {
          labelText: '影响分析',
          type: 'view',
          fieldName: 'measure',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          }
        },
        {
          labelText: '产生变更记录',
          type: 'blank',
          slotName: 'weatherChange',
          colLayout: 'singleCol'
        }
      ],
      dataSource1: [
        {
          type: 'view',
          labelText: '计划名称',
          fieldName: 'planInfoName',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '变更原因',
          fieldName: 'reasonChangeDisp',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '项目名称',
          fieldName: 'projectName',
          colLayout: 'singleCol',
          slotName: 'projectName'
        },
        {
          type: 'view',
          labelText: '变更原因分类',
          fieldName: 'changeTypeDisp',
          colLayout: 'singleCol'
        },
        {
          labelText: '原因描述',
          type: 'view',
          fieldName: 'reason',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'uploadView',
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          defaultValue: [],
          colLayout: 'singleCol',
          uploadConfig: {
            // , // 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
            // limit: 1
          },
          listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        },
        {
          labelText: '影响分析',
          type: 'view',
          fieldName: 'measure',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          }
        },
        {
          labelText: '产生变更记录',
          type: 'blank',
          slotName: 'weatherChange',
          colLayout: 'singleCol'
        }
      ],
      modify: {},
      otherParam: {
        id: ''
      },
      formData: {},
      flag: false // 当项目类型为专题计划时，采用dataSource1
    }
  },
  watch: {
    planInfoId: function (newVal) {
      if (newVal) {
        this.hasPlanInfoId = true
      }
    },
    formData: function (newVal) {
      if (newVal.projectClassification === 'PROJECT_CLASSIFICATION_0_02') {
        this.flag = true
      }
    },
    deep: true,
    immediate: true
  },
  methods: {
    rendered() {
      const that = this
      if (that.approveContentView.changeId) {
        this.$api['planChange.changeRecordInfo']({ id: that.approveContentView.changeId })
          .then(function (res) {
            if (res) {
              that.formData.changeType = res.changeType
              that.formData.changeTypeDisp = res.changeTypeDisp
              that.formData.reason = res.reason
              that.formData.measure = res.measure
              that.formData.id = that.approveContentView.changeId
              that.formData.weatherChange = res.weatherChange
              that.formData.reasonChangeDisp = res.reasonChangeDisp
              that.formData.planInfoId = res.planInfoId
              that.formData.planInfoName = res.planInfoName
              that.planInfoId = res.planInfoId
              that.planInfoName = res.planInfoName
              that.formData.projectName = res.projectName
              that.formData.projectClassification = res.projectClassification
              that.formData.uploadFiles = res.uploadFiles
              that.formData = Object.assign({}, that.formData)
            }
          })
          .catch(function (error) {
            console.error(error)
          })
      }
    },
    selectChange() {
      this.$refs.form.submitForm(this.formData, this.saveApi)
    },
    approveViewDetail() {
      this.isApproveViewDetailView = true
    },
    closeApproveViewDetail() {
      this.isApproveViewDetailView = false
    }
  },
  mounted() {
    if (this.compType === 'approvalHistoryView') {
      this.weatherChangeDisabled = true
    }
  }
}
</script>
