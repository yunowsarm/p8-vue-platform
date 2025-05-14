<template>
  <div style="position: relative;">
    <form-render ref="form"
                style="padding-top: 20px;"
                :dataViewId="formViewId"
                :record="{ desformCode: formCode }"
                :key="timeKey"
                :pageType="pageType"
                @save-success="(res) => formCloseRefresh(res)"></form-render>
    <div v-if="pageType == 'view' && !formViewId" class="single-mask" ></div>
  </div>
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
      pageType: '',
      timeKey: new Date().getTime(),
    }
  },
  components: {
    FormRender
  },
  created () {
    this.getInfo()
  },

  methods: {
    formCloseRefresh (res) {
      this.$api['taskManager.taskFormDataSave']({ actOrTaskFormId: this.item.name, formDataId: res }).then(res => {
        this.getInfo()
      })
    },
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
        await this.$api['taskManager.taskFormdataList']({ actOrTaskFormId: this.item.name, formId: this.item.formId }).then(res => {
          this.formCode = this.item.formCode
          this.formViewId = res[0] ? res[0].ID : ''
          this.timeKey = new Date().getTime()
        })
      }
    }
  },
}

</script>
<style lang='scss' scoped>
.single-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 999;
}
</style>