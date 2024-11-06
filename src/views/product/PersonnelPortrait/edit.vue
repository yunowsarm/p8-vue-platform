<template>
  <div class="userPic">
    <!-- 人员信息  -->
    <div class="userInfo">
      <el-row>
        <el-col :span="24">
          <el-card shadow="always"
                   class="box-card">
            <div style="padding: 20px 0 0 20px;">
              <div class="title">
                <i class="el-icon-user-solid"
                   style="color:#4481dc;margin-right: 5px;"></i>
                <span>基本信息</span>
              </div>
              <div style="margin-top: 30px;">
                <div style="float: left; width: 10%;">
                  <img width="80px"
                       height="80px"
                       src="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"
                       alt="">
                </div>
                <div style="float: left; width: 70%; margin-left: 30px;">
                  <el-descriptions class="margin-top"
                                   :column="2">
                    <el-descriptions-item label="姓名">{{ formData.REAL_NAME }}</el-descriptions-item>
                    <el-descriptions-item label="性别">{{ formData.GENDER }}</el-descriptions-item>
                    <!-- <el-descriptions-item label="年龄">24</el-descriptions-item> -->
                    <el-descriptions-item label="所属部门">{{ formData.DEPARTMENT_NAME }}</el-descriptions-item>
                    <el-descriptions-item label="历史承担任务总数">{{formData.count}}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!-- 图表 -->
    <div class="chartBox">
      <el-row>
        <el-col :span="12">
          <el-card shadow="always"
                   class="box-card">
            <div class="chart-box">
              <div style="text-align: center;font-size: 16px; font-weight: 700;color: #999;">项目类别统计</div>
              <userTaskPieChart chartId="userTaskPieChart1"
                                :rowData="rowData"
                                type="projectCategory"></userTaskPieChart>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="always"
                   class="box-card">
            <!-- <el-button-group>
              <el-button size="mini"
                         type="primary"
                         plain
                         v-for="item in userRoleBtnList"
                         :key="item"
                         @click="btnClick(item)">{{ item }}</el-button>
            </el-button-group> -->
            <div class="chart-box">
              <userTaskRadarChart chartId="userTaskRadarChart"
                                  :rowData="rowData"
                                  :btnType="btnType"></userTaskRadarChart>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-card shadow="always"
                   class="box-card">
            <div class="chart-box">
              <div style="text-align: center;font-size: 16px; font-weight: 700;color: #999;">任务类别统计</div>
              <userTaskPieChart chartId="userTaskPieChart3"
                                type="TaskCategory"
                                :rowData="rowData"
                                :btnType="btnType"></userTaskPieChart>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="always"
                   class="box-card">
            <div class="chart-box">
              <div style="text-align: center;font-size: 16px; font-weight: 700;color: #999;">任务标识统计</div>
              <userTaskPieChart chartId="userTaskPieChart4"
                                :rowData="rowData"
                                type="taskId"></userTaskPieChart>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import userTaskPieChart from './userTaskPieChart'
import userTaskRadarChart from './userTaskRadarChart'
export default {
  name: 'DocumentEdit',
  props: {
    row: {
      type: Array
    }
  },
  components: {
  },
  data () {
    return {
      userRoleBtnList: [
        '软件测试',
        '自动化测试'
      ],
      btnType: '',
      rowData: this.row[0],
      formData: {
        REAL_NAME: '',
        DEPARTMENT_NAME: '',
        count: 0
      }
    }
  },
  mounted () {
    console.log(this.row[0], '================row');
    this.btnClick(this.userRoleBtnList[0])
    this.$api['qualifications.historyAssumptionTaskTotal']({
      userId: this.row[0].SYSUSER_ID
    }).then(res => {
      this.formData.count = res
      this.formData.REAL_NAME = this.row[0].REAL_NAME
      this.formData.DEPARTMENT_NAME = this.row[0].DEPARTMENT_NAME
    })
  },
  methods: {
    btnClick (btnType) {
      this.btnType = btnType
    }
  },
  components: {
    userTaskPieChart,
    userTaskRadarChart
  },
}
</script>

<style scoped lang="scss">
::v-deep .el-descriptions-item__label {
  font-weight: 700;
}
::v-deep .el-descriptions-item__content {
  font-weight: 700;
}
::v-deep .el-card {
  height: 100%;
}
::v-deep .el-card__body {
  padding: 0;
}

.userPic {
  height: 100%;
  width: 100%;
  padding: 10px;
  .userInfo {
    height: 200px;
    padding: 0 5px;
    .box-card {
      height: 200px;
      .title {
        width: 100%;
        height: 30px;
        font-size: 16px;
        font-weight: 700;
        border-bottom: 1px solid #000;
      }
    }
  }
  .chartBox {
    height: calc(100% - 200px);
    .el-row {
      height: 50%;
      .el-col {
        height: 100%;
        padding: 5px;
        .chart-box {
          width: 100%;
          height: 100%;
          margin-top: 15px;
        }
      }
    }
  }
}
</style>
