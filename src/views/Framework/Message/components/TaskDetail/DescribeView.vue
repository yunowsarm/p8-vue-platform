<script>
// 导入 P8Form 组件和 moment.js 库
import { P8Form as FormList } from 'p8-components-ui'
import moment from 'moment'

// 定义 DescribeView 组件
export default {
  name: 'DescribeView',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 定义数据源数组，包含表单字段的配置
      dataSource: [
        // 任务名称字段配置
        {
          labelText: '任务名称',
          type: 'view',
          fieldName: 'name',
          colLayout: 'singleCol'
        },
        // 计划开始时间字段配置
        {
          type: 'view',
          labelText: '计划开始时间',
          fieldName: 'planBeginDate',
          colLayout: 'doubleCol'
        },
        // 计划完成时间字段配置
        {
          type: 'view',
          labelText: '计划完成时间',
          fieldName: 'planEndDate',
          colLayout: 'doubleCol'
        },
        // 工期字段配置
        {
          type: 'view',
          labelText: '工期',
          fieldName: 'duration',
          colLayout: 'doubleCol'
        },
        // 任务类型字段配置
        {
          type: 'view',
          labelText: '任务类型',
          fieldName: 'planTypeDisplay',
          colLayout: 'doubleCol'
        },
        // 责任人字段配置
        {
          type: 'view',
          labelText: '责任人',
          fieldName: 'realName',
          colLayout: 'doubleCol'
        },
        // // 绩效字段配置
        // {
        //   type: 'view',
        //   labelText: '绩效',
        //   fieldName: 'achievements',
        //   colLayout: 'doubleCol'
        // },
        // // 比例字段配置
        // {
        //   type: 'view',
        //   labelText: '比例',
        //   fieldName: 'proportion',
        //   colLayout: 'doubleCol'
        // },
        // 预计开始时间字段配置
        {
          labelText: '预计开始时间',
          type: 'view',
          fieldName: 'forecastBeginDate',
          colLayout: 'doubleCol'
        },
        // 预计完成时间字段配置
        {
          labelText: '预计完成时间',
          type: 'view',
          fieldName: 'forecastEndDate',
          colLayout: 'doubleCol'
        },
        // 实际开始时间字段配置
        {
          labelText: '实际开始时间',
          type: 'view',
          fieldName: 'realBeginDate',
          colLayout: 'doubleCol'
        },
        // 实际结束时间字段配置
        {
          labelText: '实际结束时间',
          type: 'view',
          fieldName: 'realEndDate',
          colLayout: 'doubleCol'
        },
        // 任务描述字段配置
        {
          labelText: '任务描述',
          type: 'blank',
          fieldName: 'describes',
          slotName: 'describes',
          colLayout: 'singleCol'
        }
      ],
      // 定义表单数据对象
      formData: {}
    }
  },
  created() {
    this.fetchTaskData(this.taskId)
  },
  methods: {
    // 根据任务 ID 获取任务数据的方法
    async fetchTaskData(taskId) {
      // 调用 API 获取甘特图扩展属性数据
       this.$api['planGanttManager.getGanttExtendAttr']({ taskId: taskId })
        .then(async (res) => {
          // 将获取到的数据赋值给 formData
          this.formData = res
          // 组合责任人信息
          if (this.formData.dutyName) {
            this.formData.realName = `${this.formData.dutyName}-${this.formData.dutyUnitDeptName}-${this.formData.roleName}`
          }
          // 格式化比例和绩效（保留两位小数）
          this.formData.proportion = this.formData.proportion ? (Math.round(res.proportion * 100) / 100) + '%' : 0;
          this.formData.achievements = this.formData.achievements ? (Math.round(res.achievements * 100) / 100) : 0;
          // 获取扩展属性
          if (res && res.taskExtendList) {
            for (const item of res.taskExtendList) {
              if (item.fieldType === 'datepicker') {
                let date = moment(item.fieldValue)
                this.$set(this.formData, 'kz' + item.customItem1, date.isValid() ? date : '')
              } else {
                if (['selectSingle', 'treeSingle', 'selectMultiple', 'treeMultiple'].includes(item.fieldType)) {
                  let list = await this.$api['formGenerator.getSelectionDataDic']({ selectCode: item.selectCode })
                  let taskList = item.fieldValue ? item.fieldValue.split(',') : []
                  let result = []
                  list.forEach(el => {
                    taskList.forEach(item => {
                      if (el.value === item) {
                        result.push(el.label)
                      }
                    })
                  })
                  this.$set(this.formData, 'kz' + item.customItem1, result.join(','))
                } else {
                  this.$set(this.formData, 'kz' + item.customItem1, item.fieldValue)
                }
              }
            }
          }
          const wholeDescribeId = this.formData.wholeDescribeId
          const columnSettings = await this.$api['planGanttManager.getGanttColumnSettingByWholeId']({ wholeDescribeId: wholeDescribeId })
          debugger
          this.extraList = columnSettings.filter((item) => item.attributeType === '1')
          this.extraList.forEach((extra) => {
            this.dataSource.push({
              labelText: extra.name,
              type: 'view',
              fieldName: 'kz' + extra.id,
              colLayout: 'doubleCol'
            })
          })
          // 调用 API 获取任务活动信息
          return this.$api['planGanttManager.getActivityInfoByTaskId']({ taskId: taskId, planChangeDetailId: null })
        })
        .then((res) => {
          // 更新 formData 中的任务描述信息
          this.$set(this.formData, 'describes', res.describes)
        })
        .catch((error) => {
          // 错误处理
          console.error('Error fetching task data:', error)
        })
    },
    // 格式化日期的方法，可选择是否减去一天
    formatDate(value, subtract) {
      let newDate
      if (subtract) {
        // 如果需要减去一天，则使用 subtract 方法
        newDate = moment(value).subtract(1, 'days').format('YYYY-MM-DD')
      } else {
        // 否则直接格式化日期
        newDate = moment(value).format('YYYY-MM-DD')
      }
      return newDate
    }
  }
}
</script>

<template>
  <div>
    <!-- 使用 FormList 组件显示表单数据 -->
    <form-list ref="form" form-layout="vertical" :data-source="dataSource" :form="formData" :exist-default-btn="false">
      <!-- 使用模板插槽自定义字段显示 -->
      <template #name>
        <span style="color: red">{{ formData['name'] }} </span>
      </template>
      <template #startDate>
        <span style="color: red">{{ formatDate(formData['planBeginDate']) }} </span>
      </template>
      <template #endDate>
        <span style="color: red">{{ formatDate(formData['planEndDate'], true) }} </span>
      </template>
      <template #duration>
        <span style="color: red">{{ formData['duration'] }}</span>
      </template>
      <template #planTypeDisplay>
        <span style="color: red">{{ formData['planTypeDisplay'] }}</span>
      </template>
      <template #realName>
        <span style="color: red">{{ formData['realName'] }}</span>
      </template>
      <template #achievements>
        <span style="color: red">{{ formData['achievements'] }}</span>
      </template>
      <template #proportion>
        <span style="color: red">{{ formData['proportion'] }}</span>
      </template>
      <template #describes>
        <span v-html="formData['describes']"></span>
      </template>
    </form-list>
  </div>
</template>

<style scoped lang="scss">
// 此处添加组件的样式
::v-deep img{
  width: 100%;
  height: auto;
}
</style>
