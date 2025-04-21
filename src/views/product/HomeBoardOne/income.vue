<template>
  <div class="income-container">
    <div class="income-box">
      <div class="title">本年已收/应收</div>
      <div class="amount">
        <span class="income">{{ formatNumber(income) }}</span>
        <span class="separator">/</span>
        <span class="expense">{{ formatNumber(expense) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Income',
  data() {
    return {
      income: 153876.00,
      expense: 353876.00
    }
  },
  methods: {
    formatNumber(num) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.income-container {
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  // 添加禁用选中效果的样式
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  .income-box {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;

    .title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .amount {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 28px;
      font-weight: bold;

      .income {
        color: #67C23A;
      }

      .separator {
        color: #909399;
      }

      .expense {
        color: #F56C6C;
      }
    }
  }
}
</style>
