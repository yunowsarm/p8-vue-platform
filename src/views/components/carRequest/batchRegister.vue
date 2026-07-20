<template>
  <list-layout :header-visible="false" v-if="isMounted">
    <template #center>
      <div class="dispatch-container">
        <div class="dispatch-scroll-body">
          <div class="apply-table-section">
            <h3 class="section-title">申请用车信息</h3>
            <el-table :data="filteredRow" border :max-height="tableMaxHeight">
              <el-table-column prop="APPLICANTNAME" label="申请人" />
              <el-table-column prop="APPLICANT_DEPT" label="申请部门" />
              <el-table-column prop="APPLICANT_DATE" label="申请日期" />
              <el-table-column prop="DATE" label="用车开始时间" />
              <el-table-column prop="RETURN_TIME" label="用车结束时间" />
              <el-table-column prop="DEPART" label="出发地" />
              <el-table-column prop="DESTINATION" label="目的地" />
              <el-table-column prop="REASON" label="用车事由" />
              <el-table-column prop="METHOD" label="用车方式">
                <template slot-scope="scope">
                  {{ scope.row.METHOD === '1' ? '往返' : '单程' }}
                </template>
              </el-table-column>
              <el-table-column prop="APPROVE_STATUS" label="用车状态" width="100" fixed="right">
                <template slot-scope="scope">
                  <span :style="{ color: getStatusColor(scope.row.APPROVE_STATUS) }">
                    {{ getStatusText(scope.row.APPROVE_STATUS) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="dispatch-form-section">
            <h3 class="section-title">派车信息</h3>
            <el-form :model="dispatchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="司机">
                    <el-input v-model="dispatchForm.driver" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="车牌号">
                    <el-input v-model="dispatchForm.plateNumber" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="car-user-section" v-if="dispatchForm.carUsers.length">
                <h4 class="car-user-title">用车人信息</h4>
                <el-row :gutter="20" v-for="(item, index) in dispatchForm.carUsers" :key="item.dataId || index">
                  <el-col :span="16">
                    <el-form-item :label="'用车人（' + (index + 1) + '）'">
                      <el-input v-model="item.label" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form>
          </div>
        </div>

        <div class="dispatch-form-section register-section">
          <h3 class="section-title">登记表单</h3>
          <el-form :model="registerForm" :rules="registerRules" ref="registerForm" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="出车公里数" prop="departMileage">
                  <el-input v-model="registerForm.departMileage" disabled placeholder="自动获取" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="回车公里数" prop="returnMileage">
                  <el-input v-model="registerForm.returnMileage" placeholder="请输入回车公里数" @input="calcTotalMileage" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="合计里程">
                  <el-input v-model="registerForm.mileages" disabled placeholder="自动计算" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" class="form-actions">
                <el-button type="primary" :loading="submitting" @click="submitRegister">提交合并登记</el-button>
                <el-button @click="resetRegisterForm">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout } from 'p8-components-ui'

export default {
  name: 'BatchRegister',
  components: { ListLayout },
  props: {
    row: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    registerList() {
      if (!Array.isArray(this.row) || this.row.length === 0) {
        return []
      }
      return this.row
    },
    filteredRow() {
      return this.registerList.map((item) => {
        const applicantName = item.APPLICANTNAMECHINESE || item.APPLICANTNAME || item.USECARNAME || ''
        const carDate = item.DATE || item.DATEFORMAT || ''

        return {
          ID: item.ID,
          DATA_ID: item.DATA_ID,
          APPLICANTNAME: applicantName,
          APPLICANT_DEPT: item.APPLICANT_DEPT || '',
          APPLICANT_DATE: item.APPLICANT_DATE || '',
          DATE: carDate,
          RETURN_TIME: item.RETURN_TIME || '',
          DEPART: item.DEPART || '',
          DESTINATION: item.DESTINATION || '',
          REASON: item.REASON || '',
          METHOD: item.METHOD || '1',
          APPROVE_STATUS: item.APPROVE_STATUS || '',
          DRIVER_NAME: item.DRIVER_NAME || item.DRIVERNAME || item.DRIVER || '',
          PLATE_NUMBER: item.CARD || item.CAR_NO || item.PLATE_NUMBER || '',
          CAR_USER: item.USECARNAME || item.USE_CAR_USER || item.CAR_USER || '',
          CAR_ID: item.CAR_ID || ''
        }
      })
    }
  },
  data() {
    const validateReturnMileage = (rule, value, callback) => {
      if (value === '' || value === null || value === undefined) {
        callback(new Error('请输入回车公里数'))
        return
      }
      const returnVal = Number(value)
      const departVal = Number(this.registerForm.departMileage)
      if (Number.isNaN(returnVal)) {
        callback(new Error('回车公里数必须为数字'))
        return
      }
      if (!Number.isNaN(departVal) && returnVal < departVal) {
        callback(new Error('回车公里数不能小于出车公里数'))
        return
      }
      callback()
    }

    return {
      isMounted: false,
      submitting: false,
      tableMaxHeight: 200,
      dispatchForm: {
        driver: '',
        plateNumber: '',
        carUsers: []
      },
      registerForm: {
        departMileage: '',
        returnMileage: '',
        mileages: ''
      },
      registerRules: {
        departMileage: [{ required: true, message: '出车公里数获取失败', trigger: 'change' }],
        returnMileage: [{ validator: validateReturnMileage, trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.initDispatchForm()
    this.loadDepartMileage()
    this.isMounted = true
  },
  methods: {
    initDispatchForm() {
      const list = this.filteredRow
      if (!list.length) {
        return
      }

      const first = list[0]
      this.dispatchForm.driver = first.DRIVER_NAME || ''
      this.dispatchForm.plateNumber = first.PLATE_NUMBER || ''
      this.dispatchForm.carUsers = list.map((item) => ({
        dataId: item.ID || item.DATA_ID,
        label: item.CAR_USER || item.APPLICANTNAME || ''
      }))
    },
    loadDepartMileage() {
      const carId = this.registerList[0] && this.registerList[0].CAR_ID
      if (!carId) {
        return
      }

      const params = {
        id: '23c7a2e1cb0eb18f921666a3166f044d',
        // param: {},
        // sqlParam: {},
        reportParam: {
          ID: carId
        }
      }

      this.$api['carRequest.platSelectApi'](params).then((res) => {
        const mileage = this.parseMileage(res)
        if (mileage !== '') {
          this.registerForm.departMileage = mileage
          this.calcTotalMileage()
        }
      })
    },
    parseMileage(res) {
      if (res === null || res === undefined || res === '') {
        return ''
      }
      const list = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : []
      const record = list[0]
      if (!record || record.CURRENT_MILEAGE === null || record.CURRENT_MILEAGE === undefined) {
        return ''
      }
      return record.CURRENT_MILEAGE
    },
    calcTotalMileage() {
      const depart = Number(this.registerForm.departMileage)
      const ret = Number(this.registerForm.returnMileage)
      if (Number.isNaN(depart) || Number.isNaN(ret)) {
        this.registerForm.mileages = ''
        return
      }
      const total = ret - depart
      this.registerForm.mileages = total >= 0 ? String(total) : ''
    },
    getStatusText(status) {
      const statusMap = {
        0: '未审批',
        1: '审批中',
        2: '未通过',
        3: '待派车',
        4: '已派车',
        5: '用车完成'
      }
      return statusMap[status] || '未知'
    },
    getStatusColor(status) {
      const colorMap = {
        0: '#909399',
        1: '#e6a23c',
        2: '#f56c6c',
        3: '#67c23a',
        4: '#67c23a',
        5: '#909399'
      }
      return colorMap[status] || '#909399'
    },
    submitRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (!valid) {
          this.$message.error('请完善登记表单')
          return false
        }

        const list = this.registerList.map((item) => item.ID).filter(Boolean)
        if (!list.length) {
          this.$message.warning('没有可登记的申请单')
          return
        }

        const params = {
          list,
          departMileage: Number(this.registerForm.departMileage),
          returnMileage: Number(this.registerForm.returnMileage),
          mileages: Number(this.registerForm.mileages)
        }

        this.submitting = true
        this.$api['carRequest.register'](params)
          .then(() => {
            this.$message.success(`合并登记成功，共处理${list.length}笔申请`)
            this.$emit('close')
            this.$emit('saved')
          })
          .finally(() => {
            this.submitting = false
          })
      })
    },
    resetRegisterForm() {
      this.registerForm.returnMileage = ''
      this.registerForm.mileages = ''
      this.$refs.registerForm && this.$refs.registerForm.clearValidate()
      this.loadDepartMileage()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .list-layout {
  height: 100%;

  .list-main.fullHeight {
    height: 100%;
    overflow: hidden;
  }
}

.dispatch-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 68vh;
  padding: 12px 16px 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.dispatch-scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}

.apply-table-section {
  margin-bottom: 16px;
  background: #fff;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dispatch-form-section {
  background: #fff;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.register-section {
  flex-shrink: 0;
  margin-top: 12px;
  padding-bottom: 4px;
}

.car-user-section {
  margin-bottom: 6px;
  padding: 10px 12px;
  background: #fafbfc;
  border-radius: 4px;
  border: 1px solid #e8eaed;

  .car-user-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 10px 0;
    padding-left: 8px;
    border-left: 3px solid #1890ff;
  }
}

.form-actions {
  text-align: center;
  margin-top: 8px;
  padding-bottom: 4px;

  .el-button {
    margin: 0 10px;
    min-width: 120px;
  }
}

::v-deep .el-table {
  .el-table__header th {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}

::v-deep .register-section .el-form-item {
  margin-bottom: 14px;
}

::v-deep .dispatch-scroll-body .el-form-item {
  margin-bottom: 16px;
}

::v-deep .el-date-picker,
::v-deep .el-input {
  width: 100%;
}
</style>
