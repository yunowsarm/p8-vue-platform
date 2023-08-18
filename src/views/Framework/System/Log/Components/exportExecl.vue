<template>
  <el-button @click="downExcel" type="primary">
    导出
    <a ref="down" :href="href" :download="`${title}.xlsx`"></a>
  </el-button>
</template>

<script>
// 该组件使用了xlsx第三方库(sheetJS/JS-XLSX)
import { Button } from 'p8-components-ui'
import XLSX from 'xlsx'
export default {
  name: 'ExportAsExcel',
  components: {
    'el-button': Button
  },
  props: {
    tableColumns: {
      type: Array,
      default: () => []
    },
    api: {
      // :fetch通过接口获取要导出的数据 api为请求接口时的action
      type: String,
      default: ''
    },
    otherParams: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: `日志列表-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    }
  },
  data() {
    return {
      href: undefined,
      page: {
        current: 1,
        size: 5000,
        orders: []
      }
    }
  },
  watch: {
    href(val) {
      if (val) {
        setTimeout((_) => {
          this.$refs.down.click()
        }, 1000)
      }
    }
  },
  methods: {
    async getExportData() {
      let that = this
      let queryParams = { page: that.page, ...that.otherParams }
      let resData = await this.$api[that.api](queryParams)
      if (resData && resData.records) {
        resData.records.forEach((row) => {
          row.contents = `用户名: ${row.sysuserAccount} 部门: ${row.departmentName} 姓名: ${row.sysuserRealname}在${row.recordingTime}通过${row.ipAddress + row.operation}`
        })
        let exportData = that.exportDataHandle(that.tableColumns, resData.records)
        return exportData
      }
    },
    // 处理数据
    exportDataHandle(columns, data) {
      let baseName = [[]]
      let baseKey = []
      columns.forEach((column) => {
        if (column.export && column.export) {
          baseKey.push(column.dataIndex)
          baseName[0].push(column.title)
        }
      })
      /**
       * tableData 表格数据，
       * 如时间需要特别处理时，比如转时分秒之类的
       * 可在mounted/created获取数据时 对其进行加工。
       * 最后返回一个新数组。
       */
      if (data.length !== 0) {
        ;[...data].splice(0).forEach((o) => {
          let oneData = []
          baseKey.forEach((item, index, arr) => {
            oneData.push(o[item])
          })
          baseName.push(oneData)
        })
      }
      return baseName
    },
    async downExcel(ev) {
      //  下载excel
      if (ev.target === this.$refs.down) return //  如果是点击的a标签则取消
      let exportData = await this.getExportData()
      if (!exportData) return this.$notify.info('没有可以下载的信息')
      let worksheet = XLSX.utils.aoa_to_sheet(exportData)
      // 创建工作簿
      let newWorkbook = XLSX.utils.book_new()
      // 将工作表附加到工作簿
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS')

      // 写入数据
      let s = XLSX.write(newWorkbook, { type: 'binary' })
      let tmpDown = new Blob([this.s2ab(s)], { type: '' })

      this.href = URL.createObjectURL(tmpDown)
      setTimeout(() => {
        // 延时释放
        URL.revokeObjectURL(tmpDown)
      }, 5000)
    },

    s2ab(s) {
      //  字符串转字符流
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
      return buf
    },
    // 暂时用不到
    getCharCol(n) {
      // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
      let s = ''
      let m = 0
      while (n > 0) {
        m = (n % 26) + 1
        s = String.fromCharCode(m + 64) + s
        n = (n - m) / 26
      }
      return s
    }
  }
}
</script>
