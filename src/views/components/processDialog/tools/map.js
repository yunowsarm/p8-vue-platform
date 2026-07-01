/** 根据角色 id 生成 candidateUserMap / beforehandParams 的 key */
export function getAssigneeKey (roleId) {
  return `a_${roleId}`
}

/** 从 assigneeKey 反查角色 id */
export function getRoleIdFromAssigneeKey (assigneeKey) {
  return assigneeKey.replace(/^a_/, '')
}

/** 根据角色 id 在 ROLE_LIST 中查找角色 */
export function findRoleById (roleId) {
  return ROLE_LIST.find(item => item.id === roleId)
}

export const ROLE_LIST = [
  { id: 'SYS_ROLE032', name: '公司领导', isApprove: '1', indexNo: 2, type: '0', teamSettingNames: null },
  { id: 'SYS_ROLE070', name: '项目经理', isApprove: '1', indexNo: 3, type: '0', teamSettingNames: null },
  { id: 'SYS_ROLE077', name: '项目成员', isApprove: '1', indexNo: 4, type: '0', teamSettingNames: null },
  { id: '0cb9802d8c67d36eb13e33dbd733ad14', name: '财务主管', isApprove: '1', indexNo: 6, type: '0', teamSettingNames: null },
  { id: '8a15489e60ad5d54ece5e392fe40b68d', name: '行政主管', isApprove: '1', indexNo: 7, type: '0', teamSettingNames: null },
  { id: 'a65ed8fe6762f6d4de217797871ab4b4', name: '物业主管', isApprove: '1', indexNo: 7, type: '0', teamSettingNames: null },
  { id: 'b8818437a09e49063295ab4cb0ceded0', name: '招商主管', isApprove: '1', indexNo: 8, type: '0', teamSettingNames: null },
  { id: '4ffb69ffb212227ead379c09811f67bf', name: '抄表员', isApprove: '0', indexNo: 9, type: '0', teamSettingNames: null },
  { id: 'b6f53bbe8a0c2286fe1f5fa8f35310d8', name: '法务主管', isApprove: '1', indexNo: 9, type: '0', teamSettingNames: null },
  { id: '7213700b9ea68ce6eb0e03324fc7ea0a', name: '部门领导', isApprove: '1', indexNo: 10, type: '0', teamSettingNames: null },
  { id: '31e2b5b87564f2838c9515ceb8dc1b60', name: '行政后勤', isApprove: '1', indexNo: 11, type: '0', teamSettingNames: null },
  { id: '8f8a6b11d23a45b7e7275302f4fe7800', name: '招商成员', isApprove: '0', indexNo: 12, type: '0', teamSettingNames: null },
  { id: '004c54fca16182fccc2ab3be7061c141', name: '库房主管', isApprove: '1', indexNo: 13, type: '0', teamSettingNames: null },
  { id: '5a91e1bc73e9bef6c0b1c401579ab756', name: '采购主管', isApprove: '1', indexNo: 14, type: '0', teamSettingNames: null },
  { id: '02d601b76c8c1e4ba1096411edb020ec', name: '行政人员', isApprove: '0', indexNo: 15, type: '0', teamSettingNames: null },
  { id: '9cf42b513ec06306dae72f056db37332', name: '测试', isApprove: '1', indexNo: 16, type: '0', teamSettingNames: null },
  { id: 'cab805e23c40139b53ba4989e8a05002', name: 'tob', isApprove: '0', indexNo: 17, type: '0', teamSettingNames: null },
  { id: '63460c264c165b57752410771e947012', name: 'toc', isApprove: '0', indexNo: 18, type: '0', teamSettingNames: null },
  { id: '45a429ac32812c326f32b468d3b51202', name: 'tog', isApprove: '0', indexNo: 19, type: '0', teamSettingNames: null },
  { id: '5126a40c61b95d339916dc489a607b1b', name: '所有权限管理员', isApprove: '1', indexNo: 20, type: '0', teamSettingNames: null }
]
