<template>
  <form-list ref="form" @rendered="rendered" @saved="saved":is-custom-validate="true"
             @custom-validate="customValidate" :data-source="dataSource" :api="saveApi" :form="modify" :other-param="otherParam">
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'DocumentEdit',
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
      saveApi: 'documentManagement.saveDocumentManagement',
      modify: {},
      otherParam: {},
      dataSource: [
        {
          type: 'text',
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
          type: 'textarea',
          fieldName: 'description',
          labelText: '文件描述',
          maxlength: '200',
          fieldConfig: {
            'show-word-limit': true
          },
          placeholder: '请输入文件描述',
          colLayout: 'singleCol'
        }
      ],
      type: ''
    }
  },
  mounted() {
    this.modify = Object.assign({}, this.record)
    if (this.record && Object.keys(this.record).length && this.record.name) {
      const parts = this.record.name.split('.')
      if (parts.length > 1) {
        this.modify.name = parts.slice(0, -1).join('.')
        this.type = parts[parts.length - 1]
      } else {
        this.modify.name = this.record.name
        this.type = ''
      }
    }
  },
  methods: {
    saved() {
      this.$emit('close')
    },
    cancel() {
      this.$emit('cancel')
    },
    rendered() {},
    customValidate (saveParmars) {
      saveParmars.name = saveParmars.name + (this.type ? '.' + this.type : '')
      this.$refs.form.submitForm(saveParmars, this.saveApi)
    }
  }
}
</script>

<style scoped></style>
