<template>
  <select-user v-if="visible"
               class="selectUser"
               :visible="visible"
               :dialogHeight="600"
               @close-dialog="closeModal"
               :selectType="'1'"></select-user>
</template>
<script>
// import { P8SelectUser as SelectUser } from 'p8-components-ui'

import SelectUser from './selectUser.vue'
export default {
  name: 'departmentSelector',
  props: {
  },
  data () {
    return {
      visible: true,
    }
  },
  components: {
    SelectUser
  },
  mounted () { },
  methods: {
    closeModal (selectedRows) {
      let select = selectedRows.map(el => {
        return { id: el.id, name: el.realName }
      })
      this.visible = false
      this.$emit('close', select)
    }
  }
}
</script>
<style lang='scss' scoped>
.selectUser {
  background: unset !important;
}
</style>