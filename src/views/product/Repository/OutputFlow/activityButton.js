export const activityButtonData = [
  {
    id: 'create-children',
    icon: 'p8 icon-new-subordinate',
    title: '新建子活动',
    clickFun: function (tasks, _this) {
      _this.addTask(1, 'Child')
    },
    isDisableFun: function (tasks) {
      return isDisableFunCheck(tasks)
    }
  },
  {
    id: 'create-After',
    icon: 'p8 icon-new-sibling',
    title: '新建同级活动',
    clickFun: function (tasks, _this) {
      _this.addTask(1, 'After')
    },
    isDisableFun: function (tasks, _this, myGantt) {
      let result = false
      result = isDisableFunCheck(tasks)
      tasks.forEach(el => {
        if (el.parent == 0) {
          result = true
        }
      })
      return result
    }
  },
  {
    id: 'fuzhi',
    icon: 'p8 icon-copy',
    title: '复制',
    clickFun: function (tasks, _this) {
      let taskId = tasks.map(el => el.id)
      _this.copyList = taskId
    },
    isDisableFun: function (tasks) {
      let result = false
      result = isDisableFunCheck(tasks)
      tasks.forEach(el => {
        if (el.parent == 0) {
          result = true
        }
      })
      return result
    }
  },
  {
    id: 'zhantie',
    icon: 'p8 icon-paste',
    title: '粘贴',
    clickFun: function (tasks, _this) {
      _this.$api['OutputFlow.pasteNode']({ "copyIds": _this.copyList, "selectId": tasks[0].id }).then(res => {
        _this.copyList = []
        _this.loadGanttData()
      })
    },
    isDisableFun: function (tasks, _this) {
      let result = true
      if (_this.copyList && _this.copyList.length && tasks.length && tasks.length == 1) {
        result = false
      }
      return result
    }
  },
  {
    id: 'create-children1',
    icon: 'p8 icon-upgrade',
    title: '升级',
    clickFun: function (tasks, _this) {
      _this.outdent()
    },
    isDisableFun: function (tasks) {
      let result = false
      result = isDisableFunCheck(tasks)
      tasks.forEach(el => {
        if (el.parent == 0 || el.$level == 1) {
          result = true
        }
      })
      return result
    }
  },
  {
    id: 'create-children2',
    icon: 'p8 icon-downgrade',
    title: '降级',
    clickFun: function (tasks, _this) {
      _this.indent()
    },
    isDisableFun: function (tasks, _this, myGantt) {
      let result = false
      result = isDisableFunCheck(tasks)
      tasks.forEach(el => {
        if (el.parent == 0) {
          result = true
        }
        if(myGantt.getPrevSibling(el.id)) {
          if(el.predIds == myGantt.getPrevSibling(el.id)) {
            result = true
          }
        }
      })
      return result
    }
  },
  {
    id: 'create-children3',
    icon: 'p8 icon-delete',
    title: '删除',
    clickFun: function (tasks, _this) {
      _this.removeTask()
    },
    isDisableFun: function (tasks) {
      let result = false
      result = isDisableFunCheck(tasks)
      tasks.forEach(el => {
        if (el.parent == 0) {
          result = true
        }
      })
      if (tasks.length && tasks.length !== 1) {
        result = true
      }
      return result
    }
  },
  // {
  //   id: 'create-children4',
  //   icon: 'p8 icon-new-subordinate',
  //   title: '设计类活动',
  //   clickFun: function (tasks, _this) {
  //   },
  //   isDisableFun: function (tasks) {
  //     return isDisableFunCheck(tasks)
  //   }
  // },
  // {
  //   id: 'create-children5',
  //   icon: 'p8 icon-new-subordinate',
  //   title: '生产类活动',
  //   clickFun: function (tasks, _this) {
  //   },
  //   isDisableFun: function (tasks) {
  //     return isDisableFunCheck(tasks)
  //   }
  // },
  // {
  //   id: 'create-children6',
  //   icon: 'p8 icon-new-subordinate',
  //   title: '评审类活动',
  //   clickFun: function (tasks, _this) {
  //   },
  //   isDisableFun: function (tasks) {
  //     return isDisableFunCheck(tasks)
  //   }
  // },
  // {
  //   id: 'create-children7',
  //   icon: 'p8 icon-new-subordinate',
  //   title: '飞行试验类',
  //   clickFun: function (tasks, _this) {
  //   },
  //   isDisableFun: function (tasks) {
  //     return isDisableFunCheck(tasks)
  //   }
  // },
  {
    id: 'create-children8',
    icon: 'p8 icon-cancel-task-type',
    title: '取消活动标识',
    clickFun: function (tasks, _this, myGantt) {
      if (tasks && tasks.length) {
        myGantt.batchUpdate(function () {
          tasks.forEach(el => {
            let task = myGantt.getTask(el.id)
            if (task) {
              task.type = ''
              myGantt.updateTask(el.id)
            }
          })
        })
      }
    },
    isDisableFun: function (tasks) {
      let result = false
      result = isDisableFunCheck(tasks)
      tasks.forEach(el => {
        if (!el.type) {
          result = true
        }
      })
      return result
    }
  },
  {
    id: 'create-children9',
    icon: 'p8 icon-excel-import',
    title: 'Excel导入',
    clickFun: function (tasks, _this) {
      _this.importTask()
    },
    isDisableFun: function (tasks) {
      let result = false
      if (tasks && tasks.length == 1) {
        result = false
      } else {
        result = true
      }
      return result
    }
  },
  {
    id: 'create-children11',
    icon: 'p8 icon-excel-export',
    title: 'Excel导出',
    clickFun: function (tasks, _this) {
      _this.exportTask()
    },
    isDisableFun: function (tasks) {
    }
  },
  // {
  //   id: 'create-children12',
  //   icon: 'p8 icon-full-screen',
  //   title: '全屏编辑',
  //   clickFun: function (tasks, _this) {
  //   },
  //   isDisableFun: function (tasks) {
  //   }
  // },
]

function isDisableFunCheck (tasks) {
  let result = false
  if (tasks && tasks.length) {

  } else {
    result = true
  }
  return result
}