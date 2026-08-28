// 通知公告业务选项：维护该业务自己的公告场景和可见范围枚举。
import activityNoticeIcon from '@/assets/image/publicNotice/activity-notice.svg'
import enterpriseNewsIcon from '@/assets/image/publicNotice/enterprise-news.svg'
import parkNewsIcon from '@/assets/image/publicNotice/park-news.svg'
import safetyReminderIcon from '@/assets/image/publicNotice/safety-reminder.svg'

export const NOTICE_SCENE_TYPE_OPTIONS = Object.freeze(['园区动态', '企业动态', '安全提醒', '活动通知'])

export const NOTICE_SCENE_ICONS = Object.freeze({
  园区动态: parkNewsIcon,
  园区通用: parkNewsIcon,
  企业动态: enterpriseNewsIcon,
  安全提醒: safetyReminderIcon,
  活动通知: activityNoticeIcon
})

export const getNoticeSceneIcon = (sceneType) => NOTICE_SCENE_ICONS[sceneType] || parkNewsIcon

export const NOTICE_VISIBILITY_OPTIONS = Object.freeze([
  { label: '对内', value: 0 },
  { label: '对外', value: 1 }
])
