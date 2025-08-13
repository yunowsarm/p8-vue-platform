<template>
  <normal-layout :headerVisible="false">
    <template #west>
      <div style="text-align: center">
        <common-table ref="projectTable"
                      :columns="projectTableColumn"
                      :api="projectTableApi"
                      :style="{height: tableHeight}"
                      :pagination="false"
                      :tableSetting="false"
                      :tableConfig="projectTableConfig"
                      @row-click="projectTableRowClickHandle"
                      @requested-table-data="getProjectTableData">
        </common-table>
      </div>
    </template>
    <template #center>
      <common-table ref="roleTable"
                    :style="{height: tableHeight}"
                    :columns="roleTableColumn"
                    :pagination="false"
                    :tableSetting="false"
                    :noApiTableData="roleTableData">
      </common-table>
    </template>
  </normal-layout>
</template>
<script>
import { P8NormalLayoutV1 as NormalLayout, P8Table as CommonTable } from 'p8-components-ui'

export default {
  name: 'ExperienceTeam',
  props: {
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const projectTableColumn = [
      {
        title: '已参与的项目',
        dataIndex: 'name'
      }
    ]
    const roleTableColumn = [
      // {
      //   type: 'selection',
      //   width: 80,
      //   align: 'center'
      // },
      {
        type: 'index',
        title: '序号',
        width: 80,
        align: 'center',
        headerAlign: 'center'
      },
      {
        align: 'center',
        title: '角色名称',
        dataIndex: 'name'
      }
    ]
    const mh = document.documentElement.clientHeight
    return {
      tableHeight: mh * 0.6 - 94 + 'px',
      projectTableApi: 'teamManager.myWholeDescribeList',
      projectTableColumn,
      projectTableConfig: {
        'highlight-current-row': true
      },
      roleTableApi: 'teamManager.myRoleList',
      roleTableColumn,
      roleTableData: []
    }
  },
  watch: {
    fullscreen: {
      handler (val) {
        const ch = document.documentElement.clientHeight
        if (val) {
          this.tableHeight = ch - 144 + 'px'
        } else {
          this.tableHeight = ch * 0.6 - 94 + 'px'
        }
      },
      immediate: true
    }
  },
  mounted () {

  },
  methods: {
    getRoleList (id) {
      this.$api['teamManager.myRoleList']({ wholeDescribeId: id }).then(res => {
        this.roleTableData = res
        this.$emit('experience-table-select', res)
      })
    },
    projectTableRowClickHandle (row) {
      this.getRoleList(row.id)

    },
    getProjectTableData (data) {
      if (data.length) {
        this.getRoleList(data[0].id)
      }
    }
  },
  components: {
    NormalLayout,
    CommonTable
  }
}
</script>
