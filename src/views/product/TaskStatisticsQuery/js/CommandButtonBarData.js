const CommandButtonBarDataSingleRow = [
  {
    panelName: '工具',
    noWrap: true,
    groupNameVisible: true, // 默认不显示组名
    groups: [
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
          // {
          //   buttonId: 'location-list',
          //   size: 'small',
          //   position: ['top']
          // }
        ]
      },
      {
        groupName: '历史',
        buttonConfigs: [
          {
            buttonId: 'change-history',
            size: 'small',
            position: ['top']
          },
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
        groupName: '展开/折叠',
        buttonConfigs: [
          {
            buttonId: 'expand-all',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'collapse-all',
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
          },
        ]
      }
    ]
  }
]

export default CommandButtonBarDataSingleRow
