<template>
  <form-list ref="form" label-width="110px" @rendered="rendered" @saved="saved" :data-source="dataSource" :api="saveApi" :form="modify">
    <template #icon>
      <el-input @click.native="a" v-model="modify.aa" placeholder="请选择图标"></el-input>
    </template>
  </form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'LogConfigEdit',
  components: {
    FormList
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
      saveApi: 'logApiConfig.save',
      modify: {},
      dataSource: [
        {
          type: 'text',
          fieldName: 'classPath',
          labelText: '接口类路径',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '此项为必填项'
            }
          ]
        },
        {
          type: 'text',
          fieldName: 'method',
          labelText: '接口类方法',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '此项为必填项'
            }
          ]
        },
        {
          type: 'select',
          labelText: '动作Id', // 提示信息：“时间控制”为开启状态时，该标识在任务中使用时，将需要能够单独保存开始和结束时间，与任务开始和结束时间为两套时间。
          fieldName: 'actionId',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'LOG_ACTION' }
          },
          rules: [
            {
              required: true,
              message: '此项为必填项'
            }
          ]
        },
        {
          type: 'text',
          labelText: '业务对象名', // 提示信息：“时间控制”为开启状态时，该标识在任务中使用时，将需要能够单独保存开始和结束时间，与任务开始和结束时间为两套时间。
          fieldName: 'entityName',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '此项为必填项'
            }
          ]
        },
        {
          type: 'text',
          labelText: '功能模块',
          fieldName: 'module',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '此项为必填项'
            }
          ]
        },
        {
          type: 'text',
          labelText: '日志生成器', // 提示信息:依赖标识是指在计划编辑时，当某任务已经选择了依赖标识后该标识才可以选择，任务取消依赖标识时，给予确认框提示依赖关系后，选择确定删除的情况下该标识自动取消，该属性的编辑关系为单项关系。
          fieldName: 'logGenerator',
          colLayout: 'doubleCol'
        },
        {
          type: 'select',
          labelText: '日志类型', // 提示信息：互斥标识指在计划编辑时，当某任务已经选择了该标识互斥列表中的标识时，该标识不可被选择，该属性的编辑关系为双向关系。例:A与B为互斥关系，修改A或修改B时，都应显示可编辑该关系。
          fieldName: 'logType',
          colLayout: 'doubleCol',
          options: [
            { label: '系统类型', value: '1' },
            { label: '业务类型', value: '2' },
            { label: '安全类型', value: '3' }
          ],
          rules: [
            {
              required: true,
              message: '此项为必填项'
            }
          ]
        },
        {
          type: 'text',
          fieldName: 'tableName',
          labelText: '业务表名',
          colLayout: 'doubleCol'
        },
        {
          type: 'text',
          fieldName: 'keyName',
          labelText: '对应表主键的key',
          colLayout: 'doubleCol'
        }
        // {
        //   type: 'select',
        //   fieldName: 'adminType',
        //   labelText: '管理类型',
        //   colLayout: 'doubleCol',
        //   optionUrl: {
        //     api: 'thirdPartInterface.getDic',
        //     params: { dicType: 'LOG_ACTION' }
        //   }
        // }
      ]
    }
  },
  methods: {
    rendered() {
      if (this.record && this.record !== {}) {
        this.modify = Object.assign({}, this.record)
      }
    },
    saved(res) {
      this.$emit('save-success', res)
    }
  }
}
</script>
<style lang="scss" scoped></style>
