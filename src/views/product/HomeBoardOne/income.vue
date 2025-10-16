<template>
  <div class="income-container">
    <div class="income-box">
      <div class="title">本年已收/应收</div>
      <div class="amount"
           ref="amount">
        <div ref="amount-content">
          <span class="income">{{ formatNumber(income) }}</span>
          <span class="separator">/</span>
          <span class="expense">{{ formatNumber(expense) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Income',
  data () {
    return {
      income: 153876.00,
      expense: 353876.00
    }
  },
  created () {
    this.$api['relevanceContract.contractRecievedByYear']({
      wholeDescribeId: ""
    }).then(res => {
      if (res.length > 0) {
        this.income = res[0].current_year_received
        this.expense = res[0].current_year_receivable
      }
    })
    window.addEventListener('resize', this.fit)
  },
  updated () {
    this.fit()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.fit)
  },
  methods: {
    fit () {
      const amount = this.$refs.amount
      const amountContent = this.$refs['amount-content']
      if (!amount || !amountContent) return
      amountContent.style.transform = "scale(1)"
      const scale = amount.offsetWidth / amountContent.scrollWidth
      amountContent.style.transform = `scale(${scale})`
      amountContent.style.transformOrigin = "center center"
    },
    formatNumber (num) {
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
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      //gap: 8px;
      font-weight: bold;

      .income {
        text-align: end;
        width: 48%;
        color: #67c23a;
      }

      .separator {
        width: 4%;
        color: #909399;
      }

      .expense {
        text-align: start;
        width: 48%;
        color: #f56c6c;
      }
    }
  }
}
</style>
