<template>
  <a-row class="pa-1 mh-100v">
    <a-col>
      <p class='h1'>
        {{$t('chat_requests')}}
      </p>
      <a-table :columns='columns' :data-source='items'>
        <div slot='user_name' slot-scope='text, record'>
          <nuxt-link :to="localePath('/user/' + record.user_uuid)">{{ record.user_first_name }} {{ record.user_last_name }}</nuxt-link>
        </div>
        <div slot='mypr_date' slot-scope='text'>
          {{dateString(text)}}
        </div>
        <div slot='actions' slot-scope='text, record'>
          <a href='javascript:void(0)' @click='aksAccept(record.mypr_id)'>{{$t('yes')}}</a>
          <a-divider type='vertical' />
          {{$t('no')}}
        </div>
      </a-table>
    </a-col>
    <RequestDialog ref='rmodal'></RequestDialog>
    <a-modal v-model='visible' title='Accept chat request' ok-text='Accept chat request' :confirm-loading='loadingModal' :cancel-text="$t('cancel')"  @ok='allowChat'>
      <p>
        {{$t('chat_ask_allow')}}
      </p>
    </a-modal>
  </a-row>
</template>

<script>
import RequestDialog from '~/components/RequestModal'
import dateMixin from '~/mixins/dateMixin'
import authMixin from '~/mixins/authMixin'

export default {
  name: 'ChatRequests',
  components: {
    RequestDialog
  },
  mixins: [dateMixin, authMixin],
  middleware: ['authenticated', 'not-blocked', 'not-deleted'],
  data (){
    return {
      selectedId: null,
      visible: false,
      loadingModal: false,
      items: [],
      columns: [
        {
          title: this.$t('usr_name'),
          dataIndex: 'user_first_name',
          key: 'user_first_name',
          slots: { title: this.$t('usr_name') },
          scopedSlots: { customRender: 'user_name' }
        },
        {
          title: this.$t('date_requested'),
          dataIndex: 'mypr_date',
          key: 'mypr_date',
          slots: { title: this.$t('date_requested') },
          scopedSlots: { customRender: 'mypr_date' }
        },
        {
          title: this.$t('accept'),
          dataIndex: 'mypr_id',
          key: 'mypr_id',
          slots: { title: this.$t('accept') },
          scopedSlots: { customRender: 'actions' }
        }
      ],
      socket: null,
    }
  },
  head() {
    return {
      title: this.$t('chat_requests'),
    }
  },
  mounted() {
    this.socket = this.$nuxtSocket({})
    this.socket.emit('join-room', this.myUserId)
    this.socket.on('chat-request', ()=>{
      this.loadRequests()
    })
    this.loadRequests()
  },
  methods: {
    loadRequests(){
      this.$api.get('/my-professional/not-accepted').then(({ data }) => {
        this.items = data
      }).catch((err) => {
        this.$refs.rmodal.$emit('error', err)
      })
    },
    aksAccept(id){
      this.selectedId = id
      this.visible = true
    },
    allowChat(){
      this.loadingModal = true
      this.$api.post('/my-professional/allow/' + this.selectedId).then(()=>{
        this.items = this.items.filter((item)=>{
          if (item.mypr_id === this.selectedId){
            this.$router.push({ path: this.localePath('/'), query: { chat: item.user_uuid } })
          }
          return item.mypr_id !== this.selectedId
        })
      }).catch((err)=>{
        this.$refs.rmodal.$emit('error', err)
      }).finally(()=>{
        this.visible = false
        this.loadingModal = false
        this.selectedId = null
      })
    }
  }
}
</script>
