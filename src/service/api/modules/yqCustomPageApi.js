/**
 * 园区平台自定义页面
 */

export const yqRequestApi = {
  yqRequestApi: [
    {
      name: 'parkTableApi',
      method: 'GET',
      path: '/jt/park/list',
      mockPath: '/jt/park/list',
      desc: '园区列表接口'
    },
    {
      name: 'addParkApi',
      method: 'POST',
      path: '/jt/park/add',
      mockPath: '/jt/park/add',
      desc: '添加园区接口'
    },
    {
      name: 'addDictionaryApi',
      method: 'POST',
      path: '/jt/park/addDictionary',
      mockPath: '/jt/park/addDictionary',
      desc: '添加字典接口'
    },
    {
      name: 'platAddDicApi',
      method: 'POST',
      path: '/framework/system/BpDictionary/saveDict',
      mockPath: '/framework/system/BpDictionary/saveDict',
      desc: '平台字典save接口'
    },
    {
      name: 'editParkApi',
      method: 'POST',
      path: '/jt/park/edit',
      mockPath: '/jt/park/edit',
      desc: '编辑园区接口'
    },
    {
      name: 'deleteParkApi',
      method: 'POST',
      path: '/jt/park/delete',
      mockPath: '/jt/park/delete',
      desc: '删除园区接口'
    },
    {
      name: 'queryParkByIdApi',
      method: 'POST',
      path: '/jt/park/queryById',
      mockPath: '/jt/park/queryById',
      desc: '园区详情接口'
    },
    {
      name: 'platformApi',
      method: 'POST',
      path: '/framework/report/apply',
      mockPath: '/framework/report/apply',
      desc: '平台接口'
    },
    {
      name: 'platSelectApi',
      method: 'POST',
      path: '/framework/selection/getSelectionData',
      mockPath: '/framework/selection/getSelectionData',
      desc: '平台selection接口'
    },
    {
      name: 'platGetDicApi',
      method: 'POST',
      path: '/framework/system/BpDictionary/list',
      mockPath: '/framework/system/BpDictionary/list',
      desc: '查询数据字典接口'
    },
    {
      name: 'platGetDicListApi',
      method: 'POST',
      path: '/framework/system/BpDictionary/getDicList',
      mockPath: '/framework/system/BpDictionary/getDicList',
      desc: '查询数据字典接口2'
    },
  ]
}
