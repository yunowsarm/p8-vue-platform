<template>
  <div>
    <span class="show-type">抄表月度：{{ this.searchMounth }}</span>
    <P8TableRender ref="tableRender"
                   class="planLayout"
                   :code="tableCode"
                   :reportParam="reportParams"
                   :west-tree-param="provideParams.searchParams"
									 @refresh-data="refreshData"
    >
    </P8TableRender>
  </div>
</template>

<script>
export default {
  name: 'demandChart',
  props: {
    drillParam: {
      type: Object
    }
  },
  data () {
    return {
      tableCode: 'tyncbhz',
			reportParams:{
				MONTHFORMAT: ''
			},
      provideParams: {
  
      },
			searchMounth: '',
    }
  },
  components: {
  },
  computed: {},
  beforeMount () { },
  mounted () {
		// const now = new Date()
		// this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0') }`
    this.reportParams.MONTHFORMAT = this.searchMounth
		console.log('当前月:', this.searchMounth)
  },
  destroyed () {

  },
  methods: {
    refreshData(){
      console.log(this.$refs.tableRender.$refs.search.formField,'88888')

			if(this.$refs.tableRender.$refs.search.formField.MONTHFORMAT == '') {
				const now = new Date()
				this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0') }`
				// this.reportParams.MONTHFORMAT = this.searchMounth
				// console.log('当前月:', this.reportParams.MONTHFORMAT)
			} else {
				this.searchMounth = this.$refs.tableRender.$refs.search.formField.MONTHFORMAT
				// this.reportParams.MONTHFORMAT = this.searchMounth
			}
			
			console.log('刷新数据:', this.reportParams)
    },
  },
  watch: {

  }
}

</script>
<style lang='scss' scoped>
.show-type {
  position: absolute;
  top: 20px;
  z-index: 1;
  left: 20px;
}
</style>