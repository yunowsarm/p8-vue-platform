// 此模块只适配养护接口，不改变平台其他模块的响应处理。
const namespaces = { deviceType: 'maintenanceDeviceType', device: 'maintenanceDevice', plan: 'maintenancePlan', record: 'maintenanceRecord' }
const resourceLabels = { deviceType: '设备类型', device: '设备', plan: '维保计划', record: '维保记录' }
const actionLabels = { list: '列表查询', queryById: '详情查询', add: '新增', edit: '编辑', delete: '删除' }

export function unwrapMaintenanceResponse(response, action) {
  const success = (value) => value === true || value === 'true'
  const failure = () => new Error((response && (response.message || (response.head && response.head.message))) || '养护接口请求失败，请稍后重试')
  // 旧平台head/data协议由全局拦截器校验后直接返回data；写入成功时data可能为null。
  if (response === null && ['add', 'edit', 'delete'].includes(action)) return null
  // 旧平台写入接口的data也可能仅为“添加成功！”等确认文本。
  const confirmations = { add: /^(?:添加|新增|保存|操作)成功[!！。.]*$/, edit: /^(?:编辑|修改|保存|操作)成功[!！。.]*$/, delete: /^(?:删除|操作)成功[!！。.]*$/ }
  if (typeof response === 'string' && confirmations[action] && confirmations[action].test(response.trim())) return response
  if (!response || typeof response !== 'object') throw failure()
  if (response.head) {
    if (!success(response.head.success)) throw failure()
    return response.data == null ? null : response.data
  }
  // 后端文档采用result，实际平台接口也有使用data的情况。
  // 必须先判断明确的失败标记，不能因为data包含records就把失败响应当成功。
  if ('success' in response || 'code' in response) {
    if (!success(response.success) || Number(response.code) !== 200) throw failure()
    if (response.result != null) return response.result
    return response.data == null ? null : response.data
  }
  if ((!action || action === 'list') && Array.isArray(response.records) && response.total != null) return response
  if (action === 'queryById' && response.id != null) return response
  if (action === 'upload' && Array.isArray(response)) return response
  throw failure()
}

export async function requestMaintenance(api, resource, action, data = {}) {
  const name = namespaces[resource]
  const request = api && api[`${name}.${action}`]
  if (!request) throw new Error('养护接口尚未配置')
  // 后端删除接口的id在Query中，不能作为POST JSON正文发送。
  try {
    let params = data
    if (action === 'add') {
      const now = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      const createTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      params = { ...data, createTime }
    }
    const response = action === 'delete' ? await request(undefined, { params: { id: data.id } }) : await request(params)
    return unwrapMaintenanceResponse(response, action)
  } catch (error) {
    const message = error && (error.message || (error.head && error.head.message))
    throw new Error(`${resourceLabels[resource] || '养护'}${actionLabels[action] || '请求'}：${message || '请求失败，请稍后重试'}`)
  }
}

// 总览、类型数量及跨列表关联需要完整数据；逐页读取，不把第一页当作全部。
// 服务端重复返回同一页或分页异常时明确报错，避免产生错误统计。
export async function loadMaintenanceCollection(api, resource, filters = {}) {
  const rows = []
  const seen = new Set()
  for (let pageNo = 1; pageNo <= 1000; pageNo++) {
    const page = await requestMaintenance(api, resource, 'list', { ...filters, pageNo, pageSize: 100 })
    if (!page || !Array.isArray(page.records) || !Number.isSafeInteger(Number(page.total)) || Number(page.total) < 0) throw new Error('养护接口返回的分页数据格式不正确')
    const total = Number(page.total)
    for (const row of page.records) {
      if (!row || row.id == null || seen.has(String(row.id))) throw new Error('养护接口分页数据重复或缺少ID，请刷新后重试')
      seen.add(String(row.id))
      rows.push(row)
    }
    if (rows.length >= total) return rows
    if (!page.records.length) throw new Error('养护接口分页数据不完整，请刷新后重试')
  }
  throw new Error('养护数据量超出当前页面加载范围，请联系管理员')
}

export function maintenanceDevicePayload(form) {
  return {
    ...(form.id ? { id: form.id } : {}),
    deviceCode: form.deviceCode,
    typeId: form.typeId,
    name: form.name,
    brand: form.brand || '',
    model: form.model || '',
    ...(form.id && Object.prototype.hasOwnProperty.call(form, 'responsiblePerson') ? { responsiblePerson: form.responsiblePerson } : {}),
    installLocation: form.installLocation || '',
    installDate: form.installDate || null
  }
}

