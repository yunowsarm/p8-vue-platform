<template>
  <div style="height: 100%">
    <P8TableRender ref="tableRender"
                   v-show="isShow"
                   :pagination="false"
                   :refreshShow="false"
                   code="projectRelevanceContract">
      <template #CHECK_BOX="{scope}">
        <el-checkbox disabled
                     v-if="!scope.row.STATUS"
                     v-model="scope.row.checkboxValue" />
      </template>
    </P8TableRender>
    <div style="height: 100%;">
      <vxe-loading v-if="fullscreenLoading"
                   v-model="fullscreenLoading"></vxe-loading>
    </div>
  </div>
</template>

<script>
export default {
  name: 'paymentContract',
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      fullscreenLoading: true,
      isShow: false
    }
  },
  async mounted () {
    let that = this
    setTimeout(async () => {
      await this.$api['relevanceContract.selectAllCgtableProjectByProjectId']({
        projectId: this.row[0].WHOLE_ID
      }).then(res => {
        res.forEach(item => {
          if (item && item.ID) {

            that.$refs.tableRender?.$refs.xTable.tableData.forEach(el => {
              if (item.ID === el.ID) {
                el.checkboxValue = true
              }
            })
          }
        })
        that.isShow = true
        that.fullscreenLoading = false
      })
    }, 1000)
  },
  methods: {}
}
</script>

<style>
</style>