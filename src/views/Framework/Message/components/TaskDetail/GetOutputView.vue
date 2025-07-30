<template>
  <!-- 外层 div 用于设置样式，包括相对定位和底部填充 -->
  <div style="position: relative; padding-bottom: 16px">
    <!-- form-list 组件用于展示表单，仅在数据非空时显示 -->
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
/* 自定义空状态样式，移除默认的 padding */
.custom_empty {
  padding: 0;
}
</style>

<script>
// 导入 P8Form 组件并重命名为 FormList
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'PlanOutputEdit',
  components: {
    FormList
  },
  props: {
    // 接收一个名为 taskId 的字符串属性
    taskId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 控制是否显示空状态
      isEmpty: false,
      // 表单的数据源配置
      dataSource: [
        {
          // labelText: '输出信息',
          // 控件类型为增删行
          type: 'addField',
          colLayout: 'singleCol',
          fieldName: 'outputRequests',
          addFieldLayout: 'vertical',
          isView: true,
          children: [
            // 隐藏字段 id
            {
              type: 'hidden',
              fieldName: 'id'
            },
            // 隐藏字段 activityInfoId
            {
              type: 'hidden',
              fieldName: 'activityInfoId'
            },
            // 可点击的链接类型字段，用于跳转到提交物名称的详细页面
            {
              type: 'view',
              labelText: '提交物名称',
              fieldName: 'aorName',
              colLayout: 'singleCol',
              callback: this.toLink
            },
            // 只读类型字段，展示输出类型
            {
              type: 'view',
              labelText: '输出类型',
              fieldName: 'aorOutputTypeDisp',
              colLayout: 'singleCol'
            },
            // 只读类型字段，展示补充说明
            {
              type: 'view',
              fieldName: 'aorDetail',
              labelText: '补充说明',
              colLayout: 'singleCol'
            },
            // 用于展示附件的上传查看控件
            {
              type: 'uploadView',
              labelText: '附件',
              fieldName: 'projectDesignFile',
              colLayout: 'singleCol'
            }
            // {
            //   type: 'link',
            //   labelText: 'SDM链接',
            //   fieldName: 'attFileLink',
            //   colLayout: 'singleCol',
            // callback: this.toLink

            // }
          ]
        }
      ],
      // 表单数据对象
      formData: {
        outputRequests: []
      },
    }
  },
  // 在组件创建时，根据 taskId 获取输出数据
  created() {
    this.getOutputData(this.taskId)
  },
  methods: {
    // 打开链接的方法，在新窗口中打开
    toLink(k) {
      window.open(k.attFileLink, '_blank')
    },
    // 根据 taskId 获取输出数据
    getOutputData(taskId) {
      this.otherParam = { taskId: taskId }
      this.$api['taskManager.getOutputIo']({ taskId: taskId })
        .then((res) => {
          // 根据返回的数据决定是否显示空状态
          if (Array.isArray(res) && res.length > 0) {
            this.isEmpty = false
            this.formData.outputRequests = res
            this.formData.attFileLink = res.attFileLink
          } else {
            this.isEmpty = true
          }
        })
        .catch(function (error) {
          // 错误处理
          console.error('error' + error)
        })
    }
  }
}
</script>
