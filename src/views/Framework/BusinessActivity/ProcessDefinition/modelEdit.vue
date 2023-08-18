<template>
  <div>
    <el-dialog class="model_dialog" width="1500px" title="流程模板设计" :visible="visible" @close="handleCancel" :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="height: 750px">
        <iframe :flex="115" id="modelFrame" name="modelFrame" frameborder="0" :src="modelUrl" style="width: 100%; height: 100%" scrolling="no"></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped></style>

<script>
import { Dialog } from 'p8-components-ui'
export default {
  name: 'ModelEdit',
  components: {
    'el-dialog': Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    modelId: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      confirmLoading: false,
      modelUrl: `${process.env.BASE_URL}static/modeler.html?modelId=${this.modelId}`
    }
  },

  methods: {
    handleOk(e) {
      this.$emit('close-modal')
    },
    handleCancel(e) {
      this.$emit('close-modal')
    }
  }
}
</script>
<style lang="scss" scoped>
.model_dialog {
  top: -80px !important;
  .el-dialog {
    margin: 0 auto !important;
    .el-dialog__body {
      padding: 0 !important;
    }
  }
}
</style>
