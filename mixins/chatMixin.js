import moment from 'moment'
import debounce from 'lodash.debounce'
import userRoleMixin from '~/mixins/userRoleMixin'
import authMixin from '~/mixins/authMixin'

export default {
  data: () => ({
    chats: [],
    moderators: [],
    loadingItems: true,
    socket: null,
    message: '',
    to: '',
  }),
  mixins: [userRoleMixin, authMixin],
  watch: {
    message: debounce(function () {
      this.socket.emit('stopped-typing', { to: this.to })
    }, 1000),
  },
  methods: {
    scrollMessagesSection() {
      console.log('Scroll')
      this.$nextTick(() => {
        const c = this.$refs.messages
        console.log(c)
        if (c) {
          c.scrollTop = c.scrollHeight
        }
      })
    },
    listen() {
      console.log('listening')
      this.socket = this.$nuxtSocket({ persist: 'chatSocket' })
      if (this.isLoggedIn) {
        this.socket.emit('join-room', this.myID)
      } else {
        this.socket.emit(
          'join-room',
          this.$cookies.get('temporalUser').user_uuid
        )
      }
      this.socket.on('chat-request', () => {
        this.openNotification({
          title: this.$t('new_chreq'),
          description: this.$t('new_chreq'),
        })
      })

      this.socket.on('user-reload', () => {
        if (this.isLoggedIn) {
          if (this.isUser) {
            this.getChats(true)
          } else {
            this.getChats(false)
          }
        }
        this.openNotification()
      })

      this.socket.on('new-message', (data) => {
        console.log('new message received', data)
        this.playNotification()
        if (data.from !== this.to) {
          this.moderators = this.moderators.map((eme) => {
            if (
              (eme.mypr_proffesional !== undefined ||
                eme.mypr_uuid !== undefined ||
                eme.user_uuid !== undefined) &&
              data.from !== undefined
            ) {
              if (
                eme.mypr_proffesional === data.from ||
                eme.mypr_uuid === data.from ||
                eme.user_uuid === data.from
              ) {
                if (eme.messages) {
                  eme.messages = eme.messages + 1
                } else {
                  eme.messages = 1
                }
                this.updateIdx++
              }
            }
            return eme
          })
        }

        if (this.to && data.from === this.to) {
          this.typing = null
          if (data.opts) {
            data.opts.owner = false
            this.messages.push(data.opts)
          } else {
            this.messages.push({
              owner: false,
              message: data.message,
              mess_date: data.mess_date,
            })
          }
          this.scrollMessagesSection()
        }
      })
      this.socket.on('fetch-user', async () => {
        if (this.isLoggedIn) {
          await this.$auth.fetchUser()
          this.user_was_updated()
        }
      })
      this.socket.on('chat-deleted', () => {
        this.$router.push(this.localePath('/chat-ended'))
      })
      this.socket.on('typing', (data) => {
        if (!this.typing) {
          this.typing = data.from
          setTimeout(() => {
            this.typing = null
          }, 1600)
        }
      })
    },
    mergeWithConversations(addMessages) {
      this.loadingItems = true
      this.$api
        .get('/conversation/my-conversations')
        .then(({ data }) => {
          data.forEach((item) => {
            let exists = false
            this.moderators.forEach((mod) => {
              const mid = mod.user_uuid
              if (mid === item.u1_uuid || mid === item.u2_uuid) {
                exists = true
              }
            })
            if (!exists) {
              const u = {}
              if (item.u1_uuid !== this.$auth.user.uuid) {
                u.user_uuid = item.u1_uuid
                u.user_first_name = item.u1_fn
                u.user_last_name = item.u1_ln
              } else {
                u.user_uuid = item.u2_uuid
                u.user_first_name = item.u2_fn
                u.user_last_name = item.u2_ln
              }
              u.mypr_allowed = true

              console.log('Add messages', addMessages)

              if (addMessages) {
                u.messages = 1
              }
              this.moderators.push(u)
            }
          })
          this.chats = data
        })
        .catch((e) => {
          this.$refs.rmodal.$emit('error', e)
        })
        .finally(() => {
          this.loadingItems = false
        })
    },
    getChats(addMessages) {
      if (this.isLoggedIn) {
        this.loadingItems = true
        if (this.isAdmin) {
          this.mergeWithConversations()
        } else if (this.isModerator) {
          this.$api
            .get('/my-professional/my-users/')
            .then(({ data }) => {
              this.moderators = data
            })
            .catch((e) => {
              this.$refs.rmodal.$emit('error', e)
            })
            .finally(() => {
              this.loadingItems = false
            })
        } else {
          this.$api
            .get('/my-professional')
            .then(({ data }) => {
              this.moderators = data
            })
            .catch((e) => {
              this.$refs.rmodal.$emit('error', e)
            })
            .finally(() => {
              this.loadingItems = false
            })
        }
      } else {
        this.moderators = []
        this.loadingItems = false
      }
    },
    openNotification(data) {
      data = data || {}
      this.$notification.open({
        message: data.title || this.$t('ch_lis_upd'),
        description: data.description || this.$t('ych_hb_upd'),
        style: {
          width: '600px',
          marginLeft: `${335 - 600}px`,
        },
      })
      this.playNotification()
    },
    playNotification() {
      const audioPath = process.env.BASE_URL + '/notification.mp3'
      const audio = new Audio(audioPath)
      audio.play().catch(() => {
        console.log('Sound not played')
      })
    },
    messageClass(msg) {
      const c = ['chat-message']
      const isOwner =
        msg.isOwner ||
        msg.owner ||
        msg.mess_sender === this.myUserId ||
        msg.mess_sender === this.guestId
      if (this.isModerator || this.isAdmin || this.isSuper) {
        if (isOwner) {
          c.push('owner')
        }
      } else if (!isOwner) {
        c.push('owner')
      }
      return c.join(' ')
    },
    filePath(s) {
      return process.env.API_URL + '/file/' + s
    },
    isImg(fileName) {
      return fileName.match(/\.(jpeg|jpg|gif|png)$/) != null
    },
    hour(date) {
      return moment(date).format('LTS')
    },
  },
}
