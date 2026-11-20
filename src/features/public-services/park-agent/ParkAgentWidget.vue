<!-- P8 登录后全局挂载的园区 AI 助理，处理文字、录音及会话提交。 -->
<template>
  <aside
    ref="dock"
    class="park-agent-widget"
    :class="{ 'is-mobile': mobile, 'opens-below': opensBelow }"
    :style="{ '--park-lift': dockLift + 'px', '--park-panel-space': panelSpace + 'px', '--park-panel-gap': panelGap + 'px' }"
    aria-label="园区助手"
    @pointermove="moveDockDrag"
    @pointerup="endDockDrag"
    @pointercancel="endDockDrag"
    @lostpointercapture="endDockDrag"
    @keydown.esc.stop="requestClose">
    <section v-if="expanded" id="park-agent-panel" class="park-agent-panel" role="dialog" aria-labelledby="park-agent-title">
      <header class="park-agent-header" @pointerdown="startDockDrag">
        <span v-if="!historyView && !careOpen" class="park-agent-emblem" aria-hidden="true"><i class="el-icon-chat-dot-round"></i></span>
        <button v-else class="park-agent-icon-button" type="button" title="返回" aria-label="返回" @pointerdown.stop @click="careOpen ? closeCare() : backFromHistory()">
          <i class="el-icon-arrow-left" aria-hidden="true"></i>
        </button>
        <h2 id="park-agent-title" ref="heading" tabindex="-1">{{ panelTitle }}</h2>
        <button v-if="!historyView && !careOpen" class="park-agent-speech" type="button" :aria-pressed="String(speechEnabled)" aria-label="语音播报" @pointerdown.stop @click="toggleSpeech">
          语音{{ speechEnabled ? '开' : '关' }}
        </button>
        <button
          v-if="!historyView && !careOpen"
          class="park-agent-icon-button park-agent-care-button"
          type="button"
          title="企业关怀"
          :aria-label="careUnread ? `企业关怀，${careUnread} 条未读` : '企业关怀'"
          :disabled="Boolean(busy) || recordingState !== 'idle'"
          @pointerdown.stop
          @click="openCare">
          <i class="el-icon-bell" aria-hidden="true"></i>
          <span v-if="careUnread" class="park-agent-care-dot" aria-hidden="true"></span>
        </button>
        <button v-if="!historyView && !careOpen" class="park-agent-icon-button" type="button" title="历史记录" aria-label="历史记录" :disabled="Boolean(busy)" @pointerdown.stop @click="openHistory">
          <i class="el-icon-time" aria-hidden="true"></i>
        </button>
        <button class="park-agent-icon-button" type="button" title="关闭园区助手" aria-label="关闭园区助手" @pointerdown.stop @click="requestClose">
          <i class="el-icon-close" aria-hidden="true"></i>
        </button>
      </header>
      <div v-if="careOpen" class="park-agent-history park-agent-care-list">
        <p v-if="careActionError" class="park-agent-feedback is-error" role="alert">{{ careActionError }}</p>
        <p v-if="careLoadError" class="park-agent-feedback is-error" role="alert">{{ careLoadError }}</p>
        <button v-if="careLoadError" class="park-agent-finish" type="button" :disabled="careLoading || Boolean(careAction)" @click="refreshCare">重试</button>
        <p v-else-if="!careMessages.length && !careLoading && !careAction" class="park-agent-feedback">暂无企业关怀消息。</p>
        <p v-if="careLoading && !careMessages.length" class="park-agent-feedback" role="status">正在读取关怀消息…</p>
        <p v-if="careAction" class="park-agent-feedback" role="status">正在处理关怀消息…</p>
        <p v-if="careHasActiveChat && careMessages.some((item) => !canOpenCare(item))" class="park-agent-feedback park-agent-care-note">请先结束当前会话，或处理未发送的草稿，再打开其他关怀会话。</p>
        <article v-for="item in careMessages" :key="item.id" class="park-agent-care-item">
          <strong>{{ item.enterprise_name }}</strong>
          <div class="park-agent-history-meta">
            <time :datetime="item.created_at">{{ historyDate(item.created_at) }}</time>
            <small :class="{ 'is-submitted': item.status === 'pending' }">{{ item.status === 'pending' ? '未读' : '已读' }}</small>
          </div>
          <p class="park-agent-care-message">{{ item.text }}</p>
          <div class="park-agent-care-actions">
            <button class="park-agent-action park-agent-primary" type="button" :disabled="Boolean(careAction) || !canOpenCare(item)" @click="updateCare(item, 'open')">
              {{ item.status === 'opened' ? '查看会话' : '打开会话' }}
            </button>
            <button class="park-agent-finish" type="button" :disabled="Boolean(careAction)" @click="updateCare(item, 'dismiss')">忽略</button>
            <button v-if="item.plan_id" class="park-agent-finish" type="button" :disabled="Boolean(careAction)" @click="updateCare(item, 'pause')">暂停关怀</button>
          </div>
        </article>
      </div>
      <div v-else-if="historyView === 'list'" class="park-agent-history">
        <p v-if="historyError" class="park-agent-feedback is-error" role="alert">{{ historyError }}</p>
        <p v-if="!historyItems.length && !historyBusy && !historyError" class="park-agent-feedback">暂无已结束的会话。</p>
        <button v-for="item in historyItems" :key="item.id" class="park-agent-history-row" type="button" :disabled="historyBusy" @click="openHistoryEntry(item.id)">
          <span class="park-agent-history-title">{{ item.title || '园区咨询' }}</span>
          <span class="park-agent-history-meta">
            <time :datetime="item.closed_at">{{ historyDate(item.closed_at) }}</time>
            <small :class="{ 'is-submitted': item.submitted }">{{ item.submitted ? '已转达' : '已关闭' }}</small>
          </span>
          <i class="el-icon-arrow-right" aria-hidden="true"></i>
        </button>
        <p v-if="historyBusy" class="park-agent-feedback" role="status">正在读取历史记录…</p>
        <button v-else-if="historyHasMore || (historyError && !historyItems.length)" class="park-agent-finish" type="button" @click="loadHistory">
          {{ historyError && !historyItems.length ? '重试' : '加载更多' }}
        </button>
      </div>
      <div v-else ref="transcript" class="park-agent-transcript" role="log" aria-label="对话记录" tabindex="0" @scroll="onTranscriptScroll" @wheel.passive="onTranscriptWheel">
        <div v-if="!historyView && !careSession" class="park-agent-message">你好，我是园区 AI 助理。你可以咨询园区服务，也可以告诉我需要园区处理的事项。</div>
        <div v-if="!historyView && !messages.length && !ended && !busy" class="park-agent-suggestions" aria-label="常见咨询">
          <button type="button" :disabled="busy || recordingState !== 'idle'" @click="useSuggestion('物业怎么报修？')">物业怎么报修？</button>
          <button type="button" :disabled="busy || recordingState !== 'idle'" @click="useSuggestion('续租需要哪些材料？')">续租需要哪些材料？</button>
        </div>
        <div v-for="message in displayedMessages" :key="message.id" class="park-agent-message" :class="{ 'is-user': message.role === 'user' }">
          <p>{{ message.text }}</p>
          <audio v-if="message.audioUrl" :src="message.audioUrl" controls preload="none" aria-label="播放语音回复"></audio>
        </div>
        <div v-if="!historyView && streamUser" class="park-agent-message is-user">
          <p>{{ streamUser }}</p>
        </div>
        <div v-if="!historyView && streamReply" class="park-agent-message">
          <p>{{ streamReply }}</p>
        </div>
        <div v-if="!historyView && busy && !streamReply" class="park-agent-progress" role="status">{{ progressText }}</div>
        <div v-if="!historyView && ended" class="park-agent-receipt">
          <strong>
            <i class="el-icon-circle-check" aria-hidden="true"></i>
            {{ submitted ? '本次沟通已提交' : '本次会话已关闭' }}
          </strong>
          <ul v-if="assessmentItems.length">
            <li v-for="(item, index) in assessmentItems" :key="index">
              <span>{{ actionLabel(item) }}</span>
              <p>{{ item.summary }}</p>
            </li>
          </ul>
          <p v-else>会话记录已保存。</p>
        </div>
      </div>
      <footer v-if="historyView === 'entry'" class="park-agent-footer">
        <p v-if="historyError" class="park-agent-feedback is-error" role="alert">{{ historyError }}</p>
        <div class="park-agent-actions park-agent-history-actions">
          <p class="park-agent-feedback">{{ historyEntry.submitted ? '已转达 · 仅供回看' : '会话已关闭 · 仅供回看' }}</p>
          <button v-if="!historyEntry.submitted" class="park-agent-action park-agent-primary" type="button" :disabled="historyForwarding" @click="forwardHistory">
            {{ historyForwarding ? '正在转达…' : '转达负责人' }}
          </button>
        </div>
      </footer>
      <footer v-else-if="!historyView && !careOpen" class="park-agent-footer">
        <p v-if="errorText" class="park-agent-feedback is-error" role="alert">{{ errorText }}</p>
        <template v-if="ended || sessionUnavailable">
          <button class="park-agent-action park-agent-primary" type="button" @click="newSession">开启新会话</button>
        </template>
        <template v-else>
          <form class="park-agent-compose" @submit.prevent="sendText">
            <textarea
              ref="draft"
              v-model="draft"
              rows="2"
              maxlength="6000"
              aria-label="输入消息"
              placeholder="输入消息，或点击录音"
              :readonly="Boolean(busy) || recordingState !== 'idle'"
              @keydown.enter="handleEnter"></textarea>
            <div class="park-agent-actions">
              <button
                class="park-agent-action park-agent-voice"
                :class="{ 'is-recording': recordingState === 'recording' }"
                :disabled="busy || recordingState === 'stopping'"
                type="button"
                @click="toggleRecording">
                <i :class="recordingState === 'recording' ? 'el-icon-video-pause' : 'el-icon-microphone'" aria-hidden="true"></i>
                {{ recordingLabel }}
              </button>
              <button v-if="hasUserTurn" class="park-agent-finish park-agent-end" type="button" :disabled="busy || recordingState !== 'idle'" @click="confirmEnd(false)">结束会话</button>
              <button v-else-if="careSession" class="park-agent-finish park-agent-end" type="button" :disabled="busy || recordingState !== 'idle' || Boolean(draft.trim())" @click="newSession()">
                退出关怀
              </button>
              <button class="park-agent-action park-agent-primary park-agent-send" :disabled="!canSendText" type="submit">
                <i class="el-icon-position" aria-hidden="true"></i>
                发送
              </button>
            </div>
          </form>
          <p v-if="recordingState === 'recording'" class="park-agent-feedback" role="status">正在录音，最长 60 秒</p>
        </template>
      </footer>
    </section>
    <button
      ref="launcher"
      class="park-agent-launcher"
      type="button"
      title="拖动或按上下方向键移动"
      aria-keyshortcuts="ArrowUp ArrowDown"
      :aria-label="careUnread ? `园区助手，${careUnread} 条未读关怀消息` : '园区助手'"
      :aria-expanded="String(expanded)"
      :aria-controls="expanded ? 'park-agent-panel' : null"
      @pointerdown="startDockDrag"
      @keydown.up.prevent="moveDockByKey(32)"
      @keydown.down.prevent="moveDockByKey(-32)"
      @click="togglePanel">
      <i :class="expanded ? 'el-icon-close' : 'el-icon-chat-dot-round'" aria-hidden="true"></i>
      园区助手
      <span v-if="careUnread" class="park-agent-care-badge" aria-hidden="true">{{ careUnread > 99 ? '99+' : careUnread }}</span>
    </button>
  </aside>
