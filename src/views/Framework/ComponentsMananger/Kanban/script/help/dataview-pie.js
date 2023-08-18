const code =
  '{\n' +
  '  chart: {\n' +
  '    title: {\n' +
  "      text: '日志访问统计分析',\n" +
  "      subtext: '按模块',\n" +
  "      left: 'center'\n" +
  '    },\n' +
  '    tooltip: {\n' +
  "      trigger: 'item'\n" +
  '    },\n' +
  '    legend: {\n' +
  "      orient: 'vertical',\n" +
  "      left: 'left'\n" +
  '    },\n' +
  '    dataset: {\n' +
  '      // 用 dimensions 指定了维度的顺序。直角坐标系中，如果 X 轴 type 为 category，\n' +
  '      // 默认把第一个维度映射到 X 轴上，后面维度映射到 Y 轴上。\n' +
  '      // 如果不指定 dimensions，也可以通过指定 series.encode\n' +
  '      // 完成映射，参见后文。\n' +
  '      source: []\n' +
  '    },\n' +
  '    series: [\n' +
  '      {\n' +
  "        type: 'pie',\n" +
  "        name: '数量',\n" +
  "        radius: '50%',\n" +
  '        encode: {\n' +
  "          itemName: 'MODULE',\n" +
  "          value: 'NUM'\n" +
  '        },\n' +
  '        emphasis: {\n' +
  '          itemStyle: {\n' +
  '            shadowBlur: 10,\n' +
  '            shadowOffsetX: 0,\n' +
  "            shadowColor: 'rgba(0, 0, 0, 0.5)'\n" +
  '          }\n' +
  '        }\n' +
  '      }\n' +
  '    ]\n' +
  '  },\n' +
  '  event: {\n' +
  "    eventName: 'click',\n" +
  '    eventConfig: {\n' +
  "      type: 'dialog', //事件响应类型：dialog-弹出窗口\n" +
  "      componentType: 'table', //组件类型：table-表格组件\n" +
  "      componentCode: 'LOG_DRILL_LIST', //组件code\n" +
  "      dataKey: 'MODULE',\n" +
  "      outParamName: 'MODULE'\n" +
  '    }\n' +
  '  }\n' +
  '}'

const sql = 'select t.module, count(*) as num from BP_LOG t group by t.module'
export { code, sql }
