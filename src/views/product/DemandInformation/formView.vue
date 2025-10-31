<template>
  <div class="header">
    <div class="content">
      <div style="width: 50%">
        <div class="title">{{ formData.sourceChannel }}</div>
        <form-render class="formRender"
                     :data-view-id="dataViewId"
                     :record="{ desformCode: codeForm }"
                     :prop-param="propParam"
                     page-type="view"
                     v-bind="$attrs"></form-render>
      </div>
      <div style="width: 50%">
        <div class="title">市场需求信息表</div>
        <form-list v-if="demandOptions !== '1'"
                   :key="formKey"
                   ref="formInfo2"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSourceInfo"
                   :exist-default-btn="false"
                   :form="formData"> </form-list>
        <form-list v-if="demandOptions === '1'"
                   ref="formInfo6"
                   class="formList"
                   :key="formKey"
                   label-width="80px"
                   :data-source="dataSourceDemandView"
                   :exist-default-btn="false"
                   :form="formData">
        </form-list>
        <div v-if="demandOptions !== '1'"
             class="title">预审意见</div>
        <form-list v-if="demandOptions !== '1'"
                   :key="formKey"
                   ref="formInfo3"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSourceOpinion"
                   :exist-default-btn="false"
                   :form="formData"> </form-list>
        <div v-if="demandOptions !== '1'"
             class="title">需求信息描述</div>
        <form-list v-if="demandOptions !== '1'"
                   :key="formKey"
                   ref="formInfo4"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSourceInfoTwo"
                   :exist-default-btn="false"
                   :form="formData"> </form-list>
        <div class="title">分析意见</div>
        <form-list :key="formKey"
                   ref="formInfo5"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSource"
                   :exist-default-btn="false"
                   :form="formData"> </form-list>
      </div>
    </div>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'

