<template>
  <form-list ref="form"
              @rendered="rendered"
              :form="formData"
              @saved="saved"
              :dataSource="dataSource"
              :api="saveApi"
              :is-custom-validate="true"
              @custom-validate="customValidate">
  </form-list>
</template>

<script>

import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'
let dataSource = [
  {
    type: 'text',
    labelText: '团队名称',
    fieldName: 'name',
    placeholder: '请输入团队名称',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'treeSelect',
    labelText: '项目类型',
    fieldName: 'projectClassifyId',
    placeholder: '请选择项目类型',
    colLayout: 'singleCol',
    disabledValues: ['62f000902804491db8c1'],
    defaultExpandAll: true,
    treeData: [],
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'number',
    labelText: '排序号',
    fieldName: 'indexNo',
    placeholder: '请输入排序号',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'radioButton',
    labelText: '默认团队',
    fieldName: 'isDefault',
    placeholder: '请输入团队描述',
    colLayout: 'singleCol',
    options: [
      {
        value: '1',
        label: '是'
      },
      {
        value: '0',
        label: '否'
      }
    ]
  },
  {
    type: 'textarea',
    labelText: '团队描述',
    fieldName: 'describes',
    placeholder: '请输入团队描述',
    colLayout: 'singleCol'
  }
]

export default {
  name: 'KteamsEdit',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      saveApi: 'knowledgeManagement.save',
      dataSource: [],
      formData: {},
    }
  },
  created () {
    this.dataSource = Object.assign([], dataSource)
  },
  methods: {
    rendered () {
      if (this.row && this.row.length) {
        let that = this
        this.$api['knowledgeManagement.get']({ id: this.row[0].ID }).then(function (data) {
          that.formData = Object.assign({}, data)
        }).catch(function (error) {
          console.error(error)
        })
      }
      this.$api['formGenerator.getSelectionData']({selectCode: 'projectTypeTree1'}).then(res => {
        let treeData = []
        res.data.forEach(el => {
          treeData.push({id:el.ID,value: el.ID,label:el.NAME,pId: el.PARENTID})
        })
        treeData = generateTree(treeData, 'pId')
        this.dataSource[1].treeData = treeData
      })
    },
    saved (res) {
      this.$emit('close', res)
    },
    customValidate (saveParams) {
      this.$api['knowledgeManagement.saveCheck'](saveParams).then(res => {
        if (res.result) {
          this.$refs.form.submitForm(saveParams, this.saveApi)
        } else {
          this.$message({type: 'warning', message: res.resultMsg})
        }
      })
    }
  }
}
</script>
