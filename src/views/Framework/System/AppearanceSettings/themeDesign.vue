<template>
  <div style="height: 96%;position: relative;">
    <div class="theme-design">
      <div class="theme-left"
           ref="themeImage"
           :style="{ width: '200px', 'background-image': 'url(' + imageUrl + ')', 'background-size': '200px 100%' }">
        <VuePerfectScrollbar :style="{ 'background-color': theme }">

        </VuePerfectScrollbar>
      </div>
      <div class="theme-right">
        <div class="table-left">
          <el-button type="primary">新建</el-button>
          <el-button type="primary">修改</el-button>
          <common-table ref="table"
                        class="table"
                        :comp="comp"
                        :columns="columns"
                        :no-api-table-data="infiniteList"
                        :table-setting="false"
                        :pagination="false">
            <template #operation="{ scope }">
              <el-button type="text">查看</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button type="text">删除</el-button>
            </template>
          </common-table>
        </div>
        <div class="table-right">
          <div class="settings">
            <theme />
            <el-alert :closable="false"
                      title="注意:主题色仅会在保证正常显示与配色的前提下调整部分色彩,而非全部色彩."
                      type="warning"
                      show-icon />
          </div>
          <div class="settings">
            <background-image @changeSystemImage="changeSystemImage" />
            <el-button-group v-model="buttonType"
                             style="margin-left: 40px;padding: 10px;">
              <el-button v-for="(btn, index) in buttonConfigs"
                         :key="index"
                         type="primary"
                         @click="settingStyle(btn.value)">
                {{ btn.label }}
              </el-button>
            </el-button-group>
          </div>
          <div class="settings">
            <TableTheme />
            <el-alert :closable="false"
                      title="注意:表格颜色仅会在保证正常显示与配色的前提下调整部分色彩,而非全部色彩."
                      type="warning"
                      show-icon />
          </div>
        </div>
      </div>
    </div>
    <el-button type="primary"
               style="position: absolute;right: 10px;"
               @click="save">保存</el-button>
  </div>
</template>

