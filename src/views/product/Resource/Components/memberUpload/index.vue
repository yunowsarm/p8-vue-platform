<template>
  <div class="member-upload-con">
    <div class="title">
      人员任命文件
    </div>
    <div class="upload-box">
      <form-list v-if="!view"
                 ref="memberFrom"
                 labelWidth="0px"
                 :dataSource="dataSource"
                 :form="formData"
                 :existDefaultBtn="false"
                 :existCustomBtn="true"></form-list>
      <common-file-view :uploadFiles="files"
                        filesLayout="row"
                        v-else></common-file-view>
    </div>
  </div>
</template>
<script>
import { P8Form as FormList, P8FileView as CommonFileView } from 'p8-components-ui'

export default {
  name: 'ProjectFormView',
  props: {
    files: {
      type: Array,
      default: () => []
    },
    view: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    files: {
      handler (val) {
        this.formData.uploadFiles = val
      },
      immediate: true,
      deep: true
    }
  },
  data () {
    const dataSource = [
      {
        type: 'upload',
        labelText: '',
        fieldName: 'uploadFiles',
        colLayout: 'singleCol',
        defaultValue: [],
        listType: 'secret'
      }
    ]
    return {
      dataSource,
      formData: {
        uploadFiles: []
      }
    }
  },
  mounted () {
    if (!this.view) {
      this.$emit('getFormComp', this.$refs.memberFrom)
    }
  },
  methods: {

  },
  components: {
    FormList,
    CommonFileView
  }
}
</script>
<style lang="scss" scoped>
.member-upload-con {
  height: 50%;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
  .title {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    border-top: 8px solid #f6f7fb;
    border-bottom: 1px solid #f2f2f2;
    box-sizing: border-box;
    padding: 0 12px;
  }
  .upload-box {
    height: calc(100% - 50px);
    box-sizing: border-box;
    padding: 10px 8px;
  }
  &  ::v-deep  .formList.el-form > .el-row {
    padding: 0;
    &.existBtn:first-child {
      height: 100%;
    }
    &.formBtn {
      display: none;
    }
  }
}
</style>
