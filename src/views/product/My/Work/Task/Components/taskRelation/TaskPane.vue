<template>
  <div>
    <form-list ref="form"
               :dataSource="dataSource"
               :form="formData"
               :existDefaultBtn="false"
               labelWidth="120px"
               @rendered="rendered">
      <template #status>
        <div v-html="statusHandle()"></div>
      </template>
      <template #durationDay>
        <div class="duration-days"
             v-html="getDurationDays(formData)"></div>
      </template>
      <template #progress>
        <el-progress :text-inside="true"
                     :stroke-width="16"
                     :percentage="formData.progress ? formData.progress : 0"
                     style="margin-top: 7px;"></el-progress>
      </template>
      <template #managerStatusDisplay>
        <span>{{formData.managerStatusDisplay}}</span>
      </template>
      <template #content>
        <span>{{formData.content}}</span>
      </template>
      <template #dateline>
        <div class="dateline-con">
          <div class="dateline-list">
            <div class="clearfix dateline-item"
                 v-for="item in formData.dateline"
                 :key="item.color"
                 :style="{color: item.color, marginLeft: item.marginLeft+'px'}">
              <span>{{item.beginDate}}</span>
              <span v-if="item.beginDate"
                    class="line"
                    :style="{width: item.lineWidth+'px', backgroundColor: item.color}"></span>
              <span v-if="!item.endDate"
                    class="line dashed"
                    :style="{width: item.lineDashedWidth+'px', borderTop: `2px dashed ${item.color}`}"></span>
              <span>{{item.endDate}}</span>
            </div>
          </div>
          <div class="dateline-tip">
            <span class="forecast">预计时间</span>
            <span class="plan">计划时间</span>
            <span class="real">实际时间</span>
          </div>
        </div>
      </template>
    </form-list>
  </div>
</template>
<script>
import { P8Form as FormList, Progress } from 'p8-components-ui'

