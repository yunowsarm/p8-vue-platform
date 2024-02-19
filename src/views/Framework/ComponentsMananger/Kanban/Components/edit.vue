<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div>
    <form-list ref="form"
               :key="dateKey"
               :data-source="dataSource"
               :form-btn="true"
               :form="formData"
               :api="saveApi"
               @saved="saved"
               label-width="130px"
               :exist-custom-btn="true"
               :exist-default-btn="false"
               @rendered="rendered">
      <template #apiDataUrl>
        <el-input placeholder="请输入自定义数据源"
                  v-model="formData.apiDataUrl">
          <template slot="prepend">POST</template>
        </el-input>
      </template>
      <template #jsonOptions>
        <ace-edit :value="editValue"
                  width="100%"
                  height="500px"
                  @update:value="onEditModify"></ace-edit>
      </template>
      <!-- <template>
        <div id="echarts"
             :style="{ width: width, height: height }"></div>
      </template> -->
      <template #customBtn>
        <el-button type="info"
                   class="el-btn"
                   v-if="formData.functionalCategory == '2'"
                   @click="showHelp">帮助</el-button>
        <el-button type="info"
                   class="el-btn"
                   v-if="formData.functionalCategory == '4'"
                   @click="showAntvHelp">AntV_G2帮助</el-button>
        <el-button type="primary"
                   @click="handleViews"
                   v-if="formData.functionalCategory">预览 </el-button>
        <el-button type="primary"
                   v-if="formData.functionalCategory == '2'"
                   @click="handleDraw">绘制 </el-button>
        <el-button type="primary"
                   @click="handleSubmit">保存 </el-button>
      </template>
      <editable-table v-if="formData.functionalCategory !== '3'"
                      :columns="columns"
                      :add-row="false"
                      :data="searchData"
                      height="100%"
                      @save-param-data="saveTableData">
        <template #type="{ scope, data }">
          <el-select v-model="scope.row.type"
                     clearable
                     @change="saveTableData(data, scope)">
            <el-option label="文本框"
                       value="text"></el-option>
            <el-option label="目录组件"
                       value="select"></el-option>
            <el-option label="树组件"
                       value="treeSelect"></el-option>
            <el-option label="日期"
                       value="datetime"></el-option>
            <el-option label="时间范围"
                       value="datetimeRange"></el-option>
          </el-select>
        </template>
        <template #selectCode="{ scope, data }">
          <!-- 文本框 -->
          <div v-if="scope.row.type === 'text'">
            <el-input clearable
                      v-model="scope.row.selectCode"></el-input>
          </div>
          <!-- 目录组件 -->
          <div v-if="scope.row.type === 'select'">
            <el-select v-model="scope.row.selectCode"
                       style="width: 100%"
                       clearable
                       filterable
                       @change="saveTableData(data)">
              <el-option v-for="item in renderData"
                         :key="item.selectionCode"
                         :label="item.selectionName + '(' + item.selectionCode + ')'"
                         :value="item.selectionCode"> </el-option>
            </el-select>
          </div>
          <!-- 树组件 -->
          <div v-if="scope.row.type === 'treeSelect'">
            <el-select v-model="scope.row.selectCode"
                       style="width: 100%"
                       clearable
                       filterable
                       @change="saveTableData(data)">
              <el-option v-for="item in treeData"
                         :key="item.selectionCode"
                         :label="item.selectionName + '(' + item.selectionCode + ')'"
                         :value="item.selectionCode"> </el-option>
            </el-select>
          </div>
          <!-- 日期 -->
          <div v-if="scope.row.type === 'datetime'">
            <el-date-picker v-model="scope.row.selectCode"
                            type="date"
                            clearable
                            placeholder="选择日期"> </el-date-picker>
          </div>
          <!-- 时间范围 -->
          <div v-if="scope.row.type === 'datetimeRange'">
            <el-date-picker v-model="scope.row.selectCode"
                            type="daterange"
                            unlink-panels
                            style="width: 100%"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"> </el-date-picker>
          </div>
        </template>
      </editable-table>
    </form-list>
    <Dialog title="组件预览"
            :visible="renderViewVisible"
            :show-handle-btn="false"
            :dialog-config="{}"
            :dialogHeight="600"
            @isfullscreen="isfullscreen"
            @close="renderViewVisible = false"
            width="80%">
      <template #dialog>
        <dynamicLink v-if="formData.functionalCategory === '1' && renderViewVisible"
                     :data="formData"
                     ref="conten"></dynamicLink>
        <render-view v-if="formData.functionalCategory === '2' && renderViewVisible"
                     :option="getJsonOptions"
                     :app-config="formData"
                     :is-show="renderViewVisible"
                     ref="renderView"></render-view>
        <tableRenderVue v-if="formData.functionalCategory === '3' && renderViewVisible"
                        :code="formData.dataviewId"></tableRenderVue>
        <AntvView v-if="formData.functionalCategory === '4' && renderViewVisible"
                  :option="getJsonOptions"
                  :app-config="formData"
                  :is-show="renderViewVisible"
                  ref="renderView"></AntvView>
      </template>
    </Dialog>
    <Dialog title="帮助"
            :visible="helpVisible"
            :show-handle-btn="false"
            @close="helpVisible = false"
            width="80%"
            :dialog-height="600">
      <template #dialog>
        <help></help>
      </template>
    </Dialog>
    <Dialog title="帮助"
            :visible="AntvHelpVisible"
            :show-handle-btn="false"
            @close="AntvHelpVisible = false"
            width="80%"
            :dialog-height="600">
      <template #dialog>
        <AntvHelp></AntvHelp>
      </template>
    </Dialog>
    <echarts-index v-if="visibleDrawer"
                   :visible="visibleDrawer"
                   :code="formData.desformCode"
                   @onEditPlanLogoClose="onEditPlanLogoClose"></echarts-index>
  </div>
