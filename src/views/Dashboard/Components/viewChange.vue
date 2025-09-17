<template>
  <common-dialog :title="title"
                 :visible="visible"
                 width="50%"
                 :dialog-height="dialogpreviewHeight"
                 @close="handleCancel"
                 :show-handle-btn="false">
    <template #dialog>

    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  name: 'AddTabs',
  components: {
    CommonDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialogpreviewHeight: document.documentElement.clientHeight * 0.7,
    }
  },
  created () {
  },
  methods: {
    handleCancel () {
      this.$emit('handleCancel')
    },
    handleSubmit (e) {
    }
  }
}
</script>
