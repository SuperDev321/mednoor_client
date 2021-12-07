export default {
  methods: {
    dateStringDate(date) {
      return new Date(date).toLocaleDateString('en-US')
    },
    dateString(date) {
      return new Date(date).toLocaleDateString('en-US')
      // ' ' + new Date(date).toLocaleTimeString('en-US')
    },
  },
}
