<template>
  <div style="height: 100%">
    <el-tabs value="first">
      <el-tab-pane label="基本配置" name="first">
        <VuePerfectScrollbar class="scroll-area">
          <form-list :api="saveApi" ref="baseForm" label-position="top" :data-source="baseSource" :form="formData" label-width="90px" :exist-default-btn="false" :exist-custom-btn="false">
            <template #style>
              <ace-edit :value="styleValue" width="100%" height="300px" @update:value="onStyleModify"></ace-edit>
            </template>
          </form-list>
        </VuePerfectScrollbar>
      </el-tab-pane>
      <el-tab-pane label="查询配置" name="second">
        <VuePerfectScrollbar class="scroll-area">
          <form-list ref="queryForm" label-position="top" :data-source="querySource" :form="formData" label-width="90px" :exist-default-btn="false" :exist-custom-btn="false">
            <template #button>
              <el-button type="primary" round style="padding: 9px 15px" @click="openSearchCustom">点击设置</el-button>
            </template>
            <template #query>
              <ace-edit :value="queryConfigValue" width="100%" height="300px" @update:value="onQueryModify"></ace-edit>
            </template>
          </form-list>
          <search-custom v-if="searchCustomVisible" :visible="searchCustomVisible" :edit-data="editData" @close="searchCustomClose" @handleOk="handleOk"></search-custom>
        </VuePerfectScrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import aceEdit from '@/views/Framework/ComponentsMananger/Kanban/Components/ace'
import searchCustom from './searchCustom'
export default {
  name: 'RightPanel',
  components: {
    FormList,
    aceEdit,
    VuePerfectScrollbar,
    searchCustom
  },
  props: {
    widgets: {
      type: Array,
      default: () => []
    },
    editFormData: {
      type: Object,
      default: () => {}
    },
    saveApi: {
      type: String,
      default: ''
    }
  },
  watch: {
    editFormData: {
      deep: true,
      handler: function (newData, oldData) {
        Object.assign(this.formData, newData)
        this.styleValue = this.formData.style
        this.queryConfigValue = this.formData.queryConfig
        if (JSON.parse(this.queryConfigValue)) {
          this.editData = JSON.parse(this.queryConfigValue).searchForm
        }
      }
    }
  },
  data() {
    return {
      baseSource: [
        {
          type: 'text',
          labelText: '看板名称',
          fieldName: 'name',
          placeholder: '请输入看板名称',
          colLayout: '',
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'text',
          labelText: '看板编码',
          fieldName: 'code',
          placeholder: '请输入看板编码',
          colLayout: '',
          rules: [
            {
              required: true,
              trigger: 'blur',
              validator: (rule, value, callback) => {
                this.checkCode(rule, value, callback)
              }
            }
          ]
        },
        {
          type: 'text',
          labelText: '描述',
          fieldName: 'describe',
          placeholder: '请输人看板描述',
          colLayout: '',
          rules: [
            {
              required: true
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
              required: true
            }
          ]
        },
        {
          type: 'blank',
          labelText: '看板样式',
          slotName: 'style',
          fieldName: 'style',
          placeholder: '看板样式',
          defaultValue: '',
          colLayout: '',
          fieldConfig: {
            autosize: { minRows: 6, maxRows: 8 }
          }
        }
      ],
      querySource: [
        {
          type: 'blank',
          labelText: '',
          slotName: 'button',
          fieldName: 'button',
          colLayout: '',
          fieldConfig: {
            autosize: { minRows: 6, maxRows: 8 }
          }
        },
        {
          type: 'blank',
          labelText: '查询条件',
          slotName: 'query',
          fieldName: 'queryConfig',
          placeholder: '查询条件',
          defaultValue: '',
          colLayout: '',
          fieldConfig: {
            autosize: { minRows: 6, maxRows: 8 }
          }
        }
      ],
      styleValue: '',
      queryConfigValue: '',
      formData: {
        name: '',
        code: '',
        describe: '',
        indexNo: 0,
        style: '',
        queryConfig: '',
        widgets: []
      },
      searchCustomVisible: false,
      editData: []
    }
  },
  methods: {
    checkCode(rule, value, callback) {
      if (!value) {
        // callback 是提示的信息
        return callback(new Error('code不能为空'))
      } else {
        this.$api['kanbanView.checkCode']({ id: this.formData.id || '', code: value }).then((res) => {
          if (res) {
            callback()
          } else {
            callback(new Error('code重复'))
          }
        })
      }
    },
    async getSubmitData() {
      let _this = this
      let allFormData
      await this.$refs.baseForm.validate().then((baseParams) => {
        _this.$refs.queryForm.validate().then((queryParams) => {
          allFormData = { ...baseParams, ...queryParams }
        })
      })
      return allFormData
    },
    doSubmit(data) {
      this.$refs.baseForm.submitForm(data, this.saveApi)
    },
    getFormData() {
      return this.formData
    },
    onStyleModify(v) {
      this.formData.style = v
    },
    openSearchCustom() {
      this.searchCustomVisible = true
    },
    searchCustomClose() {
      this.searchCustomVisible = false
    },
    handleOk(data) {
      this.editData = data
      let searchData = []
      data.forEach((item) => {
        searchData.push({
          type: item.type, // 控件类型
          labelText: item.labelText, // 控件显示的文本
          fieldName: item.fieldName,
          mode: '=',
          selectCode: item.selectCode,
          replaceSearch: item.replaceVal
        })
      })
      let obj = {
        enabled: true,
        searchForm: searchData
      }
      this.formData.queryConfig = JSON.stringify(obj)
      this.queryConfigValue = this.formData.queryConfig
      this.searchCustomClose()
    },
    onQueryModify(v) {
      this.formData.queryConfig = v
    }
  }
}
</script>

<style scoped></style>
