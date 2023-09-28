<template>
  <div class="inputdata-view">
    <div class="edit-outputdata-view">
      <span type="info">输入要求</span>
      <ul class="file-list">
        <li v-for="(item,index) in inputRequest"
            :key="item.attId"
            :class="{ 'not-last': index < inputRequest.length -1 }">
          <p>
            <span>{{item.descriptionStr}}</span>
          </p>
        </li>
      </ul>
    </div>
    <div class="edit-outputdata-view">
      <span type="info">前置输出物</span>
      <ul class="file-list">
        <li v-for="(item,index) in inputIoData"
            :key="item.attId"
            :class="{ 'not-last': index < inputIoData.length -1 }">
          <p class="">
            <span class="label">任务名称</span>
            <span>{{item.aorName}}</span>
          </p>
          <p>
            <span class="label">计划开始时间</span>
            <span>{{item.planBeginDate}}</span>
          </p>
          <p>
            <span class="label">计划完成时间</span>
            <span>{{item.planEndDate}}</span>
          </p>
          <p>
            <span class="label">排程类型</span>
            <span>{{item.autoSchedulingDisplay}}</span>
          </p>
          <p>
            <span class="label">工期</span>
            <span>{{item.duration}}</span>
          </p>
        </li>
      </ul>
    </div>

  </div>
</template>
<script>
import { Tag, Link } from 'p8-components-ui'
export default {
  name: 'InputIo',
  inject: ['getPlanInfo'],
  components: {
    'el-tag': Tag,
    'el-link': Link
  },
  props: {
    inputIoData: {
      type: Array
    },
    inputRequest: {
      type: Array
    }
  },
  data () {
    return {
      secretGrade: ''
    }
  },
  mounted () {
    this.secretGrade = this.getPlanInfo().secretGradeDisplay
  },
  methods: {
    downloadOutputRequsetFile (item) {
      if (item.attId) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.attId }, { responseType: 'blob' }).then(backJson => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = item.attFileName
          document.body.appendChild(link)

          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }).finally(() => {
          // this.search.exportLoading = false
        })
      }
    },
    confidentialiteLabel (item) {
      let conList = this.$store.state.user.confidentialiteList
      if (conList && conList.length) {
        let filterCon = conList.filter(con => con.value === item.attConfidentialite)
        if (filterCon.length) {
          return filterCon[0].label
        }
      }
      return ''
    }
  }
}
</script>
<style lang="scss" scoped>
.inputdata-view {
  position: relative;
  min-height: 40px;
  padding: 22px 0px 10px 10px;
  box-sizing: border-box;
  .edit-outputdata-view,
  .input-view {
    position: relative;
    min-height: 50px;
    margin-left: 0;
    padding: 0 10px;
  }
  .title {
    position: absolute;
    left: 0px;
    width: 100px;
    text-align: center;
  }
  .file-list {
    li {
      box-sizing: border-box;
      padding: 0 10px;
      &.not-last {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
      p {
        margin: 10px 0 12px;
        padding: 0;
        display: flex;
        align-items: center;
        background-color: #f5f8fb;
        height: 30px;
        margin-left: 35px;
        span.label {
          flex-basis: 14%;
          font-weight: bolder;
        }
        span.filename {
          flex: 1;
          display: flex;
          align-items: flex-start;
          a {
            flex-basis: 70%;
            justify-content: flex-start;
          }
        }
      }
    }
  }
}
.edit-outputdata-view > span {
  font-weight: bold;
}
</style>
