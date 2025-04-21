<template>
  <div style="height: 100%">
    <form-list ref="form" @saved="saved" :is-custom-validate="isCustomValidate" @custom-validate="customValidate" :data-source="dataSource" :api="saveApi" :form="formData" :other-param="otherParam">
      <template #cron>
        <el-input @click.native="cronPopover = true" v-model="formData.cron" placeholder="请输入定时策略"></el-input>
        <el-popover v-model="cronPopover">
          <cron @change="changeCron" @close="cronPopover = false" i18n="cn"></cron>
        </el-popover>
      </template>
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
  </div>
</template>

<script>
import { P8Cron as cron, Input, Popover, P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'SchedulerTask',
  components: {
    FormList,
    cron,
    'el-input': Input,
    'el-popover': Popover
  },
  props: {
    record: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      saveApi: 'schedulerTask.save',
      otherParam: {},
      modify: {},
      isCustomValidate: true,
      cronPopover: false,
      formData: Object.assign({}, this.record),
      dataSource: [
        {
          type: 'text',
          labelText: '名称',
          fieldName: 'name',
          placeholder: '请输入调度任务名称',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: '类型',
          fieldName: 'type',
          placeholder: '请输入调度任务类型',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: 'classPath',
          fieldName: 'classPath',
          placeholder: '请输入目标类路径，如com.rdmu.project.web.apply.services.ProjectApplyService',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: 'method',
          fieldName: 'method',
          placeholder: '请输入目标类方法名，如pushData。方法返回PushMsg对象,接收一个map入参。',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: '参数',
          fieldName: 'params',
          placeholder: '请输入方法中需要的所有参数,需为标准json格式，如：{"type":"1"}',
          colLayout: 'doubleCol'
        },
        {
          type: 'select',
          labelText: '时机',
          fieldName: 'timing',
          options: [
            { key: 'immediately', label: '立即执行+定时轮询', value: 'immediately' },
            { key: 'polling', label: '定时轮询', value: 'polling' }
          ],
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '定时策略',
          slotName: 'cron',
          fieldName: 'cron',
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
          type: 'textarea',
          labelText: '描述',
          fieldName: 'description',
          placeholder: '请输入描述',
          colLayout: 'singleCol'
        },
        {
          type: 'hidden',
          fieldName: 'entityId',
          urlParam: true
        },
        {
          type: 'hidden',
          fieldName: 'id',
          urlParam: true
        }
      ]
    }
  },
  mounted: function () {},
  methods: {
    customValidate(saveParams) {
      if (saveParams.timing === 'polling' && !saveParams.cron) {
        this.$message.error('轮询任务的定时策略不能为空')
      } else {
        if (!saveParams.id && saveParams.timing === 'polling') {
          saveParams.statusExecute = '1' // 创建立即运行
        }
        this.$refs.form.submitForm(saveParams, this.saveApi)
      }
    },
    rendered() {},
    cancel() {
      this.$emit('cancel')
    },
    saved(res) {
      this.$emit('saveSuccess', res)
    },
    handleChange(info) {},
    changeCron(val) {
      if (val) {
        // 去掉年
        this.formData.cron = val.substr(0, val.length - 1)
        this.formData = Object.assign({}, this.formData)
      }
      this.cronPopover = false
    }
  }
}
</script>

<style scoped></style>
