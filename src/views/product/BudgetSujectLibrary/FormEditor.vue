<script>
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import FormulaEditor from '@/components/FormulaEditor/index.vue'

export default {
  name: 'edit',
  components: {
    FormulaEditor,
    FormRender,
    CommonDialog
  },
  props: {
    row: {
      type: Array
    }
  },
  created() {
    // console.log(this)
  },
  provide() {
    return {
      vueThis: this
    }
  },
  data() {
    return {
      ...this.$attrs,
      elements:[],
      visible: false,
      formula:'',
      formulaLabel:'',
      dialogConfig: {
        modal: true,
        'append-to-body': true
        // 'modal-append-to-body': false
      },
      formConf: { closeForm: false },
      codeForm: 'createBudgetSubject', // 新建/修改表单code
      dataViewId: '', // 修改页面id
      propParam: {} // 将参数传至表单
    }
  },
  mounted() {
    this.type = this.customParams.title
    // console.log(this.row)
    // 修改回显
    if (this.row && this.row.length > 0 && this.type === '修改') {
      this.dataViewId = this.row[0].ID
    }
    this.getFormulaParams()
  },
  beforeDestroy() {
    if (!this.formConf.closeForm) {
      localStorage.removeItem(`p8_form_${this.$store.getters.userId}_${this.codeForm}_${this.dataViewId || ''}`)
    }
  },
  methods: {
    getFormulaLabel(formulaLabel){
      this.formulaLabel = formulaLabel
    },
    getFormulaParams() {
      const params = {
        sqlId: '08c487eaa0af973f848ead80dc93c8c0',
        reportParam: {},
        sqlParam: {},
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      }

      this.$api['kanbanComponent.getViewData'](params).then((res) => {
        if (res) {
          this.elements = res.map(item => {
            return {
              label:item.LABEL,
              value:item.VALUE,
              tip: this.getLabelPath(res,item.VALUE)
            }
          })
        }
      })
    },
    getLabelPath(list,value){
      const map = {}
      list.forEach(item => {
        map[item.VALUE] = item
      })
      const pathLabels = []
      let current = map[value]
      while (current){
        pathLabels.unshift(current.LABEL)
        current = map[current.PID]
      }
      return pathLabels.join('-')
    },
    // 表单新建/修改关闭抽屉
    formClose(res, formData) {
      console.log(res,'res')
      console.log(formData,'formData')
      const data = formData.primary.table
      const params = {
        id: res,
        type: data.TYPE
      }
      this.$api['budgetSubjectLibrary.updateChildren'](params)

      this.$emit('close')
    },
    handleCancel() {
      this.visible = false
    },
    handleOk() {
      console.log(this.formula)
      console.log(this.formulaLabel)
      if(!this.$refs.formula.validate()) return
      console.log(this.$refs)
      const formExample = this.$refs.form.$children[0].$refs[this.type === '新建' ? 'parser' : 'modifyParser']
      console.log(formExample)
      const formulaEle = formExample.getELERef('FORMULA')
      formulaEle.setValue(this.formula)
      const formulaViewEle = formExample.getELERef('FORMULAVIEW')
      formulaViewEle.setValue(this.formulaLabel)
      this.visible = false
    }
  }
}
</script>

<template>
  <div style="height: 100%">
    <form-render ref="form" :data-view-id="dataViewId" :record="{ desformCode: codeForm }" :prop-param="propParam" v-bind="$attrs" @close="$emit('close')" @save-success="formClose"></form-render>
    <common-dialog title="设置计算公式" :visible="visible" @handle-cancel="handleCancel" @handle-ok="handleOk" width="65%" @close="handleCancel" :dialogHeight="600">
      <template #dialog>
        <formula-editor ref='formula' v-model='formula' :elements='elements' @getFormulaLabel='getFormulaLabel'></formula-editor>
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss"></style>
