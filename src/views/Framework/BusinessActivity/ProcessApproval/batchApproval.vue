<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template class="batch-approval">
  <el-dialog title="批量审批"
             :visible.sync="dialogVisible"
             width="40%"
             :before-close="close"
             :modal="false"
             :close-on-click-modal="false">
    <form-list ref="form"
               :data-source="dataSource"
               :api="saveApi"
               :form="formData"
               :exist-default-btn="false"
               @form-data-change="formDataChange"></form-list>
    <div slot="footer"
         class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary"
                 @click="commitApproval">提交审批</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'BatchApproval',
  components: {
    FormList
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    selection: {
      type: Array,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: []
    },
    dataSource: {
      type: Array,
      default: () => {
        return [
          {
            type: 'radio', // 控件类型
            labelText: '审批结果', // 控件显示的文本
            fieldName: 'approvalResult',
            options: [
              {
                label: '通过',
                value: '1'
              },
              {
                label: '驳回',
                value: '0'
              }
            ],
            rules: [
              {
                required: true,
                message: '必填'
              }
            ]
          },
          {
            type: 'textarea',
            labelText: '审批意见',
            fieldName: 'approvalComment',
            placeholder: '请输入审批意见'
          }
        ]
      }
    }
  },
  created () {
    if (this.selection.length === 0) {
      this.close()
    }
  },
  data () {
    return {
      isCustomValidate: true,
      formData: {
        taskIds: [],
        processInstance: [],
        approvalResult: this.dataSource[0].options.length === 1 ? '1' : '', // 审批结果
        approveData: {},
        businessKey: '',
        approvalComment: '' // 审批意见
      },
      saveApi: 'PersonalProcessApproval.batchSaveResult',
      msg: ''
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    formDataChange (formSub) {
      let formData = formSub.formData
      if (formData.approvalResult === '0') {
        this.msg = '驳回'
      }
      if (formData.approvalResult === '1') {
        this.msg = '通过'
      }
      if (formData.approvalResult === '0' && (!this.formData.approvalComment || this.formData.approvalComment === this.$store.state.project.baseConfig.defaultCommentYes)) {
        this.formData.approvalComment = this.$store.state.project.baseConfig.defaultCommentNo
      }
      if (formData.approvalResult === '1' && (!this.formData.approvalComment || this.formData.approvalComment === this.$store.state.project.baseConfig.defaultCommentNo)) {
        this.formData.approvalComment = this.$store.state.project.baseConfig.defaultCommentYes
      }
    },
    commitApproval () {
      let that = this
      if (!this.formData.approvalResult) {
        this.$message({ message: '请选择审批结果', type: 'warning' })
        return
      }
      that
        .$confirm(`确定批量${that.msg}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          let params = that.selection.map((res) => {
            console.log(res, 'businessKeybusinessKeybusinessKey')
            return {
              taskId: res.processTaskId,
              businessKey: res.businessKey,
              processInstance: res.processInstId,
              processKey: res.processKey,
              approvalComment: this.formData.approvalComment,
              approvalResult: that.formData.approvalResult
            }
          })
          this.$emit('reSearchTableData')
          that.saveForm({ list: params }).then((res) => {
            that.close()
            that.$message.success(res.message)
          })
        })
        .catch((res) => {
          that.close()
        })
    },
    saveForm (params) {
      let that = this
      let loading = that.$loading({
        text: '加载中...'
      })
      return new Promise((resolve, reject) => {
        that.$api[that.saveApi](params)
          .then(function (res) {
            resolve(res)
            loading.close()
            that.close()
          })
          .catch(function (error) {
            loading.close()
            reject(error)
            that.close()
          })
      })
    }
  }
}
</script>
<style lang="scss">
.batch-approval {
}
</style>
