<template>
  <service-application-board :config="boardConfig" />
</template>

<script>
import ServiceApplicationBoard from '../../serviceHall/components/ServiceApplicationBoard'

export default {
  name: 'SupportingServiceBoard',
  components: { ServiceApplicationBoard },
  props: { config: { type: Object, required: true } },
  computed: {
    boardConfig() {
      const reservation = this.config.isReservation
      return Object.assign({}, this.config, {
        showSummaryNote: false,
        cardTitleKey: this.config.cardTitleKey || 'title',
        defaultStatus: this.config.defaultStatus || (reservation ? '待审核' : '已发布'),
        statusOptions: this.config.statusOptions || (reservation ? ['待审核', '已通过', '已拒绝', '已取消'] : ['草稿', '待审核', '已发布', '已下线']),
        summaryDefinitions: this.config.summaryDefinitions || (reservation
          ? [
              { title: `全部${this.config.itemName || this.config.title}`, all: true, icon: 'el-icon-document', color: 'blue' },
              { title: '待审核', statuses: ['待审核'], icon: 'el-icon-time', color: 'orange' },
              { title: '已通过', statuses: ['已通过'], icon: 'el-icon-circle-check', color: 'cyan' },
              { title: '已拒绝', statuses: ['已拒绝'], icon: 'el-icon-circle-close', color: 'green' }
            ]
          : [
              { title: `全部${this.config.itemName || this.config.title}`, all: true, icon: 'el-icon-document', color: 'blue' },
              { title: '草稿', statuses: ['草稿'], icon: 'el-icon-edit-outline', color: 'orange' },
              { title: '待审核', statuses: ['待审核'], icon: 'el-icon-time', color: 'cyan' },
              { title: '已发布', statuses: ['已发布'], icon: 'el-icon-circle-check', color: 'green' }
            ])
      })
    }
  }
}
</script>
