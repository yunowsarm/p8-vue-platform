export const barrierGateApi = {
  parkingAccessRecord: [
    { name: 'list', method: 'GET', path: '/parking/access-record/list', mockPath: '/parking/access-record/list', desc: '道闸出入记录列表' },
    { name: 'import', method: 'POST', path: '/parking/access-record/import', mockPath: '/parking/access-record/import', desc: '导入道闸出入记录' }
  ],
  parkingVehicleInfo: [
    { name: 'list', method: 'GET', path: '/parking/vehicleInfo/list', mockPath: '/parking/vehicleInfo/list', desc: '车辆登记列表' },
    { name: 'add', method: 'POST', path: '/parking/vehicleInfo/add', mockPath: '/parking/vehicleInfo/add', desc: '新增车辆登记' },
    { name: 'edit', method: 'POST', path: '/parking/vehicleInfo/edit', mockPath: '/parking/vehicleInfo/edit', desc: '编辑车辆登记' },
    { name: 'delete', method: 'POST', path: '/parking/vehicleInfo/delete', mockPath: '/parking/vehicleInfo/delete', desc: '删除车辆登记' },
    { name: 'queryById', method: 'GET', path: '/parking/vehicleInfo/queryById', mockPath: '/parking/vehicleInfo/queryById', desc: '车辆登记详情' }
  ]
}