<script>
import {
  P8ListLayout as ListLayout,
  P8Table as CommonTable
} from 'p8-components-ui'
import { mapGetters } from 'vuex'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import theme from './Components/Theme'
import BackgroundImage from './Components/BackgroundImage'
import TableTheme from './Components/TableTheme'
export default {
  props: {
    formData: {
      type: Object,
      default: () => {
      }
    },
    themeArray: {
      type: Array,
      default: () => {
      }
    }
  },
  components: {
    VuePerfectScrollbar,
    CommonTable,
    ListLayout,
    theme,
    BackgroundImage,
    TableTheme
  },
  data () {
    return {
      comp: this,
      objColor: {
        themeColor: ''
      },
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 55,
          headerAlign: 'center'
        },
        {
          title: '姓名',
          dataIndex: 'name',
          align: 'center'
        },
        {
          title: '年龄',
          dataIndex: 'age',
          align: 'center'
        },
        {
          title: '性别',
          dataIndex: 'six',
          align: 'center'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
          width: 150,
          align: 'center'
        }
      ],
      infiniteList: [
        {
          name: '张三',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '李四',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '王五',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '赵六',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '钱七',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        }
      ],
      imagePath: '',
      imgType: 1, // 默认选中第一个按钮
      buttonType: 1,
      buttonConfigs: [
        { label: '自适应', value: 1 },
        { label: '平铺', value: 2 },
        { label: '拉伸', value: 3 },
      ],
    }
  },
  watch: {
    theme (val, oldVal) {
      this.getColor()
    },
    imageUrl: {
      handler (val) {
        if (!val.includes('.png') || !val.includes('http')) {
          this.getImage(this.imageId)
        }
      },
      deep: true,
      immediate: true
    },
  },
  computed: {
    ...mapGetters(['systemTheme', 'theme', 'imageUrl', 'systemColor', 'imageId']),
  },
  mounted () {
    this.getColor()
  },
  methods: {
    settingStyle (value) {
      this.imgType = value
      // 根据 value 设置背景样式
      const style = this.$refs.themeImage.style;
      switch (value) {
        case 1:
          style.backgroundSize = '200px 100%';
          style.backgroundRepeat = 'no-repeat';
          break;
        case 2:
          style.backgroundPosition = 'center';
          style.backgroundSize = 'contain';
          style.backgroundRepeat = 'repeat';
          break;
        case 3:
          style.backgroundSize = 'cover';
          style.backgroundRepeat = 'repeat';
          style.backgroundPosition = 'center';
          break;
      }
    },
    getImage (id) {
      let that = this
      let systemThemeType = this.$store.getters.baseConfig.systemThemeType
      let systemThemeArray = JSON.parse(this.$store.getters.baseConfig.systemThemeArray)
      let themeArray = []
      if (systemThemeType === 'systemThemeType1') {
        themeArray = systemThemeArray[0]
      }
      if (systemThemeType === 'systemThemeType2') {
        themeArray = systemThemeArray[1]
      }
      if (systemThemeType === 'systemThemeType3') {
        themeArray = systemThemeArray[2]
      }
      themeArray.forEach(item => {
        if (item.key === 'imageUrl') {
          id = item.url
          if (this.imagePath === '') {
            this.imagePath = id
          }
        }
      })
      let imgType = this.$store.getters.systemColor.imgType || 1
      that.$nextTick(() => {
        that.settingStyle(imgType)
      })
    },
    changeSystemImage (imageUrl) {
      this.imagePath = imageUrl
    },
    getColor () {
      this.$set(this.objColor, 'themeColor', this.theme)
    },
    fromHex (color) {
      var t = {},
        bits = color.length == 4 ? 4 : 8, //假设是shorthand。 #fff, 那么bits为4位, 每一位代表的个属性, 其他的为8位 每两位代表一个属性 #ffffff00
        mask = (1 << bits) - 1 //表示字节占位符。 向左移4位或8位，var a = (1 << 4 ) - 1 -> 10000 - 1,  a.toString(2); // 1111。或者 8位的 1111 1111
      color = Number('0x' + color.substr(1)) //#ff0000 转变为16进制0xff0000;
      if (isNaN(color)) {
        return null // Color
      }
      ;['b', 'g', 'r'].forEach(function (x) {
        var c = color & mask
        color >>= bits
        t[x] = bits == 4 ? 17 * c : c // 0xfff ， 一个f应该代表 255, 应该当[0-255]，按15等份划分，每一等份间隔 17。
      })
      t.a = 1
      return t // Color
    },
    save () {
      let themeArray = [
        {
          key: 'theme',//主题色
          value: this.theme
        },
        {
          key: 'tableBgColor',//表格背景色
          value: this.systemColor['tableBgColor']
        },
        {
          key: 'tableHeaderBgColor',//表格表头背景色
          value: this.systemColor['tableHeaderBgColor']
        },
        {
          key: 'tableStripeColor',//表格斑马纹颜色
          value: this.systemColor['tableStripeColor']
        },
        {
          key: 'tableRowHoverBgColor',//表格鼠标悬停颜色
          value: this.systemColor['tableRowHoverBgColor']
        },
        {
          key: 'tableBorderColor',//表格边框颜色
          value: this.systemColor['tableBorderColor']
        },
        {
          key: 'tableTextColor',//表格文字颜色
          value: this.systemColor['tableTextColor']
        },
        {
          key: 'tableHeaderTextColor',//表格表头文字颜色
          value: this.systemColor['tableHeaderTextColor']
        },
        {
          key: 'imageUrl',// 侧边栏背景图片
          url: this.imagePath
        },
        {
          key: 'bgTheme',// 侧边栏背景颜色
          value: this.theme
        },
        {
          key: 'imgType',// 侧边栏背景颜色
          value: this.imgType
        }
      ]
      console.log(themeArray, 'themeArraythemeArray');
      if (this.formData.systemThemeType === 'systemThemeType1') {
        this.themeArray[0] = themeArray
      }
      if (this.formData.systemThemeType === 'systemThemeType2') {
        this.themeArray[1] = themeArray
      }
      if (this.formData.systemThemeType === 'systemThemeType3') {
        this.themeArray[2] = themeArray
      }
      this.$emit('save-success', this.themeArray)
    }
  }
}
</script>

<style lang="scss" scoped>
.theme-design {
  display: flex;
  flex-direction: row;
  width: 99%;
  height: 97%;
  margin: 10px;
  .theme-left {
    width: 30%;
  }
  .theme-right {
    width: calc(100% - 200px);
    height: calc(100% - 13px);
    margin-left: 10px;
    display: flex;
  }
  .table {
    margin-top: 5px;
  }
  .table-left {
    width: 50%;
    height: 97%;
  }
  .table-right {
    width: 50%;
    height: 100%;
    overflow: auto;
  }
}
</style>