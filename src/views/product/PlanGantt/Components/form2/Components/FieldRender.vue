<template>
  <el-col :span="fields.colSpan">
    <el-form-item v-if="fields.elementOpacity"
                  :label="fields.labelText"
                  :label-width="fields.labelWidth"
                  :prop="fields.fieldName"
                  :rules="validator(fields.rules)">
      <el-select v-if="fields.fieldName && fields.type === 'selectIcon'"
                 v-model="formData[fields.fieldName]"
                 v-select-icon:[selectIconArg()]="formData[fields.fieldName]"
                 :placeholder="fields.placeholder"
                 clearable
                 v-bind="fields.fieldConfig"
                 style="width: 100%"
                 @change="fields.eventHandle && fields.eventHandle.change && comp[fields.eventHandle.change](formData[fields.fieldName], formIndex)">
        <el-option v-for="item in fields.options && fields.options.length && !(fields.optionUrl && fields.optionUrl.noApiOptionsToRender) ? fields.options : options"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"
                   :disabled="item.disabled">
          <el-tooltip :disabled="!item.describe"
                      :content="item.describe"
                      placement="right">
            <span :class="item.label"
                  style="display: inline-block; width: 100%"></span>
          </el-tooltip>
        </el-option>
      </el-select>
      <el-date-picker v-else-if="fields.fieldName && fields.type === 'datetime'"
                      v-model="formData[fields.fieldName]"
                      :type="fields.fieldConfig && fields.fieldConfig.type ? fields.fieldConfig.type : 'date'"
                      :value-format="fields.fieldConfig && fields.fieldConfig['value-format'] ? fields.fieldConfig['value-format'] : 'yyyy-MM-dd'"
                      v-bind="fields.fieldConfig"
                      :placeholder="fields.placeholder"
                      style="width: 100%"
                      @change="fields.eventHandle && fields.eventHandle.change && comp[fields.eventHandle.change](formData[fields.fieldName], formIndex)"></el-date-picker>
      <el-input-number v-else-if="fields.fieldName && fields.type === 'number'"
                       v-model="formData[fields.fieldName]"
                       v-bind="fields.fieldConfig"
                       :placeholder="fields.placeholder"
                       style="width: 100%"
                       @change="fields.eventHandle && fields.eventHandle.change && comp[fields.eventHandle.change](formData[fields.fieldName], formIndex)"></el-input-number>
      <tree-select v-else-if="fields.fieldName && fields.type === 'treeSelect'"
                   :default-expand-all="fields.defaultExpandAll"
                   :multiple="fields.multiple"
                   :placeholder="fields.placeholder"
                   :disabled="fields.disabled"
                   :data="fields.treeData && fields.treeData.length && !(fields.optionUrl && fields.optionUrl.noApiOptionsToRender) ? fields.treeData : options"
                   :props="fields.treeProps"
                   :disabled-values="fields.disabledValues"
                   :check-strictly="fields.checkStrictly"
                   :clearable="fields.clearable"
                   :readonly="fields.readonly"
                   v-model="formData[fields.fieldName]"
                   :style="{ width: fields.labelText ? 'auto' : '100%' }"
                   @tree-select-clear="fields.eventHandle && fields.eventHandle.treeSelectClear && comp[fields.eventHandle.treeSelectClear](formData[fields.fieldName], formIndex)">
        <template #treeItemSlot="{ scope }">
          <span style="float: right">
            <slot :name="fields.fieldName"
                  :scope="scope"></slot>
          </span>
        </template>
      </tree-select>
    </el-form-item>
  </el-col>
</template>
<script>
import { FormItem, Col, Select, Option, DatePicker, InputNumber, Tooltip, P8TreeSelect as TreeSelect } from 'p8-components-ui'

import { generateTree } from '@/utils/generateTree'
export default {
  name: 'FieldRender',
  components: {
    'el-form-item': FormItem,
    'el-col': Col,
    'el-select': Select,
    'el-option': Option,
    'el-date-picker': DatePicker,
    // 'el-input': Input,
    'el-input-number': InputNumber,
    'el-tooltip': Tooltip,
    TreeSelect
  },
  props: {
    comp: {
      type: Object
    },
    formData: {
      // 单个form绑定的数据
      type: Object,
      default: () => {
        return {}
      }
    },
    formIndex: {
      // 单个form对应的index
      type: Number
    },
    fields: {
      // 单个form渲染元素的对象
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      options: []
    }
  },
  watch: {
    fields: {
      handler (val) {
        const that = this
        if (val.options) {
          val.options.forEach(item => {
            if (item.id === '1017') {
              item.disabled = true
            }
          })
        }
        if (that.fields.optionUrl) {
          if (that.fields.optionUrl.api) {
            that.$api[that.fields.optionUrl.api](that.fields.optionUrl.params ? that.fields.optionUrl.params : {})
              .then((res) => {
                that.options = that.optionsDataHandle(res)
              })
              .catch((err) => {
                console.error(error)
              })
          } else {
            if (that.fields.optionUrl.noApiOptionsToRender) {
              if (that.fields.type === 'treeSelect') {
                that.options = that.optionsDataHandle(that.fields.treeData)
              } else {
                that.options = that.optionsDataHandle(that.fields.options)
              }
            }
          }
        } else {
          that.$emit('field-mounted')
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted () { },
  methods: {
    selectIconArg () {
      /**
       * 自定义指令select-icon 动态参数绑定的处理
       */
      if (this.fields.options && this.fields.options.length && !(this.fields.optionUrl && this.fields.optionUrl.noApiOptionsToRender)) {
        return this.fields.options
      } else {
        return this.options
      }
    },
    optionsDataHandle (normalData) {
      /**
       * 下拉框数据 公共逻辑处理部分
       */
      const that = this
      if (normalData.length <= 0) {
        that.$emit('field-mounted')
        return []
      }
      const normalDataTemp = JSON.parse(JSON.stringify(normalData)) // normalData进行处理生成新对象, 这样下面的操作就不会影响到默认传递进来的数据[options/treeDate]
      let options = []
      if (that.fields.optionUrl.label || that.fields.optionUrl.value) {
        if (normalDataTemp[0].children) {
          const props = {
            label: that.fields.optionUrl.label || null,
            value: that.fields.optionUrl.value || null
          }
          options = that.treeDataHandle(normalDataTemp, props)
        } else {
          options = normalDataTemp.map((item) => {
            if (that.fields.optionUrl.label) {
              item.label = item[that.fields.optionUrl.label]
            }
            if (that.fields.optionUrl.value) {
              item.value = item[that.fields.optionUrl.value]
            }
            return item
          })
          if (that.fields.type === 'treeSelect') {
            options = generateTree(normalDataTemp, that.fields.optionUrl.pId)
          }
        }
      } else {
        if (that.fields.type === 'treeSelect') {
          if (normalDataTemp[0].children) {
            options = normalDataTemp
          } else {
            options = generateTree(normalDataTemp, that.fields.optionUrl.pId)
          }
        } else {
          options = normalDataTemp
        }
      }
      that.$emit('field-mounted')
      return options
    },
    treeDataHandle (treeData, props = { label: '', value: '' }) {
      treeData.forEach((node) => {
        if (props.label) {
          node.label = node[props.label]
        }
        if (props.label) {
          node.value = node[props.value]
        }
        if (node.children && node.children.length) {
          this.treeDataHandle(node.children, props)
        }
      })
      return treeData
    }
  }
}
</script>
