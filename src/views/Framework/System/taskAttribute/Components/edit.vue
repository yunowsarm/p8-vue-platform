<template>
  <div style="height: 100%;">
    <form-list ref="form"
               :data-source="dataSource"
               :form="formData"
               :api="saveApi"
               @saved="saved"
               label-width="90px"
               @rendered="rendered"
               :is-custom-validate="true"
               :exist-default-btn="false"
               :exist-custom-btn="true"
               @custom-validate="customValidate">
      <template #customBtn>
        <el-button type="primary"
                   @click="$emit('saveSuccess')">取消</el-button>
        <el-button type="primary"
                   @click="$refs.form.handleSubmit($event)">保存</el-button>
      </template>
      <common-tabs :tabs-data="tabsData"
                   type="border-card"
                   :height="renderHeight"
                   :active-tabs="activeTabs"
                   @tab-click="tabClick"
                   :keepBottom='true'
                   :has-full-screen="true">
        <template #attributeSettings>
          <editable-table :columns="settingsColumns"
                          ref="editTable"
                          :add-row="false"
                          :data="settingsData"
                          @save-param-data="saveParamData">
            <template #isEnable="{ scope, data }">
              <el-checkbox v-model="scope.row.isEnable"
                           true-label="1"
                           false-label="0"
                           @blur="saveParamData(data)"
                           :disabled="scope.row.type == '0'"></el-checkbox>
            </template>
            <template #indexNo="{ scope, data }">
              <el-input-number v-model="scope.row.indexNo"
                               :min="0"
                               :precision="1"
                               style="width:100%;"
                               size="mini"
                               @change="saveParamData(data)"
                               placeholder="请输入"></el-input-number>
            </template>
          </editable-table>
        </template>
        <template #attributeExtend>
          <editable-table :columns="extendColumns"
                          :data="extendData"
                          :add-row="true"
                          @save-param-data="saveParamDataNew">
            <template #name="{ scope, data }">
              <el-input v-model="scope.row.name"
                        style="width: 100%"
                        clearable
                        @blur="saveParamDataNew(data)"></el-input>
            </template>
            <template #filedName="{ scope, data }">
              <el-input v-model="scope.row.filedName"
                        style="width: 100%"
                        clearable
                        @blur="saveParamDataNew(data)"></el-input>
            </template>
            <template #filedType="{ scope, data }">
              <el-select v-model="scope.row.filedType"
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
              </el-select>
            </template>
            <template #verificationRules="{ scope, data }">
              <!-- <el-select :multiple="true" v-model="scope.row.verificationRules" style="width: 100%" clearable @change="saveParamDataNew(data)">
              <el-option  label="必填" value="必填"> </el-option>
              <el-option  label="整数" value="整数"> </el-option>
            </el-select> -->
              <el-input v-model="scope.row.verificationRules"
                        style="width: 100%"
                        clearable
                        @blur="saveParamDataNew(data)"></el-input>
            </template>
          </editable-table>
        </template>
      </common-tabs>
    </form-list>

  </div>
</template>

<script>
import { P8Form as FormList, P8EditTable as EditableTable, P8Tabs as CommonTabs } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'
import Sortable from 'sortablejs'
import { deepClone } from '@/utils/common'
import _ from 'lodash';
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
  data () {
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
          width: '50'
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
          width: '50'
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
          title: '校验',
          dataIndex: 'verificationRules',
          minWidth: 180,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      activeTabs: 'attributeSettings'
    }
  },
  mounted () {
    // this.columnDrop()
  },
  methods: {
    rendered () {
      this.getFormData()
    },
    getFormData () {
      this.$api['taskAttribute.getInfo']({ id: this.id }).then((res) => {
        this.formData.projectTypeId = res.projectTypeId
        this.formData.describe = res.describe
        this.settingsData = res.propertiesList
        this.extendData = res.attributeExtensionList
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
    saved (res) {
      this.$emit('saveSuccess', res)
    },
    tabClick () { },
    saveParamData (data) {
      this.formData.propertiesList = data
    },
    saveParamDataNew (data) {
      this.formData.attributeExtensionList = data
    },
    columnDrop () {
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
    customValidate (saveParmars) {
      const that = this
      this.$api['taskAttribute.saveData'](saveParmars).then((res) => {
        if (res) {
          that.$emit('saveSuccess')
        } else {
          that.$message({ type: 'warning', message: '每类项目类型只可有一条设置记录!' })
        }
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