</template>

<script>
import { canRecordAudio, recordingErrorMessage, startParkRecording } from './recording'
import { createSpeechPlayback } from './speechPlayback'
import { requestParkAgentCare, streamParkAgentTurn } from '@/service/api/modules/parkAgent'

const MAX_AUDIO_BYTES = 10 * 1024 * 1024
const DRAG_THRESHOLD = 5
const VIEWPORT_MARGIN = 12
const PANEL_GAP = 8
const CARE_POLL_INTERVAL = 60000
const ACTION_LABELS = {
  archive: '已记录',
  department_task: '待部门处理',
  boss_notification: '待园区负责人处理',
  boss_digest: '已纳入园区汇总',
  manual_review: '待人工复核'
}
const PROGRESS_LABELS = {
  text: '正在获取回复…',
  voice: '正在转写录音并获取回复…',
  finish: '正在整理并提交本次沟通…'
}

export default {
  name: 'ParkAgentWidget',
  props: {
    mobile: { type: Boolean, default: false }
  },
  data() {
    return {
      expanded: false,
      speechEnabled: false,
      dockLift: 0,
      opensBelow: false,
      panelSpace: 0,
      panelGap: PANEL_GAP,
      streamUser: '',
      streamReply: '',
      sessionId: '',
      sessionUnavailable: false,
      messages: [],
      draft: '',
      busy: '',
      errorText: '',
      recordingState: 'idle',
      ended: false,
      submitted: false,
      autoScroll: true,
      historyView: '',
      historyItems: [],
      historyMessages: [],
      historyEntry: null,
      historyForwarding: false,
      historyBusy: false,
      historyError: '',
      historyHasMore: false,
      careOpen: false,
      careSession: false,
      careMessages: [],
      careLoading: false,
      careLoadError: '',
      careActionError: '',
      careAction: '',
      assessmentItems: []
    }
  },
  computed: {
    panelTitle() {
      if (this.careOpen) return '企业关怀'
      return this.historyView ? '历史记录' : '园区 AI 助理'
    },
    careUnread() {
      return this.careMessages.filter((item) => item.status === 'pending').length
    },
    hasUserTurn() {
      return this.messages.some((message) => message.role === 'user')
    },
    careHasActiveChat() {
      return Boolean(this.draft.trim() || (!this.ended && !this.sessionUnavailable && this.hasUserTurn))
    },
    displayedMessages() {
      return this.historyView === 'entry' ? this.historyMessages : this.messages
    },
    canSendText() {
      return Boolean(this.draft.trim() && !this.busy && this.recordingState === 'idle' && !this.ended)
    },
    progressText() {
      return PROGRESS_LABELS[this.busy]
    },
    recordingLabel() {
      if (this.recordingState === 'recording') return '停止并发送'
      if (this.recordingState === 'permission') return '取消录音'
      if (this.recordingState === 'stopping') return '正在结束录音'
      return '录音'
    }
  },
  watch: {
    dockLift() {
      if (this.expanded) this.$nextTick(this.positionPanel)
    },
    mobile() {
      this.fitDock()
    }
  },
  created() {
    this._lastScrollTop = 0
    this._historyVersion = 0
    this._careViewVersion = 0
    this._careReturnFromHistory = false
    this._endConfirmation = false
    this._speechVersion = 0
    this._speech = createSpeechPlayback(() => {
      if (!this._parkDisposed && this.speechEnabled) this.errorText = '浏览器暂时无法播放语音，可以继续查看文字。'
    })
    this._dockDrag = null
    this._skipLauncherClick = false
    this._captureVersion = 0
    this._recorder = null
    this._captureTimer = null
    this._parkDisposed = false
  },
  mounted() {
    window.addEventListener('resize', this.fitDock)
    this.refreshCare()
    this._careTimer = setInterval(this.refreshCare, CARE_POLL_INTERVAL)
  },
  beforeDestroy() {
    this._parkDisposed = true
    clearInterval(this._careTimer)
    this._carePoll?.abort()
    this._careWrite?.abort()
    this._turnAbort?.abort()
    this._speech.close()
    window.removeEventListener('resize', this.fitDock)
    this.cancelRecording()
    this.disposeAudio()
  },
  methods: {
    stopSpeech() {
      this._speechVersion++
      this._speech.stop()
    },
    toggleSpeech() {
      if (this.speechEnabled) {
        this.speechEnabled = false
        this.stopSpeech()
        return
      }
      this.speechEnabled = this._speech.enable()
      if (!this.speechEnabled) this.errorText = '当前浏览器无法播放助手语音。'
    },
    startDockDrag(event) {
      if (!event.isPrimary || event.button !== 0 || this._dockDrag) return
      this._skipLauncherClick = false
      this._dockDrag = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLift: this.dockLift,
        maxLift: this.maxDockLift(),
        moved: false,
        fromLauncher: event.currentTarget === this.$refs.launcher
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    moveDockDrag(event) {
      const drag = this._dockDrag
      if (!drag || drag.id !== event.pointerId) return
      const lift = drag.startY - event.clientY
      if (!drag.moved && Math.max(Math.abs(lift), Math.abs(drag.startX - event.clientX)) < DRAG_THRESHOLD) return
      drag.moved = true
      this.dockLift = Math.max(0, Math.min(drag.maxLift, drag.startLift + lift))
    },
    endDockDrag(event) {
      const drag = this._dockDrag
      if (!drag || drag.id !== event.pointerId) return
      this._skipLauncherClick = drag.fromLauncher && drag.moved
      this._dockDrag = null
    },
    maxDockLift() {
      const dock = this.$refs.dock
      const launcher = this.$refs.launcher
      if (!dock || !launcher) return 0
      const renderedLift = parseFloat(dock.style.getPropertyValue('--park-lift')) || 0
      return Math.max(0, launcher.getBoundingClientRect().top + renderedLift - VIEWPORT_MARGIN)
    },
    positionPanel() {
      const launcher = this.$refs.launcher
      if (!launcher || !this.expanded) return
      const rect = launcher.getBoundingClientRect()
      const above = rect.top - VIEWPORT_MARGIN - PANEL_GAP
      const below = document.documentElement.clientHeight - rect.bottom - VIEWPORT_MARGIN - PANEL_GAP
      this.opensBelow = below > above
      this.panelSpace = Math.max(0, this.opensBelow ? below : above)
    },
    moveDockByKey(step) {
      this.dockLift = Math.max(0, Math.min(this.maxDockLift(), this.dockLift + step))
    },
    fitDock() {
      this.$nextTick(() => {
        const maxLift = this.maxDockLift()
        this.dockLift = Math.min(maxLift, this.dockLift)
        if (this._dockDrag) this._dockDrag.maxLift = maxLift
        this.positionPanel()
      })
    },
    togglePanel(event) {
      if (this._skipLauncherClick && event.detail) {
        this._skipLauncherClick = false
        return
      }
      if (this.expanded) {
        this.requestClose()
        return
      }
      this.expanded = true
      this.positionPanel()
      this.refreshCare()
      this.$nextTick(() => {
        this.$refs.heading?.focus()
        this.scrollTranscript()
      })
    },
    requestClose() {
      if (!this.expanded || this._endConfirmation) return
      if (this.careOpen) return this.collapsePanel()
      if (this.busy) {
        this.errorText = this.busy === 'finish' ? '正在结束会话，请稍候。' : '正在生成回复，请等本轮完成后关闭。'
        return
      }
      if (!this.ended && !this.sessionUnavailable && this.hasUserTurn) return this.confirmEnd(true)
      this.collapsePanel()
      if (this.ended || this.sessionUnavailable) this.newSession(false)
    },
    collapsePanel() {
      if (!this.expanded) return
      this.stopSpeech()
      this.cancelRecording()
      this.$refs.transcript?.querySelectorAll('audio').forEach((audio) => audio.pause())
      this._historyVersion++
      this._careViewVersion++
      this.careOpen = false
      this.historyView = ''
      this.historyBusy = false
      this.expanded = false
      this.$nextTick(() => this.$refs.launcher?.focus())
    },
    openHistory() {
      this.stopSpeech()
      this.cancelRecording()
      this._careReturnFromHistory = false
      this.historyView = 'list'
      this.historyItems = []
      this.historyHasMore = false
      this.loadHistory()
      this.$nextTick(() => this.$refs.heading?.focus())
    },
    async loadHistory() {
      const version = ++this._historyVersion
      this.historyBusy = true
      this.historyError = ''
      try {
        const result = await this.$api['parkAgent.listSessions']({ limit: 20, offset: this.historyItems.length })
        if (this._parkDisposed || version !== this._historyVersion) return
        if (!Array.isArray(result?.items)) throw new Error('invalid-history')
        this.historyItems = this.historyItems.concat(result.items)
        this.historyHasMore = Boolean(result.has_more)
      } catch {
        if (!this._parkDisposed && version === this._historyVersion) this.historyError = '历史记录读取失败，请重试。'
      } finally {
        if (!this._parkDisposed && version === this._historyVersion) this.historyBusy = false
      }
    },
    async openHistoryEntry(sessionId) {
      const version = ++this._historyVersion
      this.historyBusy = true
      this.historyError = ''
      try {
        const result = await this.$api['parkAgent.getSession']({ sessionId })
        if (this._parkDisposed || version !== this._historyVersion) return
        if (result?.status !== 'closed' || !Array.isArray(result.history)) throw new Error('invalid-history')
        this.showHistoryEntry(sessionId, result)
      } catch {
        if (!this._parkDisposed && version === this._historyVersion) this.historyError = '这条会话暂时无法打开，请重新选择。'
      } finally {
        if (!this._parkDisposed && version === this._historyVersion) this.historyBusy = false
      }
    },
    showHistoryEntry(sessionId, result) {
      this.historyMessages = this.sessionMessages(result.history)
      this.historyEntry = { id: sessionId, submitted: result.assessment?.submitted !== false }
      this.historyView = 'entry'
      this.$nextTick(() => {
        if (this.$refs.transcript) this.$refs.transcript.scrollTop = 0
        this.$refs.heading?.focus()
      })
    },
    async forwardHistory() {
      const entry = this.historyEntry
      if (!entry || entry.submitted || this.historyForwarding) return
      const version = this._historyVersion
      this.historyForwarding = true
      this.historyError = ''
      try {
        await this.$confirm('将这条历史会话的内容转达给园区负责人？', '转达历史会话', {
          confirmButtonText: '确认转达',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'info'
        })
      } catch {
        this.historyForwarding = false
        return
      }
      try {
        if (this._parkDisposed || version !== this._historyVersion) return
        const result = await this.$api['parkAgent.forwardSession']({ sessionId: entry.id })
        if (result?.assessment?.submitted !== true) throw new Error('invalid-forward')
        const row = this.historyItems.find((item) => item.id === entry.id)
        if (row) row.submitted = true
        if (this.historyEntry?.id === entry.id) this.historyEntry.submitted = true
      } catch {
        if (!this._parkDisposed && version === this._historyVersion) this.historyError = '暂时无法确认转达结果，请重试。'
      } finally {
        this.historyForwarding = false
      }
    },
    backFromHistory() {
      this._historyVersion++
      this.historyBusy = false
      this.historyError = ''
      if (this._careReturnFromHistory) {
        this._careReturnFromHistory = false
        this.historyView = ''
        this.openCare()
        return
      }
      this.historyView = this.historyView === 'entry' ? 'list' : ''
      this.$nextTick(() => {
        this.$refs.heading?.focus()
        this.scrollTranscript()
      })
    },
    historyDate(value) {
      const date = new Date(value)
      if (!value || Number.isNaN(date.getTime())) return ''
      return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    async refreshCare() {
      const token = this.$store.getters.token
      if (!token || this._parkDisposed || this._carePoll || this.careAction) return
      const controller = new AbortController()
      this._carePoll = controller
      this.careLoading = true
      try {
        const result = await requestParkAgentCare('/messages', { token, controller })
        if (this._parkDisposed || this._carePoll !== controller || token !== this.$store.getters.token) return
        if (!Array.isArray(result?.items)) throw new Error('invalid-care-messages')
        this.careMessages = result.items
        this.careLoadError = ''
      } catch (error) {
        if (this._parkDisposed || this._carePoll !== controller || token !== this.$store.getters.token) return
        if (error?.status === 401 || error?.status === 403) this.careMessages = []
        this.careLoadError = '关怀消息暂时无法读取，请重试。'
      } finally {
        if (!this._parkDisposed && this._carePoll === controller) {
          this._carePoll = null
          this.careLoading = false
        }
      }
    },
    openCare() {
      if (this.busy || this.recordingState !== 'idle') return
      this.stopSpeech()
      this._careScrollTop = this.$refs.transcript?.scrollTop
      this.careActionError = ''
      this.careOpen = true
      this.refreshCare()
      this.$nextTick(() => this.$refs.heading?.focus())
    },
    closeCare() {
      this._careViewVersion++
      this.careOpen = false
      this.$nextTick(() => {
        this.$refs.heading?.focus()
        if (this.$refs.transcript && this._careScrollTop !== undefined) this.$refs.transcript.scrollTop = this._careScrollTop
      })
    },
    canOpenCare(item) {
      return !this.careHasActiveChat || Boolean(this.sessionId && item.session_id === this.sessionId)
    },
    async updateCare(item, action) {
      const token = this.$store.getters.token
      if (!token || !this.careOpen || this.careAction || (action === 'open' && !this.canOpenCare(item))) return
      const version = this._careViewVersion
      const controller = new AbortController()
      this._careWrite = controller
      this._carePoll?.abort()
      this._carePoll = null
      this.careLoading = false
      this.careAction = action
      this.careActionError = ''
      const path = action === 'pause' ? `/plans/${encodeURIComponent(item.plan_id)}/pause` : `/messages/${encodeURIComponent(item.id)}/${action}`
      const body = action === 'open' ? { profile: this.sessionProfile() } : {}
      try {
        const result = await requestParkAgentCare(path, { token, controller, body })
        if (this._parkDisposed || token !== this.$store.getters.token) return
        const sameView = version === this._careViewVersion
        if (action === 'open') {
          if (!result?.id || !['open', 'closed'].includes(result.status)) throw new Error('invalid-care-session')
          this.careMessages =
            result.status === 'closed'
              ? this.careMessages.filter((message) => message.id !== item.id)
              : this.careMessages.map((message) => (message.id === item.id ? { ...message, status: 'opened', session_id: result.id } : message))
          if (sameView) this.showCareSession(item, result)
        } else {
          if (result?.ok !== true) throw new Error('invalid-care-update')
          this.careMessages = this.careMessages.filter((message) => (action === 'pause' ? message.plan_id !== item.plan_id : message.id !== item.id))
          if (sameView) this.$nextTick(() => this.$refs.heading?.focus())
        }
      } catch {
        if (!this._parkDisposed && version === this._careViewVersion && token === this.$store.getters.token) {
          this.careActionError = '关怀消息操作未完成，请重试。'
        }
      } finally {
        this._careWrite = null
        if (!this._parkDisposed) {
          this.careAction = ''
          this.refreshCare()
        }
      }
    },
    sessionMessages(history) {
      return history.map((entry, id) => ({ id, role: entry.role, text: entry.content }))
    },
    showCareSession(item, session) {
      const history = Array.isArray(session.history) && session.history.length ? session.history : [{ role: 'assistant', content: session.opening_text || item.text }]
      this.careOpen = false
      if (session.status === 'closed') {
        if (session.id === this.sessionId && !this.applyAssessment(session)) this.ended = true
        this._careReturnFromHistory = true
        this.historyError = ''
        this.showHistoryEntry(session.id, { ...session, history })
        return
      }
      if (session.id !== this.sessionId) {
        this.newSession(false)
        this.sessionId = session.id
        this.messages = this.sessionMessages(history)
      }
      this.careSession = true
      this.autoScroll = true
      this.$nextTick(() => {
        this.scrollTranscript()
        this.$refs.heading?.focus()
      })
    },
    useSuggestion(text) {
      this.draft = text
      this.$refs.draft?.focus()
    },
    handleEnter(event) {
      if (event.shiftKey || event.isComposing || event.keyCode === 229) return
      event.preventDefault()
      this.sendText()
    },
    actionLabel(item) {
      if (item.action === 'department_task' && item.recipient) return `待${item.recipient}处理`
      return ACTION_LABELS[item.action] || ACTION_LABELS.manual_review
    },
    scrollTranscript() {
      const transcript = this.$refs.transcript
      if (!transcript || !this.autoScroll || this.historyView) return
      transcript.scrollTop = transcript.scrollHeight
      this._lastScrollTop = transcript.scrollTop
    },
    onTranscriptWheel(event) {
      if (this.busy && this.busy !== 'finish' && event.deltaY < 0) this.autoScroll = false
    },
    onTranscriptScroll(event) {
      const top = event.target.scrollTop
      if (this.busy && this.busy !== 'finish' && top < this._lastScrollTop - 1) this.autoScroll = false
      this._lastScrollTop = top
    },
    sessionProfile() {
      const userInfo = this.$store.getters.userInfo || {}
      const profile = {}
      for (const [field, value] of Object.entries({ realName: userInfo.realName, departmentName: userInfo.departmentName })) {
        if (typeof value === 'string' && value.trim()) profile[field] = Array.from(value.trim()).slice(0, 120).join('')
      }
      return profile
    },
    async ensureSession() {
      if (this.sessionId) return this.sessionId
      const session = await this.$api['parkAgent.createSession']({ profile: this.sessionProfile() }, { acceptCreated: true })
      if (this._parkDisposed) return ''
      if (typeof session?.id !== 'string' || !session.id) throw new Error('invalid-session')
      this.sessionId = session.id
      return this.sessionId
    },
    sendText() {
      if (this.canSendText && !this.sessionUnavailable) return this.sendTurn('text', this.draft.trim())
    },
    async sendTurn(kind, input) {
      this.stopSpeech()
      const speechVersion = this._speechVersion
      const speak = this.speechEnabled
      this.busy = kind
      this.errorText = ''
      this.autoScroll = true
      this._lastScrollTop = this.$refs.transcript?.scrollTop || 0
      if (kind === 'text') {
        this.draft = ''
        this.streamUser = input
      }
      this.$nextTick(this.scrollTranscript)
      try {
        const sessionId = await this.ensureSession()
        if (!sessionId) return
        this._turnAbort = new AbortController()
        const turn = await streamParkAgentTurn({
          sessionId,
          kind,
          input,
          token: this.$store.getters.token,
          speak,
          signal: this._turnAbort.signal,
          onEvent: (event) => {
            if (event.type === 'input') this.streamUser = event.text
            if (event.type === 'delta') this.streamReply += event.text
            if (speak && this.speechEnabled && speechVersion === this._speechVersion) {
              if (event.type === 'audio') this._speech.play(event.audio_base64)
              if (event.type === 'audio_error') this.errorText = event.detail
            }
            this.$nextTick(this.scrollTranscript)
          }
        })
        if (this._parkDisposed) return
        if (typeof turn?.text !== 'string' || typeof turn.reply !== 'string') throw new Error('invalid-turn')
        const firstId = this.messages.length
        this.messages.push({ id: firstId, role: 'user', text: turn.text }, { id: firstId + 1, role: 'assistant', text: turn.reply, audioUrl: this.replyAudioUrl(turn) })
        if (turn.audio_error) this.errorText = '语音播放暂不可用，可以查看文字回复。'
      } catch (error) {
        if (!this._parkDisposed) {
          if (kind === 'text') this.draft = input
          this.showRequestError(error, kind)
        }
      } finally {
        this._turnAbort = null
        if (!this._parkDisposed) {
          this.streamUser = ''
          this.streamReply = ''
          this.busy = ''
          this.$nextTick(this.scrollTranscript)
        }
      }
    },
    async confirmEnd(closeAfter) {
      if (this._endConfirmation || this.busy || this.ended || !this.hasUserTurn) return
      this.cancelRecording()
      this._endConfirmation = true
      let mode = 'notify'
      try {
        const draftNote = this.draft.trim() ? ' 未发送的草稿会在关闭时清空。' : ''
        await this.$confirm(`要将本次沟通内容转达给园区负责人吗？关闭后可在历史记录中查看。${draftNote}`, '结束本次会话', {
          confirmButtonText: '转达负责人',
          cancelButtonText: '仅关闭',
          distinguishCancelAndClose: true,
          closeOnClickModal: false,
          type: 'info'
        })
      } catch (action) {
        if (action !== 'cancel') return
        mode = 'archive'
      } finally {
        this._endConfirmation = false
      }
      if (!this._parkDisposed) await this.finishSession(mode, closeAfter)
    },
    async finishSession(mode, closeAfter) {
      if (!this.sessionId || !this.messages.length || this.ended || this.busy) return
      const sessionId = this.sessionId
      this.busy = 'finish'
      this.errorText = ''
      this.$nextTick(this.scrollTranscript)
      try {
        const result = await this.$api['parkAgent.finishSession']({ sessionId, mode })
        if (!this._parkDisposed && !this.applyAssessment(result)) throw new Error('invalid-assessment')
      } catch (error) {
        if (this._parkDisposed) return
        // 提交结果可能已保存，先查询状态再提示用户重试。
        const result = await this.$api['parkAgent.getSession']({ sessionId }).catch(() => null)
        if (!this._parkDisposed && !this.applyAssessment(result)) this.showRequestError(error, 'finish')
      } finally {
        if (!this._parkDisposed) {
          this.busy = ''
          if (this.ended && closeAfter) {
            this.collapsePanel()
            this.newSession(false)
          } else {
            this.$nextTick(this.scrollTranscript)
          }
        }
      }
    },
    applyAssessment(result) {
      if (result?.status !== 'closed' || !Array.isArray(result.assessment?.items)) return false
      this.assessmentItems = result.assessment.items
      this.submitted = result.assessment.submitted !== false
      this.draft = ''
      this.ended = true
      return true
    },
    showRequestError(error, kind) {
      const status = error?.response?.status || Number(error?.head?.code)
      if (status === 401 || status === 403) {
        this.errorText = '当前账号暂无法使用园区助手，请确认登录状态和企业权限。'
      } else if (status === 404 && this.sessionId) {
        this.sessionUnavailable = true
        this.errorText = '当前会话已不可用，请开启新会话。'
      } else if ([404, 502, 503, 504].includes(status) || error?.message === 'invalid-session') {
        this.errorText = '园区助手暂时无法连接，请稍后重试。'
      } else if (kind === 'voice') {
        this.errorText = '录音发送失败，请重新录音或改用文字。'
      } else if (kind === 'finish') {
        this.errorText = '暂时无法确认会话是否已结束，请重试。'
      } else {
        this.errorText = '消息发送失败，文字已保留，请重试。'
      }
    },
    newSession(focus = true) {
      this.stopSpeech()
      this.disposeAudio()
      this.sessionId = ''
      this.careSession = false
      this.sessionUnavailable = false
      this.messages = []
      this.draft = ''
      this.errorText = ''
      this.assessmentItems = []
      this.ended = false
      this.submitted = false
      this.autoScroll = true
      this._lastScrollTop = 0
      if (focus) this.$nextTick(() => this.$refs.draft?.focus())
    },
    replyAudioUrl(turn) {
      if (!turn.audio_base64 || turn.audio_media_type !== 'audio/mpeg') return ''
      try {
        const decoded = window.atob(turn.audio_base64)
        const data = Uint8Array.from(decoded, (character) => character.charCodeAt(0))
        return URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }))
      } catch {
        return ''
      }
    },
    disposeAudio() {
      this.messages.forEach((message) => {
        if (message.audioUrl) URL.revokeObjectURL(message.audioUrl)
      })
    },
    toggleRecording() {
      if (this.recordingState === 'recording') {
        this.stopCaptureTimer()
        this.recordingState = 'stopping'
        this._recorder.finish()
      } else if (this.recordingState === 'permission') {
        this.cancelRecording()
      } else if (!this.busy && !this.ended && !this.sessionUnavailable) {
        this.startRecording()
      }
    },
    async startRecording() {
      this.errorText = ''
      if (!canRecordAudio()) {
        this.errorText = '当前页面无法访问麦克风，请使用安全连接打开，或改用文字。'
        return
      }

      this.stopSpeech()
      const version = ++this._captureVersion
      this.recordingState = 'permission'
      try {
        const recorder = await startParkRecording({
          onStop: (recording) => this.receiveRecording(version, recording),
          onError: (error) => this.showRecordingError(version, error)
        })
        if (version !== this._captureVersion || this.recordingState !== 'permission') {
          recorder.cancel()
          return
        }
        this._recorder = recorder
        this.recordingState = 'recording'
        this._captureTimer = setTimeout(() => {
          this.cancelRecording()
          this.errorText = '录音已达 60 秒，请分段录音或改用文字。'
        }, 60000)
      } catch (error) {
        this.showRecordingError(version, error)
      }
    },
    receiveRecording(version, recording) {
      if (version !== this._captureVersion) return
      this.cancelRecording()
      if (!recording.blob.size || recording.blob.size > MAX_AUDIO_BYTES) {
        this.errorText = '录音为空或超过 10 MB，请分段录音或改用文字。'
        return
      }
      this.sendTurn('voice', recording)
    },
    showRecordingError(version, error) {
      if (version !== this._captureVersion) return
      this.cancelRecording()
      this.errorText = recordingErrorMessage(error)
    },
    stopCaptureTimer() {
      clearTimeout(this._captureTimer)
      this._captureTimer = null
    },
    cancelRecording() {
      this._captureVersion++
      this.stopCaptureTimer()
      this._recorder?.cancel()
      this._recorder = null
      this.recordingState = 'idle'
    }
  }
}
</script>

