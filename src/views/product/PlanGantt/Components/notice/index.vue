<template>
  <div class="form">
    <P8Form ref="form"
            :comp="comp"
            label-width="120px"
            :existDefaultBtn="false"
            :existCustomBtn='true'
            :data-source="dataSource"
            :isShouEnter="false"
            :api="saveApi"
            @saved="saved"
            :form="formData">
      <template #message>
        <P8Tinymce v-model="formData.content" :editorConfig="{height: '400px'}" />
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
import { P8Form, P8Tinymce } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'

export default {
  name: 'NoticeMsg',
  components: { P8Form, P8Tinymce },
  props: {
    planInfoId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    selectedTasks:{
      type: Array,
      default:() => []
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
      title:'',
      saveApi: 'planGanttManager.pushPlanMssage',
      isCustomValidate: true,
      // taskSecretLevel: '',
      formData: {
        planInfoId: this.planInfoId,
        type: '',
        title:'',
        // secretLevel: '',
        content: '',
        taskIds: []
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
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: '通知标题',
          fieldName: 'title',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
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
          labelText: '通知内容',
          fieldName: 'message',
          slotName: 'message',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  created () {
    if(this.selectedTasks.length > 0){
      const task = this.selectedTasks[0]
      this.title = `项目【${task.wholeName}】`
      this.formData.taskIds = this.selectedTasks.map(item => item.id)
    }else{
      this.formData.title = this.title
    }
  },
  watch:{
    title(val){
      this.formData.title = `${val}通知下发消息`
    }
  },
  mounted() {
  },
  methods: {
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
      const task = this.selectedTasks[0]
      const havaOwnerId =this.selectedTasks.find(t => !t.owner_id)
      console.log(havaOwnerId)
      if (val === '2' && !this.selectedTasks.length) {
        this.$message({
          type: 'warning',
          message: '当前无选中任务！'
        })
        this.formData.type = ''
      }
      if (val === '2' && this.selectedTasks.length && havaOwnerId) {
        this.$message({
          type: 'warning',
          message: '选中任务中存在未设置责任人！'
        })
        this.formData.type = ''
      }
      switch (val) {
        case '0':
          this.title = `项目【${task.wholeName}】`;
          break;
        case '1':
          this.title = `项目【${task.wholeName}】-计划【${task.planName}】`
          break;
        case '2':
          if(this.selectedTasks.length === 1){
            this.title = `项目【${task.wholeName}】-计划【${task.planName}】-任务【${task.name}】`;
          }else{
            this.title = `项目【${task.wholeName}】-计划【${task.planName}】-任务【${task.name}】等多条任务`;
          }
          break;
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
</style>
