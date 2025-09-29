<script>
import {
  P8Dialog as CommonDialog,
  P8Drawer as CommonDrawer,
  P8EditTable as EditableTable,
  P8Table as CommonTable
} from 'p8-components-ui'
import aceEdit from 'packages/Base/Components/ace.vue'
import SqlListEdit from 'packages/dataViewManage/src/Components/edit.vue'
import _cloneDeep from 'lodash/cloneDeep'
import _isEqual from 'lodash/isEqual'

export default {
  name: 'PostResponseProcessing',
  components: {
    SqlListEdit,
    aceEdit,
    CommonDialog,
    CommonDrawer,
    EditableTable,
    CommonTable
  },
  props: {
    tabName: {
      type: String,
      default: ''
    },
    // 自定义处理器
    customisesList: {
      type: Array,
      default: () => []
    },
    // 工具列表
    toolList: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    tabsParam: {
      type: Object,
      default: () => {
      }
    }
  },
  data () {
    return {
      editTableData: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '50'
        },
        {
          title: '参数来源',
          dataIndex: 'parameterSource'
          // scopedSlots: { customRender: 'custom' }
        },
        {
          title: '输出参数',
          dataIndex: 'outputParameter'
          // scopedSlots: { customRender: 'custom' }
        },
        {
          title: '映射参数',
          dataIndex: 'mappingParameter',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      commandColumns: [
        {
          title: '参数名',
          dataIndex: 'label'
        },
        {
          title: '描述',
          dataIndex: 'value'
        }
      ],
      tableData: [],
      record: {},
      recordIndex: -1,
      visible: false,
      commandVisible: false,
      drawerVisible: false,
      customProcessorsForm: {},
      messageTemplate: '',
      commandParam: []
    }
  },
  created () {
    this.getCommandParam()
  },
  mounted () {
    this.tableData = this.data || []
  },
  methods: {
    changeCustomProcessors (val) {
      this.customProcessorsForm.description = this.customisesList.find(item => item.value === val).description
    },
    getToolName (val) {
      return this.toolList.find(item => item.key === val).value
    },

    // 映射上一个参数映射
    getPrevParams (arr) {
      return arr.map(item => {
        return {
          ...item,
          outputParameter: item.mappingParameter || item.outputParameter,
          mappingParameter: ''
        }
      })
    },
    // 获取参数列表
    getParamList () {
      let tableData = []
      const {
        startParameters,
        params,
        pathParameters,
        queryParameters,
        headerParameters
      } = this.tabsParam
      if (startParameters?.length) {
        const arr = startParameters.map(item => {
          return {
            source: 'startParameters',
            parameterSource: '启动参数',
            outputParameter: item.paramName
          }
        })
        tableData = [...tableData, ...arr]
      }
      if (params?.length) {
        const arr = params.map(item => {
          return {
            source: 'params',
            parameterSource: '参数',
            outputParameter: item.paramName
          }
        })

        tableData = [...tableData, ...arr]
      }
      if (headerParameters?.length) {
        const arr = headerParameters.map(item => {
          return {
            source: 'headerParameters',
            parameterSource: 'header参数',
            outputParameter: item.paramName
          }
        })

        tableData = [...tableData, ...arr]
      }
      if (pathParameters?.length) {
        const arr = pathParameters.map(item => {
          return {
            source: 'pathParameters',
            parameterSource: 'path参数',
            outputParameter: item.paramName
          }
        })
        tableData = [...tableData, ...arr]
      }
      if (queryParameters?.length) {
        const arr = queryParameters.map(item => {
          return {
            source: 'queryParameters',
            parameterSource: 'query参数',
            outputParameter: item.paramName
          }
        })
        tableData = [...tableData, ...arr]
      }
      tableData.forEach(param => {
        const obj = this.editTableData.find(item => item.outputParameter === param.outputParameter && item.parameterSource === param.parameterSource)
        if (obj && obj.mappingParameter) {
          param.mappingParameter = obj.mappingParameter
        }
      })
      return tableData
    },
    findPrevIndex (currentIndex, name) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (this.tableData[i].name === name) {
          return i
        }
      }
      return -1
    },
    // 新建工具
    newTool () {
      this.tableData.push({ indexNo: this.tableData.length })
    },
    deleteRow (index) {
      this.$confirm(`该操作会影响后续执行步骤，确定删除？`, '注意', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.tableData.splice(index, 1)
        })
        .catch((e) => {
          // // console.log(e)
        })

    },
    concatParamsByPrev (arr, prevArr) {
      const currentArr = _cloneDeep(arr)
      prevArr.forEach(p => {
        const i = currentArr.findIndex(t => t.id === p.id)
        if (i < 0) {
          currentArr.push({
            ...p,
            outputParameter: p.mappingParameter || p.outputParameter
          })
        } else {
          if (p.mappingParameter !== currentArr[i].outputParameter) {
            currentArr[i].outputParameter = p.mappingParameter || p.outputParameter
            currentArr[i].mappingParameter = ''
          }
        }
      })
      currentArr.forEach((t, index) => {
        const i = prevArr.findIndex(p => p.id === t.id)
        if(i < 0){
          currentArr.splice(index, 1)
        }
      })
      // console.log(arr)
      // console.log(currentArr)
      // console.log(_isEqual(arr, currentArr))
      if (!_isEqual(arr, currentArr)) {
        return currentArr
      } else {
        return arr
      }
    },
    // 合并新增参数
    concatParams (arr) {
      const params = this.getParamList()
      arr.forEach((t, index) => {
        const i = params.findIndex(p => p.outputParameter === t.outputParameter)
        if (i === -1) {
          arr.splice(index, 1)
        }
      })
      params.forEach(p => {
        if (arr.findIndex(t => t.outputParameter === p.outputParameter) === -1) {
          arr.push(p)
        }
      })
      return arr
    },
    // 行设置
    setup ({
      row,
      $index
    }) {
      if (!row.name) {
        this.$message.warning('请先选择工具')
        return
      }
      this.record = row
      this.recordIndex = $index
      const toolName = this.getToolName(this.record.name)
      if (toolName === '数据查询') {
        this.$nextTick(() => {
          this.$set(this, 'drawerVisible', true)
        })
      } else {
        switch (toolName) {
          case '参数赋值':
            this.editTableData = this.concatParams(this.tableData[$index].value ?? [])
            break
          case '参数映射':
            console.log(this.tableData[$index].value)
            // if (this.tableData[$index].value?.length) {
            const arr = this.tableData[$index].value
            if (this.findPrevIndex($index, row.name) < 0) {
              this.editTableData = this.concatParams(arr)
            } else {
              const i = this.findPrevIndex($index, row.name)
              const prevArr = this.tableData[i].value
              this.editTableData = this.concatParamsByPrev(arr, prevArr)
            }
            // }
            // else {
            //   if (this.findPrevIndex($index, row.name) > -1) {
            //     const i = this.findPrevIndex($index, row.name)
            //     const arr = this.tableData[i].value || this.getParamList()
            //     this.editTableData = this.getPrevParams(arr)
            //   } else {
            //     this.editTableData = this.getParamList()
            //   }
            // }
            break
          case '报文对象转换':
            if (this.tableData[$index].value?.length) {
              this.messageTemplate = this.tableData[$index].value
            }
            break
          case '自定义处理器':
            if (this.tableData[$index].value && Object.keys(this.tableData[$index].value).length) {
              this.customProcessorsForm = this.tableData[$index].value
            }
            break
        }
        this.visible = true
      }

    },
    handleCancel () {
      this.visible = false
      this.editTableData = []
      this.messageTemplate = ''
      this.customProcessorsForm = {}
      this.record = {}
      this.recordIndex = -1
    },
    componentsHandleOk () {
      const toolName = this.getToolName(this.record.name)
      const i = this.recordIndex
      switch (toolName) {
        case '参数赋值':
        case '参数映射':
          this.tableData[i].value = this.editTableData
          break
        case '报文对象转换':
          this.tableData[i].value = this.messageTemplate
          break
        case '自定义处理器':
          this.tableData[i].value = this.customProcessorsForm
          break
      }
      this.saveTableData()
      this.handleCancel()
    },
    saveCallback (data) {
      const i = this.recordIndex
      this.tableData[i].value = data
      this.sqlEditClose()
    },
    saveTableData (e, index) {
      if (e && index > -1) {
        if (e === 'parameterMapping') {
          if (this.findPrevIndex(index, e) > -1) {
            const i = this.findPrevIndex(index, e)
            const arr = this.tableData[i].value
            this.tableData[index].value = this.getPrevParams(arr)
          } else {
            this.tableData[index].value = this.getParamList().map(item => {
              return {
                ...item,
                id: Date.now() + item.outputParameter
              }
            })
          }
        } else {
          this.tableData[index].value = null
        }
      }
      this.$emit('saveTabParam', this.tabName, this.tableData)
    },
    sqlEditClose () {
      this.drawerVisible = false
      this.record = {}
      this.recordIndex = -1
    },
    onSchemaModify (v) {
      this.messageTemplate = v
    },
    getCommandParam () {
      this.$api['integratedManagement.getCommandParam']().then(res => {
        this.commandParam = res
      })
    }
  }
}
</script>

