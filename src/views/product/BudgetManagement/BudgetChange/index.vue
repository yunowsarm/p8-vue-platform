<script>
import formView from '@/views/product/problemManagement/formView.vue'
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
export default {
  name: 'BudgetChange',
  props:{
    thirdMenuParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data(){
    return {
      reportParam:{
        WHOLEID: {
          mode: '=',
          relation: 'and',
          value: this.thirdMenuParam.WHOLEID
        }
      }
    }
  }
}
</script>

<template>
  <div>
    <P8TableRender
      ref="tableRender"
      code="wholeBudgetChangeTable"
      :reportParam="reportParam"
    ></P8TableRender>
  </div>
</template>

<style scoped lang="scss"></style>
