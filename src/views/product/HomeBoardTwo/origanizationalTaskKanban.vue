<template>
  <div style="height: 100%; position:relative;"
       id="wrap">
    <div class="searchDay"
         v-if="searchVisible"
         id="searchDay">
      <span class="message"
            v-if="searchVisible"><i class="el-icon-info"
           style="font-size:16px; color:green;"></i>统计当前登录人所在部门<span v-html="dayView"></span>内所有任务</span>
      <span class="label refreshTime">刷新间隔(秒)：</span>
      <el-input-number v-model="refreshTime"
                       style="width: 100px;"
                       class="refreshTime"
                       :min="1"
                       :max="365"
                       :precision="0"
                       controls-position="right"
                       @change="setRefreshTime"
                       @blur="setRefreshTime">
      </el-input-number>
      <span class="label"
            style="margin-left: 10px;">时间范围：</span>
      <el-select v-model="timeRangeDay"
                 style="width: 120px;"
                 placeholder="请选择时间"
                 @change="timeRangeChange">
        <el-option label="一天"
                   value="0"></el-option>
        <el-option label="一周"
                   value="7"></el-option>
        <el-option label="一月"
                   value="30"></el-option>
        <el-option label="自定义"
                   value="custom"></el-option>
      </el-select>
      <span v-if="timeRangeDay == 'custom'"
            style="margin-left: 5px;">
        <el-input-number v-model="customDay"
                         style="width: 100px;"
                         :min="1"
                         :max="365"
                         :precision="0"
                         controls-position="right"
                         @change="searchDayBlur"
                         @blur="searchDayBlur">
        </el-input-number>
        <span style="margin-left: 5px;">天</span>
      </span>
    </div>
    <P8TableRender ref="tableRender"
                   class="planLayout"
                   :code="tableCode"
                   :reportParam="reportParam"
                   :west-tree-param="provideParams.searchParams"
                   :hasLoading="false"
                   @refresh-data="refreshData">
      <template #NAME="{ scope, thirdMenuData }">
        <span v-if="scope.row.ISTODAY == 'true'" style="font-size:12px;display:inline-block;width:20px;height:20px;line-height:20px;border-radius:50%;background:#bae5ba;color:green;">新</span>
        <span v-if="scope.row.USERID === userId"
              class="underline"
              @click="drillCol(scope, thirdMenuData)">{{ scope.row.NAME }} </span>
        <span v-else>{{ scope.row.NAME }}</span>
      </template>
      <template #DAYSREMAINING="{scope}">
        <div v-html="overdueTextFun(scope.row)"></div>
      </template>
    </P8TableRender>
  </div>
</template>

