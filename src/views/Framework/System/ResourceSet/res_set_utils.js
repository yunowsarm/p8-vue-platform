import _ from 'lodash'
//新建时，类型可选择项定义
let thisComponent
let resTypesConfigs = [
  //根可以创建一级菜单和权限组
  {
    rule: {
      id: 'root'
    },
    dictArray: ['MENU', 'PER_GROUP']
  },
  //一级菜单可以创建二级菜单和按钮
  {
    rule: {
      type: 'MENU',
      level: 2
    },
    dictArray: ['MENU', 'BUTTON']
  },
  //二级菜单可以创建三级菜单和按钮
  {
    rule: {
      type: 'MENU',
      level: 3
    },
    dictArray: ['MENU', 'BUTTON']
  },
  //三级菜单可以创建按钮
  {
    rule: {
      type: 'MENU',
      level: 4
    },
    dictArray: ['BUTTON']
  },
  //按钮可以创建子按钮
  {
    rule: {
      type: 'BUTTON'
    },
    dictArray: ['BUTTON']
  },
  //权限组可以创建子权限组和权限
  {
    rule: {
      type: 'PER_GROUP'
    },
    dictArray: ['PER_GROUP', 'PER']
  }
]

let validResTypes = function (resObject) {
  let dictArray = []
  let config = _.find(resTypesConfigs, (o) => _.isMatch(resObject, o.rule))
  if (config && config.dictArray) {
    dictArray = config.dictArray
  }
  return dictArray
}

//新建及修改时表单定义
let editColumns = [
  {
    type: 'view',
    labelText: '所属',
    fieldName: 'parentName'
  },
  {
    type: 'text',
    labelText: '中文名称',
    fieldName: 'title',
    placeholder: '请输入中文名称',
    rules: [
      {
        required: true,
        maxLength: 32
      }
    ]
  },
  {
    type: 'text',
    labelText: '英文名称',
    fieldName: 'name',
    placeholder: '请输入英文名称',
    rules: [
      {
        required: true,
        maxLength: 32
      },
      {
        validator: (rule, value, callback) => {
          const that = thisComponent
          // console.log(thisComponent)
          if (!that.record || (that.record && that.record.name !== value)) {
            that.$api['resource.checkRepeated']({ id: that.record.id, name: value }).then((response) => {
              // console.log(response)
              if (response.result) {
                callback(new Error(response.resultMsg))
              } else {
                callback()
              }
            })
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  },
  {
    type: 'text',
    labelText: '前端组件路径',
    fieldName: 'component',
    placeholder: '请输入前端组件路径',
    maxlength: 512,
    rules: [
      {
        required: false,
        maxLength: 512
      }
    ]
  },
  {
    type: 'blank',
    labelText: '前端EventHandler',
    fieldName: 'eventHandle',
    slotName: 'eventHandle',
    placeholder: '请输入前端EventHandler',
    rules: [
      {
        required: true,
        maxLength: 256,
        message: '该项为必填项'
      }
    ]
  },
  {
    type: 'blank',
    labelText: '前端Handler参数',
    fieldName: 'eventParams',
    placeholder: '前端Handler参数',
    slotName: 'eventParams'
  },
  {
    type: 'text',
    labelText: '权限编码',
    fieldName: 'permission',
    placeholder: '请输入权限编码',
    rules: [
      {
        maxLength: 256
      }
    ]
  },
  {
    type: 'select',
    labelText: '按钮位置',
    fieldName: 'location',
    placeholder: '请选择按钮位置',
    optionUrl: {
      api: 'resource.getDic',
      params: { dictType: 'LOCATION' }
    },
    rules: [
      {
        required: true
      }
    ]
  },
  {
    type: 'number',
    labelText: '排序号',
    fieldName: 'indexNumber',
    placeholder: '请输入排序号',
    min: 0,
    max: 99999999,
    rules: [
      {
        required: true
      }
    ]
  },
  {
    type: 'select',
    labelText: '是否可授权',
    fieldName: 'isAccredit',
    optionUrl: {
      api: 'resource.getDic',
      params: { dictType: 'IS_ACCREDIT' }
    },
    rules: [
      {
        required: true
      }
    ]
  },
  {
    type: 'blank',
    labelText: '图标',
    fieldName: 'image',
    slotName: 'image'
  },
  {
    type: 'textarea',
    labelText: '备注',
    fieldName: 'remark',
    placeholder: '请输入备注',
    rules: [
      {
        maxLength: 256
      }
    ]
  },
  {
    type: 'blank',
    labelText: '控制逻辑',
    fieldName: 'controlRule',
    slotName: 'controlRule'
  }
]

let editFormConfigs = {
  MENU: ['parentName', 'title', 'name', 'component', 'permission', 'isAccredit', 'image', 'indexNumber', 'remark'],
  BUTTON: ['parentName', 'title', 'name', 'eventHandle', 'eventParams', 'permission', 'location', 'indexNumber', 'isAccredit', 'image', 'remark', 'controlRule'],
  PER_GROUP: ['parentName', 'title', 'name', 'isAccredit', 'indexNumber', 'remark'],
  PER: ['parentName', 'title', 'name', 'permission', 'indexNumber', 'isAccredit', 'remark']
}

let getColumns = function (resType, comp) {
  //英文名称的唯一性校验需要用到vue组件中this对象，在getColumns时传入备用。
  thisComponent = comp
  let typeColFields = _.get(editFormConfigs, resType, [])
  console.log('typeColFields', typeColFields)
  return _.filter(editColumns, (o) => typeColFields.includes(o.fieldName))
}
export { validResTypes, getColumns }
