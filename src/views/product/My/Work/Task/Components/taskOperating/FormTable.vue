<template>
  <div class="form-table-wrap">
    <div class="form-table-con">
      <div class="form-con">
        <el-form ref="form"
                 :label-width="labelWidth"
                 :model="formData"
                 v-bind="formConfig"
                 label-position="right"
                 :rules="formRules"
                 :key="dateTime"
                 :disabled="formDisabled">
          <div v-if="(formType.constType === 'Deviate') || (formType.constType === 'Progress' && formType.overdue)"
               class="deviate">
            <el-row>
              <el-col :span="24">
                <el-form-item label="未完成原因分类"
                              prop="deviationType">
                  <el-select v-model="formData.deviationType"
                             size="medium">
                    <el-option v-for="item in unfinishOption"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="未完成原因">
                  <el-input v-model="formData.deviationCauses"
                            type="textarea"
                            resize="none"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            placeholder="请输入未完成原因"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="偏离影响">
                  <el-input v-model="formData.deviationImpact"
                            type="textarea"
                            resize="none"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            placeholder="请输入偏离影响"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="进展情况">
                  <el-input v-model="formData.deviationProgress"
                            type="textarea"
                            resize="none"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            placeholder="请输入进展情况"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="解决方案">
                  <el-input v-model="formData.solutions"
                            type="textarea"
                            resize="none"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            placeholder="请输入应对措施"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-if="(formType.constType === 'Change') || (formType.constType === 'Progress' && formType.overdueChange)"
               class="change">
            <el-row>
              <el-col :span="12">
                <el-form-item label="变更原因分类">
                  <el-select v-model="formData.changeCauseClassify"
                             size="medium"
                             name="status">
                    <el-option v-for="item in adjustOption"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12"
                      v-if="!(formType.constType === 'Progress' && formType.overdueChange)">
                <el-form-item label="变更起止日期"
                              label-width="100px">
                  <el-date-picker v-model="formData.changeDateRange"
                                  type="daterange"
                                  range-separator="至"
                                  start-placeholder="开始日期"
                                  end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="变更原因">
                  <el-input v-model="formData.reason"
                            type="textarea"
                            resize="none"
                            :autosize="{ minRows: 2, maxRows: 4}"
                            placeholder="请输入备注"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-if="formType.constType === 'Progress'"
               class="progress">
            <!-- 已超期添加未说明原因 -->
            <el-row v-if="exceedType">
              <el-col :span="24">
                <el-form-item label="未完成原因分类"
                              prop="deviationType">
                  <el-select v-model="formData.deviationType"
                             placeholder="请选择">
                    <el-option v-for="item in unfinishOption"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="exceedType">
              <el-col :span="12">
                <el-form-item label="未完成原因"
                              prop="deviationCauses">
                  <el-input v-model="formData.deviationCauses"
                            placeholder="请输入未完成原因"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="偏离影响">
                  <el-input v-model="formData.deviationImpact"
                            placeholder="请输入偏离影响"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="exceedType">
              <el-col :span="12">
                <el-form-item label="进展情况">
                  <el-input v-model="formData.deviationProgress"
                            placeholder="请输入进展情况"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="解决方案"
                              placeholder="请输入解决方案">
                  <el-input v-model="formData.solutions"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item class="formitem-progress"
                              label="完成度"
                              prop="progress">
                  <el-progress :text-inside="true"
                               :stroke-width="16"
                               text-color="#1e2125"
                               style="margin-top: 8px;text-shadow: 0px 1px 0px #fafcff;"
                               :percentage="formData.progress"></el-progress>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label-width="30px">
                  <el-input-number size="mini"
                                   v-model="formData.progress"
                                   :min="minNum"
                                   :max="100"
                                   :step="1"
                                   @change="progressChange"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="预计起止时间">
                  <el-date-picker v-model="formData.forecastDateRange"
                                  type="daterange"
                                  range-separator="至"
                                  start-placeholder="开始日期"
                                  end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12"
                      v-if="formData.progress > 0">
                <el-form-item label="实际开始日期"
                              prop="realBeginDate">
                  <el-date-picker v-model="formData.realBeginDate"
                                  type="date"
                                  style="width: 100%;"
                                  :picker-options="startRealPickerOptions"
                                  placeholder="请选择日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12"
                      v-if="formData.progress === 100">
                <el-form-item label="实际完成日期"
                              prop="realEndDate">
                  <el-date-picker v-model="formData.realEndDate"
                                  type="date"
                                  :picker-options="endRealPickerOptions"
                                  style="width: 100%;"
                                  placeholder="请选择日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="进度说明">
                  <el-input v-model="formData.content"
                            type="textarea"
                            resize="none"
                            :autosize="{ minRows: 4, maxRows: 4}"
                            placeholder="请输入进度说明"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <el-button class="collapseBtn"
                   type="text"
                   @click="onDrawerOpen()">查看历史反馈</el-button>
      </div>
    </div>
    <div class="submit">
      <el-button type="primary"
                 @click="submit('progress')"
                 :disabled='buttonDisabled'
                 v-if="saveBtnDisplay()">提交进度</el-button>
      <el-button type="primary"
                 @click="submit('submit')"
                 :disabled="formDisabled || buttonDisabled"
                 v-if="submitFinishBtnDisplay()">提交完成审批</el-button>
    </div>
    <slot name="dialog-con"></slot>
    <common-drawer size="50%"
                   class="manager-drawer"
                   :title="drawerTitle"
                   :visible="collapse"
                   :drawerConfig="drawerConfig"
                   @close="onDrawerClose">
      <template #drawer>
        <common-table ref="table"
                      :api="tableApi"
                      :customHeight="customHeight"
                      :params="tableParams"
                      :columns="columns"
                      :pagination="false"
                      :tableSetting="false"></common-table>
      </template>
    </common-drawer>
  </div>

