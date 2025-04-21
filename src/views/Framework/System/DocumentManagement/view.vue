<template>
  <form-list ref="form" @rendered="rendered" @saved="saved" :data-source="dataSource" :api="saveApi" :form="modify" :other-param="otherParam" :exist-default-btn="false">
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'DocumentView',
  props: {
    record: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    FormList
  },
  data() {
    return {
      saveApi: '',
      modify: {},
      otherParam: {},
      dataSource: [
        {
          type: 'view',
          labelText: '文件名称',
          fieldName: 'name',
          placeholder: '请输入文件名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '上传人',
          fieldName: 'createUserName',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          fieldName: 'description',
          labelText: '文件描述',
          colLayout: 'doubleCol'
        }
      ]
    }
  },
  mounted() {
    this.modify = Object.assign({}, this.record)
  },
  methods: {
    saved() {
      this.$emit('editSaveOK')
    },
    cancel() {
      this.$emit('cancel')
    },
    rendered() {}
  }
}
</script>

<style scoped></style>
