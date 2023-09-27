<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog :title="childNodeSettingsTitle"
                 :visible="visible"
                 :show-handle-btn="false"
                 :dialog-config="dialogConfig"
                 width="30%"
                 @close="handleCancel"
                 :dialog-height="dialogHeight">
    <template #dialog>
      <form-list ref="form"
                 label-width="100px"
                 :data-source="dataSource"
                 :form="formData"
                 :is-custom-validate="isCustomValidate"
                 @custom-validate="customValidate">
        <template #otherParmarsMap>
          <ace-edit :value.sync="formData.otherParmarsMap"
                    width="100%"
                    height="200px"></ace-edit>
        </template>
        <template #componentsUrl>
          <el-input @click.native="visibleEditDrawer = true"
                    :readonly="true"
                    v-model="formData.componentsName"
                    placeholder="请选择目标组件"></el-input>
        </template>
      </form-list>
      <select-components v-if="visibleEditDrawer"
                         :visible="visibleEditDrawer"
                         @close="visibleEditDrawer = false"
                         @handleOk="componentsHandleOk"></select-components>
    </template>
  </common-dialog>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
import aceEdit from '@/views/Framework/ComponentsMananger/Base/Components/ace'
import selectComponents from '@/views/Framework/ComponentsMananger/Components/selectComponents.vue'
export default {
  name: 'ChildNodeSettings',
  components: {
    FormList,
    CommonDialog,
    aceEdit,
    selectComponents
  },
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    treeSettingsParmars: {
      type: Object,
      default: () => {
        return {}
      }
    },
    childNodeParmars: {
      type: Object,
      default: () => {
        return {}
      }
    },
    childNodeSettingsTitle: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      saveApi: 'PersonalProcessApproval.setApproveUser',
      isCustomValidate: true,
      formData: { otherParmarsMap: '' },
      dialogHeight: 500,
      dialogConfig: {
        modal: false
      },
      visibleEditDrawer: false,
      dataSource: [
        {
          type: 'view',
          labelText: '父节点',
          fieldName: 'parentName',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '节点名称',
          fieldName: 'label',
          placeholder: '请输入节点名称',
          colLayout: 'singleCol'
        },
        {
          type: 'radioButton',
          labelText: '切换组件类型',
          fieldName: 'componentsType',
          placeholder: '下拉选择',
          colLayout: 'singleCol',
          options: [
            {
              label: '自定义',
              value: '0'
            },
            {
              label: '内部',
              value: '1'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '目标组件',
          fieldName: 'componentsUrl',
          slotName: 'componentsUrl',
          placeholder: '请输入组件地址',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '其他参数',
          slotName: 'otherParmarsMap',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  watch: {
    'formData.componentsType': {
      handler (newAal) {
        if (newAal === '0') {
          this.dataSource.forEach((el) => {
            if (el.fieldName === 'componentsUrl') {
              el.type = 'textarea'
            }
          })
        } else {
          this.dataSource.forEach((el) => {
            if (el.fieldName === 'componentsUrl') {
              el.type = 'blank'
            }
          })
        }
      }
    }
  },
  mounted () {
    if (this.childNodeSettingsTitle === '新建子节点') {
      this.formData.parentName = this.childNodeParmars.label
      this.formData.parentId = this.childNodeParmars.id
      this.formData.id = new Date().getTime() + ''
    } else {
      this.formData = { ...this.childNodeParmars }
    }
    // 导航模式 1：参数传递   0：组件切换
    if (this.treeSettingsParmars.navigationPattern === '1') {
      let index = this.dataSource.findIndex((v) => v.labelText === '切换组件类型')
      if (index !== -1) {
        this.dataSource.splice(index, 2)
      }
    }
  },
  methods: {
    customValidate (saveParams) {
      this.$emit('handleOk', this.formData)
    },
    handleCancel () {
      this.$emit('close-modal')
    },
    componentsHandleOk (selectLayout) {
      this.formData.componentsName = selectLayout.name
      this.formData.componentsConfig = selectLayout
      this.visibleEditDrawer = false
    }
  }
}
</script>

<style scoped></style>
