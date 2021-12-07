export default {
  methods: {
    toggleDirective(v, clickFromInside) {
      let result
      if (clickFromInside === true) {
        result = !v
      } else {
        result = false
      }
      return result
    },
  },
}
