const code =
  '{\n' +
  '  chart: {\n' +
  '    tooltip: {\n' +
  "      trigger: 'item'\n" +
  '    },\n' +
  '    legend: {\n' +
  "      top: '5%',\n" +
  "      left: 'center'\n" +
  '    },\n' +
  '    series: [\n' +
  '      {\n' +
  "        name: 'Access From',\n" +
  "        type: 'pie',\n" +
  "        radius: ['40%', '70%'],\n" +
  '        avoidLabelOverlap: false,\n' +
  '        itemStyle: {\n' +
  '          borderRadius: 10,\n' +
  "          borderColor: '#fff',\n" +
  '          borderWidth: 2\n' +
  '        },\n' +
  '        label: {\n' +
  '          show: false,\n' +
  "          position: 'center'\n" +
  '        },\n' +
  '        emphasis: {\n' +
  '          label: {\n' +
  '            show: true,\n' +
  "            fontSize: '40',\n" +
  "            fontWeight: 'bold'\n" +
  '          }\n' +
  '        },\n' +
  '        labelLine: {\n' +
  '          show: false\n' +
  '        },\n' +
  '        data: [\n' +
  "          { value: 1048, name: 'Search Engine' },\n" +
  "          { value: 735, name: 'Direct' },\n" +
  "          { value: 580, name: 'Email' },\n" +
  "          { value: 484, name: 'Union Ads' },\n" +
  "          { value: 300, name: 'Video Ads' }\n" +
  '        ]\n' +
  '      }\n' +
  '    ]\n' +
  '  }\n' +
  '}'

export { code }
