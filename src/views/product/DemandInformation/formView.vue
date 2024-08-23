<template>
  <div>
    <div class="title">需求收集信息</div>
    <form-render :data-view-id="dataViewId"
                 :record="{ desformCode: codeForm }"
                 :prop-param="propParam"
                 v-bind="$attrs"
                 pageType="view"></form-render>
    <div class="title">需求填报信息</div>
    <form-list ref="form"
               class="formList"
               label-width="120px"
               :data-source="dataSource"
               :exist-default-btn="false"
               :form="formData">
    </form-list>
  </div>
</template>

<script>
import {
  P8Form as FormList,
  P8SelectUser as SelectUser
} from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
export default {
  components: {
    FormList,
    SelectUser,
    FormRender
  },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      formData: {
        requirementAnalystDisplay: '',
        uploadFiles: []
      },
      dataSource: [
        {
          type: 'view',
          labelText: '需求名称',
          fieldName: 'demandName',
          placeholder: '请输入需求名称',
          colLayout: 'doubleCol',
          maxlength: 100
        },
        {
          type: 'view',
          labelText: '来源渠道',
          fieldName: 'sourceChannel',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '客户名称',
          fieldName: 'customerName',
          placeholder: '请输入客户名称',
          colLayout: 'doubleCol',
          maxlength: 30
        },
        {
          labelText: '客户联系电话',
          type: 'view',
          fieldName: 'customerPhone',
          colLayout: 'doubleCol'
        },
        {
          labelText: '收集人联系电话',
          type: 'view',
          fieldName: 'collectorPhone',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '客户群',
          fieldName: 'customerGroup',
          placeholder: '请输入客户群',
          colLayout: 'doubleCol',
          maxlength: 30
        },
        {
          type: 'view',
          labelText: '基线产品/项目名称',
          fieldName: 'projectName',
          placeholder: '请输入基线产品/项目名称',
          colLayout: 'doubleCol',
          maxlength: 200
        },
        {
          type: 'view',
          labelText: '需求预分类建议',
          fieldName: 'demandSuggestionsDisplay',
          fieldConfig: {},
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '是否属于紧急需求', // 控件显示的文本
          fieldName: 'urgentNeedDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '客户反映', // 控件显示的文本
          fieldName: 'customerFeedbackDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '是否承诺', // 控件显示的文本
          fieldName: 'commitmentDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '需求背景',
          fieldName: 'demandBackground',
          colLayout: 'singleCol',
          placeholder: '请输入需求背景',
          maxlength: 1000
        },
        {
          type: 'view',
          labelText: '需求紧迫性',
          fieldName: 'demandUrgency',
          colLayout: 'singleCol',
          placeholder: '请输入需求紧迫性',
          maxlength: 1000
        },
        {
          type: 'view',
          labelText: '用户需求描述',
          fieldName: 'demandDescribe',
          colLayout: 'singleCol',
          placeholder: '请输入用户需求描述',
          maxlength: 1000
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
          maxlength: 1000
        },
        {
          type: 'view',
          labelText: '选择需求分析人',
          fieldName: 'requirementAnalystDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'doubleCol'
        },
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
          colLayout: 'doubleCol',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        },
        {
          type: 'view',
          labelText: '需求关键字',
          fieldName: 'keywords',
          placeholder: '请输入需求关键字',
          colLayout: 'doubleCol',
          maxlength: 200
        },
        {
          type: 'view', // 控件类型
          labelText: '客户优先级', // 控件显示的文本
          fieldName: 'priorityDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '产品优先级', // 控件显示的文本
          fieldName: 'productPriorityDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '技术优先级', // 控件显示的文本
          fieldName: 'technologyPriorityDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求程度分类', // 控件显示的文本
          fieldName: 'demandLevelDisplay',
          colLayout: 'doubleCol'
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
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求时间窗', // 控件显示的文本
          fieldName: 'timeWindowDisplay',
          colLayout: 'doubleCol'
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
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '需求处理结论',
          fieldName: 'processingConclusionDisplay',
          colLayout: 'doubleCol'
        }
      ],
      codeForm: '', // 新建/修改表单code
      dataViewId: '', // 修改页面id
      propParam: {} // 将参数传至表单
    }
  },
  mounted () {
    console.log(this.row, '============this.row');
    this.$api['demandManagement.viewRequirement']({
      id: this.row[0].ID
    }).then(res => {
      if (res) {
        this.formData = res
        if (res.analysisList.length > 0) {
          this.formData = { ...this.formData, ...res.analysisList[0] }
        }
      }
    })
    if (this.row && this.row.length > 0) {
      this.codeForm = this.row[0].DEMAND_CODE
      this.dataViewId = this.row[0].ID
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding: 10px;
  font-size: 20px;
  background: #efefef;
}
</style>
