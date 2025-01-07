const CommandButtonBarData = [
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
            buttonId: 'outdent-task',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'indent-task',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'copy-tasks',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'paste-tasks',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'redo-tasks',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'undo-tasks',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'batch-owner',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'remove-tasks',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'detail-info',
            size: 'large',
            position: ['top', 'right']
          },
          // {
          //   buttonId: 'suspend-config',
          //   size: 'small',
          //   position: ['top']
          // },
          // {
          //   buttonId: 'forbid-config',
          //   size: 'small',
          //   position: ['top']
          // }
        ]
      },
      {
        groupName: '任务标识',
        buttonConfigs: 'command-monitor' // 标识组件
      },
      {
        groupName: '任务类型',
        buttonConfigs: 'command-classify' // 类型组件
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
            buttonId: 'font-lineThrough',
            size: 'mini',
            position: ['top']
          },
          {
            buttonId: 'removeStyle',
            size: 'large',
            position: ['top']
          }
        ]
      },
      {
        groupName: '协作',
        buttonConfigs: [
          {
            buttonId: 'issue-tasks',
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
        groupName: '需求管理',
        buttonConfigs: [
          {
            buttonId: 'demand-management',
            size: 'large',
            position: ['top', 'right']
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
            position: ['top', 'right']
          },
          {
            buttonId: 'project-import',
            size: 'large',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '导出',
        buttonConfigs: [
          {
            buttonId: 'excel-export',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'project-export',
            size: 'large',
            position: ['top', 'right']
          }
        ]
      }
    ]
  },
  {
    panelName: '知识库',
    groups: [
      {
        groupName: '知识库',
        buttonConfigs: [
          {
            buttonId: 'activity-import',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'my-experience',
            size: 'large',
            position: ['top', 'right']
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
    panelName: '变更历史',
    groups: [
      {
        groupName: '变更历史',
        buttonConfigs: [
          {
            buttonId: 'change-history',
            size: 'large',
            position: ['top']
          }
        ]
      }
    ]
  },
  {
    panelName: '统计信息',
    groups: 'command-statistic' // 组件名称
  },
  {
    panelName: '版本',
    groups: [
      {
        groupName: '编辑',
        buttonConfigs: [
          {
            buttonId: 'create-version',
            size: 'large',
            position: ['top']
          }
        ]
      },
      {
        groupName: '管理',
        buttonConfigs: [
          {
            buttonId: 'version-list',
            size: 'large',
            position: ['top']
          }
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
  }
]

export { CommandButtonBarData }
