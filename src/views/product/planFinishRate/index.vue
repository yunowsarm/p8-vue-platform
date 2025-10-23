<script>
export default {
  name: 'index',
  props: {
    reportParam: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      params: {},
      dynamicColumns: [],
      code: ''
    }
  },
  async created() {
    this.params = {
      columnType: this.reportParam.property,
      ENDDATEARR: this.reportParam.ENDDATEARR.value,
      STATUSTYPE: this.reportParam.STATUSTYPE
    }
    if(this.reportParam.DEPTID){
      this.params.DEPTID = {
        mode: '=',
        relation: 'and',
        value: this.reportParam.DEPTID
      }
    }
    if(this.reportParam.WHOLEID){
      this.params.WHOLEID = {
        mode: '=',
        relation: 'and',
        value: this.reportParam.WHOLEID
      }
    }
    if(this.reportParam.MODELID){
      this.params.MODELID = {
        mode: '=',
        relation: 'and',
        value: this.reportParam.MODELID
      }
    }
    const extendColumn = await this.$api['taskManager.getTaskExtendColumnData']()
    this.dynamicColumns = extendColumn.map((item) => {
      return {
        align: 'center',
        dataIndex: item.id,
        headerAlign: 'center',
        title: item.name,
        minWidth: 140,
        isDynamic:true
      }
    })
    this.code = 'planFinishRate/planFinishDataTable'
  }
}
</script>

<template>
  <P8TableRender
    ref="tableRender"
    :dynamic-columns="dynamicColumns"
    :code="code"
    :reportParam="params"
  />
</template>

<style scoped lang="scss"></style>
