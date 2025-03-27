<template>
  <div style="position: relative; height: 100%"
       :style="{ width: '100%' }">
    <form-list ref="form"
               @rendered="rendered"
               form-layout="vertical"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :is-custom-validate="isCustomValidate"
               @custom-validate="customValidate"
               :other-param="otherParam"
               :exist-default-btn="existDefaultBtn"
               :exist-custom-btn="existCustomBtn"
               :form="formData">
      <template #name>
        <span style="color: red;">{{formData["name"]}}
        </span>
        <span v-if="tooltipContent.name">({{ tooltipContent.name }})</span>
      </template>
      <template #startDate>
        <span style="color: red;">{{formData["start_date"]}}
        </span>
        <span v-if="tooltipContent.start_date">({{ tooltipContent.start_date }})</span>
      </template>
      <template #endDate>
        <span style="color: red;">{{formData["end_date"]}}
        </span>
        <span v-if="tooltipContent.end_date">({{ tooltipContent.end_date }})</span>
      </template>
      <template #duration>
        <span style="color: red;">{{formData["duration"]}}</span>
        <span v-if="tooltipContent.duration">({{ tooltipContent.duration }})</span>
      </template>
      <template #planTypeDisplay>
        <span style="color: red;">{{formData["planTypeDisplay"]}}</span>
        <span v-if="tooltipContent.planTypeDisplay">({{ tooltipContent.planTypeDisplay }})</span>
      </template>
      <template #realName>
        <span style="color: red;">{{formData["realName"]}}</span>
        <span v-if="tooltipContent.realName">({{ tooltipContent.realName }})</span>
      </template>
      <template #achievements>
        <span style="color: red;">{{formData["achievements"]}}</span>
        <span v-if="tooltipContent.achievements">({{ tooltipContent.achievements }})</span>
      </template>
      <template #proportion>
        <span style="color: red;">{{formData["proportion"]}}</span>
        <span v-if="tooltipContent.proportion">({{ tooltipContent.proportion }})</span>
      </template>
      <template #describes>
        <span v-html="formData.describes"></span>
        <!-- <span style="color: red;">{{formData["describes"]}}</span>
        <span v-if="tooltipContent.describes">({{ tooltipContent.describes }})</span> -->
      </template>
    </form-list>
  </div>
