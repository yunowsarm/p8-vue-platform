<template>
  <div class="table-main">
    <div class="normal-header">
      <div class="header-actions">
        <el-button type="primary" @click="ExportExcel" class="el_button_daoru">导出明细</el-button>
        <el-date-picker v-model="searchMounth" type="month" placeholder="选择查询月份" @change="changeMounth"></el-date-picker>
      </div>
      <div class="room-filter">
        <span class="room-filter__label">配电房</span>
        <el-checkbox class="room-filter__all" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="selectedRoomIds" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="city in roomlist" :label="city.ID" :key="city.ID">{{ city.NAME }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div class="table-con">
      <div class="table-wrapper">
        <el-table class="summary-table" :data="tableData" :style="{ width: '100%', '--summary-row-height': `${rowHeight}px` }" :stripe="true" :loading="loading" border :height="tableHeight">
          <el-table-column prop="roomName" label="所属配电房" fixed="left" width="100" show-overflow-tooltip></el-table-column>
          <el-table-column prop="meterCode" label="电表编号" fixed="left" width="124" show-overflow-tooltip></el-table-column>
          <el-table-column prop="meterLocation" label="安装位置" width="112" show-overflow-tooltip></el-table-column>
          <el-table-column prop="magnification" label="倍率" width="60" align="right"></el-table-column>
          <el-table-column label="尖">
            <el-table-column prop="readingSharp1" label="上月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingSharp" label="本月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingSharp2" label="表用量" width="76" align="right"></el-table-column>
            <el-table-column prop="readingSharp3" label="实用度数" width="76" align="right"></el-table-column>
          </el-table-column>
          <el-table-column label="峰">
            <el-table-column prop="readingPeak1" label="上月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingPeak" label="本月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingPeak2" label="表用量" width="76" align="right"></el-table-column>
            <el-table-column prop="readingPeak3" label="实用度数" width="76" align="right"></el-table-column>
          </el-table-column>
          <el-table-column label="平">
            <el-table-column prop="readingFlat1" label="上月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingFlat" label="本月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingFlat2" label="表用量" width="76" align="right"></el-table-column>
            <el-table-column prop="readingFlat3" label="实用度数" width="76" align="right"></el-table-column>
          </el-table-column>
          <el-table-column label="谷">
            <el-table-column prop="readingValley1" label="上月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingValley" label="本月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingValley2" label="表用量" width="76" align="right"></el-table-column>
            <el-table-column prop="readingValley3" label="实用度数" width="76" align="right"></el-table-column>
          </el-table-column>
          <el-table-column label="总">
            <el-table-column prop="readingTotal1" label="上月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingTotal" label="本月示数" width="76" align="right"></el-table-column>
            <el-table-column prop="readingTotal2" label="表用量" width="76" align="right"></el-table-column>
            <el-table-column prop="readingTotal3" label="实用度数" width="76" align="right"></el-table-column>
          </el-table-column>
          <el-table-column prop="kva" label="KVA" width="65" align="right"></el-table-column>
          <el-table-column prop="kvaTotal" label="KVA总数" width="82" align="right"></el-table-column>
          <el-table-column prop="remark" label="抄表备注" fixed="right" width="110" show-overflow-tooltip></el-table-column>
        </el-table>
        <div class="pagination-wrap">
          <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total" @current-change="handleCurrentChange" layout="total, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      tableData: [],
      tableDataAll: [],
      showUpload: true,
      fileListShow: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      isSubmitting: false,
      searchMounth: '',
      tableHeight: 500,
      rowHeight: 44,
      isIndeterminate: true,
      selectedRoomIds: [], // 存储选中的配电房ID
      checkAll: false,
      roomlist: []
    }
  },
  mounted() {
    this.getDistributionRoom()
    const now = new Date()
    this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    console.log('当前月:', this.searchMounth)
    // this.getTableData()
    this.$nextTick(() => {
      this.calcTableHeight()
      window.addEventListener('resize', this.calcTableHeight)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcTableHeight)
  },
  computed: {},
  methods: {
    getDistributionRoom() {
      const params = {
        sqlParam: {},
        reportId: 'a3321fd8d0bb50853a5005bd7e8fa4bd',
        reportParam: {},
        router: 'distributionRoomManagement',
        code: 'DistributionRoom',
        permissionVo: {
          router: 'distributionRoomManagement',
          resourceId: ''
        },
        page: {
          current: this.currentPage,
          size: '100',
          orders: []
        }
      }
      this.$api['baseData.meterListSearch'](params)
        .then((res) => {
          console.log(res, 'res')
          this.roomlist = res.records
          // 添加默认全选逻辑
          if (this.roomlist && this.roomlist.length > 0) {
            // 设置选中所有配电房ID
            this.selectedRoomIds = this.roomlist.map((room) => room.ID)
            // 设置全选状态为true
            this.checkAll = true
            // 设置 indeterminate 状态为 false（非部分选中）
            this.isIndeterminate = false

            console.log('页面加载默认全选设置完成，选中数量:', this.selectedRoomIds.length)

            // 可选：立即加载对应数据
            this.getTableData()
            this.$nextTick(this.calcTableHeight)
          }
        })
        .catch(() => {})
        .finally(() => {})
    },
    calcTableHeight() {
      this.$nextTick(() => {
        try {
          const tableConEl = this.$el.querySelector('.table-con')
          const paginationEl = this.$el.querySelector('.pagination-wrap')
          const containerH = tableConEl && tableConEl.clientHeight ? tableConEl.clientHeight : 500
          const paginationH = paginationEl && paginationEl.offsetHeight ? paginationEl.offsetHeight : 44
          const h = Math.max(260, Math.floor(containerH - paginationH - 12))
          this.tableHeight = h
          this.$nextTick(() => {
            const headerEl = this.$el.querySelector('.summary-table .el-table__header-wrapper')
            const headerH = headerEl && headerEl.offsetHeight ? headerEl.offsetHeight : 80
            const horizontalScrollbarH = 17
            const availableBodyH = h - headerH - horizontalScrollbarH - 1
            this.rowHeight = Math.max(44, Math.floor(availableBodyH / this.pageSize))
          })
        } catch (e) {
          console.error('calcTableHeight error', e)
        }
      })
    },

    getTableData() {
      this.loading = true
      // 构建动态参数对象，roomIds为空时不传递该字段
      const params = { date: this.searchMounth }
      // 只有当selectedRoomIds不为空数组时才添加roomIds参数
      if (this.selectedRoomIds && this.selectedRoomIds.length > 0) {
        params.roomIds = this.selectedRoomIds
      }

      console.log('接口请求参数:', params)
      this.$api['baseData.electricitysearch'](params)
        .then((res) => {
          let all = []
          if (Array.isArray(res)) {
            all = res
          } else if (res && res.records) {
            all = res.records
          } else if (res && res.data && Array.isArray(res.data)) {
            all = res.data
          }
          this.tableDataAll = all || []
          this.total = this.tableDataAll.length
          this.updatePageData()
        })
        .catch((err) => {
          console.error('获取表格数据失败', err)
          this.$message.error('获取表格数据失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    updatePageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      this.tableData = this.tableDataAll.slice(start, end)
    },
    ExportExcel() {
      // 检查是否选择了配电房
      if (!this.selectedRoomIds || this.selectedRoomIds.length === 0) {
        this.$message.warning('请至少选择一个配电房后再导出')
        return
      }
      const paramsData = {
        date: this.searchMounth,
        roomIds: this.selectedRoomIds
      }
      this.$api['baseData.electricityExport'](paramsData, { responseType: 'blob' })
        .then((data) => {
          const date = new Date()
          // const fileName = '电表数据导出' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          let fileName = '电表数据导出'

          // 如果只选择了一个配电房，在文件名中加入配电房名称
          if (this.selectedRoomIds && this.selectedRoomIds.length === 1) {
            const selectedRoomId = this.selectedRoomIds[0]
            const selectedRoom = this.roomlist.find((room) => room.ID === selectedRoomId)
            if (selectedRoom && selectedRoom.NAME) {
              // 移除文件名中可能存在的非法字符[2,5](@ref)
              const roomName = selectedRoom.NAME.replace(/[\\\x2f:*?"<>|]/g, '')
              fileName = `${roomName}_电表数据_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            } else {
              fileName = `电表数据导出_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            }
          } else {
            // 多个配电房或没有配电房时使用默认名称[3](@ref)
            fileName = `电表数据导出_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          }

          const fileType = 'xlsx'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = `${fileName}.${fileType}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          // 释放URL对象[7](@ref)
          window.URL.revokeObjectURL(url)
        })
        .catch(() => {
          this.$message({
            message: 'excel下载失败！',
            type: 'error'
          })
        })
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.updatePageData()
    },
    changeMounth(value) {
      const date = new Date(value)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const result1 = `${year}-${month}`
      this.searchMounth = result1
      console.log(this.searchMounth, '月份变化')
      this.getTableData()
    },
    handleCheckAllChange(val) {
      if (val) {
        // 全选：将roomlist中所有ID添加到selectedRoomIds
        this.selectedRoomIds = this.roomlist.map((room) => room.ID)
      } else {
        // 取消全选：清空数组
        this.selectedRoomIds = []
      }
      this.isIndeterminate = false
      // 全选时打印选中的配电房信息
      this.printSelectedRoomsInfo()
      // 自动调用数据接口
      this.getTableData()
    },
    handleCheckedCitiesChange(selectedIds) {
      // 更新全选状态
      const checkedCount = selectedIds.length
      this.checkAll = checkedCount === this.roomlist.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.roomlist.length

      // 多选时打印选中的配电房信息
      this.printSelectedRoomsInfo()
      // 自动调用数据接口
      this.getTableData()
    },
    // 打印选中的配电房信息
    printSelectedRoomsInfo() {
      if (this.selectedRoomIds && this.selectedRoomIds.length > 0) {
        console.log('=== 选中的配电房信息 ===')
        console.log('选中的ID数组:', this.selectedRoomIds)

        // 根据选中的ID从roomlist中查找对应的名称
        const selectedRooms = this.roomlist.filter((room) => this.selectedRoomIds.includes(room.ID))

        selectedRooms.forEach((room) => {
          console.log(`ID: ${room.ID}, NAME: ${room.NAME}`)
        })

        console.log(`共计选中: ${selectedRooms.length} 个配电房`)
        console.log('======================')
      } else {
        console.log('当前未选择任何配电房')
      }
    }
  }
}
</script>
<style scoped>
.table-main {
  margin: 14px;
  border-radius: 6px;
  height: calc(100% - 28px);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}
.normal-header {
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  flex: 0 0 auto;
}
.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.room-filter {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 4px;
  background: #f7f9fc;
}
.room-filter__label {
  flex: 0 0 auto;
  color: #606266;
  font-weight: 500;
  line-height: 20px;
}
.room-filter__all {
  flex: 0 0 auto;
  margin-right: 0;
}
.room-filter .el-checkbox-group {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px 20px;
  min-width: 0;
}
.room-filter .el-checkbox {
  margin-right: 0;
}
.table-con {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #ffffff;
  padding: 12px;
}

.table-con > .table-wrapper {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

::v-deep .summary-table .cell {
  padding: 0 8px;
  line-height: 20px;
  white-space: nowrap;
}

::v-deep .summary-table th > .cell {
  text-align: center;
}

::v-deep .summary-table td {
  height: var(--summary-row-height, 44px);
  padding: 0;
}

.pagination-wrap {
  flex: 0 0 auto;
  padding-top: 12px;
  text-align: right;
}

@media (max-width: 768px) {
  .table-main {
    margin: 8px;
    height: calc(100% - 16px);
  }

  .normal-header,
  .table-con {
    padding: 8px;
  }

  .room-filter {
    gap: 8px;
    padding: 8px;
  }

  .pagination-wrap {
    overflow-x: auto;
    text-align: left;
  }
}
</style>
