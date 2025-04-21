<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <P8TableRender v-bind="$attrs"
                  @slotDone="slotDone"
                 v-on="$listeners" >
    <template :slot="item"
              v-for="item in slotList"
              slot-scope="{ scope }">
      <slot :name="item"
            :scope="scope" />
    </template>
  </P8TableRender>
</template>

<script>
export default {
  name: 'TableRender',
  data () {
    return {
      slotList: []
    }
  },
  methods: {
    slotDone(slot) {
      this.slotList = slot
    }
  }
}
</script>
