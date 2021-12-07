<template>
  <div class="pa-1 mh-100v">
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Professional Requests</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col>
        <p class="h1">Professional Requests</p>
      </a-col>
      <a-col>
        <a-skeleton v-if="loading"></a-skeleton>
        <a-table v-else :columns="columns" :data-source="data">
          <div slot='user_first_name' slot-scope='text, record'>
            <nuxt-link :to="localePath('/user/' + record.user_uuid)">
              {{record.user_first_name}} {{record.user_last_name}}
            </nuxt-link>
          </div>
          <div slot="actions" slot-scope='text, record'>
            <span class="primary--text clickable" @click="askAllow(record.profe_uuid)">Allow</span>
          </div>
        </a-table>
      </a-col>
    </a-row>
    <a-modal
      title="Are you sure?"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>
        The user will become a professional.
      </p>
    </a-modal>
  </div>
</template>
<script>
import listenMixin from "~/mixins/listenMixin";

export default {
  name: "ProfessionalRequests",
  mixins: [listenMixin],
  layout: 'dashboard',
  middleware: ['authenticated', 'not-deleted', 'not-blocked', 'admin-or-super'],
  data (){
    return {
      confirmLoading: false,
      visible: false,
      loading: false,
      data: [],
      columns: [
        {
          title: 'Name',
          dataIndex: 'user_first_name',
          key: 'user_first_name',
          slots: { title: 'User Name' },
          scopedSlots: { customRender: 'user_first_name' }
        },
        {
          title: 'NPI',
          dataIndex: 'profe_npi',
          key: 'profe_npi',
          slots: { title: 'NPI' },
          scopedSlots: { customRender: 'profe_npi' }
        },
        {
          title: 'Category',
          dataIndex: 'cate_category',
          key: 'cate_category',
          slots: { title: 'Category' },
          scopedSlots: { customRender: 'cate_category' }
        },
        {
          title: 'Actions',
          dataIndex: 'actions',
          key: 'actions',
          slots: { title: 'Actions' },
          scopedSlots: { customRender: 'actions' }
        },
      ],
      uuid: null,
      socket: null,
    }
  },
  mounted() {
    this.run_once(this.listen)
    this.loadData()
  },
  methods: {
    loadData(){
      this.loading = true
      this.$api.get('/professional/not-accepted').then(({data})=>{
        this.loading = false
        if (data){
          this.data = data
        }
      })
    },
    listen(){
      this.socket = this.$nuxtSocket({})
      this.socket.emit('join-room', this.$auth.user.uuid)
      this.socket.on('professional-request', ()=>{
        this.loadData()
      })
    },
    handleOk(){
      this.confirmLoading = true
      this.$api.post('/professional/accept/' + this.uuid).then(()=>{
        this.data = this.data.filter((it)=>{
          return it.profe_uuid !== this.uuid
        })
      }).catch((err)=>{
        this.$toast.error(err)
      }).finally(()=>{
        this.visible = false
        this.confirmLoading = false
      })
    },
    handleCancel(){
      this.visible = false
    },
    askAllow(uuid){
      this.uuid = uuid
      this.visible = true
    }
  }
}
</script>

<style scoped>

</style>
