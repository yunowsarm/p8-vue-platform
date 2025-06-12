<template>
  <div style="height: 100%">
    <form-list ref="form"
               @rendered="rendered"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :form="modify"
               :is-custom-validate="true"
               @custom-validate="customValidate">
      <template #icon>
        <div class="icon_box">
          <span :class="['icon_example', imageCt]"
                :style="{ color: iconColor }"
                @click="iconPopover = true"></span>
          <span class="link_box p8 icon-link"
                @click="iconPopover = true"></span>
        </div>
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
                           :selected-color="modify.color"
                           :color-picker="true"></icon-selector>
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
    },
    treeId: {
      type: String,
      default: ''
    },
    record: {
      type: Object,
      default: () => { }
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
  data () {
    return {
      saveApi: 'dictionaryManagement.saveDict',
      modify: { dictCategoryId: this.treeId, color: '' },
      iconPopover: false,
      dialogConfig: {
        modal: false
      },
      dialogHeight: document.documentElement.clientHeight * 0.4,
      dataSource: [
        {
          type: 'treeSelect',
          fieldName: 'dictCategoryId',
          labelText: '所属分类',
          colLayout: 'singleCol',
          disabledValues: ['0'],
          defaultExpandAll: true,
          optionUrl: {
            api: 'dictionaryManagement.dictCategoryTree',
            params: {}
          },
          rules: [
            {
              required: true,
              message: '必须输入名称'
            }
          ]
        },
        {
          type: 'treeSelect', // 控件类型
          fieldName: 'parentId',
          labelText: '所属父选项',
          clearable: true,
          colLayout: 'singleCol',
          options: []
        },
        {
          type: 'text', // 控件类型
          fieldName: 'meaning',
          labelText: '选项名称',
          placeholder: '请输入选项名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入选项名称'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          fieldName: 'minorcode',
          labelText: '字典编码',
          placeholder: '请输入字典编码',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入字典编码'
            },
            {
              validator: (rule, value, callback) => {
                this.$api['dictionaryManagement.repeatedMinorCodeCheck']({ id: this.rowId, dictCategoryId: this.modify.dictCategoryId, minorcode: value })
                  .then((res) => {
                    if (res.result) {
                      callback(new Error('字典编码已存在，请重新输入'))
                      return
                    }
                    callback()
                  })
                  .catch(function (error) {
                    console.log(error)
                  })
              },
              trigger: 'blur'
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
              message: '必须输入名称'
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
              message: '必须输入名称'
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
      ],
      count: 0
    }
  },
  watch: {
    'modify.dictCategoryId': {
      handler (to, from) {
        this.getOptions()
        this.getMinorcode()
      }
    },
    'modify.parentId': {
      handler (to, from) {
        this.getMinorcode()
      }
    }
  },
  methods: {
    rendered () {
      if (this.rowId && this.rowId !== '') {
        this.getProjectTeamSettingData(this.rowId)
        // 当修改时不可对所属分类进行修改
        let index = this.dataSource.findIndex((el) => el.fieldName == 'dictCategoryId')
        this.dataSource[index].disabled = true
        let parentIdIndex = this.dataSource.findIndex((el) => el.fieldName == 'parentId')
        if (this.record && this.record.child) {
          // 当修改的节点是父节点时，所属父选项不可修改
          this.dataSource[parentIdIndex].disabled = true
        } else {
          // 当修改的节点是子节点时，所属父选项不可选当前节点
          this.dataSource[parentIdIndex].disabledValues = [this.rowId]
        }
      } else {
        this.getMinorcode()
      }
      this.getOptions()
    },
    getProjectTeamSettingData (id) {
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
    cancel () {
      this.$emit('cancel')
    },
    saved (res) {
      this.$emit('save-success', res)
    },
    handleClose () {
      this.iconPopover = false
    },
    iconSelect (select) {
      this.$set(this.modify, 'icon', select.icon)
      this.$set(this.modify, 'color', select.color)
    },
    getOptions () {
      let that = this
      this.$api['dictionaryManagement.dictTree']({ dictCategoryId: this.modify.dictCategoryId }).then((res) => {
        res.forEach((el) => {
          if (el.pId) {
            el.pId = null
          }
        })
        that.$set(that.dataSource[1], 'treeData', res)
      })
    },
    getMinorcode () {
      let that = this
      if (this.rowId && this.rowId !== '') {
        if (this.count > 0) {
          this.$api['thirdPartInterface.genMinorCode']({ dictCategoryId: this.modify.dictCategoryId, parentId: this.modify.parentId }).then((res) => {
            that.$set(that.modify, 'minorcode', res)
          })
        }
      } else {
        this.$api['thirdPartInterface.genMinorCode']({ dictCategoryId: this.modify.dictCategoryId, parentId: this.modify.parentId }).then((res) => {
          that.$set(that.modify, 'minorcode', res)
        })
      }
      this.count = 1
    },
    customValidate (saveParams) {
      this.saveParams = saveParams
      this.$api[this.saveApi](this.saveParams).then((res) => {

        if (res.resultMsg) {
          this.$message({ type: 'warning', message: res.resultMsg })
        } else {
          this.$emit('save-success', res)
          this.$message.success("保存成功")
        }
      })
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
