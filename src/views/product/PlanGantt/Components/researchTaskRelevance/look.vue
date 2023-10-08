<template>
  <common-table ref="table" :columns="columns" :api="tableApi" style="height: 100%" :params="tableParam" :pagination="false">
    <!--    <template #monitorPointArray="{scope}">-->
    <!--      <span v-if="scope.row.monitorPointArray && scope.row.monitorPointArray.length > 0">-->
    <!--        <i v-for="item in scope.row.monitorPointArray" :key="item.id" :class="`${item.icon}`" :title="item.pointName"></i>-->
    <!--      </span>-->
    <!--    </template>-->
  </common-table>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
export default {
  name: 'Index',
  components: {
    CommonTable
  },
  props: {
    tasks: {
      type: Array
    }
  },
  created() {},
  data() {
    return {
      tableApi: 'myExperience.courtyardPlanData',
      tableParam: {
        factoryTaskId: this.tasks && this.tasks[0] ? this.tasks[0].id : '',
        courtyardTaskId: this.tasks && this.tasks[0] ? this.tasks[0].relationCourtTaskId : ''
      },
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center'
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          minWidth: 240,
          align: 'left'
        },
        // {
        //   title: '标识',
        //   dataIndex: 'monitorPointArray',
        //   minWidth: 100,
        //   scopedSlots: { customRender: 'custom' },
        //   align: 'center'
        // },
        {
          title: '责任单位（人）',
          dataIndex: 'dutyName',
          minWidth: 130,
          align: 'center',
          filterable: true,
          iconDisplay: false,
          filter: {
            val: '',
            type: 'text',
            alias: 'userName'
          }
        },
        {
          title: '角色',
          dataIndex: 'teamRoleName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '部门',
          dataIndex: 'deptName',
          minWidth: 130,
          align: 'center'
        },
        {
          title: '工期',
          dataIndex: 'duration',
          minWidth: 100,
          align: 'center',
          formatter(row) {
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
          align: 'center',
          filterable: true,
          iconDisplay: false,
          filter: {
            val: '',
            type: 'datetime',
            fieldConfig: {
              valueFormat: 'yyyy-MM-dd'
            },
            alias: 'queryMinDate'
          }
        },
        {
          title: '计划完成时间',
          minWidth: 130,
          dataIndex: 'computedPlanEndDate',
          align: 'center',
          filterable: true,
          iconDisplay: false,
          filter: {
            val: '',
            type: 'datetime',
            fieldConfig: {
              valueFormat: 'yyyy-MM-dd'
            },
            alias: 'queryMaxDate'
          }
        },
        {
          title: '进度',
          minWidth: 100,
          dataIndex: 'progress',
          align: 'center',
          formatter(row) {
            if (row.progress) {
              return row.progress + '%'
            } else {
              return '-'
            }
          }
        }
      ],
      selectedRows: []
    }
  },
  methods: {}
}
</script>

<style scoped></style>
