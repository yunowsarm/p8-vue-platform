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
                          value-format="yyyy"
                          placeholder="选择年"
                          @change="dateChange">
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
                     placeholder="请选择">
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
          options: [
            {
              label: '自动',
              value: '0'
            },
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
        type: '',
        remarks: ''
      },
      saveApi: 'planExamine.saveData',
      options: [],
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

  },
  methods: {
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
            option.forEach(item => {
              console.log(el === item.value);
              if (el === item.value) {
                item.disabled = true
              }
            })
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