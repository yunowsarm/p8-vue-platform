<template>
  <div>
    <P8Form
      ref="form"
      label-width="120px"
      :data-source="dataSource"
      :exist-default-btn="false"
      :api="saveApi"
      :is-custom-validate="isCustomValidate"
      @custom-validate="customValidate"
      :form="formData"
    >
      <template #message>
        123
        <!-- <Tinymce v-model="formData.message" /> -->
      </template>
    </P8Form>
  </div>
</template>

<script>
import { P8Form } from 'p8-components-ui'
// import Tinymce from '@/components/Tinymce'
export default {
  name: 'NoticeMsg',
  components: { P8Form },
  data() {
    return {
      saveApi: '',
      isCustomValidate: true,
      formData: {},
      dataSource: [
        {
          type: 'select', // 控件类型
          labelText: '通知范围', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'doubleCol',
          options: [
            {
              label: '所有团队成员',
              value: '1'
            },
            {
              label: '所有任务责任人',
              value: '2'
            },
            {
              label: '已选择任务的责任人',
              value: '3'
            }
          ]
        },
        {
          type: 'select',
          labelText: '密级',
          fieldName: 'secretGrade',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'SECRET_LEVEL' }
          },
          options: []
        },
        {
          type: 'blank',
          labelText: '',
          fieldName: 'message',
          slotName: 'message',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  methods: {
    customValidate(params) {
      console.log('🚀 ~ file: index.vue:75 ~ customValidate ~ params:', params)
    }
  }
}
</script>

<style></style>
