<script>
import TotalBudget from '@/views/product/BudgetManagement/TotalBudget/index.vue'
import WbsBudget from '@/views/product/BudgetManagement/WbsBudget/index.vue'
import BudgetChange from '@/views/product/BudgetManagement/BudgetChange/index.vue'
import BudgetWarning from '@/views/product/BudgetManagement/BudgetWarning/index.vue'
import SubjectStatisticalAnalysis from '@/views/product/BudgetAnalysis/SubjectStatisticalAnalysis'
import _cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Budget',
  components:{
    TotalBudget,
    WbsBudget,
    BudgetChange,
    BudgetWarning,
    SubjectStatisticalAnalysis
  },
  props: {
    row: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      activeName: 'totalBudget',
      thirdMenuParam: null,
      renderKey: Date.now()
    }
  },
  computed:{
    isMonitor(){
      return this.$route.name !== 'myProject'
    }
  },
  // watch:{
  //   row:{
  //     handler(val){
  //       console.log(val,'val')
  //       if(val && val.length){
  //         this.thirdMenuParam = _cloneDeep(val[0])
  //         this.renderKey = Date.now()
  //       }
  //     },
  //     immediate: true,
  //     deep: true
  //   }
  // },
  created() {
    console.log(this.isMonitor,'isMonitor')
    // 获取三级菜单参数
    let parent = this.$parent
    while (parent) {
      if (parent.row && Object.keys(parent.row).length > 0) {
        this.thirdMenuParam = parent.row[0]
        break
      }
      parent = parent.$parent
    }
    console.log(this.thirdMenuParam)
  },
  mounted() {

  },
  methods:{
    handleClick(){
      console.log(this.thirdMenuParam,'handleClick')
    }
  }
}
</script>

<template>
  <div :key='renderKey' style="height: 100%">
    <el-tabs v-if='!isMonitor' v-model="activeName" @tab-click='handleClick'>
      <el-tab-pane label="项目总预算" name="totalBudget">
        <TotalBudget :current-route='$route.name' v-if="activeName === 'totalBudget'" :thirdMenuParam="thirdMenuParam"></TotalBudget>
      </el-tab-pane>
      <el-tab-pane label="WBS预算" name="wbsBudget">
        <WbsBudget :current-route='$route.name' v-if="activeName === 'wbsBudget'" :thirdMenuParam="thirdMenuParam"></WbsBudget>
      </el-tab-pane>
      <el-tab-pane label="预算变更" name="budgetChange">
        <BudgetChange v-if="activeName === 'budgetChange'" specialRoteName='BudgetChange' :thirdMenuParam="thirdMenuParam"></BudgetChange>
      </el-tab-pane>
      <el-tab-pane label="预算预警" name="budgetWarning">
        <BudgetWarning v-if="activeName === 'budgetWarning'" specialRoteName='BudgetWarning' :thirdMenuParam="thirdMenuParam"></BudgetWarning>
      </el-tab-pane>
    </el-tabs>
    <el-tabs v-else v-model="activeName" @tab-click='handleClick'>
      <el-tab-pane label="总预算分析" name="totalBudget">
        <TotalBudget :current-route='$route.name' v-if="activeName === 'totalBudget'" :thirdMenuParam="thirdMenuParam"></TotalBudget>
      </el-tab-pane>
      <el-tab-pane label="WBS预算分析" name="wbsBudget">
        <WbsBudget :current-route='$route.name' v-if="activeName === 'wbsBudget'" :thirdMenuParam="thirdMenuParam"></WbsBudget>
      </el-tab-pane>
      <el-tab-pane label="预算变更记录" name="budgetChange">
        <BudgetChange v-if="activeName === 'budgetChange'" specialRoteName='BudgetChange' :thirdMenuParam="thirdMenuParam"></BudgetChange>
      </el-tab-pane>
      <el-tab-pane label="科目统计分析" name="SubjectStatisticalAnalysis">
       <SubjectStatisticalAnalysis v-if="activeName === 'SubjectStatisticalAnalysis'" :thirdMenuParam="thirdMenuParam"></SubjectStatisticalAnalysis>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
::v-deep .el-tabs--top .el-tabs__content{
  height: calc(100% - 42px) !important;
}
::v-deep .normal-layout{
  height: 100% !important;
}
</style>
