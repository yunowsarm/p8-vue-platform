<template>
  <div class="form">
    <P8Form
      ref="form"
      :comp="comp"
      label-width="120px"
      :existDefaultBtn="false"
      :existCustomBtn='true'
      :data-source="dataSource"
      :api="saveApi"
      @saved="saved"
      :form="formData">
      <template #message>
        <quill-editor class="quill_editor" v-model="formData.content" ref="myQuillEditor" :options="editorOption"> </quill-editor>
      </template>
      <template #customBtn>
        <el-button size="mini"
                   @click="cancel">取 消</el-button>
        <el-button type="primary"
                   size="mini"
                   @click="handleSubmit">确 定</el-button>
      </template>
    </P8Form>
  </div>
</template>

<script>
import { P8Form } from 'p8-components-ui'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'
export default {
  name: 'NoticeMsg',
  components: { P8Form, quillEditor },
  props: {
    planInfoId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    ganttName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      comp: this,
      editorOption: {
        placeholder: '请输入'
      },
      saveApi: 'planGanttManager.pushPlanMssage',
      isCustomValidate: true,
      formData: {
        planInfoId: this.planInfoId,
        type: '',
        secretLevel: '',
        content: '',
        taskIds: [this.taskId]
      },
      dataSource: [
        {
          type: 'select', // 控件类型
          labelText: '通知范围', // 控件显示的文本
          fieldName: 'type',
          colLayout: 'doubleCol',
          options: [
            {
              label: '所有团队成员',
              value: '0'
            },
            {
              label: '所有任务责任人',
              value: '1'
            },
            {
              label: '已选择任务的责任人',
              value: '2'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '',
          fieldName: 'message',
          slotName: 'message',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  created() {},
  methods: {
    saved(params) {
      if (params) {
        this.$emit('close')
      }
    },
    handleSubmit(e) {
      this.$refs.form.handleSubmit(e)
    },
    cancel() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.form {
  height: 100%;
}
.quill_editor {
  height: 400px;
}
</style>
