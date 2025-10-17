<template>
  <div style="height: 100%">
    <FullCalendar :key="dateTime" class="calendarLayout" :options="calendarOptions" />
    <common-dialog
      v-if="visibleDrawerOther"
      :title="drawerTitle"
      :visible="visibleDrawerOther"
      :dialog-config="dialogConfig"
      :show-handle-btn="false"
      :dialog-height="dialogHeight"
      :width="dialogWidth"
      @close="onEditResourcesCloseOther"
    >
      <template #dialog>
        <P8TableRender ref="tableRender" class="planLayout" :code="tableCode" :report-param="reportParam" :west-tree-param="provideParams.searchParams"> </P8TableRender>
      </template>
    </common-dialog>
    <common-dialog
      v-if="visibleDrawerTodo"
      title="待办事项执行"
      :visible="visibleDrawerTodo"
      :dialog-config="dialogConfig"
      :show-handle-btn="false"
      :dialog-height="dialogHeight"
      :width="dialogWidth"
      @close="onEditResourcesCloseTodo"
    >
      <template #dialog>
        <TodoList ref="todoList" :row="row" @close="onEditResourcesCloseTodo"></TodoList>
      </template>
    </common-dialog>
  </div>
</template>

<script>
import '@fullcalendar/core/vdom'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn' // 引入中文语言包
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import TodoList from '@/views/Framework/System/TodoList/index'
export default {
  components: {
    FullCalendar,
    CommonDialog,
    TodoList
  },
  props: {},
  data() {
    return {
      tableCode: 'calendarDrilldownList',
      reportParam: {},
      provideParams: {
        searchParams: {}
      },
      dialogConfig: {
        modal: true
      },
      dateTime: '',
      hasWarning: false,
      dialogWidth: '80%',
      dialogHeight: 720,
      visibleDrawerOther: false,
      visibleDrawerTodo: false,
      row: [],
      drawerTitle: '我的任务',
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: zhCnLocale, // 设置为中文
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        events: [],
        dayMaxEvents: 6, // 每天最多显示3个事件，超过则显示"+更多"
        dayCellDidMount: (arg) => {
          const warningDates = [
            {
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
            }
          ]
          const currentDate = arg.date.toISOString().split('T')[0]
          const warningInfo = warningDates.find((item) => item.date === currentDate)
          if (warningInfo && this.hasWarning) {
            const warningIcon = document.createElement('div')
            warningIcon.className = 'cell-warning-icon'
            warningIcon.onclick = (e) => {
              e.stopPropagation()
              this.visibleDrawerOther = true
            }
            arg.el.appendChild(warningIcon)
          }
        },
        // 确保事件可以被点击
        eventClick: (info) => {
          // 事件点击处理
          console.log('Event clicked:', info)
          if (info.event._def.extendedProps.type === 'task') {
            let pageType = ''
            if (info.event.extendedProps.isLeaf > 0) {
              pageType = 'view'
            }
            const stateInfo = {
              taskInfo: {
                taskId: info.event.id,
                thirdMenuParam: {
                  MANAGERSTATUS: info.event.extendedProps.managerStatus,
                  STATUS: info.event.extendedProps.status,
                  EXECUTESTATE: '1070',
                  TASKID: info.event.id,
                  currentRoute: '/MyTask/MyTask/latest',
                  createPage: 'decompose',
                  currentPage: 'normal',
                  pageType: pageType,
                  planInfoId: info.event.extendedProps.planInfoId
                }
              }
            }
            // 如果是从其他页面打开新窗口，将状态存储到 sessionStorage
            sessionStorage.setItem('stateInfo', JSON.stringify(stateInfo))
            // 修改为哈希路由方式打开新窗口
            const baseUrl = window.location.origin + window.location.pathname
            const targetUrl = `${baseUrl}#/MyTask/MyTask/latest`
            window.open(targetUrl, '_blank')
          } else {
            this.row = [{ ID: info.event.id }]
            this.visibleDrawerTodo = true
          }
        }
        // dateClick: this.handleDateClick
      }
    }
  },
  created() {
    const params = {
      sqlParam: {
        dates: {}
      },
      sqlId: '2b3f2b344eba03760830572e2d6b5932',
      reportId: '845d5812c0b54742a99b53c05e04acee',
      reportParam: {},
      router: '',
      code: '',
      permissionVo: {
        router: '',
        resourceId: ''
      },
      page: {
        current: 1,
        size: -1,
        orders: []
      }
    }
    this.$api['formGenerator.tableApply'](params).then((res) => {
      this.calendarOptions.events = res.records.map((item) => {
        if (item.IS_APPROACHING_DATE === '1') {
          this.hasWarning = true
        }
        return {
          title: item.TASK_NAME,
          start: item.PLAN_BEGIN_DATE,
          end: item.PLAN_END_DATE,
          id: item.TASK_ID,
          type: item.TYPE,
          hasWarning: item.IS_APPROACHING_DATE === '1',
          isLeaf: item.ISLEAF,
          planInfoId: item.PLANINFIID,
          managerStatus: item.MANAGERSTATUS,
          status: item.STATUS
        }
      })
      this.dateTime = new Date().getTime()
    })
  },
  methods: {
    handleDateClick(val) {
      this.reportParam = val.dateStr
      this.visibleDrawerOther = true
    },
    onEditResourcesCloseOther() {
      this.visibleDrawerOther = false
    },
    onEditResourcesCloseTodo() {
      this.visibleDrawerTodo = false
    }
  }
}
</script>

<style>
.calendarLayout {
  width: 100% !important;
  height: 100%;
  overflow: auto;
}
.fc-event-title,
.fc-event-title-container {
  cursor: pointer;
}
.fc .fc-daygrid-day-frame {
  height: 80px !important;
}
.repeating-event {
  background-color: #3788d8;
  color: white;
}
.custom-content {
  position: relative;
  left: 125px;
  top: 85px;
}
/* 确保这些样式没有被其他样式覆盖 */
.fc-more-link {
  cursor: pointer !important;
  color: #1890ff !important;
  background: none !important;
  border: none !important;
  padding: 2px 4px !important;
}

.fc-popover {
  z-index: 1000 !important; /* 确保弹出层在最上层 */
}

/* 弹出层样式 */
.fc-more-popover {
  position: absolute !important;
  background: #fff !important;
  border: 1px solid #ddd !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
}

.fc-popover-header {
  padding: 8px !important;
  background: #f5f7fa !important;
}

.fc-popover-body {
  padding: 8px !important;
  max-height: 200px !important;
  overflow-y: auto !important;
}

.fc-daygrid-day {
  position: relative !important;
}

.cell-warning-icon {
  position: absolute;
  right: 15px;
  bottom: 18px;
  width: 0;
  height: 0;
  transform: rotate(0deg);
  cursor: pointer;
  z-index: 1;
}
.cell-warning-icon::before {
  content: '⚠';
  display: inline-block;
  color: #ff4d4f;
}

.cell-warning-icon:hover {
  opacity: 0.8;
}

.warning-content {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
