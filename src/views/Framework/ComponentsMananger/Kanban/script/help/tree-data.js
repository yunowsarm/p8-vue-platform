// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。



const treeDataConfig = [
  {
    label: 'ECharts渲染器',
    children: [
      {
        label: '静态数据',
        children: [
          {
            label: '环状图',
            example: 'static-doughnut.js'
          },
          {
            label: '南丁格尔玫瑰图',
            example: 'static-rose.js'
          }
        ]
      },
      {
        label: '数据视图数据',
        children: [
          {
            label: '饼图',
            example: 'dataview-pie.js'
          },
          {
            label: '柱状图',
            example: 'dataview-bar.js'
          }
        ]
      }
    ]
  }
]

export default treeDataConfig
