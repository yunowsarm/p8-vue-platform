const CommandButtonBarDataDoubleRow = [
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
        groupName: '版本',
        buttonConfigs: [
          {
            buttonId: 'version-compare',
            size: 'small',
            position: ['top']
          },
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
        groupName: '自定义',
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
            size: 'large',
            position: ['top']
          }
        ]
      }
    ]
  }
]

export { CommandButtonBarDataDoubleRow }
