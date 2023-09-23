/**
 * 业务流程管理
 */

export const workflowApi = {
  ProcessDefinition: [
    {
      name: 'listData',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/list',
      mockPath: '/bpm/manage/ProcessDefinition/list',
      desc: '业务流程管理->流程资源模板->列表数据'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/listData',
      mockPath: '/bpm/manage/ProcessDefinition/listData',
      desc: '业务流程管理->流程资源模板->列表数据'
    },
    {
      name: 'deploy',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/deploy',
      mockPath: '/bpm/manage/ProcessDefinition/deploy',
      desc: '业务流程管理->流程模板->部署'
    },
    {
      name: 'getModelPicture',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/getModelPicture',
      mockPath: '/bpm/manage/ProcessDefinition/getModelPicture',
      desc: '业务流程管理->流程模板->查看流程图'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/delete',
      mockPath: '/bpm/manage/ProcessDefinition/delete',
      desc: '业务流程管理->流程模板->删除'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/save',
      mockPath: '/bpm/manage/ProcessDefinition/save',
      desc: '业务流程管理->流程模板->新建保存'
    },
    {
      name: 'bpmnSave',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/bpmnSave',
      mockPath: '/bpm/manage/ProcessDefinition/bpmnSave',
      desc: '业务流程管理->流程模板->编辑流程模板保存'
    },
    {
      name: 'repeatedCheck',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/repeatedCheck',
      mockPath: '/bpm/manage/ProcessDefinition/repeatedCheck',
      desc: '业务流程管理->流程模板->流程名称、key必填校验'
    },
    {
      name: 'export',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/export',
      mockPath: '/bpm/manage/ProcessDefinition/export',
      desc: '业务流程管理->流程模板->流程导出'
    },
    {
      name: 'getfindWorkFlowView',
      method: 'POST',
      path: '/bpm/manage/ProcessDefinition/getProcessByBusinessId',
      mockPath: '/bpm/manage/ProcessDefinition/getProcessByBusinessId',
      desc: '查看审批位置流程图'
    }
  ],
  PersonalProcessApproval: [
    {
      name: 'batchSaveResult',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/batchSaveResult',
      mockPath: '/bpm/personal/ProcessApproval/batchSaveResult',
      desc: '批量保存审批结果'
    },
    {
      name: 'approvalInfos',
      method: 'GET',
      path: '/bpm/personal/ProcessApproval/getApprovalInfosByBusinessId',
      mockPath: '/bpm/personal/ProcessApproval/getApprovalInfosByBusinessId',
      desc: '首页->个人审批流程共->流程图查看审批意见及审批节点数据'
    },
    {
      name: 'processInstApprovalInfos',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/processInstApprovalInfos',
      mockPath: '/bpm/personal/ProcessApproval/processInstApprovalInfos',
      desc: '首页->个人审批流程->流程图查看审批意见及审批节点数据'
    },
    {
      name: 'approvalRecords',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/approvalRecords',
      mockPath: '/bpm/personal/ProcessApproval/approvalRecords',
      desc: '首页->个人审批流程->审批记录'
    },
    {
      name: 'getFormData',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getFormData',
      mockPath: '/bpm/personal/ProcessApproval/getFormData',
      desc: '首页->个人审批流程->获取审批任务表单信息'
    },
    {
      /*
      * 可接受的参数组合
        1、processDefinitionId                         --精确匹配定义
        2、businessId & processDefinitionKey           --精确匹配定义
        3、processDefinitionKey                        --最后一个版本定义
      * */
      name: 'getProcessDefinitionByBusinessId',
      method: 'GET',
      path: '/bpm/manage/ProcessDefinition/getProcessDefinitionByBusinessId',
      mockPath: '/bpm/manage/ProcessDefinition/getProcessDefinitionByBusinessId',
      desc: '根据业务Id获取流程定义xml'
    },
    {
      name: 'saveResult',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/saveResult',
      mockPath: '/bpm/personal/ProcessApproval/saveResult',
      desc: '保存审批结果'
    },
    {
      name: 'getNextApproveUser',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getNextApproveUser',
      mockPath: '/bpm/personal/ProcessApproval/getNextApproveUser',
      desc: '获取下一节点的可选审批人'
    },
    {
      name: 'getTaskDefinition',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getTaskDefinition',
      mockPath: '/bpm/personal/ProcessApproval/getTaskDefinition',
      desc: '获取获取流程人工任务'
    },
    {
      name: 'setApproveUser',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/setApproveUser',
      mockPath: '/bpm/personal/ProcessApproval/setApproveUser',
      desc: '设置流程任务的审批人'
    },
    {
      name: 'claimListList',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/claimListList',
      mockPath: '/bpm/personal/ProcessApproval/claimListList',
      desc: '待认领列表数据'
    },
    {
      name: 'approvalPendingTotal',
      method: 'GET',
      path: '/bpm/personal/ProcessApproval/approvalPendingTotal',
      mockPath: '/bpm/personal/ProcessApproval/approvalPendingTotal',
      desc: '获取待审批合计'
    },
    {
      name: 'findMessageInfo',
      method: 'POST',
      path: '/framework/message/remind/findMessageInfo',
      mockPath: '/framework/message/remind/findMessageInfo',
      desc: '校验是否有新的消息'
    },
    {
      name: 'checkNoticeMsg',
      method: 'POST',
      path: '/framework/message/remind/checkNoticeMsg',
      mockPath: '/framework/message/remind/checkNoticeMsg',
      desc: '校验是否有新的消息'
    },
    {
      name: 'saveApproveMsg',
      method: 'POST',
      path: '/framework/message/remind/saveApproveMsg',
      mockPath: '/product/PmMessageRemind/saveApproveMsg',
      desc: '保存消息'
    },
    {
      name: 'saveNoticeMsg',
      method: 'POST',
      path: '/framework/message/remind/saveNoticeMsg',
      mockPath: '/product/PmMessageRemind/saveNoticeMsg',
      desc: '保存消息'
    },
    {
      name: 'approvalHistoryList',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/approvalHistoryList',
      mockPath: '/bpm/personal/ProcessApproval/approvalHistoryList',
      desc: '获取审批历史'
    },
    {
      name: 'pendingApprovalList',
      method: 'POST',
      path: '/product/pm/appeal/pendingApprovalList',
      mockPath: '/product/pm/appeal/pendingApprovalList',
      desc: '获取待处理/审批中'
    },
    {
      name: 'historyApprovalList',
      method: 'POST',
      path: '/product/pm/appeal/historyApprovalList',
      mockPath: '/product/pm/appeal/historyApprovalList',
      desc: '获取已处理/已审批'
    },
    {
      name: 'getApproveContentViewUrl',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getApproveContentViewUrl',
      mockPath: '/bpm/personal/ProcessApproval/getApproveContentViewUrl',
      desc: '获取审批内容资源'
    },
    {
      name: 'processHistoryList',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/processHistoryList',
      mockPath: '/bpm/personal/ProcessApproval/processHistoryList',
      desc: '获取实例的所有审批历史'
    },
    {
      name: 'customHistoryList',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/customHistoryList',
      mockPath: '/bpm/personal/ProcessApproval/customHistoryList',
      desc: '获取实例的所有审批历史'
    },
    {
      name: 'cancelAndStartTask',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/cancelAndStartTask',
      mockPath: '/bpm/personal/ProcessApproval/cancelAndStartTask',
      desc: '任务回退'
    },
    {
      name: 'getHistoricVariable',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getHistoricVariable',
      mockPath: '/bpm/personal/ProcessApproval/getHistoricVariable',
      desc: '获取流程参数'
    },
    {
      name: 'getBpmnSnapshoot',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getBpmnSnapshoot',
      mockPath: '/bpm/personal/ProcessApproval/getBpmnSnapshoot',
      desc: '获取快照'
    },
    {
      name: 'getApproveUsers',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getApproveUsers',
      mockPath: '/bpm/personal/ProcessApproval/getApproveUsers',
      desc: '获取流程实例的预先审批人'
    }
  ]
}
