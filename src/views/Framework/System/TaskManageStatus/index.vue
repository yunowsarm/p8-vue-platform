<template>
  <list-layout>
    <template #center>
      <div class="common-table">
        <div :class="{ 'small-table': true }" :style="{ height: flexHeight }">
          <el-table ref="table" height="100%" :data="tableData" @row-click="editIcon">
            <el-table-column prop="icon" width="280" label="图标">
              <template slot-scope="scope">
                <i :class="scope.row.icon" :style="{ 'font-size': '20px', color: scope.row.color }"></i>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="状态"></el-table-column>
          </el-table>
        </div>
      </div>
      <common-dialog
        title="图标选择"
        width="50%"
        v-if="editIconDialog"
        :visible="editIconDialog"
        :dialog-config="dialogConfig"
        :dialog-height="dialogHeight"
        @close="onEditIConClose"
        @handle-cancel="onEditIConClose"
        @handle-ok="saveCallback"
      >
        <template #dialog>
          <icon-selector @icon-select="onEditIConOK" :selected-name="record.icon" :selected-color="record.color" :color-picker="true"></icon-selector>
        </template>
      </common-dialog>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog, Table, TableColumn, P8IconSelector as IconSelector } from 'p8-components-ui'

export default {
  name: 'StandardTeam',
  data() {
    return {
      flexHeight: '550px',
      queryParam: {},
      record: {},
      editIconDialog: false,
      tableData: [],
      tableApi: 'userManager.dicData',
      getBaseConfigApi: 'SystemSettings.getBaseConfigSettings',
      saveBaseConfigApi: 'SystemSettings.saveBaseConfigSettings',
      currentRow: '',
      iconTemp: '',
      colorTemp: '',
      dialogHeight: 400,
      dialogConfig: {
        modal: false
      }
    }
  },
  mounted() {
    this.getStatusList()
  },
  methods: {
    editIcon(row, column, event) {
      this.record = row
      this.editIconDialog = true
    },
    saveCallback() {
      let that = this
      that.$api[that.saveBaseConfigApi]({
        settings: [
          { key: that.record.iconKey, value: that.iconTemp },
          { key: that.record.colorKey, value: that.colorTemp }
        ]
      }).then((res) => {
        that.getStatusList()
        this.onEditIConClose()
      })
    },
    onEditIConClose() {
      this.editIconDialog = false
    },
    onEditIConOK(res) {
      this.iconTemp = res.icon
      this.colorTemp = res.color
    },
    getStatusList(kTeamId) {
      let that = this
      let statusKey = []
      that.$api[that.tableApi]({ dicType: 'MANAGER_STATUS' }).then(function (res) {
        let dataTemp = []
        res.forEach(function (item) {
          let temp = {}
          temp.id = item.value
          temp.name = item.label
          temp.iconKey = 'managerStatus-icon-' + item.value
          temp.colorKey = 'managerStatus-color-' + item.value
          dataTemp.push(temp)
          statusKey.push('managerStatus-icon-' + item.value)
          statusKey.push('managerStatus-color-' + item.value)
        })
        that.$api[that.getBaseConfigApi]({ keys: statusKey }).then(function (res) {
          res.settings.forEach(function (item) {
            dataTemp.forEach(function (itemData) {
              if (item.key === itemData.iconKey) {
                itemData.icon = item.value
              }
              if (item.key === itemData.colorKey) {
                itemData.color = item.value
              }
            })
          })
          that.tableData = dataTemp
        })
      })
    }
  },
  components: {
    ListLayout,
    IconSelector,
    CommonDialog,
    'el-table': Table,
    'el-table-column': TableColumn
  }
}
</script>