<style scoped>
.park-agent-widget {
  --park-accent: #1e40af;
  --park-ink: #172742;
  --park-muted: #4d5f7b;
  --park-divider: #e2e9f2;
  --park-pale: #eff6ff;
  --park-bottom: 24px;
  position: fixed;
  right: calc(24px + env(safe-area-inset-right, 0px));
  bottom: calc(var(--park-bottom) + env(safe-area-inset-bottom, 0px) + var(--park-lift, 0px));
  z-index: 1600;
  display: flex;
  width: min(374px, calc(100vw - 48px));
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  color: var(--park-ink);
  font-size: 14px;
  line-height: 1.55;
}

.park-agent-widget.is-mobile {
  --park-bottom: 70px;
}

.park-agent-launcher,
.park-agent-panel {
  pointer-events: auto;
}

.park-agent-widget button,
.park-agent-widget textarea {
  font: inherit;
}

.park-agent-widget button {
  cursor: pointer;
}

.park-agent-widget button:disabled {
  cursor: default;
  opacity: 0.55;
}

.park-agent-header,
.park-agent-widget .park-agent-launcher {
  cursor: ns-resize;
  touch-action: none;
  user-select: none;
}

.park-agent-widget :focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.park-agent-launcher {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  gap: 8px;
  padding: 0 15px;
  border: 0;
  border-radius: 22px;
  background: var(--park-accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.24);
  font-weight: 600;
}

