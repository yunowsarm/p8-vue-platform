<template>
  <common-dialog :title="title"
                 :visible="visible"
                 width="460px"
                 @close="handleCancel"
                 :show-handle-btn="false"
                 :dialog-height="180">
    <template #dialog>
      <form-list ref="form"
                 label-width="90px"
                 :data-source="dataSource"
                 :form="formData"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :exist-default-btn="false"
                 :exist-custom-btn="true">
        <template #customBtn>
          <el-button type="primary"
                     @click="handleCancel">取消</el-button>
          <el-button type="primary"
                     @click="handleSubmit">保存</el-button>
        </template>
      </form-list>
      <my-experience-base v-if="experienceBaseVisible"
                          :visible='experienceBaseVisible'
                          @handleCancel='closExperienceBase'
                          @exportExperienceBase='exportExperienceBase'></my-experience-base>
    </template>
  </common-dialog>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
import MyExperienceBase from './myExperienceBase.vue'
export default {
  name: 'AddTabs',
  components: {
    'my-experience-base': MyExperienceBase,
    FormList,
    CommonDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    selectedTask: {
      type: Object,
      default: () => {
        return {}
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      formData: {
        experienceBaseClassify: '',
        planTemplateName: ''
      },
      experienceBaseVisible: false,
      dataSource: [
        {
          type: 'text',
          labelText: '经验库分类',
          fieldName: 'experienceBaseClassify',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '计划模板名称',
          fieldName: 'planTemplateName',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  created () {
  },
  methods: {
    closExperienceBase () {
      this.experienceBaseVisible = false
    },
    exportExperienceBase () {
      console.log("This is export")
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    customValidate (saveParams) {
      this.$emit('handleOk')
    },
    handleSubmit (e) {
      console.log(e, 'eeeeee');
      this.experienceBaseVisible = true
      this.$refs.form.handleSubmit(e)
    }
  }
}
</script>
