<template>
  <form-table ref="formtable"
              :formData="formData"
              :formType="formType"
              :leafChildrenIsFinished="leafChildrenIsFinished"
              :isHaveParentTaskParentId="isHaveParentTaskParentId"
              :formRules="formRules"
              :tableApi="tableApi"
              :exceedType="exceedTypeVal"
              :tableParams="tableParams"
              :columns="columns"
              :key="dateTime"
              @submit="progressSubmit"
              @NewSubmit="NewProgressSubmit"
              @progress-date-change="progressDateChange"
              @progress-change="progressChange">
    <template #dialog-con>
      <el-dialog v-if="dialogVisible"
                 title="请填写未完成原因"
                 width="50%"
                 :visible="dialogVisible"
                 :modal="false"
                 :before-close="dialogCancel">
        <div class="dialog-content"><i class="el-icon-warning"
             style="color: #e6a23c"></i>当前任务已超期, 是否填写本次未完成原因?</div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="dialogOk">确 定</el-button>
        </span>
      </el-dialog>

    </template>

  </form-table>
</template>
<script>
import FormTable from './FormTable'
import moment from 'moment'
export default {
  name: 'Progess',
  components: {
    FormTable
  },
  props: {
    durationDay: {
      type: Boolean,
      default: true
    },
    exceedType: {
      type: Boolean,
      default: false
    }
  },
  inject: ['getPlanInfo'],
  computed: {
    planInfoParams () {
      return this.getPlanInfo()
    }
  },
  watch: {
    leafChildrenIsFinished () {
      this.progressChange(this.getPlanInfo().PROGRESS)
    }
  },
  data () {
    let columns = [
      {
        title: '序号',
        type: 'index',
        width: '55px',
        align: 'center'
      },
      {
        title: '状态',
        dataIndex: 'status',
        formatter: (row) => {
          if (this.planInfoParams.allStatus && row.status) {
            return this.planInfoParams.allStatus.filter(item => item.value === row.status)[0].label
          }
        },
        align: 'center'
      },
      {
        title: '完成度',
        dataIndex: 'progress',
        formatter: (row) => {
          return row.progress * 100 + '%'
        },
        align: 'center'
      },
      {
        title: '进度说明',
        minWidth: 200,
        dataIndex: 'content',
        align: 'center'

      },
      {
        title: '反馈时间',
        dataIndex: 'createTime',
        align: 'center'

      }
    ]
    return {
      leafChildrenIsFinished: false,
      isHaveParentTaskParentId: false,
      formType: {
        constType: 'Progress',
        overdue: false,
        overdueChange: false,
        progressRealEnd: false,
        progressRealBegin: false
      },
      formData: {
        progress: 0,
        // status: '',
        forecastDateRange: '',
        // statusOptions: [],
        forecastBeginDate: '',
        forecastEndDate: '',
        realBeginDate: '',
        realEndDate: '',
        content: ''
        // deviationType: '', // 未完成原因
        // deviationCauses: '', // 偏离原因
        // deviationProgress: '', // 进展情况
        // deviationImpact: '', // 偏离影响
        // solutions: '' // 解决方案
      },
      formRules: {
        deviationType: [
          { required: true, message: '请选择偏离类型' }
        ],
        forecastBeginDate: [
          { required: true, message: '必选' }
        ],
        forecastEndDate: [
          { required: true, message: '必选' }
        ],
        realBeginDate: [
          { required: true, message: '必选' }
        ],
        realEndDate: [
          { required: true, message: '必选' },
          {
            validator: (rule, value) => {
              let that = this
              return new Promise((resolve, reject) => {
                if (!that.formData.realBeginDate) {
                  resolve()
                }
                let isBefore = moment(value).isBefore(moment(that.formData.realBeginDate))
                if (isBefore) {
                  let msg = `不得早于实际开始日期: ${that.formData.realBeginDate}`
                  reject(msg)
                } else {
                  resolve()
                }
              })
            }
          }
        ],
        deviationType: [
          { required: true, message: '必选' }
        ],
        deviationCauses: [
          { required: true, message: '必选' }
        ]
      },
      tableApi: 'taskManager.progressFeedbackHistory',
      tableParams: { taskId: this.getPlanInfo().TASKID },
      columns,
      dialogVisible: false,
      dateTime: null,
      dialogConfig: {
        modal: false
      },
      exceedTypeVal: this.exceedType
    }
  },
  created () {
    this.dialogVisible = false
    //false 已超期
    if (!this.durationDay) {
      this.dialogVisible = true
    }
    this.getDeviatuon()
  },
  mounted () {
    this.initUpdateFromData()
    this.progressChange(this.getPlanInfo().PROGRESS)
  },
  methods: {
    initUpdateFromData () {
      this.$api['taskManager.taskInfo']({ taskId: this.planInfoParams.TASKID }).then(res => {
        this.formData.content = res.content
        this.formData.realBeginDate = res.realBeginDate
        this.formData.realEndDate = res.realEndDate
        this.formData.progress = Math.round(res.progress * 100)
        this.formData.forecastDateRange = [res.forecastBeginDate, res.forecastEndDate]
        this.formData.forecastBeginDate = res.forecastBeginDate
        this.formData.forecastEndDate = res.forecastEndDate
        this.formData.managerStatusDisplay = res.managerStatusDisplay
      })
      // let leaf = this.getPlanInfo().isLeaf
      // // eslint-disable-next-line eqeqeq
      // 只有叶子结点可以展示进度  提交任务
      // if (leaf == '0') {
      //   this.formData.leaf = true
      // } else {
      //   this.formData.leaf = false
      // }
      if (this.planInfoParams.MANAGERSTATUSDISPLAY && this.planInfoParams.MANAGERSTATUSDISPLAY == '审批撤销') {
        this.formData.realEndDate = ''
        this.formData.progress = 99
        // this.formData.leaf = true
      }
    },
    leafChildIsFinished () {
      /**
       * 叶子节点 isLeaf: 0--判断是否是叶子节点, 不是请求接口确认子节点是否完
       */
      if (this.getPlanInfo().ISLEAF) {
        const api = 'taskManager.isChildrenFinished'
        const _this = this
        this.$api[api]({ taskId: _this.getPlanInfo().TASKID }).then(res => {
          if (res) {
            _this.leafChildrenIsFinished = res
          }
        })
        /**
         * 任务的父任务是否有父id
         */
        const apiIsHaveParentTaskParentId = 'taskManager.isHaveParentTaskParentId'
        this.$api[apiIsHaveParentTaskParentId]({ taskId: _this.getPlanInfo().TASKID }).then(res => {
          if (res) {
            _this.isHaveParentTaskParentId = res
          }
        })
      } else {
        /**
         * 任务的父任务是否有父id
         */
        const _this = this
        const apiIsHaveParentTaskParentId = 'taskManager.isHaveParentTaskParentId'
        this.$api[apiIsHaveParentTaskParentId]({ taskId: _this.getPlanInfo().TASKID }).then(res => {
          if (res) {
            _this.isHaveParentTaskParentId = res
          }
        })
      }
    },
    dialogCancel () {
      this.dialogVisible = false
    },
    dialogOk () {
      this.dialogVisible = false
      // 弹窗提示点击确定--表示人员要填写偏离相关的信息, 展示偏离模块(信息为必填)
      this.exceedTypeVal = true
      // 切换页面不继续弹出超期提示框
      this.$emit('dialogOk', true)
    },
    getDeviatuon () {
      const _this = this
      let deviation = {
        deviationType: '',
        deviationCauses: '', // 偏离原因
        deviationImpact: '', // 偏离影响
        deviationProgress: '', // 进展情况
        solutions: '' // 偏离备注
      }
      this.formData = { ...this.formData, ...deviation }
      this.$api['taskManager.deviationReasonsHistory']({
        taskId: _this.getPlanInfo().TASKID
      }).then(res => {
        if (res && res.length) {
          this.formData.deviationType = res[0].deviationType
          this.formData.deviationCauses = res[0].deviationCauses
          this.formData.deviationProgress = res[0].deviationProgress
          this.formData.deviationImpact = res[0].deviationImpact
          this.formData.solutions = res[0].solutions
        }
      })
    },
    progressDateChange (date) {
      let endTime = date.maxDate
      if (!endTime) {
        this.formType.overdueChange = false
        return
      }
      if (!(moment(endTime).isBefore(this.planInfoParams.FORECASTENDDATE))) {
        this.formType.overdueChange = true
        this.formData = { ...this.formData, ...{ changeCauseClassify: '', reason: '' } }
      } else {
        this.formType.overdueChange = false
      }
      this.formData.forecastDateRange = [date.minDate, date.maxDate]
    },
    progressChange (val) {
      /**
       *
       * val= 0: 编辑 预计开始/预计完成
       * 0< val<100: 编辑 预计完成/实际开始
       * val= 100: 编辑 实际开始/实际完成
       * 审批中 完成: 取消所有时间框编辑
       */

      let rst = this.progressToShowRealDate(val)
      this.formType.progressRealBegin = rst.realBeginDate
      // this.formRules.realBeginDate[0].required = !rst.realBeginDate
      this.formType.progressRealEnd = rst.realEndDate
      // this.formRules.realEndDate[0].required = false // 点击保存或提交审批时再校验是否选填了实际完成时间
      this.formType.progressForecastBegin = rst.forecastBeginDate
      // this.formRules.forecastBeginDate[0].required = !rst.forecastBeginDate
      this.formType.progressForecastEnd = rst.forecastEndDate
      // this.formRules.forecastEndDate[0].required = !rst.forecastEndDate
    },
    progressToShowRealDate (newProgress) {
      let key = ''
      let managerStatus = this.getPlanInfo().MANAGERSTATUS // 当前管理状态  [6406,6409]审批中 完成
      let normalProgress = this.getPlanInfo().PROGRESS || 0 // 数据库的已保存的进度  newProgress 实时更改的进度
      let isLeaf = this.getPlanInfo().ISLEAF // 是否子 0: 是    1: 否
      let leafChildrenIsFinished = this.leafChildrenIsFinished // 子是否完成
      let autoScheduling = this.autoScheduling // 任务排程  '1' 自动  '2'：手动
      // 父任务
      if (isLeaf) { // 父任务不能修改实际开始时间
        if (managerStatus === '6406' || managerStatus === '6409') { // 管理状态为 审批中/完成
          key = 'finish'
        } else {
          if (autoScheduling === '1') {
            key = 'autofinish' // 排程自动 不能修改预计时间 子完成 可以修改实际完成时间 子未完成 不能修改实际完成时间
          } else {
            key = 'unAutofinish' // 排程手动 未开始可以修改预计时间 进行中只可修改预计完成时间
          }
        }
      } else {
        key = managerStatus === '6406' || managerStatus === '6409' ? 'finish' : normalProgress === 0 ? 'mix' : normalProgress === 100 ? 'max' : 'middle'
      }

      let obj = {
        'finish': () => { // 管理状态为 审批中/完成
          return { 'realBeginDate': true, 'realEndDate': true, 'forecastBeginDate': true, 'forecastEndDate': true }
        },
        'mix': () => { // 子任务初始normalProgress 为0
          return { 'realBeginDate': newProgress === 0, 'realEndDate': newProgress !== 100, 'forecastBeginDate': newProgress > 0, 'forecastEndDate': newProgress === 100 }
        },
        'middle': () => { // 子任务初始normalProgress 为0-100
          return { 'realBeginDate': false, 'realEndDate': newProgress !== 100, 'forecastBeginDate': true, 'forecastEndDate': newProgress === 100 }
        },
        'max': () => { // 子任务初始normalProgress 为100
          return { 'realBeginDate': false, 'realEndDate': false, 'forecastBeginDate': true, 'forecastEndDate': true }
        },
        'unAutofinish': () => { // 父任务排程手动
          return { 'realBeginDate': true, 'realEndDate': !leafChildrenIsFinished, 'forecastBeginDate': normalProgress > 0, 'forecastEndDate': false }
        },
        'autofinish': () => { // 父任务排程自动
          return { 'realBeginDate': true, 'realEndDate': !leafChildrenIsFinished, 'forecastBeginDate': true, 'forecastEndDate': true }
        }
      }
      return obj[key]()
    },
    progressSubmit (form, submitType) {
      let params = this.submitParamsHandle(form, submitType)
      const _this = this
      params.pmTaskProgressFeedback.hierarchy = this.getPlanInfo().LEVEL
      this.$api['taskManager.progressFeedback'](params).then(res => {
        _this.progressChange(_this.getPlanInfo().PROGRESS)
        _this.$message({
          type: 'success',
          message: '成功'
        })
        _this.$bus.$emit('refresh')
        // this.formData.leaf = false
      })
    },
    NewProgressSubmit (form, submitType, obj) {
      let params = this.submitParamsHandle(form, submitType)
      params.pmTaskProgressFeedback.hierarchy = this.getPlanInfo().LEVEL
      const _this = this
      this.$api['taskManager.progressFeedback'](params).then(res => {
        _this.progressChange(_this.getPlanInfo().PROGRESS)
        _this.$message({
          type: 'success',
          message: '成功'
        })
        _this.$bus.$emit('refresh')
        // this.formData.leaf = false
      })
    },
    submitParamsHandle (form, submitType) {
      let _this = this
      let progress = ['progress', 'content', 'realBeginDate', 'realEndDate', 'forecastBeginDate', 'forecastEndDate']
      let deviate = ['deviationType', 'deviationCauses', 'deviationImpact', 'deviationProgress', 'solutions']
      let params = {
        pmTaskProgressFeedback: {
          planInfoId: _this.planInfoParams.PLANINFOID,
          pmProjectTasksId: _this.planInfoParams.TASKID,
          status: _this.statusByProgress(submitType),
          content: form.content,
          submitType: submitType
        },
        pmTaskDeviationCauses: {        // 偏离参数
          planInfoId: _this.planInfoParams.PLANINFOID,
          pmProjectTasksId: _this.planInfoParams.TASKID,
          id: form.id, //偏离数据id
          deviationType: form.deviationType, //偏离类型
          deviationCauses: form.deviationCauses, //偏离原因
          deviationImpact: form.deviationImpact, //偏离影响
          progress: form.progress, //进展说明
          deviationProgress: form.deviationProgress, //进展情况
          solutions: form.solutions //解决方案
        }
      }
      progress.forEach(key => {
        if (key === 'forecastDateRange') {
          params.pmTaskProgressFeedback.forecastBeginDate = moment(form[key][0]).format('YYYY-MM-DD')
          params.pmTaskProgressFeedback.forecastEndDate = moment(form[key][1]).format('YYYY-MM-DD')
        } else if (key === 'progress') {
          params.pmTaskProgressFeedback['progress'] = form['progress'] / 100
        } else if (key === 'content') {
          params.pmTaskProgressFeedback['content'] = form[key]
        } else if ((key === 'realBeginDate' && form[key]) || (key === 'realEndDate' && form[key])) {
          params.pmTaskProgressFeedback[key] = moment(form[key]).format('YYYY-MM-DD')
        } else if (key === 'forecastBeginDate' && form[key]) {
          params.pmTaskProgressFeedback.forecastBeginDate = moment(form[key]).format('YYYY-MM-DD')
        } else if (key === 'forecastEndDate' && form[key]) {
          params.pmTaskProgressFeedback.forecastEndDate = moment(form[key]).format('YYYY-MM-DD')
        }
      })
      if (this.formType.overdue) {
        params.pmTaskDeviationCauses = {
          planInfoId: _this.planInfoParams.PLANINFOID,
          pmProjectTasksId: _this.planInfoParams.TASKID
        }
        deviate.forEach(key => {
          if (key === 'deviationProgress') {
            params.pmTaskDeviationCauses.progress = form[key]
          }
          params.pmTaskDeviationCauses[key] = form[key]
        })
      }
      if (this.formType.overdueChange) {
        params.pmTaskChangeRequest = {
          planInfoId: _this.planInfoParams.PLANINFOID,
          pmProjectTasksId: _this.planInfoParams.TASKID,
          forecastBeginDate: moment(form.forecastDateRange[0]).format('YYYY-MM-DD'),
          forecastEndDate: moment(form.forecastDateRange[1]).format('YYYY-MM-DD'),
          changeCauseClassify: form.changeCauseClassify,
          reason: form.reason
        }
      }
      return params
    },
    statusByProgress (submitType) { // 根据进度--获取对应的状态 --需优化
      let progress = this.formData.progress
      let normalStatus = this.planInfoParams.STATUS
      let status = ''
      if (progress === 0) {
        if (normalStatus === '6020') {
          status = '6020'
        }
      } else {
        status = '6050' // 6500
      }
      return status
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__wrapper {
  position: absolute !important;
  background-color: rgba(0, 0, 0, 0.1);
  .custom-dialog-class {
    width: 30% !important;
    height: 160px;
    min-width: 200px;
  }
}
::v-deep .el-dialog__body {
  height: 20px;
}
.dialog-content {
  margin-left: 25px;
}
</style>
