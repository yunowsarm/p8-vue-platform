import { GanttObject } from './ganttObject'
import { checkContentRoot, checkReadOnly, checkTaskReadonly, batchOwnerCheck } from './commandButtonData'
import store from '@/plugins/store'


const statusName = {
  '6401': '已创建',
  '6402': '协同编制',
  '6403': '待下发',
  '6404': '已下发',
  '6405': '变更中',
  '6406': '提交审批',
  '6407': '审批驳回',
  '6408': '审批撤销',
  '6409': '审批完成',
}
// 公共函数，用于返回禁用状态和提示信息
function createDisableResponse(message) {
  return {
    disable: true,
    message: message,
  };
}

// 判断是否能新建下级
export function isNewChild(ganttName, tasks) {
  const task = tasks[0]
  if (['6405', '6406', '6409'].includes(task.managerStatus)) {
    const vueThis = store.getters.vueThis
    if (vueThis.planEditLock === '0') return false
    return createDisableResponse(`任务为${statusName[task.managerStatus]},不可操作`);
  } else if (task.planType) {
    return createDisableResponse(`当前任务标识是仅叶子节点可用，无法在此创建下级`);
  } else {
    return false;
  }
}

// 判断是否能新建同级
export function isNewSibling(ganttName, tasks) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  // 获取父任务
  const parentId = tasks[0].parent
  const parentTask = ganttObject.getTask(parentId)
  if (['6405', '6409'].includes(parentTask.managerStatus)) {
    const vueThis = store.getters.vueThis
    if (vueThis.planEditLock === '0') return false
    return createDisableResponse(`父任务为${statusName[parentTask.managerStatus]},不可操作`);
  } else {
    return false;
  }
}

// 判断是否为变更gantt图
export function isChangeGantt(ganttName, tasks) {
  if (ganttName === 'changeGantt') {
    return createDisableResponse(`变更gantt时不允许此操作`);
  } else {
    return false;
  }
}

// 判断是否为编制页面且计划编辑锁定
export function isCompile(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  const createPage = vueThis.createPage
  if (vueThis.planEditLock === '1') {
    return createDisableResponse(`计划编辑锁定时不允许此操作`);
  } else {
    return false;
  }
}

// 判断是否有选中的任务
export function isHasTask(ganttName, tasks) {
  if (!ganttName || !tasks || !tasks.length) {
    return createDisableResponse(`请先选择任务`);
  } else {
    return false;
  }
}

// 判断是否为暂停或禁止状态
export function isSuspensionOrProhibition(ganttName, tasks) {
  if (tasks.length && checkSwitchType(tasks)) {
    return createDisableResponse(`任务为暂停或禁止状态时不允许此操作`);
  } else {
    return false;
  }
}

// 判断是否为分解页面和任务状态
export function taskStateAndReadonly(ganttName, tasks) {
  if (tasks.length && tasks[0].managerStatus === '6404') {
    return false;
  } else {
    const isDisableFunCheckRes = isDisableFunCheck(ganttName, tasks, '1')
    if (isDisableFunCheckRes.value) {
      return false;
    } else if (checkEditTask(ganttName, tasks)) {
      return false;
    } else {
      return createDisableResponse(isDisableFunCheckRes.msg);
    }
  }
}

// 选中任务中包含已下发任务
export function isHasDeliveredTask(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.planEditLock === '0') return false
  if (tasks.some(task => task.managerStatus === '6404' && ganttName !== 'changeGantt')) {
    return createDisableResponse(`任务已下发时不允许此操作`);
  }
  return false;
}

// 判断任务状态是否为协同编制
export function isWeave(ganttName, tasks) {
  if (tasks.length === 1 && tasks[0].managerStatus === '6402') {
    return false;
  }
}
// 判断任务状态是否为审批完成
export function isApprovalCompleted(ganttName, tasks) {
  if (tasks.some(task => task.managerStatus === '6409')) {
    return createDisableResponse(`任务审批完成时不允许此操作`);
  }
  return false;
}

