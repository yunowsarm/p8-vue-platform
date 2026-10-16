const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(__dirname, '../src/service/maintenance.js'), 'utf8').replace(/export /g, '')
const { unwrapMaintenanceResponse, requestMaintenance, loadMaintenanceCollection, maintenanceDevicePayload, maintenancePlanPayload, maintenanceRecordPayload, normalizeMaintenanceData, uploadMaintenanceAttachment, maintenanceDueDays, fetchMaintenanceAttachment, maintenanceCycleDate, maintenanceMonthProgress } = new Function(
  source + '; return { unwrapMaintenanceResponse, requestMaintenance, loadMaintenanceCollection, maintenanceDevicePayload, maintenancePlanPayload, maintenanceRecordPayload, normalizeMaintenanceData, uploadMaintenanceAttachment, maintenanceDueDays, fetchMaintenanceAttachment, maintenanceCycleDate, maintenanceMonthProgress }'
)()

async function main() {
  assert.deepEqual(unwrapMaintenanceResponse({ code: 200, success: true, result: { records: [] } }), { records: [] })
  assert.equal(unwrapMaintenanceResponse({ code: 200, success: true }), null)
  assert.throws(() => unwrapMaintenanceResponse({ code: 500, success: false, message: '保存失败' }), /保存失败/)
  assert.throws(() => unwrapMaintenanceResponse(undefined), /请求失败/)
  const emptyPage = { records: [], total: 0, size: 100, current: 1 }
  for (const response of [
    { code: 200, success: true, result: emptyPage },
    { code: 200, success: true, data: emptyPage },
    { head: { code: 200, success: 'true' }, data: emptyPage },
    emptyPage
  ]) {
    assert.deepEqual(await loadMaintenanceCollection({ 'maintenanceDevice.list': async () => response }, 'device'), [])
  }
  assert.deepEqual(await requestMaintenance({ 'maintenanceDevice.queryById': async () => ({ id: 'db-id', name: '设备' }) }, 'device', 'queryById', { id: 'db-id' }), { id: 'db-id', name: '设备' })
  assert.equal(await requestMaintenance({ 'maintenanceDevice.add': async () => null }, 'device', 'add', {}), null)
  assert.equal(await requestMaintenance({ 'maintenanceDeviceType.add': async () => '添加成功！' }, 'deviceType', 'add', {}), '添加成功！')
  assert.equal(await requestMaintenance({ 'maintenanceDeviceType.edit': async () => '编辑成功!' }, 'deviceType', 'edit', {}), '编辑成功!')
  assert.equal(await requestMaintenance({ 'maintenanceDeviceType.delete': async () => '删除成功!' }, 'deviceType', 'delete', { id: 't' }), '删除成功!')
  await assert.rejects(() => requestMaintenance({ 'maintenanceDeviceType.add': async () => '添加失败！' }, 'deviceType', 'add', {}), /请求失败/)
  await assert.rejects(() => requestMaintenance({ 'maintenanceDevice.add': async () => undefined }, 'device', 'add', {}), /请求失败/)
  await assert.rejects(() => loadMaintenanceCollection({ 'maintenanceDevice.list': async () => ({ code: 500, success: false, data: emptyPage, message: '无权限' }) }, 'device'), /无权限/)
  await assert.rejects(() => loadMaintenanceCollection({ 'maintenanceDevice.list': async () => ({ head: { success: 'false', message: '未登录' }, data: emptyPage }) }, 'device'), /未登录/)

  let received
  const api = {
    'maintenanceDeviceType.delete': async (...args) => {
      received = args
      return { code: 200, success: true }
    }
  }
  await requestMaintenance(api, 'deviceType', 'delete', { id: '9223372036854775801' })
  assert.deepEqual(received, [undefined, { params: { id: '9223372036854775801' } }])
  await assert.rejects(() => requestMaintenance({}, 'device', 'add', {}), /尚未配置/)

  const pages = []
  const all = await loadMaintenanceCollection({
    'maintenanceDevice.list': async (params) => {
      pages.push(params)
      return { code: 200, success: true, result: { records: [{ id: String(params.pageNo) }], total: 2, size: 1, current: params.pageNo } }
    }
  }, 'device')
  assert.equal(all.length, 2)
  assert.deepEqual(pages.map((p) => p.pageNo), [1, 2])
  await assert.rejects(() => loadMaintenanceCollection({
    'maintenanceDevice.list': async () => ({ code: 200, success: true, result: { records: [{ id: 'same' }], total: 2 } })
  }, 'device'), /重复/)
  await assert.rejects(() => loadMaintenanceCollection({
    'maintenanceDevice.list': async () => ({ code: 200, success: true, result: { records: [], total: 2 } })
  }, 'device'), /不完整/)

  const payload = maintenanceDevicePayload({ id: 'db-id', deviceCode: 'FE-001', typeId: 'type-id', name: '灭火器', installLocation: 'A栋 / 2层', nextDate: '2026-11-01', qrCode: 'fake' })
  assert.equal(payload.id, 'db-id')
  assert.equal(payload.deviceCode, 'FE-001')
  assert.equal(payload.installDate, null)
  assert(!('nextDate' in payload))
  assert(!('qrCode' in payload))
  assert(!('id' in maintenanceDevicePayload({ deviceCode: 'FE-002', typeId: 'type-id', name: '灭火器' })))
  assert(!('responsiblePerson' in maintenanceDevicePayload({ deviceCode: 'FE-002', typeId: 'type-id', name: '灭火器', responsiblePerson: '旧默认负责人' })))
  assert.equal(maintenanceDevicePayload({ id: 'existing-device', deviceCode: 'FE-001', typeId: 'type-id', name: '灭火器', responsiblePerson: '已有负责人' }).responsiblePerson, '已有负责人', 'hiding the field must not erase historical device data on edit')
  assert(!('advanceReminderDays' in maintenancePlanPayload({ planName: '新计划', deviceId: 'db-id', planDate: '2026-10-16', advanceReminderDays: 7 })))
  assert.equal(maintenancePlanPayload({ id: 'existing-plan', planName: '原计划', deviceId: 'db-id', advanceReminderDays: 3 }).advanceReminderDays, 3, 'edit must preserve an existing hidden reminder configuration')
  const types = [{ id: 'type-id', name: '灭火器' }]
  const devices = [{ id: 'db-id', typeId: 'type-id', deviceCode: 'FE-001', name: '设备', installLocation: '大厅' }]
  const plans = [{ id: 'plan-id', deviceId: 'db-id', planName: '巡检', planDate: '2026-10-16', frequency: '每月' }]
  for (const status of ['合格', '不合格']) {
    const normalized = normalizeMaintenanceData(types, devices, plans, [{ id: 'record-id', deviceId: 'db-id', planId: 'plan-id', status, actualDate: '2026-10-20' }])
    assert.equal(normalized.plans[0].recordCount, 1)
    assert.equal(normalized.plans[0].cycleNo, 2)
    assert.equal(normalized.plans[0].firstMaintenanceDate, '2026-10-16')
    assert.equal(normalized.plans[0].plannedDate, '2026-11-16')
    assert.equal(normalized.devices[0].deviceCode, 'FE-001')
    assert.equal(normalized.records[0].deviceId, 'db-id')
    assert.deepEqual(normalized.records[0].uploadFiles, [])
  }
  assert.equal(normalizeMaintenanceData(types, devices, plans, [{ id: 'r', deviceId: 'other', planId: 'plan-id', status: '合格' }]).plans[0].recordCount, 0)
  assert.equal(maintenanceCycleDate('2026-01-31', '每月', 1), '2026-02-28')
  assert.equal(maintenanceCycleDate('2026-01-31', '每月', 2), '2026-03-31')
  assert.equal(maintenanceCycleDate('2024-02-29', '每年', 1), '2025-02-28')
  assert.equal(maintenanceCycleDate('2024-02-29', '每年', 4), '2028-02-29')
  assert.equal(maintenanceCycleDate('2026-10-31', '每季度', 1), '2027-01-31')
  assert.equal(maintenanceCycleDate('2026-10-31', '每6个月', 1), '2027-04-30')
  assert.equal(maintenanceCycleDate('2026-10-16', '', 1), null)
  assert.equal(normalizeMaintenanceData(types, devices, [{ ...plans[0], frequency: '' }], []).plans[0].status, '待设置周期')
  const recurring = { firstMaintenanceDate: '2026-01-31', frequency: '每月', recordCount: 1 }
  assert.equal(maintenanceMonthProgress([recurring], '2026-02-16').completed, 0)
  assert.equal(maintenanceMonthProgress([{ ...recurring, recordCount: 2 }], '2026-02-28').completed, 1)
  assert.equal(maintenanceMonthProgress([recurring], '2025-12-31').total, 0)
  for (const [offset, expected] of [[365, false], [8, false], [7, true], [6, true], [0, true], [-1, true]]) {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    const due = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
    for (const advanceReminderDays of [undefined, 0, 3, 30]) {
      const normalized = normalizeMaintenanceData(types, devices, [{ ...plans[0], planDate: due, advanceReminderDays }], [])
      assert.equal(normalized.plans[0].canRegister, expected, 'registration opens seven days before due date, including due and overdue dates, regardless of reminder settings')
      assert.equal(normalized.plans[0].status, offset > 7 ? '待首次维保' : offset > 0 ? '即将到期' : offset === 0 ? '今日到期' : '已逾期')
      if (offset === 0) {
        const registered = normalizeMaintenanceData(types, devices, [{ ...plans[0], planDate: due }], [{ id: 'done', planId: 'plan-id', deviceId: 'db-id', status: '合格', actualDate: due }])
        assert.equal(registered.plans[0].status, '待下期维保', 'registration advances to waiting for the next cycle')
      }
    }
  }
  assert.equal(maintenanceDueDays('2026-10-15', '2026-10-16'), 1)
  assert.equal(maintenanceDueDays('', '2026-10-16'), null)
  assert.equal(maintenanceDueDays('2026-99-99', '2026-10-16'), null)
  assert.equal(maintenanceDueDays('2026-02-30', '2026-10-16'), null)
  assert.equal(normalizeMaintenanceData(types, devices, [{ ...plans[0], planDate: null }], []).plans[0].status, '待定日期')
  const planPayload = maintenancePlanPayload({ planName: '单设备计划', deviceId: 'db-id', deviceIds: ['wrong'], serviceType: '外委' })
  assert.equal(planPayload.deviceId, 'db-id')
  assert(!('maintenanceType' in maintenancePlanPayload({ planName: '新计划', maintenanceType: '旧默认类型' })))
  assert.equal(maintenancePlanPayload({ id: 'old-plan', maintenanceType: '历史类型' }).maintenanceType, '历史类型')
  assert(!('maintenanceType' in maintenancePlanPayload({ id: 'old-plan' })))
  assert(!('maintenanceType' in maintenanceRecordPayload({ maintenanceType: '隐藏类型' })))
  assert(!('deviceIds' in planPayload))
  assert(!('serviceType' in planPayload))
  const recordPayload = maintenanceRecordPayload({ planId: 'plan-id', deviceId: 'db-id', recordName: '登记', status: '不合格', cost: 500, uploadFiles: [{ id: 'f1', name: '照片.jpg', url: '/files/f1', size: 30, raw: 'binary', uid: 1 }] })
  assert.equal(recordPayload.status, '不合格')
  assert.deepEqual(recordPayload.uploadFiles, [{ id: 'f1', name: '照片.jpg', url: '/files/f1', size: 30 }])
  assert(!('cost' in recordPayload))
  const file = new File(['test'], '报告.pdf', { type: 'application/pdf' })
  const platformUploaded = await uploadMaintenanceAttachment({ 'attachment.upload': async (body) => {
    assert.equal(body.get('thefile').name, file.name)
    return [{ fileName: '平台报告.pdf', filePath: '/temporary/stored-report.pdf', fileType: 'application/pdf', fileSize: 4 }]
  } }, file)
  const platformPayload = maintenanceRecordPayload({ uploadFiles: [platformUploaded] }).uploadFiles[0]
  assert.equal(platformPayload.fileName, '平台报告.pdf', 'keep platform attachment fields when saving a record')
  assert.equal(platformPayload.filePath, 'stored-report.pdf', 'match propertyRepair storage path convention')
  assert.equal(platformPayload.fileType, 'application/pdf')
  assert.equal(platformPayload.url, '/temporary/stored-report.pdf', 'retain maintenance API URL field')
  assert(!('raw' in platformPayload))
  const uploaded = await uploadMaintenanceAttachment({ 'attachment.upload': async (body) => {
    assert.equal(body.get('thefile').name, file.name)
    return [{ id: 'f1', fileName: file.name, filePath: '/files/report.pdf', fileSize: 4 }]
  } }, file)
  assert.deepEqual(uploaded, { id: 'f1', name: '报告.pdf', url: '/files/report.pdf', size: 4, fileName: '报告.pdf', filePath: '/files/report.pdf' })
  await assert.rejects(() => uploadMaintenanceAttachment({ 'attachment.upload': async () => ({ success: false, message: '上传被拒绝' }) }, file), /上传被拒绝/)
  for (const [resource, namespace] of Object.entries({ deviceType: 'maintenanceDeviceType', device: 'maintenanceDevice', plan: 'maintenancePlan', record: 'maintenanceRecord' })) {
    for (const [action, message] of Object.entries({ add: '添加成功！', edit: '编辑成功!', delete: '删除成功！' })) {
      for (const response of [message, null, { head: { success: 'true', code: '200' }, data: message }, { code: 200, success: true, data: message }, { code: 200, success: true, result: null }]) {
        await requestMaintenance({ [namespace + '.' + action]: async () => response }, resource, action, { id: 'id' })
      }
      await assert.rejects(() => requestMaintenance({ [namespace + '.' + action]: async () => ({ head: { success: 'false', message: '不允许操作' }, data: message }) }, resource, action, { id: 'id' }), /不允许操作/)
    }
  }
  const attachments = [{ id: 'f1', name: file.name, url: '/files/report.pdf', size: 4 }]
  for (const response of [attachments, { head: { success: 'true' }, data: attachments }, { code: 200, success: true, result: attachments }, { code: 200, success: true, result: null, data: attachments }]) {
    assert.equal((await uploadMaintenanceAttachment({ 'attachment.upload': async () => response }, file)).id, 'f1')
  }
  await assert.rejects(() => uploadMaintenanceAttachment({ 'attachment.upload': async () => ({ head: { success: 'false', message: '附件无权限' }, data: attachments }) }, file), /附件无权限/)
  const blob = new Blob(['pdf'], { type: 'application/pdf' })
  assert.equal(await fetchMaintenanceAttachment({ 'attachment.download': async (params, config) => { assert.deepEqual(params, { attachmentId: 'f1' }); assert.equal(config.responseType, 'blob'); return { data: blob } } }, 'f1'), blob)
  await assert.rejects(() => fetchMaintenanceAttachment({ 'attachment.download': async () => ({ data: new Blob([JSON.stringify({ head: { success: 'false', message: '文件不存在' } })], { type: 'application/json' }) }) }, 'f1'), /文件不存在/)
  console.log('PASS: response failures, POST Query deletion, complete pagination, duplicate-page guards, device primary-key/code separation and payload whitelist')
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
