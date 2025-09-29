<script>
import { P8EditTable as EditableTable } from 'p8-components-ui'

export default {
  name: 'Params',
  components: {
    EditableTable
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    fieldType: {
      type: Array,
      default: () => []
    },
    tabName:{
      type: String,
      default: () => ''
    }
  },
  data () {
    return {
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '50'
        },
        {
          title: '参数名',
          dataIndex: 'paramName',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '类型',
          dataIndex: 'paramType',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '默认值',
          dataIndex: 'paramDefault',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '非空',
          dataIndex: 'isEmpty',
          minWidth: 140,
          scopedSlots: { customRender: 'custom' }
        }
      ],
      editTableData: []
    }
  },
  mounted () {
    this.editTableData = this.data || []
  },
  methods: {
    saveTableData (data) {
      let counter = 0
      data.forEach(item => {
        if(!item.id){
          item.id = Date.now() + '-' + (counter++)
        }
      })
      this.$emit('saveTabParam', this.tabName, data)
    }
  }
}
</script>

<template>
  <div id="Params">
    <editable-table :columns="columns"
                    :add-row="true"
                    :data="editTableData"
                    :change-table-data="editTableData"
                    height="100%"
                    @save-param-data="saveTableData">
      <template #paramName="{ scope, data }">
        <el-input v-model="scope.row.paramName"
                  style="width: 100%"
                  placeholder="请输入参数名"
                  clearable
                  @blur="saveTableData(data)"></el-input>
      </template>
      <template #paramType="{ scope, data }">
        <el-select v-model="scope.row.paramType" clearable placeholder="请选择类型" @change="saveTableData(data)">
          <el-option v-for="(item, index) in fieldType"
                     :key="index"
                     :label="item.label"
                     :value="item.label"
          ></el-option>
        </el-select>
      </template>
      <template #paramDefault="{ scope, data }">
        <el-input v-model="scope.row.paramDefault"
                  style="width: 100%"
                  placeholder="请输入默认值"
                  clearable
                  @change="saveTableData(data)"></el-input>
      </template>
      <template #isEmpty="{ scope, data }">
        <el-radio-group v-model="scope.row.isEmpty" @change="saveTableData(data)">
          <el-radio-button label="1">是</el-radio-button>
          <el-radio-button label="0">否</el-radio-button>
        </el-radio-group>
      </template>
    </editable-table>
  </div>
</template>

<style scoped lang="scss">
#Params {
  height: 100%;
}
</style>
