<template>
  <form-list
    ref="form"
    @rendered="rendered"
    @saved="saved"
    :is-custom-validate="isCustomValidate"
    @custom-validate="customValidate"
    :data-source="dataSource"
    :api="saveApi"
    :form="record"
    label-width="100px"
  >
    <template #processCron>
      <el-input @click.native="cronPopover = true" v-model="record.processCron" placeholder="请输入定时策略"></el-input>
      <el-popover v-model="cronPopover">
        <cron @change="changeCron" @close="cronPopover = false" i18n="cn"></cron>
      </el-popover>
    </template>
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>
<style scoped></style>
<script>
import { P8Cron as cron, Input, Popover, P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'ThirdPartInterfaceEdit',
  components: {
    FormList,
    cron,
    'el-input': Input,
    'el-popover': Popover
  },
  props: {
    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      saveApi: 'thirdPartInterface.bindService',
      // formData: Object.assign({}, { hiddenId: '', formField7: [] }),
      dataSource: [
        {
          labelText: '接口ID',
          type: 'select',
          fieldName: 'serviceKey',
          placeholder: '请选择接口ID',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.unBindConfigList',
            params: {},
            label: 'serviceKey',
            value: 'serviceKey'
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'hidden', // 控件类型
          fieldName: 'id',
          colLayout: 'singleCol'
        },
        {
          type: 'text', // 控件类型
          fieldName: 'serviceName',
          labelText: '服务名称',
          placeholder: '请输入服务名称',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必须输入服务名称'
            }
          ]
        },
        {
          labelText: '服务提供方',
          type: 'select',
          fieldName: 'providerName',
          placeholder: '请选择服务提供方',
          colLayout: 'doubleCol',
          optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'PROVIDER_NAME' } },
          labelInValue: true,
          options: [],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          labelText: '对方系统',
          type: 'select',
          fieldName: 'systemName',
          placeholder: '请选择对方系统',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'SYSTEM_NAME' }
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '自动执行周期',
          slotName: 'processCron',
          fieldName: 'processCron',
          defaultValue: '',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'radio',
          labelText: '禁用',
          fieldName: 'isDisable',
          defaultValue: '0', // 默认选中value为0的那一项
          colLayout: 'doubleCol',
          options: [
            {
              label: '否',
              value: '1'
            },
            {
              label: '是',
              value: '0'
            }
          ]
        },
        {
          labelText: '接口实现类',
          type: 'select',
          fieldName: 'serviceRealizationName',
          placeholder: '请选择接口实现类',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.unBindServiceList',
            params: { id: this.record.id },
            label: 'desc',
            value: 'name'
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          labelText: '心跳服务Key',
          type: 'select',
          fieldName: 'heartServiceRealizationName',
          placeholder: '请选择心跳服务Key',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.heartInterfaceList',
            params: {},
            label: 'desc',
            value: 'name'
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          fieldName: 'serviceType',
          labelText: '接口类型',
          placeholder: '请输入接口类型',
          colLayout: 'doubleCol'
        },
        {
          type: 'textarea', // 控件类型
          fieldName: 'serviceDesc',
          labelText: '接口业务描述',
          placeholder: '请输入接口业务描述',
          colLayout: 'singleCol'
        }
      ],
      unBindServiceList: [],
      unBindConfigList: [],
      heartInterfaceList: [],
      cronPopover: false,
      isCustomValidate: true
    }
  },
  mounted() {

  },
  methods: {
    rendered() {
      let that = this
      that.$api['thirdPartInterface.serviceRemove']()
        .then(function (res) {
          that.$refs.table.queryList()
          that.$message({
            message: '操作成功',
            type: 'success'
          })
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    tableRefresh(param) {
      param
        .then(() => {

        })
        .catch(() => {

        })
    },
    clickEvent() {

    },
    cancel() {
      this.$emit('cancel')
    },
    saved(res) {

      this.$emit('saveSuccess', res)
    },
    handleChange(info) {

    },
    changeCron(val) {
      if (val) {
        // 去掉年
        let newVal = val.substr(0, val.length - 1)
        this.record.processCron = newVal
      }
      this.cronPopover = false
    },
    customValidate(saveParams) {
      saveParams.serviceHeartRealizationName = saveParams.heartServiceRealizationName

      this.$refs.form.submitForm(saveParams, this.saveApi)
    }
  }
}
</script>
