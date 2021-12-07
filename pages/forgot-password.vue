<template>
  <div>
    <div>
      <a-row>
        <a-col class='mt-1' :xs='{span: 20, offset: 2}' :md='{span: 12, offset: 6}' :lg='{span: 10, offset: 7}' :xl='{span: 8, offset: 8}'>
          <a-card>
            <h1 class='text-center'>{{$t('forgot_pwd')}}</h1>
            <p class='text-center'>
              {{$t('fpwd_desc')}}
            </p>
            <a-form :form='form' size='small' @submit='handleSubmit'>
              <a-form-item :label="$t('email')">
                <a-input v-decorator="['email',{
                    rules: [{ required: true, message: $t('v.email_req') },
                    {max: 150, message: $t('v.max_email_150')},
                    {type: 'email', message: $t('v.inv_email')}
                    ],
                  },
                  ]"
                  :placeholder="$t('email')"
                />
              </a-form-item>
              <a-button block type='primary' html-type='submit'>
                <SpinOrText v-model='loading'>
                  {{$t('send_email')}}
                </SpinOrText>
              </a-button>
            </a-form>
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
  name: 'ForgotPassword',
  auth: false,
  components: {
    RequestModal,
    SpinOrText
  },
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      loading: false,
      code: '',
    }
  },
    head() {
    return {
      title: this.$t('forgot_pwd'),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('reset_pwd_desc')
        }
      ]
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields( (err, values) => {
          if (!err) {
            this.loading = true
            this.$api.post('/user/forgot-password', {
              email: values.email,
            }).then(() =>{
              this.$store.commit('setEmail', values.email)
              this.$router.push({
                path: this.localePath('/reset-password'),
              })
            }).catch((err)=>{
              this.$refs.rmodal.$emit('error', err)
            }).finally(() =>{
              this.loading = false
            })
          }
        }
      )
    },

  }
}
</script>
