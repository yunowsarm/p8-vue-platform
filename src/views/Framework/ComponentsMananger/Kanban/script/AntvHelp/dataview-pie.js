// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。

let code =
{
  chart: {
    type: "interval",
    encode: { y: "NUM", color: 'ROW_ID' },
    transform: [{ type: "stackY" }],
    coordinate: { type: "theta" },
    animate: { enter: { type: "waveIn" } },
    legend: false,
  },
  event: {
    eventName: 'element:click',
    eventConfig: {
      componentType: 'table',
      componentCode: 'WZ_MATERIAL'
    }
  }
}
code = JSON.stringify(code, null, 2);
const sql = 'select t.module, count(*) as num from BP_LOG t group by t.module'
export { code, sql }
