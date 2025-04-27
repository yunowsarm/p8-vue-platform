<template>
  <form-render ref="form"
               style="padding-top: 20px;"
               :dataViewId="formViewId"
               :record="{ desformCode: formCode }"
               :pageType="pageType"
               @save-success="(res) => formCloseRefresh(res)"></form-render>
</template>

<script>
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
export default {
  name: 'formRender1',
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

  data () {
    return {
      formViewId: '',
      formCode: '',
      pageType: ''
    }
  },
  components: {
    FormRender
  },
  async created () {
    if (this.item.name) {
      if (this.approveType) {
        this.pageType = 'edit'
      } else {
        this.pageType = 'view'
      }
      await this.$api['taskManager.taskFormdataList']({ actOrTaskFormId: this.item.name, formId: this.item.formId }).then(res => {
        this.formViewId = res[0] ? res[0].ID : ''
        this.formCode = this.item.formCode
      })
    }
  },

  methods: {
    formCloseRefresh (res) {
      this.$api['taskManager.taskFormDataSave']({ actOrTaskFormId: this.item.name, formDataId: res }).then(res => {

      })
    },
    checkBusinessForm () {
      if (this.formViewId) {
        return true
      }
      return false
    }
  },
}

</script>
<style lang='scss' scoped>
</style>