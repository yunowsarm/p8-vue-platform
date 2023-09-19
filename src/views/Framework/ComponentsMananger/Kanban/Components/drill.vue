<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog :visible="dialogVisible"
                 @close="dialogClose"
                 :showHandleBtn="false"
                 :width="dialogWidth"
                 :dialogHeight="dialogHeight">
    <template #dialog>
      <tableRender :showWestTree="false"
                   v-if="eventConfig && eventConfig.componentType == 'table'"
                   :code="eventConfig.componentCode"></tableRender>
    </template>
  </common-dialog>
</template>

<script>
import tableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender'
import { P8Dialog as CommonDialog } from 'p8-components-ui'

export default {
  name: 'drill.vue',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogWidth: {
      type: String,
      default: '80%'
    },
    eventConfig: {
      type: Object,
      default: () => {
        return {}
      },
      required: true
    },
    eventParam: {
      type: Object
    }
  },
  provide () {
    return {
      provideParams: {
        searchParams: this.drillParam
      }
    }
  },
  computed: {
    drillParam () {
      return this.eventParam
    },
    dialogHeight () {
      return document.body.clientHeight * 0.8
    }
  },
  data () {
    return {}
  },
  methods: {
    dialogClose () {
      this.$emit('close')
    }
  },
  components: {
    CommonDialog,
    tableRender
  }
}
</script>

<style scoped>
</style>
