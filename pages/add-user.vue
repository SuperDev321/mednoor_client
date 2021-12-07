<template>
  <div class='pa-1'>
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/users-list')">{{ $t('list_usrs') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('add_urs') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row class='pa-1 mh-100v'>
      <a-col :xs='{ span: 20, offset: 2 }'
             :md='{ span: 12, offset: 6 }'
             :lg='{ span: 10, offset: 7 }'
             :xl='{ span: 8, offset: 8 }'>
        <p class='h1 text-center'>{{ $t('add_urs') }}</p>
        <a-form :form='form' size='small' @submit='handleSubmit'>
          <a-form-item>
            <a-input
              v-decorator="[
              'email',
              {
                rules: [
                  { required: true, message: $t('v.email_req') },
                  {max: 150, message: $t('v.max_email_150')},
                  {type: 'email', message: $t('v.inv_email')}
                ],
              },
            ]"
              :placeholder="$t('email')"
            />
          </a-form-item>
          <a-row>
            <a-col :xs='{span: 24}' :md='{span: 11}'>
              <a-form-item>
                <a-input v-decorator="
                [
                  'first_name',
                  {
                  rules: [{required: true, message: $t('v.fn_req')},
                  {min: 3, message: $t('v.min_3')},
                  {max: 30, message: $t('v.max_30')}],
                  }
                ]" :placeholder="$t('fn')">
                  <a-icon slot='prefix' type='user' style='color:rgba(0,0,0,.25)' />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :xs='{span: 24}' :md='{span: 11, offset: 2}'>
              <a-form-item>
                <a-input v-decorator="
                [
                  'last_name',
                  {
                  rules: [
                    {required: true, message: $t('v.ln_req')},
                    {min: 3, message: $t('v.min_3')},
                    {max: 30, message: $t('v.max_30')}
                    ]
                  }
                ]" :placeholder="$t('ln')">
                  <a-icon slot='prefix' type='user' style='color:rgba(0,0,0,.25)' />
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item>
            <a-input v-model='date' placeholder='MM-DD-YYYY'>
              <a-icon slot='prefix' type='calendar' style='color:rgba(0,0,0,.25)' />
            </a-input>
          </a-form-item>
          <a-row>
            <a-col :xs='{span: 24}' :md='{span: 11}'>
              <a-form-item>
                <a-input v-decorator="
                [
                  'password',
                  {
                  rules: [
                    {required: true, message: $t('v.pw_req')},
                    {min: 6, message: $t('v.min_6')}
                  ]
                  }
                ]" :placeholder="$t('pwd')" type='password'>
                  <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :xs='{span: 24}' :md='{span: 11, offset: 2}'>
              <a-form-item>
                <a-input v-decorator="
                [
                  'confirm_password',
                  {
                  rules: [
                    {required: true, message: $t('v.cpwd_req')},
                    {min: 6, message: $t('v.min_6')}
                    ]
                  }
                ]" :placeholder="$t('cpwd')" type='password'>
                  <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item>
            <a-button type='primary' html-type='submit' block>
              <SpinOrText v-model='loading'>{{$t('add_urs')}}</SpinOrText>
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
      <RequestModal ref='rmodal'></RequestModal>
    </a-row>
  </div>
</template>

<script>
import SpinOrText from '~/components/SpinOrText'
import formMixin from '~/mixins/formMixin'
import RequestModal from '~/components/RequestModal'

export default {
  name: 'AddUser',
  components: {
    SpinOrText,
    RequestModal
  },
  mixins: [formMixin],
  layout: 'dashboard',
  middleware: ['authenticated', 'not-blocked', 'not-deleted'],
  data() {
    return {
      loading: false
    }
  },
  head() {
    return {
      title: this.$t('add_urs'),
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: 'description',
          name: 'description',
          content: this.$t('seo.add_user')
        }
      ]
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          values.dob = [this.year, this.month, this.day].join('-')
          this.$api
            .post('/user', values)
            .then(() => {
              this.$router.push(this.localePath('/users-list'))
            })
            .catch((e) => {
              this.$refs.rmodal.$emit('error', e)
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  },
}
</script>
