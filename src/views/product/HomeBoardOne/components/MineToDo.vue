<script>
export default {
  name: 'MineToDo',
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  data(){
    return {
      status: ['c4220317637d2cdf16d0777bf75b70aa', 'd94ad25e38f3dd21200f50b204325691','73b011976dfd66d5fcd68bc242cb0c13'],
      provideParams: {
        searchParams:{
          status:null
        }
      },
    }
  },
  created() {
    this.provideParams.searchParams.status = this.status
  },
  methods:{

  }
}
</script>

<template>
  <P8TableRender ref="tableRender" code="myReceivedByKanban" :west-tree-param="provideParams.searchParams"></P8TableRender>
</template>

<style scoped lang="scss"></style>