.park-agent-launcher:hover,
.park-agent-primary:not(:disabled):hover {
  background: #1e3a8a;
}

.park-agent-launcher i,
.park-agent-emblem i {
  font-size: 18px;
}

.park-agent-care-badge {
  min-width: 18px;
  padding: 1px 5px;
  border-radius: 12px;
  background: #fff;
  color: var(--park-accent);
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}

.park-agent-panel {
  position: absolute;
  right: 0;
  bottom: calc(100% + var(--park-panel-gap));
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 490px;
  max-height: var(--park-panel-space);
  overflow-y: auto;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 32px rgba(23, 39, 66, 0.2);
}

.park-agent-widget.opens-below .park-agent-panel {
  top: calc(100% + var(--park-panel-gap));
  bottom: auto;
}

.park-agent-header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--park-divider);
}

.park-agent-header h2 {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  margin: 0;
  color: var(--park-ink);
  font-size: 16px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.park-agent-speech {
  min-height: 34px;
  padding: 0 8px;
  border: 1px solid var(--park-divider);
  border-radius: 7px;
  background: #fff;
  color: var(--park-muted);
  white-space: nowrap;
}

.park-agent-speech[aria-pressed='true'] {
  border-color: #b9d1f8;
  background: var(--park-pale);
  color: var(--park-accent);
}

.park-agent-emblem {
  display: grid;
  width: 34px;
  height: 34px;
  flex: none;
  place-items: center;
  border-radius: 9px;
  background: var(--park-pale);
  color: var(--park-accent);
}

.park-agent-icon-button {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--park-muted);
  font-size: 17px;
}

