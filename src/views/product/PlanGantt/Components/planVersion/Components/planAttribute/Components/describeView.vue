<template>
  <div style="position: relative;height: 600px;">
    <el-form :inline="true" class="form_inline">
      <el-form-item label="任务名称：">
        <span :class="{'active_color': otherTask.name != formData.name}">{{formData.name}}</span>
      </el-form-item>
      <el-form-item label="责任人：">
        <span :class="{'active_color': otherTask.ownerName != formData.ownerName}">{{formData.ownerName}}</span>
      </el-form-item>
      <el-form-item label="工期：">
        <span :class="{'active_color': otherTask.duration != formData.duration}">{{formData.duration}}</span>
      </el-form-item>
      <el-form-item label="计划开始时间：">
        <span :class="{'active_color': otherTask.startDate != formData.startDate}">{{formData.startDate}}</span>
      </el-form-item>
      <el-form-item label="计划完成时间：">
        <span :class="{'active_color': otherTask.endDate != formData.endDate}">{{formData.endDate}}</span>
      </el-form-item>
      <el-form-item label="预计开始时间：">
        <span :class="{'active_color': otherTask.forecastBeginDate != formData.forecastBeginDate}">{{formData.forecastBeginDate}}</span>
      </el-form-item>
      <el-form-item label="预计完成时间：">
        <span :class="{'active_color': otherTask.forecastEndDate != formData.forecastEndDate}">{{formData.forecastEndDate}}</span>
      </el-form-item>
      <el-form-item label="实际开始时间：">
        <span :class="{'active_color': otherTask.realBeginDate != formData.realBeginDate}">{{formData.realBeginDate}}</span>
      </el-form-item>
      <el-form-item label="实际完成时间：">
        <span :class="{'active_color': otherTask.realEndDate != formData.realEndDate}">{{formData.realEndDate}}</span>
      </el-form-item>
      <el-form-item label="任务描述：">
        <span :class="{'active_color': otherTask.describes != formData.describes}">{{formData.describes}}</span>
      </el-form-item>
      <el-form-item label="备注：">
        <span :class="{'active_color': otherTask.remark  != formData.remark}">{{formData.remark}}</span>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import moment from 'moment'
export default {
  name: 'PlanDescribeView',
  props: {
    taskId: {
      type: String,
      default: null
    },
    versionType: {
      type: String,
      default: null
    },
    versionId: {
      type: String,
      default: null
    },
    ganttName: {
      type: String,
      default: null
    },
    otherGanttName: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      formData: {},
      otherParam: {
        activityInfoId: ''
      }
    }
  },
  computed: {
    otherTask() {
      return this.versionTask[this.otherGanttName]
    },
    ...mapGetters(['vueThis', 'versionTask'])
  },
  mounted () {
    if (this.taskId) {
      this.getDescribeData()
    }
  },
  methods: {
    getDescribeData () {
      let that = this
      that.$store.dispatch('setVersionTask', { key:that.ganttName, value: {}})
      // 获取描述信息
      if (that.versionType == 'task') {
        let gantt = GanttObject.getGanttObject(that.ganttName)
        let task = gantt.getTask(that.taskId)
        that.formData = Object.assign({}, task)
        let user = gantt.serverList('resources').find(user => {
          return user.id == task.owner_id
        })
        that.formData.ownerName = user && user.name ? user.name : ''
        that.formData.startDate = moment(task.start_date).format('YYYY-MM-DD')
        that.formData.endDate = moment(task.end_date).subtract(1, 'days').format('YYYY-MM-DD')
        that.$store.dispatch('setVersionTask', { key:that.ganttName, value: that.formData})
      } else {
        that.$api['planGanttManager.getDescribesVersionData']({ taskId: that.taskId, versionId: that.versionId, versionType: that.versionType }).then(function (res) {
          if (res) {
            that.formData = Object.assign({}, res)
            that.$store.dispatch('setVersionTask', { key:that.ganttName, value: that.formData})
          }
        }).catch(function (error) {
          console.error('error' + error)
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.form_inline {
  ::v-deep .el-form-item {
    width: 40%;
  }
  .active_color {
    color: red;
  }
}
</style>
