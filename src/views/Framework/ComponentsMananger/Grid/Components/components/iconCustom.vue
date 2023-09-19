<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="设置图标"
                 :visible="visible"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 width="60%"
                 @close="handleCancel"
                 :dialog-height="300">
    <template #dialog>
      <form-list ref="form"
                 :data-source="dataSource"
                 :form="formData"
                 :exist-default-btn="false"
                 label-width="100px">
        <template #icon>
          <span :class="['icon_example', imageCt]"
                :style="{ color: iconColor }"
                @click="iconPopover = true"></span>
          <common-dialog title="图标选择"
                         width="50%"
                         v-if="iconPopover"
                         :visible="iconPopover"
                         :dialog-config="dialogConfig"
                         :dialog-height="dialogHeight"
                         @close="handleClose"
                         @handle-cancel="handleClose"
                         @handle-ok="doIconSelect">
            <template #dialog>
              <icon-selector @icon-select="iconSelect"
                             :color-picker="true"></icon-selector>
            </template>
          </common-dialog>
        </template>
      </form-list>
    </template>
  </common-dialog>
</template>
<script>
import { P8Form as FormList, P8Dialog as CommonDialog, P8IconSelector as IconSelector } from 'p8-components-ui'
export default {
  components: {
    CommonDialog,
    FormList,
    IconSelector
  },
  name: '',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dataList: {
      type: Array,
      default: () => {
        return []
      }
    },
    modifyRecord: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data: function () {
    let dataSource = [
      {
        type: 'radioButton',
        labelText: '是否数据字典',
        fieldName: 'isDataDic',
        placeholder: '下拉选择',
        colLayout: 'doubleCol',
        rules: [
          {
            required: true
          }
        ],
        options: [
          {
            label: '是',
            value: '1'
          },
          {
            label: '否',
            value: '0'
          }
        ]
      }
    ]
    return {
      dialogHeight: 400,
      iconPopover: false,
      iconTempSel: null,
      dialogConfig: {
        modal: false
      },
      formData: {
        isDataDic: '',
        icon: '',
        color: ''
      },
      dataSource: dataSource,
      dataSource1: [
        {
          type: 'radioButton',
          labelText: '是否数据字典',
          fieldName: 'isDataDic',
          placeholder: '下拉选择',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            }
          ],
          options: [
            {
              label: '是',
              value: '1'
            },
            {
              label: '否',
              value: '0'
            }
          ]
        },
        {
          type: 'select',
          labelText: '判断字段',
          fieldName: 'columns',
          placeholder: '请选择',
          colLayout: 'doubleCol',
          options: this.dataList,
          rules: [{ required: true }]
        },
        {
          type: 'treeSelect',
          labelText: '选择数据字典',
          fieldName: 'dataDic',
          defaultExpandAll: true,
          disabledValues: ['0'],
          placeholder: '下拉选择',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            }
          ],
          treeData: []
        }
      ],
      dataSource2: [
        {
          type: 'radioButton',
          labelText: '是否数据字典',
          fieldName: 'isDataDic',
          placeholder: '下拉选择',
          colLayout: 'doubleCol',
          rules: [{ required: true, message: '必填' }],
          options: [
            {
              label: '是',
              value: '1'
            },
            {
              label: '否',
              value: '0'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '图标选择',
          slotName: 'icon',
          fieldName: 'icon',
          colLayout: 'doubleCol',
          rules: [{ required: true, trigger: ['blur', 'change'], message: '必填' }]
        },
        {
          type: 'select',
          labelText: '判断字段',
          fieldName: 'columns',
          placeholder: '请选择',
          colLayout: 'doubleCol',
          options: this.dataList,
          rules: [{ required: true, message: '必填' }]
        },
        {
          type: 'text',
          labelText: '判断值',
          fieldName: 'condition',
          placeholder: '请输入',
          colLayout: 'doubleCol',
          rules: [{ required: true, message: '必填' }]
        },
        {
          type: 'text',
          labelText: '悬浮显示',
          fieldName: 'message',
          placeholder: '请输入',
          colLayout: 'doubleCol',
          rules: [{ required: true, message: '必填' }]
        }
      ]
    }
  },
  computed: {
    imageCt: function () {
      return this.formData.icon ? this.formData.icon : 'image-sel'
    },
    iconColor: function () {
      return this.formData.color ? this.formData.color : '#2196f3'
    }
  },
  watch: {
    'formData.isDataDic': {
      handler (val) {
        if (val == '1') {
          this.dataSource = this.dataSource1
          this.getTreeData()
        } else {
          this.dataSource = this.dataSource2
        }
      }
    }
  },
  created () {
    console.log(this.modifyRecord, '---modifyRecord--')
    if (this.modifyRecord) {
      this.formData = Object.assign({}, this.modifyRecord)
    }
  },
  methods: {
    handleOk () {
      let that = this
      this.$refs.form.validate().then((queryParams) => {
        that.dataList.forEach((el) => {
          if (that.formData.columns === el.value) {
            that.formData.columnsName = el.label
          }
        })
        if (this.dataDicList && this.dataDicList[0] && this.dataDicList[0].children) {
          this.dataDicList[0].children.forEach((el) => {
            if (that.formData.dataDic === el.value) {
              that.formData.dataDicDisplay = el.label
            }
          })
        }
        that.$emit('handleOk', that.formData)
      })
    },
    handleCancel () {
      this.$emit('close')
    },
    handleClose () {
      this.iconTempSel = null
      this.iconPopover = false
    },
    iconSelect (select) {
      this.iconTempSel = select
    },
    doIconSelect () {
      if (this.iconTempSel) {
        this.formData.icon = this.iconTempSel.icon
        this.formData.color = this.iconTempSel.color
        this.formData = Object.assign({}, this.formData)
      }
      this.handleClose()
    },
    getTreeData () {
      this.$api['dictionaryManagement.dictCategoryTree']({}).then((res) => {
        if (res[0] && res[0].children && res[0].children.length > 0) {
          res[0].children.forEach((el) => {
            el.value = el.layersParams.dicType
          })
        }
        this.dataDicList = res
        console.log(res, '===res')
        this.dataSource.forEach((el) => {
          if (el.fieldName === 'dataDic') {
            el.treeData = res
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.image-sel {
  background: url('~@/assets/image/common/image_blank.png');
  -moz-background-size: 100% 100%;
  background-size: 100% 100%;
}
.icon_example {
  display: block;
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  font-size: 28px;
  text-align: center;
  line-height: 40px;
  color: #2196f3;
}
</style>