<template>
  <div id="PostResponseProcessing">
    <el-button type="primary" @click="newTool" style="margin-bottom: 10px">新建</el-button>
    <el-table :data="tableData" border height="calc(100% - 42px)">
      <el-table-column label="序号" type="index" width="50">
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工具">
        <template slot-scope="scope">
          <el-select v-model="scope.row.name" @change="saveTableData($event,scope.$index)">
            <el-option v-for="(item,index) in toolList" :key="item.key" :label="item.value"
                       :value="item.key"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120px">
        <template slot-scope="scope">
          <el-button type="text" @click="setup(scope)">设置</el-button>
          <el-button type="text" @click="deleteRow(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <common-drawer title="数据查询"
                   :visible="drawerVisible"
                   size="100%"
                   @close="sqlEditClose">
      <template #drawer>
        <sql-list-edit :record="record.value"
                       v-if="drawerVisible"
                       @cancel="sqlEditClose"
                       @saveSuccess="saveCallback"></sql-list-edit>
      </template>
    </common-drawer>
    <common-dialog :title="getToolName(record.name)"
                   v-if="visible"
                   :visible="visible"
                   :showHandleBtn="false"
                   :isViewCsFooter="true"
                   @close="handleCancel">
      <template #dialog>
        <div v-if="getToolName(record.name) === '参数赋值'">
          <el-table :data="editTableData" border>
            <el-table-column label="序号" type="index" width="50">
            </el-table-column>
            <el-table-column label="参数来源" prop="parameterSource">
            </el-table-column>
            <el-table-column label="输出参数" prop="outputParameter">
            </el-table-column>
            <el-table-column label="执行链参数">
              <template slot-scope="scope">
                <el-input v-model="scope.row.mappingParameter"
                          style="width: 100%"
                          placeholder="请输入默认值"
                          clearable></el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="getToolName(record.name) === '参数映射'">
          <el-table :data="editTableData" border>
            <el-table-column label="序号" type="index" width="50">
            </el-table-column>
            <el-table-column label="参数来源" prop="parameterSource">
            </el-table-column>
            <el-table-column label="输出参数" prop="outputParameter">
            </el-table-column>
            <el-table-column label="映射参数">
              <template slot-scope="scope">
                <el-input v-model="scope.row.mappingParameter"
                          style="width: 100%"
                          placeholder="请输入默认值"
                          clearable></el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="getToolName(record.name) === '自定义处理器'">
          <el-form label-width="120px">
            <el-form-item label="处理器">
              <el-select v-model="customProcessorsForm.key" placeholder="请选择处理器" style="width: 80%"
                         @change="changeCustomProcessors">
                <el-option v-for="(item,index) in customisesList" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="说明">
              {{ customProcessorsForm.description || '' }}
            </el-form-item>
          </el-form>
        </div>
        <div v-if="getToolName(record.name) === '报文对象转换'" style="display: flex;height: 100%">
          <label>报文模板：</label>
          <ace-edit :value="messageTemplate"
                    width="100%"
                    height="100%"
                    style="flex: 1"
                    :formatCode="false"
                    @update:value="onSchemaModify"></ace-edit>
        </div>
      </template>
      <template #cs-footer>
        <el-button type="primary" @click="commandVisible = true">查看执行链参数</el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="componentsHandleOk">保存</el-button>
      </template>
    </common-dialog>
    <common-dialog title="执行链参数"
                   :visible="commandVisible"
                   :showHandleBtn="false"
                   width="40%"
                   @close="commandVisible = false">
      <template #dialog>
        <common-table ref="table"
                      :columns="commandColumns"
                      :refreshShow="false"
                      :pagination="false"
                      :noApiTableData="commandParam">
        </common-table>
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss">
#PostResponseProcessing {
  height: 100%;
  box-sizing: border-box;
  padding: 10px 20px;
}

.list-layout {
  padding: 0;
}
::v-deep .is-fullscreen .el-dialog__body {
  height: calc(100% - 110px) !important;
}
</style>
