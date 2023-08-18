<template>
  <form-list ref="form" label-width="150px" @rendered="rendered" @saved="saved" :data-source="columns" :api="saveApi" :form="formData">
    <template #image>
      <span :class="['icon_example', imageCt]" @click="iconPopover = true"></span>
      <common-dialog title="图标选择" width="50%" v-if="iconPopover" :visible="iconPopover" :dialog-height="dialogHeight" @close="handleClose" @handle-cancel="handleClose" @handle-ok="doIconSelect">
        <template #dialog>
          <icon-selector @icon-select="iconSelect" :color-picker="true" :selected-name="formData.image"></icon-selector>
        </template>
      </common-dialog>
    </template>
    <template #eventParams>
      <!-- <ace-edit :value.sync="formData.eventParams" width="100%" height="100px"></ace-edit> -->
      <el-button v-if="!formData.eventParams" type="primary" @click="focusParams">单击设置事件参数</el-button>
      <el-input v-else type="textarea" v-model="formData.eventParams"></el-input>
      <common-dialog v-if="paramsVisible" title="设置事件参数" :visible="paramsVisible" @handle-cancel="handleParamsClose" @handle-ok="handleParamsOk" width="30%" @close="handleParamsClose">
        <template #dialog>
          <form-list ref="formParams" label-width="100px" :data-source="paramsSource" :form="paramsFormData" :exist-default-btn="false">
            <template #paramsText>
              <ace-edit :value.sync="paramsFormData.paramsText" width="100%" height="200px"></ace-edit>
            </template>
          </form-list>
        </template>
      </common-dialog>
    </template>
    <template #controlRule>
      <ace-edit :value.sync="formData.controlRule" width="100%" height="300px"></ace-edit>
    </template>
    <template #eventHandle="{ scope, data }">
      <el-autocomplete v-model="formData.eventHandle" placeholder="请输入前端EventHandler" style="width: 100%" :fetch-suggestions="querySearch">
        <template slot-scope="{ item }">
          <div class="name">{{ item.value }}</div>
        </template>
      </el-autocomplete>
    </template>
  </form-list>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog, P8IconSelector as IconSelector } from 'p8-components-ui'
