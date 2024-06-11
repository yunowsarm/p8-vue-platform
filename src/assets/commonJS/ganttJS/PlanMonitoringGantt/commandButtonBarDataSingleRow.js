const CommandButtonBarDataSingleRow = [
  {
    panelName: '任务',
    noWrap: true,
    groupNameVisible: true, // 默认不显示组名
    groups: [
      {
        groupName: '协作',
        buttonConfigs: [
          {
            buttonId: 'detail-info',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'issue-message',
            size: 'small',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '查询',
        buttonConfigs: [
          {
            buttonId: 'search-list',
            size: 'small',
            position: ['top']
          }
        ]
      },
      {
        groupName: '统计信息',
        buttonConfigs: [
          {
            buttonId: 'statistic-list',
            size: 'small',
            position: ['top']
          }
        ]
      },
      {
        groupName: '版本管理',
        buttonConfigs: [
          {
            buttonId: 'version-list',
            size: 'small',
            position: ['top']
          }
        ]
      },
      {
        groupName: '页面布局',
        buttonConfigs: [
          {
            buttonId: 'plan-edit-gantt',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'plan-gantt',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'plan-gantt-resource',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'critical-path',
            size: 'small',
            position: ['top']
          }
        ]
      },
      {
        groupName: '缩放/列设置',
        buttonConfigs: [
          {
            buttonId: 'full-screen',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'grid-setting',
            size: 'small',
            position: ['top']
          }
        ]
      },
      {
        groupName: '设置',
        buttonConfigs: [
          {
            buttonId: 'menu-config',
            size: 'small',
            position: ['top']
          }
        ]
      }
    ]
  }
]

export { CommandButtonBarDataSingleRow }