// 判断当前是否为只读状态
export function isReadOnly(ganttName, tasks) {
  const res = checkReadOnly(ganttName)
  if (checkReadOnly(ganttName)) {
    return createDisableResponse(res.readonlyReason);
  } else {
    return false;
  }
}
// 判断选中任务是非根节点
export function isNoRoot(ganttName, tasks) {
  if (checkContentRoot(ganttName, tasks)) {
    return createDisableResponse('包含根节点时不允许此操作');
  }
  return false
}

// 选中任务非只读并且符合升级条件
export function isAllowUpgrades(ganttName, tasks) {
  const checkReadOnlyRes = checkReadOnly(ganttName)
  if (checkReadOnlyRes) {
    return createDisableResponse(checkReadOnlyRes.readonlyReason);
  }
  if (!outdentCheck(ganttName, tasks)) {
    return createDisableResponse('根节点任务和父节点为根节点的任务不允许此操作');
  }
  return false
}

// 选中任务非只读并且符合降级条件
export function isAllowDowngrade(ganttName, tasks) {
  const canIndentCheckRes = canIndentCheck(ganttName)
  if (canIndentCheckRes.value) {
    return false
  } else {
    return createDisableResponse(canIndentCheckRes.msg);
  }
}

// 判断任务状态是否为待下发状态
export function isToBeDelivered(ganttName, tasks) {
  if (createPage === 'decompose' && tasks.length === 1 && tasks[0].managerStatus === '6403') {
    return createDisableResponse(`任务待下发时不允许此操作`);
  } else {
    return false;
  }
}

// 判断任务是否包含任务标识
export function isHasProductTask(ganttName, tasks) {
  if (checkHasProductTask(tasks)) {
    return createDisableResponse(`任务包含任务标识时不允许此操作`);
  } else {
    return false;
  }
}
// 判断是否包含审批中的任务
export function isHasApproveTask(ganttName, tasks) {

  if (checkHasApproveTask(ganttName, tasks)) {
    return createDisableResponse(`审批中的任务不允许此操作`);
  } else {
    return false;
  }
}

// 如果是任务分解，非当前人员创建的，只能编辑责任人
export function noSelfCreate(ganttName, tasks) {
  const userId = store.getters.userInfo.id
  const ele = tasks.find((task) => {
    return task.createUserId && task.createUserId != userId
  })
  if (window.createPage === 'decompose' && ele && ele.id) {
    return createDisableResponse(`任务分解页面，非当前人员创建不允许此操作`);
  }
}

// 判断选中的任务是否只有一个
export function isSingleTask(ganttName, tasks) {
  if (tasks && tasks.length === 1) {
    return false;
  } else {
    return createDisableResponse(`多选时不允许此操作`);
  }
}
// 选中任务不符合删除条件
export function isAllowDelete(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  const canDeleteCheckRes = canDeleteCheck(ganttName, tasks, vueThis)

  if (canDeleteCheckRes.value) {
    return false
  } else {
    return createDisableResponse(canDeleteCheckRes.msg);
  }
}
// 选中任务的状态为审批驳回或者审批撤销并且任务包含根节点
export function isApprovalReject(ganttName, tasks) {
  if (tasks[0].managerStatus === '6407' || tasks[0].managerStatus === '6408') {
    if (checkContentRoot(ganttName, tasks)) {
      return createDisableResponse(`任务包含根节点的任务状态为审批驳回或者审批撤销时不允许此操作`);
    } else {
      return false
    }
  }
}

// 判断选中任务是否符合责任人校验规则
export function isAllowResponsiblePerson(ganttName, tasks) {

  const batchOwnerCheckRes = batchOwnerCheck(ganttName, tasks)
  if (batchOwnerCheckRes.value) {
    return false
  } else {
    return createDisableResponse(batchOwnerCheckRes.reason);
  }
}

// 判断任务是否可以下发
export function isAllowIssue(ganttName, tasks) {
  const { managerStatus, dutyDeptName } = tasks[0];

  if (managerStatus === '6403') {
    if (dutyDeptName) {
      // 待下发状态责任部门（科研）不为空，可以下发
      return false;
    } else {
      return createDisableResponse(`责任部门为空时不允许此操作`);
    }
  } else if (managerStatus === '6404') {
    return createDisableResponse(`已下发状态不允许此操作`);
  } else if (!dutyDeptName) {
    return createDisableResponse(`责任部门为空不允许此操作`);
  } else {
    return createDisableResponse(`任务状态为待下发时才允许此操作`);
  }
}


