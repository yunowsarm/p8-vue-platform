<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
import { enterprisePolicyConfig as config } from './components/policyServiceConfigs'
export default { name: 'EnterprisePolicy', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