export default {
  components: {
    FormList,
    FormRender
  },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      demandOptions: this.row[0].CURRENT_SETTING || '0',
      formKey: new Date().getTime(),
      formType: this.type,
      saveType: false,
      visible: false,
      codeForm: this.demandCode, // 新建/修改表单code
      dataViewId: this.businessKey, // 修改页面id
      propParam: {}, // 将参数传至表单
      formData: {
        uploadFiles: [],
        processingTeam: []
      },
      dataSource: [],
      dataSourceDemandView: [
        {
          type: 'view',
          labelText: '处理结果',
          fieldName: 'processingResults',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '备注',
          fieldName: 'remark',
          colLayout: 'singleCol'
        },
        {
          type: 'uploadView', // 控件类型
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          colLayout: 'singleCol',
          uploadConfig: {
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      dataSourceInfo: [
        {
          type: 'view',
          labelText: '需求名称',
          fieldName: 'demandName',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'view',
          labelText: '来源渠道',
          fieldName: 'sourceChannel',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '客户名称',
          fieldName: 'customerName',
          colLayout: 'singleCol'
        },
        {
          labelText: '客户联系电话',
          type: 'view',
          fieldName: 'customerPhone',
          colLayout: 'singleCol',
          placeholder: '请输入手机或座机号码',
          tip: '手机格式如:13512341234 座机格式如:010-40020020'
        },
        {
          labelText: '收集人联系电话',
          type: 'view',
          fieldName: 'collectorPhone',
          colLayout: 'singleCol',
          placeholder: '请输入手机或座机号码',
          tip: '手机格式如:13512341234 座机格式如:010-40020020'
        },
        {
          type: 'view',
          labelText: '客户群',
          fieldName: 'customerGroup',
          colLayout: 'singleCol',
          tip: ''
        },
        {
          type: 'view',
          labelText: '基线产品/项目名称',
          fieldName: 'projectName',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求预分类建议',
          fieldName: 'demandSuggestionsDisplay',
          fieldConfig: {}
        },
        {
          type: 'view', // 控件类型
          labelText: '是否属于紧急需求', // 控件显示的文本
          fieldName: 'urgentNeedDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '客户反映', // 控件显示的文本
          fieldName: 'customerFeedbackDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '是否承诺', // 控件显示的文本
          fieldName: 'commitmentDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求背景',
          fieldName: 'demandBackground',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求紧迫性',
          fieldName: 'demandUrgency',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '用户需求描述',
          fieldName: 'demandDescribe',
          colLayout: 'singleCol'
        },
        {
          type: 'uploadView', // 控件类型
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          colLayout: 'singleCol',
          uploadConfig: {
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        },
        {
          type: 'view',
          labelText: '早期需求验证计划',
          fieldName: 'earlyPlan',
          colLayout: 'singleCol',
          placeholder: '请输入早期需求验证计划',
          maxlength: 250
        }
      ],
      dataSourceOpinion: [
        {
          type: 'view',
          labelText: '选择需求分析人',
          fieldName: 'requirementAnalystDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol'
        }
      ],
      dataSourceInfoTwo: [
        {
          type: 'view',
          labelText: '早期需求验证计划',
          fieldName: 'earlyPlan',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        }
      ],
      dataSourceAnalyse: [
        {
          type: 'view',
          labelText: '需求关键字',
          fieldName: 'keywords',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '客户优先级', // 控件显示的文本
          fieldName: 'priorityDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '产品优先级', // 控件显示的文本
          fieldName: 'productPriorityDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '技术优先级', // 控件显示的文本
          fieldName: 'technologyPriorityDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求程度分类', // 控件显示的文本
          fieldName: 'demandLevelDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求初步验证情况',
          fieldName: 'preliminaryVerification',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求层次分类',
          fieldName: 'classificationDemandDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求时间窗', // 控件显示的文本
          fieldName: 'timeWindowDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求处理建议',
          fieldName: 'handlingSuggestions',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '建议需求处理团队',
          fieldName: 'processingTeamDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求处理结论',
          fieldName: 'processingConclusionDisplay',
          colLayout: 'doubleCol'
        }
      ],
      dataSourceConclusion: [
        {
          type: 'view',
          labelText: '需求处理结论',
          fieldName: 'processingConclusionDisplay',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  created () {
    this.getFiledInfo()
  },
  mounted () {
    this.formData.sourceChannel = this.sourceChannel

    // 区分不同审批节点展示不同表单
    // if (this.formType === '1') {
    //   if (this.selectedApproval.yesOrNo) {
    //     this.dataSource = this.dataSourceInfoView
    //   } else {
    //     this.dataSource = this.dataSourceInfo
    //   }
    // } else {
    //   if (this.selectedApproval.yesOrNo) {
    //     this.dataSource = this.dataSourceAnalyseView
    //   } else {
    //     this.dataSource = this.dataSourceAnalyse
    //   }
    // }
    if (this.demandOptions !== '1') {
      this.dataSource = this.dataSourceAnalyse
    } else {
      this.dataSource = this.dataSourceConclusion
    }
    this.viewForm()
  },
  methods: {
    getFiledInfo () {
      this.$api['demandManagement.getFiledInfo']({ fieldCode: '' }).then((res) => {
        if (res && res.length > 0) {
          const dataSources = [
            this.dataSourceInfo,
            this.dataSourceOpinion,
            this.dataSourceInfoTwo,
            this.dataSourceAnalyse
          ];

          res.forEach(field => {
            dataSources.forEach(source => {
              source.forEach(item => {
                if (item.labelText === field.fieldName) {
                  item.tip = field.fieldTitle;
                  this.$set(item, 'tip', field.fieldTitle)
                }
              });
            });
          });
          this.formKey = new Date().getTime()
        }
      })
    },
    viewForm () {
      this.$api['demandManagement.viewRequirement']({
        id: this.row[0].ID ? this.row[0].ID : this.row[0].id
      }).then((res) => {
        if (res) {
          this.formData = res
          if (res.analysisList.length > 0) {
            this.formData = { ...this.formData, ...res.analysisList[0] }
          }
        }
      })
      if (this.row && this.row.length > 0) {
        this.codeForm = this.row[0].DEMAND_CODE ? this.row[0].DEMAND_CODE : this.row[0].demandCode
        this.dataViewId = this.row[0].ID ? this.row[0].ID : this.row[0].id
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 17px;
  font-weight: bold;
  margin: 10px 0;
}

.header {
  height: 100% !important;
  overflow: auto;
}

.content {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
  position: relative;
  height: 100%;
}

.formRender {
  height: 100%;
  overflow-y: auto;
}

.formList {
  height: 100%;
  overflow-y: auto;
  // width: 50%;
  // ::v-deep .el-col-12 {
  //   height: 50px !important;
  // }
}

.btn {
  position: absolute;
  bottom: 5px;
  right: 30px;
}
</style>
