<template>
  <normal-layout :normalLayout="normalLayout"
                 :westFullHeight="true" style="background:#fff;">
    <template #north>
      <span class="secret_level">密级：{{secretLevel}}</span>
      <search-form-list ref="search"
                        :resetAfterToSearch="false"
                        :dataSource="dataSource"
                        @search="search"
                        @re-set="reset">
      </search-form-list>
    </template>
    <template #west>
      <user-task-pie-chart :queryParam="queryParam"
                           @pie-search="pieSearch">
      </user-task-pie-chart>
    </template>
    <template #center>
      <user-task-list :tableParams="tableParams">
      </user-task-list>
    </template>
  </normal-layout>

</template>
<script>

import moment from 'moment'
import { P8NormalLayout as NormalLayout, P8Search as SearchFormList } from 'p8-components-ui'

import UserTaskPieChart from './Components/userTaskPieChart'
import UserTaskList from './Components/userTaskList'
export default {
  name: 'TaskProgressInformation',
  props: {
  },
  data () {
    return {
      secretLevel: '机密',
      queryParam: {},
      tableParams: {},
      normalLayout: {
        west: {
          xs: 8, sm: 8, md: 8, lg: 8, xl: 8
        },
        center: {
          xs: 16, sm: 16, md: 16, lg: 16, xl: 16
        }
      },
      dataSource: [
        {
          type: 'datetimeRange',
          labelText: '计划时间',
          defaultValue: [],
          fieldName: 'recordingTime',
          placeholder: ['开始日期', '结束日期'],
          fieldConfig: {
            format: 'yyyy-MM-dd'
          }
        },
        {
          type: 'text',
          labelText: '任务名称',
          fieldName: 'taskName',
          placeholder: '请输入任务名称'
        },
        {
          type: 'text',
          labelText: '项目名称',
          fieldName: 'projectName',
          placeholder: '请输入项目名称'
        },
        {
          type: 'treeSelect',
          defaultValue: [],
          labelText: '项目类型',
          fieldName: 'kprojectClassifyId',
          placeholder: '请选择项目类型',
          defaultExpandAll: true,
          multiple: true,
          optionUrl: {
            api: 'ProjectApply.projectClassifyTree',
            params: {},
            // label: 'name',
            value: 'id'
          },
          treeData: []
        }
      ]
    }
  },
  created () {
    this.queryParam.searchUser = 'oneself'
    this.tableParams.searchUser = 'oneself'
  },
  mounted () {
    this.secretLevel = this.$store.state.user.userInfo.confidentialiteList[this.$store.state.user.userInfo.confidentialiteList.length - 1].name
  },
  computed: {

  },
  methods: {
    search (param) {
      let that = this
      if (param && param.recordingTime && param.recordingTime.length === 2) {
        param.planBeginDate = new Date(moment(param.recordingTime[0]).format('YYYY-MM-DD'))
        param.planEndDate = new Date(moment(param.recordingTime[1]).format('YYYY-MM-DD'))
      }
      if (param) {
        that.queryParam = param
        that.tableParams = param
      }
      this.queryParam.searchUser = 'oneself'
      this.tableParams.searchUser = 'oneself'
      this.tableParams.taskStatus = []
    },
    reset () {
      let that = this
      Object.keys(that.queryParam).forEach(key => { that.queryParam[key] = null })
      that.queryParam.searchUser = 'oneself'
      that.tableParams.taskStatus = []
    },
    pieSearch (status) {
      this.tableParams = { ...this.queryParam, ...{ taskStatus: [status] } }
    }
  },
  components: {
    UserTaskPieChart,
    UserTaskList,
    SearchFormList,
    NormalLayout
  }
}
</script>
<style lang="scss" scpoed>
.secret_level {
  position: absolute;
  right: 470px;
  top: 55px;
  font-weight: bolder;
  // top: 50%;
  // transform: translateY(-50%);
  color: red;
  font-size: larger;
}
</style>
