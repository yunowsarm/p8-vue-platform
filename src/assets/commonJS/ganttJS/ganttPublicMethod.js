import moment from 'moment';

// 更新任务日期的函数
export function updateTaskDate(modifyType, newVal, ganttObject, task) {
  // 参数验证
  if (!ganttObject || !task) {
    console.error('Invalid ganttObject or task');
    return false;
  }

  // 工具函数：格式化日期为 YYYY-MM-DD
  const formatDate = (date) => (moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : null);

  // 工具函数：根据开始时间和工期计算完成时间
  const calculateEndDate = (startDate, duration) => {
    if (!moment(startDate).isValid() || isNaN(duration)) return null;
    const rawEndDate = ganttObject.calculateEndDate({
      start_date: new Date(startDate),
      duration,
    });
    return moment(rawEndDate).subtract(1, 'days').toDate(); // 减去 1 天
  };

  switch (modifyType) {
    case 'start_date': {
      // 修改开始时间时，重新计算完成时间
      if (task.forecastBeginDate && !isNaN(task.duration)) {
        console.log(task.forecastBeginDate, '--修改前的开始时间');
        console.log(task.forecastEndDate, '--修改前的完成时间');

        const endDate = calculateEndDate(newVal, task.duration);
        if (!endDate) {
          console.error('Invalid start date or duration');
          break;
        }

        console.log(newVal, '--修改后的开始时间');
        console.log(formatDate(endDate), '--修改后的完成时间');

        task.forecastBeginDate = formatDate(newVal); // 更新开始时间
        task.forecastEndDate = formatDate(endDate);  // 更新完成时间
      } else {
        console.error('Invalid start_date or duration');
      }
      break;
    }

    case 'end_date': {
      // 修改完成时间时，重新计算工期
      if (task.forecastBeginDate && newVal) {
        const startDate = moment(task.forecastBeginDate);
        const endDate = moment(newVal);

        if (!startDate.isValid() || !endDate.isValid()) {
          console.error('Invalid startDate or endDate');
          break;
        }

        task.duration = endDate.diff(startDate, 'days'); // 计算工期（天数差）
        console.log(task.duration, '--修改后的工期');
      } else {
        console.error('Invalid startDate or endDate');
      }
      break;
    }

    case 'duration': {
      // 修改工期时，重新计算完成时间
      if (task.forecastBeginDate && !isNaN(newVal)) {
        const endDate = moment(task.forecastBeginDate).add(newVal, 'days').subtract(1, 'days'); // 减去一天;
        if (!endDate.isValid()) {
          console.error('Invalid startDate or duration');
          break;
        }

        // task.forecastEndDate = formatDate(endDate); // 更新完成时间
        task.forecastEndDate = '1995-01-27';
        console.log(task.forecastEndDate, '--修改后的完成时间');
      } else {
        console.error('Invalid startDate or duration');
      }
      break;
    }

    default: {
      console.error('Invalid modify type:', modifyType);
      break;
    }
  }

  return true; // 返回更新成功
}
