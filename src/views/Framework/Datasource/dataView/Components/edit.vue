<template>
  <div>
    <form-list ref="form"
               class="form_list"
               :data-source="modifiedData"
               :form="formData"
               :api="saveApi"
               @saved="saved"
               label-width="90px"
               @rendered="rendered"
               :is-custom-validate="true"
               @custom-validate="parseCheck">
      <template #sql>
        <el-popover placement="top-start"
                    class="pop_left"
                    title="系统内置的登录人信息字段"
                    trigger="hover">
          <p>
            当前登录人id: currentUserId<br />
            当前登录人用户名: currentUserName<br />
            当前登录人密级id: currentUserConfidentialite<br />
            当前登录人密级释义: currentUserConfidentialiteDisplay<br />
            当前登录人部门id: currentDepartmentId<br />
            当前登录人部门名称: currentDepartmentName<br />
            当前登录人真实名称: currentRealName<br />
          </p>
          <i slot="reference"
             class="el-icon-question"></i>
        </el-popover>
        <codemirror v-model="formData.sql"
                    :options="cmOptions"></codemirror>
      </template>
      <template #btn>
        <el-button @click="cancel">取 消</el-button>
        <!-- <el-button type="primary" @click="searchResult">查询结果</el-button> -->
      </template>
    </form-list>
    <div></div>
    <common-tabs :tabs-data="tabsData"
                 type="border-card"
                 class="el_tabs"
                 :height="renderHeight"
                 :active-tabs="activeTabs"
                 @tab-click="tabClick"
                 :has-full-screen="true">
      <template #tableConfigDetails>
        <editable-table :columns="paramColumns"
                        :add-row="true"
                        :params="params"
                        api="formGenerator.sqlParam"
                        :render-height="renderHeight"
                        @save-param-data="saveParamData">
          <template #paramName="{ scope, data }">
            <el-input v-model="scope.row.paramName"
                      @blur="saveParamData(data)"></el-input>
          </template>
          <template #paramTxt="{ scope, data }">
            <el-input v-model="scope.row.paramTxt"
                      @blur="saveParamData(data)"></el-input>
          </template>
          <template #paramValue="{ scope, data }">
            <el-input v-model="scope.row.paramValue"
                      @blur="saveParamData(data)"></el-input>
          </template>
          <template #orderNum="{ scope, data }">
            <el-input-number v-model="scope.row.orderNum"
                             @blur="saveParamData(data)"></el-input-number>
          </template>
        </editable-table>
      </template>
      <template #tableParam>
        <form-list ref="tableParamForm"
                   :data-source="tableParamSource"
                   :form="formData"
                   :exist-default-btn="false"
                   style="height: 50px;margin-top:50px;"
                   label-width="100px"></form-list>
        <editable-table :columns="strategyColumns"
                        style="height:calc(100% - 110px);width:100%;"
                        :add-row="true"
                        :need-params="true"
                        :data="tableParamData"
                        :params="strategyParams"
                        api=""
                        @save-param-data="saveStrategyData">
          <template #classPath="{ scope, data }">
            <el-input v-model="scope.row.classPath"
                      @blur="saveStrategyData(data)"></el-input>
          </template>
          <template #alias="{ scope, data }">
            <el-input v-model="scope.row.alias"
                      @blur="saveStrategyData(data)"></el-input>
          </template>
          <template #name="{ scope, data }">
            <el-input v-model="scope.row.name"
                      @blur="saveStrategyData(data)"></el-input>
          </template>
          <template #enable="{ scope, data }">
            <el-select v-model="scope.row.enable"
                       @change="saveStrategyData(data)">
              <el-option label="是"
                         value="1"></el-option>
              <el-option label="否"
                         value="0"></el-option>
            </el-select>
          </template>
        </editable-table>
      </template>
      <template #resultExecution>
        <div style="margin: 10px 35px"><el-button round
                     type="primary"
                     @click="execution">执行</el-button></div>
        <editable-table class="editTable"
                        :columns="resultExecutionColumns"
                        :add-row="false"
                        :data="changeTableData"
                        @save-param-data="saveTableData">
          <template #fieldName="{ scope, data }">
            <el-input v-model="scope.row.fieldName"
                      :disabled="!!scope.row.isCustomColumn"
                      @blur="saveTableData(data)"></el-input>
          </template>
          <template #fieldType="{ scope, data }">
            <el-input v-model="scope.row.fieldType"
                      :disabled="!!scope.row.isCustomColumn"
                      @blur="saveTableData(data)"></el-input>
          </template>
          <template #fieldTxt="{ scope, data }">
            <el-input v-model="scope.row.fieldTxt"
                      @blur="saveTableData(data)"></el-input>
          </template>
        </editable-table>
      </template>
      <template v-if="currentTab === 'SearchResult'"
                #SearchResult>
        <search-result v-if="formData.sql"
                       :sql="formData.sql"></search-result>
      </template>
    </common-tabs>
  </div>
