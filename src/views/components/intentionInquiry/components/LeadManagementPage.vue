<!-- 线索管理业务组件：独立维护分配、跟进及历史记录，避免侵入公共在线咨询组件。 -->
<template>
  <main class="record-feature-page" :class="{ 'record-feature-page--compact': compact, 'record-feature-page--read-only': readOnly || !showCreate }">
    <header v-if="!compact || (!readOnly && showCreate)" class="record-feature-hero" :class="{ 'record-feature-hero--compact': compact }">
      <div v-if="!compact" class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-service"></i></span>
        <div>
          <h2>{{ pageTitle }}</h2>
          <p>{{ consultationDescription }}</p>
        </div>
      </div>
      <el-button v-if="showCreate && canCreate && !readOnly" type="primary" icon="el-icon-plus" @click="openCreate">{{ createActionLabel }}</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" :placeholder="searchPlaceholder" @input="resetPage" @clear="resetPage" />
        <el-select v-if="!compact" v-model="statusFilter" clearable placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="compact && pagedRecords.length" ref="leadTable" :data="pagedRecords" stripe class="record-feature-table record-feature-table--compact" @row-click="openDetail">
        <el-table-column v-if="followUpEnabled" type="expand" width="48">
          <template slot-scope="scope">
            <div class="lead-follow-up-history" @click.stop>
              <!-- <div class="lead-follow-up-history__summary">
                <div class="lead-follow-up-history__title">
                  <i class="el-icon-document" />
                  <span>跟进记录</span>
                  <b>{{ followUpRecords(scope.row).length }}</b>
                </div>
                <span v-if="followUpRecords(scope.row).length">提交后记录不可修改</span>
              </div> -->
              <el-empty v-if="!followUpRecords(scope.row).length" description="暂无跟进记录" :image-size="44" />
              <el-table v-else :data="followUpRecords(scope.row)" size="mini" class="lead-follow-up-history__table" @row-click="openFollowUpDetail">
                <el-table-column label="线索状态" min-width="140">
                  <template slot-scope="recordScope">
                    <el-tag size="mini" class="lead-status-tag" :class="leadStatusTagClass(recordScope.row.leadStatus)">
                      {{ leadStatusLabel(recordScope.row.leadStatus) }}
                      <span v-if="leadStatusCount(scope.row, recordScope.row.leadStatus) > 1">（第{{ leadStatusOccurrence(scope.row, recordScope.row.leadStatus, recordScope.$index) }}次）</span>
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="跟进时间" width="170">
                  <template slot-scope="recordScope">{{ formatDateTime(recordScope.row.followUpTime || recordScope.row.createTime) }}</template>
                </el-table-column>
                <el-table-column prop="communicationSummary" label="沟通纪要" min-width="260" show-overflow-tooltip />
                <el-table-column label="跟进方式" width="110">
                  <template slot-scope="recordScope">{{ followUpMethodLabel(recordScope.row.followUpMethod) }}</template>
                </el-table-column>
                <el-table-column label="意向度" min-width="360">
                  <template slot-scope="recordScope">
                    <span class="lead-follow-up-history__intent">{{ intentLevelLabel(recordScope.row.intentLevel) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="沟通对象" min-width="150" show-overflow-tooltip>
                  <template slot-scope="recordScope">{{ recordScope.row.contactPerson || '-' }}{{ recordScope.row.contactTitle ? ` · ${recordScope.row.contactTitle}` : '' }}</template>
                </el-table-column>
                <el-table-column label="下次跟进" width="170">
                  <template slot-scope="recordScope">{{ formatDateTime(recordScope.row.nextFollowUpTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="90">
                  <template slot-scope="recordScope">
                    <el-button v-if="recordScope.row.id" type="text" size="mini" @click.stop="openFollowUpDetail(recordScope.row)">查看详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="enterprise" label="企业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="contactName" label="联系人" min-width="120" show-overflow-tooltip />
        <el-table-column prop="contactPhone" label="联系电话" min-width="140" show-overflow-tooltip />
        <el-table-column label="渠道来源" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain" class="lead-summary-tag" :class="channelSourceTagClass(scope.row)">{{ channelSourceLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属行业" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.industry, 'industry') }}</template>
        </el-table-column>
        <el-table-column label="团队规模" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.teamSize, 'teamSize') }}</template>
        </el-table-column>
        <el-table-column label="意向空间" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.intendedSpace, 'intendedSpace') }}</template>
        </el-table-column>
        <el-table-column label="需求面积" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.requiredArea, 'requiredArea') }}</template>
        </el-table-column>
        <el-table-column label="计划入住时间" width="170">
          <template slot-scope="scope">{{ formatDate(scope.row.checkinTime) }}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="170">
          <template slot-scope="scope">{{ formatDateTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="跟踪次数" min-width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" type="info" effect="plain" :class="{ 'lead-empty-tag': !followUpRecords(scope.row).length }">{{ followUpRecords(scope.row).length }} 次</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户等级" min-width="110" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain" class="lead-summary-tag" :class="customerLevelTagClass(scope.row)">{{ customerLevelLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跟踪进度" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain" class="lead-status-tag" :class="trackingProgressTagClass(scope.row)">{{ trackingProgressLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="allocationEnabled" label="分配状态" width="110">
          <template slot-scope="scope">
            <el-tag :type="isAllocated(scope.row) ? 'success' : 'warning'" size="mini">{{ isAllocated(scope.row) ? '已分配' : '待分配' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="allocationEnabled" prop="responsiblePersonName" label="分配人" min-width="120" show-overflow-tooltip />
        <el-table-column v-else-if="allowConfirm" label="确认状态" width="110">
          <template slot-scope="scope">
            <el-tag :type="isConfirmed(scope.row) ? 'success' : 'warning'" size="mini">{{ isConfirmed(scope.row) ? '已确认' : '待确认' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="allocationEnabled || allowConfirm || followUpEnabled" label="操作" :width="allocationEnabled ? 250 : followUpEnabled ? 180 : 120">
          <template slot-scope="scope">
            <div class="record-feature-table__actions">
              <el-button v-if="allocationEnabled" class="lead-allocation-action" type="text" size="mini" :loading="allocatingId === scope.row.id" @click.stop="openAllocation(scope.row)">
                {{ isAllocated(scope.row) ? '重新分配' : '分配' }}
              </el-button>
              <el-button v-if="allocationEnabled" type="text" size="mini" @click.stop="openAllocationHistory(scope.row)">分配历史</el-button>
              <el-button v-else type="text" size="mini" :loading="confirmingId === scope.row.id" :disabled="isConfirmed(scope.row)" @click.stop="confirmRecord(scope.row)">
                {{ isConfirmed(scope.row) ? '已确认' : '标记为确认' }}
              </el-button>
              <el-tooltip v-if="followUpEnabled" :disabled="isAllocated(scope.row)" content="请先分配负责人" placement="top">
                <span :class="{ 'lead-follow-up-action--after-allocation': allocationEnabled }">
                  <el-button type="text" size="mini" :disabled="!isAllocated(scope.row)" @click.stop="openFollowUp(scope.row)">跟进</el-button>
                </span>
              </el-tooltip>
              <el-button v-if="!readOnly && canEditRecord(scope.row)" type="text" size="mini" @click.stop="openEdit(scope.row)">{{ resource.editActionLabel }}</el-button>
              <el-button v-if="!readOnly && canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else-if="pagedRecords.length" class="record-feature-grid">
        <article
          v-for="record in pagedRecords"
          :key="record.id"
          class="record-feature-card"
          role="button"
          tabindex="0"
          :aria-label="`查看咨询 ${record.id} 详情`"
          @click="openDetail(record)"
          @keydown.enter.self="openDetail(record)"
          @keydown.space.self.prevent="openDetail(record)">
          <div class="record-feature-card__head">
            <span class="record-feature-card__id">
              <i class="el-icon-chat-dot-round"></i>
              {{ record.id }}
            </span>
            <el-tag :type="statusType(statusText(record.status))" size="small">{{ statusText(record.status) }}</el-tag>
          </div>
          <h3 class="online-consultation-card__question" :title="record.content || '暂无咨询内容'">{{ record.content || '暂无咨询内容' }}</h3>
          <div class="online-consultation-card__meta">
            <div class="online-consultation-card__meta-item">
              <small>
                <i class="el-icon-user" aria-hidden="true"></i>
                咨询人
              </small>
              <span :title="record.userName || '-'">{{ record.userName || '-' }}</span>
            </div>
            <div class="online-consultation-card__meta-item">
              <small>
                <i class="el-icon-time" aria-hidden="true"></i>
                咨询时间
              </small>
              <span :title="record.consultTime || '-'">{{ record.consultTime || '-' }}</span>
            </div>
            <div class="online-consultation-card__meta-item">
              <small>
                <i class="el-icon-phone-outline" aria-hidden="true"></i>
                联系电话
              </small>
              <span :title="record.phone || '-'">{{ record.phone || '-' }}</span>
            </div>
          </div>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">{{ resource.editActionLabel }}</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" :description="`暂无${pageTitle}记录`" />
      <div v-if="compact && leadTableScrollbarVisible" ref="leadTableScrollbar" class="lead-table-horizontal-scrollbar" @mousedown="moveLeadTableScrollFromTrack">
        <span class="lead-table-horizontal-scrollbar__thumb" :style="leadTableScrollbarThumbStyle" @mousedown.stop.prevent="startLeadTableScrollbarDrag"></span>
      </div>
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="5vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" :label-width="mode === 'admin' ? '124px' : '96px'" @submit.native.prevent>
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ compact ? '创建线索' : mode === 'admin' ? '提交回复' : '提交咨询' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="`${pageTitle}详情`" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-service"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ compact ? selectedRecord.enterprise || pageTitle : selectedRecord.userName || '在线咨询' }}</h3>
          </div>
          <el-tag v-if="!compact" :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div v-if="compact" class="record-feature-detail__grid">
          <div v-for="field in compactDetailFields" :key="field.key" class="record-feature-detail__item">
            <small>{{ field.label }}</small>
            <b>{{ formatCompactDetailValue(selectedRecord[field.key], field.key) }}</b>
          </div>
        </div>
        <div v-else class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>咨询人</small>
            <b>{{ selectedRecord.userName || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>咨询时间</small>
            <b>{{ selectedRecord.consultTime || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>联系电话</small>
            <b>{{ selectedRecord.phone || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>回复人</small>
            <b>{{ selectedRecord.replyUserName || '-' }}</b>
          </div>
        </div>
        <section v-if="!compact" class="record-feature-detail__section">
          <h4>咨询内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
        <section v-if="!compact && selectedRecord.replyContent" class="record-feature-detail__section">
          <h4>回复内容</h4>
          <p>{{ selectedRecord.replyContent }}</p>
        </section>
      </div>
    </el-drawer>

    <el-dialog
      :title="allocationRecord && isAllocated(allocationRecord) ? '重新分配' : '分配'"
      :visible.sync="allocationVisible"
      width="900px"
      top="8vh"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetAllocation">
      <el-form ref="allocationForm" :model="allocationForm" :rules="allocationRules" label-width="104px" @submit.native.prevent>
        <el-form-item label="分配人员" prop="userId">
          <el-select v-model="allocationForm.userId" filterable placeholder="请选择分配人员" :loading="allocationUsersLoading" style="width: 100%" @change="handleAllocationUserChange">
            <el-option v-for="user in allocationUsers" :key="allocationUserIdOf(user)" :label="allocationUserLabel(user)" :value="allocationUserIdOf(user)" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="allocationRecord && isAllocated(allocationRecord)" label="重新分配理由" prop="reason">
          <el-input v-model.trim="allocationForm.reason" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请填写重新分配理由" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="allocationVisible = false">取消</el-button>
        <el-button type="primary" :loading="allocatingId !== ''" @click="submitAllocation">确认</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配历史" :visible.sync="allocationHistoryVisible" width="760px" top="8vh" append-to-body @closed="resetAllocationHistory">
      <div v-loading="allocationHistoryLoading" class="lead-allocation-history">
        <div v-if="allocationHistoryRecord" class="lead-allocation-history__summary">
          <div>
            <small>当前线索</small>
            <b>{{ allocationHistoryRecord.enterprise || allocationHistoryRecord.id }}</b>
          </div>
          <el-tag size="small" type="info">共 {{ allocationHistory.length }} 条记录</el-tag>
        </div>
        <el-table v-if="allocationHistory.length" :data="pagedAllocationHistory" size="mini" border class="lead-allocation-history__table">
          <el-table-column type="index" :index="allocationHistoryRowIndex" label="序号" width="64" align="center" />
          <!-- <el-table-column label="原负责人" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">{{ allocationHistoryPreviousAssignee(scope.row) }}</template>
          </el-table-column> -->
          <el-table-column label="分配给" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ allocationHistoryAssignee(scope.row) }}</span>
              <el-tag v-if="isFirstAllocation(allocationHistoryGlobalIndex(scope.$index))" class="lead-allocation-history__first-tag" size="mini" type="success">首次分配</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="重新分配理由" min-width="180" show-overflow-tooltip>
            <template slot-scope="scope">{{ allocationHistoryReason(scope.row) }}</template>
          </el-table-column>
          <el-table-column label="操作人" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">{{ allocationHistoryOperator(scope.row) }}</template>
          </el-table-column>
          <el-table-column label="分配时间" width="170">
            <template slot-scope="scope">{{ allocationHistoryTime(scope.row) }}</template>
          </el-table-column>
        </el-table>
        <div v-if="allocationHistory.length > allocationHistoryPageSize" class="lead-allocation-history__pagination">
          <el-pagination
            small
            background
            :current-page="allocationHistoryPage"
            :page-size="allocationHistoryPageSize"
            :total="allocationHistory.length"
            layout="prev, pager, next"
            @current-change="handleAllocationHistoryPageChange" />
        </div>
        <el-empty v-if="!allocationHistoryLoading && !allocationHistory.length" description="暂无分配历史" :image-size="72" />
      </div>
    </el-dialog>

    <el-dialog title="线索跟进" :visible.sync="followUpVisible" width="760px" top="5vh" append-to-body :close-on-click-modal="false" @closed="resetFollowUp">
      <el-form ref="followUpForm" :model="followUpForm" :rules="followUpRules" label-width="112px" @submit.native.prevent>
        <div class="lead-follow-up-form">
          <el-form-item label="跟进方式" prop="followUpMethod">
            <el-select v-model="followUpForm.followUpMethod" placeholder="请选择跟进方式" style="width: 100%">
              <el-option v-for="item in followUpMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="此次跟进时间" prop="followUpTime">
            <el-date-picker v-model="followUpForm.followUpTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择此次跟进时间" style="width: 100%" />
          </el-form-item>
          <el-form-item label="沟通对象" prop="contactPerson">
            <el-input v-model.trim="followUpForm.contactPerson" placeholder="请输入沟通对象姓名" />
          </el-form-item>
          <el-form-item label="沟通对象职务">
            <el-input v-model.trim="followUpForm.contactTitle" placeholder="选填" />
          </el-form-item>
          <el-form-item label="意向度" prop="intentLevel">
            <el-select v-model="followUpForm.intentLevel" placeholder="请选择意向度" style="width: 100%">
              <el-option v-for="item in intentLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="线索状态" prop="leadStatus">
            <el-select v-model="followUpForm.leadStatus" placeholder="请选择更新后的线索状态" style="width: 100%">
              <el-option v-for="item in leadStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="下次跟进时间" prop="nextFollowUpTime">
            <el-date-picker v-model="followUpForm.nextFollowUpTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="暂缓跟进时必填" style="width: 100%" />
          </el-form-item>
          <el-form-item label="沟通纪要" prop="communicationSummary" class="lead-follow-up-form__wide">
            <el-input v-model.trim="followUpForm.communicationSummary" type="textarea" :rows="4" placeholder="请输入本次跟进的沟通纪要" />
          </el-form-item>
          <el-form-item label="下次跟进事项" class="lead-follow-up-form__wide">
            <el-input v-model.trim="followUpForm.nextFollowUpTask" type="textarea" :rows="2" placeholder="建议填写后续待办事项" />
          </el-form-item>
          <el-form-item label="意向面积（㎡）">
            <el-input v-model="followUpForm.expectedArea" type="number" min="0" placeholder="选填" />
          </el-form-item>
          <el-form-item label="意向区域/楼栋">
            <el-input v-model.trim="followUpForm.preferredLocation" placeholder="选填" />
          </el-form-item>
          <el-form-item label="预算/租金">
            <el-input v-model="followUpForm.budget" type="number" min="0" placeholder="选填" />
          </el-form-item>
          <el-form-item label="拟入驻时间">
            <el-date-picker v-model="followUpForm.expectedMoveInDate" type="date" value-format="yyyy-MM-dd" placeholder="选填" style="width: 100%" />
          </el-form-item>
          <el-form-item label="行业类型">
            <el-input v-model.trim="followUpForm.industry" placeholder="选填" />
          </el-form-item>
          <business-attachment-field v-model="followUpForm.attachmentFiles" class="lead-follow-up-form__wide" label="附件" :limit="9" />
          <el-form-item label="遗留问题" class="lead-follow-up-form__wide">
            <el-input v-model.trim="followUpForm.openIssues" type="textarea" :rows="2" placeholder="选填" />
          </el-form-item>
          <el-form-item label="需支持事项" class="lead-follow-up-form__wide">
            <el-input v-model.trim="followUpForm.supportNeeded" type="textarea" :rows="2" placeholder="选填" />
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="followUpVisible = false">取消</el-button>
        <el-button type="primary" :loading="followUpSubmitting" @click="submitFollowUp">提交</el-button>
      </span>
    </el-dialog>

    <el-drawer title="跟进记录详情" :visible.sync="followUpDetailVisible" direction="rtl" size="560px" append-to-body>
      <div v-if="followUpDetail" v-loading="followUpDetailLoading" class="lead-follow-up-detail">
        <div v-for="field in followUpDetailFields" :key="field.key" class="lead-follow-up-detail__item">
          <small>{{ field.label }}</small>
          <b>{{ followUpDetailValue(field.key) }}</b>
        </div>
        <div v-if="followUpDetailUploadFiles().length" class="lead-follow-up-detail__item lead-follow-up-detail__attachments">
          <small>附件</small>
          <div class="lead-follow-up-detail__file-list">
            <el-button
              v-for="(file, index) in followUpDetailUploadFiles()"
              :key="`${file.id || file.filePath || file.name}-${index}`"
              type="text"
              size="small"
              icon="el-icon-download"
              @click="downloadFollowUpAttachment(file)">
              {{ file.name || file.fileName || `附件${index + 1}` }}
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import BusinessAttachmentField from '@/components/business/record-fields/BusinessAttachmentField'
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'LeadManagementPage',
  components: { BusinessAttachmentField, BusinessRecordField },
  mixins: [recordManager],
  props: {
    mode: { type: String, default: 'user' },
    apiNamespace: { type: String, default: 'tobOnlineConsult' },
    pageTitle: { type: String, default: '在线咨询' },
    pageDescription: { type: String, default: '' },
    createActionLabel: { type: String, default: '发起咨询' },
    showCreate: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: '搜索咨询编号、咨询人或内容' },
    listParams: { type: Object, default: () => ({}) },
    allowConfirm: { type: Boolean, default: false },
    allocationEnabled: { type: Boolean, default: false },
    followUpEnabled: { type: Boolean, default: false },
    confirmStatus: { type: [String, Number], default: 1 }
  },
  data() {
    return {
      confirmingId: '',
      allocatingId: '',
      allocationVisible: false,
      allocationRecord: null,
      allocationForm: {
        userId: '',
        reason: ''
      },
      allocationUsers: [],
      allocationUsersLoading: false,
      allocationHistoryVisible: false,
      allocationHistoryLoading: false,
      allocationHistoryRecord: null,
      allocationHistory: [],
      allocationHistoryPage: 1,
      allocationHistoryPageSize: 10,
      followUpVisible: false,
      followUpSubmitting: false,
      followUpRecord: null,
      followUpForm: this.emptyFollowUpForm(),
      followUpDetailVisible: false,
      followUpDetailLoading: false,
      followUpDetail: null,
      leadTableScrollbarVisible: false,
      leadTableScrollWidth: 0,
      leadTableViewportWidth: 0,
      leadTableScrollLeft: 0
    }
  },
  watch: {
    records() {
      this.scheduleLeadTableScrollbar()
    },
    currentPage() {
      this.scheduleLeadTableScrollbar()
    }
  },
  mounted() {
    this.$nextTick(this.scheduleLeadTableScrollbar)
    window.addEventListener('resize', this.scheduleLeadTableScrollbar)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.scheduleLeadTableScrollbar)
    if (this._leadTableBodyWrapper && this._leadTableScrollHandler) this._leadTableBodyWrapper.removeEventListener('scroll', this._leadTableScrollHandler)
    if (this._leadTableScrollFrame != null) window.cancelAnimationFrame(this._leadTableScrollFrame)
    this.stopLeadTableScrollbarDrag()
  },
  computed: {
    consultationDescription() {
      if (this.pageDescription) return this.pageDescription
      return this.mode === 'admin' ? '查看并回复用户提交的园区服务咨询。' : '提交园区服务问题，并随时查看专员回复。'
    },
    leadTableScrollbarThumbWidth() {
      if (!this.leadTableViewportWidth || !this.leadTableScrollWidth) return 0
      return Math.min(this.leadTableViewportWidth, Math.max(48, Math.round((this.leadTableViewportWidth * this.leadTableViewportWidth) / this.leadTableScrollWidth)))
    },
    leadTableScrollbarThumbStyle() {
      const maxScroll = Math.max(0, this.leadTableScrollWidth - this.leadTableViewportWidth)
      const maxTravel = Math.max(0, this.leadTableViewportWidth - this.leadTableScrollbarThumbWidth)
      const left = maxScroll && maxTravel ? (this.leadTableScrollLeft / maxScroll) * maxTravel : 0
      return {
        width: `${this.leadTableScrollbarThumbWidth}px`,
        transform: `translateX(${left}px)`
      }
    },
    allocationRules() {
      return {
        userId: [{ required: true, message: '请选择分配人员', trigger: 'change' }],
        reason: [{ required: true, message: '请填写重新分配理由', trigger: 'blur' }]
      }
    },
    pagedAllocationHistory() {
      const start = (this.allocationHistoryPage - 1) * this.allocationHistoryPageSize
      return this.allocationHistory.slice(start, start + this.allocationHistoryPageSize)
    },
    compactDetailFields() {
      return [
        { key: 'contactName', label: '联系人' },
        { key: 'contactPhone', label: '联系电话' },
        { key: 'industry', label: '所属行业' },
        { key: 'teamSize', label: '团队规模' },
        { key: 'intendedSpace', label: '意向空间' },
        { key: 'requiredArea', label: '需求面积' },
        { key: 'checkinTime', label: '计划入住时间' },
        { key: 'other', label: '其他需求' },
        { key: 'channelSource', label: '渠道来源' },
        { key: 'createTime', label: '提交时间' }
      ]
    },
    followUpMethodOptions() {
      return [
        { value: 'PHONE', label: '电话' },
        { value: 'WECHAT', label: '微信' },
        { value: 'EMAIL', label: '邮件' },
        { value: 'OFFSITE_VISIT', label: '外出拜访' },
        { value: 'ONSITE_RECEPTION', label: '现场接待' },
        { value: 'VIDEO_CALL', label: '视频沟通' },
        { value: 'TRADE_SHOW', label: '展会' }
      ]
    },
    channelSourceOptions() {
      return [
        { value: 'ONLINE_INQUIRY', label: '线上咨询' },
        { value: 'MARKETING_EVENT', label: '市场活动/展会' },
        { value: 'OUTBOUND_VISIT', label: '招商拜访' },
        { value: 'PARTNER_REFERRAL', label: '合作伙伴推荐' },
        { value: 'PARK_OPERATION', label: '园区运营转交' },
        { value: 'OTHER', label: '其他渠道' }
      ]
    },
    intentLevelOptions() {
      return [
        { value: 'A', label: 'A（1 个工作日）— 最高优先级，需高频推进并触发分级督办' },
        { value: 'B', label: 'B（2 个工作日）— 重点客户，保持较高跟进频率' },
        { value: 'C', label: 'C（7 个工作日）— 持续培育并关注需求变化' },
        { value: 'D', label: 'D（30 个工作日）— 中长期培育客户' },
        { value: 'E', label: 'E（180 个工作日）— 初始或低成熟度客户，新线索默认等级' },
        { value: 'F', label: 'F（不按普通周期提醒）— 已放弃客户，重新分配后恢复' }
      ]
    },
    leadStatusOptions() {
      return [
        { value: 'INITIAL_CONTACT', label: '初步接触' },
        { value: 'INTENT_CONFIRMED', label: '意向确认' },
        { value: 'VISIT_OR_PROPOSAL', label: '考察/洽谈中' },
        { value: 'NEGOTIATION', label: '谈判阶段' },
        { value: 'CONTRACT_SIGNED', label: '签约落地' },
        { value: 'ON_HOLD', label: '暂缓跟进' }
      ]
    },
    followUpRules() {
      return {
        followUpMethod: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
        followUpTime: [{ required: true, message: '请选择此次跟进时间', trigger: 'change' }],
        contactPerson: [{ required: true, message: '请输入沟通对象姓名', trigger: 'blur' }],
        communicationSummary: [{ required: true, message: '请输入沟通纪要', trigger: 'blur' }],
        intentLevel: [{ required: true, message: '请选择意向度', trigger: 'change' }],
        leadStatus: [{ required: true, message: '请选择线索状态', trigger: 'change' }]
      }
    },
    followUpDetailFields() {
      return [
        { key: 'followUpMethod', label: '跟进方式' },
        { key: 'followUpTime', label: '此次跟进时间' },
        { key: 'contactPerson', label: '沟通对象' },
        { key: 'contactTitle', label: '沟通对象职务' },
        { key: 'communicationSummary', label: '沟通纪要' },
        { key: 'intentLevel', label: '意向度' },
        { key: 'leadStatus', label: '线索状态' },
        { key: 'nextFollowUpTime', label: '下次跟进时间' },
        { key: 'nextFollowUpTask', label: '下次跟进事项' },
        { key: 'expectedArea', label: '意向面积（㎡）' },
        { key: 'preferredLocation', label: '意向区域/楼栋' },
        { key: 'budget', label: '预算/租金' },
        { key: 'expectedMoveInDate', label: '拟入驻时间' },
        { key: 'industry', label: '行业类型' },
        { key: 'openIssues', label: '遗留问题' },
        { key: 'supportNeeded', label: '需支持事项' }
      ]
    },
    resource() {
      const replyMode = !this.compact && this.mode === 'admin'
      const leadFields = [
        { key: 'enterprise', label: '企业名称', required: true, maxlength: 200 },
        { key: 'contactName', label: '联系人', required: true, maxlength: 50 },
        { key: 'contactPhone', label: '联系电话', required: true, maxlength: 20 },
        {
          key: 'industry',
          label: '所属行业',
          required: true,
          options: [
            { value: 1, label: '智能制造' },
            { value: 2, label: '医疗科技' },
            { value: 3, label: '数字经济' },
            { value: 4, label: '互联网' },
            { value: 5, label: '新材料' },
            { value: 6, label: '其他' }
          ]
        },
        {
          key: 'teamSize',
          label: '团队规模',
          required: true,
          options: [
            { value: 1, label: '20 人以内' },
            { value: 2, label: '20–50 人' },
            { value: 3, label: '51–100 人' },
            { value: 4, label: '100 人以上' }
          ]
        },
        {
          key: 'intendedSpace',
          label: '意向空间',
          required: true,
          options: [
            { value: 1, label: '独立办公室' },
            { value: 2, label: '研发办公' },
            { value: 3, label: '企业总部' },
            { value: 4, label: '轻型生产' },
            { value: 5, label: '配套商业' }
          ]
        },
        {
          key: 'requiredArea',
          label: '需求面积',
          required: true,
          options: [
            { value: 1, label: '100㎡以内' },
            { value: 2, label: '100–200㎡' },
            { value: 3, label: '201–500㎡以内' },
            { value: 4, label: '500–1,000㎡' },
            { value: 5, label: '1,000㎡以上' }
          ]
        },
        { key: 'checkinTime', label: '计划入住时间', type: 'datetime', required: true },
        {
          key: 'channelSource',
          label: '渠道来源',
          required: true,
          options: this.channelSourceOptions
        },
        { key: 'other', label: '其他需求', type: 'textarea', rows: 3, wide: true }
      ]
      return {
        title: this.pageTitle,
        itemName: this.compact ? '线索' : '咨询',
        createSuccessMessage: this.compact ? '线索创建成功' : undefined,
        icon: 'el-icon-service',
        idPrefix: 'OC',
        apiNamespace: this.apiNamespace,
        listParams: this.listParams,
        preserveListFields: this.compact ? ['referrerName', 'channelSource'] : [],
        primaryKey: 'id',
        timeKey: 'consultTime',
        contentKey: 'content',
        defaultStatus: this.allocationEnabled ? 0 : '待回复',
        statusMap: this.allocationEnabled ? { 0: '待分配', 1: '已分配' } : {},
        valueLabelMaps: {
          industry: { 1: '智能制造', 2: '医疗科技', 3: '数字经济', 4: '互联网', 5: '新材料', 6: '其他' },
          teamSize: { 1: '20 人以内', 2: '20–50 人', 3: '51–100 人', 4: '100 人以上' },
          intendedSpace: { 1: '独立办公室', 2: '研发办公', 3: '企业总部', 4: '轻型生产', 5: '配套商业' },
          requiredArea: { 1: '100㎡以内', 2: '100–200㎡', 3: '201–500㎡以内', 4: '500–1,000㎡', 5: '1,000㎡以上' }
        },
        replyMode,
        replyStatus: '已回复',
        editActionLabel: replyMode ? '回复' : '编辑',
        defaultForm: this.compact ? { channelSource: 'ONLINE_INQUIRY' } : {},
        autoFormFields: this.compact || replyMode ? {} : { userName: 'currentUserName' },
        replyAutoFormFields: replyMode ? { replyUserName: 'currentUserName', replyTime: 'now' } : {},
        payloadTransform: this.compact
          ? (payload) => {
              const mainTableFields = ['enterprise', 'contactName', 'contactPhone', 'industry', 'teamSize', 'intendedSpace', 'requiredArea', 'checkinTime', 'other', 'channelSource', 'status']
              return mainTableFields.reduce((result, key) => {
                if (payload[key] !== undefined && payload[key] !== '') result[key] = payload[key]
                return result
              }, {})
            }
          : undefined,
        statusOptions: this.allocationEnabled ? ['待分配', '已分配'] : ['待回复', '处理中', '已回复', '已关闭'],
        fields: this.compact
          ? leadFields
          : [
              { key: 'userName', label: '咨询人', hideInForm: true },
              { key: 'phone', label: '联系电话', required: true, hideInReplyForm: true },
              { key: 'consultTime', label: '咨询时间', type: 'datetime', required: true, hideInReplyForm: true },
              { key: 'content', label: '咨询内容', type: 'textarea', required: true, hideInReplyForm: true, wide: true },
              { key: 'replyPhone', label: '回复人联系方式', required: true, wide: true, hideInCreateForm: true },
              { key: 'replyUserName', label: '回复人', hideInForm: true },
              { key: 'replyTime', label: '回复时间', type: 'datetime', hideInForm: true },
              { key: 'replyContent', label: '回复内容', type: 'textarea', required: true, hideInCreateForm: true, wide: true }
            ]
      }
    },
    permissions() {
      if (this.compact) return { create: this.mode === 'admin', edit: false, delete: false, changeStatus: false }
      if (this.readOnly) return { create: false, edit: false, delete: false, changeStatus: false }
      return this.mode === 'admin' ? { create: false, edit: true, delete: true, changeStatus: false } : { create: true, edit: true, delete: true, changeStatus: false }
    }
  },
  methods: {
    scheduleLeadTableScrollbar() {
      this.$nextTick(() => this.bindLeadTableScrollbar())
    },
    bindLeadTableScrollbar() {
      const table = this.$refs.leadTable
      const bodyWrapper = table && table.$el && table.$el.querySelector('.el-table__body-wrapper')
      if (!bodyWrapper) {
        this.leadTableScrollbarVisible = false
        return
      }
      if (this._leadTableBodyWrapper !== bodyWrapper) {
        if (this._leadTableBodyWrapper && this._leadTableScrollHandler) this._leadTableBodyWrapper.removeEventListener('scroll', this._leadTableScrollHandler)
        this._leadTableBodyWrapper = bodyWrapper
        this._leadTableScrollHandler = this.syncLeadTableScrollFromTable
        bodyWrapper.addEventListener('scroll', this._leadTableScrollHandler)
      }
      const bodyTable = bodyWrapper.querySelector('.el-table__body')
      this.leadTableScrollWidth = Math.max(bodyWrapper.scrollWidth, bodyTable ? bodyTable.scrollWidth : 0)
      this.leadTableViewportWidth = bodyWrapper.clientWidth
      this.leadTableScrollLeft = bodyWrapper.scrollLeft
      this.leadTableScrollbarVisible = this.leadTableScrollWidth > this.leadTableViewportWidth
    },
    syncLeadTableScrollFromTable() {
      if (this._leadTableBodyWrapper) this.leadTableScrollLeft = this._leadTableBodyWrapper.scrollLeft
    },
    setLeadTableScrollLeft(value) {
      const maxScroll = Math.max(0, this.leadTableScrollWidth - this.leadTableViewportWidth)
      const scrollLeft = Math.max(0, Math.min(maxScroll, value))
      if (this._leadTableBodyWrapper) this._leadTableBodyWrapper.scrollLeft = scrollLeft
      this.leadTableScrollLeft = scrollLeft
    },
    queueLeadTableScrollLeft(value) {
      this._leadTablePendingScrollLeft = value
      if (this._leadTableScrollFrame != null) return
      this._leadTableScrollFrame = window.requestAnimationFrame(() => {
        this._leadTableScrollFrame = null
        this.setLeadTableScrollLeft(this._leadTablePendingScrollLeft)
      })
    },
    moveLeadTableScrollFromTrack(event) {
      const track = this.$refs.leadTableScrollbar
      if (!track) return
      const maxScroll = Math.max(0, this.leadTableScrollWidth - this.leadTableViewportWidth)
      const maxTravel = Math.max(0, this.leadTableViewportWidth - this.leadTableScrollbarThumbWidth)
      if (!maxScroll || !maxTravel) return
      const rect = track.getBoundingClientRect()
      const thumbLeft = Math.max(0, Math.min(maxTravel, event.clientX - rect.left - this.leadTableScrollbarThumbWidth / 2))
      this.queueLeadTableScrollLeft((thumbLeft / maxTravel) * maxScroll)
    },
    startLeadTableScrollbarDrag(event) {
      this._leadTableScrollbarDrag = { startX: event.clientX, startScrollLeft: this.leadTableScrollLeft }
      this._leadTableScrollbarDragMoveHandler = this._leadTableScrollbarDragMoveHandler || this.moveLeadTableScrollbarDrag
      this._leadTableScrollbarDragEndHandler = this._leadTableScrollbarDragEndHandler || this.stopLeadTableScrollbarDrag
      document.addEventListener('mousemove', this._leadTableScrollbarDragMoveHandler)
      document.addEventListener('mouseup', this._leadTableScrollbarDragEndHandler)
    },
    moveLeadTableScrollbarDrag(event) {
      if (!this._leadTableScrollbarDrag) return
      const maxScroll = Math.max(0, this.leadTableScrollWidth - this.leadTableViewportWidth)
      const maxTravel = Math.max(0, this.leadTableViewportWidth - this.leadTableScrollbarThumbWidth)
      if (!maxScroll || !maxTravel) return
      const delta = event.clientX - this._leadTableScrollbarDrag.startX
      this.queueLeadTableScrollLeft(this._leadTableScrollbarDrag.startScrollLeft + (delta / maxTravel) * maxScroll)
    },
    stopLeadTableScrollbarDrag() {
      this._leadTableScrollbarDrag = null
      if (this._leadTableScrollbarDragMoveHandler) document.removeEventListener('mousemove', this._leadTableScrollbarDragMoveHandler)
      if (this._leadTableScrollbarDragEndHandler) document.removeEventListener('mouseup', this._leadTableScrollbarDragEndHandler)
    },
    formatDateTime(value) {
      if (!value) return '-'
      const raw = String(value)
      const parts = raw.split('T')
      let formatted = parts.length > 1 ? parts[0] + ' ' + parts.slice(1).join('T') : raw
      if (/^\d{4}-\d{2}-\d{2}$/.test(formatted)) formatted += ' 00:00:00'
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(formatted)) formatted += ':00'
      return formatted.slice(0, 19)
    },
    formatDate(value) {
      const formatted = this.formatDateTime(value)
      return formatted === '-' ? '-' : formatted.slice(0, 10)
    },
    formatCompactDetailValue(value, key) {
      return ['checkinTime', 'createTime'].includes(key) ? this.formatDateTime(value) : this.formatValue(value, key)
    },
    emptyFollowUpForm() {
      return {
        followUpMethod: '',
        followUpTime: '',
        contactPerson: '',
        contactTitle: '',
        communicationSummary: '',
        intentLevel: 'E',
        leadStatus: '',
        nextFollowUpTime: '',
        nextFollowUpTask: '',
        expectedArea: '',
        preferredLocation: '',
        budget: '',
        expectedMoveInDate: '',
        industry: '',
        attachmentFiles: [],
        openIssues: '',
        supportNeeded: ''
      }
    },
    followUpRecords(record) {
      return Array.isArray(record && record.records) ? record.records : []
    },
    latestFollowUpRecord(record) {
      return this.followUpRecords(record).reduce((latest, current) => {
        if (!latest) return current
        const latestTime = this.followUpRecordTimestamp(latest)
        const currentTime = this.followUpRecordTimestamp(current)
        return currentTime >= latestTime ? current : latest
      }, null)
    },
    followUpFormFromRecord(record) {
      const form = this.emptyFollowUpForm()
      const latestRecord = this.latestFollowUpRecord(record)
      if (latestRecord) return Object.assign(form, this.followUpBasicValues(latestRecord))
      return Object.assign(form, {
        contactPerson: (record && record.contactName) || '',
        intentLevel: 'E',
        leadStatus: 'INITIAL_CONTACT',
        expectedMoveInDate: this.followUpDateValue(record && record.checkinTime),
        industry: record && record.industry ? this.formatValue(record.industry, 'industry') : ''
      })
    },
    followUpBasicValues(record) {
      const fieldNames = ['followUpMethod', 'contactPerson', 'contactTitle', 'intentLevel', 'leadStatus', 'expectedArea', 'preferredLocation', 'budget', 'industry', 'openIssues']
      const values = fieldNames.reduce((result, key) => {
        if (record && record[key] !== undefined && record[key] !== null && record[key] !== '') result[key] = record[key]
        return result
      }, {})
      values.expectedMoveInDate = this.followUpDateValue(record && record.expectedMoveInDate)
      return values
    },
    followUpDateValue(value) {
      if (!value) return ''
      const formatted = this.formatDateTime(value)
      return formatted && formatted !== '-' ? formatted.slice(0, 10) : ''
    },
    followUpRecordTimestamp(record) {
      const value = record && (record.followUpTime || record.createTime || record.updateTime)
      const timestamp = value ? Date.parse(String(value).replace(' ', 'T')) : NaN
      return Number.isNaN(timestamp) ? 0 : timestamp
    },
    customerLevelLabel(record) {
      const latestRecord = this.latestFollowUpRecord(record)
      const value = latestRecord && latestRecord.intentLevel
      const level = String(value || '')
        .charAt(0)
        .toUpperCase()
      return ['A', 'B', 'C', 'D', 'E', 'F'].includes(level) ? `${level}级` : '-'
    },
    trackingProgressLabel(record) {
      const latestRecord = this.latestFollowUpRecord(record)
      return latestRecord ? this.leadStatusLabel(latestRecord.leadStatus) : '-'
    },
    trackingProgressTagClass(record) {
      const latestRecord = this.latestFollowUpRecord(record)
      return this.leadStatusTagClass(latestRecord && latestRecord.leadStatus)
    },
    customerLevelTagClass(record) {
      const latestRecord = this.latestFollowUpRecord(record)
      const level = String((latestRecord && latestRecord.intentLevel) || '')
        .charAt(0)
        .toUpperCase()
      return `lead-summary-tag--level-${['A', 'B', 'C', 'D', 'E', 'F'].includes(level) ? level.toLowerCase() : 'empty'}`
    },
    channelSourceLabel(record) {
      if (record && record.referrer) return `客户转介绍：${record.referrerName || '-'}`
      const source = record && (record.channelSource || record.source || record.channel)
      const option = this.channelSourceOptions.find((item) => item.value === source)
      return (option && option.label) || source || '-'
    },
    channelSourceTagClass(record) {
      if (record && record.referrer) return 'lead-summary-tag--referral'
      const source = record && (record.channelSource || record.source || record.channel)
      const classMap = {
        ONLINE_INQUIRY: 'lead-summary-tag--online',
        MARKETING_EVENT: 'lead-summary-tag--event',
        OUTBOUND_VISIT: 'lead-summary-tag--visit',
        PARTNER_REFERRAL: 'lead-summary-tag--partner',
        PARK_OPERATION: 'lead-summary-tag--operation',
        OTHER: 'lead-summary-tag--other'
      }
      return classMap[source] || 'lead-summary-tag--other'
    },
    leadStatusTagClass(value) {
      const classMap = {
        INITIAL_CONTACT: 'lead-status-tag--initial',
        INTENT_CONFIRMED: 'lead-status-tag--confirmed',
        VISIT_OR_PROPOSAL: 'lead-status-tag--visit',
        NEGOTIATION: 'lead-status-tag--negotiation',
        CONTRACT_SIGNED: 'lead-status-tag--signed',
        ON_HOLD: 'lead-status-tag--hold'
      }
      return classMap[value] || 'lead-status-tag--empty'
    },
    leadStatusCount(record, status) {
      return this.followUpRecords(record).filter((item) => item && item.leadStatus === status).length
    },
    leadStatusOccurrence(record, status, index) {
      return this.followUpRecords(record)
        .slice(0, index + 1)
        .filter((item) => item && item.leadStatus === status).length
    },
    followUpMethodLabel(value) {
      const option = this.followUpMethodOptions.find((item) => item.value === value)
      return (option && option.label) || value || '-'
    },
    intentLevelLabel(value) {
      const option = this.intentLevelOptions.find((item) => item.value === value)
      return (option && option.label) || value || '-'
    },
    leadStatusLabel(value) {
      const option = this.leadStatusOptions.find((item) => item.value === value)
      return (option && option.label) || value || '-'
    },
    openFollowUp(record) {
      this.followUpRecord = record
      this.followUpForm = this.followUpFormFromRecord(record)
      this.followUpVisible = true
      this.$nextTick(() => this.$refs.followUpForm && this.$refs.followUpForm.clearValidate())
    },
    resetFollowUp() {
      this.followUpRecord = null
      this.followUpForm = this.emptyFollowUpForm()
      this.followUpSubmitting = false
    },
    optionalNumber(value) {
      if (value === '' || value === null || value === undefined) return undefined
      const number = Number(value)
      return Number.isNaN(number) ? undefined : number
    },
    followUpUploadFiles() {
      return (this.followUpForm.attachmentFiles || [])
        .map((file) => {
          const fileName = file.fileName || file.name || ''
          const filePath = file.filePath || file.url || file.fileUrl || ''
          const id = file.id || file.attachmentId || file.fileId
          if (!id && !filePath) return null
          return {
            name: file.name || fileName,
            fileName,
            filePath,
            fileType: file.fileType || (file.raw && file.raw.type) || '',
            url: file.url || file.fileUrl || filePath,
            id
          }
        })
        .filter(Boolean)
    },
    followUpPayload() {
      const form = this.followUpForm
      const payload = {
        parentId: this.followUpRecord.id,
        followUpMethod: form.followUpMethod,
        followUpTime: form.followUpTime ? this.formatDateTime(form.followUpTime) : undefined,
        createdBy: this.currentUserId(),
        contactPerson: form.contactPerson,
        contactTitle: form.contactTitle || undefined,
        communicationSummary: form.communicationSummary,
        intentLevel: form.intentLevel,
        leadStatus: form.leadStatus,
        nextFollowUpTime: form.nextFollowUpTime ? this.formatDateTime(form.nextFollowUpTime) : undefined,
        nextFollowUpTask: form.nextFollowUpTask || undefined,
        expectedArea: this.optionalNumber(form.expectedArea),
        preferredLocation: form.preferredLocation || undefined,
        budget: this.optionalNumber(form.budget),
        expectedMoveInDate: form.expectedMoveInDate ? this.formatDateTime(form.expectedMoveInDate) : undefined,
        industry: form.industry || undefined,
        uploadFiles: this.followUpUploadFiles(),
        openIssues: form.openIssues || undefined,
        supportNeeded: form.supportNeeded || undefined
      }
      return Object.keys(payload).reduce((result, key) => {
        if (payload[key] !== undefined) result[key] = payload[key]
        return result
      }, {})
    },
    submitFollowUp() {
      this.$refs.followUpForm.validate(async (valid) => {
        if (!valid || this.followUpSubmitting) return
        if (this.followUpForm.leadStatus === 'ON_HOLD' && !this.followUpForm.nextFollowUpTime) {
          this.$message.warning('暂缓跟进时必须填写下次跟进时间')
          return
        }
        try {
          await this.$confirm('提交后不可修改、不可删除，请仔细核对后提交。', '二次确认', { type: 'warning' })
          const addRecordApi = this.api('addRecord')
          if (!addRecordApi || !this.followUpRecord) throw new Error('missing add record api')
          this.followUpSubmitting = true
          await addRecordApi(this.followUpPayload())
          this.$message.success('跟进记录提交成功')
          this.followUpVisible = false
          await this.loadRecords()
        } catch (error) {
          if (error !== 'cancel' && error !== 'close') this.$message.error('跟进记录提交失败，请稍后重试')
        } finally {
          this.followUpSubmitting = false
        }
      })
    },
    async openFollowUpDetail(record) {
      if (!record || !record.id) return
      this.followUpDetail = record
      this.followUpDetailVisible = true
      const detailApi = this.api('queryRecordById')
      if (!detailApi) return
      this.followUpDetailLoading = true
      try {
        const detail = this.unwrap(await detailApi({ id: record.id }))
        if (detail) this.followUpDetail = Object.assign({}, record, detail)
      } catch (error) {
        this.$message.error('跟进记录详情加载失败')
      } finally {
        this.followUpDetailLoading = false
      }
    },
    followUpDetailValue(key) {
      if (!this.followUpDetail) return '-'
      if (key === 'followUpMethod') return this.followUpMethodLabel(this.followUpDetail[key])
      if (key === 'followUpTime') return this.formatDateTime(this.followUpDetail[key])
      if (key === 'intentLevel') return this.intentLevelLabel(this.followUpDetail[key])
      if (key === 'leadStatus') return this.leadStatusLabel(this.followUpDetail[key])
      if (key === 'nextFollowUpTime') return this.formatDateTime(this.followUpDetail[key])
      if (key === 'expectedMoveInDate') return this.formatDateTime(this.followUpDetail[key])
      const value = this.followUpDetail[key]
      return value === undefined || value === null || value === '' ? '-' : value
    },
    followUpDetailUploadFiles() {
      if (!this.followUpDetail) return []
      let files = this.followUpDetail.uploadFiles || this.followUpDetail.attachmentFiles || []
      if (typeof files === 'string') {
        try {
          files = JSON.parse(files)
        } catch (error) {
          files = []
        }
      }
      if (!Array.isArray(files)) files = files ? [files] : []
      return files.filter(Boolean).map((file, index) => {
        if (typeof file === 'string') return { name: `附件${index + 1}`, filePath: file, url: file }
        const filePath = file.filePath || file.fileUrl || file.url || ''
        return Object.assign({}, file, {
          id: file.id || file.attachmentId || file.fileId,
          name: file.name || file.fileName || file.originalName || filePath.split(/[\\/]/).pop() || `附件${index + 1}`,
          filePath,
          url: file.url || file.fileUrl || filePath
        })
      })
    },
    async downloadFollowUpAttachment(file) {
      const attachmentId = file && (file.id || file.attachmentId || file.fileId)
      if (!attachmentId) {
        this.$message.warning('该附件缺少附件 ID，暂时无法下载')
        return
      }
      const downloadApi = this.$api && this.$api['attachment.download']
      if (!downloadApi) {
        this.$message.error('未找到附件下载接口')
        return
      }
      try {
        const response = await downloadApi({ attachmentId }, { responseType: 'blob' })
        const responseData = response && response.data !== undefined ? response.data : response
        const blob = responseData instanceof Blob ? responseData : new Blob([responseData], { type: file.fileType || 'application/octet-stream' })
        const objectUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = file.fileName || file.name || '附件'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(objectUrl)
      } catch (error) {
        this.$message.error('附件下载失败，请稍后重试')
      }
    },
    isConfirmed(record) {
      return String(record && record.status) === String(this.confirmStatus) || ['已确认', '确认'].includes(record && record.status)
    },
    isAllocated(record) {
      return Number(record && record.status) === 1
    },
    async openAllocation(record) {
      this.allocationRecord = record
      this.allocationForm = {
        userId: record.responsiblePerson || '',
        reason: ''
      }
      this.allocationUsers = []
      this.allocationVisible = true
      this.$nextTick(() => this.$refs.allocationForm && this.$refs.allocationForm.clearValidate())
      const userListApi = this.api('getUserList')
      if (!userListApi) return
      this.allocationUsersLoading = true
      try {
        const result = this.unwrap(await userListApi())
        this.allocationUsers = this.allocationUsersFrom(result)
      } catch (error) {
        this.$message.error('人员列表加载失败，请稍后重试')
      } finally {
        this.allocationUsersLoading = false
      }
    },
    resetAllocation() {
      this.allocationRecord = null
      this.allocationForm = {
        userId: '',
        reason: ''
      }
      this.allocationUsers = []
      this.allocatingId = ''
    },
    allocationUsersFrom(result) {
      if (Array.isArray(result)) return result
      return result && (result.records || result.list || result.rows || result.userList || result.data) ? result.records || result.list || result.rows || result.userList || result.data : []
    },
    allocationUserIdOf(user) {
      return user && (user.id || user.userId)
    },
    allocationUserLabel(user) {
      return (user && (user.realName || user.userName || user.nickName || user.name)) || this.allocationUserIdOf(user)
    },
    handleAllocationUserChange(userId) {
      if (!this.allocationRecord || !this.isAllocated(this.allocationRecord)) return
      if (String(userId) !== String(this.allocationRecord.responsiblePerson || '')) return
      this.$message.warning('新负责人不能与当前负责人相同，请重新选择')
      this.allocationForm.userId = ''
      this.$nextTick(() => this.$refs.allocationForm && this.$refs.allocationForm.validateField('userId'))
    },
    async openAllocationHistory(record) {
      this.allocationHistoryRecord = record
      this.allocationHistory = []
      this.allocationHistoryPage = 1
      this.allocationHistoryVisible = true
      const historyApi = this.api('queryHistoryByParentId')
      if (!historyApi) {
        this.$message.error('分配历史接口未配置')
        return
      }
      this.allocationHistoryLoading = true
      try {
        const result = this.unwrap(await historyApi({ id: record.id }))
        this.allocationHistory = this.allocationHistoryFrom(result)
      } catch (error) {
        this.$message.error('分配历史加载失败，请稍后重试')
      } finally {
        this.allocationHistoryLoading = false
      }
    },
    resetAllocationHistory() {
      this.allocationHistoryRecord = null
      this.allocationHistory = []
      this.allocationHistoryPage = 1
      this.allocationHistoryLoading = false
    },
    allocationHistoryFrom(result) {
      if (Array.isArray(result)) return result
      if (!result) return []
      return result.records || result.list || result.rows || result.historyList || []
    },
    allocationHistoryPreviousAssignee(record) {
      return record.oldResponsiblePersonName || record.previousResponsiblePersonName || record.beforeUserName || record.oldUserName || '-'
    },
    allocationHistoryAssignee(record) {
      return record.responsiblePersonName || record.newResponsiblePersonName || record.afterUserName || record.userName || record.realName || record.userId || '-'
    },
    allocationHistoryReason(record) {
      return record.reason || record.allocationReason || record.reassignReason || record.remark || '-'
    },
    allocationHistoryOperator(record) {
      return record.createdByName || record.createByName || record.operatorName || record.creatorName || record.createdBy || record.createBy || '-'
    },
    allocationHistoryTime(record) {
      return this.formatDateTime(record.allocationTime || record.createTime || record.createdTime || record.updateTime)
    },
    allocationHistoryRowIndex(index) {
      return this.allocationHistoryGlobalIndex(index) + 1
    },
    allocationHistoryGlobalIndex(index) {
      return (this.allocationHistoryPage - 1) * this.allocationHistoryPageSize + index
    },
    handleAllocationHistoryPageChange(page) {
      this.allocationHistoryPage = page
    },
    isFirstAllocation(index) {
      if (!this.allocationHistory.length) return false
      let firstIndex = 0
      let earliestTime = Infinity
      let hasValidTime = false
      this.allocationHistory.forEach((record, recordIndex) => {
        const rawTime = record.allocationTime || record.createTime || record.createdTime || record.updateTime
        const timestamp = rawTime ? Date.parse(String(rawTime).replace(' ', 'T')) : NaN
        if (!Number.isNaN(timestamp) && timestamp < earliestTime) {
          earliestTime = timestamp
          firstIndex = recordIndex
          hasValidTime = true
        }
      })
      return index === (hasValidTime ? firstIndex : 0)
    },
    submitAllocation() {
      const record = this.allocationRecord
      if (!record || this.allocatingId) return
      this.$refs.allocationForm.validate(async (valid) => {
        if (!valid) return
        const userId = this.allocationForm.userId
        const reassigning = this.isAllocated(record)
        if (reassigning && String(userId) === String(record.responsiblePerson || '')) {
          this.$message.warning('新负责人不能与当前负责人相同，请重新选择')
          return
        }
        const allocationApi = this.api('allocation')
        const editApi = this.api('edit')
        if (!allocationApi || !editApi) return
        const payload = {
          id: record.id,
          userId,
          reason: reassigning ? this.allocationForm.reason.trim() : ''
        }
        this.allocatingId = record.id
        try {
          await allocationApi(payload)
          await editApi({ id: record.id, status: 1 })
          this.$message.success(reassigning ? '重新分配成功' : '分配成功')
          this.allocationVisible = false
          await this.loadRecords()
        } catch (error) {
          this.$message.error(reassigning ? '重新分配失败，请稍后重试' : '分配失败，请稍后重试')
        } finally {
          this.allocatingId = ''
        }
      })
    },
    async confirmRecord(record) {
      if (!record || this.isConfirmed(record) || this.confirmingId) return
      try {
        await this.$confirm('确认后将无法撤销，是否继续？', '二次确认', { type: 'warning' })
        const editApi = this.api('edit')
        if (!editApi) throw new Error('missing edit api')
        this.confirmingId = record.id
        await editApi({ id: record.id, status: this.confirmStatus })
        this.$message.success('已标记为确认')
        await this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('标记确认失败，请稍后重试')
      } finally {
        this.confirmingId = ''
      }
    }
  }
}
</script>

<style lang="scss" src="../../../../features/_shared/record-management/record-feature-page.scss"></style>

<style lang="scss" scoped>
.record-feature-card .online-consultation-card__question {
  display: -webkit-box;
  min-height: 72px;
  margin: 18px 0 16px;
  overflow: hidden;
  color: #22324a;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.online-consultation-card__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  background: #f8fafc;
}

.online-consultation-card__meta-item {
  min-width: 0;

  small,
  span {
    display: block;
  }

  small {
    margin-bottom: 5px;
    color: #8a98aa;
    font-size: 12px;
    line-height: 1.4;

    i {
      width: 16px;
      margin-right: 4px;
      color: #7c91ad;
      text-align: center;
    }
  }

  span {
    overflow: hidden;
    color: #44546a;
    font-size: 13px;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.record-feature-table--compact {
  ::v-deep > .el-table__body-wrapper > .el-table__body > tbody > .el-table__row.hover-row > td.el-table__cell,
  ::v-deep > .el-table__body-wrapper > .el-table__body > tbody > .el-table__row:hover > td.el-table__cell {
    background-color: #fff !important;
  }

  ::v-deep > .el-table__body-wrapper > .el-table__body > tbody > .el-table__row--striped.hover-row > td.el-table__cell,
  ::v-deep > .el-table__body-wrapper > .el-table__body > tbody > .el-table__row--striped:hover > td.el-table__cell {
    background-color: #fafafa !important;
  }

  ::v-deep > .el-table__body-wrapper > .el-table__body > tbody > tr > td.el-table__expanded-cell,
  ::v-deep > .el-table__body-wrapper > .el-table__body > tbody > tr:hover > td.el-table__expanded-cell {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    background-color: #f7f9fc !important;
  }
}

.lead-follow-up-history {
  padding: 14px 18px 10px;
  background: #f7f9fc;
}

.lead-follow-up-history__summary,
.lead-follow-up-history__title {
  display: flex;
  align-items: center;
}

.lead-follow-up-history__summary {
  justify-content: space-between;
  margin-bottom: 10px;
  color: #8a98aa;
  font-size: 12px;
}

.lead-follow-up-history__title {
  gap: 7px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;

  i {
    color: #409eff;
    font-size: 16px;
  }

  b {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: #e8f3ff;
    color: #409eff;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
  }
}

.lead-follow-up-history__table {
  border: 1px solid #e4ebf3;
  border-radius: 4px;

  ::v-deep .el-table__body tr {
    cursor: pointer;
  }

  ::v-deep .el-table__body td.el-table__cell,
  ::v-deep .el-table__body tr.hover-row > td.el-table__cell,
  ::v-deep .el-table__body tr:hover > td.el-table__cell {
    background-color: #fff !important;
    transition: none;
  }
}

.lead-follow-up-history__intent {
  display: block;
  color: #526176;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
}

.lead-summary-tag {
  max-width: 100%;
  border: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;

  &.lead-summary-tag--referral {
    color: #7e22ce;
    border-color: #e9d5ff;
    background: #faf5ff;
  }

  &.lead-summary-tag--online {
    color: #2563eb;
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.lead-summary-tag--event {
    color: #c2410c;
    border-color: #fed7aa;
    background: #fff7ed;
  }

  &.lead-summary-tag--visit {
    color: #0f766e;
    border-color: #99f6e4;
    background: #f0fdfa;
  }

  &.lead-summary-tag--partner {
    color: #0369a1;
    border-color: #bae6fd;
    background: #f0f9ff;
  }

  &.lead-summary-tag--operation,
  &.lead-summary-tag--other,
  &.lead-summary-tag--level-empty {
    color: #64748b;
    border-color: #cbd5e1;
    background: #f1f5f9;
  }

  &.lead-summary-tag--level-a {
    color: #b91c1c;
    border-color: #fecaca;
    background: #fef2f2;
  }

  &.lead-summary-tag--level-b {
    color: #c2410c;
    border-color: #fed7aa;
    background: #fff7ed;
  }

  &.lead-summary-tag--level-c {
    color: #a16207;
    border-color: #fde68a;
    background: #fefce8;
  }

  &.lead-summary-tag--level-d {
    color: #0f766e;
    border-color: #99f6e4;
    background: #f0fdfa;
  }

  &.lead-summary-tag--level-e {
    color: #2563eb;
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.lead-summary-tag--level-f {
    color: #64748b;
    border-color: #cbd5e1;
    background: #f8fafc;
  }
}

.lead-status-tag {
  border: 0;
  font-weight: 500;

  &.lead-status-tag--empty {
    color: #64748b;
    border-color: #cbd5e1;
    background: #f1f5f9;
  }

  &.lead-status-tag--initial {
    color: #2563eb;
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.lead-status-tag--confirmed {
    color: #0f766e;
    border-color: #99f6e4;
    background: #f0fdfa;
  }

  &.lead-status-tag--visit {
    color: #c2410c;
    border-color: #fed7aa;
    background: #fff7ed;
  }

  &.lead-status-tag--negotiation {
    color: #7e22ce;
    border-color: #e9d5ff;
    background: #faf5ff;
  }

  &.lead-status-tag--signed {
    color: #15803d;
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &.lead-status-tag--hold {
    color: #64748b;
    border-color: #cbd5e1;
    background: #f8fafc;
  }
}

.lead-empty-tag {
  color: #64748b !important;
  border: 0 !important;
  background: #f1f5f9 !important;
}

.lead-allocation-history__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #e8edf3;
  border-radius: 6px;
  background: #f8fafc;

  div,
  small,
  b {
    display: block;
  }

  div {
    min-width: 0;
  }

  small {
    margin-bottom: 4px;
    color: #8a98aa;
    font-size: 12px;
  }

  b {
    overflow: hidden;
    color: #334155;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.lead-allocation-history__table {
  width: 100%;
}

.lead-allocation-history__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.lead-allocation-history__first-tag {
  margin-left: 8px;
  vertical-align: middle;
}

.lead-follow-up-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
}

.lead-follow-up-form__wide {
  grid-column: 1 / -1;
}

.lead-follow-up-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.lead-follow-up-detail__item {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #edf1f6;
  border-radius: 4px;
  background: #f8fafc;

  small,
  b {
    display: block;
  }

  small {
    margin-bottom: 5px;
    color: #7d8998;
    font-size: 12px;
  }

  b {
    color: #334155;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    word-break: break-word;
  }
}

.lead-follow-up-detail__attachments {
  grid-column: 1 / -1;
}

.lead-follow-up-detail__file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;

  .el-button {
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.lead-allocation-action {
  width: 48px;
  padding-right: 0;
  padding-left: 0;
  white-space: nowrap;
}

.lead-follow-up-action--after-allocation {
  display: inline-block;
  margin-left: 8px;
}

@media (max-width: 760px) {
  .online-consultation-card__meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .lead-follow-up-form,
  .lead-follow-up-detail {
    grid-template-columns: 1fr;
  }

  .lead-follow-up-history {
    padding: 10px 12px 8px;
  }

  .lead-follow-up-history__summary > span {
    display: none;
  }
}
</style>

<style lang="scss">
.intention-inquiry-page.record-feature-page {
  padding: 12px;
  background: #f3f5f7;
}

.intention-inquiry-page .record-feature-hero--compact {
  min-height: 42px;
  padding: 0 10px;
  margin: 0;
  border: 0;
  border-radius: 4px 4px 0 0;
  box-shadow: none;
  background: #fff;
}

.intention-inquiry-page .record-feature-hero--compact .el-button--primary {
  padding: 8px 15px;
  border-color: #2399ce;
  border-radius: 3px;
  background: #2399ce;
}

.intention-inquiry-page .record-feature-surface {
  height: calc(100vh - 148px);
  min-height: 600px;
  padding: 8px 10px 10px;
  overflow: auto;
  border: 0;
  border-radius: 0 0 4px 4px;
  box-shadow: none;
}

.intention-inquiry-page.record-feature-page--read-only .record-feature-surface {
  height: calc(100vh - 100px);
  border-radius: 4px;
}

.intention-inquiry-page .record-feature-toolbar {
  justify-content: flex-end;
  min-height: 32px;
  margin-bottom: 6px;
}

.intention-inquiry-page .record-feature-toolbar > .el-input {
  width: min(360px, 100%);
}

.intention-inquiry-page .record-feature-table--compact {
  flex: 0 0 auto;
  border: 0;
  border-top: 1px solid #e8edef;
}

.intention-inquiry-page .record-feature-table--compact::before {
  display: none;
}

.intention-inquiry-page .record-feature-table--compact th {
  height: 48px;
  color: #27313d;
  font-weight: 600;
  background: #f4f8f9;
}

.intention-inquiry-page .record-feature-table--compact td {
  height: 48px;
}

.intention-inquiry-page .record-feature-table--compact .el-table__row {
  cursor: pointer;
}

.intention-inquiry-page .record-feature-table--compact .el-table__body-wrapper {
  overflow-x: hidden !important;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.intention-inquiry-page .record-feature-table--compact .el-table__body-wrapper::-webkit-scrollbar {
  height: 0;
}

.lead-table-horizontal-scrollbar {
  position: sticky;
  bottom: 42px;
  z-index: 6;
  flex: 0 0 8px;
  align-self: stretch;
  height: 8px;
  margin-top: auto;
  border-radius: 8px;
  background: #f4f6f8;
  box-shadow: 0 -2px 8px rgba(36, 52, 71, 0.08);
  cursor: pointer;
}

.lead-table-horizontal-scrollbar__thumb {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #aeb6c2;
  cursor: pointer;
  transition: background-color 0.16s ease;

  &:hover {
    background: #8f9aa9;
  }

  &:active {
    cursor: grabbing;
    background: #778496;
  }
}

.lead-table-horizontal-scrollbar + .record-feature-pagination {
  margin-top: 0;
}

.intention-inquiry-page .record-feature-pagination {
  justify-content: flex-end;
  min-height: 32px;
  padding-top: 10px;
}

@media (max-width: 720px) {
  .intention-inquiry-page .record-feature-surface {
    height: auto;
    min-height: 440px;
  }
}
</style>
