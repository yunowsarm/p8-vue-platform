<template>
  <main class="lease-application-manage">
    <section class="manage-surface">
      <lease-application-board :config="config" />
    </section>
  </main>
</template>

<script>
export default {
  name: 'LeaseApplicationManage',
  components: {
    LeaseApplicationBoard: () => import('./components/LeaseApplicationBoard')
  },
  data() {
    return {
      config: {
        title: '租赁申请',
        itemName: '租赁申请',
        icon: 'el-icon-office-building',
        idPrefix: 'LA',
        apiNamespace: 'tobLeaseApplication',
        listParams: { type: 1 },
        primaryKey: 'applyType',
        primaryLabel: '申请类型',
        primaryOptions: [
          { label: '续租申请', value: 'renew' },
          { label: '退租申请', value: 'vacate' },
          { label: '扩租申请', value: 'expand' }
        ],
        valueLabelMaps: { applyType: { renew: '续租申请', vacate: '退租申请', expand: '扩租申请' } },
        timeKey: 'applyDate',
        contentKey: 'applyReason',
        contentLabel: '申请原因',
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        uploadLabel: '附件',
        cardTitleKey: 'applyType',
        hideCompany: true,
        detailFieldsResolver(record, fields) {
          const commonKeys = ['applyType', 'companyName', 'contractNo', 'currentLocation', 'contactPerson', 'contactPhone', 'applyDate']
          const typeKeys = {
            renew: ['currentExpireDate', 'renewalPeriodMonths', 'renewalStartDate'],
            vacate: ['plannedVacateDate', 'handoverPerson'],
            expand: ['currentArea', 'expansionArea', 'expectedStartDate', 'intendedLocation']
          }
          const visibleKeys = commonKeys.concat(typeKeys[record.applyType] || [])
          return fields.filter((field) => visibleKeys.includes(field.key))
        },
        showSummary: false,
        allowCreate: false,
        allowEdit: true,
        editableStatuses: ['待处理', '处理中'],
        loadDetailBeforeEdit: true,
        allowDelete: true,
        allowStatusChange: true,
        defaultStatus: '待处理',
        statusMap: { null: '待处理', 0: '待处理', 1: '已完成', 2: '已驳回', 3: '处理中' },
        statusValueMap: { 待处理: '0', 处理中: '3', 已完成: '1', 已驳回: '2' },
        listStatusValueMap: { 待处理: '0', 处理中: '3', 已完成: '1', 已驳回: '2' },
        pendingStatuses: ['待处理'],
        statusOptions: ['待处理', '处理中', '已完成', '已驳回'],
        statusTransitions: { 待处理: ['处理中'], 处理中: ['已完成', '已驳回'] },
        statusDialogTitle: '处理租赁申请',
        statusActionLabelResolver(record, status) {
          return status === '处理中' ? '完成处理' : '开始处理'
        },
        cardMetaFields: [
          { key: 'companyName', icon: 'el-icon-office-building' },
          { key: 'currentLocation', icon: 'el-icon-location-outline' },
          { key: 'contactPerson', icon: 'el-icon-user' }
        ],
        fields: [
          {
            key: 'applyType',
            label: '申请类型',
            required: true,
            options: [
              { label: '续租申请', value: 'renew' },
              { label: '退租申请', value: 'vacate' },
              { label: '扩租申请', value: 'expand' }
            ]
          },
          { key: 'companyName', label: '企业名称', required: true },
          { key: 'contractNo', label: '租赁合同编号', required: true },
          { key: 'currentLocation', label: '现租赁位置', required: true },
          { key: 'contactPerson', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'applyDate', label: '申请日期', type: 'datetime', required: true },
          { key: 'currentExpireDate', label: '当前到期日' },
          { key: 'renewalPeriodMonths', label: '续租期限（月）' },
          { key: 'renewalStartDate', label: '续租起始日' },
          { key: 'plannedVacateDate', label: '计划退租日' },
          { key: 'handoverPerson', label: '交接负责人' },
          { key: 'currentArea', label: '现租赁面积' },
          { key: 'expansionArea', label: '拟扩租面积' },
          { key: 'expectedStartDate', label: '期望启用日期' },
          { key: 'intendedLocation', label: '意向位置' },
          { key: 'applyReason', label: '申请原因', type: 'textarea', required: true },
          { key: 'remark', label: '补充说明', type: 'textarea' }
        ],
        records: [
          {
            id: 'LA20260824001',
            applyType: 'renew',
            companyName: '淳通智惠科技有限公司',
            contractNo: 'CTZH-2024-018',
            currentLocation: 'A 座 501 室',
            contactPerson: '张女士',
            contactPhone: '138****2468',
            applyDate: '2026-08-22 10:30',
            currentExpireDate: '2026-09-30',
            renewalPeriodMonths: 24,
            renewalStartDate: '2026-10-01',
            applyReason: '经营稳定，申请续租现有办公场地。',
            status: '0'
          },
          {
            id: 'LA20260818002',
            applyType: 'expand',
            companyName: '星河数据服务有限公司',
            contractNo: 'XH-2025-006',
            currentLocation: 'B 座 803 室',
            contactPerson: '李先生',
            contactPhone: '139****9812',
            applyDate: '2026-08-18 15:20',
            currentArea: 180,
            expansionArea: 90,
            expectedStartDate: '2026-10-15',
            intendedLocation: 'B 座相邻楼层',
            applyReason: '团队扩充，现有办公面积无法满足使用需求。',
            expansionPurposeReason: '团队扩充，现有办公面积无法满足使用需求。',
            status: '0'
          },
          {
            id: 'LA20260726003',
            applyType: 'vacate',
            companyName: '新域创意设计工作室',
            contractNo: 'XY-2025-021',
            currentLocation: 'C 座 306 室',
            contactPerson: '王女士',
            contactPhone: '137****5226',
            applyDate: '2026-07-26 09:40',
            plannedVacateDate: '2026-08-31',
            handoverPerson: '王女士',
            applyReason: '业务调整，申请按约定办理退租及场地交接。',
            vacateReason: '业务调整，申请按约定办理退租及场地交接。',
            status: '1',
            itemUpdateTime: '2026-08-02 14:20'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.lease-application-manage {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.manage-surface {
  min-height: 660px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}
.manage-surface > .application-board {
  padding-top: 14px;
}
@media (max-width: 760px) {
  .lease-application-manage {
    padding: 8px;
  }
}
</style>