// 判断是否允许撤销
export function isAllowUndo(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  const thisGantt = GanttObject.getGanttObject(ganttName);
  const checkReadOnlyRes = checkReadOnly(ganttName)
  if (checkReadOnlyRes) {
    return createDisableResponse(checkReadOnlyRes.readonlyReason);
  }
  const checkTaskReadonlyRes = checkTaskReadonly(ganttName, tasks)
  if (checkTaskReadonlyRes) {
    return createDisableResponse(checkTaskReadonlyRes.readonlyReason)
  }
  if (vueThis.readOnly) {
    return createDisableResponse('当前页面为只读状态,不允许此操作');
  }
  if (vueThis && thisGantt &&
    thisGantt.getUndoStack() &&
    thisGantt.getUndoStack().length > 0) {
    return false;
  } else {
    return createDisableResponse(`已是最初数据`);
  }
}

// 判断选中节点不包含根节点并且当前gantt为非只读状态
export function isHadRootAndReadOnly(ganttName, tasks) {
  if (checkContentRoot(ganttName, tasks)) {
    return createDisableResponse(`选中任务包含根节点时不允许此操作`);
  } else if (checkReadOnly(ganttName)) {
    return createDisableResponse(checkReadOnly(ganttName).readonlyReason);
  } else {
    return false
  }
}

// 判断是否允许粘贴
export function isAllowPaste(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  const thisGantt = GanttObject.getGanttObject(ganttName)
  if (tasks && tasks.length === 1 && tasks[0].parent && thisGantt.isTaskExists(tasks[0].parent)) {
    const parentTask = thisGantt.getTask(tasks[0].parent)
    // 6409：完成审批
    // 6406：提交审批
    // 6405：变更中
    let statusList = [{ status: '6409', title: '完成审批' }, { status: '6406', title: '提交审批' }, { status: '6405', title: '变更中' }]
    let parent = statusList.filter(el => el.status == parentTask.managerStatus)
    if (parent && parent.length) {
      return createDisableResponse(`父任务状态为${parent[0].title}时不可粘贴`);
    }
    // 获取gannt操作限制策略
    const taskStatusLockMap = store.getters.taskStatusLockMap
    const editManagerStatus = taskStatusLockMap[parentTask.status]
    if (editManagerStatus && editManagerStatus.indexOf(parentTask.managerStatus) !== -1 && Object.keys(vueThis.copyTasks).length) {
      return false
    }
  }
  if (ganttName === 'changeGantt') {
    if (!vueThis.copyTasks || !vueThis.copyTasks.length) {
      return createDisableResponse(`请先复制再进行`);
    }
  } else {
    if (!(vueThis.copyTasks && vueThis.copyTasks.tasks && vueThis.copyTasks.tasks.length)) {
      return createDisableResponse(`请先复制再进行`);
    }
  }
}

// 判断自动/手动排程
export function isAllowAutoManual(ganttName, tasks) {
  if (autoSchedulingCheck(ganttName)) {
    return createDisableResponse(`任务已完成或编辑锁定时不允许此操作`);
  } else {
    return false
  }
}

// 判断是否允许更改样式
export function isAllowChangeStyle(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.createPage !== 'decompose' && checkContentRoot(ganttName, tasks)) {
    return createDisableResponse('包含根节点时不允许此操作');
  }
  if (isChangeGantt(ganttName).disable) {
    return createDisableResponse(isChangeGantt(ganttName).message)
  }
  const isDisableFunCheckRes = isDisableFunCheck(ganttName, tasks, '3')
  const res = checkReadOnly(ganttName)
  if (checkReadOnly(ganttName)) {
    return createDisableResponse(res.readonlyReason);
  }
  // if (isDisableFunCheckRes.value) {
  //   return false
  // } else {
  //   return createDisableResponse(isDisableFunCheckRes.msg);
  // }
}

// 判断当前视图类型是否为grid
export function isGridView(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.viewType && vueThis.viewType !== 'grid') {
    return false
  }
  return createDisableResponse(`当前已是`);
}
// 判断当前视图类型是否为gantt
export function isGanttView(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.viewType && vueThis.viewType !== 'gantt') {
    return false
  }
  return createDisableResponse(`当前已是`);
}
// 判断当前视图类型是否为resource
export function isResourceView(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.viewType && vueThis.viewType !== 'resource') {
    return false
  }
  return createDisableResponse(`当前已是`);
}

