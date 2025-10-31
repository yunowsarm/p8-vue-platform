<template>
  <div class="versiondata-view">
    <ul class="file-list">
      <li v-for="(item,index) in versionData"
          :key="item.attId"
          :class="{ 'not-last': index < versionData.length -1 }">
        <p>特别说明&nbsp;&nbsp;&nbsp;&nbsp; <span class="filename"></span>{{item.aoDescribes}}</p>
        <p>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;文件&nbsp;&nbsp;&nbsp;&nbsp;
          <span class="filename"
                @click="downloadOutputRequsetFile(item)">{{item.attFileName}}</span>
          <!-- <span style="margin-left: 160px;">
            密级 &nbsp;&nbsp;&nbsp;&nbsp;<span class="filename">{{item.attConfidentialiteDisplay}}</span>
          </span> -->
        </p>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'Version',
  inject: ['getPlanInfo'],
  components: {

  },
  props: {
    versionData: {
      type: Array
    }
  },
  data () {
    return {

    }
  },
  mounted () {

  },
  methods: {
    downloadOutputRequsetFile (item) {
      if (item.attId) {
        this.$download(item.attId, item.attFilePath)
      }
    }
  }
}
</script>
<style lang="scss">
.versiondata-view {
  position: relative;
  min-height: 40px;
  padding: 6px 0 6px 25px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  line-height: 45px;
  .title {
    position: absolute;
    left: 0px;
    width: 100px;
    text-align: center;
  }
  .file-list {
    margin-top: -6px;
    li {
      box-sizing: border-box;
      list-style: decimal;
      padding: 0 10px;
      margin-left: 20px;
      &.not-last {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
      p {
        margin: 8px 0;
        padding: 0;
        background: #f5f8fb;
      }
      p span.filename {
        cursor: pointer;
      }
    }
  }
}
</style>
