
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
  width: 49%;
  height: 100%;
  display: inline-block;
  vertical-align: top;
}
.left {
  border-right: 1px solid rgb(225, 225, 225);
}
</style>