// 判断关键路径
export function isCriticalPath(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.viewType && (vueThis.viewType === 'resource' || vueThis.viewType === 'gantt')) {
    return false
  }
  return createDisableResponse(`编辑视图不可操作`);
}

// 判断是否允许导入
export function isAllowImport(ganttName, tasks) {
  const isDisableFunCheckRes = isDisableFunCheck(ganttName, tasks, '1')
  if (isDisableFunCheckRes.value) {
    return false
  } else if (checkEditTask(ganttName, tasks)) {
    return false
  } else {
    return createDisableResponse(isDisableFunCheckRes.msg);
  }
}

// 判断是否为分解页面
export function isDecomposePage(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.createPage === 'decompose') {
    return createDisableResponse(`任务分解页面不允许此操作`);
  } else {
    return false
  }
}

// 判断经验库导入
export function isExperienceImport(ganttName, tasks) {
  const ganttObject = GanttObject.getGanttObject(ganttName)
  if (ganttObject && tasks) {
    ganttObject.eachSelectedTask(function (taskId) {
      if (ganttObject.getGlobalTaskIndex(taskId) === 0) {
        return createDisableResponse(`根节点不允许此操作`);
      }
    })
  }
}

// 判断详细信息
export function isDetailInfo(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  const createPage = vueThis.createPage
  let ganttObject = GanttObject.getGanttObject(ganttName)
  if (tasks.length == 1 && !tasks[0].parent) {
    if (createPage == 'planChange' || createPage == 'compile' || createPage == 'taskStatistics') {
      return createDisableResponse(`任务不能为根节点`);
    } else {
      return false
    }
  } else if (tasks.length == 1) {
    return false
  } else {
    return createDisableResponse(`任务只能选中一个`);
  }
}

// 判断任务状态为未开始
export function isNotStart(ganttName, tasks) {
  for (let i = 0; tasks.length > i; i++) {
    if (tasks[i] && tasks[i].status === '6020') {
      return createDisableResponse('任务未开始');
    }
  }
}
// 判断选中的任务是否只变更记录
export function isChangeHistory(ganttName, tasks) {
  if (tasks && tasks.length === 1 && tasks[0].changeCount === '0') {
    return createDisableResponse(`无变更记录`);
  }
}
/**
 * 公共函数
 */

// 检测是否为暂停或者禁止
function checkSwitchType(tasks) {
  if (tasks.length === 0) {
    return true;
  }
  const switchType = tasks[0] ? tasks[0].switchType : '';
  return switchType === '9010' || switchType === '9020';
}

// 通用按钮禁用条件
function isDisableFunCheck(ganttName, tasks, checkType) {
  const vueThis = store.getters.vueThis
  // TODO 默认禁用原因未知
  let result = {
    value: false,
    msg: '按钮禁用'
  };
  const ganttObject = GanttObject.getGanttObject(ganttName);
  if (ganttObject && Object.keys(ganttObject).length > 0) {
    const taskIds = ganttObject.getSelectedTasks();
    if (checkReadOnly(ganttName)) {
      result.value = false;
      result.msg = ganttObject.config.readonlyReason
      return
    }
    if (!taskIds || taskIds.length === 0) {
      result.value = false;
      result.msg = '请选择任务'
      return
    } if (vueThis.readOnly) {
      result.value = false;
      result.msg = '当前为只读模式，不可操作'
      return
    }
    const taskReadonlyRes = checkTaskReadonly(ganttName, tasks)
    if (!taskReadonlyRes) {
      if (checkType === '1' && taskIds.length === 1) {
        result.value = true;
        result.msg = ''
      } else if (checkType === '2' && taskIds.length === 1 && !checkContentRoot(ganttName, tasks)) {
        result.value = true;
        result.msg = ''
      } else if (checkType === '3' && taskIds.length > 0 && !checkContentRoot(ganttName, tasks)) {
        result.value = true;
        result.msg = ''
      }
      // 变更中已删除任务不可操作
      if (ganttName === 'changeGantt') {
        taskIds.some(function (id) {
          const task = ganttObject.getTask(id);
          if (task.infoType && task.infoType === 'delete') {
            result.value = false;
            result.msg = '变更中已删除任务不可操作';
            return true;
          }
        });
      }
    } else {
      result.value = false;
      result.msg = taskReadonlyRes.readonlyReason;
    }
  } else {
    result.msg = 'gantt加载错误';
  }
  if(vueThis.planEditLock === '0') {
    result.value = true;
    result.msg = '';
  }
  return result;
}

