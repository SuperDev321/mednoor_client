export default {
  data: () => ({
    isListeningOnce_: false,
  }),
  methods: {
    run_once(cb) {
      if (!this.isListeningOnce_) {
        cb()
        this.isListeningOnce_ = true
      }
    },
  },
}