export function maintenancePlanPayload(form) {
  return {
    ...(form.id ? { id: form.id } : {}),
    planName: form.planName,
    deviceId: form.deviceId,
    frequency: form.frequency || '',
    planDate: form.planDate || null,
    ...(form.id && Object.prototype.hasOwnProperty.call(form, 'advanceReminderDays') ? { advanceReminderDays: form.advanceReminderDays } : {}),
    ...(form.id && Object.prototype.hasOwnProperty.call(form, 'maintenanceType') ? { maintenanceType: form.maintenanceType } : {}),
    responsiblePerson: form.responsiblePerson || ''
  }
}

export function normalizeMaintenanceAttachment(file) {
  const id = file.id || file.attachmentId
  return {
    ...(id ? { id: String(id) } : {}),
    name: file.name || file.fileName || '',
    url: file.url || file.fileUrl || file.filePath || '',
    size: Number(file.size || file.fileSize) || 0,
    ...(file.fileName ? { fileName: file.fileName } : {}),
    ...(file.filePath ? { filePath: file.filePath } : {}),
    ...(file.fileType ? { fileType: file.fileType } : {})
  }
}

export function maintenanceRecordPayload(form) {
  return {
    planId: form.planId,
    deviceId: form.deviceId,
    recordName: form.recordName,
    responsiblePerson: form.responsiblePerson || '',
    actualDate: form.actualDate || null,
    status: form.status,
    remark: form.remark || '',
    uploadFiles: (form.uploadFiles || []).map((file) => {
      const attachment = normalizeMaintenanceAttachment(file)
      // 与报修页面一致，平台附件关联保存存储文件名；访问地址另存于url。
      if (attachment.filePath) attachment.filePath = String(attachment.filePath).split('/').filter(Boolean).pop() || attachment.filePath
      return attachment
    })
  }
}

export async function uploadMaintenanceAttachment(api, file) {
  if (!api || !api['attachment.upload']) throw new Error('附件上传接口尚未配置')
  const body = new FormData()
  body.append('thefile', file)
  const response = await api['attachment.upload'](body)
  const values = unwrapMaintenanceResponse(response, 'upload')
  const value = Array.isArray(values) ? values[0] : null
  if (!value || (!value.id && !value.attachmentId && !value.url && !value.fileUrl && !value.filePath)) throw new Error('上传接口未返回有效附件信息')
  return normalizeMaintenanceAttachment({ ...value, name: value.name || value.fileName || file.name, size: value.size || value.fileSize || file.size })
}

export async function fetchMaintenanceAttachment(api, id) {
  if (!api || !api['attachment.download']) throw new Error('附件下载接口尚未配置')
  const response = await api['attachment.download']({ attachmentId: id }, { responseType: 'blob' })
  const blob = response && response.data
  if (!(blob instanceof Blob)) throw new Error('附件下载失败')
  // 服务端业务错误也可能以HTTP 200的JSON Blob返回，不能将错误正文下载成附件。
  if (/json|text\/html/i.test(blob.type)) {
    let message = '附件下载失败，请检查文件是否存在或是否有访问权限'
    if (/json/i.test(blob.type)) {
      try {
        const body = JSON.parse(await blob.text())
        message = body.message || (body.head && body.head.message) || message
      } catch (error) {
        /* 非JSON正文沿用默认提示。 */
      }
    }
    throw new Error(message)
  }
  return blob
}

export function maintenanceToday() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isMaintenanceDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(value + 'T00:00:00')
  return Number.isFinite(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10))
}

export function maintenanceDueDays(date, today = maintenanceToday()) {
  if (!isMaintenanceDate(date) || !isMaintenanceDate(today)) return null
  const difference = new Date(today + 'T00:00:00') - new Date(date + 'T00:00:00')
  return Number.isFinite(difference) ? Math.round(difference / 86400000) : null
}

export function maintenanceIntervalMonths(frequency) {
  const value = String(frequency || '').trim()
  const aliases = { 每月: 1, 每季度: 3, 每季: 3, 每半年: 6, 每年: 12 }
  if (aliases[value]) return aliases[value]
  const match = value.match(/^每(\d+)(?:个)?月$/)
  const months = match ? Number(match[1]) : 0
  return Number.isSafeInteger(months) && months > 0 && months <= 120 ? months : null
}