import AceEdit from '@/views/Framework/ComponentsMananger/Base/Components/ace'
import { getColumns } from '../res_set_utils'
import { eventHandleArr } from '@/views/Framework/ComponentsMananger/Grid/Components/eventHandleArr'
export default {
  name: 'ResourceEdit',
  components: {
    FormList,
    CommonDialog,
    IconSelector,
    AceEdit
  },
  props: {
    record: {
      type: Object,
      default: () => {}
    },
    resType: {
      type: String,
      default: ''
    },
    parentRecord: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    imageCt: function () {
      return this.formData.image ? this.formData.image : 'image-sel'
    }
  },
  watch: {
    'formData.eventHandle': {
      deep: true,
      handler: function (newV, oldV) {
        if (oldV) {
          this.formData.eventParams = ''
        }
      }
    }
  },
  data() {
    return {
      saveApi: 'resource.save',
      iconPopover: false,
      dialogHeight: document.documentElement.clientHeight * 0.4,
      columns: [],
      formData: {
        id: '',
        parentId: '',
        parentName: '',
        title: '',
        name: '',
        image: '',
        enable: 1,
        level: 1,
        type: '', // MENU:菜单、BUTTON：按钮、PER_GROUP：权限组、PER：权限
        location: '', //head：头部工具栏、row：列表行级
        isAccredit: '1', //0：不可授权 1：可授权
        permission: '',
        component: '',
        indexNumber: 1,
        eventHandle: '',
        eventParams: '',
        controlRule: '',
        remark: ''
      },
      iconTempSel: null,
      paramsVisible: false,
      paramsSource: [],
      paramsFormData: {
        paramsText: '',
        paramsChange: '',
        formCode: ''
      },
      formSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'select',
          labelText: '业务流程定义',
          fieldName: 'formCode',
          placeholder: '选择业务流程定义',
          colLayout: 'singleCol',
          options: []
        }
      ],
      apiSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '动态API',
          fieldName: 'api',
          colLayout: 'singleCol'
        },
        {
          type: 'switch',
          labelText: '开启确认对话框',
          fieldName: 'openDia',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '提示语',
          fieldName: 'warningMsg',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '成功提示',
          fieldName: 'successMsg',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '失败提示',
          fieldName: 'errorMsg',
          colLayout: 'singleCol'
        }
      ],
      defaultSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '自定义参数',
          fieldName: 'paramsText',
          slotName: 'paramsText',
          colLayout: 'singleCol'
        }
      ],
      textSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'textarea',
          labelText: '动态组件地址',
          fieldName: 'addressText',
          colLayout: 'singleCol'
        }
      ],
      eventHandleArraly: eventHandleArr,
      editTableSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'select',
          labelText: '编辑表格',
          fieldName: 'editTable',
          placeholder: '请选择编辑表格',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'formGenerator.editList',
            params: {}
          }
        }
      ]
    }
  },
  created() {
    if (this.record && this.record.id) {
      this.formData = { ...this.record, controlRule: this.record.controlRule || '', eventParams: this.record.eventParams || '' }
    } else {
      console.log('resType', this.resType)
      console.log('parentRecord', this.parentRecord)
      this.formData.type = this.resType
      this.formData.parentId = this.parentRecord.id
      this.formData.parentName = this.parentRecord.title
      this.formData.level = this.parentRecord.level + 1
    }

    this.columns = getColumns(this.formData.type, this)
    console.log('this.columns', this.columns)
  },
  mounted() {},
  methods: {
    rendered() {},
    saved(res) {
      console.log('edit saved')
      this.$emit('saveSuccess', res)
    },
    handleClose() {
      this.iconTempSel = null
      this.iconPopover = false
    },
    doIconSelect() {
      if (this.iconTempSel) {
        this.formData.image = this.iconTempSel.icon
      }
      this.handleClose()
    },
    iconSelect(select) {
      this.iconTempSel = select
    },
    focusParams() {
      if (!this.formData.eventHandle) {
        return this.$message.warning('请先选择事件！')
      }
      let api = ''
      console.log(this.formData.eventHandle, '===================this.formData.eventHandle')
      switch (this.formData.eventHandle) {
        case 'createForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          break
        case 'modifyForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          break
        case 'viewForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          break
        case 'deleteForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          break
        case 'startProcess':
          this.paramsSource = this.formSource
          api = 'ProcessDefinition.listData'
          break
        case 'viewProcess':
          this.paramsSource = this.formSource
          api = 'ProcessDefinition.listData'
          break
        case 'cancelProcess':
          this.paramsSource = this.formSource
          api = 'ProcessDefinition.listData'
          break
        case 'openComponent':
          // this.paramsSource = this.formSource
          // api = 'formGenerator.tableList'
          this.paramsSource = this.textSource
          break
        case 'dynamicAPI':
          this.paramsSource = this.apiSource
          break
        case 'openEditTable':
          this.paramsSource = this.editTableSource
          break
        default:
          this.paramsSource = this.defaultSource
          break
      }
      if (api !== '') {
        this.paramsOptions(api)
      }
      this.paramsVisible = true
      this.paramsFormData.formCode = null
      this.paramsFormData.paramsChange = this.formData.eventHandle
    },
    paramsOptions(api) {
      this.$api[api]({ page: { current: 1, size: 999999, orders: [] } }).then((res) => {
        this.paramsSource[1].options = res.records.map((item) => {
          // 表单回填
          if (item.desformCode) {
            return {
              label: item.desformName,
              value: item.desformCode
            }
          }
          // 流程回填
          if (item.key) {
            return {
              label: item.name,
              value: item.key
            }
          }
          // 表格回填
          if (item.code) {
            return {
              label: item.name,
              value: item.code
            }
          }
        })
      })
    },
    handleParamsClose() {
      this.paramsVisible = false
    },
    handleParamsOk() {
      this.paramsVisible = false
      let obj
      switch (this.formData.eventHandle) {
        case 'createForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'modifyForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'viewForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'deleteForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'startProcess':
          obj = {
            module: 'BPM流程',
            code: this.paramsFormData.formCode
          }
          break
        case 'viewProcess':
          obj = {
            module: 'BPM流程',
            code: this.paramsFormData.formCode
          }
          break
        case 'cancelProcess':
          obj = {
            module: 'BPM流程',
            code: this.paramsFormData.formCode
          }
          break
        case 'openComponent':
          obj = {
            module: '自定义抽屉组件',
            code: this.paramsFormData.addressText
          }
          break
        case 'dynamicAPI':
          obj = {
            module: '动态API',
            code: this.paramsFormData.api,
            openDia: this.paramsFormData.openDia,
            warningMsg: this.paramsFormData.warningMsg,
            successMsg: this.paramsFormData.successMsg,
            errorMsg: this.paramsFormData.errorMsg
          }
          break
        default:
          obj = {
            module: '自定义',
            customJson: JSON.parse(this.paramsFormData.paramsText)
          }
          break
      }
      this.formData.eventParams = JSON.stringify(obj)
    },
    querySearch(queryString, cb) {
      let eventHandleArr = this.eventHandleArraly
      let results = queryString
        ? eventHandleArr.filter(this.createFilter(queryString)).map((i) => {
            return { value: i }
          })
        : eventHandleArr.map((i) => {
            return { value: i }
          })
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (eventHandle) => {
        return eventHandle.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    }
  }
}
</script>

<style scoped>
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
