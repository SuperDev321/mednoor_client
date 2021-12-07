<template>
  <div class="pa-1 mh-100v">
    <div>
      <a-row>
        <a-col class='mt-1' :xs='{span: 20, offset: 2}' :md='{span: 12, offset: 6}' :lg='{span: 10, offset: 7}' :xl='{span: 8, offset: 8}'>
          <a-card>
            <h1 class='text-center'>{{$t('verify_email')}}</h1>
            <p class='text-center'>
              {{$t('ver_code_sent')}}
            </p>
            <a-form-item :label="$t('enter_ver_code')">
              <a-input v-model='code' :placeholder="$t('enter_ver_code')" :max-length='9'></a-input>
            </a-form-item>
            <a-button block type='primary' @click='verify'>
              <SpinOrText v-model='loading'>
                {{$t('very')}}
              </SpinOrText>
            </a-button>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <RequestModal ref='rmodal'></RequestModal>
  </div>
</template>

<script>
import RequestModal from '~/components/RequestModal'
import SpinOrText from '~/components/SpinOrText'
export default {
  name: 'VerifyEmail',
  components: {
    RequestModal,
    SpinOrText
  },
  middleware: ['authenticated', 'not-verified'],
  data: ()=>({
    loading: false,
    code: '',
  }),
  head() {
    return {
      title: this.$t('verify_email'),
    }
  },
  methods: {
    verify(){
      if(this.code && this.code.length === 9){
        this.loading = true
        this.$api.post('/user/verify', {
          code: this.code
        }).then(async () => {
          await this.$auth.fetchUser()
          await this.$router.push(this.localePath('/view-mode'))
        }).catch((e)=>{
          this.$refs.rmodal.$emit('error', e)
        }).finally(()=>{
          this.loading = false
        })
      }else{
        this.$refs.rmodal.$emit('error', this.$t('ent_ver_code'))
      }
    },
  }
}
</script>