</template>
<style scoped>
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
    formWidth: {
      type: [Number, String],
      default: 0
    }
  },
  data () {
    return {
      tooltipContent: {},
      saveApi: 'planGanttManager.describeSave',
      isCustomValidate: true,
      ownerDataOptions: [],
      existDefaultBtn: false,
      existCustomBtn: true,
      planTypeDic: [],
      dataSource: [
        {
          labelText: '任务名称',
          type: 'view',
          fieldName: 'name',
          placeholder: '请输入任务名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '计划开始时间',
          fieldName: 'start_date',
          colLayout: 'doubleCol',
          placeholder: '选择计划开始时间',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          fieldName: 'end_date',
          colLayout: 'doubleCol',
          placeholder: '选择计划完成时间',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        // {
        //   type: 'view',
        //   labelText: '排程类型',
        //   fieldName: 'autoScheduling',
        //   colLayout: 'doubleCol',
        //   placeholder: '选择排程类型',
        //   options: [
        //     { 'label': '自动', 'value': '1' },
        //     { 'label': '手动', 'value': '2' }
        //   ]
        // },
        {
          type: 'view',
          labelText: '工期',
          fieldName: 'duration',
          colLayout: 'doubleCol',
          placeholder: '选择填写工期',
          min: 0,
          max: 99999
        },
        {
          type: 'view',
          labelText: '任务类型',
          fieldName: 'planTypeDisplay',
          colLayout: 'doubleCol',
          placeholder: '选择任务类型',
          options: []
        },
        {
          type: 'view',
          labelText: '责任人',
          fieldName: 'realName',
          // colLayout: 'doubleCol',
          placeholder: '选择责任人',
          fieldConfig: {
            filterable: true
          },
          options: []
        },
        // {
        //   type: 'view',
        //   labelText: '绩效',
        //   fieldName: 'achievements',
        //   colLayout: 'doubleCol'
        // },
        // {
        //   type: 'view',
        //   labelText: '比例',
        //   fieldName: 'proportion',
        //   colLayout: 'doubleCol'
        // },
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
          labelText: '实际结束时间',
          type: 'view',
          fieldName: 'realEndDate',
          colLayout: 'doubleCol'
        }
      ],
      formData: {},
      otherParam: {
        activityInfoId: ''
      },
      describes: '',
      oldFormData: {},
      defaultList: ['createTime', 'createBy', 'changeCount', 'updateTime', 'updateBy', 'achievements', 'proportion'],
      ganttColumns: []
    }
  },
  watch: {
    // taskId: {
    //   handler (val) {
    //     if (val) {
    //       this.rendered()
    //     }
    //   },
    // },
    ownerDataOptions (newValue) {
      if (newValue) {
        const options = []
        newValue.forEach(function (item) {
          options.push({ value: item.id, label: '[' + item.deptName + ']' + item.name + '-' + item.roleName })
        })
        const select = this.dataSource.filter((item) => item.fieldName === 'owner_id')
        select[0].options = options
      }
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  created () {
    this.$api['thirdPartInterface.getDic']({ dicType: 'ACTIVITY_TYPE' }).then(res => {
      this.planTypeDic = res
    })
  },
  mounted () {
    let that = this
    const ganttObject = GanttObject.getGanttObject(this.ganttName)
    const task = ganttObject.getTask(this.taskId)
    this.$api['planGanttManager.getGanttExtendAttr']({ taskId: task.id }).then((res) => {
      if (res && res.taskExtendList) {
        this.extraIds = {}
        res.taskExtendList.forEach(async (item) => {
          if (item.fieldType == 'datepicker') {
            let date = moment(item.fieldValue)
            this.$set(this.formData, 'kz' + item.customItem1, date.isValid() ? moment(date).format('YYYY-MM-DD') : '')
          } else {
            if (item.fieldType == 'selectSingle' || item.fieldType == 'treeSingle' || item.fieldType == 'selectMultiple' || item.fieldType == 'treeMultiple') {
              let list = await that.$api['formGenerator.getSelectionDataDic']({ selectCode: item.selectCode })
              let taskList = item.fieldValue ? item.fieldValue.split(',') : []
              let result = []
              list.forEach(el => {
                taskList.forEach(item => {
                  if (el.value == item) {
                    result.push(el.label)
                  }
                })
              })
              this.$set(this.formData, 'kz' + item.customItem1, result.join(','))
            } else {
              // this.$set(this.formData, 'kz' + item.customItem1, item.fieldValue)
            }
          }
        })
      }
    })
    // this.formData.secretGradeDisplay = task.secretGradeDisplay
    // this.$api['planGanttManager.classifiedFiltering']({ secretGrade: task.secretGrade }).then((res) => {
    //   this.falg = res
    // })
    this.extraList = this.vueThis.columnSettings.filter((item) => item.attributeType === '1')
    this.extraKeys = []
    this.extraList.forEach((extra) => {
      this.extraKeys.push(extra.filedName)
      this.dataSource.push({
        labelText: extra.name,
        type: 'view',
        fieldName: 'kz' + extra.id,
        placeholder: `请输入${extra.name}`,
        colLayout: 'doubleCol'
      })
    })
    // 处理默认属性
    this.ganttColumns = ganttObject.config.columns.filter((el) => el.hide !== true && this.defaultList.includes(el.name))
    this.ganttColumns.forEach(el => {
      const startIdx = el.label.indexOf('<div class="gantt_search">');
      const endIdx = el.label.indexOf('</div>', startIdx);
      let content = ''
      if (startIdx !== -1 && endIdx !== -1) {
        content = el.label.substring(startIdx + '<div class="gantt_search">'.length, endIdx);
      }
      // 使用正则表达式去掉 <i> 标签及其内容
      content = content.replace(/<i\b[^<]*(?:(?!<\/i>)<[^<]*)*<\/i>/gi, '');
      this.dataSource.push({
        labelText: content,
        type: 'view',
        fieldName: el.name,
        colLayout: 'doubleCol'
      })
    })
    this.dataSource.push({
      labelText: '任务描述',
      type: 'blank',
      fieldName: 'describes',
      slotName: 'describes',
      placeholder: '请输入活动描述',
      colLayout: 'singleCol',
      fieldConfig: {
        rows: '6'
      }
    })
    if (this.$route.path === '/TaskChange') {
      this.getPlanInfo(task)
    }
  },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getDescribeData(this.taskId)
      }
    },
    async getDescribeData (taskId) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      that.ownerDataOptions = ganttObject.serverList('resourceDatas')
      const task = ganttObject.getTask(taskId)
      that.formData.name = task.name

      that.formData.start_date = moment(task.start_date).format('YYYY-MM-DD')
      that.formData.end_date = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
      if (that.ownerDataOptions && that.ownerDataOptions.length > 0) {
        that.ownerDataOptions.some(function (item) {
          if (item.id === task.owner_id) {
            that.formData.realName = item.name + '-' + item.deptName + '-' + item.roleName
          }
        })
      }
      that.formData.autoScheduling = task.autoScheduling
      that.formData.duration = task.duration
      that.formData.achievements = task.achievements
      // if (task.proportion) {
      //   let parts = task.proportion && task.proportion.toString().split('.')
      //   var fraction = parts.length === 1 ? '' : parts[1];
      //   if (2 > fraction.length) {
      //     fraction += new Array(2 - fraction.length + 1).join('0');
      //   }
      // that.formData.proportion = parts[0] + '.' + fraction + '%'
      // }
      that.formData.planType = task.planType
      that.formData.forecastBeginDate = moment(task.forecastBeginDate).format('YYYY-MM-DD')
      that.formData.forecastEndDate = moment(task.forecastEndDate).format('YYYY-MM-DD')
      if (task.realBeginDate) that.formData.realBeginDate = moment(task.realBeginDate).format('YYYY-MM-DD')
      if (task.realEndDate) that.formData.realEndDate = moment(task.realEndDate).format('YYYY-MM-DD')
      this.ganttColumns = ganttObject.config.columns.filter((el) => el.hide !== true && this.defaultList.includes(el.name))
      this.ganttColumns.forEach(el => {
        if (task[el.name]) {
          that.formData[el.name] = task[el.name]
          if (el.name == 'proportion') {
            that.formData[el.name] = task[el.name].toFixed(2) + '%'
          }
        }
      })
      // 获取描述信息
      await that.$api['planGanttManager.getActivityInfoByTaskId']({ taskId: taskId, planChangeDetailId: task.planChangeDetailId })
        .then(function (res) {
          if (res) {
            that.formData.describes = res.describes ? res.describes : res.describesBefore
            that.formData.planTypeDisplay = res.planTypeDisplay
            that.formData.proportion = res.proportion ? Math.round(res.proportion) + '%' : ''
            that.describes = that.formData.describes
            that.otherParam.activityInfoId = res.activityInfoId

            if (res.taskName !== null) {
              if (res.taskName !== res.taskNameBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'name') {
                    item.type = 'blank'
                    item.slotName = 'name'
                  }
                })
                that.tooltipContent.name = res.taskNameBefore
              }
            }
            if (res.startDate !== null) {
              if (res.startDate !== res.startDateBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'start_date') {
                    item.type = 'blank'
                    item.slotName = 'startDate'
                  }
                })
                that.tooltipContent.start_date = res.startDateBefore
              }
            }
            if (res.planEndDate !== null) {
              if (res.planEndDate !== res.planEndDateBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'end_date') {
                    item.type = 'blank'
                    item.slotName = 'endDate'
                  }
                })
                if (res.planEndDateBefore) {
                  let planEndDateBefore = new Date(res.planEndDateBefore).getTime() - 24 * 60 * 60 * 1000
                  that.tooltipContent.end_date = moment(planEndDateBefore).format('YYYY-MM-DD')
                }
                if (res.planEndDate) {
                  let planEndDate = new Date(res.planEndDate).getTime() - 24 * 60 * 60 * 1000
                  that.formData.end_date = moment(planEndDate).format('YYYY-MM-DD')
                }
              }
            }
            if (res.duration !== null) {
              if (res.duration !== res.durationBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'duration') {
                    item.type = 'blank'
                    item.slotName = 'duration'
                  }
                })
                that.tooltipContent.duration = res.durationBefore
              }
            } else if (!!res.durationBefore) {
              that.formData.duration = res.durationBefore
            }
            if (res.planTypeDisplay !== null) {
              if (res.planTypeDisplay !== res.planTypeDisplayBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'planTypeDisplay') {
                    item.type = 'blank'
                    item.slotName = 'planTypeDisplay'
                  }
                })
                that.tooltipContent.planTypeDisplay = res.planTypeDisplayBefore
              }
            }
            if (res.realName !== null) {
              if (res.realName !== res.realNameBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'realName') {
                    item.type = 'blank'
                    item.slotName = 'realName'
                  }
                })
                if (res.realNameBefore) {
                  that.tooltipContent.realName = res.realNameBefore + '-' + res.deptNameBefore + '-' + res.roleNameBefore
                }
              }
            }
            if (res.achievements !== null) {
              if (res.achievements !== res.achievementsBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'achievements') {
                    item.type = 'blank'
                    item.slotName = 'achievements'
                  }
                })
                that.tooltipContent.achievements = res.achievementsBefore
              }
            }
            if (res.proportion !== null) {
              if (res.proportion !== res.proportionBefore) {
                that.dataSource.forEach(item => {
                  if (item.fieldName === 'proportion') {
                    item.type = 'blank'
                    item.slotName = 'proportion'
                  }
                })
                if (res.proportionBefore) {
                  that.tooltipContent.proportion = Math.round(res.proportionBefore) + '%'
                }
              }
            }
            // if (res.describes !== null) {
            //   if (res.describes !== res.describesBefore) {
            //     that.dataSource.forEach(item => {
            //       if (item.fieldName === 'describes') {
            //         item.type = 'blank'
            //         item.slotName = 'describes'
            //       }
            //     })
            //     that.tooltipContent.describes = res.describesBefore
            //   }
            // }
          }
          // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
          if (
            (that.ganttName === 'changeGantt' || that.ganttName === 'analysisGantt') &&
            that.vueThis.newTaskMap &&
            Object.keys(that.vueThis.newTaskMap).length > 0 &&
            that.vueThis.newTaskMap[taskId] &&
            that.vueThis.newTaskMap[taskId].updateInfo &&
            that.vueThis.newTaskMap[taskId].updateInfo.indexOf('describes') !== -1
          ) {
            that.formData.describes = that.vueThis.newTaskMap[taskId].describes
          }
          if (that.planTypeDic.length > 0 && that.formData.planType) {
            that.planTypeDic.forEach(dic => {
              if (dic.value == that.formData.planType) {
                that.formData.planTypeDisplay = dic.label
              }
            })
          }
          that.oldFormData = that.formData
          that.formData = Object.assign({}, that.formData)
        })
        .catch(function (error) {
          console.error('error' + error)
        })
      this.$api['planGanttManager.getGanttExtendAttr']({ taskId: task.id }).then((res) => {
        if (res && res.taskExtendList) {
          this.extraIds = {}
          res.taskExtendList.forEach(async (item) => {
            if (item.fieldType == 'datepicker') {
              let date = moment(item.fieldValue)
              this.$set(this.formData, 'kz' + item.customItem1, date.isValid() ? moment(date).format('YYYY-MM-DD') : '')
            } else {
              if (item.fieldType == 'selectSingle' || item.fieldType == 'treeSingle' || item.fieldType == 'selectMultiple' || item.fieldType == 'treeMultiple') {
                let list = await that.$api['formGenerator.getSelectionDataDic']({ selectCode: item.selectCode })
                let taskList = item.fieldValue ? item.fieldValue.split(',') : []
                if (this.ganttName == 'analysisGantt') {
                  taskList = task['kz' + item.customItem1] ? task['kz' + item.customItem1].split(',') : []
                }
                let result = []
                list.forEach(el => {
                  taskList.forEach(item => {
                    if (el.value == item) {
                      result.push(el.label)
                    }
                  })
                })
                this.$set(this.formData, 'kz' + item.customItem1, result.join(','))
              } else {
                if (this.ganttName == 'analysisGantt') {
                  this.$set(this.formData, 'kz' + item.customItem1, task['kz' + item.customItem1])
                } else {
                  this.$set(this.formData, 'kz' + item.customItem1, item.fieldValue)
                }
              }
            }
          })
        }
      })
    },
    saved (res) { },
    customValidate (saveParams) { }
  }
}
</script>
