<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <el-row :gutter="2">
    <el-col :span="18">
      <el-form-item v-show="fields.fieldName && fields.type !== 'hidden'"
                    :label="fields.labelText"
                    :prop="fields.fieldName"
                    :rules="validator(fields.rules)">
        <el-input v-if="fields.fieldName && fields.type === 'text'"
                  v-model="formData[fields.fieldName]"
                  v-bind="fields.fieldConfig"
                  :placeholder="fields.placeholder"
                  clearable></el-input>
        <el-input v-else-if="fields.fieldName && fields.type === 'textarea'"
                  type="textarea"
                  v-model="formData[fields.fieldName]"
                  v-bind="fields.fieldConfig"
                  :placeholder="fields.placeholder"
                  clearable></el-input>
        <el-select v-else-if="fields.fieldName && fields.type === 'select'"
                   v-model="formData[fields.fieldName]"
                   v-bind="fields.fieldConfig"
                   :placeholder="fields.placeholder"
                   style="width: 100%"
                   clearable>
          <el-option v-for="item in fields.options && fields.options.length ? fields.options : options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
        <el-select v-else-if="fields.fieldName && fields.type === 'multiple'"
                   v-model="formData[fields.fieldName]"
                   multiple
                   clearable
                   v-bind="fields.fieldConfig"
                   :placeholder="fields.placeholder"
                   style="width: 100%">
          <el-option v-for="item in fields.options && fields.options.length ? fields.options : options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
        <tree-select v-else-if="fields.fieldName && fields.type === 'treeSelect'"
                     :default-expand-all="fields.defaultExpandAll"
                     :default-expanded-keys="fields.defaultExpandedKeys"
                     :multiple="fields.multiple"
                     :placeholder="fields.placeholder"
                     :disabled="fields.disabled"
                     :data="fields.treeData && fields.treeData.length ? fields.treeData : options"
                     :props="fields.treeProps"
                     :disabled-values="fields.disabledValues"
                     :check-strictly="fields.checkStrictly"
                     :clearable="fields.clearable"
                     :reset="fields.reset"
                     v-model="formData[fields.fieldName]"
                     style="width: 100%"></tree-select>
        <el-input-number v-else-if="fields.fieldName && fields.type === 'number'"
                         :min="fields.min || fields.min === 0 ? fields.min : 1"
                         :max="fields.max"
                         v-model="formData[fields.fieldName]"
                         v-bind="fields.fieldConfig"
                         :placeholder="fields.placeholder"
                         style="width: 100%"></el-input-number>
        <el-radio-group v-else-if="fields.fieldName && fields.type === 'radio' && Array.isArray(fields.options)"
                        v-model="formData[fields.fieldName]"
                        v-bind="fields.fieldConfig"
                        :placeholder="fields.placeholder">
          <el-radio v-for="item in fields.options && fields.options.length ? fields.options : options"
                    :key="item.value"
                    :label="item.value"
                    :value="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
        <el-radio-group v-else-if="fields.fieldName && fields.type === 'radioButton'"
                        v-model="formData[fields.fieldName]"
                        v-bind="fields.fieldConfig">
          <el-radio-button v-for="item in fields.options && fields.options.length ? fields.options : options"
                           :key="item.value"
                           :label="item.value"
                           :value="item.value">{{
            item.label
          }}</el-radio-button>
        </el-radio-group>
        <el-checkbox v-else-if="fields.fieldName && fields.type === 'checkbox'"
                     v-model="formData[fields.fieldName]"
                     v-bind="fields.fieldConfig"
                     :placeholder="fields.placeholder">{{
          fields.label
        }}</el-checkbox>
        <el-checkbox-group v-else-if="fields.fieldName && fields.type === 'checkboxGroup' && Array.isArray(fields.options)"
                           v-model="formData[fields.fieldName]"
                           v-bind="fields.fieldConfig"
                           :placeholder="fields.placeholder">
          <el-checkbox v-for="item in fields.options && fields.options.length ? fields.options : options"
                       :key="item.value"
                       :label="item.value"
                       :value="item.value">{{ item.label }}</el-checkbox>
        </el-checkbox-group>
        <el-date-picker v-else-if="fields.fieldName && fields.type === 'datetime'"
                        v-model="formData[fields.fieldName]"
                        type="date"
                        v-bind="fields.fieldConfig"
                        :placeholder="fields.placeholder"
                        style="width: 100%"
                        clearable></el-date-picker>
        <el-date-picker v-else-if="fields.fieldName && fields.type === 'year'"
                        v-model="formData[fields.fieldName]"
                        type="year"
                        v-bind="fields.fieldConfig"
                        :placeholder="fields.placeholder"
                        style="width: 100%"
                        valueFormat='yyyy'
                        clearable></el-date-picker>
        <el-date-picker v-else-if="fields.fieldName && fields.type === 'datetimeRange'"
                        v-model="formData[fields.fieldName]"
                        v-bind="fields.fieldConfig"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        style="width: 100%"
                        unlink-panels
                        clearable></el-date-picker>
        <el-switch v-else-if="fields.fieldName && fields.type === 'switch'"
                   v-model="formData[fields.fieldName]"
                   active-color="#13ce66"
                   inactive-color="#ff4949"
                   v-bind="fields.fieldConfig"
                   :placeholder="fields.placeholder"></el-switch>
        <div v-else-if="fields.fieldName && fields.type === 'popUpSelect'">
          <el-input v-model="popLabel"
                    readonly>
            <template slot="suffix">
              <i v-if="formData[fields.fieldName]"
                 class="el-icon-circle-close"
                 @click="resetPop"></i>
              <i v-if="!formData[fields.fieldName]"
                 class="el-icon-link"
                 @click="showDialog"></i>
            </template>
          </el-input>
          <el-input v-show="false"
                    v-model="formData[fields.fieldName]"></el-input>
          <pop-up-table :visible="popUpVisible"
                        v-if="popUpVisible"
                        :select-code="fields.selectCode"
                        @fillBack="fillBack"
                        @close="onPopupClose"></pop-up-table>
        </div>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-select v-model="mode"
                :disabled="fields.parameterSource === 'SQL参数'"
                 @change="changeMode"
                 style="height: 32px; line-height: 32px">
        <el-option v-for="items in modeSelect"
                   :key="items.value"
                   :label="items.label"
                   :value="items.value"></el-option>
      </el-select>
    </el-col>
  </el-row>
