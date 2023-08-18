<template>
  <div style="height: 100%">
    <form-list ref="form"
               @rendered="rendered"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :form="modify">
      <template #icon>
        <el-input @click.native="iconPopover = true"
                  v-model="modify.icon"
                  placeholder="请选择图标"></el-input>
        <common-dialog title="图标选择"
                       width="50%"
                       v-if="iconPopover"
                       :visible="iconPopover"
                       :dialog-config="dialogConfig"
                       :dialog-height="dialogHeight"
                       @close="handleClose"
                       @handle-cancel="handleClose"
                       @handle-ok="handleClose">
          <template #dialog>
            <icon-selector @icon-select="iconSelect"
                           :selected-name="modify.icon"
                           :color-picker="true"></icon-selector>
          </template>
        </common-dialog>
      </template>
    </form-list>
  </div>
</template>

<script>
import { P8Form as FormList, P8IconSelector as IconSelector, P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  name: 'ExternalLinksEdit',
  components: {
    FormList,
    IconSelector,
    CommonDialog
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      saveApi: 'extLink.save',
      modify: { params: [], icon: '' },
      iconPopover: false,
      dialogConfig: {
        modal: false
      },
      dialogHeight: document.documentElement.clientHeight * 0.4,
      dataSource: [
        {
          type: 'text', // 控件类型
          fieldName: 'title',
          labelText: '名称',
          placeholder: '请输入名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入名称'
            }
          ]
        },
        {
          type: 'blank', // 控件类型
          fieldName: 'icon',
          slotName: 'icon',
          labelText: '图标',
          placeholder: '请输入图标',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入图标'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          fieldName: 'url',
          labelText: '链接地址url',
          placeholder: '请输入链接地址url',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入名称'
            }
          ]
        },
        {
          labelText: '是否启用',
          type: 'radio',
          colLayout: 'singleCol',
          fieldName: 'isEnabled',
          rules: [
            {
              required: true,
              message: '必须输入名称'
            }
          ],
          options: [
            {
              label: '启用',
              value: '1'
            },
            {
              label: '禁用',
              value: '0'
            }
          ]
        },
        {
          type: 'number', // 控件类型
          fieldName: 'indexNo',
          labelText: '排序号',
          placeholder: '请输入排序号',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入名称'
            }
          ]
        },
        {
          labelText: '用户角色',
          type: 'multiple',
          fieldName: 'roles',
          optionUrl: {
            api: 'userManager.getAllRoles'
          },
          options: [],
          colLayout: 'singleCol'
        },
        {
          labelText: '参数',
          type: 'addField',
          colLayout: 'singleCol',
          fieldName: 'params',
          children: [
            {
              type: 'text',
              fieldName: 'keys',
              placeholder: '请输入key',
              colLayout: 'doubleCol'
            },
            {
              type: 'text',
              fieldName: 'value',
              placeholder: '请输入value',
              colLayout: 'doubleCol'
            }
          ]
        }
      ]
    }
  },
  methods: {
    rendered () {
      if (this.id && this.id !== '') {
        this.getProjectTeamSettingData(this.id)
      }
    },
    getProjectTeamSettingData (id) {
      let that = this
      that.$api['extLink.details']({ id: id })
        .then(function (res) {
          let data = res
          that.modify = Object.assign(data, {})
          if (!data.params) {
            that.modify.params = []
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    saved (res) {
      this.$emit('save-success', res)
    },
    handleClose () {
      this.iconPopover = false
    },
    iconSelect (select) {
      this.$set(this.modify, 'icon', select.icon)
    }
  }
}
</script>
