// 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。


let code =
{
  chart: {
    type: "line",
    autoFit: true,
    data: [
      {
        "date": "2007-04-23",
        "close": 93.24
      },
      {
        "date": "2007-04-24",
        "close": 95.35
      },
      {
        "date": "2007-04-25",
        "close": 98.84
      },
      {
        "date": "2007-04-26",
        "close": 99.92
      },
      {
        "date": "2007-04-29",
        "close": 99.8
      },
      {
        "date": "2007-05-01",
        "close": 99.47
      },
      {
        "date": "2007-05-02",
        "close": 100.39
      },
      {
        "date": "2007-05-03",
        "close": 100.4
      }
    ],
    encode: { x: "date", y: "close" },
    transform: [{ type: "sample", thresholds: 500, strategy: "max" }],
  }
}
code = JSON.stringify(code, null, 2);
export { code }
