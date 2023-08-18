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