.park-agent-icon-button:hover,
.park-agent-finish:not(:disabled):hover {
  background: var(--park-pale);
  color: var(--park-accent);
}

.park-agent-care-button {
  position: relative;
}

.park-agent-care-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border: 1px solid #fff;
  border-radius: 50%;
  background: var(--park-accent);
}

.park-agent-transcript,
.park-agent-history {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 16px;
  background: #f8fafd;
  scrollbar-color: #adc2de transparent;
}

.park-agent-care-item {
  padding: 10px 12px;
  border: 1px solid var(--park-divider);
  border-radius: 8px;
  background: #fff;
  overflow-wrap: anywhere;
}

.park-agent-care-list > .park-agent-finish {
  align-self: flex-start;
}

.park-agent-care-note {
  color: var(--park-muted);
  font-size: 12px;
}

.park-agent-care-item strong {
  display: block;
  margin-bottom: 3px;
}

.park-agent-care-message {
  margin: 8px 0 10px;
  white-space: pre-wrap;
}

.park-agent-care-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
}

.park-agent-history {
  align-items: stretch;
  gap: 8px;
  padding: 12px 14px;
}

.park-agent-history-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px 10px;
  padding: 10px 12px;
  border: 1px solid var(--park-divider);
  border-radius: 8px;
  background: #fff;
  color: var(--park-ink);
  text-align: left;
}

