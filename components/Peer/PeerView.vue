<template>
  <div class="peer-content">
    <div class="peer-overlay">{{name}}</div>
    <video ref="video" autoPlay class="peer-video"></video>
    <audio ref="audio" autoPlay></audio>
  </div>
</template>

<script>
export default {
  name: 'PeerView',
  props: {
    name: {
      type: String,
      default: ''
    },
    video: {
      type: Object,
      default: null
    },
    audio: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      mounted: false
    }
  },
  computed: {
    changeAudio () {
      if (this.audio && this.$refs.audio) {
        return this.audio;
      } else {
        return null;
      }
    },
    changeVideo () {
      if (this.video && this.$refs.video) {
        return this.video;
      } else {
        return null;
      }
    }
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    changeVideo: function (value) {
      if (value)
        this.$refs.video.srcObject = value
        this.$refs.video.play()
    },
    // eslint-disable-next-line object-shorthand
    changeAudio: function (value) {
      if (value) {
        console.log('audio', value);
        this.$refs.audio.srcObject = value
      }
    }
  },
  mounted () {
    if (this.$refs.audio && this.audio) {
      this.$refs.audio.srcObject = this.audio
      this.$refs.audio.play()
    }
    if (this.$refs.video && this.video) {
      this.$refs.video.srcObject = this.video
      this.$refs.video.play()
    }
  },
}
</script>

<style lang="sass" scoped>
.peer-video
  height: 100%
  border-radius: 5px
.peer-content
  display: flex
  position: relative
  padding: 5px
  height: 100%
  width: fit-content
  margin: auto
.peer-overlay
  position: absolute
  bottom: 5px
  right: 5px
  background: #464542bf
  color: white

</style>
