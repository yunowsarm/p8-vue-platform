<template>
  <form-list ref="form"
             :data-source="dataSource"
             :api="saveApi"
             :form="formData"
             @saved="saved"
             @rendered="rendered">
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'DepartmentEdit',
  components: {
    FormList
  },
  props: {
    recordId: {
      type: String,
      default: ''
    },
    parentId: {
      type: String,
      default: ''
    },
    no: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      saveApi: 'departmentManger.save',
      detailApi: 'departmentManger.deptInfo',
      formData: {
        name: '',
        id: '',
        parentId: '',
        deptType: '',
        no: '',
        indexNo: '',
        deptAbbreviation: '',
        statisticalKanban: '',
        deptCategory: ''
      },
      dataSource: [
        {
          type: 'text',
          labelText: '部门名称',
          fieldName: 'name',
          defaultValue: '',
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              maxLength: 32,
              required: true
            }
          ]
        },
        {
          type: 'text',
          labelText: '部门简称',
          fieldName: 'deptAbbreviation',
          defaultValue: '',
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              required: false,
              maxLength: 300
            }
          ]
        },
        {
          type: 'number',
          labelText: '部门排序',
          fieldName: 'indexNo',
          // colLayout: 'doubleCol',
          defaultValue: 0,
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              max: 9999999
            }
          ]
        },
        {
          type: 'treeSelect',
          labelText: '所属部门',
          fieldName: 'parentId',
          defaultValue: [],
          optionUrl: { api: 'departmentManger.deptTree', params: { deptId: this.recordId } },
          clearable: true,
          defaultExpandAll: true,
          multiple: false,
          disabled: false,
          checkStrictly: true,
          treeData: [],
          // treeProps: {
          //   value: 'value',
          //   children: 'children',
          //   label: 'label'
          // },
          rules: [
            {
              required: true,
              message: '必须选择部门',
              trigger: 'input'
            }
          ]
        },
        {
          type: 'select',
          labelText: '部门类型',
          fieldName: 'deptType',
          defaultValue: '',
          optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'DEPARTMENT_TYPE' } },
          options: [],
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              required: true,
              maxLength: 256
            }
          ]
        },
        {
          type: 'text',
          labelText: '部门编码',
          placeholder: '长度为2的大写字母或数字。例如：XK，2K',
          fieldName: 'no',
          defaultValue: '',
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              required: true
            },
            {
              validator: (rule, value, callback) => {
                let that = this
                if (value !== that.no) {
                  let reg = new RegExp('^[A-Za-z0-9]{2}$')
                  if (reg.test(value)) {
                    that.$api['ProjectApply.checkNo']({ no: value }).then((res) => {
                      if (res) {
                        callback()
                      } else {
                        callback(new Error('部门编号已被使用，请重新输入！'))
                      }
                    })
                  } else {
                    callback(new Error('部门编码格式不符合规则'))
                  }
                } else {
                  callback()
                }
              }
            }
          ]
        }
      ]
    }
  },
  mounted () {
    if (this.recordId) {
      if (!this.parentId) {
        this.dataSource[1].fieldConfig.disabled = true
        this.dataSource[2].fieldConfig.disabled = true
        this.dataSource[2].rules[0].required = false
        this.dataSource[3].disabled = true
        this.dataSource[3].rules[0].required = false
        this.dataSource[4].fieldConfig.disabled = true
        this.dataSource[4].rules[0].required = false
        this.dataSource[5].fieldConfig.disabled = true
        this.dataSource[5].rules[0].required = false
      } else {
        this.dataSource[1].fieldConfig.disabled = false
        this.dataSource[2].disabled = false
        this.dataSource[2].rules[0].required = true
        this.dataSource[3].fieldConfig.disabled = false
        this.dataSource[4].fieldConfig.disabled = false
        this.dataSource[4].rules[0].required = true
      }
    }
  },
  methods: {
    rendered () {
      this.getInfo()
    },
    cancel () {
      this.$emit('cancel')
    },
    getInfo () {
      if (this.recordId) {
        this.$api[this.detailApi]({ id: this.recordId }).then((res) => {
          // console.log(res,'-------我的返回值');
          // console.log(this.formData,'------我的列表');
          res.forEach((item, index, arr) => {
            Object.keys(this.formData).forEach((key) => {
              this.formData[key] = res[index][key]
            })
          })
          //  for(var i = 0; i < res.length; i++){

          //  }

          // Object.keys(this.formData).forEach(key => {
          //   this.formData[key] = res[key]
          // })
        })
      } else {
        Object.keys(this.formData).forEach((key) => {
          this.formData[key] = ''
        })
      }
    },
    saved (res) {
      this.$emit('saveSuccess', res)
    }
  }
}
</script>
