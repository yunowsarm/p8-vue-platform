const CommandButtonBarDataDoubleRow = [
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
          // {
          //   buttonId: 'common-resources',
          //   size: 'small'
          // },
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
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'paste-tasks',
            size: 'small',
            position: ['top', 'right']
          },
          // {
          //   buttonId: 'hierarchy-filter',
          //   size: 'large',
          //   position: ['top']
          // },
          // {
          //   buttonId: 'plan-scheduling',
          //   size: 'small'
          // },
          {
            buttonId: 'batch-owner',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'batch-sync',
            size: 'small',
            position: ['top']
          },
          // {
          //   buttonId: 'product-message',
          //   size: 'small',
          //   position: ['top', 'right']
          // },
          {
            buttonId: 'product-task-view',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'out-put-view',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'remove-tasks',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'product-task',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'task-sync',
            size: 'small',
            position: ['right']
          },
          {
            buttonId: 'unSuspend-config',
            size: 'small',
            position: ['top']
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
        buttonConfigs: 'command-monitor', // 标识组件
        position: ['top']
      },
      {
        groupName: '任务类型',
        buttonConfigs: 'command-classify', // 类型组件
        position: ['top']
      },
      // {
      //   panelName: '查询',
      //   buttonConfigs: 'command-search' // 组件名称
      // },
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
            size: 'small',
            position: ['top']
          }
        ]
      },
      {
        groupName: '协作',
        buttonConfigs: [
          {
            buttonId: 'issue-tasks',
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
        groupName: '导入',
        buttonConfigs: [
          {
            buttonId: 'excel-import',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'project-import',
            size: 'small',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '导出',
        buttonConfigs: [
          {
            buttonId: 'excel-export',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'project-export',
            size: 'small',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '数据推送',
        buttonConfigs: [
          {
            buttonId: 'erp-pull',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'pdm-pull',
            size: 'small',
            position: ['top']
          }
          // {
          //   buttonId: 'master-pull',
          //   size: 'large'
          // }
        ]
      },
      {
        groupName: '知识库',
        buttonConfigs: [
          {
            buttonId: 'activity-import',
            size: 'small',
            position: ['top', 'right']
          },
          {
            buttonId: 'my-experience',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'my-experience-import',
            size: 'small',
            position: ['top', 'right']
          }
        ]
      },
      {
        groupName: '团队管理',
        // groupName: '人力资源',
        buttonConfigs: [
          {
            buttonId: 'resource-group-setting',
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
        groupName: '版本编辑',
        buttonConfigs: [
          {
            buttonId: 'create-version',
            size: 'small',
            position: ['top']
          },
          {
            buttonId: 'version-compare',
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
      // {
      //   groupName: '查询',
      //   buttonConfigs: [
      //     {
      //       buttonId: 'search-list',
      //       size: 'large',
      //       position: ['top']
      //     }
      //   ]
      // },
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
