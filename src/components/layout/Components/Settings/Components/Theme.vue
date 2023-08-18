<template>
  <div class="select-theme">
    <ul>
      <li v-for="(theme, index) in themeName"
          :key="index"
          :class="{ active: activeTheme === theme }"
          :style="{ background: theme }"
          @click="changeSystemTheme(theme)"></li>
    </ul>
    <div class="select-theme">
      <el-color-picker v-model="pickerColor"
                       @change="changeSystemTheme(pickerColor)"></el-color-picker>
    </div>
  </div>
</template>
<script>
import { ColorPicker } from 'p8-components-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'Theme',
  data () {
    return {
      chalk: '',
      pickerColor: '',
      themeName: []
    }
  },
  beforeMount () {
    const systemTheme = this.$const.systemTheme.theme
    for (let key of Object.values(systemTheme)) {
      this.themeName.push(key)
    }
  },
  mounted () {
    this.pickerColor = this.theme
  },
  computed: {
    ...mapGetters(['theme']),
    activeTheme () {
      return this.$store.getters.theme
    }
  },
  methods: {
    changeSystemTheme (theme) {
      this.$store.dispatch('setTheme', { theme, handler: true })
    }
  },
  components: {
    'el-color-picker': ColorPicker
  }
}
</script>
<style lang="scss" scoped>
.select-theme {
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
