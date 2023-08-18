<template>
  <form-list ref="form" @saved="saved" :api="saveApi" :data-source="dataSource" :form="formData"></form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'SecretLevelEdit',
  components: {
    FormList
  },
  props: {
    record: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const dataSource = [
      {
        type: 'text',
        labelText: '名称',
        fieldName: 'meaning',
        defaultValue: '',
        fieldConfig: {
          disabled: false
        },
        rules: [
          {
            required: true,
            message: '必填'
          },
          {
            validator: (rule, value) => {
              let that = this
              return new Promise((resolve, reject) => {
                that.$api['secretLevel.repeatedCheck']({ id: that.record.id, meaning: value }).then((response) => {
                  if (response.result) {
                    reject(response.resultMsg)
                  } else {
                    resolve()
                  }
                })
              })
            }
          }
        ]
      },
      {
        type: 'number',
        labelText: '等级',
        fieldName: 'orderNo',
        colLayout: 'doubleCol',
        defaultValue: 0,
        fieldConfig: {
          disabled: false
        },
        rules: [
          {
            required: true,
            message: '必填'
          }
        ]
      },
      {
        type: 'select',
        labelText: '对应人员密级',
        fieldName: 'sysuserSecretLevelId',
        optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'USER_LEVEL' } },
        defaultValue: '',
        fieldConfig: {
          disabled: false
        },
        options: []
      }
    ]
    return {
      saveApi: 'secretLevel.save',
      dataSource: dataSource,
      formData: {
        id: null,
        meaning: null,
        orderNo: null,
        sysuserSecretLevelId: null,
        sysuserSecretLevelName: null
      }
    }
  },
  mounted() {},
  watch: {
    record: {
      handler: function (val) {
        if (Object.keys(val).length) {
          this.getSecret(val.id)
        } else {
          Object.keys(this.formData).forEach((key) => {
            this.formData[key] = null
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    rendered() {
      // if (this.record && this.record.id) {
      //   this.getSecret(this.record.id)
      // }
    },
    getSecret(secretId) {
      this.$api['secretLevel.getSecret']({ id: secretId })
        .then((res) => {
          let { id, meaning, orderNo, sysuserSecretLevelId, sysuserSecretLevelName } = res
          this.formData = { id, meaning, orderNo, sysuserSecretLevelId, sysuserSecretLevelName }
          console.log('----FormData---', this.formData)
        })
        .catch(function (error) {
          console.log('error' + error)
        })
    },
    saved(res) {
      this.$emit('saveSuccess', res)
    }
  }
}
</script>
