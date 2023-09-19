<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <form-list ref="form"
             label-width="150px"
             @saved="saved"
             :data-source="dataSource"
             :api="saveApi"
             :form="formData"
             :other-param="otherParam">
    <template #dataSourceType>
      <el-radio-group v-model="formData.dataSourceType">
        <el-radio-button :label="1">数据字典</el-radio-button>
        <el-radio-button :label="2">SQL数据视图</el-radio-button>
      </el-radio-group>
    </template>
    <template #reportSqlId>
      <el-select v-model="formData.reportSqlId"
                 placeholder="请选择SQL数据视图"
                 @change="onSqlIdChange">
        <el-option v-for="item in SqlViewData"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"> </el-option>
      </el-select>
    </template>
    <template #reportId>
      <el-select v-model="formData.reportId"
                 placeholder="请选择表格组件"
                 @change="onReportIdChange">
        <el-option v-for="item in ReportData"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"> </el-option>
      </el-select>
    </template>
    <template #option.labelCol>
      <el-select v-model="formData.option.labelCol"
                 placeholder="请选择SQL数据列">
        <el-option v-for="item in sqlViewCols"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"> </el-option>
      </el-select>
    </template>
    <template #option.valueCol>
      <el-select v-model="formData.option.valueCol"
                 placeholder="请选择SQL数据列">
        <el-option v-for="item in sqlViewCols"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"> </el-option>
      </el-select>
    </template>
    <template #option.pidCol>
      <el-select v-model="formData.option.pidCol"
                 placeholder="请选择SQL数据列">
        <el-option v-for="item in sqlViewCols"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"> </el-option>
      </el-select>
    </template>
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>

<script>
import { P8Form as FormList, RadioGroup, RadioButton, Select, Option } from 'p8-components-ui'
import FormConfig from './formConfig'
import selectConfig from '@/utils/common'
export default {
  name: 'SelectEdit',
  props: {
    id: {
      type: String,
      default: ''
    },
    selectionTypeId: {
      type: [Number, String],
      default: 1
    }
  },
  components: {
    FormList,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton,
    'el-select': Select,
    'el-option': Option
  },
  data () {
    return {
      saveApi: 'selection.save',
      SqlViewData: [],
      ReportData: [],
      sqlViewCols: [],
      dicForm: FormConfig.dicFormConfig,
      listSqlForm: FormConfig.listSqlFormConfig,
      treeSqlForm: FormConfig.treeSqlFormConfig,
      gridForm: FormConfig.gridFromConfig,
      formData: {
        id: '',
        selectionName: '',
        selectionCode: '',
        dataSourceType: this.selectionTypeId === 3 ? 3 : 1, // 1数据字典 2SQL视图  3报表（隐藏）
        reportSqlId: '', // SQL视图ID
        dictionaryId: '', // 数据字典根Id
        reportId: '', // 报表ID
        selectionDesc: '',
        option: { ...selectConfig }
        // option: {
        //   labelCol: '',
        //   valueCol: '',
        //   pidCol: ''
        // }
      },
      otherParam: {
        selectionType: this.selectionTypeId,
        selectionOption: ''
      }
    }
  },
  mounted () {
    console.log('formData', this.formData)
    let _this = this
    if (this.selectionTypeId !== 3) {
      // 目录类或树形类
      this.$api['selection.getAllSqlview']().then(function (res) {
        console.log('getAllSqlview', res)
        _this.SqlViewData = res
        // sqlViewCols = res.data
      })
    } else {
      // 表格类
      this.$api['selection.getAllReport']().then(function (res) {
        console.log('getAllReport', res)
        _this.ReportData = res
        // sqlViewCols = res.data
      })
    }
  },
  watch: {
    formData: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (newVal.reportSqlId && newVal.reportSqlId !== oldVal.reportSqlId) {
          this.onSqlIdChange(newVal.reportSqlId)
        }
        if (newVal.reportId && newVal.reportId !== oldVal.reportId) {
          this.onReportIdChange(newVal.reportId)
        }
        if (newVal.option && (newVal.option.labelCol !== '' || newVal.option.valueCol !== '' || newVal.option.pidCol !== '')) {
          let optionStr = JSON.stringify(newVal.option)
          // let optionStr = `{"labelCol":"${newVal.option.labelCol}","valueCol":"${newVal.option.valueCol}", "pidCol":"${newVal.option.pidCol}"}`
          // console.log('optionStr:', optionStr)
          this.otherParam.selectionOption = optionStr
        }
      }
    },
    id: {
      immediate: true,
      handler: function (newVal, oldVal) {
        let _this = this
        // console.log(newVal, oldVal, 'id')
        if (newVal && newVal !== oldVal) {
          this.$api['selection.view']({ id: newVal }).then(function (res) {
            console.log(res)
            _this.formData = { ..._this.formData, ...res }
            console.log('merge formData', _this.formData)
            if (res.selectionOption) {
              let optionObj = JSON.parse(res.selectionOption)
              // _this.formData.option = optionObj
              _this.formData = { ..._this.formData, ...{ option: optionObj } }
              console.log('merge option formData', _this.formData)
            }

            // sqlViewCols = res.data
          })
        }
      }
    }
  },
  computed: {
    dataSource () {
      let formDataSource
      switch (this.formData.dataSourceType) {
        // 数据字典
        case 1: {
          formDataSource = this.dicForm
          break
        }
        // SQL数据视图
        case 2: {
          if (this.selectionTypeId === 2) {
            formDataSource = this.treeSqlForm
          }
          if (this.selectionTypeId === 1) {
            formDataSource = this.listSqlForm
          }
          break
        }
        // 报表
        case 3: {
          formDataSource = this.gridForm
          break
        }
        default: {
          formDataSource = this.dicForm
        }
      }
      return formDataSource
    }
  },
  methods: {
    saved (res) {
      console.log('edit saved')
      this.$emit('saveSuccess', res)
    },
    cancel () {
      this.$emit('cancel')
    },
    onSqlIdChange (item) {
      console.log('onSqlIdChange', item)
      let _this = this
      this.$api['selection.getSqlViewAllColumn']({ id: item }).then(function (res) {
        console.log(res)
        _this.sqlViewCols = res
        // sqlViewCols = res.data
      })
    },
    onReportIdChange (reportId) {
      console.log('onReportIdChange', reportId)
      let _this = this
      this.$api['selection.getColumnsByReportId']({ id: reportId }).then(function (res) {
        console.log(res)
        _this.sqlViewCols = res
        // sqlViewCols = res.data
      })
    }
  }
}
</script>

<style scoped></style>
