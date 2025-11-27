<template>
  <P8TableRender ref="tableRender"
                 :pagination="false"
                 code="projectPaymentContract">
    <template #CHECK_BOX="{scope}">
      <el-checkbox disabled
                   v-if="!scope.row.STATUS"
                   v-model="checkboxValue" />
    </template>
  </P8TableRender>
</template>

<script>
export default {
  name: 'paymentContract',
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      checkboxValue: true
    }
  },
  mounted () { },
  methods: {}
}
</script>

<style>
</style>