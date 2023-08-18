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
          // {
          //   buttonId: 'common-resources',
          //   size: 'small'
          // },
          {
            buttonId: 'outdent-task',
            size: 'small'
          },
          {
            buttonId: 'indent-task',
            size: 'small'
          },
          // {
          //   buttonId: 'undo-tasks',
          //   size: 'small'
          // },
          // {
          //   buttonId: 'redo-tasks',
          //   size: 'small'
          // },
          {
            buttonId: 'copy-tasks',
            size: 'small'
          },
          {
            buttonId: 'paste-tasks',
            size: 'small'
          },
          {
            buttonId: 'hierarchy-filter',
            size: 'small'
          },
          // {
          //   buttonId: 'plan-scheduling',
          //   size: 'small'
          // },
          {
            buttonId: 'batch-owner',
            size: 'small'
          },
          {
            buttonId: 'batch-sync',
            size: 'small'
          },
          // {
          //   buttonId: 'product-message',
          //   size: 'small'
          // },
          {
            buttonId: 'product-task-view',
            size: 'small'
          },
          {
            buttonId: 'out-put-view',
            size: 'small'
          },
          {
            buttonId: 'remove-tasks',
            size: 'large'
          },
          {
            buttonId: 'product-task',
            size: 'small'
          },
          {
            buttonId: 'unSuspend-config',
            size: 'small'
          },
          {
            buttonId: 'suspend-config',
            size: 'small'
          },
          {
            buttonId: 'forbid-config',
            size: 'small'
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
      },
      {
        groupName: '数据推送',
        buttonConfigs: [
          {
            buttonId: 'erp-pull',
            size: 'large'
          },
          {
            buttonId: 'pdm-pull',
            size: 'large'
          }
          // {
          //   buttonId: 'master-pull',
          //   size: 'large'
          // }
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
          },
          {
            buttonId: 'my-experience-import',
            size: 'large'
          }
        ]
      }
    ]
  },
  {
    panelName: '资源',
    groups: [
      // 组件名称
      {
        groupName: '团队管理',
        // groupName: '人力资源',
        buttonConfigs: [
          {
            buttonId: 'resource-group-setting',
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
    groups: '' // 组件名称
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
  }
]

export { CommandButtonBarData }