.park-agent-history-row:not(:disabled):hover {
  border-color: #aac5ee;
  background: #f4f8ff;
}

.park-agent-history-title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.park-agent-history-row i {
  grid-area: 1 / 2 / 3;
  color: var(--park-muted);
}

.park-agent-history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--park-muted);
  font-size: 12px;
}

.park-agent-history-meta small {
  padding: 1px 6px;
  border-radius: 4px;
  background: #eff3f8;
  font-size: inherit;
}

.park-agent-history-meta .is-submitted {
  background: #e5efff;
  color: var(--park-accent);
}

.park-agent-transcript:focus-visible {
  outline-offset: -3px;
}

.park-agent-message {
  box-sizing: border-box;
  max-width: 94%;
  padding: 9px 12px;
  border: 1px solid var(--park-divider);
  border-radius: 4px 12px 12px;
  background: #fff;
  overflow-wrap: anywhere;
}

.park-agent-message.is-user {
  align-self: flex-end;
  border-color: transparent;
  border-radius: 12px 4px 12px 12px;
  background: var(--park-pale);
  color: var(--park-accent);
}

.park-agent-message p,
.park-agent-receipt p {
  margin: 0;
}

.park-agent-message p {
  white-space: pre-wrap;
}

.park-agent-message audio {
  display: block;
  width: min(245px, 70vw);
  height: 34px;
  margin-top: 7px;
}

