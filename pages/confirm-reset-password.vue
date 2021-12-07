<template>
  <div>
    <div>
      <a-row>
        <a-col class='mt-1' :xs='{span: 20, offset: 2}' :md='{span: 12, offset: 6}' :lg='{span: 10, offset: 7}' :xl='{span: 8, offset: 8}'>
          <a-card>
            <h1 class='text-center'>{{$t('reset_pwd')}}</h1>
            <p class='text-center'>
              <b>{{email}}</b><br>
              {{$t('reset_y_pwd')}}
            </p>
            <a-form :form='form' size='small' @submit='handleSubmit'>
              <a-row>
                <a-col :xs='{span: 24}'>
                  <a-form-item :label="$t('pwd')">
                    <a-input v-decorator="
              [
                'password',
                {
                rules: [
                  {required: true, message: $t('v.pwd_req')},
                  {min: 6, message: $t('v.min_6')}
                ]
                }
              ]" :placeholder="$t('pwd')" type='password'>
                      <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
                    </a-input>
                  </a-form-item>
                </a-col>
                <a-col :xs='{span: 24}'>
                  <a-form-item :label="$t('cpwd')">
                    <a-input v-decorator="
              [
                'confirm_password',
                {
                rules: [
                  {required: true, message: $t('v.cpwd_req')},
                  {min: 6, message: $t('v.min_6')}
                  ]
                }
              ]" :placeholder="$t('v.cpwd_req')" type='password'>
                      <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
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
  name: 'ConfirmResetPassword',
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
    }
  },
  head() {
    return {
      title: this.$t('v.c_pwd_res'),
    }
  },
  computed: {
    email(){
      return this.$store.state.email
    },
    code(){
      return this.$store.state.code
    },
  },
  mounted(){
    if (!this.email || !this.code){
      this.$router.push(this.localePath('/forgot-password'))
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields( (err, values) => {
          if (!err) {
            this.loading = true
            this.$api.patch('/user/password', {
              email: this.email,
              code: this.code,
              password: values.password,
              confirm_password: values.confirm_password,
            }).then(() =>{
              this.$auth
                .loginWith('local', {
                  data: {
                    email: this.email,
                    password: values.password,
                  },
                })
                .then(() => {
                  this.$router.push(this.localePath('/'))
                })
                .catch((e) => {
                  this.$router.push(this.localePath('/sign-in'))
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
