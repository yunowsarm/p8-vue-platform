<template>
  <section v-if="visible" class="process-progress">
    <header>
      <span>查看流程图</span>
      <button type="button" aria-label="关闭" @click="close">×</button>
    </header>
    <div class="progress-body">
      <p8-process-approval :business-obj="businessObj" :process-obj="processObj" :is-smart-form="true" />
    </div>
  </section>
</template>

<script>
import { P8ProcessApproval } from 'p8-components-ui'

export default {
  name: 'ProcessDialogView',
  components: { P8ProcessApproval },
  props: {
    visible: { type: Boolean, default: true },
    businessId: { type: String, default: '' },
    processDefinitionKey: { type: String, default: '' },
    processDefinitionId: { type: String, default: '' },
    processInstanceId: { type: String, default: '' }
  },
  computed: {
    businessObj() {
      return { businessId: this.businessId, processDefinitionKey: this.processDefinitionKey }
    },
    processObj() {
      return { processDefinitionId: this.processDefinitionId, processInstanceId: this.processInstanceId }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.process-progress {
  height: 100%;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-sizing: border-box;
  > header {
    height: 49px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid #eee;
    color: #555;
    button {
      border: 0;
      background: none;
      color: #777;
      font-size: 25px;
      cursor: pointer;
    }
  }
  .progress-body {
    height: calc(100% - 50px);
    border: 16px solid #f8fafc;
    box-sizing: border-box;
    > * {
      height: 100%;
    }
  }
}
</style>
