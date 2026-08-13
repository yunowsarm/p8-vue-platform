<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
import { policySubscribeConfig as config } from './components/policyServiceConfigs'
export default { name: 'PolicySubscribe', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
