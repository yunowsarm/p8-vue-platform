<template>
  <div style="height: 100%">
    <form-list ref="form" @rendered="rendered" @saved="saved" :data-source="dataSource" :api="saveApi" :form="modify">
      <template #icon>
        <div class="icon_box">
          <span :class="['icon_example', imageCt]" :style="{ color: iconColor }" @click="iconPopover = true"></span>
          <span class="link_box p8 icon-link" @click="iconPopover = true"></span>
        </div>
        <common-dialog
          title="图标选择"
          width="50%"
          v-if="iconPopover"
          :visible="iconPopover"
          :dialog-config="dialogConfig"
          :dialog-height="dialogHeight"
          @close="handleClose"
          @handle-cancel="handleClose"
          @handle-ok="handleClose"
        >
          <template #dialog>
            <icon-selector @icon-select="iconSelect" :selected-name="modify.icon" :color-picker="true"></icon-selector>
          </template>
        </common-dialog>
      </template>
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
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
    rowId: {
      type: String,
      default: ''
    }
  },
  watch: {
    'modify.dicType': {
      handler(to, from) {

        if (this.rowId && this.rowId !== '') {
          if (this.isModify) {
            this.modify.minorcode = to
          }
          this.isModify = true
        } else {
          this.modify.minorcode = to
        }
      }
    }
  },
  computed: {
    imageCt: function () {
      return this.modify.icon ? this.modify.icon : 'image-sel'
    },
    iconColor: function () {
      return this.modify.color ? this.modify.color : '#2196f3'
    }
  },
  data() {
    return {
      saveApi: 'dictionaryManagement.saveCategory',
      modify: { minorcode: '' },
      iconPopover: false,
      dialogConfig: {
        modal: false
      },
      dialogHeight: document.documentElement.clientHeight * 0.4,
      dataSource: [
        {
          type: 'text', // 控件类型
          fieldName: 'meaning',
          labelText: '分类名称',
          placeholder: '请输入分类名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入分类名称'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          fieldName: 'dicType',
          labelText: '英文代号',
          placeholder: '请输入英文代号',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入英文代号'
            },
            {
              validator: (rule, value, callback) => {
                let reg = new RegExp('^[_A-Za-z0-9]+$')
                if (reg.test(value)) {
                  this.$api['dictionaryManagement.repeatedCodeTypeCheck']({ id: this.rowId, dicType: value })
                    .then((res) => {
                      if (res.result) {
                        callback(new Error('英文代号已存在，请重新输入'))
                        return
                      }
                      callback()
                    })
                    .catch(function (error) {
                      console.log(error)
                    })
                } else {
                  callback(new Error('英文代号只可输入数字、字母、下划线'))
                }
              },
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          fieldName: 'minorcode',
          labelText: '分类编码',
          placeholder: '请输入分类编码',
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
          placeholder: '请选择图标',
          colLayout: 'singleCol'
        },
        {
          labelText: '主数据编码',
          type: 'text',
          colLayout: 'singleCol',
          fieldName: 'sourceDataNo',
          placeholder: '请输入主数据编码'
        },
        {
          type: 'number', // 控件类型
          fieldName: 'orderNo',
          labelText: '排序号',
          placeholder: '请输入排序号',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入排序号'
            }
          ]
        },
        {
          labelText: '用户可管理',
          type: 'radioButton',
          fieldName: 'isUserEnabled',
          colLayout: 'singleCol',
          options: [
            {
              value: '1',
              label: '是'
            },
            {
              value: '0',
              label: '否'
            }
          ],
          rules: [
            {
              required: true,
              message: '必须选择用户可管理'
            }
          ]
        },
        {
          labelText: '停用状态',
          type: 'radioButton',
          fieldName: 'isDelete',
          colLayout: 'singleCol',
          options: [
            {
              value: '0',
              label: '启用'
            },
            {
              value: '1',
              label: '停用'
            }
          ],
          rules: [
            {
              required: true,
              message: '必须选择停用状态'
            }
          ]
        },
        {
          labelText: '备注',
          type: 'textarea',
          colLayout: 'singleCol',
          fieldName: 'remark',
          fieldConfig: {
            rows: '4'
          }
        }
      ]
    }
  },
  methods: {
    rendered() {
      if (this.rowId && this.rowId !== '') {
        this.getProjectTeamSettingData(this.rowId)
      }
    },
    getProjectTeamSettingData(id) {
      let that = this
      that.$api['dictionaryManagement.getDictInfo']({ id: id })
        .then(function (res) {
          let data = null
          if (res) {
            data = res[0]
          }
          that.modify = Object.assign(data, {})
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    cancel() {
      this.$emit('cancel')
    },
    saved(res) {
      this.$emit('save-success', res)
    },
    handleClose() {
      this.iconPopover = false
    },
    iconSelect(select) {
      this.$set(this.modify, 'icon', select.icon)
      this.$set(this.modify, 'color', select.color)
    }
  }
}
</script>

<style scoped lang="scss">
.image-sel {
  background: url('~@/assets/image/common/image_blank.png') no-repeat;
  -moz-background-size: 22px 17px;
  background-size: 22px 17px;
  background-position: center;
}
.icon_example {
  display: block;
  width: 50px;
  height: 50px;
  line-height: 50px;
  font-size: 28px;
  text-align: center;
  color: #2196f3;
}
.icon_box {
  display: flex;
  align-items: center;
  width: 70px;
  height: 50px;
  border: 1px solid #cccccc;
  border-radius: 3px;
  .link_box {
    width: 20px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-left: 1px solid #cccccc;
  }
  .icon-link {
    font-size: 12px;
    color: #2196f3;
  }
}
</style>
