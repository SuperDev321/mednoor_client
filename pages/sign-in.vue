<template>
  <div>
      <a-row>
          <a-col class="pa-1 mt-3" :xs="24" :sm="24" :md="{span: 20, offset: 2}" :lg="{span: 16, offset: 4}">
            <a-card>
              <div class="mednoor-heading-svg">
                <img :src='require("~/static/logo.jpg")' height="40px" />
                <div>
                <p class='h3 text-center'>
                  {{$t('med_med_cen')}}
                </p>
                <small class="h5 fw-b text-center d-block">
                  {{$t('alw_open')}}
                </small>
                </div>
              </div>
              <a-form :form='form' size='small' @submit='handleSubmit'>
                <a-form-item>
                  <a-input
                    v-decorator="[
                'email',
                {
                  rules: [{ required: true, message: $t('v.email_req') },
                  {max: 150, message: $t('v.max_email_150')},
                  {type: 'email', message: $t('v.inv_email')}],
                },
              ]"
                    :placeholder="$t('email')"
                  />
                </a-form-item>
                <a-form-item >
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
                <a-form-item>
                  <a-button type='primary' html-type='submit' block>
                    <SpinOrText v-model='loading'>{{$t('sign_in')}}</SpinOrText>
                  </a-button>
                </a-form-item>
                <div>
                  <small class="text-center d-block mb-0">
                    <nuxt-link :to="localePath('/forgot-password')">{{$t('forgot_pwd')}}</nuxt-link>
                  </small>
                  <hr>
                  <small class='text-center d-block mb-0'>
                    {{$t('dont_h_acc')}}
                  </small>
                  <small class='text-center d-block'>
                    <nuxt-link :to="localePath('/sign-up')">{{$t('sign_up')}}</nuxt-link>
                  </small>
                </div>
              </a-form>
            </a-card>
          </a-col>
      </a-row>
    <RequestModal ref='rmodal'></RequestModal>
  </div>
</template>

<script>
import RequestModal from '~/components/RequestModal'
import SpinOrText from '~/components/SpinOrText'
import breakpoints from '~/mixins/breakpoints'

export default {
  components: {
    RequestModal,
    SpinOrText
  },
  mixins: [breakpoints],
  layout: 'home',
  middleware: ['unauthenticated'],
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      loading: false,
      file: '',
    }
  },
  head() {
    return {
      title: this.$t('sign_in'),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('seo.sign_in')
        }
      ]
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()

      this.form.validateFields(async (err, values) => {
          if (!err) {
            this.loading = true
            try {
              await this.$auth
                .loginWith('local', {
                  data: {
                    email: values.email,
                    password: values.password
                  }
                })
                .then(() => {
                  this.$router.push(this.localePath('/welcome'))
                  console.log('Success')
                })
                .catch((e) => {
                  this.$refs.rmodal.$emit('error', e)
                }).finally(()=>{
                  this.loading = false
                })
            } catch (e) {
              this.$refs.rmodal.$emit('error', e)
            }finally {
              this.loading = false
            }
          }
        }
      )
    },
  }
}
</script>
<style scoped lang="sass">
  .mednoor-heading-svg
    display: flex
    justify-content: center
    align-items: center
    background: #fff
    margin-bottom: 9px
    img
      margin-right: 6px
</style>
