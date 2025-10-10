<template>
  <div class="content">
    <el-button v-if="pageType"
               type="primary"
               style="margin: 5px;"
               @click="add">添加预警</el-button>
    <table-render code="PLAN_WARNING"
                  :west-tree-param="reportParam"
                  :report-param="reportParam"></table-render>
    <common-dialog v-if="warningGrule"
                   :visible="warningGrule"
                   :dialog-config="dialogConfig"
                   :show-handle-btn="false"
                   @close="visibleMsgClose"
                   :dialog-height="dialogHeight"
                   title="新建预警规则">
      <template #dialog>
        <form-render dataViewId=""
                     ref="form"
                     @close="visibleMsgClose"
                     @save-success="visibleMsgClose"
                     pageType="view"
                     :thirdMenuParam="thirdMenuParam"
                     :row="[thirdMenuParam]"
                     :record="{ desformCode: 'PLAN_WARNING' }"></form-render>
      </template>
    </common-dialog>
  </div>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'

export default {
  name: 'PlanWarning',
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    row: {
      type: Array,
      default: function () {
        return []
      }
    },
    pageType: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      record: null,
      reportParam: {
        PLAN_INFO_ID: this.thirdMenuParam.ID,
        warnType: this.getWarnType(this.$route)
      },
      warningGrule: false,
      dialogHeight: document.documentElement.clientHeight - 384,
      dialogConfig: {
        'append-to-body': true,
        'top': '20vh'
      },
    }
  },
  mounted () { },
  methods: {

    add () {
      this.warningGrule = true
    },
    visibleMsgClose () {
      console.log('1111111111111111111111111');

      this.warningGrule = false
    },
    getWarnType (route) {
      if (route.name === 'PlanWarning') return 'plan'
      if (route.name === 'BudgetWarning') return 'budget'
      return ''
    }
  },
  components: {
    TableRender,
    ListLayout,
    FormRender,
    CommonDialog
  }
  // created() {
  //
  //   this.reportParam.PLAN_INFO_ID = this.thirdMenuParam.ID
  //
  // }
}
</script>
<style scoped>
.content {
  width: calc(100% - 29px) !important;
  height: calc(100% - 60px) !important;
  margin: 15px 15px 0 15px;
}
</style>
