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
            <div v-if="des"
                     style="margin-left: 100px"><i class="el-icon-info"></i> {{ des }}</div>
            <template #paramsText>
              <ace-edit :value.sync="paramsFormData.paramsText" width="100%" height="200px" :config="aceConfig"></ace-edit>
            </template>
          </form-list>
        </template>
      </common-dialog>
    </template>
    <template #controlRule>
      <ace-edit :value.sync="formData.controlRule" width="100%" height="300px"></ace-edit>
    </template>
    <template #eventHandle="{ scope, data }">
      <el-popover placement="top-start"
                    class="pop_left"
                    title="按钮事件定义，可使用平台内置事件，也可使用输入名称使用自定义事件 ，自定义事件需嵌入渲染器二次开发实现。内置事件如下："
                    trigger="hover">
          <p>
                  createForm 表单新建操作: 调用表单组件进行新建操作<br />
                  modifvForm 表单修改操作: 调用表单组件进行修改操作<br />
                  deleteForm 表单删除操作: 删除表格行内数据<br />
                  viewForm 表单查看操作: 调用表单组件进行查看<br />
                  openComponent 弹出窗口打开组件: 弹出已设置的组件<br />
                  dynamicAPI 接口调用: 调用方法向配置的接口发起请求<br />
                  startProcess 发起流程: 弹出弹框发起审批流程<br />
                  viewProcess 查看流程图: 弹出流程图查看界面<br />
                  cancelProcess 撤回流程: 撤回已发起的流程<br />
                  addFirstRow 新增首行: 可编辑表格新增一行数据<br />
                  addLastRow 新增尾行: 可编辑表格新增一行数据<br />
                  saveEditData 行编辑保存事件: 可编辑表格保存事件<br />
                  editRowEvent 行编辑事件: 打开行编辑进行修改<br />
                  deleteRowEvent 行删除事件: 可编辑表格删除表格行内数据<br />
                  openEditTable: 编辑类型为弹出编辑时，该事件为打开弹框，可编辑子表,需选择已配置的编辑表格<br />
                  customerFun: 该事件为用户自定义事件执行<br />
                  viewTableRow: 查看表格行数据<br />
                  exportExcel: 导出列表数据<br />
          </p>
          <i slot="reference"
             class="el-icon-question"></i>
        </el-popover>
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
      aceConfig: {},
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
          labelText: '表单',
          fieldName: 'formCode',
          placeholder: '选择表单',
          colLayout: 'singleCol',
          options: []
        }
      ],
      processSource: [
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
          labelText: '组件地址',
          fieldName: 'addressText',
          colLayout: 'singleCol'
        },
        {
          type: 'select',
          labelText: '类型',
          fieldName: 'type',
          options: [
            {
              label: '抽屉',
              value: 'drawer'
            },
            {
              label: '弹框',
              value: 'dialog'
            }
          ],
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '标题',
          fieldName: 'title',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '宽度',
          fieldName: 'width',
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
      ],
      funSource: [
        {
          type: 'blank',
          labelText: '自定义参数',
          fieldName: 'paramsText',
          slotName: 'paramsText',
          colLayout: 'singleCol'
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
          this.des = '该事件为打开新建表单事件，需选择要弹出的表单'
          break
        case 'modifyForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为修改表单事件，需选择要弹出的表单，与新建表单保持一致'
          break
        case 'viewForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为查看表单事件，需选择要弹出的表单，与新建表单保持一致'
          break
        case 'deleteForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为删除表单事件，需选择新建时选择的表单'
          break
        case 'startProcess':
        case 'cancelProcess':
        case 'viewProcess':
          this.paramsSource = this.processSource
          api = 'ProcessDefinition.listData'
          this.des = '该事件为流程事件，需选择已配置的流程模板'
          break
        case 'openComponent':
          // this.paramsSource = this.formSource
          // api = 'formGenerator.tableList'
          this.paramsSource = this.textSource
          this.des = '该事件为打开弹框事件，需输入要打开组件的地址'
          break
        case 'dynamicAPI':
          this.paramsSource = this.apiSource
          this.des = '该事件为动态API事件，需输入对应API以及提示语'
          break
        case 'openEditTable':
          this.paramsSource = this.editTableSource
          this.des = '该事件为打开编辑子表事件，需选择已配置的编辑表格'
          break
        case 'customerFun':
          this.paramsSource = this.funSource
          this.des = '该事件为用户自定义事件执行'
          this.aceConfig = {
            lang: 'javascript'
          }
          break
        default:
          this.paramsSource = this.defaultSource
          this.des = ''
          this.aceConfig = {
            lang: 'json'
          }
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
            code: this.paramsFormData.addressText,
            type: this.paramsFormData.type,
            title: this.paramsFormData.title,
            width: this.paramsFormData.width
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
        case 'openEditTable':
          obj = {
            module: '编辑表格',
            code: this.paramsFormData.editTable
          }
          break
        case 'customerFun':
          obj = {
            module: '编辑表格',
            code: this.paramsFormData.paramsText
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
