<template>
  <div>
    <div class="tips">
      <div style="display: flex;align-items: center;">
        <div class="vertical_line"></div>
        菜单栏背景图
      </div>
      <div>
        <el-button type="text"
                   @click="addImage()">上传背景图片</el-button>
        <el-button type="text"
                   @click="cloneBack('')">取消背景</el-button>
      </div>
    </div>
    <div class="select-theme">
      <div v-for="(item, index) in uploadFileJson"
           :key="index">
        <el-image style="width: 100px; height: 180px; margin-left: 10px"
                  :src="item.filePath"
                  fit="cover"
                  @click="changeSystemImage(item)"></el-image>
      </div>
    </div>
    <form-index v-if="isDesign"
                :visible="isDesign"
                @handleCancel="handleCancel"
                ref="formIndex"></form-index>
  </div>
</template>
<script>
// import { mapGetters } from 'vuex'
import formIndex from './formIndex.vue'
export default {
  name: 'BackgroundImage',
  data () {
    return {
      imageData: [
        {
          filePath: './static/themeBackground/image.png'
        },
        {
          filePath: './static/themeBackground/image2.png'
        },
        {
          filePath: './static/themeBackground/image3.png'
        },
        {
          filePath: './static/themeBackground/image4.png'
        },
        {
          filePath: './static/themeBackground/image5.png'
        },
        {
          filePath: './static/themeBackground/image6.png'
        },
        {
          filePath: './static/themeBackground/image7.png'
        },
        {
          filePath: './static/themeBackground/image8.png'
        },
        {
          filePath: './static/themeBackground/image9.png'
        },
        {
          filePath: './static/themeBackground/image10.png'
        }
      ],
      uploadFileJson: [],
      isDesign: false
    }
  },
  beforeMount () { },
  mounted () {
    this.getSettingData()
  },
  computed: {
    // ...mapGetters(['image'])
  },
  methods: {
    async getSettingData () {
      const that = this
      let res = await that.$api['SystemSettings.loadMenuBgImages']()
      if (res) {
        that.getFileUrl(res) // 获取图片流
      }
    },
    // 获取图片流
    getFileUrl (uploadFileJson) {
      const that = this
      that.uploadFileJson = []
      uploadFileJson.map(async (item) => {
        if (item.id) {
          await that.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
            item.filePath = window.URL.createObjectURL(new Blob([res.data]))
            that.uploadFileJson.push(item);
          })
        }
      })
      that.uploadFileJson = [...this.imageData, ...that.uploadFileJson]
    },
    addImage () {
      this.isDesign = true
    },
    handleCancel () {
      setTimeout(() => {
        this.isDesign = false
        this.getSettingData()
      }, 500)
    },
    changeSystemImage (item) {
      // if (item.id) {
      //   this.$store.dispatch('setImage', JSON.stringify(item.))
      //   this.$emit('changeSystemImage', JSON.stringify(item))
      // } else {
      let url = item.id ? item.id : item.filePath
      this.$store.dispatch('setImage', url)
      // this.$store.dispatch('setImageId', url)
      this.$emit('changeSystemImage', url)
      // }
    },
    cloneBack (imageUrl) {
      this.$store.dispatch('setImage', imageUrl)
    }
  },
  components: {
    formIndex
  }
}
</script>
<style lang="scss" scoped>
.tips {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin: 8px 8px 8px 26px;
  justify-content: space-between;
}
.vertical_line {
  margin-right: 8px;
  width: 3px;
  height: 16px;
  background: $theme-color;
}
.select-theme {
  margin-left: 40px;
  display: flex;
  width: calc(100% - 50px);
  overflow: auto;
  h4 {
    padding: 10px 0;
    border-bottom: 2px solid $base-light-color;
    box-sizing: border-box;
  }

  span {
    width: 100%;
    padding: 10px;
    display: inline-block;
    border-top: 1px solid $base-light-color;
    color: $base-gray-color;
    box-sizing: border-box;
  }

  ul {
    flex: 1;
    display: flex;

    li {
      width: 50px;
      height: 50px;
      margin: 10px;
      border-radius: 8px;
      display: inherit;
      justify-content: center;
      align-items: center;
      color: #fff;
      transition: all 0.2s ease-in-out 0s;
      cursor: pointer;

      &.active {
        box-shadow: 0 0 15px -1px rgba(0, 0, 0, 0.1), 0 0 15px 3px rgba(0, 0, 0, 0.08);
      }

      &:hover {
        box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.1), 0 8px 15px 3px rgba(0, 0, 0, 0.09), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
      }
    }
  }
}
</style>
