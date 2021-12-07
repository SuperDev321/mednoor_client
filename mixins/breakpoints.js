// Breakpoints
/*
  $sm: 600px
  $md: 960px
  $lg: 1264px
  $xl: 1904px
*/

export default {
  data: () => ({
    breakpoints: {
      sm: 600,
      md: 960,
      lg: 1264,
      xl: 1904,
    },
    clientWidth: 0,
  }),
  computed: {
    isSmall() {
      return this.clientWidth <= this.breakpoints.sm
    },
    isMiddle() {
      return (
        this.clientWidth > this.breakpoints.sm &&
        this.clientWidth <= this.breakpoints.md
      )
    },
    isLarge() {
      return (
        this.clientWidth > this.breakpoints.md &&
        this.clientWidth <= this.breakpoints.lg
      )
    },
    isXLarge() {
      return this.clientWidth > this.breakpoints.lg
    },
  },
  methods: {
    setClientWidth() {
      if (process.client) {
        this.clientWidth = window.innerWidth
      }
    },
  },
  mounted() {
    if (process.client) {
      window.addEventListener('resize', this.setClientWidth)
    }
    this.setClientWidth()
  },
  destroyed() {
    if (process.client) {
      window.removeEventListener('resize', this.setClientWidth)
    }
  },
}
