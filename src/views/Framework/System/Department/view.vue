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
  name: 'DepartmentView',
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
    },
    drawerContentView: {
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
          placeholder: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'text',
          labelText: '部门简称',
          fieldName: 'deptAbbreviation',
          placeholder: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'number',
          labelText: '部门排序',
          fieldName: 'indexNo',
          // colLayout: 'doubleCol',
          placeholder: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'treeSelect',
          labelText: '所属部门',
          fieldName: 'parentId',
          placeholder: '',
          optionUrl: { api: 'departmentManger.deptTree', params: { deptId: this.recordId } },
          clearable: true,
          defaultExpandAll: true,
          multiple: false,
          disabled: true,
          checkStrictly: true,
          treeData: []
        },
        {
          type: 'select',
          labelText: '部门类型',
          fieldName: 'deptType',
          placeholder: '',
          optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'DEPARTMENT_TYPE' } },
          options: [],
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'text',
          labelText: '部门编码',
          placeholder: '',
          fieldName: 'no',
          defaultValue: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'select',
          labelText: '部门类别',
          fieldName: 'deptCategory',
          placeholder: '',
          optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'DEPARTMENT_CATEGORY' } },
          options: [],
          fieldConfig: {
            disabled: true
          }
        }
      ]
    }
  },
  mounted () { },
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
    }
  }
}
</script>
