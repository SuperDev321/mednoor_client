import authMixin from '~/mixins/authMixin'

export default {
  mixins: [authMixin],
  computed: {
    userRoleTxt() {
      if (this.isLoggedIn) {
        return this.$auth.user.roleTxt
          ? this.$auth.user.roleTxt.toLowerCase()
          : 'guest'
      } else {
        return 'guest'
      }
    },
    userRole() {
      if (this.isLoggedIn) {
        return this.$auth.user.role
          ? this.$auth.user.role.toLowerCase()
          : 'guest'
      } else {
        return 'guest'
      }
    },
    isGuest() {
      return this.userRole === 'guest'
    },
    isSuper() {
      return this.userRole === 'super'
    },
    isAdmin() {
      return this.userRole === 'admin'
    },
    isAdminOrSuper() {
      return this.isAdmin || this.isSuper
    },
    isModerator() {
      // This is the same as Professional. (The keyword is moderator)
      return this.userRole === 'moderator'
    },
    isModeratorOrHigher() {
      return this.isModerator || this.isAdmin || this.isSuper
    },
    isUser() {
      return this.userRole === 'user'
    },
  },
}
