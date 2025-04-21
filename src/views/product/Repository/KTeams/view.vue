<template>
  <form-list ref="form"
              @rendered="rendered"
              :form="formData"
              :existDefaultBtn="false"
              :dataSource="dataSource">
  </form-list>
</template>

<script>

import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
let dataSource = [
  {
    type: 'view',
    labelText: '团队名称',
    fieldName: 'name',
    colLayout: 'singleCol',
  },
  {
    type: 'view',
    labelText: '项目类型',
    fieldName: 'projectClassifyName',
    colLayout: 'singleCol',
  },
  {
    type: 'view',
    labelText: '排序号',
    fieldName: 'indexNo',
    colLayout: 'singleCol',
  },
  {
    type: 'view',
    labelText: '默认团队',
    fieldName: 'isDefaultDisplay',
    colLayout: 'singleCol',
  },
  {
    type: 'view',
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
      dataSource: [],
      formData: {},
    }
  },
  created () {
    this.dataSource = Object.assign([], dataSource)
  },
  methods: {
    rendered () {
      if (this.row[0].ID) {
        let that = this
        this.$api['knowledgeManagement.get']({ id: this.row[0].ID }).then(function (data) {
          that.formData = Object.assign({}, data)
        }).catch(function (error) {
          console.error(error)
        })
      }
    }
  }
}
</script>
