export function buildStaffApproveInfoConfig (row) {
  const config = {}
  row.forEach(item => {
    if (!item.ID) return
    config[item.ID] = {
      filed1: { label: '员工姓名', value: item.NAME || '' },
      filed2: { label: '部门名称', value: item.DEPTNAME || '' },
      filed3: { label: '岗位名称', value: item.JOBNAME || '' },
      filed4: { label: '联系电话', value: item.PHONE || '' }
    }
  })
  return config
}
