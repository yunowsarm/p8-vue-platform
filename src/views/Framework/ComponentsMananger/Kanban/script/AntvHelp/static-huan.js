// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。


let code =
{
  chart: {
    type: "view",
    height: 640,
    padding: 0,
    inset: 50,
    coordinate: { type: "theta", innerRadius: 0.6 },
    children: [
      {
        type: "interval",
        data: [
          {
            "name": "<5",
            "value": 19912018
          },
          {
            "name": "5-9",
            "value": 20501982
          },
          {
            "name": "10-14",
            "value": 20679786
          },
          {
            "name": "15-19",
            "value": 21354481
          },
          {
            "name": "20-24",
            "value": 22604232
          }
        ],
        encode: { y: "value", color: "name" },
        transform: [{ type: "stackY" }],
        scale: { color: { palette: "spectral", offset: (t) => t * 0.8 + 0.1 } },
        legend: false,
      },
      {
        type: "text",
        style: {
          text: "Donut",
          x: "50%",
          y: "50%",
          fontSize: 40,
          fontWeight: "bold",
          textAlign: "center",
        },
      },
      {
        type: "text",
        style: {
          text: "chart",
          x: 304,
          y: 360,
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
        },
      },
    ],
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
export { code }
