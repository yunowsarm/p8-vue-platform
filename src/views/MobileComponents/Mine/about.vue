<script>
import { mapGetters } from 'vuex'
import packageJson from '../../../../package.json'
export default {
  name: 'about',
  data(){
    return {
      packageJson,
      regardsObj: {},
    }
  },
  computed: {
    ...mapGetters(['systemName', 'authorizationInfo']),
  },
  mounted() {
    this.getSystemAbout()
  },
  methods:{
    getSystemAbout () {
      this.$api['projectTeamSetting.getSystemAbout']().then(res => {
        if (res) {
          this.regardsObj = res
        }
      })
    },
  }
}
</script>

<template>
  <div class="regards-box">
    <div style="display: flex">
      <div class="regards-font">系统名称:</div>
      <div v-html="systemName"></div>
    </div>
    <div style="display: flex">
      <div class="regards-font">系统版本:</div>
      <el-popover placement="top-start" width="230" trigger="hover">
        <p>
          p8-framework-suit@{{ regardsObj.p8Version }}<br />
          p8-lowcode@^{{ packageJson.dependencies['p8-lowcode'] }}<br />
          p8-components-ui@{{ packageJson.dependencies['p8-components-ui'] }}<br />
          p8-dhtmlx-gantt@{{ packageJson.dependencies['p8-dhtmlx-gantt'] }}<br />
          p8-vue-smart-widget@{{ packageJson.dependencies['p8-vue-smart-widget'] }}<br />
          p8-gojs@{{ packageJson.dependencies['p8-gojs'] }}<br />
        </p>
        <div slot="reference">{{ regardsObj.systemVersion }}</div>
      </el-popover>
    </div>
    <!--        <p><span class="regards-font">官网地址:&nbsp;&nbsp;&nbsp;</span><el-button type="text"-->
    <!--                     style="font-size: 15px;"-->
    <!--                     @click="openRZ">www.xardmu.com</el-button></p>-->
    <p>
      <span class="regards-font">授权终止日期:&nbsp;&nbsp;&nbsp;</span><span>{{ regardsObj.authorizedExpires }}</span>
    </p>
    <div style="display: flex">
      <div class="regards-font">特征码:</div>
      <div>{{ regardsObj.cpuSerialCode }}</div>
    </div>
    <p v-for="(el, index) in authorizationInfo" :key="index" style='display: flex'>
      <span class="regards-font">{{ el.name }}&nbsp;&nbsp;</span><span>{{ el.message }}</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
.regards-box {
  text-align: start;
  padding: 20px;
  line-height: 25px;
}
.regards-font {
  font-weight: bold;
  width: 25%;
}
</style>
