const code =
  '{\n' +
  '  chart: {\n' +
  '    legend: {\n' +
  "      top: 'bottom'\n" +
  '    },\n' +
  '    toolbox: {\n' +
  '      show: true\n' +
  '    },\n' +
  '    series: [\n' +
  '      {\n' +
  "        name: 'Nightingale Chart',\n" +
  "        type: 'pie',\n" +
  '        radius: [20, 180],\n' +
  "        center: ['50%', '50%'],\n" +
  "        roseType: 'area',\n" +
  '        itemStyle: {\n' +
  '          borderRadius: 8\n' +
  '        },\n' +
  '        data: [\n' +
  "          { value: 40, name: 'rose 1' },\n" +
  "          { value: 38, name: 'rose 2' },\n" +
  "          { value: 32, name: 'rose 3' },\n" +
  "          { value: 30, name: 'rose 4' },\n" +
  "          { value: 28, name: 'rose 5' },\n" +
  "          { value: 26, name: 'rose 6' },\n" +
  "          { value: 22, name: 'rose 7' },\n" +
  "          { value: 18, name: 'rose 8' }\n" +
  '        ]\n' +
  '      }\n' +
  '    ]\n' +
  '  }\n' +
  '}\n'
export { code }
