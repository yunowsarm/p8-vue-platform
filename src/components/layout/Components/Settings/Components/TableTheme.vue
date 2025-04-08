<template>
  <div>
    <div class="tips">
      <div class="vertical_line" />
      表格背景色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableBgColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableBgColor')" />
      </ul>
      <el-color-picker v-model="tableBgColor"
                       @change="changeColor($event, 'tableBgColor')" />
    </div>
    <div class="tips">
      <div class="vertical_line" />
      表格表头背景色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableHeaderBgColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableHeaderBgColor')" />
      </ul>
      <el-color-picker v-model="tableHeaderBgColor"
                       @change="changeColor($event, 'tableHeaderBgColor')" />
    </div>
    <div class="tips">
      <div class="vertical_line" />
      表格斑马纹颜色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableStripeColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableStripeColor')" />
      </ul>
      <el-color-picker v-model="tableStripeColor"
                       @change="changeColor($event, 'tableStripeColor')" />
    </div>
    <div class="tips">
      <div class="vertical_line" />
      表格鼠标悬停颜色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableRowHoverBgColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableRowHoverBgColor')" />
      </ul>
      <el-color-picker v-model="tableRowHoverBgColor"
                       @change="changeColor($event, 'tableRowHoverBgColor')" />
    </div>
    <div class="tips">
      <div class="vertical_line" />
      表格边框颜色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableBorderColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableBorderColor')" />
      </ul>
      <el-color-picker v-model="tableBorderColor"
                       @change="changeColor($event, 'tableBorderColor')" />
    </div>
    <div class="tips">
      <div class="vertical_line" />
      表格文字颜色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableTextColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableTextColor')" />
      </ul>
      <el-color-picker v-model="tableTextColor"
                       @change="changeColor($event, 'tableTextColor')" />
    </div>
    <div class="tips">
      <div class="vertical_line" />
      表格表头文字颜色
    </div>
    <div class="select-theme">
      <ul>
        <li v-for="(theme, index) in themeName"
            :key="index"
            :class="{ active: tableHeaderTextColor === theme }"
            :style="{ background: theme }"
            @click="changeColor(theme, 'tableHeaderTextColor')" />
      </ul>
      <el-color-picker v-model="tableHeaderTextColor"
                       @change="changeColor($event, 'tableHeaderTextColor')" />
    </div>
  </div>
</template>
<script>
import { ColorPicker } from 'p8-components-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'TableTheme',
  data () {
    return {
      themeName: []
    }
  },
  beforeMount () {
    const systemTheme = this.$const.systemTheme.theme
    for (const key of Object.values(systemTheme)) {
      this.themeName.push(key)
    }
  },
  mounted () { },
  computed: {
    tableBgColor () {
      return this.systemColor.tableBgColor
    },
    tableHeaderBgColor () {
      return this.systemColor.tableHeaderBgColor
    },
    tableStripeColor () {
      return this.systemColor.tableStripeColor
    },
    tableRowHoverBgColor () {
      return this.systemColor.tableRowHoverBgColor
    },
    tableBorderColor () {
      return this.systemColor.tableBorderColor
    },
    tableTextColor () {
      return this.systemColor.tableTextColor
    },
    tableHeaderTextColor () {
      return this.systemColor.tableHeaderTextColor
    },
    ...mapGetters(['systemColor'])
  },
  methods: {
    changeColor (theme, key) {
      this.$store.dispatch('setSystemColor', { [key]: theme })
    }
  },
  components: {
    'el-color-picker': ColorPicker
  }
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
  display: flex;
  align-items: center;
  margin-left: 40px;
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
