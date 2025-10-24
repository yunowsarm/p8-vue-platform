<script>
export default {
  name: 'ApprovalWithdraw',
  provide () {
    return {
      disabled: true
    }
  },
  props: {
    selectedApproval: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      tabsHeight: document.documentElement.clientHeight - 80 + 'px',
      searchParams: {
        msgCatalog: 'APPROVE_TYPE_02_01',
        assigneeUserId: this.$store.state.user.userInfo.id
      },
      formComp: '',
      formCompProp: {},
      taskId: '',
      currEntityId: '',
      tableFlex: 315,
      componentsParams: null,
      asyncComponents: ''
    }
  },
  computed: {
    componentLoader () {
      const comp = this.formComp

      return () => import('@/views/' + comp)
    },
    componentUrl () {
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      }
    }
  },
  watch: {
    selectedApproval: {
      deep: true,
      immediate: true,
      handler: function (newV, oldV) {
        this.formComp = ''
        // this.businessKey = newV.businessKey
        this.taskId = newV.entityId
        this.loadFormKey()
      }
    }
  },
  created () {
    // this.loadFormKey()
  },
  methods: {
    loadFormKey () {
      const this_ = this
      console.log(this_.taskId)
      this.$api['PersonalProcessApproval.getApproveContentViewUrl']({ taskId: this.taskId }).then((res) => {
        if (res && res.length > 0) {
          const page = {}
          let inputProp = {}
          // this.currEntityId = this.selectedApproval.businessKey
          res.forEach((o) => {
            this.currEntityId = o.value.businessKey
            if (o.variableName === 'approveContentView') {
              page.url = o.value.url
              this_.formComp = o.value.url
              page.code = o.value.code
              inputProp = { ...inputProp, ...o.value }
            }
            inputProp[o.variableName] = o.value
          })

          this_.formCompProp = {
            ...inputProp,
            ...page,
            ...{
              taskId: this_.taskId,
              tableFlex: this.tableFlex,
              headerVisible: false,
              pageType: 'view'
            }
          }
          if (this_.formCompProp.approveContentView) {
            if (this_.formCompProp.approveContentView.codeForm) {
              this_.componentsParams = this_.formCompProp.approveContentView
            } else {
              this_.componentsParams = this_.formCompProp.approveContentView.formSelector ? JSON.parse(this_.formCompProp.approveContentView.formSelector) : null
            }
            if (this_.componentsParams) {
              this_.asyncComponents = ''
              this_.componentsParams.dataViewId = this_.formCompProp.customBusinessKey ? this_.formCompProp.customBusinessKey : this_.formCompProp.businessKey
              this_.asyncComponents = this_.componentsParams.url
            }
          }
        }
        this_.formValidate = true
      })
    }
  }
}
</script>

<template>
  <div class='Approval-withdraw'
       style="height: 100%; width: 100%">
    <component ref="approveContent"
               class="approveComponent"
               :style="{ height: tabsHeight }"
               :is="componentUrl"
               :searchParams="searchParams"
               v-if="componentsParams"
               :code="componentsParams.code"
               :data-view-id="componentsParams.dataViewId"
               :record="{ desformCode: componentsParams.codeForm }"
               :permission-vo="componentsParams.permissionVo"
               :layout-config="componentsParams"
               v-bind="formCompProp"
               :disabled="true"
               :kanban-config="componentsParams" />
    <component ref="approveContent"
               :style="{ height: tabsHeight }"
               :disabled="true"
               :searchParams="searchParams"
               :selected-approval="{
        businessKey: this.currEntityId,
        processTaskId: this.taskId
      }"
               :curr-entity-id="currEntityId"
               v-else-if="formComp != null && formComp != ''"
               :is="componentLoader"
               v-bind="formCompProp" />
  </div>
</template>

<style scoped lang="scss">
::v-deep .normal-layout {
  height: 100% !important;
}
</style>