import moment from 'moment'
import Vue from 'vue'
import { calculateRemainingDays } from '@/utils/common'
export default {
  name: 'TaskPaneView',
  inject: ['getPlanInfo'],
  props: {
    isShow: {
      type: Boolean
    },
    dataSource: {
      type: Array
    },
    api: {
      type: String
    },
    apiParams: {
      type: Object,
      default: () => {
        return {
          taskId: ''
        }
      }
    },
    completeTaskFlag: {
      type: Boolean
    },
    taskId: {
      type: String
    }
  },
  components: {
    FormList,
    'el-progress': Progress
  },
  data () {
    return {
      formData: {},
      allStatus: [],
      count: 1,
      // secretGradeDisplay: null
    }
  },
  mounted () {
    this.initFormData()
    let _this = this
    this.$bus.$on('refresh', function () {
      Vue.nextTick(function () {
        _this.rendered()
      })
    })
  },
  methods: {
    getDurationDays(data){
      if(!data.status) return ''
      return  calculateRemainingDays(data).text
    },
    rendered () {
      if (this.api) {
        this.getTaskInfo()
      }
    },
    initFormData () {
      let tempObj = {}
      this.dataSource.forEach(item => {
        if (item.fieldName || item.slotName) {
          let name = item.fieldName || item.slotName
          tempObj[name] = item.defaultValue || ''
        }
      })
      this.formData = Object.assign({}, tempObj)
    },
    getTaskInfo () {
      let _this = this
      this.$api[this.api]({ taskId: this.taskId }).then(res => {
        _this.taskInfo = res
        _this.rendFormData(res)
      })
    },
    rendFormData (res) {
      Object.keys(this.formData).forEach(key => {
        if (key === 'forecastDate') {
          this.formData.forecastDate = res.forecastBeginDate ? res.forecastBeginDate + '~' + res.forecastEndDate : ''
          this.formData.forecastBeginDate = res.forecastBeginDate
          this.formData.forecastEndDate = res.forecastEndDate
        } else if (key === 'planDate') {
          this.formData.planDate = res.planBeginDate ? res.planBeginDate + '~' + res.planEndDate : ''
          this.formData.planBeginDate = res.planBeginDate
          this.formData.planEndDate = res.planEndDate
        } else if (key === 'realDate') {
          this.formData.realDate = res.realBeginDate ? `${res.realBeginDate || ''}~${res.realEndDate || ''}` : '未提交'
          this.formData.realBeginDate = res.realBeginDate
          this.formData.realEndDate = res.realEndDate
        } else if (key === 'dateline') {
          this.$set(this.formData, 'dateline', this.datelineHandle())
        } else if (key === 'progress') {
          this.formData[key] = Number((res[key] * 100).toFixed(0))
        } else {
          this.formData[key] = res[key]
        }
      })
      this.getExtend()
    },
    statusHandle () {
      let allStatus = this.getPlanInfo().allStatus
      const statusColor = {
        '6010': '#ffd782',
        '6020': '#1bbf9e',
        '6050': '#ff9921',
        '6070': '#1890ff'
      }
      allStatus.forEach(item => {
        item.color = statusColor[item.value]
      })
      let value = this.formData.status
      let currStatus = allStatus.filter(item => item.value === value)

      if (currStatus && currStatus.length) {
        return `<span class="pane-status"><span style="background-color: ${currStatus[0].color}" class="pane-status-cir"></span>${currStatus[0].label}</span>`
      }
    },
    datelineHandle () {
      const buleColor = '#1892FF'
      const yellowColor = '#FFC306'
      const orangeColor = '#FF5406'
      let viewData = this.formData
      let forecast = {
        lineWidth: 100, // 线长度
        lineDashedWidth: 40, // 虚线长度
        color: buleColor,
        marginLeft: 0,
        beginDate: viewData.forecastBeginDate,
        endDate: viewData.forecastEndDate
      }
      let plan = {
        lineWidth: 100, // 线长度
        lineDashedWidth: 40, // 虚线长度
        color: yellowColor,
        marginLeft: 0,
        beginDate: viewData.planBeginDate,
        endDate: viewData.planEndDate
      }
      let real = {
        lineWidth: 100, // 线长度
        lineDashedWidth: 40, // 虚线长度
        color: orangeColor,
        marginLeft: 0,
        beginDate: viewData.realBeginDate,
        endDate: viewData.realEndDate
      }
      if (moment(this.formData.planBeginDate).isAfter(moment(this.formData.forecastBeginDate))) {
        plan.marginLeft = 16
      }
      if (moment(this.formData.realBeginDate).isBetween(moment(this.formData.forecastBeginDate), moment(this.formData.planBeginDate))) {
        real.marginLeft = 8
      } else {
        if (this.formData.realBeginDate) {
          if (moment(this.formData.realBeginDate).isAfter(moment(this.formData.planBeginDate))) {
            real.marginLeft = 24
          }
        } else {
          real.marginLeft = 24
          real.lineDashedWidth = 100
        }
      }
      return [forecast, plan, real]
    },
    async getExtend () {
      this.$api['planGanttManager.getGanttExtendAttr']({ taskId: this.taskId }).then((res) => {
        if (res && res.taskExtendList) {
          res.taskExtendList.forEach((item) => {
            if (item.fieldType == 'datepicker') {
              let date = moment(item.fieldValue)
              this.$set(this.formData, item.fieldName, date.isValid() ? date : '')
            } else {
              this.$set(this.formData, item.fieldName, item.fieldValue)
            }
          })
        }
      })
      this.columnSettings = await this.$api['planGanttManager.getGanttColumnSettingByWholeId']({ wholeDescribeId: this.getPlanInfo().wholeDescribeId })
      this.extraList = this.columnSettings.filter((item) => item.attributeType === '1')
      this.extraList.forEach((extra) => {
        this.dataSource.push({
          labelText: extra.name,
          type: 'view',
          fieldName: extra.filedName,
          colLayout: 'single'
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-progress-bar__innerText {
  color: #f1c82b !important;
}
$green-color: #1bbf9e;
$bule-color: #1892ff;
$yellow-color: #ffc306;
$orange-color: #ff5406;
$red-color: #f80012;
// 任务信息状态样式
::v-deep .pane-status {
  display: flex;
  align-items: center;
  .pane-status-cir {
    width: 6px;
    height: 6px;
    border-radius: 10px;
    margin-right: 6px;
  }
}
// 超期/剩余天数 样式
::v-deep .duration-days {
  .duration-overdue,
  .duration-over,
  .duration-advance {
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 12px;
  }
  .duration-overdue {
    border: 1px solid $red-color;
    background-color: #feebec;
    color: $red-color;
  }
  .duration-over {
    // 剩余
    border: 1px solid $green-color;
    background-color: #ffffff;
    color: $green-color;
  }
  .duration-advance {
    // 提前
    border: 1px solid $bule-color;
    background-color: #e4effa;
    color: $bule-color;
  }
}
// 时间线 样式
.dateline-con {
  .dateline-list {
    padding: 10px 0 8px;
    .clearfix:after {
      content: '';
      clear: both;
      display: block;
    }
    .forecast,
    .plan,
    .real,
    .dateline-item {
      font-size: 12px;
      span {
        float: left;
      }
      .line {
        height: 2px;
        margin: 26px -10px 0;
      }
      .line.dashed {
        // border-top: 2px dashed $orange-color;
        background-color: #ffffff;
      }
    }
    .forecast {
      color: $bule-color;
      .line {
        background-color: $bule-color;
      }
    }
    .plan {
      color: $yellow-color;
      .line {
        background-color: $yellow-color;
      }
    }
    .real {
      color: $orange-color;
      .line {
        background-color: $orange-color;
      }
    }
  }
  .dateline-tip {
    display: flex;
    align-items: center;
    padding: 0 10px;
    .forecast,
    .plan,
    .real {
      position: relative;
      font-size: 12px;
      padding: 0 14px 0 8px;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 4px;
        border-radius: 10px;
      }
    }
    .forecast {
      color: $bule-color;
      &::before {
        background-color: $bule-color;
      }
    }
    .plan {
      color: $yellow-color;
      &::before {
        background-color: $yellow-color;
      }
    }
    .real {
      color: $orange-color;
      &::before {
        background-color: $orange-color;
      }
    }
  }
}

.el-form.formList {
  position: relative;
  & ::v-deep .el-row {
    height: 100%;
    overflow-y: auto;
  }
  & ::v-deep .el-row .el-col:last-child {
    position: relative;
    border-top: none;
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  & ::v-deep .el-form-item--small.el-form-item {
    margin-bottom: 6px;
  }
  & ::v-deep .el-form-item__blank {
    .el-form-item__label {
      font-weight: bolder;
    }
  }
}
</style>
