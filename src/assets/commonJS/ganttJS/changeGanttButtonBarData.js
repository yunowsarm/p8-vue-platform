const ChangeGanttButtonBarData = [
  {
    panelName: '视图',
    noWrap: true,
    groupNameVisible: false, // 默认不显示组名
    groups: [
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
          }
        ]
      },
      {
        groupName: '查询与菜单配置',
        buttonConfigs: [
          {
            buttonId: 'search-list',
            size: 'small',
            position: ['top']
          }
        ]
      }
    ]
  }
  // {
  //   panelName: '查询',
  //   groups: 'command-search' // 组件名称
  // }
]

export { ChangeGanttButtonBarData }
