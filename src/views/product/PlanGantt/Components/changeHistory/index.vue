<template>
  <div style="height: 100%;">
    <common-table ref="table"
                  width="100%"
                  :columns="columns"
                  :params="queryParam"
                  :api="tableApi"
                  :comp="comp"
                  height="100%"
                  :pagination=true>
      <template #operate="{ scope }">
        <el-button type='text'
                   v-if="toolbarWritingDisplay === '0'"
                   @click="showChangeDetail(scope.row)">查看</el-button>
        <el-tooltip v-if="toolbarWritingDisplay === '1'"
                    placement="top"
                    content="查看">
          <el-button type="primary"
                     icon="p8 icon-chakan"
                     @click="showChangeDetail(scope.row)"></el-button>
        </el-tooltip>
        <el-button type="primary"
                   v-if="toolbarWritingDisplay === '2'"
                   icon="p8 icon-chakan"
                   @click="showChangeDetail(scope.row)">查看</el-button>
      </template>
    </common-table>
    <el-drawer title="变更详情"
               :append-to-body="true"
               size="100%"
               :destroy-on-close="true"
               :wrapper-closable="false"
               @closed="onClose"
               :visible.sync="analysisVisible">
      <impact-analysis :plan-info-id="planInfoId"
                       @closed="onClose"
                       :create-page="page"
                       :read-only="true"
                       :taskId="taskId"
                       :wholeDescribeId="wholeDescribeId"
                       :change-id="changeId"></impact-analysis>
    </el-drawer>
  </div>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
import ImpactAnalysis from '../../../ChangeGantt/Components/impactAnalysis';

export default {
  name: 'ChangeGantt',
  components: { CommonTable, ImpactAnalysis },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    wholeDescribeId: {
      type: String,
      default: ''
    },
    planInfoId: {
      type: String,
      default: ''
    },
    createPage: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      comp: this,
      tableApi: 'planGanttManager.getChangeList',
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 80,
          headerAlign: 'center'
        },
        {
          title: '变更人',
          dataIndex: 'createUserName'
        },
        {
          title: '部门',
          dataIndex: 'deptName'
        },
        {
          title: '发起时间',
          dataIndex: 'triggerTime'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          title: '是否产生变更记录',
          dataIndex: 'weatherChange',
          width: 150,
          formatter: function (row) {
            if (row.weatherChange === '0') {
              return '是'
            } else if (row.weatherChange === '1') {
              return '否'
            }
          }
        },
        {
          title: '变更计划数',
          width: 120,
          dataIndex: 'changeCount'
        },
        {
          title: '变更原因分类',
          width: 120,
          dataIndex: 'changeTypeDisp'
        },
        {
          title: '变更原因',
          dataIndex: 'reason'
        },
        {
          title: '变更类型',
          dataIndex: 'reasonChangeDisp'
        },
        {
          title: '状态',
          dataIndex: 'changeStateDisp'
        },
        {
          title: '操作',
          width: 140,
          align: 'center',
          fixed: 'right',
          dataIndex: 'operate',
          scopedSlots: { customRender: 'custom' },
        }
      ],
      queryParam: {
        taskId: this.taskId,
        page: {
          current: 1,
          orders: [],
          sieze: 20
        }
      },
      page: '',
      changeId: '',
      analysisVisible: false,
      toolbarWritingDisplay: '0'
    }
  },
  mounted () {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = '0'
    }
    if (this.createPage == 'compile') {
      this.page = 'planChange'
    } else {
      this.page = 'userChange'
    }
  },
  methods: {
    showChangeDetail (row) {
      this.changeId = row.id
      this.analysisVisible = true
    },
    onClose () {
      this.analysisVisible = false
      this.$emit('close')
    },
  }
}
</script>

<style>
</style>