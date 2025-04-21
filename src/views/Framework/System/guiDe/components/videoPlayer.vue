<template>
  <div class="video" id="video">
    <video
      id="myVideo"
      class="video-js vjs-default-skin vjs-big-play-centered"
    ></video>
  </div>
  <!-- <a-button @click="video.play()">开始</a-button>
  <a-button @click="video.pause()">暂停</a-button> -->
</template>

<script>
import $video from "video.js";
import "video.js/dist/video-js.css";
// import lang_zhcn from "video.js/dist/lang/zh-CN.json";
// $video.addLanguage("zh-CN", lang_zhcn);
export default {
  name: "videoPlayer",
  props: {
    record: {
      type: Object,
      default: ()=> {return {}}
    }
  },
  data() {
    return {
      video: null,
      width: '',
      height: '',
      videoPoster: '',
      videoUrl: './static/helpFile/系统操作视频.mp4'
    };
  },
  mounted() {
    if (this.record.vURL) {
      this.videoUrl += '#t=' + this.record.vURL
    }
    this.width = document.getElementById("video").offsetWidth
    this.height = document.getElementById("video").offsetHeight
    //创建一个视频对象
    this.video = $video(
      "myVideo",
      {
        language: "zh-CN",
        controls: true, // 是否显示控制条
        // poster: this.videoPoster, // 视频封面图地址
        width: this.width,
        height: this.height,
        //preload: "auto",
        autoplay: true,
        //fluid: true, // 自适应宽高
        language: "zh-CN", // 设置语言
        muted: false, // 是否静音
        inactivityTimeout: false,
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          // 设置控制条组件
          //设置控制条里面组件的相关属性及显示与否
          /* currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          volumePanel: {
            inline: false,
          }, */
          playToggle: true, // 播放暂停按钮
          volumeMenuButton: true, // 音量控制
          currentTimeDisplay: true, // 当前播放时间
          timeDivider: true, // '/' 分隔符
          durationDisplay: true, // 总时间
          progressControl: true, // 点播流时，播放进度条，seek控制
          liveDisplay: true, // 直播流时，显示LIVE
          remainingTimeDisplay: true, // 当前播放时间
          playbackRateMenuButton: true, // 播放速率，当前只有html5模式下才支持设置播放速率
          fullscreenToggle: true, // 全屏控制
          /* 使用children的形式可以控制每一个控件的位置，以及显示与否 */
          children: [
            { name: "playToggle" }, // 播放按钮
            { name: "currentTimeDisplay" }, // 当前已播放时间
            { name: "durationDisplay" }, // 总时间
            { name: "progressControl" }, // 播放进度条

            {
              // 倍数播放
              name: "playbackRateMenuButton",
              playbackRates: [0.5, 1, 1.5],
            },
            {
              name: "volumePanel", // 音量控制
              inline: false, // 不使用水平方式
            },
            /* { name: "FullscreenToggle" }, // 全屏 */
          ],
        },
        sources: [
          // 视频源
          {
            src: this.videoUrl,
            type: "video/mp4",
            poster: this.videoPoster,
          },
        ],
      }
    );
  },
  created() {},
  watch: {
  },
  methods: {
  },
  beforeDestroy() {
    if (this.video) {
      this.video.dispose();
      this.video = null
    }
  }
};
</script>
<style lang="scss" scope>
.video{
  height: 100%;
  width: 100%;
}
// @import "./videoPlayer.css"

</style>
