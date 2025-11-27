<template>
  <P8TableRender ref="tableRender"
                 :pagination="false"
                 code="projectRelevanceContract">
  </P8TableRender>
</template>

<script>
export default {
  name: 'paymentContract',
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {

    }
  },
  mounted () {
    setTimeout(() => {
      console.log(this.$refs.tableRender, '4444444444收款44444444444');
      this.$api['relevanceContract.selectAllCgtableProjectByProjectId']({
        projectId: this.row[0].WHOLE_ID
      }).then(res => {
        let aaa = {
          "ID": "011d8667bba04d1fa6fd",
          "CREATE_BY": "SYS_USER0100",
          "ITEM_CREATE_TIME": "2025-09-25 16:44:06",
          "UPDATE_BY": null,
          "ITEM_UPDATE_TIME": null,
          "SECRET_LEVEL": null,
          "INDEX_NO": null,
          "DATA_ID": "20250925005",
          "TENANT_ID": null,
          "IS_DELETED": "0",
          "DATA_VERSION": 0,
          "AMOUNT_PROGESS": "94.44%",
          "PROJECT_PROGESS": "100%",
          "CONTRACT_NO": null,
          "CONTRACT_NAME": "付款第二阶段",
          "CONTRACT_TYPE": null,
          "TOTAL_AMOUNT": 200000,
          "CURRENCY": null,
          "SIGN_DATE": null,
          "STATUS": null,
          "PARTY_A_ID": null,
          "PARTY_B_ID": null,
          "PARTY_C_ID": null,
          "MODEL_INFORMATION_ID": null,
          "REMARK": null,
          "MODEL_NAME": null,
          "STAGE_NAME": "付款第二阶段",
          "DELIVERY_DATE": "2025-09-25",
          "AMOUNT": 200000,
          "PROPORTION": 40,
          "RECEIVED_AMOUNT": null,
          "UNRECIVERD_AMOUNT": null,
          "PAID_AMOUNT": 188888,
          "UNPAID_AMOUNT": 11112,
          "CONTRACT_ID": "1817e319601a46beb9d6",
          "C_MEANING": null,
          "CONTRACT_TYPE_NAME": "付款合同",
          "STATUS_NAME": null,
          "PARTY_A_NAME": null,
          "PARTY_B_NAME": null,
          "PARTY_C_NAME": null,
          "RECIEVE_PAY_STATUS": "payType002",
          "RECIEVE_PAY_STATUS_NAME": "已付款",
          "ROW_NUM": 92,
          "PROJECT_PROGESS_AMOUNT": 1.00
        }
        this.$refs.tableRender?.$refs.xTable?.$refs.table.setCheckboxRow(aaa, true)
        console.log(this.$refs.tableRender?.$refs.xTable.tableData, '444444444444444444444');

        res.forEach(item => {
          this.$refs.tableRender?.$refs.xTable.tableData.forEach(el => {
            // if (item.ID === el.ID) {
            console.log('ccccccccccccccccccccc');

            // }
          })
        })

      })
    }, 2000)

  },
  methods: {}
}
</script>

<style>
</style>