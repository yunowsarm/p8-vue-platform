<template>
  <list-layout :header-visible="false">
    <template #north> </template>
    <template #center>
      <common-table ref="table"
                    :columns="columns"
                    :api="tableApi"
                    style="height: 100%"
                    :params="tableParam"
                    :pagination="true"
                    @selection-change="handleSelectionChange">
        <!-- <template #monitorPoints="{scope}">
          <span v-if="scope.row.monitorPoints">
            <i v-for="item in handleRowMointor(scope.row)"
               :key="item.id"
               :class="`${item.icon}`"
               :title="item.name"></i>
          </span>
        </template> -->
      </common-table>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable } from 'p8-components-ui'
export default {
  name: 'Index',
  components: {
    CommonTable,
    ListLayout
  },
  props: {
    avTaskId: {
      type: String,
      default: ''
    }
  },
  created () {
    const that = this
    // getMonitorData({ monitorId: [] }).then((res) => {
    //   that.monitorpointDataArray = res
    // })
  },
  data () {
    return {
      tableApi: 'myExperience.getConnectCourtTaskList',
      tableParam: {
        taskId: this.avTaskId
      },
      monitorpointDataArray: null,
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center',
          headerAlign: 'center'
        },
        // {
        //   title: '状态',
        //   dataIndex: 'taskStatusDic',
        //   minWidth: 240,
        //   align: 'left'
        // },
        // {
        //   title: '标识',
        //   dataIndex: 'monitorPoints',
        //   minWidth: 100,
        //   scopedSlots: { customRender: 'custom' },
        //   align: 'center'
        // },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          minWidth: 240,
          align: 'left'
        },
        {
          title: '责任单位(人)',
          dataIndex: 'dutyUser',
          minWidth: 130,
          align: 'center'
          // filterable: true,
          // iconDisplay: false,
          // filter: {
          //   val: '',
          //   type: 'text',
          //   alias: 'dutyKeyWords'
          // }
        },
        {
          title: '角色',
          dataIndex: 'dutyUserDept',
          minWidth: 130,
          align: 'center'
        },
        {
          title: '部门',
          dataIndex: 'dutyUserDept',
          minWidth: 130,
          align: 'center'
        },
        {
          title: '工期',
          dataIndex: 'duration',
          minWidth: 100,
          align: 'center',
          formatter (row) {
            if (row.duration) {
              return row.duration + '天'
            } else {
              return '-'
            }
          }
        },
        {
          title: '计划开始时间',
          minWidth: 130,
          dataIndex: 'planBeginDate',
          align: 'center'
          // filterable: true,
          // iconDisplay: false,
          // filter: {
          //   val: '',
          //   type: 'datetime',
          //   fieldConfig: {
          //     valueFormat: 'yyyy-MM-dd'
          //   },
          //   alias: 'planBeginDateArr'
          // }
        },
        {
          title: '计划完成时间',
          minWidth: 130,
          dataIndex: 'planEndDate',
          align: 'center'
          // filterable: true,
          // iconDisplay: false,
          // filter: {
          //   val: '',
          //   type: 'datetime',
          //   fieldConfig: {
          //     valueFormat: 'yyyy-MM-dd'
          //   },
          //   alias: 'planEndDateArr'
          // }
        },
        {
          title: '进度',
          minWidth: 100,
          dataIndex: 'progress',
          align: 'center',
          formatter (row) {
            if (row.progress) {
              return (row.progress * 100).toFixed(2) + '%'
            } else {
              return '-'
            }
          }
        }
      ],
      selectedRows: []
    }
  },
  methods: {
    handleRowMointor (row) {
      if (row && row.monitorPoints) {
        const monitorPoints = row.monitorPoints.split(',')
        const mointIcon = []
        monitorPoints.forEach((item) => {
          mointIcon.push(this.monitorpointDataArray[item])
        })
        return mointIcon
      }
    },
    handleSelectionChange (rows) {
      if (rows.length >= 2) {
        const arrays = rows.splice(0, rows.length - 1)
        arrays.forEach((row) => {
          this.$refs.table.$refs.table.toggleRowSelection(row)
        })
      }
      this.selectedRows = rows
    }
  }
}
</script>

<style scoped></style>
