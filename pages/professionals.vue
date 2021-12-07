<template>
  <a-row class="pa-1 mh-100v">
    <a-col>
      <h1>{{$t('av_prof')}}</h1>
      <p>
        If you already have a chat with a professional you can go to <nuxt-link :to="localePath('/')">My chats</nuxt-link>
      </p>
      <a-skeleton v-if='loading' />
      <a-table v-else-if='users.length > 0' :columns='columns' :data-source='users'>
        <div slot='full_name' slot-scope='text, record'>
          <nuxt-link :to="localePath('/user/' + record.user_uuid)">
            {{ record.user_first_name }} {{ record.user_last_name }}
          </nuxt-link>
        </div>
        <div slot='action' slot-scope='text, record'>
          <span v-if='record.mypr_id'>
            <span v-if='record.mypr_allowed'>
              {{$t('chat_acc')}}
            </span>
            <span v-else>
              {{$t('chat_sent')}}
            </span>
          </span>
          <a v-else @click='save(record.user_uuid)'>{{$t('send_chat')}}</a>
        </div>
      </a-table>
      <div v-else>
        <p>
          {{$t('no_data_av')}}
        </p>
      </div>
    </a-col>
    <a-col>
      <RequestModal ref='rmodal'></RequestModal>
    </a-col>
    <a-col>
      <a-modal
        :title="$t('conf_action')"
        :visible='visible'
        :confirm-loading='confirmLoading'
        @ok='handleOk'
        @cancel='handleCancel'
      >
        <p>{{$t('conf_send_ch')}}</p>
      </a-modal>
    </a-col>
  </a-row>
</template>

<script>
import RequestModal from '~/components/RequestModal'
import authMixin from '~/mixins/authMixin'

export default {
  name: 'Professionals',
  components: {
    RequestModal
  },
  mixins: [authMixin],
  middleware: ['authenticated', 'not-blocked', 'not-deleted', 'verified'],
  data (){
    return {
      visible: false,
      columns: [
        {
          title: this.$t('full_name'),
          dataIndex: 'user_first_name',
          key: 'user_first_name',
          slots: { title: this.$t('full_name') },
          scopedSlots: { customRender: 'full_name' }
        },
        {
          title: this.$t('action'),
          key: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      users: [],
      loading: true,
      confirmLoading: false,
      uuid: '',
      action: '',
      socket: null,
    }
  },
  head() {
    return {
      title: this.$t('profs'),
    }
  },
  mounted() {
    this.getModerators()
    this.socket = this.$nuxtSocket({})
    this.socket.emit('join-room', this.myUserId)
    this.socket.on('chat-allowed', ()=>{
      this.getModerators()
    })
  },
  methods: {
    getModerators() {
      this.loading = true
      this.$api.get('/user/moderators/' + this.$auth.user.uuid).then(({ data }) => {
        this.users = data
      }).catch((err) => {
        this.$refs.rmodal.$emit('error', err)
      }).finally(() => {
        this.loading = false
      })
    },
    handleCancel() {
      this.visible = false
      this.uuid = null
      this.confirmLoading = false
    },
    handleOk() {
      this.confirmLoading = true
      if (this.action === 'save') {
        this.$api.post('/my-professional', {
          professional: this.uuid
        }).then(() => {
          this.getModerators()
        }).catch((err) => {
          this.$refs.rmodal.$emit('error', err)
        }).finally(() => {
          this.confirmLoading = false
          this.visible = false
        })
      }
    },
    save(uuid) {
      this.uuid = uuid
      this.action = 'save'
      this.visible = true
    },
    remove(uuid) {
      this.uuid = uuid
      this.action = 'remove'
      this.visible = true

    }
  }
}
</script>
