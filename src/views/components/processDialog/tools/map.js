/** 部门领导角色 id */
export const DEPT_LEADER_ROLE_ID = '7213700b9ea68ce6eb0e03324fc7ea0a'

/** 部门领导 candidateUserMap key */
export const DEPT_LEADER_ASSIGNEE_KEY = `a_${DEPT_LEADER_ROLE_ID}`

/** 资产管理员角色 id */
export const ASSET_ADMIN_ROLE_ID = 'cf7dd0f58789d13dfb32b4a7b67bfccf'

/** 资产管理员 candidateUserMap key */
export const ASSET_ADMIN_ASSIGNEE_KEY = `a_${ASSET_ADMIN_ROLE_ID}`

/** 需要按仓库查询资产管理员的流程 key */
export const STOREHOUSE_PROCESS_KEYS = [
  'fixedAssetTransfer',
  'fixedAssetScrap',
  'fixedAssetCirculate',
  'fixedAssetInventory',
  'fixedAssetUse',
  'assetTransfer',
  'assetScrap',
  'assetCirculate',
  'assetInventory',
  'assetUse'
]

/** 调拨流程：取 BEFORE_STOREHOUSE */
export const TRANSFER_PROCESS_KEYS = ['fixedAssetTransfer', 'assetTransfer']

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

//角色名字和id枚举表
export const ROLE_LIST = [
  { id: 'cf7dd0f58789d13dfb32b4a7b67bfccf', name: '资产管理员', isApprove: '1', indexNo: 1, type: '0', teamSettingNames: null },
  { id: 'f09b0487c94a0991e0b1f61e5a897b6c', name: '司机', isApprove: '1', indexNo: 2, type: '0', teamSettingNames: null },
  { id: 'SYS_ROLE032', name: '公司领导', isApprove: '1', indexNo: 2, type: '0', teamSettingNames: null },
  { id: 'e946148c153ed483543ca377c75d4094', name: '人事专员', isApprove: '1', indexNo: 3, type: '0', teamSettingNames: null },
  { id: 'SYS_ROLE070', name: '项目经理', isApprove: '1', indexNo: 3, type: '0', teamSettingNames: null },
  { id: 'SYS_ROLE077', name: '项目成员', isApprove: '1', indexNo: 4, type: '0', teamSettingNames: null },
  { id: '0cb9802d8c67d36eb13e33dbd733ad14', name: '财务经理', isApprove: '1', indexNo: 6, type: '0', teamSettingNames: null },
  { id: '8a15489e60ad5d54ece5e392fe40b68d', name: '行政人事经理', isApprove: '1', indexNo: 7, type: '0', teamSettingNames: null },
  { id: 'a65ed8fe6762f6d4de217797871ab4b4', name: '物业主管', isApprove: '1', indexNo: 7, type: '0', teamSettingNames: null },
  { id: 'b8818437a09e49063295ab4cb0ceded0', name: '招商主管', isApprove: '1', indexNo: 8, type: '0', teamSettingNames: null },
  { id: 'b6f53bbe8a0c2286fe1f5fa8f35310d8', name: '法务主管', isApprove: '1', indexNo: 9, type: '0', teamSettingNames: null },
  { id: '4ffb69ffb212227ead379c09811f67bf', name: '抄表员', isApprove: '0', indexNo: 9, type: '0', teamSettingNames: null },
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
  { id: '5126a40c61b95d339916dc489a607b1b', name: '所有权限管理员', isApprove: '1', indexNo: 20, type: '0', teamSettingNames: null },
  { id: '00bd608868a9dbad791f9a5d840b6f6a', name: '档案管理员', isApprove: '1', indexNo: 21, type: '0', teamSettingNames: null },
  { id: 'b5eb2a06b3d31736d87e3362d9555753', name: '园区物业领导', isApprove: '1', indexNo: 22, type: '0', teamSettingNames: null },
  { id: '3e70d916c0fa288221f1188738eaba9e', name: '财务部领导', isApprove: '1', indexNo: 23, type: '0', teamSettingNames: null },
  { id: '790b48f0c50ec2781eb77fc65393df5d', name: '行政人事中心领导', isApprove: '1', indexNo: 24, type: '0', teamSettingNames: null },
  { id: '13db11c6a5050eb0951d05c5f9e1d279', name: '总经理室领导', isApprove: '1', indexNo: 25, type: '0', teamSettingNames: null },
  { id: 'a2f195e72d12d41dd0ac93880c14ecb4', name: '高科置业领导', isApprove: '1', indexNo: 26, type: '0', teamSettingNames: null },
  { id: 'af4a8e0af5fb4e7be95cf63667bbf87f', name: '辽宁津通高科建设领导', isApprove: '1', indexNo: 27, type: '0', teamSettingNames: null },
  { id: '4fbffb75168977751a7b413f544c4f96', name: '沈阳津恒科技园领导', isApprove: '1', indexNo: 28, type: '0', teamSettingNames: null },
  { id: 'd24bbb7d89a3afdc766becaad1e63ded', name: '行政人事部领导', isApprove: '1', indexNo: 29, type: '0', teamSettingNames: null },
  { id: 'd53c0c50bd256d9282983d59b70058bb', name: '工程部领导', isApprove: '1', indexNo: 30, type: '0', teamSettingNames: null },
  { id: 'be8d3245d905ef9f4039badcd7218364', name: '财务中心领导', isApprove: '1', indexNo: 31, type: '0', teamSettingNames: null },
  { id: '044c3cfe72f31e88b84f441dbf74d7e6', name: '招商中心领导', isApprove: '1', indexNo: 32, type: '0', teamSettingNames: null },
  { id: '4f9f7e1c565fcb8911c72a80ecd5e6b3', name: '行政主管', isApprove: '1', indexNo: 34, type: '0', teamSettingNames: null },
  { id: 'dc1bfd6c79a760c6bcdb84f2db927d45', name: '出纳', isApprove: '1', indexNo: 35, type: '0', teamSettingNames: null },
  { id: '743e77cf14c4f44ff9d05035ff3963c8', name: '仓库管理员', isApprove: '1', indexNo: 36, type: '0', teamSettingNames: null },
  { id: '85fd752160c33a0869c5456ec92ee143', name: '前台', isApprove: '1', indexNo: 39, type: '0', teamSettingNames: null }
]
