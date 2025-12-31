<template>
  <el-form ref="form"
           :model="formData"
           label-width="100px"
           class="formList"
           :inline-message="inlineMessage"
           style="height: 100%">
    <el-row :class="{ existBtn: true }">
      <template v-for="(item, index) in dataSource">
        <el-col :span="12"
                :key="index">
          <el-form-item v-if="item.labelText === '项目状态'"
                        :label="item.labelText"
                        :prop="item.fieldName">
            <el-radio-group :disabled="taskEditCheck"
                            v-model="formData[item.fieldName]">
              <el-radio-button v-for="opt in zzOptions"
                               :key="opt.value"
                               :label="opt.value"
                               :value="opt.value">{{ opt.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="item.labelText === '计划编辑'"
                        :label="item.labelText"
                        :prop="item.fieldName">
            <el-radio-group :disabled="taskEditCheck"
                            v-model="formData[item.fieldName]">
              <el-radio-button v-for="opt in editLockState"
                               :key="opt.value"
                               :label="opt.value"
                               :value="opt.value">{{ opt.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-else
                        :label="item.labelText"
                        :prop="item.fieldName">
            <el-radio-group :disabled="taskEditCheck"
                            v-if="item.fieldName !== '1008'"
                            v-model="formData[item.fieldName]">
              <el-radio-button v-for="opt in options"
                               :key="opt.value"
                               :label="opt.value"
                               :value="opt.value">{{ opt.label }}</el-radio-button>
            </el-radio-group>
            <el-radio-group :disabled="taskEditCheck"
                            v-else
                            v-model="formData[item.fieldName]">
              <el-radio-button v-for="opt in options2"
                               :key="opt.value"
                               :label="opt.value"
                               :value="opt.value">{{ opt.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </template>
      <el-col>
        <el-form-item label="解锁/锁定原因"
                      prop="content"
                      :rules="validator(rules)">
          <el-input type="textarea"
                    placeholder="请输入解锁/锁定原因"
                    v-model="formData['content']"
                    rows="4"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :class="{ formBtn: true }">
      <el-col class="flex-right">
        <slot name="btn"></slot>
        <el-button plain
                   @click="$emit('close-lock-unlock', {})">取消</el-button>
        <el-button type="primary"
                   @click="handleSubmit">确定</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { Form, FormItem, Row, Col, Button, RadioGroup, RadioButton } from 'p8-components-ui'
export default {
  name: 'LockUnlockForm',
  props: ['planInfoArray', 'content', 'showMonitorPoints', 'monitorDutyType', 'monitorApi'],
  components: {
    'el-form': Form,
    'el-form-item': FormItem,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton
  },
  data () {
    return {
      saveApi: 'thirdPartInterface.saveLockUnlockForm',
      otherParam: {},
      dataSource: [{
        type: 'radioButton',
        labelText: '计划编辑',
        fieldName: '1020'
      }],
      taskEditCheck: false,
      viewData: ['111'], // 防止form表单保存按钮
      planInfoLockUnlockStatus: [],
      isCustomValidate: true,
      inlineMessage: true,
      formData: {
        content: ''
      },
      monitorPoints: {},
      monitorPointLockUnlockStatus: {},
      terminationSuspendStatus: {},
      options2: [
        {
          label: '解锁',
          value: '0'
        },
        {
          label: '加锁',
          value: '1'
        },
        {
          label: '解锁全部',
          value: '2'
        },
        {
          label: '加锁全部',
          value: '3'
        }
      ],
      editLockState: [
        {
          label: '默认',
          value: '-1'
        },
        {
          label: '解锁',
          value: '0'
        },
        {
          label: '加锁',
          value: '1'
        }
      ],
      options: [
        {
          label: '解锁',
          value: '0'
        },
        {
          label: '加锁',
          value: '1'
        },
        {
          label: '解锁全部',
          value: '2'
        },
        {
          label: '加锁全部',
          value: '3'
        }
      ],
      zzOptions: [
        {
          label: '开启',
          value: '9000'
        },
        {
          label: '暂停',
          value: '9010'
        },
        {
          label: '终止',
          value: '9020'
        }
      ],
      rules: [
        {
          required: true,
          message: '必填'
        }
      ]
    }
  },
  mounted: function () {
    const that = this
    if (that.monitorDutyType) {
      this.options = [
        {
          label: '解锁',
          value: '0'
        },
        {
          label: '加锁',
          value: '1'
        },
        {
          label: '解锁全部',
          value: '2'
        },
        {
          label: '加锁全部',
          value: '3'
        }
      ]
    } else {
      this.options = [
        {
          label: '解锁',
          value: '0'
        },
        {
          label: '加锁',
          value: '1'
        }
      ]
    }
    that.otherParam.planInfoArray = that.planInfoArray
    that.$api[that.monitorApi]({ planInfoArray: that.planInfoArray })
      .then((res) => {
        if (res && res.length) {
          that.monitorPoints = res
          res.forEach(function (item, idx) {
            if (item.value !== 'taskEdit' && item.value !== '1020') {
              const dataSourceItem = {
                type: 'radioButton',
                labelText: item.label,
                fieldName: item.value
              }
              that.dataSource.push(dataSourceItem)
              that.$set(that.formData, item.value, item.lockStatus)
            }

            if (item.value === '1020') {
              that.$set(that.formData, '1020', item.lockStatus)
            }
          })
          that.showMonitorPoints &&
            that.showMonitorPoints.length &&
            (that.dataSource = that.dataSource.filter((item) => {
              return that.showMonitorPoints.includes(item.fieldName)
            }))
        }
      })
      .catch(function (error) {
        console.error(error)
      })
  },
  methods: {
    taskEditChange (obj) {
      if (obj === '1') {
        this.taskEditCheck = true
      } else {
        this.taskEditCheck = false
      }
    },
    handleSubmit (e) {
      e.preventDefault()
      const that = this
      that
        .validate()
        .then((queryParams) => {
          const saveParams = { ...queryParams, ...that.otherParam }
          const formData = saveParams
          that.monitorPoints.forEach(function (item, idx) {
            if (saveParams[item.value]) {
              if (item.value === '1025') {
                that.terminationSuspendStatus[item.value] = saveParams[item.value]
              } else {
                that.monitorPointLockUnlockStatus[item.value] = saveParams[item.value]
              }
            }
          })
          // 任务编辑
          that.monitorPoints.forEach(function (item, idx) {
            // 若任务编辑为加锁状态时，标识设置为加锁状态（表单禁用）
            if (saveParams.taskEdit === '1') {
              that.monitorPointLockUnlockStatus[item.value] = '1'
            } else {
              if (saveParams[item.value] && item.value !== '1025') {
                that.monitorPointLockUnlockStatus[item.value] = saveParams[item.value]
              }
            }
          })
          that.monitorPointLockUnlockStatus.taskEdit = saveParams.taskEdit
          that.monitorPointLockUnlockStatus['1020'] = saveParams['1020']
          if (JSON.stringify(that.monitorPointLockUnlockStatus) === '{}' && JSON.stringify(that.terminationSuspendStatus) === '{}') {
            that.$message({ message: `请选择内容`, type: 'error' })
          }
          if (JSON.stringify(that.monitorPointLockUnlockStatus) !== '{}') {
            formData.monitorPointLockUnlockStatus = that.monitorPointLockUnlockStatus
            that.submitForm(formData, that.saveApi)
          }
          if (JSON.stringify(that.terminationSuspendStatus) !== '{}') {
            if (that.terminationSuspendStatus['1025'] === '9020') {
              that
                .$confirm('是否进行终止操作，此操作不可恢复', '提示', {
                  confirmButtonText: '是',
                  cancelButtonText: '否',
                  type: 'warning'
                })
                .then(() => {
                  that.$api['planInfoManager.changeSwitchType']({ planInfoArray: that.planInfoArray, content: that.terminationSuspendStatus['1025'] }).then((res) => {
                    that.$message({
                      message: '保存成功',
                      type: 'success'
                    })
                    that.$emit('close-lock-unlock', {})
                  })
                })
                .catch(() => { })
            } else {
              that.$api['planInfoManager.changeSwitchType']({ planInfoArray: that.planInfoArray, content: that.terminationSuspendStatus['1025'] }).then((res) => {
                that.$message({
                  message: '保存成功',
                  type: 'success'
                })
                that.$emit('close-lock-unlock', {})
              })
            }
          }
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    validate () {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((isValid) => {
          if (isValid) {
            const queryParams = this.handleParams(Object.assign({}, this.formData))
            resolve(queryParams)
          }
        })
      })
    },
    submitForm (params, api) {
      this.loadingVisible = true
      this.saveForm(api, params)
        .then((res) => {
          this.successSave(res)
        })
        .catch(function (e) {
          console.error(e, '异步失败的操作')
        })
    },
    handleParams (obj) {
      // 判断必须为obj
      if (!(Object.prototype.toString.call(obj) === '[object Object]')) {
        return {}
      }
      const tempObj = {}
      for (let [key, value] of Object.entries(obj)) {
        // if(value == null) value = '';
        if (Array.isArray(value) && value.length <= 0) continue
        if (Object.prototype.toString.call(value) === '[object Function]') continue
        // 若是为字符串则清除两边空格
        if (value && typeof value === 'string') {
          value = value.trim()
        }
        tempObj[key] = value
      }
      return tempObj
    },
    saveForm (api, params, urlParam) {
      const that = this
      return new Promise((resolve, reject) => {
        that.$api[api](params, urlParam)
          .then(function (res) {
            resolve(res)
          })
          .catch(function (error) {
            reject(error)
          })
      })
    },
    successSave (res) {
      this.loadingVisible = false
      this.$message({
        message: '保存成功！',
        type: 'success'
      })
      this.$emit('close-lock-unlock', res)
    }
  }
}
</script>
<style scoped lang="scss">
.formList.el-form {
  padding-bottom: 52px;
  overflow: auto;
  > .el-row {
    padding: 10px;
    box-sizing: border-box;

    &.existBtn:first-child {
      height: calc(100% - 50px);
      overflow-y: auto;
      overflow-x: hidden;
    }

    &.formBtn {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border-top: 1px solid $base-line-color;
      box-sizing: border-box;
      background: #ffffff;
    }

    .el-form-item__label {
      font-size: 12px;
    }

    .el-form-item__content {
      font-size: 12px;
    }
  }
}

.el-radio__input.is-disabled.is-checked {
  .el-radio__inner {
    background-color: #80bdff;
    border-color: #80bdff;

    &::after {
      background-color: #ffffff;
    }
  }
}

.el-checkbox__input.is-disabled.is-checked {
  .el-checkbox__inner {
    background-color: #80bdff;
    border-color: #80bdff;

    &::after {
      border-color: #ffffff;
    }
  }
}
</style>
