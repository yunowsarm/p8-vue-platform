<template>
  <div class="house-resource-manage">
    <div class="house-resource-manage__header">
      <div class="house-resource-manage__title">{{ pageTitle }}</div>
    </div>
    <!-- 顶部统计 -->
    <!-- <div class="house-resource-manage__stats">
      <div v-for="(item, index) in statCards" :key="index" class="house-resource-manage__stat-card">
        <div class="house-resource-manage__stat-label">{{ item.label }}</div>
        <div class="house-resource-manage__stat-value">{{ item.value }}</div>
      </div>
    </div> -->

    <!-- 搜索栏 -->
    <div class="house-resource-manage__toolbar">
      <div class="house-resource-manage__filters">
        <el-select v-model="searchForm.parkId" placeholder="所属园区" clearable style="width: 200px">
          <el-option v-for="item in parkOptions" :key="item.id" :label="item.parkName" :value="item.id" />
        </el-select>
        <!-- <el-input v-model="searchForm.buildingNo" placeholder="楼栋编号" clearable style="width: 180px" /> -->
        <!-- <el-select v-model="searchForm.type" placeholder="房源类型" clearable style="width: 180px">
          <el-option label="写字楼" value="写字楼" />
          <el-option label="厂房" value="厂房" />
        </el-select> -->
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <!-- <el-button icon="el-icon-refresh-right" @click="handleReset">重置</el-button> -->
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="house-resource-manage__status-tabs">
      <div v-for="tab in statusTabs" :key="tab.value" class="house-resource-manage__status-tab" :class="{ 'is-active': activeStatus === tab.value }" @click="activeStatus = tab.value">
        <span class="house-resource-manage__status-dot" :style="{ background: tab.color }" />
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <!-- 楼栋销控图 -->
    <div v-loading="loading" class="house-resource-manage__buildings">
      <div v-for="building in filteredBuildingList" :key="building.id" class="house-resource-manage__building">
        <div class="house-resource-manage__building-header">
          <i class="el-icon-office-building" />
          <span class="house-resource-manage__building-title">{{ building.buildingNo }}号楼</span>
          <span class="house-resource-manage__building-sub">（{{ building.type || '-' }} / {{ building.floorCount }} / {{ building.totalArea }}㎡）</span>
          <el-button type="text" size="mini" @click="handleBuildingDetail(building)">详情</el-button>
        </div>
        <div class="house-resource-manage__building-body">
          <div v-for="region in building.regions" :key="region.id" class="house-resource-manage__region">
            <div class="house-resource-manage__region-title">{{ region.name }}</div>
            <div v-for="floor in region.floors" :key="floor.floorNo" class="house-resource-manage__floor">
              <div class="house-resource-manage__floor-label">{{ floor.floorNo }}层</div>
              <div class="house-resource-manage__rooms">
                <div v-for="room in floor.rooms" :key="room.id" class="house-resource-manage__room" :class="[`is-${room.status}`]" @click="handleRoomClick(room)">
                  <div class="house-resource-manage__room-no">{{ room.roomNo }}</div>
                  <div class="house-resource-manage__room-area">{{ room.area }}㎡</div>
                </div>
                <div v-if="!floor.rooms.length" class="house-resource-manage__room is-empty" :class="[`is-${floor.status || 'idle'}`]" @click="handleEmptyRoomClick(floor)">
                  <div class="house-resource-manage__room-no">-</div>
                  <div class="house-resource-manage__room-area">0㎡</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && !filteredBuildingList.length" description="暂无房源数据" />
    </div>

    <!-- 房间详情 -->
    <el-dialog title="房源详情" :visible.sync="roomDetailVisible" width="760px" :close-on-click-modal="false" append-to-body @close="handleDetailClose">
      <div v-if="currentRoom" class="house-resource-manage__detail">
        <div class="house-resource-manage__detail-form">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="房间号">{{ currentRoom.roomNo }}</el-descriptions-item>
            <el-descriptions-item label="所属楼栋">{{ currentRoom.buildingNo }}号楼</el-descriptions-item>
            <el-descriptions-item label="楼层">{{ currentRoom.floorNo }}层</el-descriptions-item>
            <el-descriptions-item label="建筑面积">{{ currentRoom.area }}㎡</el-descriptions-item>
            <el-descriptions-item label="层高(m)">{{ currentRoom.height || '-' }}</el-descriptions-item>
            <el-descriptions-item label="承重(t)">{{ currentRoom.weight || '-' }}</el-descriptions-item>
            <el-descriptions-item label="是否绑定货梯">{{ currentRoom.elevator || '-' }}</el-descriptions-item>
            <el-descriptions-item label="房源状态">
              <div class="house-resource-manage__status-value">
                <el-tag :type="getStatusType(currentRoom.status)" size="small">{{ getStatusLabel(currentRoom.status) }}</el-tag>
                <el-button type="text" size="mini" :loading="statusUpdating" @click="handleStatusChange">修改状态</el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="租金标准">{{ currentRoom.priceStandard || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入驻企业">{{ currentRoom.tenant || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="house-resource-manage__detail-attachment">
          <div class="house-resource-manage__detail-attachment-title">附件图片</div>
          <div v-loading="attachmentLoading" class="house-resource-manage__detail-image">
            <canvas v-if="attachmentImageLoaded" ref="attachmentCanvas" width="800" height="600" @click="openAttachmentPreview" />
            <el-empty v-else-if="!attachmentLoading" description="暂无附件图片" :image-size="80" />
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="roomDetailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="附件图片" :visible.sync="attachmentPreviewVisible" width="90%" append-to-body>
      <div class="house-resource-manage__attachment-preview">
        <canvas v-if="attachmentImageLoaded" ref="attachmentPreviewCanvas" width="800" height="600" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'HouseResourceManage',
  data() {
    return {
      loading: false,
      searchForm: {
        parkId: '',
        buildingNo: '',
        type: ''
      },
      activeStatus: '',
      statCards: [
        { label: '已租面积(㎡)', value: '0.00' },
        { label: '已售面积(㎡)', value: '0.00' },
        { label: '房源总数(间)', value: '0' },
        { label: '可租房源数(间)', value: '0' },
        { label: '可售房源数(间)', value: '0' }
      ],
      statusTabs: [
        { label: '全部', value: '', color: '#909399' },
        // { label: '预定', value: 'reserved', color: '#e6a23c' },
        { label: '待招商', value: 'idle', color: '#67c23a' },
        { label: '签约', value: 'signed', color: '#409eff' }
      ],
      parkOptions: [],
      buildingList: [],
      roomDetailVisible: false,
      currentRoom: null,
      attachmentLoading: false,
      attachmentImageUrl: '',
      attachmentImageLoaded: false,
      attachmentSelections: [],
      attachmentImage: null,
      attachmentPreviewVisible: false,
      statusUpdating: false
    }
  },
  computed: {
    pageTitle() {
      const park = this.parkOptions.find((item) => String(item.id) === String(this.searchForm.parkId))
      const parkName = park ? park.parkName : '园区'
      return `${parkName} - 销控图`
    },
    filteredBuildingList() {
      if (!this.activeStatus) return this.buildingList
      return this.buildingList
        .map((building) => {
          const regions = building.regions
            .map((region) => ({
              ...region,
              floors: region.floors
                .map((floor) => ({
                  ...floor,
                  rooms: floor.rooms.filter((room) => room.status === this.activeStatus)
                }))
                .filter((floor) => floor.rooms.length)
            }))
            .filter((region) => region.floors.length)
          return { ...building, regions }
        })
        .filter((building) => building.regions.length)
    }
  },
  created() {
    this.getParkOptions()
  },
  methods: {
    getStatusType(status) {
      const map = {
        reserved: 'warning',
        idle: 'success',
        signed: 'primary'
      }
      return map[status] || 'info'
    },
    getStatusLabel(status) {
      const map = {
        // reserved: '预定',
        idle: '待招商',
        signed: '签约'
      }
      return map[status] || status || '-'
    },
    formatNumber(val, digits = 2) {
      const num = Number(val)
      if (Number.isNaN(num)) return digits > 0 ? '0.00' : '0'
      return num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    },
    getParkOptions() {
      this.$api['yqRequestApi.parkTableApi']()
        .then((response) => {
          this.parkOptions = this.toList(response).map((item) => ({
            id: item.id || item.ID,
            parkName: item.parkName || item.name || item.PARKNAME || item.NAME || '-'
          }))
          if (this.parkOptions.length) {
            const queryParkId = this.$route && this.$route.query && this.$route.query.id
            const selectedPark = this.parkOptions.find((item) => String(item.id) === String(queryParkId)) || this.parkOptions[0]
            this.searchForm.parkId = selectedPark.id
            this.getBuildingList()
          }
        })
        .catch(() => {
          this.parkOptions = []
        })
    },
    getBuildingList() {
      if (!this.searchForm.parkId) return
      this.loading = true
      this.$api['yqRequestApi.parkTableApi']({ id: this.searchForm.parkId })
        .then((response) => {
          const records = this.toList(response)
          const park = records.find((item) => String(item.id || item.ID) === String(this.searchForm.parkId)) || records[0] || {}
          const buildings = park.buildings || park.BUILDINGS || []
          this.buildingList = this.normalizeBuildingResources(buildings)
          this.calculateStats(this.buildingList)
        })
        .catch((error) => {
          this.buildingList = []
          this.calculateStats([])
          console.error('房源数据加载失败', error)
          this.$message.error(error && error.message ? `房源数据加载失败：${error.message}` : '房源数据加载失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    toList(response) {
      const data = response && response.data ? response.data : response
      if (Array.isArray(data)) return data
      return (data && (data.records || data.list || data.rows || data.data)) || []
    },
    normalizeBuilding(item) {
      return {
        id: item.id || item.ID || item.buildingId || item.BUILDINGID,
        buildingNo: item.buildingNo || item.buildingName || item.code || item.name || item.BUILDINGNO || item.BUILDINGNAME || '-',
        type: item.type || item.buildingType || item.houseType || item.TYPE || item.BUILDINGTYPE || '',
        floorCount: item.floorCount || item.floorNum || item.floor || item.FLOORCOUNT || '-',
        totalArea: item.totalArea || item.area || item.TOTALAREA || 0
      }
    },
    normalizeRegion(item) {
      return {
        id: item.id || item.ID || item.regionId || item.REGIONID,
        name: item.name || item.regionName || item.regionCode || item.REGIONNAME || item.REGIONCODE || '-',
        buildingId: item.buildingId || item.BUILDINGID
      }
    },
    normalizeFloor(item) {
      return {
        id: item.id || item.ID || item.floorId || item.FLOORID,
        floorNo: item.floorNo || item.code || item.location || item.floorName || item.FLOORNO || item.FLOORNAME || '-',
        status: this.normalizeResourceStatus(item.status !== undefined && item.status !== null ? item.status : item.STATUS),
        height: item.height || item.HEIGHT || '',
        weight: item.weight || item.WEIGHT || '',
        elevator: item.elevator || item.ELEVATOR || ''
      }
    },
    normalizeRoom(item) {
      return {
        id: item.id || item.ID || item.roomId || item.ROOMID,
        roomNo: item.roomNo || item.roomName || item.ROOMNO || item.ROOMNAME || '-',
        floorNo: item.floorNo || item.floorName || item.FLOORNO || item.FLOORNAME || '-',
        floorId: item.floorId || item.FLOORID,
        buildingId: item.buildingId || item.BUILDINGID,
        regionId: item.regionId || item.REGIONID,
        regionName: item.regionName || item.REGIONNAME,
        area: item.area || item.buildingArea || item.AREA || 0,
        height: item.height || item.HEIGHT || '',
        weight: item.weight || item.WEIGHT || '',
        elevator: item.elevator || item.ELEVATOR || '',
        status: this.normalizeResourceStatus(
          item.status !== undefined && item.status !== null ? item.status : item.roomStatus !== undefined && item.roomStatus !== null ? item.roomStatus : item.STATUS
        ),
        priceStandard: item.priceStandard || item.PRICESTANDARD || '',
        tenant: item.tenant || item.enterpriseName || item.TENANT || ''
      }
    },
    normalizeResourceStatus(status) {
      if (String(status) === '1') return 'signed'
      if (String(status) === '0' || status === undefined || status === null || status === '') return 'idle'
      return status
    },
    normalizeBuildingResources(buildings) {
      return (Array.isArray(buildings) ? buildings : []).map((item) => {
        const building = this.normalizeBuilding(item)
        const regions = item.regions || item.regionList || item.REGIONS || item.REGIONLIST || []
        building.regions = regions.map((regionItem) => {
          const region = this.normalizeRegion({ ...regionItem, buildingId: building.id })
          const floors = regionItem.floors || regionItem.floorList || regionItem.FLOORS || regionItem.FLOORLIST || []
          region.floors = floors.map((floorItem) => {
            const floor = this.normalizeFloor(floorItem)
            const rooms = floorItem.rooms || floorItem.roomList || floorItem.ROOMS || floorItem.ROOMLIST || []
            floor.rooms = rooms.map((roomItem) =>
              this.normalizeRoom({
                ...roomItem,
                status: roomItem.status === undefined || roomItem.status === null ? floor.status : roomItem.status,
                buildingId: building.id,
                regionId: region.id,
                regionName: region.name,
                floorId: floor.id,
                floorNo: floor.floorNo,
                height: floor.height,
                weight: floor.weight,
                elevator: floor.elevator
              })
            )
            return floor
          })
          return region
        })
        building.regions = regions.length ? building.regions : []
        return building
      })
    },
    buildResourceTree(buildings, regions, rooms) {
      return buildings
        .filter((building) => !this.searchForm.buildingNo || String(building.buildingNo) === String(this.searchForm.buildingNo).trim())
        .filter((building) => !this.searchForm.type || building.type === this.searchForm.type)
        .map((building) => {
          const buildingRooms = rooms.filter((room) => String(room.buildingId) === String(building.id))
          const buildingRegions = regions.filter((region) => String(region.buildingId) === String(building.id))
          const regionMap = new Map()
          buildingRegions.forEach((region) => regionMap.set(String(region.id), { ...region, floors: [] }))
          buildingRooms.forEach((room) => {
            const regionKey = room.regionId ? String(room.regionId) : `name:${room.regionName || '未分区'}`
            if (!regionMap.has(regionKey)) regionMap.set(regionKey, { id: regionKey, name: room.regionName || '未分区', floors: [] })
            const region = regionMap.get(regionKey)
            let floor = region.floors.find((item) => String(item.floorNo) === String(room.floorNo))
            if (!floor) {
              floor = { floorNo: room.floorNo, rooms: [] }
              region.floors.push(floor)
            }
            floor.rooms.push({ ...room, buildingNo: building.buildingNo, floorNo: room.floorNo })
          })
          const resourceRegions = Array.from(regionMap.values()).filter((region) => region.floors.length)
          const allRooms = resourceRegions.reduce((list, region) => list.concat(region.floors.reduce((roomsInRegion, floor) => roomsInRegion.concat(floor.rooms), [])), [])
          return {
            ...building,
            regions: resourceRegions,
            floorCount: resourceRegions.reduce((count, region) => count + region.floors.length, 0),
            totalArea: this.formatNumber(
              allRooms.reduce((sum, room) => sum + Number(room.area || 0), 0),
              2
            )
          }
        })
    },
    calculateStats(buildings) {
      let totalRooms = 0
      let rentedArea = 0
      let soldArea = 0
      let idleCount = 0
      let saleCount = 0
      buildings.forEach((building) => {
        building.regions.forEach((region) =>
          region.floors.forEach((floor) => {
            floor.rooms.forEach((room) => {
              totalRooms += 1
              const area = Number(room.area) || 0
              if (room.status === 'signed') rentedArea += area
              else if (room.status === 'reserved') soldArea += area
              else if (room.status === 'idle') {
                idleCount += 1
                saleCount += 1
              }
            })
          })
        )
      })
      this.statCards = [
        { label: '已租面积(㎡)', value: this.formatNumber(rentedArea, 2) },
        { label: '已售面积(㎡)', value: this.formatNumber(soldArea, 2) },
        { label: '房源总数(间)', value: `${totalRooms}` },
        { label: '可租房源数(间)', value: `${idleCount}` },
        { label: '可售房源数(间)', value: `${saleCount}` }
      ]
    },
    handleSearch() {
      this.getBuildingList()
    },
    handleReset() {
      this.searchForm = {
        parkId: '',
        buildingNo: '',
        type: ''
      }
      this.activeStatus = ''
      this.getBuildingList()
    },
    goBack() {
      this.$router.push('/houseProduct/parkManage')
    },
    handleRoomClick(room) {
      console.log('房源方块信息', room)
      this.currentRoom = room
      this.roomDetailVisible = true
      this.loadAttachmentImage(room.id)
    },
    handleEmptyRoomClick(floor) {
      const emptyRoom = {
        id: floor.id,
        roomNo: '-',
        buildingNo: '-',
        floorNo: floor.floorNo,
        area: 0,
        height: floor.height,
        weight: floor.weight,
        elevator: floor.elevator,
        status: floor.status || 'idle',
        priceStandard: '',
        tenant: ''
      }
      console.log('空房源方块信息', emptyRoom)
      this.currentRoom = emptyRoom
      this.roomDetailVisible = true
      this.loadAttachmentImage(floor.id)
    },
    loadAttachmentImage(id) {
      this.clearAttachmentImage()
      if (!id) return
      this.attachmentLoading = true
      this.attachmentImageLoaded = false
      this.attachmentSelections = []
      this.$api['baseData.getFormData']({ desformCode: 'floor', dataId: id })
        .then((response) => {
          const params = response && response.primary && response.primary.table && response.primary.table.PARAMS
          if (params) {
            try {
              this.attachmentSelections = typeof params === 'string' ? JSON.parse(params) || [] : params
            } catch (error) {
              console.warn('房源框选区域参数解析失败', error)
            }
          }
          const files = response && response.primary && Array.isArray(response.primary.uploadFiles) ? response.primary.uploadFiles : []
          const file = files.find((item) => item && (item.id || item.ID))
          if (!file) return null
          return this.$api['SystemSettings.getFileUrl']({ attachmentId: file.id || file.ID }, { responseType: 'blob' })
        })
        .then((response) => {
          if (response && response.data) {
            this.attachmentImageUrl = window.URL.createObjectURL(new Blob([response.data]))
            const image = new Image()
            image.onload = () => {
              this.attachmentImage = image
              this.attachmentImageLoaded = true
              this.$nextTick(() => this.drawAttachmentCanvas(image))
            }
            image.onerror = () => {
              console.error('房源附件图片渲染失败')
            }
            image.src = this.attachmentImageUrl
          }
        })
        .catch((error) => {
          console.error('房源附件图片加载失败', error)
        })
        .finally(() => {
          this.attachmentLoading = false
        })
    },
    clearAttachmentImage() {
      if (this.attachmentImageUrl) {
        window.URL.revokeObjectURL(this.attachmentImageUrl)
        this.attachmentImageUrl = ''
      }
      this.attachmentImageLoaded = false
      this.attachmentSelections = []
      this.attachmentImage = null
      this.attachmentPreviewVisible = false
    },
    drawAttachmentCanvas(image, targetCanvas = this.$refs.attachmentCanvas) {
      const canvas = targetCanvas
      if (!canvas) return
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      this.attachmentSelections.forEach((selection) => {
        const color = selection.color || this.getAttachmentSelectionColor(selection.type)
        if (selection.type === 'rectangle') {
          context.fillStyle = color
          context.fillRect(selection.startX, selection.startY, selection.endX - selection.startX, selection.endY - selection.startY)
        } else if (selection.type === 'polygon') {
          this.drawAttachmentPolygon(context, selection.points, color)
        } else if (selection.type === 'circle') {
          context.beginPath()
          context.arc(selection.centerX, selection.centerY, selection.radius, 0, Math.PI * 2)
          context.fillStyle = color
          context.fill()
        }
      })
    },
    openAttachmentPreview() {
      if (!this.attachmentImage) return
      this.attachmentPreviewVisible = true
      this.$nextTick(() => this.drawAttachmentCanvas(this.attachmentImage, this.$refs.attachmentPreviewCanvas))
    },
    getAttachmentSelectionColor(type) {
      const colors = {
        rectangle: 'rgba(59, 130, 246, 0.3)',
        polygon: 'rgba(239, 68, 68, 0.3)',
        circle: 'rgba(139, 92, 246, 0.3)'
      }
      return colors[type] || colors.rectangle
    },
    drawAttachmentPolygon(context, points, color) {
      if (!Array.isArray(points) || points.length < 3) return
      context.beginPath()
      context.moveTo(points[0].x, points[0].y)
      points.slice(1).forEach((point) => context.lineTo(point.x, point.y))
      context.closePath()
      context.fillStyle = color
      context.fill()
    },
    handleDetailClose() {
      this.clearAttachmentImage()
      this.attachmentLoading = false
      this.currentRoom = null
    },
    handleStatusChange() {
      if (!this.currentRoom || !this.currentRoom.id || this.statusUpdating) return
      const currentStatus = this.currentRoom.status
      const nextStatus = currentStatus === 'signed' || String(currentStatus) === '1' ? 0 : 1
      this.statusUpdating = true
      this.$api['yqRequestApi.editFloorStatusApi']({
        id: this.currentRoom.id,
        status: nextStatus
      })
        .then(() => {
          this.currentRoom.status = this.normalizeResourceStatus(nextStatus)
          this.$message.success('房源状态修改成功')
          this.getBuildingList()
        })
        .catch((error) => {
          console.error('房源状态修改失败', error)
          this.$message.error('房源状态修改失败')
        })
        .finally(() => {
          this.statusUpdating = false
        })
    },
    handleBuildingDetail(building) {
      this.$message.info(`查看${building.buildingNo}号楼详情`)
    }
  }
}
</script>

<style lang="scss" scoped>
.house-resource-manage {
  height: calc(100% - 30px);
  margin: 14px;
  overflow: auto;
  background: #f5f7fa;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  &__back {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #409eff;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      color: #66b1ff;
    }
  }

  &__title {
    flex: 1;
    margin-left: 16px;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }

  &__detail {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.8fr);
    gap: 20px;
  }

  &__detail-attachment-title {
    margin-bottom: 10px;
    color: #606266;
    font-size: 14px;
    font-weight: 600;
  }

  &__status-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__detail-image {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 260px;
    overflow: hidden;
    background: #f5f7fa;
    border: 1px solid #ebeef5;

    canvas {
      display: block;
      max-width: 100%;
      max-height: 360px;
    }
  }

  &__attachment-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 600px;
    background: #f5f7fa;

    canvas {
      display: block;
      max-width: 100%;
      max-height: 70vh;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  &__stat-card {
    padding: 18px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  &__stat-label {
    margin-bottom: 8px;
    color: #909399;
    font-size: 13px;
  }

  &__stat-value {
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__status-tabs {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  &__status-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #606266;
    font-size: 14px;
    cursor: pointer;

    &.is-active {
      color: #409eff;
      font-weight: 600;
    }
  }

  &__status-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  &__buildings {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__building {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  &__building-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    border-bottom: 1px solid #ebeef5;

    .el-button--text {
      margin-left: auto;
    }
  }

  &__building-title {
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }

  &__building-sub {
    color: #909399;
    font-size: 12px;
  }

  &__building-body {
    padding: 12px 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
  }

  &__region {
    min-width: 0;
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__region-title {
    margin-bottom: 8px;
    color: #303133;
    font-size: 13px;
    font-weight: 600;
  }

  &__floor {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__floor-label {
    flex: 0 0 36px;
    color: #606266;
    font-size: 13px;
    font-weight: 600;
  }

  &__rooms {
    display: flex;
    flex: 1;
    gap: 8px;
  }

  &__room {
    flex: 1;
    min-width: 0;
    padding: 8px 4px;
    text-align: center;
    border-radius: 4px;
    border: 1px solid;
    cursor: pointer;
    transition: transform 0.15s;

    &:hover {
      transform: translateY(-2px);
    }

    &.is-reserved {
      color: #e6a23c;
      background: #fdf6ec;
      border-color: #f5dab1;
    }

    &.is-idle {
      color: #67c23a;
      background: #f0f9eb;
      border-color: #c2e7b0;
    }

    &.is-signed {
      color: #409eff;
      background: #ecf5ff;
      border-color: #b3d8ff;
    }

    &.is-empty {
      cursor: default;

      &:hover {
        transform: none;
      }
    }
  }

  &__room-no {
    font-size: 13px;
    font-weight: 600;
  }

  &__room-area {
    margin-top: 2px;
    font-size: 11px;
  }

  @media (max-width: 900px) {
    &__buildings,
    &__building-body {
      grid-template-columns: 1fr;
    }

    &__detail {
      grid-template-columns: 1fr;
    }
  }
}
</style>
