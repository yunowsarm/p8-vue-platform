const CommandButtonBarData = [
  {
    panelName: '工具',
    noWrap: true,
    groupNameVisible: true, // 默认不显示组名
    groups: [
      {
        groupName: '任务',
        buttonConfigs: [
          {
            buttonId: 'detail-info',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'issue-message',
            size: 'large',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '版本管理',
        buttonConfigs: [
          {
            buttonId: 'version-list',
            size: 'large',
            position: ['top']
          }
        ]
      },
      {
        groupName: '页面布局',
        buttonConfigs: [
          {
            buttonId: 'plan-edit-gantt',
            size: 'large',
            position: ['top']
          },
          {
            buttonId: 'plan-gantt',
            size: 'large',
            position: ['top']
          },
          {
            buttonId: 'plan-gantt-resource',
            size: 'large',
            position: ['top']
          },
          {
            buttonId: 'critical-path',
            size: 'large',
            position: ['top']
          }
        ]
      },
      {
        groupName: '缩放/列设置',
        buttonConfigs: [
          {
            buttonId: 'full-screen',
            size: 'large',
            position: ['top']
          },
          {
            buttonId: 'grid-setting',
            size: 'large',
            position: ['top']
          }
        ]
      }
    ]
  },
  {
    panelName: '查询',
    groups: 'command-search' // 组件名称
  },
  {
    panelName: '统计信息',
    groups: 'command-statistic' // 组件名称
  }
]

export { CommandButtonBarData }
