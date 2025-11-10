import { GanttObject, searchColumnRenderer, taskOverdueRemainingDaysArr, taskProgressFeedbackArr, taskStatusArr, taskWeatherControlArr } from '@/assets/commonJS/ganttJS/ganttObject'
import moment from 'moment'
import Datepicker from '@/assets/commonJS/originalComponents/datePicker'
import { Gantt } from 'p8-dhtmlx-gantt'
import Inputor from '@/assets/commonJS/originalComponents/input'
import Selector from '@/assets/commonJS/originalComponents/select'
import { calculateRemainingDays } from '@/utils/common'
import store from '@/plugins/store'
import { GanttObjectLocation } from '@/assets/commonJS/ganttJS/ganttObjectLocation'
import img from '@/assets/image/gantt/weidu.png'

/**
 * @Description 获取gantt对象，不存在则创建
 * @author fukai
 * @date 2020/5/22 12:00
 */
export function taskStatisticsGantt (ganttName, vueThis) {
  // 获取gantt对象
  const ganttObject = GanttObject.getGanttObject(ganttName)
  ganttObject.config.order_branch = false
  ganttObject.config.order_branch_free = false
  // 加载排程类型
  GanttObject.autoScheduleList(ganttObject)
  // 添加工具提示提示
  GanttObject.addTooltip(ganttObject, vueThis)
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  ganttObject.config.undo_steps = 25 // 撤销5步
  ganttObject.config.drag_links = false
  ganttObject.config.drag_timeline = false
  ganttObject.config.drag_move = false
  GanttObject.onCollapse(ganttObject, vueThis)
  // 查询监听及定义
  GanttObject.setSearchConfig(ganttObject, vueThis)
  // 表头查询值绑定
  Gantt.searchColumnsChange = function searchColumnsChange (name, value, searchType, eleInstance) {
    const customComp = ['select', 'date', 'input']
    if (customComp.indexOf(searchType) < 0) {
      document.getElementById(name + searchType).setAttribute('value', value)
    }
    if (searchType === 'select') {
      // 下拉选择
      if (eleInstance && eleInstance.multiple) {
        // 多选
        if (value && !(value instanceof Array)) {
          const arr = value.split(',')
          vueThis.searchForm[name] = arr
        } else {
          vueThis.searchForm[name] = value
        }
      } else {
        vueThis.searchForm[name] = value
      }
    } else if (searchType === 'date') {
      vueThis.searchForm[name] = value
    } else if (searchType === 'input') {
      vueThis.searchForm[name] = value
    }
    ganttObject.render()
  }
  Gantt.taskProgressDetails = function taskProgressDetails (taskId) {
    vueThis.showTaskProgressDialog(taskId)
  }
  ganttObject.attachEvent('onBeforeTaskDrag', function (id, mode, e) {
    return false // denies dragging if the global task index is odd
  })
  ganttObject.attachEvent('onLinkDblClick', function (id, item) {
    return false
  })

  // 网格行的背景颜色
  // ganttObject.templates.grid_row_class = function (start, end, task) {
  //   if (ganttObject.getGlobalTaskIndex(task.id) !== 0 || vueThis.createPage === 'userChange') {
  //     const managerStatus = task.managerStatus
  //     const status = task.status
  //     if (managerStatus !== '6405' && (status !== '6050' || status !== '6070')) {
  //       return 'updColor'
  //     }
  //   }
  // }
  /**
   * 添加工具提示
   * @param ganttObject
   */
  GanttObject.addTooltip = function (ganttObject, vueThis) {
    ganttObject.plugins({
      tooltip: true
    })
    ganttObject.attachEvent('onGanttReady', function () {
      const tooltips = ganttObject.ext.tooltips
      tooltips.tooltipFor({
        selector: '*',
        html: function (event, node) {
          // 判断节点是否包含 text_overflow 类名
          if (node && node.classList.contains('text_overflow')) {
            if (node.innerText) {
              // 检查文本是否溢出
              if (node.scrollWidth > node.offsetWidth) {
                return node.innerText // 返回溢出的文本
              }
            }
          }
          return '' // 如果没有文本溢出或节点无效，则不显示 Tooltip
        }
      })
    })
  }
  ganttObject.$resourcesStore = GanttObject.createDatastore(ganttObject)
  // 封装资源数据 名称[部门]-角色
  GanttObject.resourceStoreOnParse(ganttObject)
  // 工作时间设置
  // GanttObject.workTimeSetting(ganttObject, vueThis)
  // 监听任务选中
  ganttObject.attachEvent('onTaskMultiSelect', function (id, state, e) {
    if (state) {
      vueThis.selectedTasks.push(ganttObject.getTask(id))
    } else {
      const index = vueThis.selectedTasks.findIndex((item) => {
        return item.id === id
      })
      vueThis.selectedTasks.splice(index, 1)
    }
  })
  // 只读校验
  if (vueThis.readonly) {
    ganttObject.config.readonly = true
    ganttObject.config.readonlyReason = '当前为只读模式，不可操作'
  } else {
    // 查询监听及定义
    GanttObject.setSearchConfig(ganttObject, vueThis)
    GanttObject.planAfterRedo(ganttObject, vueThis)
    GanttObject.planAfterUndo(ganttObject, vueThis)
    // 自动调度监听
    GanttObject.planChangeCheck(ganttObject, vueThis)
    // 右键菜单
    GanttObject.createRightMenu(ganttObject, vueThis)
    // 多选任务不可拖动
    GanttObject.changeUnMoveTask(vueThis, ganttObject)
    // 任务状态处理
    // 列定义
    synchronizationColumns(vueThis, ganttObject)
    searchColumnsDataInit(vueThis, ganttObject)
    // synchronizationColumns(vueThis, ganttObject)
    // 监听资源选择后事件
    GanttObject.resourceOnAfterSelect(ganttObject)
    GanttObject.setGanttObject(ganttName, ganttObject)
  }
  return ganttObject
}

