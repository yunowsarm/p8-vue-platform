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
        ]
      },
      {
        groupName: '协作',
        buttonConfigs: [
          {
            buttonId: 'issue-message',
            size: 'large',
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
          },
          {
            buttonId: 'reset-list',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'location-list',
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
            size: 'large',
            position: ['top']
          }
        ]
      },
      {
        groupName: '版本',
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
        groupName: '缩放',
        buttonConfigs: [
          {
            buttonId: 'full-screen',
            size: 'large',
            position: ['top']
          }
        ]
      },
      {
        groupName: '列设置',
        buttonConfigs: [
          {
            buttonId: 'grid-setting',
            size: 'large',
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
