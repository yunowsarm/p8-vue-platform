<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
import { policyMatchConfig as config } from './components/policyServiceConfigs'
export default { name: 'PolicyMatch', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
