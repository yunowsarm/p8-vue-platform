<template>
  <form-list :dataSource="dataSource"
             :form="formData"
             @saved="saved"
             :api="saveApi">
    <template #year>
      <el-col>
        <el-form-item>
          <el-date-picker v-model="formData.year"
                          type="year"
                          style="width: 100%;"
                          :disabled="disabled"
                          value-format="yyyy"
                          placeholder="选择年"
                          @change="dateChange()">
          </el-date-picker>
        </el-form-item>
      </el-col>
    </template>
    <template #month>
      <el-col>
        <el-form-item>
          <!-- <el-date-picker v-model="formData.month"
                          format="MM"
                          value-format="MM"
                          type="month"
                          placeholder="请选择月份"
                          :picker-options="setMonthDisabled">
          </el-date-picker> -->
          <el-select v-model="formData.month"
                     :disabled="disabled"
                     placeholder="请选择"
                     @change="monthChange(formData.month)">
            <el-option v-for="item in options"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"
                       :disabled="item.disabled">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </template>
  </form-list>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  components: {
    FormList
  },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      dataSource: [
        {
          type: 'blank',
          labelText: '年份',
          fieldName: 'year',
          slotName: 'year',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '考核月份',
          fieldName: 'month',
          slotName: 'month',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'select',
          labelText: '创建类型',
          fieldName: 'type',
          placeholder: '请选择',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          },
          options: [
            {
              label: '手动',
              value: '1'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '备注',
          fieldName: 'remarks',
          colLayout: 'singleCol',
          placeholder: '请输入'
        }
      ],
      formData: {
        year: '',
        month: '',
        type: '1',
        remarks: ''
      },
      saveApi: 'planExamine.saveData',
      options: [],
      disabled: false
      // setMonthDisabled: {
      //   disabledDate (time) {
      //     let falg = false
      //     const date = new Date(time);
      //     const month = date.getMonth() + 1;
      //     let arr = [6, 8]
      //     if (arr.includes(month)) {
      //       falg = true
      //     }
      //     return falg
      //   }
      // }
    }
  },
  mounted () {
    if (this.row.length > 0) {
      this.formData = {
        id: this.row[0].ID,
        year: this.row[0].YEAR,
        month: this.row[0].MONTH,
        type: '1',
        remarks: this.row[0].REMARKS,
      }
      this.disabled = true
    }
  },
  methods: {
    monthChange (val) {
      let that = this
      this.$api['planExamine.getResult']({ year: this.formData.year, month: val }).then(res => {
        if (res) {
          that.$confirm(val + '月份已有考核记录，保存会覆盖原有记录，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {

            })
            .catch((e) => {
              that.formData.month = null
            })
        }

      })
    },
    dateChange () {
      let that = this
      let option = [
        {
          label: '1',
          value: '1'
        },
        {
          label: '2',
          value: '2'
        },
        {
          label: '3',
          value: '3'
        },
        {
          label: '4',
          value: '4'
        }, {
          label: '5',
          value: '5'
        },
        {
          label: '6',
          value: '6'
        },
        {
          label: '7',
          value: '7'
        },
        {
          label: '8',
          value: '8'
        }, {
          label: '9',
          value: '9'
        },
        {
          label: '10',
          value: '10'
        },
        {
          label: '11',
          value: '11'
        },
        {
          label: '12',
          value: '12'
        }
      ]
      this.$api['planExamine.getMonth']({ year: this.formData.year }).then(res => {
        if (res) {
          res.forEach(el => {
            if (el.status === '776e7590c4084a8ad00fb6b0dfe2a114' || el.status === 'e7f2513074bb66bbfdfcb81cb79fd93c') {
              option.forEach(item => {
                if (el.month === item.value) {
                  item.disabled = true
                }
              })
            }
          })
          that.options = option
          that.formData.month = null
        }
      })
    },
    saved (res) {
      this.$emit('save-success')
      this.$emit('close')
    },
  }
}
</script>

<style>
</style>