<template>
  <div class="conent">
    <div class="flex-card">
      <el-card class="box-card">
        <div slot="header"
             class="clearfix">
          <span>本月计划完成率</span>
        </div>
        <el-progress class="progress"
                     type="circle"
                     color="#395df6"
                     stroke-width="20"
                     :percentage="formData.monthlyPlanCompletionRate"></el-progress>
      </el-card>
      <el-card class="box-card">
        <div slot="header"
             class="clearfix">
          <span>里程碑完成情况</span>
        </div>
        <el-progress class="progress"
                     type="circle"
                     color="#8e6cf7"
                     stroke-width="20"
                     :percentage="formData.milestoneCompletionStatus"></el-progress>
      </el-card>
      <el-card class="box-card">
        <div slot="header"
             class="clearfix">
          <span>预计超期任务分析</span>
        </div>
        <el-progress class="progress"
                     type="circle"
                     color="#00d6ae"
                     stroke-width="20"
                     :percentage="formData.expectedOverdueTaskAnalysis"></el-progress>
      </el-card>
      <el-card class="box-card">
        <div slot="header"
             class="clearfix">
          <span>文档完成情况</span>
        </div>
        <el-progress class="progress"
                     type="circle"
                     color="#13cdef"
                     stroke-width="20"
                     :percentage="formData.documentCompletionStatus"></el-progress>
      </el-card>
    </div>
    <!-- <div class="flex-steps">
      <el-card class="box-card">
        <div slot="header"
             class="clearfix">
          <span>计划进度情况</span>
        </div>
        <el-row>
          <el-col :span="1"><span class="clearfix">预估</span></el-col>
          <el-col :span="23">
            <el-steps :active="1">
              <el-step title="步骤 1"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 2"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 3"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 4"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 5"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 6"
                       description="2023-01-31"></el-step>
            </el-steps>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="1"><span class="clearfix">基线</span></el-col>
          <el-col :span="23">
            <el-steps :active="1">
              <el-step title="步骤 1"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 2"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 3"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 4"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 5"
                       description="2023-01-31"></el-step>
              <el-step title="步骤 6"
                       description="2023-01-31"></el-step>
            </el-steps>
          </el-col>
        </el-row>
      </el-card>
    </div> -->
  </div>
</template>
<style scoped>
.conent {
  height: 100%;
}
.flex-card {
  display: flex;
  height: 230px;
}
.flex-steps {
  height: calc(100% - 230px);
}
.box-card {
  width: 98.5%;
  height: 35%;
  margin: 10px;
}
.progress {
  display: flex;
  justify-content: center;
}
.clearfix {
  font-weight: bold;
}
</style>

<script>
export default {
  name: 'CompList',
  components: {
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      formData: {},
      planInfoId: ''
    }
  },
  mounted () {
    this.planInfoId = this.thirdMenuParam.ID || ''
    this.getPlanOver()
  },
  methods: {
    getPlanOver (param) {
      this.$api['planChange.planOverviewBulletinBoard']({ planInfoId: this.planInfoId }).then(res => {
        this.$set(this.formData, 'monthlyPlanCompletionRate', res.monthlyPlanCompletionRate ? res.monthlyPlanCompletionRate : 0)
        this.$set(this.formData, 'milestoneCompletionStatus', res.milestoneCompletionStatus ? res.milestoneCompletionStatus : 0)
        this.$set(this.formData, 'expectedOverdueTaskAnalysis', res.expectedOverdueTaskAnalysis ? res.expectedOverdueTaskAnalysis : 0)
        this.$set(this.formData, 'documentCompletionStatus', res.documentCompletionStatus ? res.documentCompletionStatus : 0)
      })
    }
  }
}
</script>
