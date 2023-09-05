<template>
  <router-view />
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
  name: 'App',
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['token'])
  },
  watch: {
    token: {
      handler(val) {
        if (val) {
          this.getJson()
        }
      },
      immediate: true
    }
  },
  methods: {
    getJson() {
      axios
        .get('/static/iconfont/iconfont.json', {
          headers: { Authorization: this.token }
        })
        .then((res) => {
          const iconList = []
          res.data.glyphs.forEach((item) => {
            iconList.push('icon-' + item.font_class)
          })
          const p8font = {
            key: 'p8',
            title: 'P8 Icon',
            icons: iconList
          }
          localStorage.setItem('p8font', JSON.stringify(p8font))
        })
    }
  }
}
</script>
