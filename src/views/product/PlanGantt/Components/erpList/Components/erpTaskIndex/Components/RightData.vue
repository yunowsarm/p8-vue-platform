<template>
  <list-layout class="right-wrap">
    <template #north>
      <div class="type-wrap">
        <span class="type-item" v-for="item in typeList" :key="item.color">
          <i class="p8 icon-filled-circle" :style="{ color: item.color }"></i>
          <span>{{ item.text }}</span>
        </span>
      </div>
    </template>
    <template #center>
      <el-timeline class="custom-timeline-style">
        <el-timeline-item v-for="(item, index) in dataList" :key="index" size="large" :class="{ 'odd-line': index % 2 !== 0 }">
          <template #dot>
            <span v-if="item.zlwtbz === '0'" class="p8 icon-filled-circle" :style="{ fontSize: '20px', color: item.statusColor }"> </span>
            <span v-else class="el-icon-warning" :style="{ fontSize: '20px', cursor: 'pointer', color: item.statusColor }" @click.stop="dropClick(item)"></span>
          </template>
          <div class="line-content">
            <el-row>
              <el-col class="col-title" :span="5">工序号:</el-col>
              <el-col class="col-content" :span="7">{{ item.gxh }}</el-col>
              <el-col class="col-title" :span="5">工序名称:</el-col>
              <el-col class="col-content" :span="7">{{ item.gxmc }}</el-col>
            </el-row>
            <el-row>
              <el-col class="col-title" :span="5">加工人:</el-col>
              <el-col class="col-content" :span="7">{{ item.jgr }}</el-col>
              <el-col class="col-title" :span="5">加工车间:</el-col>
              <el-col class="col-content" :span="7">{{ item.jgcj }}</el-col>
            </el-row>
            <el-row>
              <el-col class="col-title" :span="5">计划开始时间:</el-col>
              <el-col class="col-content" :span="7">{{ item.planBeginDate }}</el-col>
              <el-col class="col-title" :span="5">计划完成时间:</el-col>
              <el-col class="col-content" :span="7">{{ item.planEndDate }}</el-col>
            </el-row>
            <el-row>
              <el-col class="col-title" :span="5">实际开始时间:</el-col>
              <el-col class="col-content" :span="7">{{ item.beginDate }}</el-col>
              <el-col class="col-title" :span="5">实际完成时间:</el-col>
              <el-col class="col-content" :span="7">{{ item.endDate }}</el-col>
            </el-row>
          </div>
        </el-timeline-item>
      </el-timeline>
    </template>
    <template #drawer-panel>
      <common-drawer
        size="100%"
        v-if="visibleZLGX"
        :visible="visibleZLGX"
        title="质量工序跟踪"
        direction="ttb"
        :drawer-config="drawerConfig"
        :is-need-custom-drawer-class="false"
        @close="visibleZLGX = false"
      >
        <template #drawer>
          <zlwt-list ref="table" :flex="100" :columns="columns" :params="tableQueryParams" :api="tableApi" :pagination="false"> </zlwt-list>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Drawer as CommonDrawer, Timeline, TimelineItem, Row, Col } from 'p8-components-ui'

import ZlwtList from './zlwtList'

export default {
  name: '',
  props: {
    queryParams: {
      type: Object,
      default: () => {
        return {
          zyjhno: '',
          type: ''
        }
      }
    }
  },
  components: {
    ListLayout,
    ZlwtList,
    CommonDrawer,
    'el-timeline': Timeline,
    'el-timeline-item': TimelineItem,
    'el-row': Row,
    'el-col': Col
  },
  watch: {
    queryParams: {
      handler(val) {
        this.getData()
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: 55,
        align: 'center'
      },
      {
        title: '作业计划号',
        align: 'center',
        dataIndex: 'zyjhno'
      },
      {
        title: '图号',
        dataIndex: 'invcode',
        align: 'center',
        width: 200
      }
    ]
    return {
      dataApi: 'erpTask.vlpRight',
      typeList: [
        { text: '待加工', color: '#999999', status: '0' },
        { text: '加工中', color: '#1bbf9e', status: '1' },
        { text: '已完成', color: '#1ac1ff', status: '2' },
        { text: '已超期', color: '#ed9118', status: '3' },
        { text: '质量问题', color: '#ff3333', status: '4' }
      ],
      dataList: [],
      visibleZLGX: false,
      tableApi: '',
      tableQueryParams: {
        gxh: '',
        zyjhno: ''
      },
      columns,
      drawerConfig: {
        modal: false
      }
    }
  },
  methods: {
    getData() {
      const _this = this
      this.$api[_this.dataApi](_this.queryParams).then((res) => {
        if (res.length) {
          res.forEach((data) => {
            const type = _this.typeList.filter((item) => item.status === data.status)
            data.statusColor = type.length ? type[0].color : ''
          })
          _this.dataList = res
        }
      })
    },
    dropClick(record) {
      this.visibleZLGX = true
      this.tableQueryParams.gxh = record.gxh
      this.tableQueryParams.zyjhno = this.queryParams.zyjhno
    }
  }
}
</script>

<style lang="scss" scoped>
.right-wrap {
  ::v-deep .list-header {
    background: #fff;
  }
}
.type-wrap {
  line-height: 30px;
  display: flex;
  .type-item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-right: 20px;
    i {
      font-size: 20px;
    }
  }
}
.custom-timeline-style.el-timeline {
  padding: 10px 0;
  ::v-deep .el-timeline-item {
    .el-timeline-item__tail {
      left: calc(50% - 4px);
    }
    .el-timeline-item__dot {
      left: calc(50% - 13px);
      top: -4px;
    }
    .el-timeline-item__wrapper {
      left: 50%;
      width: calc(50% - 36px);
    }
    &.odd-line {
      .el-timeline-item__wrapper {
        left: -20px;
      }
    }
  }
}
.line-content {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  font-size: 12px;
  .el-row {
    border-bottom: 1px solid #e8e8eb;
  }
  .el-col {
    line-height: 30px;
  }
  .col-title {
    background: #f2f2f2;
    text-align: right;
    padding-right: 8px;
  }
  .col-content {
    padding-left: 8px;
  }
}
</style>
