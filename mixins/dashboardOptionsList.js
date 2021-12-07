import userRoleMixin from './userRoleMixin'

export default {
  mixins: [userRoleMixin],
  computed: {
    dashboardItems() {
      const i = []
      if (this.isAdminOrSuper) {
        i.push(
          {
            shortTitle: this.$t('home_screen'),
            cardTitle: this.$t('home_screen'),
            to: '/home-screen',
            btnText: this.$t('home_screen'),
            icon: 'home',
            type: 'primary',
          },
          {
            shortTitle: 'Main Text',
            cardTitle: 'Main Text',
            to: '/main-text',
            btnText: 'Main Text',
            icon: 'file-text',
            type: 'raisin-black',
          }
        )
      }
      if (this.isModeratorOrHigher) {
        i.push({
          shortTitle: this.$t('my_chats'),
          cardTitle: this.$t('my_chats'),
          to: '/',
          btnText: this.$t('my_chats'),
          icon: 'message',
          type: 'success',
        })
        i.push({
          shortTitle: this.$t('list_usrs'),
          cardTitle: this.$t('list_usrs'),
          to: '/users-list',
          btnText: this.$t('list_usrs'),
          icon: 'user',
          type: 'old-rose',
        })
        i.push({
          shortTitle: this.$t('emr'),
          cardTitle: this.$t('emr_lng'),
          to: '/emr',
          btnText: this.$t('go_emr'),
          icon: 'medicine-box',
          type: 'aero-blue',
        })
      }
      if (this.isAdminOrSuper) {
        i.push(
          {
            shortTitle: this.$t('terms_cond'),
            cardTitle: this.$t('terms_cond'),
            to: '/update-terms-and-conditions',
            btnText: this.$t('update'),
            icon: 'audit',
            type: 'salmon',
          },
          {
            shortTitle: this.$t('privacy_p'),
            cardTitle: this.$t('privacy_p'),
            to: '/update-privacy-policy',
            btnText: this.$t('update'),
            icon: 'file-protect',
            type: 'purple',
          },
          {
            shortTitle: this.$t('pages'),
            cardTitle: this.$t('pages'),
            to: '/pages',
            btnText: this.$t('pages'),
            icon: 'file',
            type: 'primary',
          },
          {
            shortTitle: this.$t('professionals_list'),
            cardTitle: this.$t('professionals_list'),
            to: {
              path: '/users-list',
              query: {
                view: 'professionals',
              },
            },
            btnText: this.$t('professionals_list'),
            icon: 'team',
            type: 'raisin-black',
          },
          {
            shortTitle: 'Categories',
            cardTitle: 'Categories',
            to: '/categories',
            btnText: 'Categories',
            icon: 'table',
            type: 'success',
          },
          {
            shortTitle: 'Professional Requests',
            cardTitle: 'Professional Requests',
            to: '/professional-requests',
            btnText: 'List of requests',
            icon: 'list',
            type: 'old-rose',
          }
        )
      }
      return i
    },
  },
}