// 发布后可控任务可新建下级
function checkEditTask(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName);
    const taskIds = ganttObject.getSelectedTasks();
    if (taskIds && taskIds.length === 1 && vueThis.ganttName === 'planGantt') {
      const taskId = taskIds[0];
      const task = ganttObject.getTask(taskId);
      const planStatusLockMap = store.getters.planStatusLockMap;
      const taskStatusLockMap = store.getters.taskStatusLockMap;
      const planEditStatus = planStatusLockMap[vueThis.planInfoStatus].ganttEdit;
      const editManagerStatus = taskStatusLockMap[task.status];
      if (planEditStatus && planEditStatus === 'true' && (!task.managerStatus || (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) !== -1))) {
        return true;
      }
    }
  }
  return false;
}

// 检测任务是否包含（备料/齐套/生产）/设计标识，则无法新建下级
function checkHasProductTask(tasks) {
  if (tasks.length === 0) {
    return true;
  }
  const planType = tasks[0] ? tasks[0].planType : '';
  if (planType) {
    if (planType === '3101' || (planType.indexOf('3103') !== -1 && planType !== '3103')) {
      return true
    }
  }
}

/**
 * 检查是否包含审批中任务
 * @param tasks
 */
function checkHasApproveTask(ganttName, tasks) {
  const vueThis = store.getters.vueThis
  if (vueThis.planEditLock === '0') return false
  let result = false
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    tasks.some(function (selTask) {
      if (selTask.managerStatus === '6406') {
        result = true
      }
      ganttObject.eachTask(function (task) {
        if (selTask.managerStatus === '6406') {
          result = true
        }
      }, selTask.id)
    })
  }
  return result
}

/**
 * 升级逻辑校验
 *    1.父为根节点的不可升级
 *    2.所选任务包含根节点时不可操作
 * @param ganttName
 * @param tasks
 * @returns {boolean}
 */
function outdentCheck(ganttName, tasks) {
  let result = true
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    ganttObject.eachSelectedTask(function (taskId) {
      if (ganttObject.isTaskExists(taskId)) {
        const task = ganttObject.getTask(taskId)
        const indexNo = ganttObject.getGlobalTaskIndex(taskId)
        if (indexNo === 0 || !task.parent || (ganttObject.isTaskExists(task.parent) && ganttObject.getGlobalTaskIndex(task.parent) === 0)) {
          result = false
        }
      }
    })
  }
  return result
}

/**
 * 任务降级校验
 *    1.所选任务中各任务上一个同级节点为已完成、审批中、变更中时，不可降级
 *    2.所选任务包含已完成、审批中、变更中时，不可降级
 *    3.所选任务包含根节点时不可降级
 *    4.所选任务中各任务上一个同级节点存在前后置关系的，不可降级
 *    5.所选任务为已下发，上方同级任务为待下发的，不可降级
 * @param ganttName
 * @returns {boolean}
 */
