<template>
<div class="pa-1 mh-100v">
  <a-row v-if="loading">
    <a-col>
      <a-skeleton></a-skeleton>
    </a-col>
  </a-row>
  <a-row v-else-if="not_found">
    <a-col>
      <p class="h1">Not Found</p>
      <p>
        We could not find the user that you were looking for.
      </p>
      <a-button @click="$router.push(localePath('/directory'))">
        Search other users
      </a-button>
    </a-col>
  </a-row>
  <a-row v-else>
    <a-col>
      <p class="h1" style='display: flex; align-items: center'>
        {{user.user_first_name}} {{user.user_last_name}}
        <a-button v-if='user && user.usro_key' type='raisin-black' class='ml-1'>
          {{user.usro_role}}
        </a-button>
      </p>
      <a-row class='mt-1 mb-1'>
        <a-col>
          <p>
            <b>Date of birth:</b> <span v-if='user && user.user_date_of_birth'>
            {{dateString(user.user_date_of_birth)}}
          </span>
          </p>
          <p>
            <b>Phone Number:</b> <span v-if='user && user.user_country_code'>
            +{{user.user_country_code}} {{user.user_phone_no}}
          </span>
          </p>
        </a-col>
      </a-row>
      <a-row v-if="isUserModerator">
        <a-col :xs='24' :md="12">
          <a-table ref="table" :pagination="false" :columns="columns" :data-source="data">
          </a-table>
        </a-col>
      </a-row>
      <a-row v-if="isUserModerator" class="mt-1">
        <p v-if="isLoggedIn">
          Send Chat Request
        </p>
        <a-button v-else type="primary" class='mt-1' @click="$router.push(localePath('/sign-in'))">
          Sign in to chat with {{user.user_first_name}}
        </a-button>
      </a-row>
    </a-col>
  </a-row>
  <RequestModal ref="rmodal"></RequestModal>
</div>
</template>

<script>
import RequestModal from '~/components/RequestModal'
import authMixin from "~/mixins/authMixin";
import dateMixin from '~/mixins/dateMixin'
export default {
  name: "Uuid",
  components: {
    RequestModal,
  },
  mixins: [authMixin, dateMixin],
  data: ()=>({
    loading: true,
    not_found: false,
    user: {},
    columns: [
      {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        slots: { title: 'Category' },
      },
      {
        title: 'NPI',
        dataIndex: 'npi',
        key: 'npi',
        slots: { title: 'NPI' },
        scopedSlots: { customRender: 'npi' },
      },
    ],
    data: [],
  }),
  computed: {
    exists(){
      return this.user && this.user.usro_key
    },
    role(){
      if (this.exists){
        return this.user.usro_key
      }else{
        return ''
      }
    },
    isUserModerator(){
      return this.role === 'MODERATOR'
    }
  },
  mounted(){
    const q = this.$route.params
    if (q && q.uuid){
      this.$api.get('/user/' + q.uuid).then(({data})=>{
        this.loading = false
        if (data && data.user_uuid){
          this.user = data
          this.data = [
            {
              category: data.cate_category || '',
              npi: data.profe_npi || '',
            }
          ]
        }else {
          this.not_found = false
        }
      }).catch((err)=>{
        this.not_found = true
        this.$refs.rmodal.$emit('error',err)
      }).finally(()=>{
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
