<template>
  <div class="form-more-wrap">
    <div :class="{ 'form-more-content': formDataList.length }">
      <template v-for="(formItem, formIndex) in formDataList">
        <el-row
          class="form-single-row"
          :class="{ hover: formItem.issubmit }"
          :style="{ borderBottomWidth: formDataList.length > 1 && formIndex < formDataList.length - 1 ? '1px' : '0px' }"
          :gutter="10"
          :key="formIndex"
        >
          <el-form :ref="`form${formIndex}`" :model="formItem" :label-width="labelWidth" v-bind="formConfig">
            <template v-for="item in dataSourceTwoDimensional[formIndex]">
              <field-render-view v-if="formItem.issubmit" :key="item.fieldName" :form-data="formItem" :form-index="formIndex" :fields="item" @field-mounted="sumRender">
                <template #[renderSlotViewBind(item)]="{ formData }">
                  <slot :name="renderSlotViewBind(item, 'View')" :scope="formData"></slot>
                </template>
              </field-render-view>
              <field-render v-if="!formItem.issubmit" :key="item.fieldName" :form-data="formItem" :form-index="formIndex" :fields="item" :comp="renderComp" @field-mounted="sumRender">
                <template #[renderSlot(item)]="{ scope }">
                  <slot :name="renderSlot(item)" :scope="scope"></slot>
                </template>
              </field-render>
            </template>
            <el-col v-if="!isView" class="form-btn-operation" :span="5" style="float: right">
              <el-form-item v-if="!formItem.issubmit" label-width="0">
                <el-button style="padding: 7px 5px; font-size: 12px" type="primary" size="mini" @click.stop="submit(formIndex)">添加</el-button>
                <i class="el-icon-close" style="padding: 0 8px; font-size: 18px" @click.stop="formDelete(formIndex)"></i>
              </el-form-item>
              <el-form-item v-if="formItem.issubmit && !formItem.notedit" label-width="0">
                <i class="el-icon-edit" style="padding: 0 8px; font-size: 18px" @click.stop="formEdit(formIndex)"></i>
                <i class="el-icon-delete" style="padding: 0 8px; font-size: 18px" @click.stop="formEdit(formIndex)"></i>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </template>
    </div>
    <el-row v-if="isAdd && !isView" :style="{ marginTop: formDataList.length ? '20px' : '0' }">
      <el-col :span="24">
        <el-button type="dashed" style="width: 100%" @click="add">
          <i class="el-icon-plus"></i>
          {{ addBtnName }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { Form, FormItem, Row, Col, Button } from 'p8-components-ui'
import FieldRender from './Components/FieldRender'
import FieldRenderView from './Components/FieldRenderView'
export default {
  name: 'Form2',
  components: {
    'el-form': Form,
    'el-form-item': FormItem,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    FieldRender,
    FieldRenderView
  },
  props: {
    comp: {
      // 页面上的this, 用来绑定页面上的事件[form中元素的事件]
      type: Object
    },
    formToApiData: {
      // 所有form数据
      type: Array,
      default: () => []
    },
    dataSource: {
      // 单个form中包含的元素以及元素的属性
      type: Array
    },
    dataSourceArray: {
      // 多个form存储的元素属性, 是一个二维数组, 每一项都是一个 dataSource
      type: Array,
      default: () => {
        return []
      }
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    formConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isView: {
      type: Boolean,
      default: false
    },
    addBtnName: {
      // 添加按钮展示文本
      type: String,
      default: '添加'
    }
  },
  computed: {
    renderComp() {
      return this.comp
    }
  },
  watch: {
    formToApiData: {
      /**
       * 监听: 当已有保存的数据时, 进行处理, issubmit:true -- 展示保存后的数据组件
       */
      handler(val) {
        const that = this
        if (val && val.length) {
          const temp = val.map((item) => {
            const keys = Object.keys(item)
            if (keys.indexOf('issubmit') === -1) {
              that.$set(item, 'issubmit', true)
              // this.dataSourceTwoDimensional.push(JSON.parse(JSON.stringify(that.renderDataSource())))
            } else {
              that.$set(item, 'issubmit', item.issubmit)
            }
            return item
          })
          that.formDataList = temp
        } else {
          that.formDataList = val
        }
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      formElementNum: 0,
      renderedNum: 0,
      formDataList: [],
      dataSourceTwoDimensional: this.dataSourceArray,
      isAdd: true // 是否展示 添加按钮
    }
  },
  mounted() {},
  methods: {
    sumRender() {
      this.renderedNum++
      if (this.formElementNum === this.renderedNum) {
        this.$emit('rendered')
      }
    },
    renderSlot(item) {
      /**
       * renderSolt: 绑定对应的插槽 FieldRender.vue中提供的slot插槽, 在form2/index.vue中进行绑定
       *    目前只绑定了 treeSelect类型提供的插槽
       */
      if (item.type !== 'treeSelect') return ''
      return item.fieldName || item.soltName
    },
    renderSlotViewBind(item, type) {
      /**
       * renderSoltView: 绑定对应的插槽 FieldRenderView.vue中提供的slot插槽, 在form2/index.vue中进行绑定
       *    页面使用是 统一加上 在 fieldName || slotName 对应的值 拼接上 View
       */
      if (item.scopedSlots && item.scopedSlots.customRender === 'custom') {
        return type ? item.fieldName + 'View' : item.fieldName
      }
      return ''
    },
    renderDefaultFormHandle() {
      /**
       * renderDefaultFormHandle: 添加行所需的 form
       */
      const formObj = {}
      this.dataSource.map((item) => {
        if (item.fieldName || item.slotName) {
          this.$set(formObj, item.fieldName || item.slotName, item.defaultValue || '')
        }
        this.$set(formObj, 'issubmit', false) // 当前行-根据 issubmit 展示对应的操作按钮
      })
      return formObj
    },
    renderDataSource() {
      const elementType = ['blank', 'upload', 'addField', 'hidden']
      const that = this
      return this.dataSource.map(function (item) {
        // 记录edit json中type类型不包含'blank'与'upload'的元素个数，用于寻找调用表单数据接口（给修改页面赋值）的时机
        if (elementType.indexOf(item.type) === -1) {
          that.formElementNum += 1
        }
        // edit json中如何没有设置fieldConfig，则将fieldConfig设置为空
        if (!item.fieldConfig) {
          item.fieldConfig = {}
        }
        that.$set(item, 'elementOpacity', true)
        return item
      })
    },
    handleParams(obj) {
      // 判断必须为obj
      if (!(Object.prototype.toString.call(obj) === '[object Object]')) {
        return {}
      }
      const tempObj = {}
      for (let [key, value] of Object.entries(obj)) {
        // if(value == null) value = '';
        if (Array.isArray(value) && value.length <= 0) continue
        if (Object.prototype.toString.call(value) === '[object Function]') continue
        // 若是为字符串则清除两边空格
        if (value && typeof value === 'string') {
          value = value.trim()
        }
        tempObj[key] = value
      }

      return tempObj
    },
    validate(formIndex) {
      return new Promise((resolve, reject) => {
        this.$refs[`form${formIndex}`][0].validate((isValid) => {
          if (isValid) {
            const formData = this.formDataList[formIndex]
            const params = Object.assign({}, formData)
            const queryParams = this.handleParams(params)
            resolve(queryParams)
          }
        })
      })
    },
    add() {
      /**
       * add: 添加后, 添加按钮隐藏, 当前行form提交后再显示
       */
      const that = this
      this.formDataList.push(this.renderDefaultFormHandle())
      this.dataSourceTwoDimensional.push(JSON.parse(JSON.stringify(that.renderDataSource())))
      this.$emit('form-add', { formToApiData: this.formDataList, dataSourceArray: this.dataSourceTwoDimensional, currentIndex: this.formDataList.length - 1 })
      this.isAdd = false
    },
    submit(formIndex) {
      /**
       * submit: 行form提交, 提交后当前行form展示 编辑和删除 操作按钮; 并展示 add按钮
       */
      this.validate(formIndex)
        .then((queryParams) => {
          const saveParams = { ...queryParams }
          // if (this.isCustomValidate) {
          //   this.$emit('custom-validate', saveParams)
          // } else {
          //   this.submitForm(saveParams, this.api)
          // }
          this.$set(this.formDataList, formIndex, saveParams)
          this.$set(this.formDataList[formIndex], 'issubmit', true)
          this.isAdd = true
          this.$emit('form-submit', { formToApiData: this.formDataList, dataSourceArray: this.dataSourceTwoDimensional, currentIndex: formIndex })
        })
        .catch(() => {})
    },
    formEdit(formIndex) {
      /**
       * formEdit: 行form编辑, 点击编辑,展示form编辑组件[含 提交和删除]; 并将 add按钮隐藏
       *    存在正在编辑(未保存)的行form,且与当前删除的索引不对等时, 不允许其他行编辑
       */
      const isExistEditForm = this.formDataList.findIndex((item) => !item.issubmit) // findIndex 返回存在的索引, 不存在返回 -1
      if (isExistEditForm !== -1 && isExistEditForm !== formIndex) {
        this.$message({
          message: '存在未保存的数据',
          type: 'warning'
        })
      } else {
        this.$set(this.formDataList[formIndex], 'issubmit', false)
        this.isAdd = false
        this.$emit('form-edit', { currentIndex: formIndex })
      }
    },
    formDelete(formIndex) {
      /**
       * formDelete: 行form删除, 删除当前行form, 并展示 add按钮
       *    存在正在编辑(未保存)的行form,且与当前删除的索引不对等时, 不允许删除
       */
      const isExistEditForm = this.formDataList.findIndex((item) => !item.issubmit) // findIndex 返回存在的索引, 不存在返回 -1
      if (isExistEditForm !== -1 && isExistEditForm !== formIndex) {
        this.$message({
          message: '存在未保存的数据',
          type: 'warning'
        })
      } else {
        // this.formDataList.splice(formIndex, 1)
        // this.dataSourceTwoDimensional.splice(formIndex, 1)
        this.$emit('form-delete', { formToApiData: this.formDataList, dataSourceArray: this.dataSourceTwoDimensional, currentIndex: formIndex })
        this.isAdd = true
      }
    }
  }
}
</script>
<style lang="scss">
.el-button-icon--custom {
  &.el-button {
    background-color: transparent;
    border: none;
    font-size: 18px;
  }
}
.form-more-wrap {
  box-sizing: border-box;
  padding: 10px;
  .form-more-content {
    border: 1px solid $base-line-color;
    border-radius: 4px;
    .form-single-row {
      margin: 0 !important;
      border-bottom-style: solid;
      border-bottom-color: $base-line-color;
      &.hover:hover {
        background-color: #e5f0f9;
      }
      .el-form-item--small.el-form-item {
        margin-bottom: 0;
        padding: 8px 0;
      }
    }
  }
}
.form-btn-operation {
  text-align: right;
}
</style>
