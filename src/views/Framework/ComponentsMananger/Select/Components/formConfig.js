// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。



export default {
  dicFormConfig: [
    {
      type: 'text', // 控件类型
      labelText: '选项编码', // 控件显示的文本
      fieldName: 'selectionCode',
      placeholder: '请输入选项编码', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        },
        {
          pattern: '^[0-9a-zA-Z_]{1,}$',
          message: '只可输入数字,字母或下划线',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'text', // 控件类型
      labelText: '选项名称', // 控件显示的文本
      fieldName: 'selectionName',
      placeholder: '请输入选项名称', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        }
      ]
    },
    {
      type: 'blank', // 控件类型
      labelText: '数据来源', // 控件显示的文本
      slotName: 'dataSourceType'
    },
    {
      type: 'select',
      labelText: '数据字典',
      fieldName: 'dictionaryId',
      placeholder: '请选择数据字典',
      optionUrl: {
        api: 'selection.getAllDictionaryType'
      },
      rules: [
        {
          required: true
        }
      ]
    },
    {
      labelText: '描述',
      type: 'textarea',
      fieldName: 'selectionDesc',
      placeholder: '请输入描述',
      rules: [
        {
          maxLength: 200
        }
      ]
    }
  ],
  listSqlFormConfig: [
    {
      type: 'text', // 控件类型
      labelText: '选项编码', // 控件显示的文本
      fieldName: 'selectionCode',
      placeholder: '请输入选项编码', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        },
        {
          pattern: '^[0-9a-zA-Z_]{1,}$',
          message: '只可输入数字,字母或下划线',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'text', // 控件类型
      labelText: '选项名称', // 控件显示的文本
      fieldName: 'selectionName',
      placeholder: '请输入选项名称', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        }
      ]
    },
    {
      type: 'blank', // 控件类型
      labelText: '数据来源', // 控件显示的文本
      slotName: 'dataSourceType'
    },
    {
      type: 'blank',
      labelText: 'SQL数据视图',
      slotName: 'reportSqlId'
    },
    {
      type: 'blank',
      labelText: '选项显示文本',
      slotName: 'option.labelCol'
    },
    {
      type: 'blank',
      labelText: '选项值',
      slotName: 'option.valueCol'
    },
    {
      labelText: '描述',
      type: 'textarea',
      fieldName: 'selectionDesc',
      placeholder: '请输入描述',
      rules: [
        {
          maxLength: 200
        }
      ]
    }
  ],
  treeSqlFormConfig: [
    {
      type: 'text', // 控件类型
      labelText: '选项编码', // 控件显示的文本
      fieldName: 'selectionCode',
      placeholder: '请输入选项编码', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        },
        {
          pattern: '^[0-9a-zA-Z_]{1,}$',
          message: '只可输入数字,字母或下划线',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'text', // 控件类型
      labelText: '选项名称', // 控件显示的文本
      fieldName: 'selectionName',
      placeholder: '请输入选项名称', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        }
      ]
    },
    {
      type: 'blank', // 控件类型
      labelText: '数据来源', // 控件显示的文本
      slotName: 'dataSourceType'
    },
    {
      type: 'blank',
      labelText: 'SQL数据视图',
      slotName: 'reportSqlId'
    },
    {
      type: 'blank',
      labelText: '选项显示文本',
      slotName: 'option.labelCol'
    },
    {
      type: 'blank',
      labelText: '选项值',
      slotName: 'option.valueCol'
    },
    {
      type: 'blank',
      labelText: '父节点ID',
      slotName: 'option.pidCol'
    },
    {
      labelText: '描述',
      type: 'textarea',
      fieldName: 'selectionDesc',
      placeholder: '请输入描述',
      rules: [
        {
          maxLength: 200
        }
      ]
    }
  ],
  gridFromConfig: [
    {
      type: 'text', // 控件类型
      labelText: '选项编码', // 控件显示的文本
      fieldName: 'selectionCode',
      placeholder: '请输入选项编码', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        },
        {
          pattern: '^[0-9a-zA-Z_]{1,}$',
          message: '只可输入数字,字母或下划线',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'text', // 控件类型
      labelText: '选项名称', // 控件显示的文本
      fieldName: 'selectionName',
      placeholder: '请输入选项名称', // 默认控件的空值文本
      rules: [
        {
          required: true,
          maxLength: 32
        }
      ]
    },
    {
      type: 'blank',
      labelText: '表格组件',
      slotName: 'reportId'
    },
    {
      type: 'blank',
      labelText: '选项显示文本',
      slotName: 'option.labelCol'
    },
    {
      type: 'blank',
      labelText: '选项值',
      slotName: 'option.valueCol'
    },
    // {
    //   type: 'select',
    //   labelText: '表格组件', // 控件显示的文本
    //   fieldName: 'reportId',
    //   placeholder: '请选择表格组件', // 默认控件的空值文本
    //   optionUrl: {
    //     api: 'selection.getAllReport'
    //   },
    //   rules: [
    //     {
    //       required: true
    //     }
    //   ]
    // },
    {
      labelText: '描述',
      type: 'textarea',
      fieldName: 'selectionDesc',
      placeholder: '请输入描述',
      rules: [
        {
          maxLength: 200
        }
      ]
    }
  ]
}