.park-agent-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.park-agent-suggestions button {
  min-height: 34px;
  padding: 0 9px;
  border: 1px solid #c8d9f0;
  border-radius: 7px;
  background: #fff;
  color: var(--park-accent);
  font-size: 12px;
}

.park-agent-suggestions button:not(:disabled):hover {
  background: var(--park-pale);
}

.park-agent-progress,
.park-agent-feedback {
  color: var(--park-muted);
  font-size: 12px;
}

.park-agent-receipt {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cadcf5;
  border-radius: 9px;
  background: var(--park-pale);
  overflow-wrap: anywhere;
}

.park-agent-receipt strong,
.park-agent-receipt li span {
  color: var(--park-accent);
}

.park-agent-receipt ul {
  display: grid;
  gap: 6px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
}

.park-agent-receipt li span {
  font-size: 12px;
  font-weight: 650;
}

.park-agent-footer {
  display: grid;
  flex: none;
  gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid var(--park-divider);
}

.park-agent-compose {
  display: grid;
  gap: 8px;
}

.park-agent-compose textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 48px;
  resize: none;
  overflow: auto;
  padding: 7px 9px;
  border: 1px solid #c8d5e7;
  border-radius: 7px;
  background: #fff;
  color: var(--park-ink);
}

.park-agent-compose textarea::placeholder {
  color: var(--park-muted);
}

