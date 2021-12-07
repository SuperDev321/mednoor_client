import authMixin from '~/mixins/authMixin'

export default {
  mixins: [authMixin],
  methods: {
    user_was_updated() {
      if (this.isLoggedIn) {
        const user = this.$auth.user
        console.log('The user is now ', user)
        if (user.blocked) {
          this.$router.push(this.localePath('/blocked'))
        } else if (this.$route.path === '/blocked') {
          this.$router.push(this.localePath('/welcome'))
        } else if (user.role) {
          if (this.$route.path !== this.localePath('/')) {
            this.$router.push(this.localePath('/welcome'))
          }
        }
      }
    },
  },
}
