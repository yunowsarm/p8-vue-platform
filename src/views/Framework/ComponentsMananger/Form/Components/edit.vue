<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <form-list ref="form"
             :data-source="dataSource"
             :form="formData"
             :api="saveApi"
             @saved="saved"
             label-width="90px"
             @rendered="rendered">
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'FormListEdit',
  components: {
    FormList
  },
  props: {
    record: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      saveApi: 'formGenerator.formListSave',
      dataSource: [
        {
          type: 'text',
          labelText: '表单编码',
          fieldName: 'desformCode',
          placeholder: '请输入表单编码，并确保编码唯一性',
          colLayout: 'singleCol',
          rules: [
            {
              required: true
            },
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  // callback 是提示的信息
                  return callback(new Error('表单编码不能为空'))
                } else {
                  if (value !== this.record.desformCode) {
                    // 调用封装了的异步效验方法，
                    this.$api['formGenerator.saveCheck']({ desformCode: value }).then((response) => {
                      if (response) {
                        callback()
                      } else {
                        this.$message.warning('表单编码重复')
                      }
                    })
                  } else {
                    callback()
                  }
                }
              },
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'text',
          labelText: '表单名称',
          fieldName: 'desformName',
          placeholder: '请输入表单名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true
            },
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  // callback 是提示的信息
                  return callback(new Error('表单名称不能为空'))
                } else {
                  // 调用封装了的异步效验方法，
                  if (value !== this.record.desformName) {
                    this.$api['formGenerator.saveCheck']({ desformName: value }).then((response) => {
                      if (response) {
                        callback()
                      } else {
                        this.$message.warning('表单名称重复')
                      }
                    })
                  } else {
                    callback()
                  }
                }
              },
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '表单描述',
          fieldName: 'desformDesc',
          colLayout: 'singleCol',
          placeholder: '请输入表单描述'
        },
        // {
        //   type: 'select',
        //   labelText: '绑定数据源',
        //   fieldName: 'cgFormTableId',
        //   placeholder: '选择数据源',
        //   colLayout: 'singleCol',
        //   options: [
        //     {
        //       label: 'text1',
        //       value: '0'
        //     },
        //     {
        //       label: 'text2',
        //       value: '1'
        //     }
        //   ],
        //   rules: [
        //     {
        //       required: true
        //     }
        //   ]
        // },
        {
          type: 'select',
          labelText: '发布状态',
          fieldName: 'desformStatus',
          placeholder: '下拉选择你要的',
          colLayout: 'singleCol',
          options: [
            {
              label: '未发布',
              value: '0'
            },
            {
              label: '已发布',
              value: '1'
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        }
      ],
      formData: {}
    }
  },
  methods: {
    rendered () {
      // 所有表单元素渲染后调用rendered
      if (this.record.id) {
        this.getFormData()
      }
    },
    getFormData () {
      this.formData = Object.assign({}, this.record)
    },
    cancel () {
      this.$emit('cancel')
    },
    saved (res) {
      console.log('修改页面关闭时的回调方法')
      this.$emit('saveSuccess', res)
    }
  }
}
</script>
