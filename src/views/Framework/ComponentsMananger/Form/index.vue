<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp" :button-type="'round'" :custom-button-data="customButtonData"></common-button>
    </template>
    <template #center>
      <common-table ref="table" :columns="columns" api="formGenerator.formList" :table-refresh="tableRefresh">
        <template #operation="{ scope }">
          <el-button type="text" @click="modify(scope)">修改</el-button>
          <el-button type="text" @click="remove(scope)">删除</el-button>
          <el-button type="text" @click="formDesign(scope)">表单设计</el-button>
          <el-button type="text" @click="dataView(scope)">数据查看</el-button>
          <el-button type="text" @click="formRelease(scope)" :disabled="scope.row.desformStatus === '1'">表单发布</el-button>
          <el-button type="text" @click="formDesignCopy(scope)">表单设计复制</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <!-- 表单设计器 -->
      <common-drawer :visible="visible" direction="ttb" size="100%" @close="formDesignClose" :drawer-config="{ withHeader: false }">
        <template #drawer>
          <form-generator :record="record"></form-generator>
        </template>
      </common-drawer>
      <!-- 表单新建 -->
      <common-drawer :title="drawerTitle" :visible="editVisible" size="50%" @close="formEditClose">
        <template #drawer>
          <form-list-edit @saveSuccess="saveCallback" @cancel="formEditClose" :record="record"></form-list-edit>
        </template>
      </common-drawer>
      <!-- 表单数据查看 -->
      <common-drawer :title="dataViewTitle" :visible="dataViewVisible" size="100%" @close="dataViewClose">
        <template #drawer>
          <form-data-list :record="record"></form-data-list>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8Button as CommonButton, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer, P8FormGenerator as FormGenerator, Notification } from 'p8-components-ui'

