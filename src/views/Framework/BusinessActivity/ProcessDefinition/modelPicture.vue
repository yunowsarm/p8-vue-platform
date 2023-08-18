<template>
  <div style="width: 1200px">
    <el-card :body-style="{ padding: '0px' }">
      <div style="padding: 14px">
        <span>{{ modelName }} 流程Id： {{ modelId }}</span>
      </div>
      <img :src="imagePath" class="image" />
    </el-card>
  </div>
</template>

<style scoped></style>
<script>
import { Card } from 'p8-components-ui'
export default {
  name: 'ModelDrawer',
  components: {
    'el-card': Card
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    modelId: {
      type: String,
      default: ''
    },
    modelName: {
      type: String,
      default: ''
    },
    imagePath: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {}
  },
  mounted() {},
  methods: {
    onClosed() {
      this.$emit('close')
    }
  }
}
</script>
