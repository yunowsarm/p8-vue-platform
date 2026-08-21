<template>
  <service-application-board :config="boardConfig" />
</template>

<script>
import ServiceApplicationBoard from '../../serviceHall/components/ServiceApplicationBoard'

export default {
  name: 'PublicServiceBoard',
  components: { ServiceApplicationBoard },
  props: { config: { type: Object, required: true } },
  computed: {
    boardConfig() {
      const isConsultation = this.config.isConsultation
      const hasStatus = this.config.hasStatus !== false
      return Object.assign({}, this.config, {
        showSummaryNote: false,
        summaryColumns: hasStatus ? this.config.summaryColumns : 2,
        cardTitleKey: this.config.cardTitleKey || 'title',
        defaultStatus: hasStatus ? this.config.defaultStatus || (isConsultation ? '待受理' : '已发布') : undefined,
        statusOptions: hasStatus ? this.config.statusOptions || (isConsultation ? ['待受理', '处理中', '已回复', '已关闭'] : ['草稿', '待审核', '已发布', '已下线']) : [],
        summaryDefinitions: this.config.summaryDefinitions || (!hasStatus
          ? [
              { title: `全部${this.config.itemName || this.config.title}`, all: true, icon: 'el-icon-document', color: 'blue' },
              { title: '本页展示', page: true, icon: 'el-icon-collection', color: 'green' }
            ]
          : isConsultation
          ? [
              { title: '全部咨询', all: true, icon: 'el-icon-document', color: 'blue' },
              { title: '待受理', statuses: ['待受理'], icon: 'el-icon-time', color: 'orange' },
              { title: '处理中', statuses: ['处理中'], icon: 'el-icon-s-operation', color: 'cyan' },
              { title: '已回复', statuses: ['已回复', '已关闭'], icon: 'el-icon-circle-check', color: 'green' }
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
