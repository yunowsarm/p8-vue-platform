<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="选项页导航设置"
                 :visible="visible"
                 width="1000px"
                 :dialog-height="dialogHeight"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 @isfullscreen="isfullscreen"
                 @close="handleCancel">
    <template #dialog>
      <form-list ref="form"
                 class="formList"
                 label-width="110px"
                 :data-source="dataSource"
                 :form="formData"
                 :exist-default-btn="false"
                 :is-custom-validate="true"
                 @custom-validate="customValidate">
        <template #reportSqlId>
          <el-select v-model="formData.reportSqlId"
                     placeholder="请选择SQL数据视图"
                     @change="onSqlIdChange">
            <el-option v-for="item in SqlViewData"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #optionLabelCol>
          <el-select v-model="formData.optionLabelCol"
                     placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #optionUrl>
          <el-select v-model="formData.optionUrl"
                     placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #icon>
          <el-select v-model="formData.icon"
                     placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"> </el-option>
          </el-select>
        </template>
        <common-tabs v-if="formData.navigation !== '2'"
                     :tabs-data="commonTabsData"
                     :active-tabs="activeTabs"
                     type="card">
          <template #dataDefinition>
            <editable-table :columns="paramColumns"
                            :render-height="renderHeight"
                            :add-row="true"
                            :params="params"
                            height="200px"
                            :list-data.sync="editableData"
                            :is-list-data="true"
                            @save-param-data="saveParamData">
              <template #id="{ scope, data }">
                <el-input v-model="scope.row.id"
                          @blur="saveParamData(data)"
                          placeholder="请输入"></el-input>
              </template>
              <template #name="{ scope, data }">
                <el-input v-model="scope.row.name"
                          @blur="saveParamData(data)"
                          placeholder="请输入"></el-input>
              </template>
              <template #icon="{ scope, data }">
                <span :class="['icon_example', scope.row.icon ? scope.row.icon : 'el-icon-picture']"
                      :style="{ color: scope.row.color }"
                      @click="showSelectIcon(scope, data)"></span>
              </template>
              <template #type="{ scope, data }">
                <el-select v-model="scope.row.type"
                           @change="saveParamData(data)"
                           style="width: 100%">
                  <el-option label="内部"
                             value="0"></el-option>
                  <el-option label="自定义"
                             value="1"></el-option>
                </el-select>
              </template>
              <template #targetUrl="{ scope, data }">
                <el-input v-if="scope.row.type === '0'"
                          @click.native="showSelectComponents(scope, data)"
                          v-model="scope.row.targetName"
                          @change="saveParamData(data)"
                          placeholder="请选择"></el-input>
                <el-input v-else
                          v-model="scope.row.targetUrl"
                          @blur="saveParamData(data)"
                          placeholder="请输入"></el-input>
              </template>
              <template #indexNo="{ scope, data }">
                <el-input-number style="120px"
                                 v-model="scope.row.indexNo"
                                 :min="1"
                                 :max="10"
                                 :step="1"
                                 @blur="saveParamData(data)"
                                 placeholder="请输入"></el-input-number>
              </template>
              <template #otherParmarsMap="{ scope, data }">
                <el-input v-model="scope.row.otherParmarsMap"
                          type="textarea"
                          :rows="3"
                          @blur="saveParamData(data)"
                          placeholder="请输入"></el-input>
              </template>
            </editable-table>
          </template>
          <template #parameterMap>
            <common-table ref="table"
                          :columns="columns"
                          :flex="210"
                          :table-setting="false"
                          :pagination="false"
                          :no-api-table-data="noApiTableData">
              <template #after="{ scope }">
                <el-input v-model="scope.row.after"></el-input>
              </template>
            </common-table>
          </template>
        </common-tabs>
      </form-list>
      <selectComponents v-if="visibleEditDrawer"
                        :visible="visibleEditDrawer"
                        @close="visibleEditDrawer = false"
                        @handleOk="componentsHandleOk"></selectComponents>
      <common-dialog title="图标选择"
                     width="50%"
                     v-if="visibleIconDrawer"
                     :visible="visibleIconDrawer"
                     :dialog-config="{ modal: false }"
                     :dialog-height="400"
                     @close="handleClose"
                     @handle-cancel="handleClose"
                     @handle-ok="doIconSelect">
        <template #dialog>
          <icon-selector @icon-select="iconSelect"
                         :color-picker="true"></icon-selector>
        </template>
      </common-dialog>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.formList ::v-deep .el-col-12 {
  height: 50px;
}
.formList ::v-deep .el-row {
  height: 100%;
  .el-col-24 {
    height: calc(100% - 160px);
  }
  #elTabsDiv,
  #elTabs {
    height: 100%;
    .list-layout {
      padding: 0;
    }
    .common-table {
      height: 100% !important;
    }
  }
}
::v-deep .el-dialog__body {
  padding: 0;
}
::v-deep .el-tabs {
  // height: 320px !important;
  .list-header button {
    margin-top: 9px;
    margin-left: 10px;
  }
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
  margin: auto;
}
::v-deep .el-table__body-wrapper {
  height: calc(100% - 40px) !important;
}
</style>
<script>
import { Input } from 'element-ui'
import { P8Form as FormList, P8Dialog as CommonDialog, P8EditTable as EditableTable, P8Tabs as CommonTabs, P8Table as CommonTable, P8IconSelector as IconSelector } from 'p8-components-ui'
import formConfig from './formConfig'
import selectComponents from '@/views/Framework/ComponentsMananger/Components/selectComponents.vue'
// import aceEdit from '@/views/Framework/ComponentsMananger/Base/Components/ace'
export default {
  name: 'Settings',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    tabsData: {
      type: Array,
      default: () => {
        return []
      }
    },
    tabsParmar: {
      type: Object,
      default: () => {
        return {}
      }
    },
    parmarsMap: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  watch: {
    // 导航模式
    'formData.navigation': {
      handler (nVal) {
        this.renderDataSource()
        if (nVal === '2') {
          this.dialogHeight = 200
          this.formData.optionUrl = ''
        } else {
          this.dialogHeight = 550
          this.onSqlIdChange(this.formData.reportSqlId)
          if (nVal === '1') {
            this.paramColumns = [
              {
                title: '选项页ID',
                dataIndex: 'id',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '选项页名称',
                dataIndex: 'name',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '图标设置',
                dataIndex: 'icon',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '切换组件类型',
                dataIndex: 'type',
                minWidth: '80px',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '目标组件',
                dataIndex: 'targetUrl',
                minWidth: '200px',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '',
                type: 'blank',
                dataIndex: 'targetName',
                width: '1px',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '',
                type: 'blank',
                dataIndex: 'color',
                width: '1px',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              }
            ]
          } else if (nVal === '0') {
            this.paramColumns = [
              {
                title: '选项页ID',
                dataIndex: 'id',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '选项页名称',
                dataIndex: 'name',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '排序号',
                dataIndex: 'indexNo',
                align: 'center',
                minWidth: '130px',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '图标设置',
                dataIndex: 'icon',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '其他参数',
                dataIndex: 'otherParmarsMap',
                align: 'center',
                minWidth: '150px',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '',
                type: 'blank',
                dataIndex: 'targetName',
                width: '1px',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              },
              {
                title: '',
                type: 'blank',
                dataIndex: 'color',
                width: '1px',
                align: 'center',
                scopedSlots: { customRender: 'custom' }
              }
            ]
          }
        }
      },
      immediate: true
    },
    // 数据类型
    'formData.dataType': {
      handler (nVal) {
        if (nVal === '0') {
          this.commonTabsData = [
            {
              label: '数据定义',
              name: 'dataDefinition'
            },
            {
              label: '参数映射',
              name: 'parameterMap'
            }
          ]
          this.noApiTableData = [{ before: 'name', after: '' }]
          this.formData.reportSqlId = ''
          this.formData.optionLabelCol = ''
          this.formData.optionUrl = ''
          this.activeTabs = 'dataDefinition'
        } else {
          this.commonTabsData = [
            {
              label: '参数映射',
              name: 'parameterMap'
            }
          ]
          this.activeTabs = 'parameterMap'
        }
        this.renderDataSource()
      },
      immediate: true
    },
    'formData.reportSqlId': {
      handler (nVal, oVal) {
        if (nVal) {
          // this.$api['desLayout.execute']({ id: nVal }).then((res) => {
          //   console.log(res,'=====rees');
          //   this.getParmarsMap(res)
          // })
        }
      }
    }
  },
  data () {
    return {
      formData: {},
      dataSource: formConfig.default,
      dialogHeight: 200,
      SqlViewData: [],
      sqlViewCols: [],
      visibleEditDrawer: false,
      visibleIconDrawer: false,
      iconTempSel: '',
      editableData: [],
      noApiTableData: [{ before: 'name', after: '' }],
      paramColumns: [
        {
          title: '选项页ID',
          dataIndex: 'id',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '选项页名称',
          dataIndex: 'name',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '图标设置',
          dataIndex: 'icon',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '',
          type: 'blank',
          dataIndex: 'targetName',
          width: '1px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '',
          type: 'blank',
          dataIndex: 'color',
          width: '1px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      renderHeight: '190px',
      params: {},
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '50px'
        },
        {
          title: '导航参数',
          dataIndex: 'before',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '映射参数',
          dataIndex: 'after',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      commonTabsData: [
        {
          label: '参数映射',
          name: 'parameterMap'
        }
      ],
      activeTabs: 'parameterMap'
    }
  },
  components: {
    'el-input': Input,
    CommonDialog,
    FormList,
    EditableTable,
    CommonTabs,
    CommonTable,
    selectComponents,
    IconSelector
    // aceEdit
  },
  created () {
    if (this.parmarsMap && this.parmarsMap.length > 0) {
      this.noApiTableData = this.parmarsMap
    }
    this.editableData = JSON.parse(JSON.stringify(this.tabsData))
  },
  mounted () {
    this.formData = { ...this.formData, ...this.tabsParmar }
    const _this = this
    this.$api['selection.getAllSqlview']().then(function (res) {
      _this.SqlViewData = res
    })
  },
  methods: {
    renderDataSource () {
      if (this.formData.navigation == '0' || this.formData.navigation == '1') {
        this.dataSource = formConfig.dicFormNavigation
        if (this.formData.dataType && this.formData.dataType == '1' && this.formData.navigation == '0') {
          this.dataSource = formConfig.dicFormdataType
          this.formData.optionValueCol = ''
        } else if (this.formData.dataType && this.formData.dataType == '1' && this.formData.navigation == '1') {
          this.dataSource = formConfig.dicFormUrl
        }
      } else {
        this.dataSource = formConfig.default
        this.formData.reportSqlId = ''
        this.formData.optionLabelCol = ''
        this.formData.optionValueCol = ''
      }
    },
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      const that = this
      this.$refs.form.validate().then((submitData) => {
        const tabsData = that.reportParams ? that.reportParams : that.editableData
        tabsData.sort((a, b) => a.indexNo - b.indexNo)
        const settingsParmars = {
          tabsParmar: that.formData,
          tabsData: tabsData,
          parmarsMap: that.noApiTableData
        }
        that.$emit('handleOk', settingsParmars)
      })
    },
    customValidate () { },
    onSqlIdChange (item) {
      const _this = this
      this.$api['selection.getSqlViewAllColumn']({ id: item }).then(function (res) {
        _this.sqlViewCols = res
        _this.getParmarsMap(res)
      })
    },
    saveParamData (data) {
      this.editableData = data
    },
    componentsHandleOk (selectLayout) {
      this.editableData[this.index].targetName = selectLayout.name
      this.editableData[this.index].componentsConfig = selectLayout
      this.editableData[this.index].targetUrl = selectLayout.url
      this.visibleEditDrawer = false
    },
    showSelectComponents (scope, data) {
      this.index = scope.$index
      this.visibleEditDrawer = true
    },
    getParmarsMap (res) {
      if (res && res.length) {
        const arr = res.map((el) => el.value)
        const parmarsMap = []
        if (this.parmarsMap && this.parmarsMap.length > 1) {
          return
        }
        arr.forEach((el) => {
          parmarsMap.push({ before: el, after: '' })
        })
        this.noApiTableData = parmarsMap
      }
    },
    showSelectIcon (scope, data) {
      this.index = scope.$index
      this.visibleIconDrawer = true
    },
    handleClose () {
      this.iconTempSel = null
      this.visibleIconDrawer = false
    },
    doIconSelect () {
      if (this.iconTempSel) {
        this.$set(this.editableData[this.index], 'icon', this.iconTempSel.icon)
        this.$set(this.editableData[this.index], 'color', this.iconTempSel.color)
      }
      this.handleClose()
    },
    iconSelect (select) {
      this.iconTempSel = select
    },
    isfullscreen (isfullscreen) {
      const arr = this.editableData
      this.editableData = []
      let that = this
      setTimeout(() => {
        that.editableData = [...arr]
      }, 200)
    }
  }
}
</script>
