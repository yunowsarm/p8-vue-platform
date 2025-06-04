<template>
  <normal-layout :header-visible="false">
    <template #west>
      <common-tree :tree-api="treeApi"
                   v-if="treeParam.taskId"
                   ref="tree"
                   :treeParam="treeParam"
                   @select="onSelect"> </common-tree>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :columns="columns"
                    class="customTable"
                    :no-api-table-data="editTableData"
                    :isRadioSelect="true"
                    @select="select"
                    :pagination="false">
      </common-table>
      <el-row style="float: right;margin-top: 10px;">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary"
                   @click="handleOk">确 定</el-button>
      </el-row>
    </template>
  </normal-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree } from 'p8-components-ui'
export default {
  name: 'selectBeforeTask',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    approveType: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      columns: [],
      comp: this,
      drawerTitle: null,
      drawerVisible: false,
      drawerContentView: '',
      editTableData: [],
      formViewId: '',
      dynamicData: {},
      headerVisible: true,
      treeApi: 'taskManager.pre_taskFormInfo',
      treeParam: { taskId: '' },
      selectRows: [],
      treeNode: ''
    }
  },
  async created () {
    this.treeParam.taskId = this.taskId
    this.init()
  },
  methods: {
    async init (actOrTaskFormId, formId, formCode) {
      let that = this
      let dynamicTagList = ['el-select', 'eject-select', 'tree-select']
      await this.searchList(actOrTaskFormId, formId)
      if (this.approveType) {
        this.headerVisible = true
      } else {
        this.headerVisible = false
      }
      await this.$api['formGenerator.designerDetails']({ desformCode: formCode }).then(async (res) => {
        let fields = []
        if (res.designJson) {
          fields = JSON.parse(res.designJson).fields
        }
        if (fields && fields.length) {
          let columns = []
          columns.push({
            type: 'selection',
            width: 50,
            align: 'center',
            headerAlign: 'center'
          })
          // 等待 getDynamicData 方法执行完成
          await this.getDynamicData(fields, dynamicTagList)
          // 使用 Promise.all 等待所有 forEach 内部的异步操作完成
          await Promise.all(
            fields.map(async (item) => {
              if (!item.__config__.hidden) {
                if (dynamicTagList.includes(item.__config__.tag)) {
                  columns.push({
                    title: item.__config__.label,
                    minWidth: 120,
                    dataIndex: item.__vModel__,
                    align: 'center',
                    formatter: function (row) {
                      if (row[item.__vModel__]) {
                        let options = that.dynamicData[item.__vModel__].data
                        let config = that.dynamicData[item.__vModel__].config
                        if (config) {
                          let result = options.find((el) => el[config.valueCol] === row[item.__vModel__])
                          return result[config.labelCol] ? result[config.labelCol] : ''
                        } else {
                          let customConfig = {
                            labelCol: 'cmeaning',
                            valueCol: 'id'
                          }
                          let result = options.find((el) => el[customConfig.valueCol] === row[item.__vModel__])
                          return result[customConfig.labelCol] ? result[customConfig.labelCol] : ''
                        }
                      }
                    }
                  })
                } else if (item.__config__.tagIcon == 'time-range' || item.__config__.tagIcon == 'date-range') {
                  columns.push({
                    title: item.__config__.label,
                    minWidth: 180,
                    dataIndex: item.__vModel__,
                    align: 'center',
                    formatter: function (row) {
                      let file1 = row[item.__config__.formFields[0]]
                      let file2 = row[item.__config__.formFields[1]]
                      if (file1 && file2) {
                        if (item.__config__.tagIcon == 'time-range') {
                          return file1.split(' ')[1] + '~' + file2.split(' ')[1]
                        } else if (item.__config__.tagIcon == 'date-range') {
                          return file1.split(' ')[0] + '~' + file2.split(' ')[0]
                        }
                      }
                    }
                  })
                } else if (item.__config__.tagIcon == 'time' || item.__config__.tagIcon == 'date') {
                  columns.push({
                    title: item.__config__.label,
                    minWidth: 100,
                    dataIndex: item.__config__.formFields,
                    align: 'center',
                    formatter: function (row) {
                      if (item.__config__.tagIcon == 'time') {
                        if (row[item.__config__.formFields]) {
                          return row[item.__config__.formFields].split(' ')[1].slice(0, -3) || ''
                        } else {
                          return ''
                        }
                      } else if (item.__config__.tagIcon == 'date') {
                        if (row[item.__config__.formFields]) {
                          return row[item.__config__.formFields].split(' ')[0] || ''
                        } else {
                          return ''
                        }
                      }
                    }
                  })
                } else {
                  columns.push({
                    title: item.__config__.label,
                    minWidth: 120,
                    dataIndex: item.__config__.formFields,
                    align: 'center'
                  })
                }
              }
            })
          )
          if (this.headerVisible) {
            columns.push({
              title: '操作',
              fixed: 'right',
              width: 160,
              dataIndex: 'operation',
              scopedSlots: { customRender: 'custom' }
            })
          }
          this.columns = columns
        }
      })
    },
    async searchList (actOrTaskFormId, formId) {
      if (actOrTaskFormId && formId) {
        this.editTableData = await this.$api['taskManager.taskFormdataList']({ actOrTaskFormId: actOrTaskFormId, formId: formId })
      }
    },
    async getDynamicData (fields, dynamicTagList) {
      // 使用 Promise.all 等待所有 forEach 内部的异步操作完成
      await Promise.all(
        fields.map(async (item) => {
          if (!item.__config__.hidden) {
            if (dynamicTagList.includes(item.__config__.tag)) {
              // 动态数据来源
              const param = {
                id: item.__config__.selectComp,
                param: {},
                sqlParam: {},
                reportParam: {}
              }
              let res = await this.$api['formGenerator.getSelectionData'](param)
              this.dynamicData[item.__config__.formFields] = { config: JSON.parse(res.config), data: res.data }
            }
          }
        })
      )
    },
    onSelect (node) {
      this.treeNode = node
      this.init(node.data.id, node.data.formId, node.data.formCode)
    },
    select (selections) {
      this.selectRows = selections
    },
    handleOk () {
      this.$emit('handleOk', this.selectRows, this.treeNode)
    },
    handleCancel () {
      this.$emit('handleCancel')
    }
  },
  components: {
    ListLayout,
    CommonTable,
    NormalLayout,
    CommonTree
  }
}
</script>

<style lang="scss" scoped>
.customTable {
  height: calc(100% - 60px) !important;
  ::v-deep .panination {
    display: none;
  }
}
</style>
