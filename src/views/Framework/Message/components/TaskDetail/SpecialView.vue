<template>
  <!-- 外层 div 用于包裹表单并设置样式 -->
  <div style="position: relative; padding-bottom: 50px">
    <!-- form-list 组件用于渲染表单，ref 用于获取表单实例，其他属性用于配置表单 -->
    <form-list v-if='formData.specialRequests.length' ref="form"
               form-layout="vertical"
               :data-source="dataSource"
               :form="formData"
               :exist-default-btn="false">
    </form-list>
    <el-empty v-else class="custom_empty" :image-size="100"></el-empty>
  </div>
</template>

<style scoped></style>

<script>
// 导入 P8Form 组件并映射为 FormList
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'SpecialView',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      dataSource: [
        {
          // 定义表单配置项
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'specialRequests', // 保存时格式，类似detailList[0].roleName
          addFieldLayout: 'vertical',
          isView: true,
          children: [
            // 子表单项配置
            {
              type: 'hidden',
              fieldName: 'id'
            },
            {
              type: 'hidden',
              fieldName: 'activityInfoId'
            },
            {
              // 特别说明文本域配置
              type: 'view', // 控件类型
              fieldName: 'describes',
              colLayout: 'singleCol',
              placeholder: '特别说明', // 默认控件的空值文本
              fieldConfig: {
                rows: '6'
              }
            },
            {
              // 上传附件控件配置
              type: 'uploadView', // 控件类型
              labelText: '上传附件', // 控件显示的文本
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              filesLayout: 'row',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              },
              listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      formData: {
        specialRequests: [],
      },
    }
  },
  created () {
    this.rendered()
  },
  methods: {
    // 初始化数据，如果传入了 taskId，则调用 getSpecialData 方法获取数据
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getSpecialData(this.taskId)
      }
    },
    // 根据 taskId 获取特别说明数据
    getSpecialData(taskId) {
      this.otherParam = { taskId: taskId }
      // 调用 API 获取特别说明数据，并处理响应
      this.$api['planGanttManager.specialInfo']({ taskId: taskId })
        .then((res) => {
          if (res) {
            this.formData.specialRequests = res
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
  }
}
</script>
