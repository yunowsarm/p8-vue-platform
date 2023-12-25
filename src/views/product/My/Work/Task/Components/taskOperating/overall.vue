<template>
  <form-list v-if="isShow"
             :dataSource="dataSource"
             :form="formData"
             :api="saveApi"
             :isCustomValidate="true"
             @custom-validate="customValidate"
             @rendered="rendered">
    <template #forecastBeginDate>
      <el-col>
        <el-form-item>
          <el-date-picker v-model="formData['forecastBeginDate']"
                          type="date"
                          placeholder="预计开始时间"
                          style="width: 100%"
                          value-format="yyyy-MM-dd"
                          :picker-options="forecastStartPickerOptions"></el-date-picker>
        </el-form-item>
      </el-col>
    </template>
    <template #forecastEndDate>
      <el-col>
        <el-form-item>
          <el-date-picker v-model="formData['forecastEndDate']"
                          type="date"
                          placeholder="预计结束时间"
                          style="width: 100%"
                          value-format="yyyy-MM-dd"
                          :picker-options="forecastEndPickerOptions"></el-date-picker>
        </el-form-item>
      </el-col>
    </template>
  </form-list>
</template>
<script>
import { Col, FormItem, Input, DatePicker, P8Form as FormList } from 'p8-components-ui'

import moment from 'moment'
export default {
  name: 'OverallPlanning',
  components: {
    FormList,
    'el-col': Col,
    // eslint-disable-next-line vue/no-unused-components
    'el-form-item': FormItem,
    // eslint-disable-next-line vue/no-unused-components
    'el-input': Input,
    'el-date-picker': DatePicker
  },
  props: {
    isShow: {
      type: Boolean,
      default: true
    }
  },
  inject: ['getPlanInfo'],
  data () {
    const dataSource = [
      {
        type: 'blank',
        labelText: '预计开始时间',
        fieldName: 'forecastBeginDate',
        slotName: 'forecastBeginDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'blank',
        labelText: '预计完成时间',
        fieldName: 'forecastEndDate',
        slotName: 'forecastEndDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'textarea',
        labelText: '文本区域',
        fieldName: 'content',
        colLayout: 'singleCol',
        placeholder: '说明内容'
      }
    ]
    return {
      dataSource,
      formData: {},
      saveApi: '', // taskManager.progressFeedback
      forecastStartPickerOptions: {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') > this.formData.forecastEndDate
          return timeSpace
        }
      },
      forecastEndPickerOptions: {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') < this.formData.forecastBeginDate
          return timeSpace
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    rendered () {
      this.initUpdateFromData()
    },
    initUpdateFromData () {
      this.formData = {
        forecastBeginDate: this.getPlanInfo().FORECASTBEGINDATE,
        forecastEndDate: this.getPlanInfo().FORECASTENDDATE,
        content: this.getPlanInfo().CONTENT
      }
    },
    customValidate (params) {
      const _this = this
      let postParams = {
        pmTaskProgressFeedback: {
          planInfoId: _this.getPlanInfo().PLANINFOID,
          pmProjectTasksId: _this.getPlanInfo().TASKID,
          forecastBeginDate: params.forecastBeginDate,
          forecastEndDate: params.forecastEndDate,
          content: params.content,
          progress: 0,
          status: _this.getPlanInfo().STATUS
        }
      }
      this.$api['taskManager.progressFeedback'](postParams).then(res => {
        _this.$bus.$emit('refresh')
        this.$message({
          type: 'success',
          message: '信息已提交'
        })
      })
    }
  }
}
</script>
