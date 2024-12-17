<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="预先设置审批人"
                 :visible="isView"
                 :show-handle-btn="false"
                 :dialog-config="dialogConfig"
                 @handle-cancel="handleCancel"
                 @close="handleCancel"
                 @handle-ok="handleOk"
                 width="700px"
                 :dialog-height="dialogHeight">
    <template #dialog>
      <form-list ref="form"
                 label-width="150px"
                 :data-source="selectUserBeforehandDataSourceCur"
                 :api="saveApi"
                 :form="selectUserBeforehandFormDataCur"
                 :is-custom-validate="isCustomValidate"
                 @saved="saved"
                 @custom-validate="customValidate"
                 @form-data-change="formDataChange">
          <template v-for="(item,index) in selectUserBeforehandDataSourceCur">
            <template v-if="item.type === 'blank'" :slot="item.slotName">
              <div :key="item.fieldName">
                <el-input v-model="selectUserBeforehandFormDataCur[item.fieldName + '_Display']" readonly class="clickIcon">
                  <template slot="append"><i class="el-icon-paperclip" style="cursor: pointer;" @click="openComponent(item)"></i></template>
                </el-input>
              </div>
              <component :is="componentLoader" v-bind="parmars" class="main" :key="index" @close="close"></component>
            </template>
          </template>
      </form-list>
    </template>
  </common-dialog>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'SelectApproveUserBeforehand',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    selectUserBeforehandFormData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isSelectApproveUserBeforehandView: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    selectUserBeforehandDataSource: {
      type: Array,
      default: () => {
        return []
      }
    },
    selsctRow: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      saveApi: 'PersonalProcessApproval.setApproveUser',
      isCustomValidate: true,
      fullParams: {},
      selectUserBeforehandFormDataCur: {},
      selectUserBeforehandDataSourceCur: [],
      dialogHeight: 150,
      dialogConfig: {
        beforeClose: this.handleCancel,
        destroyOnClose: 'true',
        modal: false
      },
      isView: false,
      props: {},
      formComp: '',
      fieldName: '',
      parmars: { isMultiple: false, selsctRow: this.selsctRow }
    }
  },
  created (){
    this.$api['ProcessDefinition.getProcessSelect']({}).then(res => {
      this.componentUrls = res
    })
  },
  mounted () {
    // console.log(this.selectUserBeforehandDataSourceCur, this.selectUserBeforehandFormDataCur, 'selectUserBeforehandFormDataCurselectUserBeforehandFormDataCur')
    this.selectUserBeforehandFormDataCur = Object.assign({}, this.selectUserBeforehandFormData)
    this.selectUserBeforehandDataSourceCur = [].concat(this.selectUserBeforehandDataSource)
    this.dialogHeight = this.dialogHeight + this.selectUserBeforehandDataSource.length * 60
    this.isView = this.isSelectApproveUserBeforehandView

  },
  computed: {
    componentLoader () {
      if (this.formComp) {
        const comp = this.formComp
        return () => import('@/views/' + comp + '.vue')
      }
    },
  },
  methods: {
    openComponent (item) {
      this.fieldName = item.fieldName
      if (item.fieldConfig && item.fieldConfig.multiple) {
        this.parmars.isMultiple = item.fieldConfig.multiple
      }
      this.componentUrls.forEach(el => {
        if(el.value == item.url){
          this.formComp = el.url
        }
      })
    },
    saved (res) {
      this.isView = false
      this.$emit('saveSuccess')
      this.$emit('close-modal')
    },
    formDataChange (formSub) { },
    customValidate (saveParams) {
      if (Object.keys(saveParams).length) {
        Object.keys(saveParams).forEach(el => {
          if (el.includes('_Display')) {
            delete saveParams[el]
          }
        })
      }

      this.isView = false
      this.$emit('commit', saveParams)
      this.$emit('saveSuccess')
      this.$emit('close-modal')
    },
    handleOk (e) {
      this.isView = false
      this.$emit('close-modal')
    },
    handleCancel (e) {
      this.isView = false
      this.$emit('close-modal')
    },
    close (selectedRows) {
      this.formComp = ''
      if(selectedRows && selectedRows.length) {
        if (this.parmars && this.parmars.isMultiple) {
          // this.selectUserBeforehandFormDataCur[this.fieldName] = selectedRows.filter(el => el.id)
          this.$set(this.selectUserBeforehandFormDataCur, this.fieldName, selectedRows.filter(el => el.id))
          this.selectUserBeforehandFormDataCur[this.fieldName + '_Display'] = selectedRows.filter(el => el.name)
        } else {
          // this.selectUserBeforehandFormDataCur[this.fieldName] = selectedRows[0].id
          this.$set(this.selectUserBeforehandFormDataCur, this.fieldName, selectedRows[0].id)
          this.selectUserBeforehandFormDataCur[this.fieldName + '_Display'] = selectedRows[0].name
        }
        // this.selectUserBeforehandFormDataCur = Object.assign({}, this.selectUserBeforehandFormDataCur)

      }
    }
  }
}
</script>

<style scoped lang="scss">
.clickIcon ::v-deep .el-input-group__append {
  padding: 0;
  width: 40px;
  text-align: center;
}
</style>
