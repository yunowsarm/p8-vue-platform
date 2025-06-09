<script>
export default {
  name: 'iframeForm' ,
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    approveType: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      formViewId:''
    }
  },
  computed:{
    token() {
      return this.$store.getters.token
    },
    iframeSrc() {
      let iframeSrc
      if(this.formViewId){
        if(this.pageType === 'edit'){
          iframeSrc = `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}/edit/${this.formViewId}?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.pageType}`
        }else if(this.pageType === 'view'){
          iframeSrc = `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}/detail/${this.formViewId}?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.pageType}`
        }
      }else{
        if(this.pageType === 'edit'){
          iframeSrc = `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.pageType}`
        }else if(this.pageType === 'view'){
          iframeSrc =  `${this.$sysConfig.API_DEFAULT_CONFIG.jmreportUrl}/view/${this.item.formId}/detail?token=${this.token}&actOrTaskFormId=${this.item.name}&func=${this.$route.meta.title}&viewType=${this.pageType}`
        }
      }
      console.log(iframeSrc)
      return iframeSrc
    },
  },
  created () {
    this.getInfo()
  },
  methods:{
    checkBusinessForm () {
      if (this.formViewId) {
        return true
      }
      return false
    },
    async getInfo() {
      if (this.item.name) {
        if (this.approveType) {
          this.pageType = 'edit'
        } else {
          this.pageType = 'view'
        }
        await this.$api['taskManager.taskTemplateList']({ actOrTaskFormId: this.item.name, formId: this.item.formId }).then(res => {
          this.formViewId = res.dataId || ''
        })
      }
    }
  }
}
</script>

<template>
  <div style="height: 100%;position: relative;">
    <iframe ref="iframeForm"
            :src="iframeSrc"
            style="margin-top: 36px; height: 100%;width: 100%;border: none"></iframe>
  </div>
</template>

<style scoped lang="scss">

</style>