import FormListEdit from './Components/edit'
import FormDataList from './Components/formDataList'
const noNeedFieldLayout = ['masterSlaveTable', 'rowFormItem', 'multiSelected'] //  jsx的layout属性
const noNeedFieldTag = ['p8-upload', 'el-button', 'custom-html', 'el-alert', 'predefine-comp', 'el-tabs'] //  jsx属性的tag属性
const dateTimeTagIcon = ['time-range', 'date-range'] //  日期，时间区间组件的tagIcon
export default {
  name: 'CustomFormGenerator',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    FormGenerator,
    FormListEdit,
    FormDataList,
    CommonButton
  },
  data() {
    const columns = [
      {
        title: '表单编码',
        dataIndex: 'desformCode',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '表单名称',
        dataIndex: 'desformName',
        align: 'left',
        headerAlign: 'left'
      },
      // {
      //   title: '数据源',
      //   dataIndex: 'cgFormTableName'
      // },
      {
        title: '表单状态',
        dataIndex: 'desformStatus',
        formatter: function (row, column, cellValue, index) {
          let date = ''
          if (cellValue === '0') {
            date = '未发布'
          } else if (cellValue === '1') {
            date = '已发布'
          }
          return date
        },
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '描述',
        dataIndex: 'desformDesc',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '操作',
        width: 350,
        dataIndex: 'operation',
        scopedSlots: { customRender: 'custom' },
        align: 'left',
        headerAlign: 'left'
      }
    ]
    return {
      comp: this,
      customButtonData: [
        {
          id: 'btn-001',
          enable: '1',
          indexNumber: 1,
          eventHandle: 'edit',
          image: 'fdddfont icon-add-new',
          title: '新建',
          location: 'head'
        }
      ],
      columns: columns,
      visible: false,
      editVisible: false,
      drawerTitle: '',
      dataViewVisible: false,
      dataViewTitle: '',
      record: {},
      desCopyApi: 'formGenerator.desCopy'
    }
  },
  methods: {
    tableRefresh(param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    edit() {
      this.record.id = ''
      this.drawerTitle = '新建表单'
      this.editVisible = true
    },
    modify(scope) {
      this.record = Object.assign({}, scope.row)
      this.drawerTitle = '修改表单'
      this.editVisible = true
    },
    remove(scope) {
      let that = this
      this.$confirm('是否确定要删除该表单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['formGenerator.formListRemove']({
            ids: [scope.row.id]
          }).then((res) => {
            if (res && res.errorMsg) {
              that.$message({ message: res.errorMsg, type: 'warning' })
            }
            that.$refs.table.searchData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 表单设计
    formDesign(scope) {
      if (scope.row.desformStatus === '1') {
        this.$confirm('修改表单设计后，需要再次手动发布，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: (action) => {
            if (action === 'confirm') {
              this.visible = true
              this.record = Object.assign({}, scope.row)
            }
          }
        })
      } else {
        this.visible = true
        this.record = Object.assign({}, scope.row)
      }
    },
    async getDrawingList(params) {
      let res = {}
      res = await this.$api['formGenerator.designerDetails'](params)
      return res
    },
    async getFormDataBase(id) {
      let formData = await this.$api['formGenerator.dataSourceFormView']({ id: id })
      return formData
    },
    checkNeedField(item) {
      //判断是否需要对config定义中的field进行判断，如果在noNeedFieldLayout或noNeedFieldTag中那么不需要field；反之(!)则需要校验
      return !(noNeedFieldLayout.indexOf(item.__config__.layout) != -1 || noNeedFieldTag.indexOf(item.__config__.tag) != -1)
    },
    // 表单发布
    async formRelease(scope) {
      let drawingListData = await this.getDrawingList({ desFormId: scope.row.id })
      let formConf = JSON.parse(drawingListData.designJson)
      let formDataBase = formConf.formDataBase
      let canRelease = true // 是否可发布，默认可发布
      if (formDataBase) {
        let res = await this.getFormDataBase(formDataBase)
        let _this = this
        let isDbSynch = res.isDbSynch
        if (isDbSynch && isDbSynch === '1') {
          // 数据源有效性，是否存在且已同步
          let formFields = formConf.fields // 表单设计器中所选fields
          let dataBaseFieldsArr = [] // 数据源中已同步的fields
          let compareLoseFields = [] // 在表单设计器中选中的fields，在数据源中已同步的fields集合中不存在
          let existBlankField = false // 表单设计器中是否存在没有绑定fields的组件，默认不存在
          let masterSlaveTableArr = [] // 表单设计器中是否存在主从表
          if (res.fields && res.fields.length) {
            res.fields.map((item) => {
              dataBaseFieldsArr.push(item.fieldName)
            })
          }
          if (formFields && formFields.length) {
            // 表单设计器中所选fields与数据源中已同步的fields相比较
            formFields.map((item) => {
              // let isMasterSlaveTable = item.__config__.layout === 'masterSlaveTable'
              const layout = item.__config__.layout
              if (!item.__config__.formFields) {
                if (['masterSlaveTable', 'multiSelected'].includes(layout)) {
                  masterSlaveTableArr.push(item)
                } else if (_this.checkNeedField(item)) {
                  existBlankField = true
                }
              }
              if (!existBlankField && _this.checkNeedField(item) && dataBaseFieldsArr.indexOf(item.__config__.formFields) === -1 && !dateTimeTagIcon.includes(item.__config__.tagIcon)) {
                compareLoseFields.push(item.__config__.formFields)
              }
              if (layout === 'rowFormItem') {
                item.__config__.children.map((ele) => {
                  const layout = ele.__config__.layout
                  if (!ele.__config__.formFields) {
                    if (['masterSlaveTable', 'multiSelected'].includes(layout)) {
                      masterSlaveTableArr.push(ele)
                    } else if (_this.checkNeedField(ele)) {
                      existBlankField = true
                    }
                  }
                  if (!existBlankField && _this.checkNeedField(ele) && dataBaseFieldsArr.indexOf(ele.__config__.formFields) === -1 && !dateTimeTagIcon.includes(ele.__config__.tagIcon)) {
                    compareLoseFields.push(ele.__config__.formFields)
                  }
                })
              }
            })
            if (!formConf.formRef || !formConf.formModel || !formConf.formRules) {
              // console.log('222222')
              Notification.error({
                title: '提示',
                message: '设计的表单中表单名称（ref）或表单数据对象（model）或表单验证规则（rule）为空，请检查！'
              })
              canRelease = false
            } else if (existBlankField) {
              Notification.error({
                title: '提示',
                message: '设计的表单中存在没有绑定数据源字段的组件，请检查！'
              })
              canRelease = false
            }
            if (compareLoseFields.length > 0) {
              canRelease = false
              _this.$nextTick(() => {
                Notification.error({
                  title: '提示',
                  message: '所选数据源中不包括 [' + compareLoseFields + '] 字段，请重新设计！'
                })
              })
            }
          }
          if (!canRelease) return
          if (masterSlaveTableArr.length) {
            // console.log(masterSlaveTableArr, 'yk-masterSlaveTableArr')
            canRelease = await this.childrenReleaseHandle(masterSlaveTableArr)
          }
          console.log(canRelease, 'yk-canRelease')

          if (canRelease) {
            _this.$api['formGenerator.formListRelease']({ desFormId: scope.row.id }).then((releaseRes) => {
              _this.$message({
                type: 'success',
                message: '发布成功！'
              })
              _this.$refs.table.searchData()
            })
          }
        } else {
          Notification.error({
            title: '提示',
            message: '数据源未同步！'
          })
          canRelease = false
        }
      } else {
        Notification.error({
          title: '提示',
          message: '没有选择数据源！'
        })
        canRelease = false
      }
    },
    /**
     * @function 表单设计存在主从表时,检查子表关系处理
     */
    async childrenReleaseHandle(masterSlaveTableArr) {
      const _this = this
      let canRelease = true
      for (let i = 0, len = masterSlaveTableArr.length; i < len; i++) {
        const item = masterSlaveTableArr[i]
        let childrenTable = item.__config__.childrenTable
        if (!childrenTable) {
          Notification.error({
            title: '提示',
            message: `${item.__config__.componentName}没有选择数据源！`
          })
          return false
        }
        let childrenTableRes = await this.getFormDataBase(childrenTable)
        // console.log(childrenTableRes, 'yk-childrenTableRes')
        if (childrenTableRes) {
          const tableName = childrenTableRes.tableName
          const tableDesc = childrenTableRes.tableDesc
          const isDbSynch = childrenTableRes.isDbSynch
          if (isDbSynch && isDbSynch === '1') {
            let childrenFields = item.__config__.children
            let dataBaseFieldsArr = [] // 数据源中已同步的fields
            let existBlankField = false // 表单设计器中是否存在没有绑定fields的组件，默认不存在
            let compareLoseFields = [] // 在表单设计器中选中的fields，在数据源中已同步的fields集合中不存在
            let masterSlaveTableArr = [] // 是否依旧存在主从表
            if (childrenTableRes.fields && childrenTableRes.fields.length) {
              childrenTableRes.fields.map((citem) => {
                dataBaseFieldsArr.push(citem.fieldName)
              })
            }
            if (childrenFields && childrenFields.length) {
              childrenFields.map((citem) => {
                let isMasterSlaveTable = citem.__config__.layout === 'masterSlaveTable'
                if (!citem.__config__.formFields) {
                  if (isMasterSlaveTable) {
                    masterSlaveTableArr.push(citem)
                  } else if (_this.checkNeedField(citem)) {
                    existBlankField = true
                  }
                }
                if (!existBlankField && _this.checkNeedField(item) && dataBaseFieldsArr.indexOf(citem.__config__.formFields) === -1 && !dateTimeTagIcon.includes(item.__config__.tagIcon)) {
                  compareLoseFields.push(citem.__config__.formFields)
                }
              })
              if (existBlankField) {
                Notification.error({
                  title: '提示',
                  message: `设计的表单中: ${item.__config__.componentName}下存在没有绑定数据源字段的组件，请检查！`
                })
                canRelease = false
              }

              if (compareLoseFields.length > 0) {
                canRelease = false
                _this.$nextTick(() => {
                  Notification.error({
                    title: '提示',
                    message: '所选数据源中不包括 [' + compareLoseFields + '] 字段，请重新设计！'
                  })
                })
              }
            }
            if (masterSlaveTableArr.length) {
              // console.log(masterSlaveTableArr, 'yk-masterSlaveTableArr--ccc')
              canRelease = await this.childrenReleaseHandle(masterSlaveTableArr)
            }
          } else {
            Notification.error({
              title: '提示',
              message: `${tableDesc}:${tableName}数据源未同步！`
            })
            canRelease = false
          }
        }
      }
      // console.log(canRelease, 'yk-canRelease--children')
      return canRelease
    },
    dataView(scope) {
      this.dataViewTitle = '表单数据查看列表'
      this.record = Object.assign({}, scope.row)
      this.dataViewVisible = true
    },
    formDesignCopy(scope) {
      this.$api[this.desCopyApi]({
        desFormId: scope.row.id
      }).then((res) => {
        this.$message({
          message: '复制成功',
          type: 'success'
        })
        this.$refs.table.searchData() // 刷新列表
      })
    },
    formDesignClose() {
      this.visible = false
      this.$refs.table.searchData() // 刷新列表
    },
    formEditClose() {
      this.editVisible = false
    },
    saveCallback() {
      this.$refs.table.searchData()
      this.formEditClose()
    },
    dataViewClose() {
      this.dataViewVisible = false
    }
  }
}
</script>
