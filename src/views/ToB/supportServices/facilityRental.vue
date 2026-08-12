<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from './components/SupportingServiceBoard'
export default { name: 'FacilityRental', components: { SupportingServiceBoard }, data() { return { config: { title: '设施设备租赁', itemName: '租赁', icon: 'el-icon-setting', idPrefix: 'FR', primaryKey: 'facilityType', primaryLabel: '设备类型', cardTitleKey: 'facilityType', timeKey: 'leaseStart', contentKey: 'leasePurpose', isReservation: true, fields: [{ key: 'companyId', label: '企业', required: true }, { key: 'facilityType', label: '设备类型', required: true, options: ['会议设备', '展示设备', '办公设备', '活动设施', '其他'] }, { key: 'leaseStart', label: '租赁开始日期', type: 'datetime', required: true }, { key: 'leaseEnd', label: '租赁结束日期', type: 'datetime', required: true }, { key: 'contactName', label: '联系人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'leasePurpose', label: '租赁用途', type: 'textarea', required: true }] } } } }
</script>
