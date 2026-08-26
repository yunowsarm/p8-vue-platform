<!-- ToB 会议室预定路由入口：只装配会议室预定独立业务组件。 -->
<template><meeting-room-booking-page /></template>
<script>
import MeetingRoomBookingPage from '@/features/supporting-services/meeting-room-booking/MeetingRoomBookingPage'
export default { name: 'MeetingRoomBooking', components: { MeetingRoomBookingPage } }
</script>
