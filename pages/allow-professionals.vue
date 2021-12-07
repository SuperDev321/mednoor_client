<template>
<a-row>
  <a-col>
    <h1>{{$t('allo_usrs')}}</h1>
    <p>{{$t('all_des')}}</p>
    <a-table :columns='columns' :data-source='items'>
            <span slot="professional" slot-scope="text, record">
              {{ record.fn1 }} {{ record.ln1 }}
            </span>
      <span slot="user" slot-scope="text, record">
              {{ record.fn2 }} {{ record.ln2 }}
            </span>
      <span slot="action" slot-scope="text, record">
              <!--<span slot="action">-->
                <span v-if="record.mypr_allowed">{{$t('all_urs_is')}}</span>
                <a v-else @click='allow(record.mypr_id)'>{{$t('allo_usr')}}</a>
              </span>
    </a-table>
  </a-col>
  <RequestModal ref='rmodal'></RequestModal>
</a-row>
</template>

<script>
import RequestModal from '~/components/RequestModal'

export default {
  name: "AllowProfessionals",
  components: {
    RequestModal
  },
  middleware: ['authenticated'],
  data () {
    return {
      items: [],
      columns: [
        {
          title: this.$t('professional'),
          dataIndex: 'fn1',
          key: 'fn1',
          slots: {title: this.$t('professional')},
          scopedSlots: {customRender: 'professional'}
        },
        {
          title: this.$t('usr'),
          dataIndex: 'fn2',
          key: 'fn2',
          slots: {title: this.$t('usr')},
          scopedSlots: {customRender: 'user'}
        },
        {
          title: this.$t('action'),
          key: 'action',
          scopedSlots: {customRender: 'action'}
        }
      ],
    }
  },
  head() {
    return {
      title: this.$t('all_prof'),
    }
  },
  mounted (){
    this.getItems()
  },
  methods: {
    getItems(){
      this.$api.get('/my-professional/all').then(({data})=>{
        this.items = data
      })
    },
    allow (id) {
      this.$api.post('/my-professional/allow/' + id).then(({data})=>{
        this.getItems()
      }).catch((err)=>{
        this.$refs.rmodal.$emit('error', err)
      })
    }
  }
}
</script>
