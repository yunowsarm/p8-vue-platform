<template>
  <div>
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
          @handle-ok="handleOk"
        >
          <template #dialog>
            <icon-selector @icon-select="iconSelect" :selected-name="select?.icon || modify.icon" :selectedColor="select?.color || modify.color" :color-picker="true"></icon-selector>
          </template>
        </common-dialog>
      </template>
    </form-list>
  </div>
</template>
<script>
import { P8Form as FormList, P8Dialog as CommonDialog, P8IconSelector as IconSelector } from 'p8-components-ui'

export default {
  name: 'PlanLogoEdit',
  components: {
    FormList,
    CommonDialog,
    IconSelector
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    record: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      select:{},
      saveApi: 'PlanMonitor.savePlanLogo',
      radioType: null,
      dataSource: [
        {
          type: 'text',
          fieldName: 'numbers',
          labelText: '标识编号',
          placeholder: '请输入标识编号',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入标识编号'
            }
          ]
        },
        {
          type: 'text',
          fieldName: 'name',
          labelText: '标识名称',
          placeholder: '请输入标识名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必须输入标识名称'
            }
          ]
        },
        {
          type: 'blank',
          slotName: 'icon',
          fieldName: 'icon',
          labelText: '图标',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必填',
              trigger: 'change'
            },
            {
              validator: (rule, value, callback, source, options) => {
                const that = this
                return this.$api['PlanMonitor.checkName']({ id: that.id, name: value }).then((res) => {
                  if (res === 'accept') {
                    return true
                  } else {
                    this.$message({ message: `标识名称已被使用！`, type: 'error' })
                    return false
                  }
                })
              },
              trigger: 'blur'
            }
          ]
        },
        {
          labelText: '排序号',
          type: 'number',
          fieldName: 'indexNo',
          placeholder: '请输入排序号',
          colLayout: 'doubleCol'
        },
        {
          type: 'radioButton',
          labelText: '时间控制', // 提示信息：“时间控制”为开启状态时，该标识在任务中使用时，将需要能够单独保存开始和结束时间，与任务开始和结束时间为两套时间。
          fieldName: 'controlTimeType',
          defaultValue: '1',
          tip: '开启状态时，该标识在任务中使用时，将需要能够单独保存开始和结束时间，与任务开始和结束时间为两套时间',
          colLayout: 'doubleCol',
          options: [
            {
              label: '是',
              value: '0'
            },
            {
              label: '否',
              value: '1'
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '固定标识', // 提示信息：“时间控制”为开启状态时，该标识在任务中使用时，将需要能够单独保存开始和结束时间，与任务开始和结束时间为两套时间。
          fieldName: 'constantMarkType',
          defaultValue: '1',
          colLayout: 'doubleCol',
          tip: '开启状态时，该标识不可删除',
          options: [
            {
              label: '是',
              value: '0'
            },
            {
              label: '否',
              value: '1'
            }
          ]
        },
        {
          type: 'hidden',
          fieldName: 'constantMarkReason',
          labelText: '固定原因',
          placeholder: '请输入固定原因',
          colLayout: 'singleCol'
        },
        {
          type: 'treeSelect',
          multiple: true,
          labelText: '项目类型',
          fieldName: 'monitorPointClassifyIds',
          colLayout: 'singleCol',
          defaultValue: [],
          clearable: true,
          placeholder: '请选择项目类型',
          optionUrl: {
            // api: 'ProjectApply.projectClassifyTree',
            api: 'dictionaryManagement.list',
            params: { dicType: 'PROJECTTYPE' },
            label: 'meaning',
            value: 'id'
          },
          treeData: []
        },
        {
          labelText: '系统角色',
          type: 'multiple',
          fieldName: 'monitorPointRoleIds',
          optionUrl: {
            api: 'PlanMonitor.getRoleData',
            params: { id: this.id }
          },
          options: [],
          colLayout: 'singleCol',
          defaultValue: []
        },
        {
          labelText: '依赖标识', // 提示信息:依赖标识是指在计划编辑时，当某任务已经选择了依赖标识后该标识才可以选择，任务取消依赖标识时，给予确认框提示依赖关系后，选择确定删除的情况下该标识自动取消，该属性的编辑关系为单项关系。
          type: 'multiple',
          fieldName: 'monitorPointRelyIds',
          optionUrl: {
            api: 'PlanMonitor.getMonitorPointData',
            params: { id: this.id }
          },
          tip: '依赖标识是指在计划编辑时，当某任务已经选择了依赖标识后该标识才可以选择，任务取消依赖标识时，给予确认框提示依赖关系后，选择确定删除的情况下该标识自动取消，该属性的编辑关系为单项关系。',
          options: [],
          colLayout: 'singleCol',
          defaultValue: []
        },
        {
          labelText: '互斥标识', // 提示信息：互斥标识指在计划编辑时，当某任务已经选择了该标识互斥列表中的标识时，该标识不可被选择，该属性的编辑关系为双向关系。例:A与B为互斥关系，修改A或修改B时，都应显示可编辑该关系。
          type: 'multiple',
          fieldName: 'monitorPointMutexIds',
          optionUrl: {
            api: 'PlanMonitor.getMonitorPointData',
            params: { id: this.id }
          },
          tip: '互斥标识指在计划编辑时，当某任务已经选择了该标识互斥列表中的标识时，该标识不可被选择，该属性的编辑关系为双向关系。',
          options: [],
          colLayout: 'singleCol',
          defaultValue: []
        },
        {
          type: 'hidden',
          fieldName: 'id',
          colLayout: 'doubleCol'
        },
        {
          type: 'hidden',
          fieldName: 'type',
          defaultValue: '1',
          colLayout: 'doubleCol'
        },
        {
          type: 'textarea',
          fieldName: 'describes',
          labelText: '标识描述',
          placeholder: '请输入标识描述',
          colLayout: 'singleCol'
        }
      ],
      modify: {
        controlTimeType: '1',
        constantMarkType: '1',
        icon: ''
      },
      iconPopover: false,
      icon: '',
      monitorPointList: [],
      monitorPoint: [],
      roleIds: [],
      dialogHeight: document.documentElement.clientHeight * 0.4,
      dialogConfig: {
        modal: false
      }
    }
  },
  watch: {
    'modify.constantMarkType': {
      handler(val) {
        if (val === '0') {
          this.dataSource[6].type = 'textarea'
        } else {
          this.dataSource[6].type = 'hidden'
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {},
  computed: {
    imageCt: function () {
      return this.modify.icon ? this.modify.icon : 'image-sel'
    },
    iconColor: function () {
      return this.modify.color ? this.modify.color : '#2196f3'
    }
  },
  methods: {
    rendered() {
      if (this.id && this.id !== '') {
        this.$api['PlanMonitor.getMonitorPointDataInfo']({ id: this.id }).then((res) => {
          if (res) {
            this.modify = Object.assign({}, res)
          }
        })
      }
    },
    saved(res) {
      this.$emit('save-success', res)
    },
    handleClose() {
      this.iconPopover = false
      this.select = {}
    },
    iconSelect (select) {
      this.select = select
    },
    handleOk () {
      if (this.select) {
        this.$set(this.modify, 'icon', this.select.icon)
        if (this.select.color && this.select.color !== '#606060') {
          this.$set(this.modify, 'color', this.select.color)
        } else {
          this.$set(this.modify, 'color', '')
        }
      }
      this.$refs.form.$refs.form.validateField('icon', (isValid) => {
        if (isValid) {
          this.$refs.form.$refs.form.clearValidate(['icon']);
        }
      })
      this.modify = Object.assign({}, this.modify)
      this.iconPopover = false
    }
  }
}
</script>
<style lang="scss" scoped>
.image-sel {
  background: url('~@/assets/image/common/image_blank.png') no-repeat;
  -moz-background-size: 18px 13px;
  background-size: 18px 13px;
  background-position: center;
}
.icon_example {
  display: block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 24px;
  text-align: center;
  color: #2196f3;
}
.icon_box {
  display: flex;
  align-items: center;
  width: 50px;
  height: 32px;
  border: 1px solid #cccccc;
  border-radius: 3px;
  box-sizing: border-box;
  .link_box {
    width: 20px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    border-left: 1px solid #cccccc;
  }
  .icon-link {
    font-size: 12px;
    color: #2196f3;
  }
}
</style>
