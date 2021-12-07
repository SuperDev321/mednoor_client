export default {
  data: () => ({
    isMounted: false,
  }),
  mounted() {
    this.isMounted = true
  },
  computed: {
    guestId() {
      const c = this.$cookies.get('temporalUser')
      if (c) {
        return c.user_uuid
      } else {
        return null
      }
    },
    isLoggedIn() {
      return this.isMounted && this.$auth.loggedIn
    },
    myUser() {
      if (this.isLoggedIn) {
        return this.$auth.user
      } else {
        return { uuid: null }
      }
    },
    myUserId() {
      return this.myUser.uuid
    },
  },
}
