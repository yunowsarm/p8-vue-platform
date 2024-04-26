<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div style="height: 100%; border-left: 1px solid #e4e7ed">
    <el-tabs value="first">
      <el-tab-pane label="基本配置"
                   name="first">
        <VuePerfectScrollbar class="scroll-area">
          <form-list :api="saveApi"
                     ref="baseForm"
                     label-position="top"
                     :data-source="baseSource"
                     :form="formData"
                     label-width="90px"
                     @saved="saved"
                     :exist-default-btn="false"
                     :exist-custom-btn="false">
            <template #renderer>
              <el-select v-model="formData.renderer"
                         placeholder="请选择布局渲染器"
                         style="width: 100%">
                <el-option v-for="item in rendererData"
                           :key="item.id"
                           :label="item.name + item.version"
                           :value="item.id"> </el-option>
              </el-select>
            </template>
          </form-list>
        </VuePerfectScrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'RightPanel',
  components: {
    FormList,
    VuePerfectScrollbar
  },
  props: {
    editFormData: {
      type: Object,
      default: () => { }
    },
    saveApi: {
      type: String,
      default: ''
    },
    recordId: {
      type: String,
      default: ''
    }
  },
  watch: {
    editFormData: {
      deep: true,
      handler: function (newData, oldData) {
        Object.assign(this.formData, newData)
      }
    },
    'formData.layoutType': {
      handler: function (newData, oldData) {
        let that = this
        this.$api['desLayout.rendererList']({ layoutType: newData }).then(function (res) {
          that.rendererData = res
          that.formData.renderer = res[0].id
        })
      },
      immediate: true
    },
    'formData.renderer': {
      handler: function (newData, oldData) {
        if (this.rendererData && this.rendererData.length > 0) {
          let checkType = this.rendererData.find((item) => item.id === newData)
          this.$emit('changeType', checkType)
        }
      }
    }
  },
  data () {
    return {
      baseSource: [
        {
          type: 'text',
          labelText: '布局名称',
          fieldName: 'layoutName',
          placeholder: '请输入布局名称',
          colLayout: '',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'text',
          labelText: '布局编号',
          fieldName: 'layoutCode',
          placeholder: '请输入布局编号 例：XXX_XXX_XXX',
          colLayout: '',
          rules: [
            {
              required: true,
              trigger: 'blur',
              validator: (rule, value, callback) => {
                this.$api['desLayout.repeatLayoutCode']({ layoutCode: value, id: this.recordId })
                  .then((res) => {
                    if (res.result) {
                      return callback(new Error('布局编号不能重复'))
                    }
                    callback()
                  })
                  .catch(function (error) {
                    console.log(error)
                  })
              }
            }
          ]
        },
        {
          type: 'select',
          labelText: '布局类型',
          fieldName: 'layoutType',
          defaultValue: '',
          optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'LAYOUT_TYPE' } },
          options: [],
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              required: true,
              trigger: 'blur',
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'blank',
          labelText: '布局渲染器',
          fieldName: 'renderer',
          slotName: 'renderer',
          defaultValue: '',
          // optionUrl: { api: 'thirdPartInterface.getDic', params: { dicType: 'LAYOUT_RENDERER' } },
          options: [
            {
              label: '按钮导航',
              value: '1'
            },
            {
              label: '选项页',
              value: '0'
            }
          ],
          fieldConfig: {
            disabled: false
          },
          rules: [
            {
              required: true,
              trigger: 'blur',
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'number',
          labelText: '排序号',
          fieldName: 'indexNo',
          placeholder: '请输入排序号',
          colLayout: '',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '描述',
          fieldName: 'description',
          placeholder: '请输入描述',
          colLayout: '',
          fieldConfig: {
            rows: 8
          },
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        }
      ],
      formData: { renderer: '', layoutType: '2101' },
      rendererData: []
    }
  },
  mounted () {
    if (this.recordId) {
      this.rendererDorm(this.recordId)
    }
  },
  methods: {
    async getSubmitData () {
      let allFormData
      await this.$refs.baseForm.validate().then((baseParams) => {
        allFormData = { ...baseParams }
      })
      return allFormData
    },
    doSubmit (data) {
      this.$refs.baseForm.submitForm(data, this.saveApi)
    },
    getFormData () {
      return this.formData
    },
    saved () {
      this.$emit('saveSuccess')
    },
    async rendererDorm (id) {
      let that = this
      await this.$api['desLayout.view']({ id: this.recordId }).then((res) => {
        that.$api['desLayout.rendererList']({ layoutType: res.layoutType }).then(function (result) {
          that.rendererData = result
          that.baseSource.forEach((el) => {
            let key = el.fieldName
            that.formData[key] = res[key]
          })
          that.formData.id = res.id
          that.formData = Object.assign({}, that.formData)
        })
      })
    }
  }
}
</script>

<style scoped></style>
