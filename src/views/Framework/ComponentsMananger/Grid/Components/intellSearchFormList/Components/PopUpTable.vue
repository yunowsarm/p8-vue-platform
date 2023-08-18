<template>
  <common-dialog title="弹出选择" :visible="visible" v-if="visible" :dialog-config="dialogConfig" width="50%" :dialog-height="360" @handle-cancel="close" @handle-ok="fillBack" @close="close">
    <template #dialog>
      <custom-table v-if="visible" :code="code" :report-param="reportParam" :custom-height="350" :show-west-tree="false" :header-visible="false" @selection-change="selectChange"></custom-table>
    </template>
  </common-dialog>
</template>
<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  name: 'PopUpTable',
  components: {
    CommonDialog,
    CustomTable: () => import('@/views/Framework/ComponentsMananger/Grid/Components/tableRender')
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectCode: {
      type: String,
      default: ''
    },
    reportParam: {
      // 弹出报表参数
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogConfig: {
        modal: false
      },
      fillBackData: [], // 回填的数据
      code: '', // 报表编码
      selectionOption: {} // 报表回填label与value
    }
  },
  mounted() {
    this.$api['formGenerator.getSelectionDetail']({ code: this.selectCode }).then((res) => {
      if (res) {
        this.code = res.reportCode
        this.selectionOption = JSON.parse(res.selectionOption)
      } else {
        this.code = ''
        this.selectionOption = {}
      }
    })
  },
  methods: {
    // 弹出选择选择行记录事件
    selectChange(val) {
      this.fillBackData = val
    },
    close() {
      this.$emit('close')
    },
    fillBack() {
      let fillBackObj = {}
      if (this.fillBackData.length) {
        fillBackObj['label'] = this.fillBackData[0][this.selectionOption.labelCol]
        fillBackObj['value'] = this.fillBackData[0][this.selectionOption.valueCol]
      }
      this.$emit('fillBack', fillBackObj)
    }
  }
}
</script>
