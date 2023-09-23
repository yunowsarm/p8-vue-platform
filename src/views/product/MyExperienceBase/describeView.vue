<template>
  <form-list ref="form"
             @rendered="rendered"
             form-layout="vertical"
             @saved="saved"
             class="form_desc"
             :data-source="dataSource"
             :api="saveApi"
             :is-custom-validate="isCustomValidate"
             @custom-validate="customValidate"
             :exist-default-btn="existDefaultBtn"
             :exist-custom-btn="existCustomBtn"
             :form="formData">
    <template #progress>
      <el-progress :text-inside="true"
                   :stroke-width="16"
                   :percentage="formData.progress ? formData.progress : 0"
                   style="margin-top: 7px"></el-progress>
    </template>
    <template #realName>
      <div style="display: flex;align-items: center">
        <i style="margin-left: 10px;margin-right: 5px"
           v-if="formData.userName"
           class="el-icon-user element_icon"></i>{{formData.userName || ''}}
        <i style="margin-left: 10px;margin-right: 5px"
           v-if="formData.roleName"
           class="icon-guolvfuwu p8"></i>{{formData.roleName || ''}}
        <i style="margin-left: 10px;margin-right: 5px"
           v-if="formData.deptName"
           class="icon-liuchenggenzongshitu p8"></i>{{formData.deptName || ''}}
      </div>
    </template>
  </form-list>
</template>
<style lang="scss" scoped>
.form_desc {
  ::v-deep .formBtn {
    display: none !important;
  }
}
</style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import moment from 'moment'

export default {
  name: 'PlanDescribeView',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    ganttName: {
      type: String,
      default: null
    },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data () {
    return {
      saveApi: 'planGanttManager.describeSave',
      isCustomValidate: true,
      existDefaultBtn: false,
      existCustomBtn: true,
      dataSource: [
        {
          type: 'view',
          labelText: '计划开始时间',
          fieldName: 'planBeginDate',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          fieldName: 'planEndDate',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '排程类型',
          fieldName: 'autoScheduling',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '工期',
          fieldName: 'duration',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '任务类型',
          fieldName: 'planTypeDisplay',
          colLayout: 'doubleCol'
        },
        {
          type: 'blank',
          labelText: '进度:',
          slotName: 'progress',
          colLayout: 'doubleCol'
        },
        {
          type: 'blank',
          labelText: '责任人',
          slotName: 'realName',
          fieldName: 'realName'
        },
        {
          labelText: '预计开始时间',
          type: 'view',
          fieldName: 'forecastBeginDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '预计完成时间',
          type: 'view',
          fieldName: 'forecastEndDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '实际开始时间',
          type: 'view',
          fieldName: 'realBeginDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '实际完成时间',
          type: 'view',
          fieldName: 'realEndDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '任务描述',
          type: 'view',
          fieldName: 'describes',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          }
        }
      ],
      formData: {
        deptName: null,
        roleName: null,
        userName: null,
        autoScheduling: null,
        duration: null,
        forecastBeginDate: null,
        forecastEndDate: null,
        planBeginDate: null,
        describes: null,
        realEndDate: null,
        realBeginDate: null,
        planEndDate: null,
        planTypeDisplay: null,
        progress: null
      }
    }
  },
  watch: {
    taskId (val) {
      this.rendered()
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  mounted () { },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getDescribeData(this.taskId)
      }
    },
    getDescribeData (taskId) {
      this.formData = Object.assign(this.formData, this.record)
    },
    saved (res) { },
    customValidate (saveParams) { }
  }
}
</script>
