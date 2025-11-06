<template>
  <div style="height: calc(100% - 30px);margin: 14px;">
    <div class="left">
      <P8FormDataEdit :record="{ desformCode: 'problemManagement' }"
                      :dataViewId="formId"
                      page-type="view" />
    </div>
    <div class="right">
      <P8FormDataEdit :record="{ desformCode: 'myIssue' }"
                      :dataViewId="formId"
                      :page-type="pageType"
                      @saveForm="saveForm"
                      @save-success="saveSuccess" />
    </div>
  </div>
</template>

<script>

export default {
  name: 'formView',
  props: ['formViewId', 'businessKey'],
  data () {
    return {
      formId: '',
      pageType: 'modify'
    }
  },

  components: {},

  created () {
    this.formId = this.formViewId ? this.formViewId : this.businessKey
    this.pageType = this.formViewId ? 'modify' : 'view'
  },

  methods: {
    async saveForm (formData, _this) {
      this.customSave = true
      await new Promise((resolve, reject) => {
        _this.$refs.modifyParser.submitForm()
        resolve()
      })
    },
    saveSuccess (res, params) {
      if (this.customSave) {
        this.$api['qualityIssues.submitValidattion']({
          id: res
        }).then(res => {
          this.$emit('saveSuccess')
          this.customSave = false
        })
      } else {
        this.$emit('saveSuccess')
      }
    }
  },

  watch: {}

}

</script>
<style lang='scss' scoped>
.left,
.right {
  width: 43%;
  height: 100%;
  display: inline-block;
  vertical-align: top;
}
.left {
  width: 55%;
  border-right: 1px solid rgb(225, 225, 225);
}
@media screen and (max-width: 1100px) {
  .bottom-flex{
    display: none;
  }
  .left, .right {
    width: 100%;
    height: auto;
  }
}
</style>
