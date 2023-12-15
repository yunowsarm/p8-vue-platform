<template>
  <div>
    <div class="tips">
      <div class="vertical_line"></div>
      菜单栏背景图
    </div>
    <div class="select-theme">
      <div v-for="(item, index) in imageName"
           :key="index">
        <el-image style="width: 100px; height: 180px; margin-left: 10px"
                  :src="item.url"
                  fit="cover"
                  @click="changeSystemImage(item.url)"></el-image>
      </div>
      <el-button style="position: absolute; right: 10px"
                 type="text"
                 @click="cloneBack('')">取消背景</el-button>
    </div>
  </div>
</template>
<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'BackgroundImage',
  data () {
    return {
      imageName: [
        {
          url: './static/themeBackground/image.png'
        },
        {
          url: './static/themeBackground/image2.png'
        },
        {
          url: './static/themeBackground/image3.png'
        },
        {
          url: './static/themeBackground/image4.png'
        },
        {
          url: './static/themeBackground/image5.png'
        },
        {
          url: './static/themeBackground/image6.png'
        },
        {
          url: './static/themeBackground/image7.png'
        },
        {
          url: './static/themeBackground/image8.png'
        }
      ]
    }
  },
  beforeMount () { },
  mounted () { },
  computed: {
    // ...mapGetters(['image'])
  },
  methods: {
    async changeSystemImage (imageUrl) {
      this.$store.dispatch('setImage', imageUrl)
    },
    cloneBack (imageUrl) {
      this.$store.dispatch('setImage', imageUrl)
    }
  },
  components: {}
}
</script>
<style lang="scss" scoped>
.tips {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin: 8px 8px 8px 26px;
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

  .select-theme {
    width: 100px;
    display: inherit;
    align-items: center;
    justify-content: center;
  }
}
</style>
