<template>
  <div>
    <form-list
      ref="form"
      class="form_list"
      :data-source="dataSource"
      :form="formData"
      :api="saveApi"
      @saved="saved"
      label-width="95px"
      :is-custom-validate="true"
      @custom-validate="customValidate"
      @rendered="rendered"
    >
      <template #tableName>
        <el-input v-model="formData.tableName" :disabled="modifyDisable({}, 'main') || keyIsDbSynch" placeholder="请输入表名">
          <template v-if="!(record && record.id)" slot="prepend">CGTABLE_</template>
        </el-input>
      </template>
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
    <common-tabs :tabs-data="tabsData" :height="height" type="border-card" class="el_tabs" :active-tabs="activeTabs" :has-full-screen="true">
      <template #databaseProp>
        <editable-table
          :columns="databasePropColumns"
          :add-row="true"
          :disabled="modifyDisable({}, 'main')"
          api="formGenerator.getDefaultProp"
          :data="databasePropData"
          @save-param-data="saveParamData"
        >
          <template #fieldName="{ scope, data }">
            <el-input v-model="scope.row.fieldName" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"></el-input>
          </template>
          <template #fieldDisplay="{ scope, data }">
            <el-input v-model="scope.row.fieldDisplay" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"></el-input>
          </template>
          <template #fieldIsPrimaryKey="{ scope, data }">
            <el-checkbox
              v-model="scope.row.fieldIsPrimaryKey"
              true-label="1"
              false-label="0"
              @change="saveParamData(data)"
              :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"
            ></el-checkbox>
          </template>
          <template #fieldIsNull="{ scope, data }">
            <el-checkbox
              v-model="scope.row.fieldIsNull"
              true-label="1"
              false-label="0"
              @change="saveParamData(data)"
              :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"
            ></el-checkbox>
          </template>
          <template #fieldType="{ scope, data }">
            <el-select v-model="scope.row.fieldType" clearable @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)">
              <template v-for="(item, index) in fieldTypeOption">
                <el-option :label="item.label" :value="item.label" :key="index"></el-option>
              </template>
            </el-select>
          </template>
          <template #fieldLength="{ scope, data }">
            <el-input-number v-model="scope.row.fieldLength" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"></el-input-number>
          </template>
          <template #fieldPrecision="{ scope, data }">
            <el-input-number v-model="scope.row.fieldPrecision" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"></el-input-number>
          </template>
          <template #fieldDefaultValue="{ scope, data }">
            <el-input v-model="scope.row.fieldDefaultValue" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"></el-input>
          </template>
          <!-- <template #dictField="{scope, data}">
            <el-input v-model="scope.row.dictField" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable()"></el-input>
          </template> -->
          <template #orderNumber="{ scope, data }">
            <el-input-number v-model="scope.row.orderNumber" @blur="saveParamData(data)" :disabled="tableCellCommonDisable(scope.row) || modifyDisable(scope.row)"></el-input-number>
          </template>
        </editable-table>
      </template>
      <template #foreignKey>
        <editable-table :columns="foreignKeyColumns" api="formGenerator.getDefaultProp" :data="forengnKeyData" @save-param-data="saveKeyData">
          <template #fieldName="{ scope, data }">
            <el-input v-model="scope.row.fieldName" disabled @blur="saveKeyData(data)"></el-input>
          </template>
          <template #fieldDisplay="{ scope, data }">
            <el-input v-model="scope.row.fieldDisplay" disabled @blur="saveKeyData(data)"></el-input>
          </template>
          <template #foreignTable="{ scope, data }">
            <el-input v-model="scope.row.foreignTable" @blur="saveKeyData(data)" :disabled="tableCellCommonDisable(scope.row)"></el-input>
          </template>
          <template #foreignField="{ scope, data }">
            <el-input v-model="scope.row.foreignField" @blur="saveKeyData(data)" :disabled="tableCellCommonDisable(scope.row)"></el-input>
          </template>
        </editable-table>
      </template>
    </common-tabs>
  </div>
</template>

