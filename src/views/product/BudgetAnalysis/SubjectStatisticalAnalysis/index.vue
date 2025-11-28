<script>
import AnalysisItem from './analysisItem.vue'
export default {
  name: 'SubjectStatisticalAnalysis',
  components:{
    AnalysisItem
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data(){
    return {
      subjectList:[]
    }
  },
  created() {
    console.log(this.thirdMenuParam,'三级菜单参数')
    if (this.thirdMenuParam) {
      this.projectId = this.thirdMenuParam.ID || this.thirdMenuParam.WHOLEID
    }
    if (this.projectId) {
      this.queryDeclaration()
    }
  },
  methods:{
    queryDeclaration(){
      this.$api['budgetDeclaration.queryDeclaration']({ wholeId: this.projectId }).then((res) => {
        if (res) {
          // const rootNode = res.find(item => !item.subjectBasePid)
          this.subjectList = res.filter(item => item.subjectBasePid === '0a4975ca10714e5fa98h')
          console.log(this.subjectList,'根节点')
        }
      })
    }
  }
}
</script>

<template>
  <div class='subject-statistical-analysis'>
    <analysis-item class='analysis-item' v-for='item in subjectList' :key='item.subjectBaseid' :projectId='projectId' :id='item.subjectBaseid' :title='item.name'></analysis-item>
  </div>
</template>

<style scoped lang='scss'>
.subject-statistical-analysis{
  height: 100%;
  width: 100%;
  overflow: auto;
}
.analysis-item{
  box-shadow: 0px 0px 4px #a3a3a3;
  margin-bottom: 12px;
}
</style>