function canIndentCheck(ganttName) {
  let result = {
    value: true,
    msg: ''
  }
  if (ganttName) {
    const ganttObject = GanttObject.getGanttObject(ganttName)
    const selectedTaskIds = []
    const vueThis = store.getters.vueThis
    const selTaskIds = ganttObject.getSelectedTasks()
    // 直接父子同时选中时，只留父
    selTaskIds.forEach(function (id) {
      if (ganttObject.isTaskExists(id)) {
        const selTask = ganttObject.getTask(id)
        if (selTaskIds.indexOf(selTask.parent) === -1) {
          selectedTaskIds.push(id)
        }
      }
    })
    const taskEditMap = store.getters.taskStatusLockMap
    selectedTaskIds.some(function (id) {
      if (ganttObject.isTaskExists(id)) {
        const task = ganttObject.getTask(id)
        const indexNo = ganttObject.getGlobalTaskIndex(id)
        const editManagerStatus = taskEditMap[task.status]
        const preTaskId = ganttObject.getPrevSibling(id)
        // 不为根 && 父存在 && 不为已完成、审批中、变更中
        if (indexNo == 0) {
          result = {
            value: false,
            msg: '根节点不可操作'
          }
        } else if (!preTaskId || !ganttObject.isTaskExists(preTaskId)) {
          result = {
            value: false,
            msg: '没有上一个同级节点，不可操作'
          }
        } else if (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) == -1) {
          const vueThis = store.getters.vueThis
          if (vueThis.planEditLock === '0') return false
          result = {
            value: false,
            msg: `${statusName[task.managerStatus]}不允许操作`
          }
        } else {
          const preTask = ganttObject.getTask(preTaskId)
          const preIndexNo = ganttObject.getGlobalTaskIndex(preTaskId)
          // 父不为根 || 上一个同级节点为已完成、审批中、变更中 || （子为已下发 && 父为待下发）
          if (preIndexNo === 0) {
            result = {
              value: false,
              msg: '父节点为根节点，不可操作'
            }
          }
          if (editManagerStatus && editManagerStatus.indexOf(preTask.managerStatus) === -1) {
            const vueThis = store.getters.vueThis
            if (vueThis.planEditLock === '0') return false
            result = {
              value: false,
              msg: `上一个同级节点为${statusName[preTask.managerStatus]}，不可操作`
            }
          }
          // if (task.managerStatus !== preTask.managerStatus && preTask.managerStatus === vueThis.issueStatus) {
          //   result = {
          //     value: false,
          //     msg: '所选任务为已下发，上一个同级任务为待下发，不可操作'
          //   }
          // }
          // 存在前后置关系
          if (result.value && task.$target && task.$target.length > 0) {
            task.$target.forEach(function (linkId) {
              const link = ganttObject.getLink(linkId)
              if (result.value && link.source === preTaskId) {
                result = {
                  value: false,
                  msg: '存在前后置关系，不可操作'
                }
              }
            })
          }
          if (result.value && task.$source && task.$source.length > 0) {
            task.$source.forEach(function (linkId) {
              const link = ganttObject.getLink(linkId)
              if (result.value && link.target === preTaskId) {
                result = {
                  value: false,
                  msg: '存在前后置关系，不可操作'
                }
              }
            })
          }
          // 存在“生产，齐套，备料”标识
          if (preTask.planType) {
            // if (preTask.planType === '3101' || (preTask.planType.indexOf('3103') !== -1 && preTask.planType !== '3103')) {
            result = {
              value: false,
              msg: '上一个同级节点存在任务类型，不可操作'
              // }
            }
          }
        }
        // 子中否包含已完成、审批中、变更中
        // if (result) {
        //   ganttObject.eachTask(function (task) {
        //     let childManagerStatus = taskEditMap[task.status]
        //     let indexNo = ganttObject.getGlobalTaskIndex(task.id)
        //     if (indexNo === 0 || (childManagerStatus && childManagerStatus.indexOf(task.managerStatus) === -1 && indexNo !== 0) || task.readonly) {
        //       result = false
        //     }
        //   }, id)
        // }
      }
    })
  }
  return result
}

/**
 * 排程切换校验
 * @param ganttName
 * @returns {boolean}
 */
function autoSchedulingCheck(ganttName) {
  let result = false
  const ganttObject = GanttObject.getGanttObject(ganttName)
  // 已完成时不可切换
  if (ganttObject && ganttObject.config.readonly) {
    if (ganttObject.config.readonly) {
      result = true
    }
  }
  // 编辑加锁时不可切换
  const vueThis = store.getters.vueThis
  if (vueThis.monitorLockMap && vueThis.monitorLockMap.taskEdit === '1') {
    result = true
  }
  return result
}

/**
 * 删除操作逻辑校验
 *    1.所选任务或所选任务的子任务包含已完成、变更中时，不可删除
 *    2.所选任务包含根节点时不可删除
 *    3.所选任务或所选任务的子任务含审批中时，可删除，但提示
 *    4.发布后，可控任务不可删除
 * @param ganttName
 * @param tasks
 * @param vueThis
 * @returns {boolean}
 */