</template>

<script>
import { Input, InputNumber, P8Form as FormList, P8EditTable as EditableTable, P8Tabs as CommonTabs } from 'p8-components-ui'
import { codemirror } from 'vue-codemirror'
import searchResult from './searchResult'
// require styles
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/mode/sql/sql'

export default {
  name: 'SqlEdit',
  components: {
    FormList,
    codemirror,
    EditableTable,
    CommonTabs,
    searchResult,
    'el-input': Input,
    'el-input-number': InputNumber
  },
  props: {
    record: {
      type: Object,
      default: () => { }
    },
    tableList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    const height = document.documentElement.clientHeight - 500
    return {
      renderHeight: height + 'px',
      activeTabs: 'tableConfigDetails',
      currentTab: 'tableConfigDetails',
      tabsData: [
        {
          label: '参数设置',
          name: 'tableConfigDetails',
          icon: 'icon-multi-project-manage'
        },
        {
          label: '过滤设置',
          name: 'tableParam',
          icon: 'icon-baobiaocanshu'
        },
        {
          label: '元数据',
          name: 'resultExecution',
          icon: 'icon-planning'
        },
        {
          label: '执行结果',
          name: 'SearchResult',
          icon: 'icon-biaogeanniu'
        }
      ],
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'sql',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true
        // more codemirror options, 更多 codemirror 的高级配置...
      },
      saveApi: 'formGenerator.sqlSave',
      dataSource: [
        {
          type: 'text',
          labelText: 'SQL编码',
          fieldName: 'code',
          placeholder: '请输入SQL编码',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            },
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  // callback 是提示的信息
                  return callback(new Error('SQL编码不能为空'))
                } else {
                  if (value !== this.record.code) {
                    // 调用封装了的异步效验方法，
                    this.$api['formGenerator.paramCheck']({ code: value }).then((response) => {
                      if (response) {
                        callback()
                      } else {
                        this.$message.warning('SQL编码重复')
                      }
                    })
                  } else {
                    callback()
                  }
                }
              },
              trigger: 'blur'
            }
          ],
          fieldConfig: {
            disabled: false
          }
        },
        {
          type: 'text',
          labelText: 'SQL名字',
          fieldName: 'name',
          placeholder: '请输入SQL名字',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            },
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  // callback 是提示的信息
                  return callback(new Error('SQL名字不能为空'))
                } else {
                  if (value !== this.record.name) {
                    // 调用封装了的异步效验方法，
                    this.$api['formGenerator.paramCheck']({ name: value }).then((response) => {
                      if (response) {
                        callback()
                      } else {
                        this.$message.warning('SQL名字重复')
                      }
                    })
                  } else {
                    callback()
                  }
                }
              },
              trigger: 'blur'
            }
          ],
          fieldConfig: {
            disabled: false
          }
        },
        {
          type: 'blank',
          labelText: 'SQL正文',
          fieldName: 'sql',
          slotName: 'sql',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        // {
        //   type: 'textarea',
        //   labelText: 'SQL正文',
        //   fieldName: 'sql',
        //   placeholder: '请输入SQL正文',
        //   colLayout: 'singleCol',
        //   rules: [
        //     {
        //       required: true
        //     }
        //   ]
        // },
        {
          type: 'select',
          labelText: '动态数据源',
          fieldName: 'dbSource',
          placeholder: '下拉选择你要的',
          colLayout: 'singleCol',
          options: [
            {
              label: 'DB_SOURCE1',
              value: 'DB_SOURCE1'
            },
            {
              label: 'DB_SOURCE2',
              value: 'DB_SOURCE2'
            }
          ],
          rules: [
            {
              required: true
            }
          ],
          fieldConfig: {
            disabled: false
          }
        },
        {
          type: 'textarea',
          labelText: '描述',
          fieldName: 'content',
          placeholder: '请输入描述',
          colLayout: 'singleCol',
          rules: [
            {
              required: true
            }
          ],
          fieldConfig: {
            disabled: false
          }
        }
      ],
      formData: {
        sql: ''
      },
      paramColumns: [
        {
          title: '参数字段',
          dataIndex: 'paramName',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '参数文本',
          dataIndex: 'paramTxt',
          minWidth: 180,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '参数默认值',
          dataIndex: 'paramValue',
          minWidth: 180,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '排序',
          dataIndex: 'orderNum',
          width: 140,
          default: undefined,
          scopedSlots: { customRender: 'custom' }
        }
      ],
      strategyColumns: [
        // {
        //   title: '类路径',
        //   dataIndex: 'classPath',
        //   minWidth: 140,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '表别名',
          dataIndex: 'alias',
          minWidth: 100,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '过滤字段',
          dataIndex: 'name',
          minWidth: 100,
          default: '',
          scopedSlots: { customRender: 'custom' }
        }
        // {
        //   title: '是否开启',
        //   dataIndex: 'enable',
        //   minWidth: 180,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
      ],
      params: {},
      strategyParams: {},
      sqlParams: {
        sqlParamList: [],
        strategyList: []
      },
      tableParamSource: [
        {
          type: 'text',
          labelText: '类路径',
          fieldName: 'classPath',
          colLayout: 'doubleCol',
          rules: [{ required: false }]
        },
        {
          type: 'select',
          labelText: '是否开启',
          fieldName: 'enable',
          colLayout: 'doubleCol',
          placeholder: '请选择存储数据源',
          options: [
            { value: '1', label: '是' },
            { value: '0', label: '否' }
          ],
          rules: [{ required: false }]
        }
      ],
      tableParamData: [],
      resultExecutionColumns: [
        {
          title: '字段名称',
          dataIndex: 'fieldName',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段类型',
          dataIndex: 'fieldType',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段文本',
          dataIndex: 'fieldTxt',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      changeTableData: [],
      searchResultVisible: false
    }
  },
  computed: {
    modifiedData () {
      // const { dataSource, record } = this
      // const arr = ['name', 'code']
      // for (let i in dataSource) {
      //   if (arr.includes(dataSource[i].fieldName)) {
      //     dataSource[i].fieldConfig.disabled = record.id ? true : false
      //   }
      // }
      return this.dataSource
    }
  },
  methods: {
    rendered () {
      // 所有表单元素渲染后调用rendered
      if (this.record.id) {
        this.getFormData()
      }
    },
    cancel () {
      this.$emit('cancel')
    },
    getFormData () {
      const that = this
      this.formData = Object.assign({}, this.record)
      this.changeSql(this.record.id)
      this.$api['formGenerator.columnList']({ sqlId: this.record.id }).then((res) => {
        that.formData.classPath = res.classPath
        that.formData.enable = res.enable
        that.tableParamData = res.strategyList
      })
      this.$api['formGenerator.sqlItem']({ sqlId: this.record.id }).then((res) => {
        that.changeTableData = res
      })
    },
    tabClick (target) {
      if (target.name === 'configColumnDetails') {
        const arr = JSON.parse(JSON.stringify(this.reportParams.reportItem.filter((el) => el.isListShow || el.isCustomColumn)))
        this.editableData.forEach((el) => {
          if (el.columnConfig) {
            if (typeof el.columnConfig === 'string') {
              el.columnConfig = JSON.parse(el.columnConfig)
            }
          } else {
            el.columnConfig = { iconConfig: [], countArr: [], countStr: '' }
          }
        })
        const editableData = JSON.parse(JSON.stringify(this.editableData))
        const newArr = []
        arr.forEach((val) => {
          const find = editableData.find((el) => el.fieldName === val.fieldName)
          if (find && val.isCustomColumn && find.isCustomColumn) {
            newArr.push(find)
          } else {
            newArr.push(val)
          }
        })
        this.editableData = newArr
      }
      if (target.name === 'editConfig') {
        const arr = JSON.parse(JSON.stringify(this.reportParams.reportItem.filter((el) => el.isListShow || el.isCustomColumn)))
        const newArr = []
        arr.forEach((val) => {
          const find = this.editConfigData.find((el) => el.fieldName === val.fieldName)
          if (find && val.isCustomColumn && find.isCustomColumn) {
            newArr.push(find)
          } else {
            newArr.push(val)
          }
        })
        this.editConfigData = newArr
      }
      this.currentTab = target.name
    },
    saveParamData (data) {
      this.sqlParams.sqlParamList = data
    },
    saveStrategyData (data) {
      this.sqlParams.strategyList = data
    },
    saved (res) {
      console.log('修改页面关闭时的回调方法')
      this.$emit('saveSuccess', res)
    },

    /*
    保存前验证
    params: 修改或者新增时表单对象
    recordId: 修改数据当前id，新建recordId = ''
    */
    checkDuplicate (params, recordId) {
      const arr = [...this.tableList]
      if (recordId) {
        return false
      } else {
        for (let i = 0; i < arr.length; i++) {
          if (params.code === arr[i].code || params.name === arr[i].name) {
            return true
          } else {
            return false
          }
        }
      }
    },

    //  保存的提交
    parseCheck (saveParams) {
      // let arr = []
      const params = { ...saveParams, ...this.sqlParams }
      // if (this.tableList && this.tableList.length > 0) {
      //   this.tableList.forEach((item) => {
      //     if (item.name === params.name || item.code === params.code) {
      //       arr.push(item)
      //     }
      //   })
      // }
      const _this = this
      this.$api['formGenerator.sqlParseCheck'](params).then((res) => {
        if (res) {
          // if (arr.length > 0) {
          //   _this.$message({ message: '编码或名字重复', type: 'warning' })
          // } else {
          _this.$refs.form.submitForm(params, _this.saveApi)
          // }
        } else {
          _this.$message({
            message: 'SQL解析失败，请重新检查！',
            type: 'warning'
          })
        }
      })
    },
    changeSql (val) {
      this.params = { sqlId: val }
    },
    saveTableData (data) {
      this.sqlParams.sqlItemList = data
    },
    execution () {
      const that = this
      this.$api['formGenerator.sqlParseCheck'](this.formData).then((res) => {
        if (res) {
          that.$api['formGenerator.getSqlParamData']({ sql: this.formData.sql }).then((res) => {
            that.changeTableData = res
          })
        } else {
          that.$message({
            message: 'SQL解析失败，请重新检查！',
            type: 'warning'
          })
        }
      })
    },
    searchResult () {
      const that = this
      this.$api['formGenerator.sqlParseCheck'](this.formData).then((res) => {
        if (res) {
          that.searchResultVisible = true
        } else {
          that.$message({
            message: 'SQL解析失败，请重新检查！',
            type: 'warning'
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.CodeMirror {
  height: 150px;
}
.editTable {
  height: calc(100% - 60px);
}
</style>
<style lang="scss" scoped>
.form_list {
  margin: 0 16px;
}
.el_tabs ::v-deep {
  margin: 0 26px;
  .el-tabs__content {
    padding: 0 !important;
    .list-layout {
      margin: 0;
    }
  }
}
</style>
