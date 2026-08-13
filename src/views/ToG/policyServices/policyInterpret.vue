<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
import { policyInterpretConfig as config } from './components/policyServiceConfigs'
export default { name: 'PolicyInterpret', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
