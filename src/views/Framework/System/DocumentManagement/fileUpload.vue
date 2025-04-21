<template>
  <div class="member-upload-con">
    <div class="title">人员命名文件</div>
    <div class="upload-box">
      <common-upload :files="files" @upload="handleUpload" @remove="handleRemove"></common-upload>
    </div>
  </div>
</template>
<script>
import { P8Upload as CommonUpload } from 'p8-components-ui'
export default {
  name: 'DocumentUpload',
  props: {
    files: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  methods: {
    handleUpload(file) {
      this.$emit('upload', file)
    },
    handleRemove(file) {
      this.$emit('remove', file)
    }
  },
  components: {
    CommonUpload
  }
}
</script>
<style lang="scss" scoped>
.member-upload-con {
  height: 50%;
  box-sizing: border-box;
  overflow-y: auto;
  .title {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    border-top: 8px solid #efefef;
    border-bottom: 1px solid #f2f2f2;
    box-sizing: border-box;
    padding: 0 12px;
  }
  .upload-box {
    height: calc(100% - 50px);
    box-sizing: border-box;
    padding: 10px 8px;
  }
}
</style>