</template>

<script>
import { P8Form as FormList, P8Dialog as Dialog, P8EditTable as EditableTable } from 'p8-components-ui'
import aceEdit from './ace'
import renderView from './renderView'
import dynamicLink from './dynamic-link'
import help from './help'
import echartsIndex from './index'
import tableRenderVue from '../../Grid/Components/tableRender.vue'
import AntvView from './AntvView'
import AntvHelp from './AntvHelp1'
export default {
  name: 'CompEdit',
  components: {
    FormList,
    aceEdit,
    Dialog,
    renderView,
    dynamicLink,
    help,
    tableRenderVue,
    echartsIndex,
    EditableTable,
    AntvView,
    AntvHelp
  },
  props: {
    record: {
      type: Object,
      default: () => { }
    }
  },
  computed: {
    clientWidth () {
      return this.width
    },
    clientHeight () {
      return this.height
    },
    getJsonOptions () {
      return this.formData.jsonOptions
    }
  },
  data () {
    let dataSource = [
      {
        type: 'text',
        labelText: '组件名称',
        fieldName: 'name',
        placeholder: '请输入组件名称',
        colLayout: '',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        type: 'select',
        labelText: '图表渲染器',
        fieldName: 'functionalCategory',
        placeholder: '请选择',
        colLayout: 'doubleCol',
        options: [
          {
            label: '自定义',
            value: '1'
          },
          {
            label: 'ECharts渲染器',
            value: '2'
          },
          {
            label: '表格渲染器',
            value: '3'
          },
          {
            label: 'AntV_G2图表渲染器',
            value: '4'
          }
        ],
        rules: [
          {
            required: true
          }
        ]
      },
      // {
      //   type: 'select',
      //   labelText: '业务分类',
      //   fieldName: 'businessClassify',
      //   placeholder: '请选择',
      //   colLayout: 'doubleCol',
      //   options: [
      //     {
      //       label: '业务一',
      //       value: '0'
      //     },
      //     {
      //       label: '业务二',
      //       value: '1'
      //     }
      //   ],
      //   rules: [
      //     {
      //       required: true
      //     }
      //   ]
      // },
      {
        type: 'text',
        labelText: '组件地址',
        fieldName: 'url',
        placeholder: '请输入组件地址',
        colLayout: '',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        type: 'number',
        labelText: '默认宽度',
        fieldName: 'defaultWidth',
        min: 0,
        max: 24,
        placeholder: '请输入默认宽度',
        colLayout: 'doubleCol',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        type: 'number',
        labelText: '最小宽度',
        fieldName: 'minWidth',
        min: 0,
        max: 24,
        placeholder: '请输入最小宽度',
        colLayout: 'doubleCol',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        type: 'number',
        labelText: '默认高度',
        fieldName: 'defaultHigh',
        min: 0,
        max: 24,
        placeholder: '请输入默认高度',
        colLayout: 'doubleCol',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        type: 'number',
        labelText: '最小高度',
        fieldName: 'minHigh',
        min: 0,
        max: 24,
        placeholder: '请输入最小高度',
        colLayout: 'doubleCol',
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
        colLayout: 'doubleCol',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        type: 'select',
        labelText: '是否终端用户可用',
        fieldName: 'availableEndUsers',
        placeholder: '请选择',
        colLayout: 'doubleCol',
        options: [
          {
            label: '启用',
            value: 1
          },
          {
            label: '停用',
            value: 0
          }
        ],
        rules: [
          {
            required: true
          }
        ]
      },
      // {
      //   type: 'multiple',
      //   labelText: '组件类别',
      //   fieldName: 'urlType',
      //   colLayout: 'doubleCol',
      //   options: [
      //     {
      //       label: '计划完成情况',
      //       value: '0'
      //     },
      //     {
      //       label: '飞行试验',
      //       value: '1'
      //     },
      //     {
      //       label: '质量问题',
      //       value: '2'
      //     },
      //     {
      //       label: '第一层',
      //       value: '3'
      //     },
      //     {
      //       label: '第二层',
      //       value: '4'
      //     }
      //   ],
      //   rules: [
      //     {
      //       required: true,
      //       message: '必填'
      //     }
      //   ]
      // },
      {
        type: 'blank',
        labelText: '自定义数据源',
        fieldName: 'apiDataUrl',
        slotName: 'apiDataUrl',
        placeholder: '请输入自定义数据源',
        colLayout: 'doubleCol'
      },
      {
        type: 'select',
        labelText: '数据视图数据源',
        fieldName: 'dataviewId',
        placeholder: '请选择',
        colLayout: 'doubleCol',
        optionUrl: {
          api: 'kanbanComponent.dataViewList'
        }
      },
      {
        type: 'select',
        labelText: '业务分类',
        fieldName: 'classification',
        placeholder: '请选择',
        colLayout: 'doubleCol',
        optionUrl: {
          api: 'thirdPartInterface.getDic',
          params: { dicType: 'SELECT_TYPE' }
        },
        rules: [
          {
            required: true,
            message: '该项为必填项'
          }
        ]
      }
    ]
    return {
      renderData: [],
      treeData: [],
      columns: [
        {
          title: '查询模式',
          dataIndex: 'type',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询目标字段',
          dataIndex: 'fieldName',
          minWidth: 160,
          // scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询文本',
          dataIndex: 'labelText',
          minWidth: 160,
          // scopedSlots: { customRender: 'custom' }
        },
        {
          title: '选项组件',
          dataIndex: 'selectCode',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        }
      ],
      searchData: [],
      saveApi: 'kanbanComponent.save',
      renderViewVisible: false,
      helpVisible: false,
      AntvHelpVisible: false,
      dataSource,
      editValue: '',
      formData: {
        defaultWidth: 4,
        defaultHigh: 3,
        minWidth: 4,
        minHigh: 3,
        indexNo: 1,
        availableEndUsers: 1,
        style: '',
        functionalCategory: '',
        url: '',
        dataviewId: '',
        apiDataUrl: '',
        jsonOptions: '',
        classification: ''
      },
      visibleDrawer: false,
      myChart: null,
      dateKey: new Date().getTime(),
      height: 400 + 'px',
      width: 300 + 'px'
    }
  },
  mounted () {
    this.$api['selection.list']({ selectionType: 1, page: { current: 1, size: -1, orders: [] } }).then((res) => {
      this.renderData = res.records
    })
    this.$api['selection.list']({ selectionType: 2, page: { current: 1, size: -1, orders: [] } }).then((res) => {
      this.treeData = res.records
    })
  },
  methods: {
    rendered () {
      // 所有表单元素渲染后调用rendered
      if (this.record.id) {
        this.getFormData()
      }
    },
    getFormData () {
      if (this.formData.searchConfigValue) {
        this.searchData = JSON.parse(this.formData.searchConfigValue)
      }
      if (this.record.urlType !== null) {
        this.record.urlType = this.record.urlType.split(',')
      }
      this.formData = { ...this.formData, ...this.record }
      if (this.formData.jsonOptions) {
        this.editValue = this.formData.jsonOptions
      }
    },
    saved (res) {
      this.$emit('saveSuccess', res)
    },
    handleSubmit () {
      this.$refs.form.validate().then((queryParams) => {
        if (queryParams.urlType) {
          queryParams.urlType = queryParams.urlType.toString()
        }
        if (this.formData.searchConfigValue) {
          if (this.formData.searchConfigValue.indexOf('null') !== -1) {
            queryParams.searchConfigValue = ''
          } else {
            queryParams.searchConfigValue = JSON.stringify(this.formData.searchConfigValue)
          }
        } else {
          queryParams.searchConfigValue = ''
        }
        this.$refs.form.submitForm(queryParams, this.saveApi)
      })
    },
    handleViews () {
      this.renderViewVisible = true
    },
    isfullscreen () {
      // this.$refs.kanbanView.reload()
    },
    showHelp () {
      this.helpVisible = true
    },
    showAntvHelp () {
      this.AntvHelpVisible = true
    },
    onEditModify (v) {
      this.formData.jsonOptions = v
    },
    handleDraw () {
      this.visibleDrawer = true
    },
    onEditPlanLogoClose (obj, desformCode) {
      if (obj) {
        this.editValue = JSON.stringify(obj)
        this.formData.jsonOptions = JSON.stringify(obj)
        this.formData.desformCode = desformCode
      }
      this.visibleDrawer = false
    },
    saveTableData (data) {
      this.formData.searchConfigValue = data
    }
  },
  watch: {
    'formData.functionalCategory': function (newVal, oldVal) {
      // 功能类别为json自定义
      if (newVal && oldVal) {
        this.editValue = ''
        this.formData.url = ''
        // 切换清空json框
        this.formData.jsonOptions = ''
        this.formData.dataviewId = ''
      }
      if (newVal === '2') {
        this.dataSource = this.dataSource
          .filter((item) => {
            return item.fieldName !== 'url' && item.fieldName !== 'dataviewId' && item.fieldName !== 'urlType' && item.fieldName !== 'jsonOptions'
          })
          .concat([
            {
              type: 'select',
              labelText: '数据视图数据源',
              fieldName: 'dataviewId',
              placeholder: '请选择',
              colLayout: 'doubleCol',
              optionUrl: {
                api: 'kanbanComponent.dataViewList'
              }
            },
            {
              type: 'blank',
              labelText: 'json配置',
              slotName: 'jsonOptions',
              fieldName: 'jsonOptions',
              colLayout: '',
              rules: [
                {
                  required: true,
                  message: '该项为必填项'
                }
              ]
            }
          ])
      } else if (newVal === '3') {
        this.dataSource = this.dataSource.filter((item) => {
          return item.fieldName !== 'url' && item.fieldName !== 'dataviewId' && item.fieldName !== 'jsonOptions' && item.fieldName !== 'urlType'
        }).concat([
          {
            type: 'select',
            labelText: '表格数据源',
            fieldName: 'dataviewId',
            placeholder: '请选择',
            colLayout: 'doubleCol',
            optionUrl: {
              api: 'selection.getAllReport',
              label: 'label',
              value: 'code'
            }
          }
        ])
      } else if (newVal === '4') {
        this.dataSource = this.dataSource
          .filter((item) => {
            return item.fieldName !== 'url' && item.fieldName !== 'dataviewId' && item.fieldName !== 'urlType' && item.fieldName !== 'jsonOptions'
          })
          .concat([
            {
              type: 'select',
              labelText: '数据视图数据源',
              fieldName: 'dataviewId',
              placeholder: '请选择',
              colLayout: 'doubleCol',
              optionUrl: {
                api: 'kanbanComponent.dataViewList'
              }
            },
            {
              type: 'blank',
              labelText: 'json配置',
              slotName: 'jsonOptions',
              fieldName: 'jsonOptions',
              colLayout: '',
              rules: [
                {
                  required: true,
                  message: '该项为必填项'
                }
              ]
            }
          ])
      } else {
        this.dataSource = this.$options.data().dataSource
      }
      this.dateKey = new Date().getTime()
    },
    'formData.dataviewId': function (newVal, oldVal) {
      let that = this
      if (this.formData.functionalCategory == '3') {
        return
      }
      if (newVal) {
        if (this.record.id) {
          if (this.flag) {
            this.$api['formGenerator.sqlParam']({ sqlId: newVal }).then(res => {
              if (res && res.length) {
                let arr = []
                res.forEach(el => {
                  arr.push({ fieldName: el.paramName, labelText: el.paramTxt, paramValue: '' })
                })
                that.searchData = arr
              }
            })
          }
        } else {
          this.$api['formGenerator.sqlParam']({ sqlId: newVal }).then(res => {
            if (res && res.length) {
              let arr = []
              res.forEach(el => {
                arr.push({ fieldName: el.paramName, labelText: el.paramTxt, paramValue: '' })
              })
              that.searchData = arr
            }
          })
        }
      }
      this.flag = true
    }
  }
}
</script>