<script>
import { Input, Checkbox, InputNumber, Select, Option, P8Form as FormList, P8Tabs as CommonTabs, P8EditTable as EditableTable } from 'p8-components-ui'
export default {
  name: 'DataSourceEdit',
  components: {
    FormList,
    CommonTabs,
    EditableTable,
    'el-input': Input,
    'el-checkbox': Checkbox,
    'el-input-number': InputNumber,
    'el-select': Select,
    'el-option': Option
  },
  props: {
    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    const tabHeight = document.documentElement.clientHeight - 330
    return {
      saveApi: 'formGenerator.dataSourceSave',
      viewApi: 'formGenerator.dataSourceFormView',
      dataSource: [
        {
          type: 'blank',
          labelText: '表名',
          slotName: 'tableName',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '表描述',
          fieldName: 'tableDesc',
          placeholder: '请输入表描述',
          colLayout: 'singleCol',
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'select',
          labelText: '表类型',
          fieldName: 'tableType',
          placeholder: '请选择表类型',
          colLayout: 'singleCol',
          options: [
            {
              label: '主表',
              value: '1'
            },
            {
              label: '子表',
              value: '0'
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        }
      ],
      formData: {
        fields: [],
        foreignKey: []
      },
      height: tabHeight + 'px',
      tabsData: [
        {
          label: '数据库属性',
          name: 'databaseProp',
          icon: 'icon-multi-project-manage'
        },
        {
          label: '外键',
          name: 'foreignKey',
          icon: 'icon-business-execution'
        }
      ],
      activeTabs: 'databaseProp',
      databasePropColumns: [
        // {
        //   title: '#',
        //   type: 'index'
        // },
        {
          title: '字段名',
          dataIndex: 'fieldName',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段别名',
          dataIndex: 'fieldDisplay',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否主键',
          dataIndex: 'fieldIsPrimaryKey',
          minWidth: 80,
          align: 'center',
          default: '0',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否非空字段',
          dataIndex: 'fieldIsNull',
          minWidth: 100,
          align: 'center',
          default: '0',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段类型',
          dataIndex: 'fieldType',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段长度',
          dataIndex: 'fieldLength',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段精度',
          dataIndex: 'fieldPrecision',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '默认值',
          dataIndex: 'fieldDefaultValue',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        // { // 去掉 dictField 列
        //   title: 'dictField',
        //   dataIndex: 'dictField',
        //   minWidth: 140,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '排序号',
          dataIndex: 'orderNumber',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          // 默认隐藏
          title: '是否同步',
          dataIndex: 'fieldSyncType',
          minWidth: 140,
          default: '0',
          formatter: function (row, column, cellValue, index) {
            let value = ''
            if (cellValue === '0') {
              value = '未同步'
            } else {
              value = '已同步'
            }
            return value
          },
          isshow: false
        }
      ],
      foreignKeyColumns: [
        {
          title: '#',
          type: 'index',
          width: 40
        },
        {
          title: '字段名',
          dataIndex: 'fieldName',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段别名',
          dataIndex: 'fieldDisplay',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '主表名',
          dataIndex: 'foreignTable',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '主表字段',
          dataIndex: 'foreignField',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      fieldParams: {
        fields: [],
        foreignKey: []
      },
      fieldTypeOption: [],
      databasePropData: [], // 数据源属性table数据
      forengnKeyData: [], // 外键table数据
      keyIsDbSynch: false // 数据源属性ID是否已同步
    }
  },
  mounted() {
    this.$api['formGenerator.getFieldList']().then((res) => {
      if (res) {
        this.fieldTypeOption = res
      }
    })
  },
  methods: {
    rendered() {
      // 所有表单元素渲染后调用rendered
      if (this.record.id) {
        this.getFormData()
        this.getViewData()
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    getFormData() {
      console.log(this.record, 'this.record')
      this.formData = Object.assign({}, this.record)
    },
    getViewData() {
      const _this = this
      const timer = setTimeout(() => {
        this.$api[this.viewApi]({
          id: _this.record.id,
          permissionVo: { router: this.$route.name, resourceId: '' }
        }).then((res) => {
          if (res.fields && res.fields.length) {
            _this.databasePropData = res.fields
            _this.forengnKeyData = res.fields
            if (res.foreignKey && res.foreignKey.length) {
              res.foreignKey.forEach((item) => {
                const filterItem = _this.forengnKeyData.filter((kitem) => kitem.fieldName === item.fieldName)
                if (filterItem.length > 0) {
                  filterItem[0] = { ...filterItem[0], ...item }
                }
                const filterIndex = _this.forengnKeyData.findIndex((item) => item.fieldName === filterItem[0].fieldName)
                this.$set(_this.forengnKeyData, filterIndex, filterItem[0])
              })
            }
          }
        })
        clearTimeout(timer)
      }, 100)
    },
    saved(res) {
      console.log('修改页面关闭时的回调方法')
      this.$emit('saveSuccess', res)
    },
    saveParamData(data) {
      console.log(data)
      this.fieldParams.fields = data
      this.forengnKeyData = data
    },
    tableCellCommonDisable(row) {
      if (row.fieldName === 'ID' && row.fieldSyncType === '1') {
        this.keyIsDbSynch = true
      }
      /**
       * 表格单元格 通用禁用
       */
      const normalDis = ['ID', 'CREATE_BY', 'UPDATE_BY', 'CREATE_TIME', 'UPDATE_TIME', 'SECRET_LEVEL', 'INDEX_NO']
      return normalDis.indexOf(row.fieldName) > -1
    },
    modifyDisable(row, pos) {
      /**
       * 修改时, isDbSynch === '1'(已同步)
       *    表单: 表名 / 是否同步 禁止修改
       *    数据库属性: 整体禁止(新建按钮 / 表格单元格)
       */
      if (pos && pos === 'main') {
        return Object.keys(this.record).length && this.record.isDbSynch === '1'
      } else {
        return Object.keys(this.record).length && row.fieldSyncType === '1'
      }
    },
    saveKeyData(data) {
      const saveForeignKeyData = []
      data.map((item) => {
        if (item.foreignTable && item.foreignField) {
          const saveItem = {
            fieldName: item.fieldName,
            fieldDisplay: item.fieldDisplay,
            foreignTable: item.foreignTable,
            foreignField: item.foreignField
          }
          saveForeignKeyData.push(saveItem)
        }
      })
      this.fieldParams.foreignKey = saveForeignKeyData
    },
    // 保存前自定义校验，进行数据库属性的非空校验与重复性校验
    customValidate(saveParams) {
      const _this = this
      const fieldNameArr = []
      if (this.fieldParams.fields.length) {
        this.fieldParams.fields.map((item) => {
          item.fieldName = item.fieldName.trim()
          // 小写转为大写
          item.fieldName = item.fieldName.toUpperCase()
          if (item.fieldName && fieldNameArr.indexOf(item.fieldName) === -1) {
            fieldNameArr.push(item.fieldName)
          }
        })
      }
      if (fieldNameArr.length === this.fieldParams.fields.length) {
        if (!(this.record && this.record.id)) {
          saveParams.tableName = 'CGTABLE_' + saveParams.tableName
        } else {
          if (saveParams.tableName.length > 8) {
            const str = saveParams.tableName.slice(0, 7)
            if (str !== 'CGTABLE') {
              saveParams.tableName = 'CGTABLE_' + saveParams.tableName
            }
          } else {
            saveParams.tableName = 'CGTABLE_' + saveParams.tableName
          }
        }
        if (this.keyIsDbSynch) {
          this.$confirm('当前修改会导致该数据源关联的表单状态变为未发布，需要手动发布，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            callback: (action) => {
              if (action === 'confirm') {
                const params = { ...saveParams, ..._this.fieldParams }
                _this.$refs.form.submitForm(params, _this.saveApi)
              }
            }
          })
        } else {
          const params = { ...saveParams, ...this.fieldParams }
          this.$refs.form.submitForm(params, this.saveApi)
        }
      } else {
        this.$message({
          type: 'error',
          message: '数据库属性中存在空值或重复值，无法保存，请检查！'
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.form_list {
  margin: 0 16px;
}
.el_tabs ::v-deep{
  margin: 0 26px;
  .el-tabs__content {
    padding: 0 !important;
  }
}
</style>
