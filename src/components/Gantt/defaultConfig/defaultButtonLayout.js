const TabsLayout = [
  {
    panelName: '任务',
    noWrap: true,
    groups: [
      {
        groupName: '编辑',
        buttonConfigs: [
          {
            buttonId: 'create-children',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'create-equative',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'remove-tasks',
            size: 'small',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '样式',
        buttonConfigs: [
          {
            buttonId: 'color-red',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-bold',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-blue',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-italic',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-green',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-underline',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-purple',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'removeStyle',
            size: 'mini',
            position: ['top']
          }
        ]
      }
    ]
  },
  {
    panelName: '数据',
    groups: [
      {
        groupName: '导入',
        buttonConfigs: [
          {
            buttonId: 'excel-import',
            size: 'large',
            position: ['top']
          }
          // {
          //   buttonId: 'project-import',
          //   size: 'large'
          // }
        ]
      },
      {
        groupName: '导出',
        buttonConfigs: [
          {
            buttonId: 'excel-export',
            size: 'large',
            position: ['top']
          }
          // {
          //   buttonId: 'project-export',
          //   size: 'large'
          // }
        ]
      }
    ]
  },
  {
    panelName: '视图',
    groups: [
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
          // {
          //   buttonId: 'plan-gantt-resource',
          //   size: 'large'
          // },
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
          }
          // {
          //   buttonId: 'grid-setting',
          //   size: 'large',
          //   position: ['top']
          // }
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

const DoubleLayout = [
  {
    panelName: '任务',
    noWrap: true,
    groupNameVisible: true, // 默认不显示组名
    groups: [
      {
        groupName: '编辑',
        buttonConfigs: [
          {
            buttonId: 'create-children',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'create-equative',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'remove-tasks',
            size: 'small',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '样式',
        buttonConfigs: [
          {
            buttonId: 'color-red',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-bold',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-blue',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-italic',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-green',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-underline',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-purple',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'removeStyle',
            size: 'mini',
            position: ['top']
          }
        ]
      },
      {
        groupName: '导入',
        buttonConfigs: [
          {
            buttonId: 'excel-import',
            size: 'large',
            position: ['top']
          }
          // {
          //   buttonId: 'project-import',
          //   size: 'large'
          // }
        ]
      },
      {
        groupName: '导出',
        buttonConfigs: [
          {
            buttonId: 'excel-export',
            size: 'large',
            position: ['top']
          }
          // {
          //   buttonId: 'project-export',
          //   size: 'large'
          // }
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
          // {
          //   buttonId: 'plan-gantt-resource',
          //   size: 'large',
          //   position: ['top']
          // },
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
          }
          // {
          //   buttonId: 'grid-setting',
          //   size: 'large',
          //   position: ['top']
          // }
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

const SingleLayout = [
  {
    panelName: '任务',
    noWrap: true,
    groupNameVisible: true, // 默认不显示组名
    groups: [
      {
        groupName: '编辑',
        buttonConfigs: [
          {
            buttonId: 'create-children',
            size: 'mini',
            position: ['top', 'right']
          },
          {
            buttonId: 'create-equative',
            size: 'mini',
            position: ['top', 'right']
          },
          {
            buttonId: 'remove-tasks',
            size: 'mini',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '样式',
        buttonConfigs: [
          {
            buttonId: 'color-red',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-bold',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-blue',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-italic',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-green',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'font-underline',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'color-purple',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'removeStyle',
            size: 'mini',
            position: ['top']
          }
        ]
      },
      {
        groupName: '导入',
        buttonConfigs: [
          {
            buttonId: 'excel-import',
            size: 'mini',
            position: ['top']
          }
        ]
      },
      {
        groupName: '导出',
        buttonConfigs: [
          {
            buttonId: 'excel-export',
            size: 'mini',
            position: ['top']
          }
        ]
      },
      {
        groupName: '页面布局',
        buttonConfigs: [
          {
            buttonId: 'plan-edit-gantt',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'plan-gantt',
            size: 'mini',
            position: ['top']
          },
          // {
          //   buttonId: 'plan-gantt-resource',
          //   size: 'small',
          //   position: ['top']
          // },
          {
            buttonId: 'critical-path',
            size: 'mini',
            position: ['top']
          }
        ]
      },
      {
        groupName: '缩放/列设置',
        buttonConfigs: [
          {
            buttonId: 'full-screen',
            size: 'mini',
            position: ['top']
          }
          // {
          //   buttonId: 'grid-setting',
          //   size: 'mini',
          //   position: ['top']
          // }
        ]
      },
      {
        groupName: '设置',
        buttonConfigs: [
          {
            buttonId: 'menu-config',
            size: 'mini',
            position: ['top']
          }
        ]
      }
    ]
  }
]

const RightMenuData = [
  {
    buttonId: 'create-children',
    title: '新建下级'
  },
  {
    buttonId: 'create-equative',
    title: '新建同级'
  },
  {
    buttonId: 'remove-tasks',
    title: '删除'
  }
]

export { TabsLayout, DoubleLayout, SingleLayout, RightMenuData }
