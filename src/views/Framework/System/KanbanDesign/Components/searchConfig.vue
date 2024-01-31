<template>
  <common-drawer title="查询设置"
                 size="30%"
                 :visible="visible"
                 :show-handle-btn="true"
                 @close="onEditPlanLogoClose">
    <template #drawer>
      <form-list ref="form"
                 :dataSource="dataSource"
                 :form="formData"
                 :is-custom-validate="true"
                 @custom-validate="customValidate">
      </form-list>
    </template>
  </common-drawer>
</template>

<script>
import { P8Drawer as CommonDrawer, P8Form as FormList } from 'p8-components-ui'
export default {
  components: {
    CommonDrawer,
    FormList
  },
  props: ['visible', 'widgets', 'record'],
  data () {
    return {
      formData: {
        labelText: '',
        fieldName: '',
        mapfields: '',
        takeEffectCharts: []
      },
      dataSource: [
        {
          type: 'view',
          labelText: '查询文本',
          fieldName: 'labelText',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '查询目标字段',
          fieldName: 'fieldName',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '映射字段',
          fieldName: 'mapfields',
          placeholder: '请输入',
          colLayout: 'singleCol'
        },
        {
          type: 'multiple',
          labelText: '生效的图表',
          fieldName: 'takeEffectCharts',
          placeholder: '请选择',
          colLayout: 'singleCol',
          options: []
        },
      ]
    }
  },
  created () {
    if (this.widgets && this.widgets.length) {
      let options = []
      this.widgets.forEach(el => {
        options.push({ value: el.component.id, label: el.title })
      })
      let item = this.dataSource.filter(el => el.fieldName === 'takeEffectCharts')
      item[0].options = options
    }
    if (this.record) {
      if (this.record.replaceFiled) {
        this.formData.labelText = this.record.labelText
        this.formData.fieldName = this.record.fieldName
        this.formData.mapfields = this.record.replaceFiled.mapfields
        this.formData.takeEffectCharts = this.record.replaceFiled.takeEffectCharts
      } else {
        this.formData.labelText = this.record.labelText
        this.formData.fieldName = this.record.fieldName
      }
    }
  },
  mounted () {
  },
  methods: {
    onEditPlanLogoClose () {
      this.$emit('close')
    },
    customValidate (formData) {
      this.$emit('saveSuccess', {labelText:formData.labelText,fieldName:formData.fieldName,mapfields:formData.mapfields,takeEffectCharts:formData.takeEffectCharts,})
    }
  }
}
</script>
