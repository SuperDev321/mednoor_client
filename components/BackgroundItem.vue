<template>
  <div class="bg-img" :style="backgroundURL">

  </div>
</template>
<script>

export default {
  props: {
    source: {
      type: String,
      default: ''
    },
    file: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    }
  },
  data (){
    return {

    }
  },
  computed: {
    backgroundURL() {
      let path
      const src = this.$props.source.toLowerCase()
      if (src === 'api') {
        path = process.env.API_URL + '/'
      } else if (src === 'empty') {
        path = ''
      } else {
        path = process.env.BASE_URL + '/'
      }
      path += this.$props.file
      let s = `background-image: url(${path});`
      if (this.$props.height) {
        s += `height: ${this.$props.height} !important;`
      }
      return s
    }
  },
  created() {

  }
}
</script>
<style scoped lang="sass">
.bg-img
  background-position: center center
  background-repeat: no-repeat
  background-size: cover
  .bottom-footer
    position: absolute
    bottom: 0
    left: 0
    right: 0
    background: rgba(255, 255, 255, 0.9)
    .m-footer
      background: transparent !important
      p.text-center, p, .mb-1
        margin-bottom: 0 !important

  .middle-text
    position: absolute
    left: 0
    right: 0
    bottom: 50%
    top: 50%
    height: 200px
    background: rgba(0, 0, 0, 0.9)
    color: #fff !important
    display: flex
    justify-content: center
    align-items: center
    text-align: center

</style>