/**
 * 同步列
 * @param vueThis
 * @param ganttObject
 */
function synchronizationColumns (vueThis, ganttObject) {

  const initColumns = getGanttColumns(ganttObject, vueThis)
  initColumns.forEach((initItem, initIndex) => {
    const name = initItem.name
    let type = columnsTypeMap[name]
    let dataIndex
    // if (type) {
    const label = initItem.label
    if (name === 'owner_id') {
      dataIndex = 'userName'
    } else {
      dataIndex = name
    }
    const newLabel = searchColumnRenderer(dataIndex, label, type)
    initItem.label = newLabel
    // }
  })
  // 系统配置设置隐藏的列
  const hideColumns = vueThis.columnSettings.filter((item) => item.isEnable == '0')
  // 系统设置，拓展属性
  const extraColumns = vueThis.columnSettings.filter((item) => item.attributeType === '1')
  const hideColumnKeys = hideColumns.map((item) => item.filedName)
  const extraColumnKeys = extraColumns.map((item) => item.filedName)
  // 获取gantt列配置信息
  const ganttSetting = GanttObject.getGanttSettingGrid(vueThis.ganttName, vueThis.createPage)
  let lineHeight = ganttSetting && ganttSetting.value && ganttSetting.value.lineHeight ? ganttSetting.value.lineHeight : vueThis.$store.getters.baseConfig.tableRowHeight
  if (lineHeight) {
    ganttObject.config.row_height = lineHeight
  }
  // 存在配置信息时，同步，不存在时显示默认gantt列信息
  if (ganttSetting) {
    const settingColumns = ganttSetting.value.columns
    let tempColumns = []
    // 根据表头配置信息修改ganttObject对象中columns的显示隐藏属性及排序
    const settingExtra = {}
    settingColumns.forEach((settingItem, initIndex) => {
      if (extraColumnKeys.includes(settingItem.name)) {
        settingExtra[settingItem.name] = {
          index: initIndex,
          hide: settingItem.hide
        }
      }
      const initColumn = initColumns.filter((initItem) => initItem.name === settingItem.name)
      if (initColumn && Object.keys(initColumn).length > 0) {
        initColumn[0].hide = settingItem.hide
        let columnSetting = vueThis.columnSettings.filter((el) => el.filedName === initColumn[0].name && el.isEnable !== '0')
        if (columnSetting && columnSetting.length > 0) {
          tempColumns[initIndex] = initColumn[0]
        }
      }
    })

    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    initColumns.forEach((initItem, initIndex) => {
      const settingItem = settingColumns.filter((settingItem) => settingItem.name === initItem.name)
      if (!settingItem || Object.keys(settingItem).length === 0) {
        initItem.hide = false
        if (tempColumns && tempColumns.length > initIndex) {
          // console.log(initItem,'====initItem11');
          // tempColumns.push(initItem)
        } else {
          if (vueThis.columnSettings.filter((el) => el.filedName === initItem.name && el.isEnable !== '0')) {
            tempColumns.push(initItem)
          }
        }
      }
    })
    // 处理拓展字段
    extraColumns.forEach((item) => {
      let editType = null
      switch (item.filedType) {
        case 'text':
          editType = 'text'
          break
        case 'number':
          editType = 'number'
          break
        case 'textarea':
          editType = 'text'
          break
        case 'datepicker':
          editType = 'custom_date_editor'
          break
        case 'selectSingle':
          editType = 'select_can_clear'
          break
        case 'selectMultiple':
          editType = 'select_can_clear'
          break
        case 'treeSingle':
          editType = 'tree_data_editor_extra'
          break
        case 'treeMultiple':
          editType = 'tree_data_editor_extra'
          break
        default:
          break
      }
      if (settingExtra[item.filedName]) {
        let initItem = {}
        let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
        if (typeList.includes(item.filedType)) {
          initItem = {
            name: item.filedName,
            label: `<div class='gantt_search'>${item.name}</div><div class='gantt_search gantt_blank'></div>`,
            align: 'center',
            resize: true,
            hide: settingExtra[item.filedName].hide,
            min_width: 120,
            template: function (task) {
              let result = []
              if (task[item.filedName]) {
                let list = vueThis.extraMap[item.selectCode]
                if (list && list.length) {
                  let taskList = task[item.filedName] ? task[item.filedName].split(',') : []
                  list.forEach((el) => {
                    taskList.forEach((item) => {
                      if (el.value == item) {
                        result.push(el.label)
                      }
                    })
                  })
                }
              }
              return `<div class='text_overflow'>${result.join(',')}</div>`
            }
          }
        } else {
          initItem = {
            name: item.filedName,
            label: `<div class='gantt_search'>${item.name}</div><div class='gantt_search gantt_blank'></div>`,
            align: 'center',
            resize: true,
            hide: settingExtra[item.filedName].hide,
            min_width: 120,
            template: function (task) {
              return `<div class='text_overflow'>${task[item.filedName]}</div>`
            }
          }
        }
        tempColumns.splice(settingExtra[item.filedName].index, 1, initItem)
      } else {
        tempColumns.push({
          name: item.filedName,
          label: `<div class='gantt_search'>${item.name}</div><div class='gantt_search gantt_blank'></div>`,
          align: 'center',
          resize: true,
          hide: item.isEnable == '0',
          min_width: 120,
          template: function (task) {
            return `<div class='text_overflow'>${task[item.filedName]}</div>`
          }
        })
      }
    })

    tempColumns = tempColumns.filter((el) => el)

    ganttObject.config.columns = tempColumns
  } else if (vueThis.columnSettings.length > 0) {
    const tempColumns = []
    vueThis.columnSettings.forEach((item) => {
      const initColumn = initColumns.filter((initItem) => initItem.name === item.filedName)
      if (initColumn && initColumn.length > 0) {
        // initColumn[0].hide = !(item.isEnable == '1')
        // tempColumns.push({ ...initColumn[0], indexNo: item.indexNo })
        if (item.isEnable == '1') {
          tempColumns.push({ ...initColumn[0] })
        }
      }
      if (item.attributeType === '1') {
        let editType = null
        switch (item.filedType) {
          case 'text':
            editType = 'text'
            break
          case 'number':
            editType = 'number'
            break
          case 'textarea':
            editType = 'text'
            break
          case 'datepicker':
            editType = 'custom_date_editor'
            break
          case 'selectSingle':
            editType = 'select_can_clear'
            break
          case 'selectMultiple':
            editType = 'select_can_clear'
            break
          case 'treeSingle':
            editType = 'tree_data_editor_extra'
            break
          case 'treeMultiple':
            editType = 'tree_data_editor_extra'
            break
          default:
            break
        }
        if (item.isEnable == '1') {
          let typeList = ['selectSingle', 'selectMultiple', 'treeSingle', 'treeMultiple']
          if (typeList.includes(item.filedType)) {
            tempColumns.push({
              name: item.filedName,
              label: `<div class='gantt_search'>${item.name}</div><div class='gantt_search gantt_blank'></div>`,
              align: 'center',
              resize: true,
              hide: item.isEnable == '0',
              min_width: 120,

              template: function (task) {
                if (task.planInfoId) {
                  let result = []
                  if (task[item.filedName]) {
                    let list = vueThis.extraMap[item.selectCode]
                    if (list && list.length) {
                      let taskList = task[item.filedName] ? task[item.filedName].split(',') : []
                      list.forEach((el) => {
                        taskList.forEach((item) => {
                          if (el.value == item) {
                            result.push(el.label)
                          }
                        })
                      })
                    }
                  }
                  return `<div class='text_overflow'>${result.join(',')}</div>`
                } else {
                  return `<div class='text_overflow'></div>`
                }
              }
            })
          } else {
            tempColumns.push({
              name: item.filedName,
              label: `<div class='gantt_search'>${item.name}</div><div class='gantt_search gantt_blank'></div>`,
              align: 'center',
              resize: true,
              hide: item.isEnable == '0',
              min_width: 120,

              template: function (task) {
                if (task.planInfoId) {
                return `<div class='text_overflow'>${task[item.filedName]}</div>`
              } else {
                return `<div class='text_overflow'></div>`
              }
              }
            })
          }
        }
      }
    })
    // 当ganttObject对象中columns数据与配置信息中数据不一致（增加或减少）时，根据ganttObject对象中columns新增列下标插入tempColumns，超出时加在末尾
    // initColumns.forEach((initItem, initIndex) => {
    //   const settingItem = vueThis.columnSettings.filter((settingItem) => settingItem.filedName === initItem.name)
    //   if (!settingItem || Object.keys(settingItem).length === 0) {
    //     initItem.hide = false
    //     if (tempColumns && tempColumns.length > initIndex) {
    //       tempColumns.splice(initIndex, 0, initItem)
    //     } else {
    //       tempColumns.push(initItem)
    //     }
    //   }
    // })
    // 处理拓展字段的展示
    // extraColumns.forEach(item => {

    // })
    ganttObject.config.columns = tempColumns
  } else {
    ganttObject.config.columns = initColumns
  }
}
function getGanttColumns (ganttObject, vueThis) {
  ganttObject.serverList('yesOron', [
    { key: '1', label: '是' },
    { key: '0', label: '否' }
  ])

  ganttObject.serverList('secretGradeList', [
    { key: '9001', label: '公开' },
    { key: '9003', label: '内部' },
    { key: '9004', label: '普通商业秘密' },
    { key: '9005', label: '秘密' },
    { key: '9006', label: '核心商业秘密' },
    { key: '9007', label: '机密' }
  ])
  ganttObject.ext.inlineEditors.attachEvent('onBeforeEditStart', function (state) {
    // 点击列名
    const colName = state.columnName
    // 当前任务
    const task = ganttObject.getTask(state.id)
    // 责任令标识可编辑列
    const monitors = task.monitorPoints || ''
    // eslint-disable-next-line no-unused-vars
    const editorsColumns = [
      'setts',
      'completeForm',
      'machineName',
      'planTypeDic',
      'completeCriteria',
      'qualityRequirement',
      'completeNum',
      'combinationName',
      'responsibilityPlanStartTime',
      'responsibilityPlanEndTime',
      'breakDownProject',
      'keyNodePlan',
      'notes'
    ]
    // if (
    //   editorsColumns.indexOf(colName) !== -1 &&
    //   monitors.indexOf('1015') === -1
    // ) {
    //   return false
    // }
    // 月度计划标识可编辑列
    const editorsColumnsTwo = ['evaluation']
    if (editorsColumnsTwo.indexOf(colName) !== -1 && monitors.indexOf('1008') === -1) {
      return false
    }
    return true
  })
  // 加载工期格式化
  const formatter = GanttObject.formatter(ganttObject)
  // 加载前后置格式化
  const linksFormatter = GanttObject.linksFormatter(ganttObject, formatter)
  // 加载编辑器
  const editors = GanttObject.editors(ganttObject, formatter, linksFormatter)

  function checkEdit () {
    if (vueThis.pageName === 'planMonitor') {
      return false
    } else {
      return true
    }
  }

  return [
    {
      name: 'wbs',
      label: '大纲',
      align: 'left',
      template: function (task) {
        const code = ganttObject.getWBSCode(task)
        if (code.split('.').length > vueThis.deep) {
          vueThis.deep = code.split('.').length
        }
        return code
      },
      resize: true,
      min_width: 90
    },
    // {
    //   name: 'taskCode',
    //   label: '任务编号',
    //   align: 'left',
    //   resize: true,
    //   min_width: 90
    // },
    {
      name: 'achievements',
      label: '绩效',
      align: 'center',
      resize: true,
      min_width: 90
    },
    {
      name: 'proportion',
      label: '比例',
      align: 'center',
      resize: true,
      min_width: 70,
      template: function (task) {
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0 && task.proportion) {
          let parts = task.proportion.toString().split('.')
          var fraction = parts.length === 1 ? '' : parts[1]
          if (2 > fraction.length) {
            fraction += new Array(2 - fraction.length + 1).join('0')
          }
          return parts[0] + '.' + fraction + '%'
        }
        return ''
      }
    },
    {
      name: 'name',
      label: '任务名称',
      tree: true,
      align: 'left',
      resize: true,
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      min_width: 350,
      template: function (task) {
        let result = ''
        if (task.switchType === '9010' || task.switchType === '9020') {
          return task.name + suspendIcon
        }
        if (task.describes && task.describes !== '') {
          task.unDescribes = '1'
        }
        if (task.describes === '') {
          task.unDescribes = '0'
        }
        let state = GanttObject.validateAchievement(ganttObject, vueThis, task)
        // 注意：该逻辑修改时，需同时修改PmProjectTasksMapper.xml中sql片段checkForecastDateInfo逻辑
        let bool = false
        let tips = ''
        if ((task.forecastBeginDate && task.start_date) || (task.end_date && task.forecastEndDate)) {
          const beginStr = moment(task.start_date).format('YYYY-MM-DD')
          const forecastStartStr = task.forecastBeginDate
          const endStr = moment(ganttObject.date.add(task.end_date, -1, 'day')).format('YYYY-MM-DD')
          const forecastEndStr = task.forecastEndDate
          if (beginStr !== forecastStartStr) {
            // 叶子节点且计划完成时间和预测完成时间不一致
            bool = true
            tips += '当前任务计划开始时间和预计开始时间不一致，注意关注\n'
          }
          if (endStr !== forecastEndStr) {
            // 叶子节点且计划完成时间和预测完成时间不一致
            bool = true
            tips += '当前任务计划完成时间和预计完成时间不一致，注意关注\n'
          }
        }
        if (state.childTotal || state.childPercentage) {
          bool = true
          tips += '子任务存在绩效比例分配异常\n'
        }
        if (bool) result = result + `<i class='p8 icon-tishi' title='${tips}' style='color: #e6a23c; float: left'></i>`
        if (task.hasBusinessForm == 'true') {
          result = result + `<i class='el-icon-s-order' title='该任务包含业务表单' style='color: #f59000; float: left; position:relative; top:16px; font-size: 16px;'></i>`
        }
        if (task.unDescribes === '1') result = result + `<i class='p8 icon-tishi' title='存在任务描述' style='color: #0ab847; float: left'></i>`
        if (ganttObject.getGlobalTaskIndex(task.id) !== 0) {
          let taskStyles = vueThis.taskStyles[task.id] || ''
          if (taskStyles && taskStyles.indexOf('text-decoration: line-through;') !== -1 && taskStyles.indexOf('text-decoration:underline;') !== -1) {
            taskStyles += 'text-decoration: line-through underline;'
          }
          if (ganttObject.hasChild(task.id)) {
            result = result + '<div class="text_overflow" style="display: inline-block;' + (taskStyles || '') + 'font-weight:bold;">' + (task.name || '') + '</div>'
          } else {
            result = result + '<div class="text_overflow" style="display: inline-block;' + (taskStyles || '') + '">' + (task.name || '') + '</div>'
          }
        } else {
          if (ganttObject.hasChild(task.id)) {
            result = result + '<div class="text_overflow" style="display: inline-block;font-weight:bold;">' + (task.name || '') + '</div>'
          } else {
            result = task.name || ''
          }
        }
        return result
      }
    },
    {
      name: 'owner_id',
      label: '责任人',
      align: 'center',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      width: 80,
      resize: true,
      template: function (task) {
        return `<span data-column-name='owner_id' class='gantt_owner_id'>${task.realName || ''}</span>`
        // const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        // const owner = task[ganttObject.config.resource_property]
        // if (owner) {
        //   const userMessage = resourceDatas.getItem(owner)

        //   const userList = ganttObject.serverList('userList')
        //   let text = ''
        //   userList.forEach((item) => {
        //     if (userMessage && item.id === userMessage.userId && item.weatherOut === '1') {
        //       text += `<span style="color: #FF0000">(已退出)</span>`
        //     }
        //   })
        //   return `<span data-column-name="owner_id" class="gantt_owner_id">${(userMessage.name += text)}</span>`
        // } else {
        //   return `<span data-column-name="owner_id" class="gantt_owner_id"></span>`
        // }
      }
    },
    {
      name: 'roleName',
      label: '角色',
      align: 'center',
      resize: true,
      min_width: 120,
      template: function (task) {
        if (task.type !== 'task') return ''
        const resourceDatas = ganttObject.getDatastore(ganttObject.config.resource_store)
        const owner = task[ganttObject.config.resource_property]
        if (owner) {
          const userMessage = resourceDatas.getItem(owner)
          if (userMessage) {
            return userMessage.roleName
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    {
      name: 'dutyDeptName',
      label: '责任部门',
      align: 'center',
      resize: true,
      min_width: 120
    },
    {
      name: 'start_date',
      label: '计划开始时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if(task.type === 'project') return ''
        if (ganttObject.isTaskExists(task.parent) && ganttObject.getTask(task.parent).start_date > task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间早于父任务的计划开始时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.isTaskExists(task.parent) && ganttObject.date.add(ganttObject.getTask(task.parent).end_date, -1, 'day') < task.start_date) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间晚于父任务的计划完成时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间晚于父任务的计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (task.start_date > ganttObject.date.add(task.end_date, -1, 'day')) {
          if (ganttObject.hasChild(task.id)) {
            return '<span class="red-wave" title="计划开始时间晚于计划完成时间" style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          } else {
            return '<span class="red-wave" title="计划开始时间晚于计划完成时间">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span style="font-weight:bold;">' + GanttObject.dateToStr(task.start_date, null, ganttObject) + '</span>'
        } else {
          return task.start_date
        }
      }
    },
    {
      name: 'end_date',
      label: '计划完成时间',
      align: 'center',
      min_width: 130,
      resize: true,
      template: function (task) {
        if(task.type === 'project') return ''
        if (task.parent && ganttObject.isTaskExists(task.parent) && task.end_date && ganttObject.getTask(task.parent).end_date) {
          const pEndDate = ganttObject.getTask(task.parent).end_date
          const tEndDate = task.end_date
          if (pEndDate < tEndDate) {
            if (ganttObject.hasChild(task.id)) {
              return (
                '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" style="font-weight:bold;">' +
                GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) +
                '</span>'
              )
            } else {
              return '<span class="red-wave" title="计划完成时间大于父任务的计划完成时间" >' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
            }
          }
        }
        if (ganttObject.hasChild(task.id)) {
          return '<span style="font-weight:bold;">' + GanttObject.dateToStr(ganttObject.date.add(task.end_date, -1, 'day'), null, ganttObject) + '</span>'
        } else {
          return ganttObject.date.add(task.end_date, -1, 'day')
        }
      }
    },
    {
      name: 'duration',
      label: '工期',
      align: 'center',
      min_width: 70,
      resize: true,
      // editor: editors.duration,
      template: function (task) {
        if(task.type === 'project') return ''
        return formatter.format(task.duration)
      }
    },
    {
      name: 'autoScheduling',
      label: '排程',
      align: 'center',
      min_width: 70,
      resize: true,
      template: function (task) {
        if(task.type === 'project') return ''
        if (ganttObject.getGlobalTaskIndex(task.id) === 0 && vueThis.$route.name == 'Planning') {
          return '自动'
        } else {
          return task.autoScheduling === '1' ? '自动' : '手动'
        }
      }
    },
    {
      name: 'progress',
      label: '完成度',
      align: 'center',
      width: 60,
      resize: true,
      template: function (task) {
        if(task.type === 'project') return ''
        if (task.progress > 0) {
          return Math.round(task.progress * 100) + '%'
        }
        return 0
      }
    },
    {
      name: 'status',
      label: '进度',
      // align: 'center',
      width: 60,
      resize: true,
      template: function (task) {
        if (task.type !== 'task') return ''
        // 任务图标，排除根节点
        let html = ''
        if (!(ganttObject.getGlobalTaskIndex(task.id) === 0 && vueThis.createPage === 'compile')) {
          const status = task.status
          if (status && vueThis.taskStatus) {
            const taskStatusMap = vueThis.taskStatusMap
            if (taskStatusMap && Object.keys(taskStatusMap).length > 0) {
              const item = taskStatusMap[status]
              html = `<i class='gantt-tip p8 ${item.icon}' style='color: ${item.color};' title='${item.cmeaning}' task_status_disp='${item.id}' taskId='${task.id}'></i>`
            }
          }
        }
        return html
      }
    },
    {
      name: 'managerStatus',
      label: '状态',
      align: 'center',
      width: 80,
      resize: true,
      template: function (task) {
        // 任务图标，排除根节点
        if (task.type === 'task') {
          if (task.outputResult > 0) {
            return `<i class='el-icon-star-on' style='color: #4bcafe;font-size: 23px' title='有提交物的'></i>`
          }
          if (task.outputAsk > 0) {
            return `<i class='el-icon-star-on' style='color: #faa010;font-size: 23px' title='有输出要求的'></i>`
          }
          const managerStatus = task.managerStatus
          if (managerStatus && vueThis.managerStatusMap) {
            const item = vueThis.managerStatusMap[managerStatus]
            if (item) {
              return `<i class='${item.icon}' style='color: ${item.color}' title='${item.cmeaning}'></i>`
            }
          }
        }
        return ''
      }
    },
    {
      name: 'predecessors',
      label: '前后置',
      min_width: 100,
      resize: true,
      align: 'left',
      monitorLockLimit: true, // 标识锁定后不可操作的列声明
      template: function (task) {
        const links = task.$target
        const labels = []
        for (let i = 0; i < links.length; i++) {
          const link = ganttObject.getLink(links[i])
          labels.push(linksFormatter.format(link))
        }
        return labels.join(',')
      }
    },
    {
      name: 'monitorPoints',
      label: '标识',
      align: 'left',
      min_width: 100,
      resize: true,
      template: function (task) {
        // 标识展示
        const monitorPointDatas = ganttObject.serverList(ganttObject.config.monitor_point)
        const monitorPoints = task[ganttObject.config.monitor_point]
        let html = ''
        if (monitorPoints && monitorPointDatas) {
          monitorPoints.split(',').forEach(function (id) {
            monitorPointDatas.some((point, index) => {
              if (point.id === id && id !== '1022' && id !== '1030') {
                const icon = point.icon
                const controlTimeType = point.controlTimeType
                if (id === '1023') {
                  html += `<span style='cursor: pointer'><i class='p8 ${icon}' style='cursor:pointer;' title='${point.title}'></i></span>`
                } else {
                  if (controlTimeType && controlTimeType === '0') {
                    html +=
                      '<span onclick=Gantt.setControlTime(' +
                      point.id +
                      ",'" +
                      point.title +
                      "','" +
                      task.id +
                      '\')><i class="p8 ' +
                      icon +
                      '" style="cursor:pointer;" title="' +
                      point.title +
                      '"></i></span>'
                  } else {
                    html += '<i class="p8 ' + icon + '" title="' + point.title + '"></i>'
                  }
                }
                return true
              }
            })
          })
        }
        return html
      }
    },
    {
      name: 'planType',
      label: '任务类型',
      align: 'center',
      width: 70,
      resize: true,
      template: function (task) {
        // 任务类型展示
        let html = ''
        const taskClassifyDatas = ganttObject.serverList(ganttObject.config.plan_type)
        const planType = task[ganttObject.config.plan_type]
        if (planType && taskClassifyDatas) {
          taskClassifyDatas.some((point, index) => {
            if (point.id === planType) {
              const icon = point.icon
              html += `<i class='${icon}' style='cursor:pointer;color:${point.color};' title='${point.title} '></i>`
              return true
            }
          })
        }
        return html
      }
    },
    // {
    //   name: 'secretGrade',
    //   label: '密级' + canEditIcon,
    //   align: 'center',
    //   min_width: 130,
    //   resize: true,
    //   editor: editors.secretGrades,
    //   template: function (task) {
    //     const options = ganttObject.serverList('secretGradeList')
    //     const value = options.find((item) => {
    //       return item.key === task.secretGrade
    //     })
    //     return value ? value.label : ''
    //   }
    // },
    {
      name: 'weatherControl',
      label: '管控任务',
      align: 'center',
      resize: true,
      min_width: 70,
      template: function (task) {
        if(task.type === 'project') return ''
        const weatherControl = task.weatherControl
        if (weatherControl === '1') {
          return '是'
        } else {
          return '否'
        }
      }
    },
    {
      name: 'forecastBeginDate',
      label: '预计开始时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'forecastEndDate',
      label: '预计完成时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'realBeginDate',
      label: '实际开始时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'realEndDate',
      label: '实际完成时间',
      align: 'center',
      min_width: 100,
      resize: true
    },
    {
      name: 'overdueRemainingDays',
      label: '超期/剩余天数',
      align: 'center',
      min_width: 120,
      resize: true,
      template: function (task) {
        if(task.type === 'project') return ''
        const result = calculateRemainingDays(task)
        return result.text
      }
    },
    {
      name: 'progressFeedback',
      label: '进度反馈',
      align: 'center',
      min_width: 60,
      resize: true,
      template: function (task) {
        const reminderList = vueThis.reminderList
        const obj = reminderList.find((item) => {
          return item.id === task.id
        })
        let img = require('@/assets/image/gantt/weidu.png')
        if (obj && obj.id && Number(obj.reminder) > 0) {
          return `<span title='未读' onclick=Gantt.taskProgressDetails('${task.id}') style='cursor: pointer'>
            <img style='cursor: pointer;width: 17px; height: 17px' src='${img}' />
          </span>`
        } else if (obj && obj.id && obj.reminder == 0) {
          return `<span title='已读' onclick=Gantt.taskProgressDetails('${task.id}') class='p8 icon-read-mail' style='cursor: pointer;'></span>`
        } else {
          return ''
        }
      }
    },
    {
      name: 'createTime',
      label: '创建时间',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'createBy',
      label: '创建人',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'changeCount',
      label: '变更次数',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'updateTime',
      label: '更新时间',
      align: 'center',
      min_width: 120,
      resize: true
    },
    {
      name: 'updateBy',
      label: '更新人',
      align: 'center',
      min_width: 120,
      resize: true
    }
  ]
}
const columnsTypeMap = {
  status: 'select',
  progressFeedback: 'select',
  managerStatus: 'select',
  monitorPoints: 'select',
  planType: 'select',
  wbs: 'input',
  name: 'input',
  owner_id: 'input',
  roleName: 'input',
  dutyDeptName: 'input',
  taskProjectName: 'input',
  overdueRemainingDays: 'select',
  weatherControl: 'select',
  start_date: 'date',
  end_date: 'date'
}
function searchColumnsDataInit (vueThis, ganttObject) {
  return ganttObject.attachEvent('onDataRender', function () {
    const initColumns = getGanttColumns(ganttObject, vueThis)
    initColumns.forEach((initItem, initIndex) => {
      let name = initItem.name
      const type = columnsTypeMap[name]
      if (type) {
        let datas = []
        if (type === 'select') {
          switch (name) {
            case 'status':
              datas = taskStatusArr
              break
            case 'progressFeedback':
              datas = taskProgressFeedbackArr
              break
            case 'overdueRemainingDays':
              datas = taskOverdueRemainingDaysArr
              break
            case 'weatherControl':
              datas = taskWeatherControlArr
              break
            case 'managerStatus':
              if (vueThis.managerStatusMap && Object.keys(vueThis.managerStatusMap).length > 0) {
                for (const item in vueThis.managerStatusMap) {
                  const obj = {
                    id: item,
                    title: vueThis.managerStatusMap[item].cmeaning
                  }
                  datas.push(obj)
                }
              }
              break
            case 'monitorPoints':
              datas = ganttObject.serverList(ganttObject.config.monitor_point)
              break
            case 'planType':
              datas = ganttObject.serverList(ganttObject.config.plan_type)
              break
            // case 'secretGrade':
            //   datas = ganttObject.serverList('secretGrades')
            //   break
            case 'wbs':
              for (let i = 0; i < vueThis.deep; i++) {
                const item = {
                  id: i + 1 + '',
                  title: i + 1 + '级'
                }
                datas.push(item)
              }
          }
        } else if (type === 'date') {
          const datePickerKey = `gantt_datepicker_${name}`
          const children = document.getElementsByClassName(datePickerKey).length && document.getElementsByClassName(datePickerKey)[0].children
          if (vueThis[datePickerKey] && children && children.length) {
            // vueThis[datePickerKey]: 说明组件被创建
            // let childEle = (document.getElementsByClassName(datePickerKey)[0].children).length: 说明被创建的组件存在
            // 当vueThis[datePickerKey] 为true 但 childEle 为false 说明当前列被拖拽了, 拖拽结束,表头部分又被重写, 此时 自定义组件整体元素丢失
          } else {
            vueThis[datePickerKey] = new Datepicker(`.${datePickerKey}`, {
              range:true,
              customClassName: 'gantt_custom_datepicker', // 自定义类名 (可根据此类名手动更改组件的样式)
              value: vueThis.searchForm[name] || '',
              onChange: function ({ value }) {
                // change事件
                Gantt.searchColumnsChange(name, value, 'date')
              }
            })
          }
        } else if (type === 'input') {
          if (name === 'owner_id') {
            name = 'userName'
          }
          const inputKey = `gantt_inputor_${name}`
          const children = document.getElementsByClassName(inputKey).length && document.getElementsByClassName(inputKey)[0].children
          if (vueThis[inputKey] && children && children.length) {
            // vueThis[inputKey]: 说明组件被创建
            // let childEle = (document.getElementsByClassName(inputKey)[0].children).length: 说明被创建的组件存在
            // 当vueThis[inputKey] 为true 但 childEle 为false 说明当前列被拖拽了, 拖拽结束,表头部分又被重写, 此时 自定义组件整体元素丢失
          } else {
            vueThis[inputKey] = new Inputor(`.${inputKey}`, {
              value: vueThis.searchForm[name] || '',
              placeholder: '请输入',
              onChangeValue (value) {
                vueThis.searchForm[name] = value
              },
              onChange (value) {
                Gantt.searchColumnsChange(name, value, 'input')
              }
            })
          }
        } else {
          // 列resize后数据回填
          if (vueThis.searchForm && Object.keys(vueThis.searchForm).length) {
            const obj = document.getElementById(name + type)
            let result
            if (obj) {
              if (vueThis.searchForm[name] && vueThis.searchForm[name] instanceof Array) {
                result = vueThis.searchForm[name].join(',')
              } else if (vueThis.searchForm[name]) {
                result = vueThis.searchForm[name]
              } else {
                result = ''
              }
              obj.setAttribute('value', result)
            }
          }
        }
        if (datas && datas.length > 0) {
          const multiple = [] // 下拉选择多选定义, 如: 若存在多选, mutiple = ['wbs', 'planType']
          const options = datas.map((item) => {
            return {
              name: item.title,
              value: item.id
            }
          })
          const selectorKey = `gantt_selector_${name}`
          const children = document.getElementsByClassName(selectorKey).length && document.getElementsByClassName(selectorKey)[0].children
          if (vueThis[selectorKey] && children && children.length) {
            // vueThis[selectorKey]: 说明select被创建
            // let childEle = (document.getElementsByClassName(selectorKey)[0].children).length: 说明被创建的select存在
            // 当vueThis[selectorKey] 为true 但 childEle 为false 说明当前列被拖拽了, 拖拽结束,表头部分又被重写, 此时 自定义select整体元素丢失
          } else {
            // let
            if (document.getElementsByClassName(`${selectorKey}`) && !document.getElementsByClassName(`${selectorKey}`).length) {
              return
            }
            const obj = new Selector(`.${selectorKey}`, {
              customClassName: 'gantt_custom_select', // 自定义select类名 (可根据此类名手动更改select组件的样式)
              options: options, // select下拉列表(数组对象: [{name: '苹果', value: 'apple'}])
              props: {
                // 提供绑定字段(label-对应数组对象中的name, value对应数组对象的value)
                label: 'name',
                value: 'value'
              },
              multiple: multiple.includes(name), // 是否多选
              value: vueThis.searchForm[name] || vueThis.searchForm__WBS || '', // 绑定的值[array or string](multiple为true--value: ['yk', 'p8'] or value: 'yk,p8'; multiple为false--value: 'yk')
              placeholder: '请选择', // 默认提示文本
              onSelect: function (value) {
                // select change事件
                Gantt.searchColumnsChange(name, value, 'select', vueThis[selectorKey])
              }
            })
            vueThis[selectorKey] = obj
          }
        }
      }
    })
  })
}
