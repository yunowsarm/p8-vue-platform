<template>
  <div>
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
                   :exist-default-btn="false"
                   :exist-custom-btn="true">
          <template #customBtn>
            <el-button type="primary"
                       @click="handleCancel">取消</el-button>
            <el-button type="primary"
                       @click="handleSubmit">保存</el-button>
          </template>
        </form-list>
      </template>
    </common-dialog>
  </div>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  name: 'AddTabs',
  components: {
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
      type: Array,
      default: () => {
        return []
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
        classifyId: '',
        label: ''
      },
      dataSource: [
        {
          type: 'treeSelect',
          labelText: '经验库分类',
          defaultValue: [],
          fieldName: 'classifyId',
          placeholder: '请选择项目类型',
          colLayout: 'singleCol',
          defaultExpandAll: true,
          optionUrl: {
            api: 'MyExperience.experienceClassifyTreeList',
            params: { isDisplay: 'yes' },
            value: 'id', // 树节点选中值
            label: 'name', // 树节点显示值
          },
          treeData: []
        },
        {
          type: 'text',
          labelText: '计划模板名称',
          fieldName: 'label',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  created () {
  },
  methods: {
    handleCancel () {
      this.$emit('handleCancel')
    },
    handleSubmit (e) {
      let that = this
      let ids = this.selectedTask.length ? this.selectedTask.map(item => item.id) : []
      that.$api['MyExperience.saveExperienceInfo']({ ...this.formData, type: 'createClassfy', projectTaskIds: ids }).then(res => {
        if (res === 'true') {
          this.$emit('handleCancel')
          that.$message.success('创建成功')
        } else {
          that.$message.error('创建失败')
        }
      }).then(err => {
        console.error(err + '错误信息')
      })
    }
  }
}
</script>
