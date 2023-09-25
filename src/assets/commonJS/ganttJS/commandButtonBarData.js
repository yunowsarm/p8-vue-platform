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
            size: 'large'
          },
          {
            buttonId: 'create-equative',
            size: 'large'
          },
          {
            buttonId: 'outdent-task',
            size: 'small'
          },
          {
            buttonId: 'indent-task',
            size: 'small'
          },
          {
            buttonId: 'copy-tasks',
            size: 'small'
          },
          {
            buttonId: 'paste-tasks',
            size: 'small'
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
            buttonId: 'remove-tasks',
            size: 'large'
          },
          {
            buttonId: 'detail-info',
            size: 'large',
            position: ['top', 'right']
          },
          {
            buttonId: 'suspend-config',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'forbid-config',
            size: 'small',
            position: ['top']
          }
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
            size: 'mini'
          },
          {
            buttonId: 'font-bold',
            size: 'mini'
          },
          {
            buttonId: 'color-blue',
            size: 'mini'
          },
          {
            buttonId: 'font-italic',
            size: 'mini'
          },
          {
            buttonId: 'color-green',
            size: 'mini'
          },
          {
            buttonId: 'font-underline',
            size: 'mini'
          },
          {
            buttonId: 'color-purple',
            size: 'mini'
          },
          {
            buttonId: 'removeStyle',
            size: 'large'
          }
        ]
      },
      {
        groupName: '协作',
        buttonConfigs: [
          {
            buttonId: 'issue-tasks',
            size: 'large'
          },
          {
            buttonId: 'issue-message',
            size: 'large'
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
            size: 'large'
          },
          {
            buttonId: 'project-import',
            size: 'large'
          }
        ]
      },
      {
        groupName: '导出',
        buttonConfigs: [
          {
            buttonId: 'excel-export',
            size: 'large'
          },
          {
            buttonId: 'project-export',
            size: 'large'
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
            size: 'large'
          },
          {
            buttonId: 'my-experience',
            size: 'large'
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
  },
  {
    panelName: '版本',
    groups: [
      {
        groupName: '编辑',
        buttonConfigs: [
          {
            buttonId: 'create-version',
            size: 'large'
          },
          {
            buttonId: 'version-compare',
            size: 'large'
          }
        ]
      },
      {
        groupName: '管理',
        buttonConfigs: [
          {
            buttonId: 'version-list',
            size: 'large'
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
            size: 'large'
          },
          {
            buttonId: 'plan-gantt',
            size: 'large'
          },
          {
            buttonId: 'plan-gantt-resource',
            size: 'large'
          },
          {
            buttonId: 'critical-path',
            size: 'large'
          }
        ]
      },
      {
        groupName: '缩放/列设置',
        buttonConfigs: [
          {
            buttonId: 'full-screen',
            size: 'large'
          },
          {
            buttonId: 'grid-setting',
            size: 'large'
          }
        ]
      }
    ]
  }
]

export { CommandButtonBarData }