</template>
<script>
import { Row, Col, FormItem, Input, InputNumber, Radio, RadioGroup, RadioButton, Checkbox, CheckboxGroup, Switch, Select, Option, DatePicker, P8TreeSelect as TreeSelect } from 'p8-components-ui'
import PopUpTable from './PopUpTable'
import { generateTree } from '@/utils/generateTree'
import { selectTransform, selectGenerateTree } from '@/utils/common'
const modeSelect = [
  {
    label: '等于',
    value: '='
  },
  {
    label: '包含',
    value: 'like'
  }
  // ,
  // {
  //   label: '开始',
  //   value: 'likeRight'
  // },
  // {
  //   label: '结束',
  //   value: 'likeLeft'
  // },
  // {
  //   label: '数组包含',
  //   value: 'in'
  // },
  // {
  //   label: '大于',
  //   value: '>'
  // },
  // {
  //   label: '小于',
  //   value: '<'
  // },
  // {
  //   label: '大于等于',
  //   value: '>='
  // },
  // {
  //   label: '小于等于',
  //   value: '<='
  // }
]
export default {
  name: 'IntellSearchFieldRender',
  props: {
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    fields: {
      type: Object,
      default: () => {
        return {}
      }
    },
    view: {
      type: Object,
      default: () => {
        return {}
      }
    },
    resetFlag: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      options: [],
      mode: '=',
      modeData: {},
      modeSelect: this.fields.type == 'radioButton' || this.fields.type == 'multiple' ? [{ label: '等于', value: '=' }] : modeSelect,
      popUpVisible: false, // 弹出选择默认隐藏
      popLabel: '' // 弹出选择回填label
    }
  },
  created (){
    if(this.fields.type == 'text' || this.fields.type == 'textarea'){
      this.mode = 'like'
    }
  },
  async mounted () {
    let that = this
    let needHandleTags = ['treeSelect', 'select']
    let needHandleIndex = needHandleTags.indexOf(this.fields.type)
    if (this.fields.optionUrl && this.fields.optionUrl.api) {
      this.$api[this.fields.optionUrl.api](this.fields.optionUrl.params ? this.fields.optionUrl.params : {})
        .then((res) => {
          if (that.fields.optionUrl.label || that.fields.optionUrl.value) {
            if (res[0].children) {
              let props = {
                label: that.fields.optionUrl.label || null,
                value: that.fields.optionUrl.value || null
              }
              that.options = that.treeDataHandle(res, props)
            } else {
              that.options = res.map((item) => {
                if (that.fields.optionUrl.label) {
                  item.label = item[that.fields.optionUrl.label]
                }
                if (that.fields.optionUrl.value) {
                  item.value = item[that.fields.optionUrl.value]
                }
                return item
              })
              if (that.fields.type === 'treeSelect') {
                that.options = generateTree(that.options, that.fields.optionUrl.pId)
              }
            }
          } else {
            if (that.fields.type === 'treeSelect') {
              if (res[0].children) {
                that.options = res
              } else {
                that.options = generateTree(res, that.fields.optionUrl.pId)
              }
            } else {
              that.options = res
            }
          }
          // 将options数据回填至dataSource中
          that.fields.options = that.options
          this.$emit('field-mounted')
        })
        .catch((err) => {
          console.log(err)
        })
    } else if (this.fields.selectCode && this.fields.type !== 'popUpSelect') {
      let param = {
        selectCode: this.fields.selectCode,
        param: {},
        sqlParam: {},
        reportParam: {},
        permissionVo: { router: this.$route.name, resourceId: '' }
      }
      let res = await this.$api['formGenerator.getSelectionData'](param)
      let options = []
      if (res) {
        if (res.config) {
          options = needHandleIndex === 0 ? selectGenerateTree(res.data, res.config) : selectTransform(res.data, res.config)
        } else {
          // 解析数据字典数据
          options = res.data.map((item) => {
            return {
              label: item.cmeaning,
              value: item.id
            }
          })
        }
      }
      that.options = options
      // 将options数据回填至dataSource中
      that.fields.options = that.options
      that.$emit('field-mounted')
    } else {
      that.$emit('field-mounted')
    }
    this.$emit('setMode', { [this.fields.fieldName]: this.mode })
  },
  watch: {
    resetFlag (val) {
      if (val) {
        this.mode = '='
        this.popLabel = ''
        if(this.fields.type == 'text' || this.fields.type == 'textarea'){
          this.mode = 'like'
          this.$emit('setMode', { [this.fields.fieldName]: this.mode })
        }
      }
    }
  },
  methods: {
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
    },
    changeMode (val) {
      this.$emit('setMode', { [this.fields.fieldName]: this.mode })
    },
    // 弹出选择-弹出表格
    showDialog () {
      this.popUpVisible = true
    },
    // 弹出选择，回填数据
    fillBack (data) {
      console.log('fillBack', data)
      this.popUpVisible = false
      if (Object.keys(data).length) {
        this.popLabel = data.label
        this.formData[this.fields.fieldName] = data.value
        this.$emit('setParentFormData', this.formData, data.label)
      }
    },
    onPopupClose () {
      this.popUpVisible = false
    },
    resetPop () {
      this.popLabel = ''
      this.formData[this.fields.fieldName] = ''
    }
  },
  components: {
    'el-row': Row,
    'el-col': Col,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-input-number': InputNumber,
    'el-radio': Radio,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton,
    'el-checkbox': Checkbox,
    'el-checkbox-group': CheckboxGroup,
    'el-switch': Switch,
    'el-select': Select,
    'el-option': Option,
    'el-date-picker': DatePicker,
    TreeSelect,
    PopUpTable
  }
}
</script>
<style lang="scss"></style>
