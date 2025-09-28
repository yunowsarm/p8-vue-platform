<script>
import formView from '@/views/product/problemManagement/formView.vue'
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
export default {
  name: 'MineQuestion',
  components: { formView,CommonDrawer },
  data(){
    return {
      visibleProcessDrawer: false,
      formViewId: ''
    }
  },
  methods: {
    handle (row) {
      this.formViewId = row[0].ID
      this.visibleProcessDrawer = true
    },
    closeMyApproval () {
      this.visibleProcessDrawer = false
    },
    saveSuccess () {
      this.closeMyApproval()
      this.$refs.tableRender.formCloseRefresh()
    }
  }
}
</script>

<template>
  <div style='height: 100%'>
    <P8TableRender
      ref="tableRender"
      code="problemManagement"
      specialRoteName="My_ProblemList"
      :reportParam="{
        showView: {
          mode: '=',
          relation: 'and',
          value: 'showView002'
        }
      }"
      @handle="handle"
    ></P8TableRender>
    <common-drawer v-if="visibleProcessDrawer" :visible="visibleProcessDrawer" title="处理" @close="closeMyApproval" direction="ttb" size="100%">
      <template #drawer>
        <formView :formViewId="formViewId" @saveSuccess="saveSuccess" />
      </template>
    </common-drawer>
  </div>
</template>

<style scoped lang="scss"></style>
