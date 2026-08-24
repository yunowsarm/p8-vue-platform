<template>
  <main class="service-hall-manage">
    <section class="manage-surface">
      <el-tabs v-model="activeTab" class="service-tabs" stretch>
        <el-tab-pane v-for="item in tabs" :key="item.name" :name="item.name" :disabled="item.disabled">
          <span slot="label">
            <i :class="item.config.icon" aria-hidden="true"></i>
            {{ item.label }}
          </span>
        </el-tab-pane>
      </el-tabs>
      <service-application-board :key="activeItem.name" :config="activeItem.config" />
    </section>
  </main>
</template>

<script>
const managementOptions = {
  readOnly: false,
  allowCreate: false,
  allowEdit: false,
  allowDelete: true,
  allowStatusChange: true,
  showSummary: false
}

const createConfig = (config) => Object.assign({}, managementOptions, config)

export default {
  name: 'ServiceHallManage',
  components: {
    ServiceApplicationBoard: () => import('../ToB/serviceHall/components/ServiceApplicationBoard')
  },
  data() {
    return {
      activeTab: 'complaint-suggestion',
      tabs: [
        {
          name: 'complaint-suggestion',
          label: '建议投诉',
          config: createConfig({
            title: '建议投诉',
            itemName: '建议投诉',
            icon: 'el-icon-chat-dot-round',
            idPrefix: 'SC',
            apiNamespace: 'feedbackComplaint',
            primaryKey: 'type',
            primaryLabel: '类型',
            timeKey: 'submitTime',
            contentKey: 'content',
            contentLabel: '内容',
            defaultStatus: '待受理',
            statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
            fields: [
              { key: 'companyId', label: '企业', required: true },
              { key: 'contactName', label: '联系人', required: true },
              { key: 'contactPhone', label: '联系电话', required: true },
              { key: 'type', label: '类型', type: 'select', required: true, options: ['建议', '投诉'] },
              { key: 'submitTime', label: '提交时间', type: 'datetime', required: true },
              { key: 'content', label: '内容', type: 'textarea', required: true },
              { key: 'reply', label: '回复内容', type: 'textarea' }
            ]
          })
        },
        {
          name: 'service-request',
          label: '服务需求',
          config: createConfig({
            title: '服务需求',
            itemName: '服务需求',
            icon: 'el-icon-service',
            idPrefix: 'SR',
            apiNamespace: 'tobServiceRequest',
            primaryKey: 'requestType',
            primaryLabel: '需求类型',
            timeKey: 'requestTime',
            contentKey: 'requestContent',
            contentLabel: '需求内容',
            defaultStatus: '待受理',
            statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
            fields: [
              { key: 'companyId', label: '企业 ID', required: true },
              { key: 'requestType', label: '需求类型', required: true, options: ['政务服务咨询', '企业运营服务', '人才与招聘服务', '政策申报服务', '场地与设施服务', '其他服务'] },
              { key: 'requestTime', label: '提交时间', type: 'datetime', required: true },
              { key: 'contactName', label: '联系人', required: true },
              { key: 'contactPhone', label: '联系电话', required: true },
              { key: 'requestContent', label: '需求内容', type: 'textarea', required: true },
              { key: 'remark', label: '备注', type: 'textarea' }
            ]
          })
        },
        {
          name: 'data-report',
          label: '数据上报',
          config: createConfig({
            title: '数据上报',
            itemName: '数据上报',
            icon: 'el-icon-upload2',
            idPrefix: 'DR',
            apiNamespace: 'tobDataReport',
            listParams: { type: 0 },
            primaryKey: 'reportType',
            primaryLabel: '上传分类',
            timeKey: 'reportTime',
            contentKey: 'reportContent',
            contentLabel: '上报内容',
            defaultStatus: '待受理',
            statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
            fields: [
              { key: 'companyId', label: '企业 ID', required: true },
              { key: 'reportType', label: '上传分类', required: true, options: ['知识产权', '财务数据', '员工数据'] },
              { key: 'reportTime', label: '上报时间', type: 'datetime', required: true },
              { key: 'reportContent', label: '上报内容', type: 'textarea', required: true }
            ]
          })
        },
        {
          name: 'media-promotion',
          label: '媒体宣传',
          config: createConfig({
            title: '媒体宣传',
            itemName: '媒体宣传',
            icon: 'el-icon-picture-outline',
            idPrefix: 'MP',
            apiNamespace: 'tobMediaPromotion',
            primaryKey: 'promotionChannel',
            primaryLabel: '宣传渠道',
            timeKey: 'applyTime',
            contentKey: 'promotionContent',
            contentLabel: '宣传内容',
            defaultStatus: '待审核',
            statusOptions: ['待审核', '处理中', '已通过', '已拒绝', '已关闭'],
            fields: [
              { key: 'companyId', label: '企业 ID', required: true },
              { key: 'promotionChannel', label: '宣传渠道', required: true, options: ['园区公众号', '园区官网', '媒体专栏', '线下活动'] },
              { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
              { key: 'contactName', label: '联系人', required: true },
              { key: 'contactPhone', label: '联系电话', required: true },
              { key: 'promotionContent', label: '宣传内容', type: 'textarea', required: true }
            ]
          })
        },
        {
          name: 'qualification-recognition',
          label: '资质认定',
          config: createConfig({
            title: '资质认定',
            itemName: '资质认定',
            icon: 'el-icon-medal',
            idPrefix: 'QR',
            apiNamespace: 'tobQualificationCert',
            primaryKey: 'qualificationType',
            primaryLabel: '资质类型',
            timeKey: 'applyTime',
            contentKey: 'applyReason',
            contentLabel: '申请原因',
            defaultStatus: '待审核',
            statusOptions: ['待审核', '处理中', '已通过', '已拒绝', '已关闭'],
            fields: [
              { key: 'companyId', label: '企业 ID', required: true },
              { key: 'qualificationType', label: '资质类型', required: true, options: ['高新技术企业', '专精特新企业', '科技型中小企业', '创新型中小企业'] },
              { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
              { key: 'contactName', label: '联系人', required: true },
              { key: 'contactPhone', label: '联系电话', required: true },
              { key: 'applyReason', label: '申请原因', type: 'textarea', required: true }
            ]
          })
        },
        {
          name: 'resource-connection',
          label: '资源对接',
          config: createConfig({
            title: '资源对接',
            itemName: '资源对接',
            icon: 'el-icon-connection',
            idPrefix: 'RC',
            apiNamespace: 'tobResourceConnection',
            primaryKey: 'resourceType',
            primaryLabel: '资源类型',
            timeKey: 'applyTime',
            contentKey: 'connectContent',
            contentLabel: '对接内容',
            defaultStatus: '待受理',
            statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
            fields: [
              { key: 'companyId', label: '企业 ID', required: true },
              { key: 'resourceType', label: '资源类型', required: true, options: ['技术资源', '人才资源', '金融资源', '市场资源', '场地资源'] },
              { key: 'resourceDesc', label: '资源描述', type: 'textarea', required: true },
              { key: 'connectTarget', label: '对接目标', required: true },
              { key: 'connectContent', label: '对接内容', type: 'textarea', required: true },
              { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
              { key: 'contactName', label: '联系人', required: true },
              { key: 'contactPhone', label: '联系电话', required: true },
              { key: 'remark', label: '备注', type: 'textarea' }
            ]
          })
        }
      ]
    }
  },
  computed: {
    activeItem() {
      return this.tabs.find((item) => item.name === this.activeTab) || this.tabs[0]
    }
  }
}
</script>

<style scoped>
.service-hall-manage {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.manage-heading {
  padding: 20px 24px;
  border: 1px solid #e3edf8;
  border-radius: 10px;
  background: linear-gradient(120deg, #edf6ff, #f9fcff);
}
.manage-heading p {
  margin: 0 0 7px;
  color: #3387ee;
  font-size: 13px;
  font-weight: 600;
}
.manage-heading p i {
  margin-right: 6px;
}
.manage-heading h1 {
  margin: 0;
  color: #2f4b6b;
  font-size: 22px;
}
.manage-heading span {
  display: block;
  margin-top: 8px;
  color: #7288a1;
  font-size: 13px;
}
.manage-surface {
  min-height: 660px;
  margin-top: 12px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}
.service-tabs {
  padding: 0 20px;
  border-bottom: 1px solid #edf1f5;
}
.service-tabs ::v-deep .el-tabs__header {
  margin: 0;
}
.service-tabs ::v-deep .el-tabs__nav-wrap::after {
  display: none;
}
.service-tabs ::v-deep .el-tabs__item {
  height: 48px;
  line-height: 48px;
}
.service-tabs ::v-deep .el-tabs__item i {
  margin-right: 5px;
}
.service-tabs ::v-deep .el-tabs__content {
  display: none;
}
.manage-surface > .application-board {
  padding-top: 14px;
}
@media (max-width: 760px) {
  .service-hall-manage {
    padding: 8px;
  }
  .manage-heading {
    padding: 18px;
  }
  .service-tabs {
    padding: 0 12px;
    overflow-x: auto;
  }
  .service-tabs ::v-deep .el-tabs__nav {
    white-space: nowrap;
  }
}
</style>
