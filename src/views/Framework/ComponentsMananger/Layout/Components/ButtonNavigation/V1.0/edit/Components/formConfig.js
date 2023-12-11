// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。



export default {
  dicForm: [
    {
      type: 'text',
      labelText: '节点名称',
      fieldName: 'compName',
      placeholder: '请输入节点名称',
      colLayout: 'singleCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'select',
      labelText: '默认展开层级',
      fieldName: 'expendTier',
      placeholder: '请选择默认展开层级',
      colLayout: 'singleCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ],
      options: [
        {
          label: '展开全部',
          value: '0'
        },
        {
          label: '第一级',
          value: '1'
        },
        {
          label: '第二级',
          value: '2'
        },
        {
          label: '第三级',
          value: '3'
        },
        {
          label: '第四级',
          value: '4'
        },
        {
          label: '第五级',
          value: '5'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '是否显示根节点',
      fieldName: 'isShow',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '是',
          value: '1'
        },
        {
          label: '否',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '根节点图标',
      fieldName: 'rootIcon',
      slotName: 'rootIcon',
      placeholder: '下拉选择',
      colLayout: 'singleCol'
    },
    {
      type: 'blank',
      labelText: '父节点图标',
      fieldName: 'parentIcon',
      slotName: 'parentIcon',
      placeholder: '下拉选择',
      colLayout: 'singleCol'
    },
    {
      type: 'blank',
      labelText: '子节点图标',
      fieldName: 'childIcon',
      slotName: 'childIcon',
      placeholder: '下拉选择',
      colLayout: 'singleCol'
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigationPattern',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '参数传递',
          value: '1'
        },
        {
          label: '组件切换',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '数据类型',
      fieldName: 'dataType',
      slotName: 'dataType',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '静态数据',
          value: '1'
        },
        {
          label: '动态数据',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    }
  ],
  listSqlForm: [
    {
      type: 'text',
      labelText: '节点名称',
      fieldName: 'compName',
      placeholder: '请输入节点名称',
      colLayout: 'singleCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'select',
      labelText: '默认展开层级',
      fieldName: 'expendTier',
      placeholder: '请选择默认展开层级',
      colLayout: 'singleCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ],
      options: [
        {
          label: '展开全部',
          value: '0'
        },
        {
          label: '第一级',
          value: '1'
        },
        {
          label: '第二级',
          value: '2'
        },
        {
          label: '第三级',
          value: '3'
        },
        {
          label: '第四级',
          value: '4'
        },
        {
          label: '第五级',
          value: '5'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '是否显示根节点',
      fieldName: 'isShow',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '是',
          value: '1'
        },
        {
          label: '否',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigationPattern',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '参数传递',
          value: '1'
        },
        {
          label: '组件切换',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '数据类型',
      fieldName: 'dataType',
      slotName: 'dataType',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '静态数据',
          value: '1'
        },
        {
          label: '动态数据',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '数据视图',
      slotName: 'reportSqlId',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '节点ID',
      slotName: 'optionValueCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '节点名称',
      slotName: 'optionLabelCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '父节点ID',
      slotName: 'optionPidCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    }
  ],
  listSqlForm2: [
    {
      type: 'text',
      labelText: '节点名称',
      fieldName: 'compName',
      placeholder: '请输入节点名称',
      colLayout: 'singleCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'select',
      labelText: '默认展开层级',
      fieldName: 'expendTier',
      placeholder: '请选择默认展开层级',
      colLayout: 'singleCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ],
      options: [
        {
          label: '展开全部',
          value: '0'
        },
        {
          label: '第一级',
          value: '1'
        },
        {
          label: '第二级',
          value: '2'
        },
        {
          label: '第三级',
          value: '3'
        },
        {
          label: '第四级',
          value: '4'
        },
        {
          label: '第五级',
          value: '5'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '是否显示根节点',
      fieldName: 'isShow',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '是',
          value: '1'
        },
        {
          label: '否',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'radioButton',
      labelText: '导航模式',
      fieldName: 'navigationPattern',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '参数传递',
          value: '1'
        },
        {
          label: '组件切换',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '数据类型',
      fieldName: 'dataType',
      slotName: 'dataType',
      placeholder: '下拉选择',
      colLayout: 'singleCol',
      options: [
        {
          label: '静态数据',
          value: '1'
        },
        {
          label: '动态数据',
          value: '0'
        }
      ],
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '数据视图',
      slotName: 'reportSqlId',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '节点ID',
      slotName: 'optionValueCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '节点名称',
      slotName: 'optionLabelCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '父节点ID',
      slotName: 'optionPidCol',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    },
    {
      type: 'blank',
      labelText: '组件路径',
      slotName: 'optionUrl',
      rules: [
        {
          required: true,
          message: '该项为必填项'
        }
      ]
    }
  ]
}
