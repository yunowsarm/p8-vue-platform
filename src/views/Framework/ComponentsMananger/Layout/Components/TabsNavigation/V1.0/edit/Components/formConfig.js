// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。



export default {
  default: [
    {
      type: 'radioButton',
      labelText: '选项页样式',
      fieldName: 'type',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '默认',
          value: '0'
        },
        {
          label: '选项卡',
          value: 'card'
        },
        {
          label: '卡片',
          value: 'border-card'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '选项页位置',
      fieldName: 'tabPosition',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '上',
          value: 'top'
        },
        {
          label: '左',
          value: 'left'
        },
        {
          label: '下',
          value: 'bottom'
        },
        {
          label: '右',
          value: 'right'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '标签宽度自适应',
      fieldName: 'stretch',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '是',
          value: true
        },
        {
          label: '否',
          value: false
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigation',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '参数传递',
          value: '0'
        },
        {
          label: '组件切换',
          value: '1'
        },
        {
          label: '三级菜单',
          value: '2'
        }
      ]
    }
  ],
  dicFormNavigation: [
    {
      type: 'radioButton',
      labelText: '选项页样式',
      fieldName: 'type',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '默认',
          value: '0'
        },
        {
          label: '选项卡',
          value: 'card'
        },
        {
          label: '卡片',
          value: 'border-card'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '选项页位置',
      fieldName: 'tabPosition',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '上',
          value: 'top'
        },
        {
          label: '左',
          value: 'left'
        },
        {
          label: '下',
          value: 'bottom'
        },
        {
          label: '右',
          value: 'right'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '标签宽度自适应',
      fieldName: 'stretch',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '是',
          value: true
        },
        {
          label: '否',
          value: false
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigation',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '参数传递',
          value: '0'
        },
        {
          label: '组件切换',
          value: '1'
        },
        {
          label: '三级菜单',
          value: '2'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '数据类型',
      fieldName: 'dataType',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      options: [
        {
          label: '静态数据',
          value: '0'
        },
        {
          label: '动态数据',
          value: '1'
        }
      ],
      rules: [{ required: true }]
    }
  ],
  dicFormdataType: [
    {
      type: 'radioButton',
      labelText: '选项页样式',
      fieldName: 'type',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '默认',
          value: '0'
        },
        {
          label: '选项卡',
          value: 'card'
        },
        {
          label: '卡片',
          value: 'border-card'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '选项页位置',
      fieldName: 'tabPosition',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '上',
          value: 'top'
        },
        {
          label: '左',
          value: 'left'
        },
        {
          label: '下',
          value: 'bottom'
        },
        {
          label: '右',
          value: 'right'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '标签宽度自适应',
      fieldName: 'stretch',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '是',
          value: true
        },
        {
          label: '否',
          value: false
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigation',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '参数传递',
          value: '0'
        },
        {
          label: '组件切换',
          value: '1'
        },
        {
          label: '三级菜单',
          value: '2'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '数据类型',
      fieldName: 'dataType',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      options: [
        {
          label: '静态数据',
          value: '0'
        },
        {
          label: '动态数据',
          value: '1'
        }
      ],
      rules: [{ required: true }]
    },
    {
      type: 'blank',
      labelText: '数据视图',
      slotName: 'reportSqlId',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true,
          message: '数据视图必填'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '选项页名称',
      slotName: 'optionLabelCol',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true,
          message: '选项页名称必填'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '图标设置',
      slotName: 'icon',
      colLayout: 'doubleCol',
      rules: [
        {
          required: false,
          message: '必填'
        }
      ]
    }
  ],
  dicFormUrl: [
    {
      type: 'radioButton',
      labelText: '选项页样式',
      fieldName: 'type',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '默认',
          value: '0'
        },
        {
          label: '选项卡',
          value: 'card'
        },
        {
          label: '卡片',
          value: 'border-card'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '选项页位置',
      fieldName: 'tabPosition',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '上',
          value: 'top'
        },
        {
          label: '左',
          value: 'left'
        },
        {
          label: '下',
          value: 'bottom'
        },
        {
          label: '右',
          value: 'right'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '标签宽度自适应',
      fieldName: 'stretch',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '是',
          value: true
        },
        {
          label: '否',
          value: false
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigation',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ],
      options: [
        {
          label: '参数传递',
          value: '0'
        },
        {
          label: '组件切换',
          value: '1'
        },
        {
          label: '三级菜单',
          value: '2'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '数据类型',
      fieldName: 'dataType',
      placeholder: '下拉选择',
      colLayout: 'doubleCol',
      options: [
        {
          label: '静态数据',
          value: '0'
        },
        {
          label: '动态数据',
          value: '1'
        }
      ],
      rules: [{ required: true }]
    },
    {
      type: 'blank',
      labelText: '数据视图',
      slotName: 'reportSqlId',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ]
    },
    {
      type: 'blank',
      labelText: '选项页名称',
      slotName: 'optionLabelCol',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ]
    },
    {
      type: 'blank',
      labelText: '图标设置',
      slotName: 'icon',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ]
    },
    {
      type: 'blank',
      labelText: '组件路径',
      slotName: 'optionUrl',
      colLayout: 'doubleCol',
      rules: [
        {
          required: true
        }
      ]
    }
  ]
}
