<template>
  <div style="height: 100%">
    <form-list
      ref="form"
      :data-source="dataSource"
      :form="formData"
      :api="saveApi"
      @saved="saved"
      label-width="90px"
      @rendered="rendered"
      :is-custom-validate="true"
      :exist-default-btn="false"
      :exist-custom-btn="true"
      @custom-validate="customValidate"
    >
      <template #customBtn>
        <el-button type="primary" @click="$emit('saveSuccess')">取消</el-button>
        <el-button type="primary" @click="$refs.form.handleSubmit($event)">保存</el-button>
      </template>
      <common-tabs :tabs-data="tabsData" type="border-card" :height="renderHeight" :active-tabs="activeTabs" @tab-click="tabClick" :keepBottom="true" :has-full-screen="true">
        <template #attributeSettings>
          <editable-table :columns="settingsColumns" ref="editTable" :add-row="false" :data="settingsData" @save-param-data="saveParamData">
            <template #isEnable="{ scope, data }">
              <el-checkbox v-model="scope.row.isEnable" true-label="1" false-label="0" @blur="saveParamData(data)" :disabled="scope.row.type == '0'"></el-checkbox>
            </template>
            <template #indexNo="{ scope, data }">
              <el-input-number v-model="scope.row.indexNo" :min="0" :precision="1" style="width: 100%" size="mini" @change="saveParamData(data)" placeholder="请输入"></el-input-number>
            </template>
          </editable-table>
        </template>
        <template #attributeExtend>
          <editable-table :columns="extendColumns" :data="extendData" :add-row="true" :custom-remove-fn="attributeExtendRemove" @save-param-data="saveParamDataNew">
            <template #name="{ scope, data }">
              <el-input v-model="scope.row.name" style="width: 100%" clearable @blur="saveParamDataNew(data)"></el-input>
            </template>
            <template #filedName="{ scope, data }">
              <el-input v-model="scope.row.filedName" style="width: 100%" clearable @blur="saveParamDataNew(data)"></el-input>
            </template>
            <template #filedType="{ scope, data }">
              <!-- <el-select v-model="scope.row.filedType"
                         style="width: 100%"
                         clearable
                         @change="saveParamDataNew(data)">
                <el-option label="字符串"
                           value="text"> </el-option>
                <el-option label="数字"
                           value="number"> </el-option>
                <el-option label="大文本"
                           value="textarea"> </el-option>
                <el-option label="日期"
                           value="datepicker"> </el-option>
              </el-select> -->
              <el-cascader
                v-model="scope.row.filedType"
                :options="options"
                :show-all-levels="false"
                :emitPath="false"
                :props="{ expandTrigger: 'hover' }"
                @change="handleChange(scope.row, data)"
              ></el-cascader>
            </template>
            <template #selectCode="{ scope, data }">
              <div v-if="scope.row.filedType === 'selectSingle' || scope.row.filedType === 'selectMultiple'">
                <el-select v-model="scope.row.selectCode" style="width: 100%" clearable filterable @change="saveParamDataNew(data)">
                  <el-option v-for="item in renderData" :key="item.selectionCode" :label="item.selectionName + '(' + item.selectionCode + ')'" :value="item.selectionCode"> </el-option>
                </el-select>
              </div>
              <!-- 树组件 -->
              <div v-if="scope.row.filedType === 'treeSingle' || scope.row.filedType === 'treeMultiple'">
                <el-select v-model="scope.row.selectCode" style="width: 100%" clearable filterable @change="saveParamDataNew(data)">
                  <el-option v-for="item in treeData" :key="item.selectionCode" :label="item.selectionName + '(' + item.selectionCode + ')'" :value="item.selectionCode"> </el-option>
                </el-select>
              </div>
            </template>
            <template #verificationRules="{ scope, data }">
              <!-- <el-select :multiple="true" v-model="scope.row.verificationRules" style="width: 100%" clearable @change="saveParamDataNew(data)">
              <el-option  label="必填" value="必填"> </el-option>
              <el-option  label="整数" value="整数"> </el-option>
            </el-select> -->
              <el-input v-model="scope.row.verificationRules" style="width: 100%" clearable @blur="saveParamDataNew(data)"></el-input>
            </template>
          </editable-table>
        </template>
      </common-tabs>
    </form-list>
  </div>
</template>

<script>
import { P8EditTable as EditableTable, P8Form as FormList, P8Tabs as CommonTabs } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'

