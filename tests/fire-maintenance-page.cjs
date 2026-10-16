// 无业务服务器：用接口协议替身验证页面的真实加载、保存、详情及错误恢复路径。
const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const compiler = require('vue-template-compiler')
const parser = require('@babel/parser')
const babel = require('@babel/core')
const sass = require('sass')
const Vue = require('vue')
const root = path.resolve(__dirname, '..')
const entry = path.join(root, 'src/views/smartIOT/security/fireAlarm.vue')
const modules = new Map()
function resolve(from, spec) {
  const base = spec.startsWith('@/') ? path.join(root, 'src', spec.slice(2)) : path.resolve(path.dirname(from), spec)
  for (const file of [base, base + '.js', base + '.vue']) if (fs.existsSync(file) && fs.statSync(file).isFile()) return file
  throw new Error('Missing import: ' + spec)
}
function load(file) {
  if (modules.has(file)) return modules.get(file).exports
  const module = { exports: {} }
  modules.set(file, module)
  let source = fs.readFileSync(file, 'utf8')
  if (file.endsWith('.vue')) {
    const parsed = compiler.parseComponent(source)
    assert.deepEqual(compiler.compile(parsed.template.content).errors, [], file + ' template')
    for (const style of parsed.styles) sass.compileString(style.content, { logger: sass.Logger.silent })
    source = parsed.script.content
  }
  const ast = parser.parse(source, { sourceType: 'module' })
  for (const node of ast.program.body) if (node.type === 'ImportDeclaration') load(resolve(file, node.source.value))
  const code = babel.transformSync(source, { babelrc: false, configFile: false, plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')] }).code
  vm.runInThisContext('(function(module,exports,require){' + code + '\n})', { filename: file })(module, module.exports, (spec) => load(resolve(file, spec)))
  return module.exports
}
const options = load(entry).default
const messages = []
Vue.prototype.$message = Object.fromEntries(['success', 'warning', 'error', 'info'].map((type) => [type, (message) => messages.push({ type, message })]))
const reply = (result) => ({ success: true, code: 200, result })
const data = {
  deviceType: [{ id: 'type-1', name: '灭火器' }],
  device: [{ id: 'device-db-1', deviceCode: 'FE001', typeId: 'type-1', name: '灭火器1', installLocation: 'A栋大厅', responsiblePerson: '张三' }],
  plan: [{ id: 'plan-1', deviceId: 'device-db-1', planName: '本次巡检', planDate: '2026-01-01', frequency: '每月', responsiblePerson: '计划负责人', advanceReminderDays: 7 }, { id: 'plan-2', deviceId: 'device-db-1', planName: '后续巡检', planDate: '2099-01-01', frequency: '每月', advanceReminderDays: 7 }],
  record: []
}
const calls = []
const api = {}
for (const [resource, namespace] of Object.entries({ deviceType: 'maintenanceDeviceType', device: 'maintenanceDevice', plan: 'maintenancePlan', record: 'maintenanceRecord' })) {
  api[namespace + '.list'] = async (params) => {
    // 故意每页只返回一条，确保不能把第一页当作全部计划。
    calls.push({ resource, action: 'list', params })
    return reply({ records: structuredClone(data[resource].slice(params.pageNo - 1, params.pageNo)), total: data[resource].length, current: params.pageNo, size: 1 })
  }
  api[namespace + '.queryById'] = async ({ id }) => {
    calls.push({ resource, action: 'queryById', id })
    const row = data[resource].find((item) => item.id === id)
    return reply(row ? { ...structuredClone(row), ...(resource === 'record' ? { uploadFiles: [{ attachmentId: 'file-1', fileName: '报告.pdf', filePath: '/files/report.pdf', fileSize: 4 }] } : {}) } : null)
  }
  for (const action of ['add', 'edit', 'delete']) api[namespace + '.' + action] = async (payload, config) => {
    calls.push({ resource, action, payload, config })
    if (action === 'add') data[resource].push({ ...structuredClone(payload), id: resource + '-new-' + data[resource].length })
    if (action === 'edit') Object.assign(data[resource].find((row) => row.id === payload.id), payload)
    if (action === 'delete') {
      assert.equal(payload, undefined)
      data[resource] = data[resource].filter((row) => row.id !== config.params.id)
    }
    return reply(null)
  }
}
async function main() {
  const app = new Vue({ ...options, created: undefined })
  app.$api = api
  app.$refs.devices = { closeDeviceDialog() {}, newTypeName: '新类型' }
  app.$refs.plans = { closePlanDialog() {}, focusPlan(id) { this.focused = id } }
  app.$refs.records = { closeRecordDialog() { this.closed = true }, openRecordDialog(device, plan) { this.planId = plan.id; this.deviceId = device.id; this.cycleNo = plan.cycleNo }, focusPlanRecords(id) { this.focusedPlanId = id } }
  assert.equal(app.devices.length, 0, 'must not initialize with mock devices')
  assert.equal(await app.loadData(), true)
  assert.equal(app.plans.length, 2)
  assert.equal(app.devices[0].id, 'device-db-1')
  assert.equal(app.devices[0].deviceCode, 'FE001')
  assert.equal(app.nextPlan('device-db-1').id, 'plan-1')
  assert.equal(app.reminders.length, 1)
  await app.executePlan(app.plans[0])
  assert.equal(app.$refs.records.deviceId, 'device-db-1')
  await app.saveRecord({ planId: 'plan-1', deviceId: 'device-db-1', recordName: '巡检登记', cycleNo: 1, scheduledDate: '2026-01-01', actualDate: '2026-01-01', status: '不合格', maintenanceType: '篡改类型', responsiblePerson: '其他人', remark: '压力不足，需要复检', uploadFiles: [] })
  assert.equal(data.record[0].recordName, '巡检登记', 'save the user-edited record name')
  assert(!('maintenanceType' in data.record[0]), 'new records must not send the removed maintenance type')
  assert.equal(data.record[0].responsiblePerson, '计划负责人', 'registration must inherit the current plan owner')
  assert.equal(app.plans.find((item) => item.id === 'plan-1').plannedDate, '2026-02-01')
  assert.equal(app.nextPlan('device-db-1').id, 'plan-1')
  assert.equal(app.reminders.length, 1)
  assert.equal(app.$refs.records.closed, true)
  assert.equal(app.activeTab, 'overview', 'registration must keep the current workspace')
  assert.equal(app.$refs.records.focusedPlanId, undefined, 'saving must not change record filters')
  const count = data.record.length
  await app.saveRecord({ planId: 'plan-1', deviceId: 'device-db-1', recordName: '重复登记', cycleNo: 1, scheduledDate: '2026-01-01', status: '合格' })
  assert.equal(data.record.length, count)
  await app.saveRecord({ planId: 'plan-1', deviceId: 'device-db-1', recordName: '第二期登记', cycleNo: 2, scheduledDate: '2026-02-01', actualDate: '2026-02-05', status: '合格' })
  assert.equal(app.plans.find((item) => item.id === 'plan-1').plannedDate, '2026-03-01')
  assert.equal(data.plan.length, 2, 'registration must reuse the recurring plan')
  assert(!calls.some((item) => item.resource === 'plan' && item.action === 'edit'), 'first date must remain the permanent anchor')
  await app.loadData()
  assert.equal(app.plans.find((item) => item.id === 'plan-1').plannedDate, '2026-03-01', 'reload must reconstruct the same schedule')
  await app.openDeviceDetail(app.devices[0])
  await app.openRecordDetail(app.records[0], app.devices[0].id)
  assert.equal(app.currentRecord.uploadFiles[0].name, '报告.pdf')
  assert.equal(app.currentRecord.uploadFiles[0].id, 'file-1', 'platform attachment ID must be retained for download')
  assert.equal(app.currentRecord.uploadFiles[0].url, '/files/report.pdf')
  assert.equal(app.recordReturnDeviceId, 'device-db-1')
  await app.backToDeviceDetail()
  // backToDeviceDetail触发异步详情查询。
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(app.drawerMode, 'device')
  assert.equal(app.currentRecord.deviceCode, 'FE001')
  await app.addDeviceType('新类型')
  const addedType = app.deviceTypes.find((item) => item.name === '新类型')
  assert(addedType)
  app.$confirm = async () => true
  await app.removeDeviceType(addedType)
  assert(!app.deviceTypes.some((item) => item.id === addedType.id))
  await app.saveDevice({ id: 'device-db-1', deviceCode: 'FE001-updated', typeId: 'type-1', name: '改名设备', installLocation: '二楼' })
  assert.equal(app.devices[0].deviceCode, 'FE001-updated')
  assert.equal(app.devices[0].location, '二楼')
  await app.viewPlan('plan-2')
  assert.equal(app.activeTab, 'plans')
  assert.equal(app.$refs.plans.focused, 'plan-2')
  const originalAdd = api['maintenanceDevice.add']
  api['maintenanceDevice.add'] = async () => ({ success: false, code: 500, message: '保存失败' })
  const successes = messages.filter((item) => item.type === 'success').length
  await app.saveDevice({ deviceCode: 'FAIL', typeId: 'type-1', name: '失败设备' })
  assert.equal(messages.filter((item) => item.type === 'success').length, successes)
  assert(!app.devices.some((item) => item.deviceCode === 'FAIL'))
  api['maintenanceDevice.add'] = originalAdd
  const originalList = api['maintenancePlan.list']
  api['maintenancePlan.list'] = async () => { throw new Error('计划加载失败') }
  assert.equal(await app.loadData(), false)
  assert.match(app.loadError, /维保计划列表查询：计划加载失败/)
  assert.equal(app.writeDisabled, true)
  assert.equal(app.plans.length, 2, 'failed reload must not partially replace collections')
  api['maintenancePlan.list'] = originalList
  assert.equal(await app.loadData(), true)
  assert.equal(app.writeDisabled, false)
  const ledger = new Vue({ ...load(path.join(root, 'src/views/smartIOT/security/fireAlarm/DeviceLedger.vue')).default, propsData: {
    pageSize: 10, devices: app.devices, deviceTypes: app.deviceTypes, categoryStats: app.categoryStats, devicePlans: app.devicePlans, deviceMaintenanceStatus: app.deviceMaintenanceStatus
  } })
  let typeRequest
  ledger.$on('load-types', () => { typeRequest = app.loadTypes() })
  const typeLists = () => calls.filter((item) => item.resource === 'deviceType' && item.action === 'list').length
  const beforeOpen = typeLists()
  ledger.openTypeDialog()
  await typeRequest
  assert(typeLists() > beforeOpen, 'opening type management must request deviceType/list')
  const actualAdd = api['maintenanceDeviceType.add']
  const actualRecordList = api['maintenanceRecord.list']
  const actualTypeList = api['maintenanceDeviceType.list']
  api['maintenanceDeviceType.add'] = async (form) => { await actualAdd(form); return '添加成功！' }
  api['maintenanceRecord.list'] = async () => { throw new Error('unrelated record list is unavailable') }
  const beforeSuccess = messages.filter((item) => item.type === 'success').length
  await app.addDeviceType('仅刷新类型')
  assert(app.deviceTypes.some((item) => item.name === '仅刷新类型'))
  assert.equal(messages.filter((item) => item.type === 'success').length, beforeSuccess + 1)
  assert.equal(app.loadError, '', 'type writes must not fail on unrelated record refresh')
  const deviceBefore = messages.filter((item) => item.type === 'success').length
  await app.saveDevice({ id: 'device-db-1', deviceCode: 'FE001', typeId: 'type-1', name: '独立刷新设备' })
  assert.equal(messages.filter((item) => item.type === 'success').length, deviceBefore + 1, 'device writes must not refresh unavailable records')
  api['maintenanceDeviceType.list'] = async () => { throw new Error('类型查询失败') }
  const previousTypes = app.deviceTypes.slice()
  assert.equal(await app.loadTypes(), false)
  assert.equal(app.typeLoading, false)
  assert.match(app.typeError, /设备类型列表查询：类型查询失败/)
  assert.deepEqual(app.deviceTypes, previousTypes)
  api['maintenanceDeviceType.list'] = actualTypeList
  api['maintenanceRecord.list'] = actualRecordList
  assert.equal(await app.loadTypes(), true)
  const deviceOptions = load(path.join(root, 'src/views/smartIOT/security/fireAlarm/DeviceLedger.vue')).default
  const deviceEditor = new Vue({ ...deviceOptions, propsData: {
    pageSize: 10, devices: app.devices, deviceTypes: app.deviceTypes, categoryStats: app.categoryStats, devicePlans: app.devicePlans, deviceMaintenanceStatus: app.deviceMaintenanceStatus,
    refreshOptions: async (resource) => { assert.equal(resource, 'device'); return true }
  } })
  await deviceEditor.openDeviceDialog()
  assert.equal(deviceEditor.deviceDialog, true)
  const planEditor = new Vue({ ...load(path.join(root, 'src/views/smartIOT/security/fireAlarm/PlanList.vue')).default, propsData: {
    pageSize: 10, devices: app.devices, plans: app.plans, deviceTypes: app.deviceTypes, devicePlans: app.devicePlans,
    refreshOptions: async (resource) => { assert.equal(resource, 'plan'); return true }
  } })
  await planEditor.openPlanDialog()
  assert.equal(planEditor.planDialog, true)
  const cachedPlan = app.plans.find((item) => item.id === 'plan-2')
  data.record.push({ id: 'external-record', planId: 'plan-2', deviceId: 'device-db-1', recordName: '他人已登记', status: '合格' })
  const previousRegistrationPlan = app.$refs.records.planId
  await app.executePlan(cachedPlan)
  assert.equal(app.$refs.records.planId, previousRegistrationPlan, 'plan more than seven days away must not open registration')
  assert.equal(app.plans.find((item) => item.id === 'plan-2').cycleNo, 2, 'registration eligibility must use the refreshed current cycle')
  await app.persist('device', 'edit', { id: 'device-db-1', name: '服务端保存成功' }, () => { throw new Error('模拟页面回调异常') })
  assert.match(messages[messages.length - 1].message, /操作已成功/)
  assert.equal(messages[messages.length - 1].type, 'warning')
  assert.equal(app.writeDisabled, true)
  await app.loadData()
  const actualDeviceList = api['maintenanceDevice.list']
  let release
  let started
  const gate = new Promise((resolve) => { release = resolve })
  const beginning = new Promise((resolve) => { started = resolve })
  let firstRead = true
  api['maintenanceDevice.list'] = async (params) => {
    if (firstRead) {
      firstRead = false
      const old = structuredClone(data.device)
      started()
      await gate
      return reply({ records: old, total: old.length })
    }
    return actualDeviceList(params)
  }
  const firstRefresh = app.refreshResources(['device'])
  await beginning
  data.device[0].name = '最新服务端名称'
  const secondRefresh = app.refreshResources(['device'])
  release()
  await Promise.all([firstRefresh, secondRefresh])
  assert.equal(app.devices[0].name, '最新服务端名称', 'queued refreshes must not let an older response overwrite newer data')
  api['maintenanceDevice.list'] = actualDeviceList
  planEditor.$api = api
  await planEditor.openPlanDialog(app.plans.find((item) => item.id === 'plan-1'))
  assert.equal(planEditor.planHasRecords, true)
  assert.equal(planEditor.firstDateLocked, true)
  assert.equal(planEditor.frequencyLocked, true)
  assert.equal(planEditor.planForm.planDate, '2026-01-01')
  assert.equal(planEditor.deviceUnavailable('device-db-1'), false, 'legacy duplicate plans must remain editable on the original device')
  await planEditor.openPlanDialog(null, 'device-db-1')
  assert.equal(planEditor.planDialog, false, 'device-prefilled create must redirect when a plan exists')
  await Vue.nextTick()
  assert.equal(planEditor.focusedPlanId, 'plan-1')
  assert.equal(planEditor.deviceUnavailable('device-db-1'), true)
  const recordEditor = new Vue({ ...load(path.join(root, 'src/views/smartIOT/security/fireAlarm/RecordList.vue')).default, propsData: {
    pageSize: 10, devices: app.devices, plans: app.plans, records: app.records, blocked: true
  } })
  recordEditor.keyword = '不匹配的旧筛选'; recordEditor.result = '合格'; recordEditor.date = '2099-01-01'
  recordEditor.focusPlanRecords('plan-1')
  assert.equal(recordEditor.keyword, '')
  assert.equal(recordEditor.result, '')
  assert.equal(recordEditor.date, '')
  assert.equal(recordEditor.filteredRows.length, 2)
  for (const editor of [deviceEditor, planEditor, recordEditor]) {
    editor.$props.blocked = true
    let closed = false
    editor.closeWhenIdle(() => { closed = true })
    assert.equal(closed, true, 'read failure must not lock dialog close/cancel')
  }
  data.plan.push({ id: 'validation-plan', deviceId: 'device-db-1', planName: '校验计划', planDate: '2026-01-01', frequency: '每月' })
  await app.loadData()
  const oldRecordCount = data.record.length
  const submission = { planId: 'validation-plan', deviceId: 'device-db-1', recordName: '校验记录', cycleNo: 1, scheduledDate: '2026-01-01', actualDate: '2099-01-01', status: '合格' }
  await app.saveRecord(submission)
  assert.equal(data.record.length, oldRecordCount, 'future actual date must not complete a plan')
  await app.saveRecord({ ...submission, actualDate: '2026-01-01', status: '不合格', remark: '' })
  assert.equal(data.record.length, oldRecordCount, 'unqualified result requires issue description')
  data.record.push({ id: 'concurrent-record', planId: 'validation-plan', deviceId: 'device-db-1', status: '合格' })
  await app.saveRecord({ ...submission, actualDate: '2026-01-01' })
  assert.equal(data.record.length, oldRecordCount + 1, 'submit must recheck completion after the dialog has been opened')
  const planWrites = (action) => calls.filter((item) => item.resource === 'plan' && item.action === action).length
  const originalPlanAdds = planWrites('add')
  const duplicateForm = { deviceId: 'device-db-1', planName: '重复计划', planDate: '2026-01-01', frequency: '每月' }
  await app.savePlan(duplicateForm)
  assert.equal(planWrites('add'), originalPlanAdds, 'device with a plan cannot receive another plan')
  const originalPlanEdits = planWrites('edit')
  await app.savePlan({ ...data.plan.find((item) => item.id === 'plan-1'), planName: '旧计划可编辑' })
  assert.equal(planWrites('edit'), originalPlanEdits + 1, 'keep legacy history and allow metadata edits')
  data.device.push({ id: 'unplanned-device', deviceCode: 'FREE', typeId: 'type-1', name: '未安排设备' })
  await app.loadData()
  const availableForm = { ...duplicateForm, deviceId: 'unplanned-device', planName: '唯一周期计划' }
  await app.savePlan(availableForm)
  assert.equal(planWrites('add'), originalPlanAdds + 1, 'unplanned device can receive its first plan')
  const created = app.plans.find((item) => item.deviceId === 'unplanned-device')
  await app.savePlan({ ...availableForm, id: created.id, deviceId: 'device-db-1' })
  assert.equal(planWrites('edit'), originalPlanEdits + 1, 'cannot reassign a plan to a device already covered')
  await app.savePlan(availableForm)
  assert.equal(planWrites('add'), originalPlanAdds + 1)
  await app.deletePlan(created)
  await app.savePlan(availableForm)
  assert.equal(planWrites('add'), originalPlanAdds + 2, 'deleting an unexecuted plan releases its device')
  data.device.push({ id: 'race-device', deviceCode: 'RACE', typeId: 'type-1', name: '并发候选设备' })
  await app.loadData()
  data.plan.push({ ...availableForm, id: 'other-user-plan', deviceId: 'race-device' })
  await app.savePlan({ ...availableForm, deviceId: 'race-device' })
  assert.equal(planWrites('add'), originalPlanAdds + 2, 'refresh before save must catch another user assigning the device')
  const uploadEditor = new Vue({ ...load(path.join(root, 'src/views/smartIOT/security/fireAlarm/RecordList.vue')).default, propsData: {
    pageSize: 10, devices: app.devices, plans: app.plans, records: app.records
  } })
  uploadEditor.recordForm = { uploadFiles: [] }
  let finishUpload
  uploadEditor.$api = { 'attachment.upload': () => new Promise((resolve) => { finishUpload = resolve }) }
  const raw = new File(['pdf'], '报告.pdf', { type: 'application/pdf' })
  const selected = { uid: 11, name: raw.name, status: 'ready', raw }
  const pending = uploadEditor.uploadFile({ file: raw, onProgress() { selected.status = 'uploading' } })
  assert.equal(uploadEditor.beforeRemove(selected), false, 'uploading file must not be removable before the request resolves')
  assert.equal(uploadEditor.uploading, 1)
  finishUpload([{ fileName: raw.name, filePath: '/temp/report.pdf', fileSize: 3 }])
  const attachment = await pending
  uploadEditor.uploadSuccess(attachment, selected)
  assert.equal(uploadEditor.recordForm.uploadFiles.length, 1)
  assert.equal(uploadEditor.uploading, 0)
  selected.status = 'success'
  assert.equal(uploadEditor.beforeRemove(selected), true)
  uploadEditor.removeFile(selected)
  assert.equal(uploadEditor.recordForm.uploadFiles.length, 0)
  const warningOptions = load(path.join(root, 'src/views/product/HomeBoardOne/fireAlarmWarning.vue')).default
  const warning = new Vue({ ...warningOptions, created: undefined })
  warning.$api = api
  await warning.loadWarnings()
  await app.loadData()
  assert.equal(warning.error, '')
  assert.deepEqual(JSON.parse(JSON.stringify(warning.reminders)), JSON.parse(JSON.stringify(app.reminders)), 'home warnings must match the maintenance reminders')
  assert.equal(warningOptions.components.ReminderList.name, 'ReminderList', 'reuse the actual reminder table and filters')
  let targetRoute
  warning.$router = { push: async (target) => { targetRoute = target } }
  await warning.viewPlan('plan-1')
  assert.deepEqual(targetRoute, { path: '/fireAlarm1', query: { planId: 'plan-1' } })
  app.$route = { query: { planId: 'plan-1' } }
  await app.openRoutePlan()
  await Vue.nextTick()
  assert.equal(app.activeTab, 'plans')
  assert.equal(app.$refs.plans.focused, 'plan-1', 'route opens the matching plan after data is loaded')
  const realWarningList = api['maintenancePlan.list']
  api['maintenancePlan.list'] = async () => { throw new Error('首页计划读取失败') }
  await warning.loadWarnings()
  assert.match(warning.error, /首页计划读取失败/)
  assert.equal(warning.loading, false)
  api['maintenancePlan.list'] = realWarningList
  assert.equal(fs.readdirSync(path.join(root, 'src/views/smartIOT/security/fireAlarm')).filter((name) => name.endsWith('.vue')).length, 5)
  console.log('PASS: all component imports/templates/styles; API load/save/failure; single-device registration; both result completion; next-date/reminders; record detail attachments and back navigation; type deletion Query; exactly five workspaces')
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
