<template>
  <form-render :data-view-id="dataViewId"
               :record="{ desformCode: codeForm }"
               :prop-param="propParam"
               v-bind="$attrs"
               pageType="view"></form-render>
</template>

<script>
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
export default {
  components: {
    FormRender
  },
  props: {
    row: {
      type: Array
    },
    reportParam: {
      type: Object
    }
  },
  data () {
    return {
      codeForm: '', // 新建/修改表单code
      dataViewId: '', // 修改页面id
      propParam: {} // 将参数传至表单
    }
  },
  mounted () {
    // 回显
    if (this.row && this.row.length > 0) {
      this.codeForm = this.row[0].DEMAND_CODE
      this.dataViewId = this.row[0].ID
    } else {
      this.codeForm = this.reportParam.DEMAND_CODE
      this.dataViewId = this.reportParam.ID
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 100%;
  position: relative;
}
.btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
.content {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
}
.content-box {
  width: 25%;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.active {
  border: 1px solid #1bbf9e;
  -webkit-box-shadow: #666 0px 0px 10px;
  -moz-box-shadow: #666 0px 0px 10px;
  box-shadow: #666 0px 0px 10px;
  position: relative;
  padding: 10px 25px;
}
.active:after {
  content: ' ';
  border-width: 15px;
  border-style: solid;
  border-top-color: #1bbf9e;
  border-right-color: #1bbf9e;
  border-left-color: transparent;
  border-bottom-color: transparent;
  position: absolute;
  top: 0px;
  right: 0px;
  border-top-right-radius: 8px;
}
</style>
