<script>
import InitiateChange from './initiateChange.vue'
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import formView from '@/views/product/problemManagement/formView.vue'
export default {
  name: 'BudgetChange',
  components: {
    formView,
    InitiateChange,
    CommonDialog
  },
  props: {
    specialRoteName:{
      type: String,
      default: null
    },
    thirdMenuParam: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  created() {
    console.log(this.specialRoteName,'specialRoteName')
    console.log(this.thirdMenuParam, 'thirdMenuParam')
  },
  data() {
    return {
      visible:false,
      dialogHeight: Math.floor(document.documentElement.clientHeight * 0.65),
      reportParam: {
        WHOLEID: {
          mode: '=',
          relation: 'and',
          value: this.thirdMenuParam.WHOLEID
        }
      }
    }
  },
  methods:{
    openInitiateChange(){
      console.log(this.thirdMenuParam,'88888')
      const status = ['执行中','变更驳回']
      if(!status.includes(this.thirdMenuParam.BUDGETSTATUSNAME)){
        this.$message.error(`${this.thirdMenuParam.BUDGETSTATUSNAME}时无法发起变更`)
        return
      }
      this.visible = true
    },
    omponentRefresh(){
      this.$refs.tableRender.omponentRefresh()
    }
  }
}
</script>

<template>
  <div style="height: 100%">
    <P8TableRender :specialRoteName='specialRoteName ?? $route.name' ref="tableRender" code="wholeBudgetChangeTable" :reportParam="reportParam" @change='openInitiateChange'></P8TableRender>
    <common-dialog v-if="visible" :visible="visible" title="预算变更" :show-handle-btn="false" :dialog-height="dialogHeight" @close="visible = false">
      <template #dialog>
        <initiate-change :project-info="thirdMenuParam" @save-success="omponentRefresh"
                         @close="visible = false" />
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss"></style>
