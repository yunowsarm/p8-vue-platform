<template>
  <div class="income-container">
    <div class="income-box">
      <div class="title">项目总进度</div>
      <div class="amount"
           ref="amount">
        <div ref="amount-content">
          <span class="income">{{ finishRate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrjectProgress',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      finishRate: 0
    }
  },
  mounted () {
    let wholeDescribeId = ''
    if (this.row) {
      wholeDescribeId = this.row[0].WHOLE_ID
      this.$api['planInfoManager.selectProjectProgress']({ wholeDescribeId: wholeDescribeId }).then(res => {
        if (res) {
          this.finishRate = res[0].finishRate
        }
      })
    }

    // window.addEventListener('resize', this.fit)
  },
  updated () {
    // this.fit()
  },
  beforeDestroy () {
    // window.removeEventListener('resize', this.fit)
  },
  methods: {
    // fit () {
    //   const amount = this.$refs.amount
    //   const amountContent = this.$refs['amount-content']
    //   if (!amount || !amountContent) return
    //   amountContent.style.transform = "scale(1)"
    //   const scale = amount.offsetWidth / amountContent.scrollWidth
    //   amountContent.style.transform = `scale(${scale})`
    //   amountContent.style.transformOrigin = "center center"
    // }
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
        font-size: 70px;
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