// 每次都从首次日期计算，避免1月31日→2月末后漂移成每月28日。
export function maintenanceCycleDate(firstDate, frequency, index = 0) {
  const months = maintenanceIntervalMonths(frequency)
  if (!isMaintenanceDate(firstDate) || !months || !Number.isSafeInteger(index) || index < 0) return null
  const offset = Number(firstDate.slice(0, 4)) * 12 + Number(firstDate.slice(5, 7)) - 1 + months * index
  const year = Math.floor(offset / 12)
  const month = offset % 12
  if (year < 100 || year > 9999) return null
  const day = Math.min(Number(firstDate.slice(8, 10)), new Date(Date.UTC(year, month + 1, 0)).getUTCDate())
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function maintenanceMonthProgress(plans, today = maintenanceToday()) {
  let total = 0
  let completed = 0
  plans.forEach((plan) => {
    const first = plan.firstMaintenanceDate
    const months = maintenanceIntervalMonths(plan.frequency)
    if (!isMaintenanceDate(first) || !months) return
    const distance = (Number(today.slice(0, 4)) - Number(first.slice(0, 4))) * 12 + Number(today.slice(5, 7)) - Number(first.slice(5, 7))
    if (distance < 0 || distance % months !== 0) return
    total++
    if (plan.recordCount > distance / months) completed++
  })
  return { total, completed, plans: total, percent: total ? Math.round((completed / total) * 1000) / 10 : 0 }
}

export function normalizeMaintenanceData(types, devices, plans, records) {
  const ids = (value) => (value == null ? '' : String(value))
  const deviceTypes = types.map((item) => ({ ...item, id: ids(item.id) }))
  const typeMap = new Map(deviceTypes.map((item) => [item.id, item.name]))
  const deviceRows = devices.map((item) => ({
    ...item,
    id: ids(item.id),
    typeId: ids(item.typeId),
    category: typeMap.get(ids(item.typeId)) || '未知类型',
    location: item.installLocation || ''
  }))
  const deviceMap = new Map(deviceRows.map((item) => [item.id, item]))
  const recordRows = records.map((item) => {
    const device = deviceMap.get(ids(item.deviceId))
    return {
      ...item,
      id: ids(item.id),
      deviceId: ids(item.deviceId),
      planId: ids(item.planId),
      device: device ? device.name : '设备已移除',
      deviceCode: device ? device.deviceCode : '',
      category: device ? device.category : '',
      date: (item.actualDate || '').slice(0, 10),
      executor: item.responsiblePerson || '',
      result: item.status || '',
      uploadFiles: Array.isArray(item.uploadFiles) ? item.uploadFiles.filter(Boolean).map(normalizeMaintenanceAttachment) : []
    }
  })
  const planRows = plans.map((item) => {
    const deviceId = ids(item.deviceId)
    const device = deviceMap.get(deviceId)
    const recordCount = recordRows.filter((record) => record.planId === ids(item.id) && record.deviceId === deviceId && ['合格', '不合格'].includes(record.status)).length
    const firstMaintenanceDate = (item.planDate || '').slice(0, 10)
    const plannedDate = maintenanceCycleDate(firstMaintenanceDate, item.frequency, recordCount)
    const nextMaintenanceDate = maintenanceCycleDate(firstMaintenanceDate, item.frequency, recordCount + 1)
    const advanceDays = item.advanceReminderDays == null ? 0 : Math.max(0, Number(item.advanceReminderDays) || 0)
    const dueDays = maintenanceDueDays(plannedDate)
    return {
      ...item,
      id: ids(item.id),
      deviceId,
      name: item.planName || '',
      deviceName: device ? device.name : '设备已移除',
      deviceCode: device ? device.deviceCode : '',
      category: device ? device.category : '',
      location: device ? device.location : '',
      firstMaintenanceDate,
      plannedDate: plannedDate || '',
      nextMaintenanceDate: nextMaintenanceDate || '',
      advanceDays,
      owner: item.responsiblePerson || '',
      recordCount,
      cycleNo: recordCount + 1,
      canRegister: dueDays != null && dueDays >= -7,
      status: !isMaintenanceDate(firstMaintenanceDate)
        ? '待定日期'
        : !maintenanceIntervalMonths(item.frequency)
        ? '待设置周期'
        : dueDays > 0
        ? '已逾期'
        : dueDays === 0
        ? '今日到期'
        : dueDays >= -7
        ? '即将到期'
        : recordCount > 0
        ? '待下期维保'
        : '待首次维保'
    }
  })
  return { deviceTypes, devices: deviceRows, plans: planRows, records: recordRows }
}

// 首页预警和维保模块共用同一套到期判断。
export function buildMaintenanceReminders(plans, devices) {
  const list = []
  plans.forEach((plan) => {
    const overdueDays = maintenanceDueDays(plan.plannedDate)
    if (overdueDays == null || overdueDays < -plan.advanceDays) return
    const device = devices.find((item) => item.id === plan.deviceId)
    if (!device) return
    list.push({
      id: plan.id,
      planId: plan.id,
      deviceId: device.id,
      deviceCode: device.deviceCode,
      device: device.name,
      category: device.category,
      location: device.installLocation || '',
      dueDate: plan.plannedDate,
      owner: plan.responsiblePerson || '',
      plan: plan.planName,
      overdueDays,
      urgency: overdueDays > 0 ? '已逾期' : overdueDays === 0 ? '今日到期' : '即将到期',
      status: overdueDays > 0 ? '逾期' + overdueDays + '天' : overdueDays === 0 ? '今日到期' : -overdueDays + '天后到期'
    })
  })
  return list.sort((a, b) => b.overdueDays - a.overdueDays || a.id.localeCompare(b.id))
}
