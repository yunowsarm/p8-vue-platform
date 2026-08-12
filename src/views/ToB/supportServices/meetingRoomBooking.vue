<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from './components/SupportingServiceBoard'
export default { name: 'MeetingRoomBooking', components: { SupportingServiceBoard }, data() { return { config: { title: '会议室预定', itemName: '预定', icon: 'el-icon-date', idPrefix: 'MR', primaryKey: 'roomId', primaryLabel: '会议室', cardTitleKey: 'roomId', timeKey: 'startTime', contentKey: 'purpose', isReservation: true, fields: [{ key: 'companyId', label: '预定企业', required: true }, { key: 'roomId', label: '会议室ID', required: true }, { key: 'startTime', label: '开始时间', type: 'datetime', required: true }, { key: 'endTime', label: '结束时间', type: 'datetime', required: true }, { key: 'contactName', label: '联系人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'purpose', label: '预定用途', type: 'textarea', required: true }] } } } }
</script>