.park-agent-widget .park-agent-compose textarea:focus {
  border-color: #477bce;
  outline: none;
  box-shadow: 0 0 0 2px #e4edfc;
}

.park-agent-compose textarea:read-only {
  background: #f8fafd;
}

.park-agent-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.park-agent-end,
.park-agent-send {
  margin-left: auto;
  white-space: nowrap;
}

.park-agent-end + .park-agent-send {
  margin-left: 0;
}

.park-agent-history-actions {
  min-height: 36px;
}

.park-agent-action {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-weight: 600;
}

.park-agent-primary {
  justify-self: start;
  background: var(--park-accent);
  color: #fff;
}

.park-agent-voice {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-color: #c8d5e7;
  background: #fff;
  color: var(--park-accent);
}

.park-agent-voice:not(:disabled):hover {
  background: var(--park-pale);
}

.park-agent-voice.is-recording {
  border-color: #f3d0d0;
  background: #fff3f3;
  color: #a41e21;
}

.park-agent-finish {
  min-height: 30px;
  padding: 0 6px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--park-accent);
  font-weight: 600;
}

.park-agent-feedback {
  margin: 0;
}

.park-agent-feedback.is-error {
  color: #a41e21;
}

@media (max-width: 600px) {
  .park-agent-widget {
    right: max(12px, env(safe-area-inset-right, 0px));
    left: max(12px, env(safe-area-inset-left, 0px));
    width: auto;
  }

  .park-agent-action {
    min-height: 40px;
  }

  .park-agent-compose textarea {
    font-size: 16px;
  }
}

@media (max-width: 380px) {
  .park-agent-header {
    gap: 5px;
    padding-inline: 9px;
  }

  .park-agent-header .park-agent-emblem {
    display: none;
  }
}
</style>
