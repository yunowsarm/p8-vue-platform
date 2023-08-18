const code =
  '{\n' +
  '  chart:{\n' +
  '    dataset: {\n' +
  '      source: []\n' +
  '    },\n' +
  '    xAxis: {\n' +
  "      type: 'category',\n" +
  '      axisLabel: { interval: 0, rotate: 30 }\n' +
  '    },\n' +
  '    yAxis: {\n' +
  "      type: 'value'\n" +
  '    },\n' +
  '    series: [\n' +
  '      {\n' +
  "        type: 'bar',\n" +
  '        encode: {\n' +
  "          x: 'MODULE',\n" +
  "          y: 'NUM'\n" +
  '        },\n' +
  '      }\n' +
  '    ]\n' +
  '  },\n' +
  '  event: {\n' +
  "    eventName: 'click',\n" +
  '    eventConfig: {\n' +
  "      type: 'dialog',\n" +
  "      componentType: 'table',\n" +
  "      componentCode: 'LOG_DRILL_LIST',\n" +
  "      dataKey: 'MODULE',\n" +
  "      outParamName: 'MODULE'\n" +
  '    }\n' +
  '  }\n' +
  '}'

const sql = 'select t.module, count(*) as num from BP_LOG t group by t.module'
export { code, sql }
