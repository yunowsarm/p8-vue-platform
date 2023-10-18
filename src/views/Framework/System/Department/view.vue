<template>
  <form-list ref="form"
             :data-source="dataSource"
             :api="saveApi"
             :form="formData"
             @rendered="rendered">
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>
<style lang="scss" scoped>
::v-deep .el-form-item__content > .view {
  background: #f5f8fb;
}
</style>
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
        deptTypeDisplay: '',
        no: '',
        indexNo: '',
        deptAbbreviation: '',
        statisticalKanban: '',
        deptCategory: ''
      },
      dataSource: [
        {
          type: 'view',
          labelText: '部门名称',
          fieldName: 'name',
          placeholder: ''
        },
        {
          type: 'view',
          labelText: '部门简称',
          fieldName: 'deptAbbreviation',
          placeholder: ''
        },
        {
          type: 'view',
          labelText: '部门排序',
          fieldName: 'indexNo',
          // colLayout: 'doubleCol',
          placeholder: ''
        },
        {
          type: 'view',
          labelText: '所属部门',
          fieldName: 'parentId',
          placeholder: ''
        },
        {
          type: 'view',
          labelText: '部门类型',
          fieldName: 'deptTypeDisplay',
          placeholder: ''
        },
        {
          type: 'view',
          labelText: '部门编码',
          placeholder: '',
          fieldName: 'no',
          defaultValue: ''
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
