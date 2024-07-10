<template>
  <div class="form">
    <P8Form ref="form"
            :comp="comp"
            label-width="120px"
            :existDefaultBtn="false"
            :existCustomBtn='true'
            :data-source="dataSource"
            :api="saveApi"
            @saved="saved"
            :form="formData">
      <template #message>
        <quill-editor class="quill_editor"
                      v-model="formData.content"
                      ref="myQuillEditor"
                      :options="editorOption"> </quill-editor>
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
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
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
  data () {
    return {
      comp: this,
      editorOption: {
        placeholder: '请输入'
      },
      saveApi: 'planGanttManager.pushPlanMssage',
      isCustomValidate: true,
      // taskSecretLevel: '',
      formData: {
        planInfoId: this.planInfoId,
        type: '',
        // secretLevel: '',
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
          ],
          eventHandle: {
            change: 'userChangeHandle'
          }
        },
        // {
        //   type: 'select',
        //   labelText: '密级',
        //   fieldName: 'secretLevel',
        //   colLayout: 'doubleCol',
        //   optionUrl: {
        //     api: 'thirdPartInterface.getDic',
        //     params: { dicType: 'SECRET_LEVEL' }
        //   },
        //   options: [],
        //   eventHandle: {
        //     change: 'secretLevelChangeHandle'
        //   }
        // },
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
  created () {
    const ganttObject = GanttObject.getGanttObject(this.ganttName)
    let task = null
    if (this.taskId) {
      task = ganttObject.getTask(this.taskId)
    } else {
      ganttObject.eachTask(function (item) {
        if (ganttObject.getGlobalTaskIndex(item.id) === 0) {
          task = item
        }
      })
    }
    // this.taskSecretLevel = task.secretGrade
  },
  mounted() {
    const toolbar = this.$refs.myQuillEditor.quill.getModule('toolbar');
    toolbar.addHandler('image', this.imageHandler);
  },
  methods: {
    imageHandler() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = () => {
        const file = input.files[0];
        const maxSize = 5 * 1024 * 1024; // 5 MB

        if (file.size > maxSize) {
          alert('图片大小不能超过 5 MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const range = this.$refs.myQuillEditor.quill.getSelection();
          this.$refs.myQuillEditor.quill.insertEmbed(range.index, 'image', e.target.result);
        };
        reader.readAsDataURL(file);
      };
    },
    // secretLevelChangeHandle(val) {
    //   if (val > this.taskSecretLevel) {
    //     this.$message({
    //       type: 'warning',
    //       message: '密级不可高于任务密级！'
    //     })
    //     this.formData.secretLevel = ''
    //   }
    // },
    userChangeHandle (val) {
      if (val === '2' && !this.taskId) {
        this.$message({
          type: 'warning',
          message: '当前无选中任务！'
        })
        this.formData.type = ''
      }
    },
    saved (params) {
      if (params) {
        this.$emit('close')
      }
    },
    handleSubmit (e) {
      this.$refs.form.handleSubmit(e)
    },
    cancel () {
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
