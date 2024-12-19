<template>
  <!-- 外部容器，设置相对定位和底部填充 -->
  <div style="position: relative; padding-bottom: 25px">
    <!-- 动态渲染表单列表组件，当数据非空时显示 -->
    <form-list
      ref="form"
      v-if="!isEmpty"
      form-layout="vertical"
      :data-source="dataSource"
      :form="formData"
      :exist-default-btn="false"
    >
    </form-list>
    <!-- 当数据为空时，显示空状态提示 -->
    <el-empty v-if="isEmpty" class="custom_empty" :image-size="100"></el-empty>
  </div>
</template>
<style scoped>
/* 自定义空状态样式，移除默认的内边距 */
.custom_empty {
  padding: 0;
}
</style>
<script>
// 导入表单组件
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'OutputView',
  components: {
    FormList
  },
  props: {
    // 任务ID，作为获取输出数据的参数
    taskId: {
      type: String,
      default: null
    },
  },
  data () {
    return {
      // 是否存在默认按钮，此处未使用
      existDefaultBtn: false,
      // 数据是否为空，用于控制显示空状态
      isEmpty: false,
      // 表单数据源配置
      dataSource: [
        {
          // labelText: '输出信息',
          // 控件类型--增删行
          type: 'addField',
          colLayout: 'singleCol',
          fieldName: 'outputRequests',
          addFieldLayout: 'vertical',
          isView: true,
          children: [
            // 隐藏字段：ID
            {
              type: 'hidden',
              fieldName: 'id'
            },
            // 隐藏字段：活动信息ID
            {
              type: 'hidden',
              fieldName: 'activityInfoId'
            },
            // 输出要求字段配置
            {
              type: 'view',
              labelText: '输出要求',
              fieldName: 'describes',
              placeholder: '请输入输出要求',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              }
            },
            // 输出类型字段配置
            {
              type: 'view',
              labelText: '输出类型',
              fieldName: 'outPutTypeDisplay',
              placeholder: '请输入输出类型',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              }
            },
            // 上传附件字段配置
            {
              type: 'uploadView',
              labelText: '上传附件',
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              filesLayout: 'row',
              uploadConfig: {
                // drag: true
              },
              listType: 'text'
            }
          ]
        }
      ],
      // 表单数据对象
      formData: {
        outputRequests: [],
      },
    }
  },
  // 组件创建时，根据任务ID获取输出数据
  created () {
    this.getOutputData(this.taskId)
  },
  methods: {
    // 根据任务ID获取输出数据的方法
    getOutputData(taskId) {
      this.otherParam = { taskId: taskId }
      this.$api['planGanttManager.outputInfo']({ taskId: taskId })
        .then((res) => {
          // 根据返回的数据判断是否为空，并更新表单数据
          if (Array.isArray(res) && res.length > 0) {
            this.isEmpty = false
            this.formData.outputRequests = res
          } else {
            this.isEmpty = true
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
  }
}
</script>