function canDeleteCheck(ganttName, tasks, vueThis) {
  const statusName = {
    6401: '已创建',
    6402: '协同编制',
    6403: '待下发',
    6404: '已下发',
    6405: '变更中',
    6406: '提交审批',
    6407: '审批驳回',
    6408: '审批撤销',
    6409: '审批完成'
  }
  let result = {
    value: true,
    msg: ''
  }
  // 获取gannt操作限制策略
  const planStatusLockMap = store.getters.planStatusLockMap
  const planEditStatus = planStatusLockMap[vueThis.planInfoStatus].ganttEdit
  const controlTaskEdit = planStatusLockMap[vueThis.planInfoStatus].controlTaskEdit
  let msg = ''
  // 定义不可删除的状态
  switch (vueThis.planInfoStatus) {
    case '1000':
      msg = '已创建'
      break
    case '1010':
      msg = '协同编制'
      break
    case '1070':
      msg = '进行中'
      break
    case '1090':
      msg = '已完成'
      break

  }
  if (planEditStatus === 'false') {
    return {
      value: false,
      msg: '项目状态为' + msg + '，不可删除'
    }
  } else {
    if (ganttName) {
      const ganttObject = GanttObject.getGanttObject(ganttName)
      const taskEditMap = store.getters.taskStatusLockMap
      const selectedTaskIds = []
      const selTaskIds = ganttObject.getSelectedTasks()
      selTaskIds.forEach(function (id) {
        if (ganttObject.isTaskExists(id)) {
          let flag = true
          ganttObject.eachParent(function (task) {
            // 排除根节点和父节点也选中的节点
            if (flag && ganttObject.getGlobalTaskIndex(task.id) !== 0 && selTaskIds.indexOf(task.id) !== -1) {
              flag = false
            }
          }, id)
          if (flag && selectedTaskIds.indexOf(id) === -1) {
            selectedTaskIds.push(id)
          }
        }
      })
      selectedTaskIds.some(function (selTaskId) {
        const selTask = ganttObject.getTask(selTaskId)
        //
        //
        const editManagerStatus = taskEditMap[selTask.status]
        //
        const indexNo = ganttObject.getGlobalTaskIndex(selTask.id)
        if (!result.value) {
          return true
        }
        // 发布后可控任务不可删除
        if (controlTaskEdit && controlTaskEdit === 'false' && selTask.weatherControl && selTask.weatherControl === '1') {
          result = {
            value: false,
            msg: '发布后可控任务不可删除'
          }
          return true
        }
        if (indexNo === 0) {
          result = {
            value: false,
            msg: '根节点不可删除'
          }
          return true
        }
        if (editManagerStatus && editManagerStatus.indexOf(selTask.managerStatus) === -1 && indexNo !== 0) {
          const vueThis = store.getters.vueThis
          if (vueThis.planEditLock === '0') return false
          result = {
            value: false,
            msg: `所选任务状态为${statusName[selTask.managerStatus]}时,不可删除`
          }
          return true
        }
        ganttObject.eachTask(function (task) {
          const chiManagerStatus = taskEditMap[task.status]
          const indexNo = ganttObject.getGlobalTaskIndex(task.id)
          // 发布后可控任务不可删除
          if (controlTaskEdit && controlTaskEdit === 'false' && task.weatherControl && task.weatherControl === '1') {
            result = {
              value: false,
              msg: '发布后可控任务不可删除'
            }
            return true
          }
          if (indexNo === 0) {
            result = {
              value: false,
              msg: '根节点不可删除'
            }
          }
          if (chiManagerStatus && chiManagerStatus.indexOf(task.managerStatus) === -1 && indexNo !== 0) {
            const vueThis = store.getters.vueThis
            if (vueThis.planEditLock === '0') return false
            result = {
              value: false,
              msg: `所选任务状态为${statusName[selTask.managerStatus]}时,不可删除`
            }
          }
        }, selTask.id)
      })
    }
  }
  return result
}

// 使用同步逻辑判断按钮是否为disable
function isDisable(checks) {

  for (const check of checks) {
    const result = check();
    if (result) {
      return result
    }
  }
  return {
    disable: false
  };
}

export default isDisable;