<script>
import { calculateRemainingDays } from '@/utils/common'
import { mapGetters } from 'vuex'
export default {
  name: 'origanizationalTaskKanban',
  data () {
    return {
      timeRangeDay: null,
      tableCode: 'origanizationalTaskKanban',
      reportParam: {
        customDaysQuery: 0
      },
      provideParams: {
        searchParams: {}
      },
      customDay: 1,
      searchVisible: false,
      timer: null,
      refreshTime: 6,
      dayView: '一天'
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  created () {
    let time = localStorage.getItem("setRefreshTime");
    if (time) {
      this.refreshTime = time
    }
  },
  mounted () {
    let timer = setInterval(() => {
      if (this.$refs.tableRender && this.$refs.tableRender.$refs.xTable) {
        const parentElement = this.$refs.tableRender.$el
        const mh = parentElement.offsetHeight - 150
        const rowHeight = this.$refs.tableRender.$refs.xTable.tableRowHeight
        const visibleRows = Math.floor(mh / rowHeight);
        this.$refs.tableRender.$refs.xTable.page.size = visibleRows
        let index = this.$refs.tableRender.$refs.xTable.pageSizes.find(el => {
          el == visibleRows
        })
        if (!index && !this.$refs.tableRender.$refs.xTable.pageSizes.includes(visibleRows)) {
          this.$refs.tableRender.$refs.xTable.pageSizes.push(visibleRows)
          this.$refs.tableRender.$refs.xTable.pageSizes.sort((a, b) => {
            return a - b
          })
        }
        clearInterval(timer)
      }
    }, 200)
    this.timeRangeDay = '0'
  },
  methods: {
    overdueTextFun (row) {
      return calculateRemainingDays(row).text
    },
    timeRangeChange (value) {
      let searchDay = document.getElementById('searchDay')
      if (value == 'custom') {
        searchDay.style.right = "470px"
      } else {
        this.customDay = 0
        searchDay.style.right = "470px"
        this.$refs.tableRender.tableParam.sqlParam = {
          customDaysQuery: {
            value: Number(this.timeRangeDay), mode: "=", relation: "and"
          }
        }
      }
      switch (value) {
        case '0':
          this.dayView = '一天';
          break;
        case '7':
          this.dayView = '一周';
          break;
        case '30':
          this.dayView = '一月';
          break;
        case 'custom':
          break;
      }
    },
    searchDayBlur () {
      if (this.$refs.tableRender && this.$refs.tableRender.tableParam) {
        this.$refs.tableRender.tableParam.sqlParam = {
          customDaysQuery: {
            value: this.customDay, mode: "=", relation: "and"
          }
        }
      }
      if (this.customDay) {
        this.dayView = this.customDay + '天';
      }
    },
    refreshData () {
      this.searchVisible = true
      let page = this.$refs.tableRender && this.$refs.tableRender.$refs.xTable ? this.$refs.tableRender.$refs.xTable.page : ''
      if (page.total == 0) {
        return
      }
      this.startAutoPage()
    },
    updatePageInfo () {
      let page = this.$refs.tableRender && this.$refs.tableRender.$refs.xTable ? this.$refs.tableRender.$refs.xTable.page : ''
      if (page) {
        let info = page
        if (info) {
          this.currentPage = info.current
          this.totalPages = Math.ceil(info.total / info.size)
          if (info.total == 0) {
            this.stopAutoPage()
          }
        }
      }
    },
    isLastPage () {
      return this.currentPage >= this.totalPages
    },
    async startAutoPage () {
      this.timer = await setTimeout(() => {
        this.excuteAutoPage()
      }, this.refreshTime * 1000)
    },
    excuteAutoPage () {
      this.stopAutoPage()
      this.updatePageInfo()
      if (this.isLastPage()) {
        this.goToPage(1)
      } else {
        this.nextPage()
      }
    },
    goToPage (num) {
      let page = this.$refs.tableRender && this.$refs.tableRender.$refs.xTable ? this.$refs.tableRender.$refs.xTable.page : ''
      if (page) {
        this.$refs.tableRender.$refs.xTable.page.current = num
        this.$refs.tableRender.$refs.xTable.queryList()
      }
    },
    nextPage () {
      let page = this.$refs.tableRender && this.$refs.tableRender.$refs.xTable ? this.$refs.tableRender.$refs.xTable.page : ''
      if (page) {
        this.$refs.tableRender.$refs.xTable.page.current = page.current + 1
        this.$refs.tableRender.$refs.xTable.queryList()
      }
    },
    stopAutoPage () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    drillCol (scope, thirdMenuData) {
      const stateInfo = {
        taskInfo: {
          taskId: scope.row.ID,
          planInfoId: scope.row.PLANINFOID,
          status: scope.row.MANAGERSTATUS,
          thirdMenuParam: {
            ...scope.row,
            progress: Number((scope.row.PROGRESS * 100).toFixed(0)),
            taskId: scope.row.TASKID,
            secretGrade: scope.row.SECRETGRADE,
            planInfoId: scope.row.PLANINFOID,
            wholeDescribeId: scope.row.WHOLEDESCRIBEID,
            planInfoStatus: scope.row.EXECUTESTATE,
            currentRoute: '/MyTask/MyTask/latest',
            createPage: 'decompose',
            currentPage: 'normal',
            getProjectLevel: scope.row.LEVEL
          }
        },
        routeMeta: this.$route.meta,
      }

      if (this.$route.path !== '/MyTask/MyTask/latest') {
        // 如果是从其他页面打开新窗口，将状态存储到 sessionStorage
        sessionStorage.setItem('stateInfo', JSON.stringify(stateInfo))
        // 修改为哈希路由方式打开新窗口
        const baseUrl = window.location.origin + window.location.pathname
        const targetUrl = `${baseUrl}#/MyTask/MyTask/latest`
        window.open(targetUrl, '_blank')
        // 在原窗口清除 sessionStorage
        sessionStorage.removeItem('stateInfo')
      } else {
        // 如果已经在任务页面，直接更新状态并打开抽屉
        window.STATUS_KEY = stateInfo.taskInfo.status
        this.thirdMenuParam = stateInfo.taskInfo.thirdMenuParam
        this.projectLevel = stateInfo.taskInfo.thirdMenuParam.getProjectLevel
        this.visible = true
      }
    },
    setRefreshTime () {
      localStorage.setItem("setRefreshTime", this.refreshTime);
    }
  },
  beforeDestroy () {
    this.stopAutoPage()
  }
}
</script>
<style lang='scss' scoped>
#wrap {
  font-size: 14px;
}
.searchDay {
  position: absolute;
  top: 10px;
  right: 470px;
  width: calc(100% - 480px);
  z-index: 1000;
  display: inline-block;
  text-align: right;
}
.message {
  float: left;
  margin-top: 5px;
}
@media screen and (max-width: 1500px) {
  .message {
    display: none;
  }
}
@media screen and (max-width: 1200px) {
  .refreshTime {
    display: none;
  }
}
@media screen and (max-width: 1200px) {
  .refreshTime {
    display: none;
  }
}
.planLayout ::v-deep .vxe-table--render-default .vxe-body--row.row--stripe > .vxe-body--column {
  background-color: #eee !important;
}
</style>