</template>
<script>
import { Form, FormItem, Progress, Input, InputNumber, DatePicker, Select, Option, Row, Col, Button, Slider, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import moment from 'moment'
const mh = document.documentElement.clientHeight - 43
let realBeginDate
export default {
  name: 'FormTable',
  inject: ['getPlanInfo'],
  computed: {
    formDisabled () {
      /**
       * status 进度状态
       *    6070:已完成
       * managerStatus: 管理状态
       *    6407：审批驳回 6408：审批撤销
       *  status=6070 && managerStatus !== 6407 || 6408时, 禁用
       */
      const statusEnd = this.getPlanInfo().allStatus.filter(item => item.progressRange[0] === '1')
      return (statusEnd.find((item) =>
        item.value === this.getPlanInfo().status) ||
        this.managerStatus.indexOf(this.getPlanInfo().managerStatus) !== -1
      )
    }
  },
  components: {
    'el-progress': Progress,
    'el-input-number': InputNumber,
    'el-date-picker': DatePicker,
    'el-select': Select,
    'el-option': Option,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    'el-input': Input,
    'el-slider': Slider,
    CommonDrawer,
    CommonTable
  },
  props: {
    formData: {
      type: Object,
      default: () => { }
    },
    formRules: {
      type: Object
    },
    formType: {
      type: Object,
      default: function () {
        return {
          constType: 'Progress',
          overdue: false, // 超期
          overdueChange: false, // 变更
          progressForecastBegin: false,
          progressForecastEnd: false,
          progressRealBegin: false,
          progressRealEnd: false
        }
      }
    },
    tableApi: {
      type: String
    },
    leafChildrenIsFinished: {
      type: Boolean,
      default: false
    },
    isHaveParentTaskParentId: {
      type: Boolean,
      default: false
    },
    tableParams: {
      type: Object
    },
    columns: {
      type: Array
    },
    labelWidth: {
      type: String,
      default: '130px'
    },
    formConfig: {
      type: Object,
      default: () => { }
    },
    exceedType: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dateTime: null,
      releaseMenuParams: {},
      selectUserBeforehandFormData: {
        SYS_USER: ''
      },
      buttonDisabled: false,
      collapse: false,
      drawerTitle: '历史反馈',
      customHeight: mh,
      drawerConfig: {
        modal: false,
        'modal-append-to-body': false,
        'append-to-body': true
      },
      pickerOptions: {
        onPick: (date) => {
          this.progressDateChange(date)
        }
      },
      startPickerOptions: {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') > moment(this.formData.forecastEndDate).format('YYYY-MM-DD')
          return timeSpace
        }
      },
      endPickerOptions: {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') < moment(this.formData.forecastBeginDate).format('YYYY-MM-DD')
          return timeSpace
        }
      },
      startRealPickerOptions: {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') > moment(this.formData.realEndDate).format('YYYY-MM-DD')
          return timeSpace
        }
      },
      endRealPickerOptions: {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') < moment(this.formData.realBeginDate).format('YYYY-MM-DD')
          return timeSpace
        }
      },
      secretGrade: '',
      unfinishOption: [],// 未完成原因分类
      adjustOption: [],
      newFormData: {},
      managerStatus: '', // 管理状态
      minNum: 0
    }
  },
  mounted () {
    //  进行中的任务不能减进度条
    if (this.getPlanInfo().status === '6050') {
      this.minNum = this.getPlanInfo().progress
    }
    realBeginDate = this.formData.realBeginDate
    this.getOptions()
    let nullity = this.getPlanInfo().nullity
    this.secretGrade = this.getPlanInfo().secretGradeDisplay
    // 提交进度按钮是否置灰
    if (nullity === 1) {
      this.buttonDisabled = true
    } else {
      this.buttonDisabled = false
    }
  },
  methods: {
    getOptions () {
      this.$api['thirdPartInterface.getDic']({ dicType: 'DEVIATION_ClASSIFY' }).then(res => {
        this.unfinishOption = res
      })
      this.$api['thirdPartInterface.getDic']({ dicType: 'ADJUST_ClASSIFY' }).then(res => {
        this.adjustOption = res
      })
    },
    submit (submitType) {
      if (this.formData.forecastDateRange) {
        this.formData.forecastBeginDate = this.formData.forecastDateRange[0]
        this.formData.forecastEndDate = this.formData.forecastDateRange[1]
      }
      this.$refs.form.validate((valid) => {
        let _this = this
        if (valid) {
          this.getPlanInfo().progress = this.formData.progress
          if (submitType === 'submit') {
            _this.$api['taskManager.progressFeedbackCheck']({ taskId: _this.getPlanInfo().taskId, parent: _this.getPlanInfo().parentId, hierarchy: _this.getPlanInfo().getProjectLevel }).then(res => {
              if (res && res.success) {
                _this.getPlanInfo().managerStatus = '6406'
                _this.$emit('submit', _this.formData, submitType)
              } else {
                _this.$message({
                  message: res.message,
                  type: 'error'
                })
              }
            })
          } else {
            this.$emit('submit', this.formData, submitType)
          }
        } else {
          console.error('error submit!!', valid)
          return false
        }
      })
    },
    onDrawerOpen () {
      this.collapse = true
    },
    onDrawerClose () {
      this.collapse = false
    },
    progressDateChange (date) {
      this.$emit('progress-date-change', date)
    },
    progressChange (val) {
      const maxSpeedNum = 100
      const difference = maxSpeedNum - val
      if (difference < 1) {
        this.formData.progress = maxSpeedNum
        this.$emit('progress-change', maxSpeedNum)
      } else {
        this.formData.realBeginDate = moment().format('YYYY-MM-DD')
        this.$emit('progress-change', val)
      }
    },
    submitText (progress) {
      /**
       * 进度反馈--默认提交按钮文本为['提交']
       * 1.当进度为100时 或 非叶子节点的子节点都已完成, 获取状态为6600(提交完成审批)对应的文本
       * this.getPlanInfo().allStatus.filter(item => item.value === '6600')[0].label
       */
      if (progress === 100 || this.leafChildrenIsFinished) {
        return '提交完成审批'
      }
      return '提交'
    },
    submitBtnDisplay () {
      /**
       * 进度反馈--提交进度按钮是否展示
       * 1. 当前进度为100且未被禁用
       * 2. 非叶子节点的子节点都已完成
       */
      let display = false
      if ((this.formData.progress === 100 || this.leafChildrenIsFinished) && !this.formDisabled) {
        display = true
      }
      return display
    },
    saveBtnDisplay () {
      /**
         * 保存按钮是否展示，false是隐藏
         * 1. 责任令状态为已发布，计划非已发布
         */
      let display = false
      let managerStatus = this.getPlanInfo().managerStatus
      let executeState = this.getPlanInfo().executeState
      let zrlState = this.getPlanInfo().zrlState
      if (zrlState === 'ZRLS104' && executeState !== '1070') {
        display = false
      } else {
        if (managerStatus !== '6409') {
          display = true
        }
      }
      return display
    },
    submitFinishBtnDisplay () {
      /**
       * 提交完成审批按钮是否展示，false是隐藏
       * 1. 当前进度为100且未被禁用且子任务全部完成且父任务有责任人且父任务的父id不为空
       * 2. 或该任务为叶子任务并且父任务有责任人
       * 3. 或该任务为叶子任务并该任务的父任务的父id为空
       * 4. 或该任务的子任务全部完成并且该任务的父任务的父id为空
       * 5. 责任令状态为已发布，计划非已发布
       */
      let isLeafNode = this.getPlanInfo().isLeaf// 叶子节点为0，父任务为1
      let leafChildrenIsFinished = this.leafChildrenIsFinished
      let isHaveParentTaskParentId = this.isHaveParentTaskParentId
      let executeState = this.getPlanInfo().executeState
      let zrlState = this.getPlanInfo().zrlState
      let isTwoLvTask = !isHaveParentTaskParentId
      let display = false
      let managerStatus = this.getPlanInfo().managerStatus

      /**
       * 二级任务提交完成审批按钮隐藏与展示此按钮展示的时候时间
       */
      if (zrlState == 'ZRLS104' && executeState != '1070') {
        display = false
      } else {
        if (isTwoLvTask) {
          if (isLeafNode !== null) {
            if (this.formData.progress === 100 && this.checkManagerStatus(managerStatus)) {
              display = true
            }
            if ((managerStatus === '6408' || managerStatus === '6407') && this.formData.progress === 100) {
              display = true
            }
            if (leafChildrenIsFinished && this.formData.progress === 100 && this.checkManagerStatus(managerStatus)) {
              display = true
            }
          }
        } else {
          if (isLeafNode === 0) {
            if (this.formData.progress === 100 && this.checkManagerStatus(managerStatus)) {
              display = true
            }
            if ((managerStatus === '6408' || managerStatus === '6407') && this.formData.progress === 100) {
              display = true
            }
          } else {
            if (leafChildrenIsFinished && this.formData.progress === 100 && this.checkManagerStatus(managerStatus)) {
              display = true
            }
            if ((managerStatus === '6408' || managerStatus === '6407') && this.formData.progress === 100) {
              display = true
            }
          }
        }
      }
      return display
    },
    checkManagerStatus (managerStatus) {
      if (managerStatus !== '6405' && managerStatus !== '6406' && managerStatus !== '6409') {
        return true
      }
      return false
    }
  }
}
</script>
<style lang="scss" scoped>
div.form-table-wrap {
  height: 100%;
  position: relative;
  div.form-table-con {
    height: calc(100% - 50px);
    overflow-y: auto;
    overflow-x: hidden;
    .deviate,
    .change {
      margin-top: 10px;
      padding: 8px 10px 0;
      background-color: #fcfbfe;
      border-radius: 6px;
    }
    .progress {
      margin-top: 8px;
    }
  }
  div.form-con {
    overflow: auto;
  }
  div.table-con {
    div.title {
      height: 40px;
      line-height: 40px;
      color: #2196f3;
      cursor: pointer;
    }
  }
  div.submit {
    box-sizing: border-box;
    height: 50px;
    line-height: 50px;
    padding-right: 20px;
    text-align: right;
  }
  .collapseBtn {
    margin-left: 85%;
  }
  ::v-deep .el-input--mini {
    width: 100% !important;
  }
}
.el-select,
.el-date-editor.el-range-editor {
  width: 100%;
}

::v-deep .manager-drawer .el-drawer__header {
  padding: 11px;
}
.el-input-number--mini {
  width: 100%;
}
</style>