export default {
  name: 'CompEdit',
  components: {
    FormList,
    EditableTable,
    CommonTabs
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    const height = document.documentElement.clientHeight - 310
    return {
      renderHeight: height + 'px',
      saveApi: 'formGenerator.compSave',
      dataSource: [
        {
          type: 'treeSelect',
          labelText: '项目类型',
          fieldName: 'projectTypeId',
          placeholder: '请选择项目类型',
          colLayout: 'singleCol',
          disabledValues: ['62f000902804491db8c1'],
          defaultExpandAll: true,
          treeData: [],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '描述',
          fieldName: 'describe',
          placeholder: '请输入描述',
          colLayout: 'singleCol'
        }
      ],
      formData: {
        projectTypeId: '',
        describe: '',
        propertiesList: [],
        attributeExtensionList: []
      },
      settingsData: [],
      extendData: [],
      tabsData: [
        {
          label: '属性设置',
          name: 'attributeSettings'
        },
        {
          label: '属性扩展',
          name: 'attributeExtend'
        }
      ],
      settingsColumns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '50',
          headerAlign: 'center'
        },
        {
          title: '启用/禁用',
          dataIndex: 'isEnable',
          minWidth: 150,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '属性',
          dataIndex: 'name',
          minWidth: 150,
          align: 'center'
        },
        {
          title: '排序号',
          dataIndex: 'indexNo',
          minWidth: 80,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      extendColumns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '50',
          headerAlign: 'center'
        },
        {
          title: '属性名称',
          dataIndex: 'name',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '类型',
          dataIndex: 'filedType',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段名称',
          dataIndex: 'filedName',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '数据来源',
          dataIndex: 'selectCode',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '校验',
          dataIndex: 'verificationRules',
          minWidth: 180,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      activeTabs: 'attributeSettings',
      renderData: [],
      treeData: [],
      options: [
        {
          value: 'text',
          label: '字符串'
        },
        {
          value: 'number',
          label: '数字'
        },
        {
          value: 'textarea',
          label: '大文本'
        },
        {
          value: 'datepicker',
          label: '日期'
        },
        {
          value: 'select',
          label: '目录选择',
          children: [
            {
              value: 'selectSingle',
              label: '单选目录'
            },
            {
              value: 'selectMultiple',
              label: '多选目录'
            }
          ]
        },
        {
          value: 'tree',
          label: '树形选择',
          children: [
            {
              value: 'treeSingle',
              label: '单选树形'
            },
            {
              value: 'treeMultiple',
              label: '多选树形'
            }
          ]
        }
      ],
      oldAttributeExtensionList: []
    }
  },
  mounted() {
    if (this.id == 'sys_01') {
      this.dataSource[0].disabled = true
    }
    this.getSelectData()
    // this.columnDrop()
  },
  methods: {
    attributeExtendRemove(tableData, row, index) {
      tableData[index].isDeleted = true
      return [...tableData]
    },
    rendered() {
      this.getFormData()
    },
    getFormData() {
      this.$api['taskAttribute.getInfo']({ id: this.id }).then((res) => {
        this.formData.projectTypeId = res.projectTypeId
        this.formData.describe = res.describe
        this.settingsData = res.propertiesList
        this.extendData = res.attributeExtensionList
        this.oldAttributeExtensionList = res.attributeExtensionList
      })
      this.$api['formGenerator.getSelectionData']({ selectCode: 'projectTypeTree1' }).then((res) => {
        let treeData = []
        res.data.forEach((el) => {
          treeData.push({ id: el.ID, value: el.ID, label: el.NAME, pId: el.PARENTID })
        })
        treeData = generateTree(treeData, 'pId')
        this.dataSource[0].treeData = treeData
      })
      if (this.id) {
        this.formData.id = this.id
        this.formData.type = this.type
      }
    },
    saved(res) {
      this.$emit('saveSuccess', res)
    },
    tabClick() {},
    saveParamData(data) {
      this.formData.propertiesList = data
    },
    saveParamDataNew(data) {
      this.formData.attributeExtensionList = data
    },
    columnDrop() {
      // const that = this
      // this.$nextTick(() => {
      //   const $table = that.$refs.editTable
      //   that.sortable = Sortable.create($table.$el.querySelector('.list-main .common-table .el-table__body-wrapper .el-table__body tbody'), {
      //     onEnd: ({ item, newIndex, oldIndex }) => {
      //       // 获取排序之后的data数据
      //       that.settingsData.splice(newIndex, 0, that.settingsData.splice(oldIndex, 1)[0])
      //       const oldArray = that.formData.propertiesList.slice(0)
      //       const newArray = that.settingsData.slice(0)
      //       newArray.forEach(item => {
      //         const oldItem = oldArray.find(oldItem => oldItem.id === item.id);
      //         if (oldItem) {
      //           item.isEnable = oldItem.isEnable;
      //         }
      //       });
      //       that.settingsData = []
      //       that.$nextTick(function () {
      //         that.settingsData = newArray
      //         that.formData.propertiesList = newArray;
      //       })
      //     }
      //   })
      // })
    },
    customValidate(saveParmars) {
      const that = this
      let flag = false
      // 判断字段名称列是否有重复项
      let duplicates = []
      if (saveParmars.attributeExtensionList && saveParmars.attributeExtensionList.length) {
        let fileNameMap = {}
        saveParmars.attributeExtensionList.forEach((el) => {
          if (el.filedName) {
            if (fileNameMap[el.filedName]) {
              duplicates.push(el.filedName)
            } else {
              fileNameMap[el.filedName] = true
            }
          }
        })
      }
      if (duplicates.length > 0) {
        this.$message({type: 'warning', message: '字段名称列有重复项，请修改后再保存。'})
        return
      }
      saveParmars.propertiesList.forEach((el, index) => {
        if (el.attributeType == '1') {
          let item = saveParmars.attributeExtensionList.filter((res) => res.id == el.id)
          if (!(item && item.length)) {
            saveParmars.propertiesList.splice(index, 1)
          }
        }
        saveParmars.attributeExtensionList.forEach((item) => {
          if (item.id == el.id) {
            item.indexNo = el.indexNo
          }
        })
      })
      let changeList = []
      if (saveParmars.attributeExtensionList && saveParmars.attributeExtensionList.length) {
        let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
        saveParmars.attributeExtensionList.forEach((el) => {
          if (typeList.includes(el.filedType) && !el.selectCode) {
            flag = true
          }
          if (this.oldAttributeExtensionList && this.oldAttributeExtensionList.length) {
            this.oldAttributeExtensionList.forEach((item) => {
              if (item.id == el.id) {
                if (item.filedType !== el.filedType || item.selectCode !== el.selectCode) {
                  el.isChange = true
                  changeList.push(el.id)
                }
              }
            })
          }
        })
      }
      if (flag) {
        that.$message({ type: 'warning', message: '请选择数据来源！' })
        return
      }
      if (changeList && changeList.length) {
        this.$api['taskAttribute.checkAttributeChange']({ attributeExtensionList: saveParmars.attributeExtensionList }).then((res) => {
          if (res) {
            const changeAttributelist = saveParmars.attributeExtensionList
              .filter((item) => res.includes(item.id))
              .map((item) => {
                // 在这里进行 map 操作，例如返回一个新的对象或提取某个属性
                return item.name
              })
            let attributeNames = changeAttributelist.join('、')
            if (changeAttributelist.length > 1) {
              attributeNames += '等'
            }
            this.$confirm(`属性名称为：${attributeNames}配置项已绑定了"数据来源"，且已产生业务数据。修改"数据来源"可能会导致历史数据相应属性值显示异常，是否确认修改？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              save()
            })
          } else {
            save()
          }
        })
      } else {
        save()
      }
      function save() {
        that.$api['taskAttribute.saveData'](saveParmars).then((res) => {
          if (res) {
            that.$emit('saveSuccess')
          } else {
            that.$message({ type: 'warning', message: '每类项目类型只可有一条设置记录!' })
          }
        })
      }
    },
    handleChange(row, data) {
      if (row.filedType && row.filedType.length) {
        row.filedType = row.filedType[row.filedType.length - 1]
      }
      row.selectCode = ''
      this.saveParamDataNew(data)
    },
    getSelectData() {
      this.$api['selection.list']({ selectionType: 1, page: { current: 1, size: -1, orders: [] } }).then((res) => {
        this.renderData = res.records
      })
      this.$api['selection.list']({ selectionType: 2, page: { current: 1, size: -1, orders: [] } }).then((res) => {
        this.treeData = res.records
      })
    }
  }
}
</script>
<style scoped>
::v-deep .el-tabs--top .el-tabs__content {
  height: calc(100% + 35px) !important;
  overflow-y: hidden !important;
  padding: 0 !important;
}
</style>
