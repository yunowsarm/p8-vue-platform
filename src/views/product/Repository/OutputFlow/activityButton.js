export const activityButtonData = [
    {
      id: 'create-children',
      icon: 'p8 icon-new-subordinate',
      title: '新建子活动',
      clickFun: function (tasks) {
      },
      isDisableFun: function (tasks) {
      }
    },
    {
      id: 'fuzhi',
      icon: 'p8 icon-new-subordinate',
      title: '复制',
      clickFun: function (tasks, _this) {
        let taskId = tasks.map(el => el.id)
        _this.copyList = taskId
      },
      isDisableFun: function (tasks) {
      }
    },
    {
      id: 'zhantie',
      icon: 'p8 icon-new-subordinate',
      title: '粘贴',
      clickFun: function (tasks, _this) {
        _this.$api['OutputFlow.pasteNode']({"copyIds": _this.copyList,"selectId": tasks[0].id}).then(res => {
          _this.copyList = []
          _this.initGantt(_this.activityInfoId)
        })
      },
      isDisableFun: function (tasks) {
      }
    },
  ]