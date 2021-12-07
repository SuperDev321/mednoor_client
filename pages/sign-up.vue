<template>
  <div>
      <a-row>
          <a-col class="pa-1 mt-3" :xs="24" :sm="24" :md="{span: 20, offset: 2}" :lg="{span: 16, offset: 4}">
        <a-card>
          <h1 class="h1 text-center">{{$t('sign_up')}}</h1>
          <a-form :form="form" size="small" @submit="handleSubmit">
            <a-form-item>
              <a-input
                v-decorator="[
                  'email',
                  {
                    rules: [
                      { required: true, message: $t('v.email_req') },
                      { max: 150, message: $t('v.max_email_150') },
                      { type: 'email', message: $t('v.inv_email') }
                    ]
                  }
                ]"
                :placeholder="$t('email')"
              />
            </a-form-item>
            <a-row>
              <a-col :xs="{ span: 24 }" :md="{ span: 11 }">
                <a-form-item>
                  <a-input
                    v-decorator="[
                      'first_name',
                      {
                        rules: [
                          {
                            required: true,
                            message: $t('v.fn_req')
                          },
                          { min: 3, message: $t('v.min_3') },
                          {
                            max: 30,
                            message: $t('v.max_30')
                          }
                        ]
                      }
                    ]"
                    :placeholder="$t('fn')"
                  >
                    <a-icon
                      slot="prefix"
                      type="user"
                      style="color: rgba(0, 0, 0, 0.25)"
                    />
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :xs="{ span: 24 }" :md="{ span: 11, offset: 2 }">
                <a-form-item>
                  <a-input
                    v-decorator="[
                      'last_name',
                      {
                        rules: [
                          { required: true, message: $t('v.ln_req') },
                          { min: 3, message: $t('v.min_3') },
                          {
                            max: 30,
                            message: $t('v.max_30')
                          }
                        ]
                      }
                    ]"
                    :placeholder="$t('ln')"
                  >
                    <a-icon
                      slot="prefix"
                      type="user"
                      style="color: rgba(0, 0, 0, 0.25)"
                    />
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <a-input v-model="date" placeholder="MM-DD-YYYY">
                <a-icon
                  slot="prefix"
                  type="calendar"
                  style="color: rgba(0, 0, 0, 0.25)"
                />
              </a-input>
            </a-form-item>
            <a-row>
              <a-col :xs="{ span: 24 }" :md="{ span: 11 }">
                <a-form-item>
                  <a-input
                    v-decorator="[
                      'password',
                      {
                        rules: [
                          { required: true, message: $t('v.pwd_req') },
                          { min: 6, message: $t('v.min_6') }
                        ]
                      }
                    ]"
                    :placeholder="$t('pwd')"
                    type="password"
                  >
                    <a-icon
                      slot="prefix"
                      type="lock"
                      style="color: rgba(0, 0, 0, 0.25)"
                    />
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :xs="{ span: 24 }" :md="{ span: 11, offset: 2 }">
                <a-form-item>
                  <a-input
                    v-decorator="[
                      'confirm_password',
                      {
                        rules: [
                          {
                            required: true,
                            message: $t('v.cpwd_req')
                          },
                          { min: 6, message: $t('v.min_6') }
                        ]
                      }
                    ]"
                    :placeholder="$t('cpwd')"
                    type="password"
                  >
                    <a-icon
                      slot="prefix"
                      type="lock"
                      style="color: rgba(0, 0, 0, 0.25)"
                    />
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-form-item>
                  <a-checkbox v-decorator="[
                      'terms_conditions',
                      {
                        rules: [

                          {
                            required: true,
                            message: $t('v.ym_agree')
                          },
                        ]
                      }
                    ]">
                      <small>{{$t('i_agree')}}</small>
                    </a-checkbox>
                  <small>
                    <a :href="localePath('/terms-and-conditions')" target="_blank">{{$t('terms_cond')}}</a>
                    &
                    <a :href="localePath('/privacy-policy')" target="_blank">{{$t('privacy')}}</a>
                  </small>
              </a-form-item>
            </a-row>
            <a-form-item>
              <a-button type="primary" html-type="submit" block>
                <SpinOrText v-model="loading">{{$t('sign_up')}}</SpinOrText>
              </a-button>
            </a-form-item>
            <div>
              <hr />
              <small class="text-center d-block mb-0">
                {{$t('alr_h_acc')}}
              </small>
              <small class="text-center d-block">
                <nuxt-link :to="localePath('/sign-in')">{{$t('sign_in')}}</nuxt-link>
              </small>
            </div>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
    <RequestModal ref="rmodal"></RequestModal>
  </div>
</template>

<script>
import RequestModal from '~/components/RequestModal'
import SpinOrText from '~/components/SpinOrText'
import formMixin from '~/mixins/formMixin'
export default {
  components: {
    RequestModal,
    SpinOrText
  },
  mixins: [formMixin],
  layout: 'home',
  middleware: ['unauthenticated'],
  data() {
    return {
      loading: false
    }
  },
  head() {
    return {
      title: this.$t('sign_up'),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('seo.sign_up')
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
            .then(async ({ data }) => {
              try {
                await this.$auth
                  .loginWith('local', {
                    data: {
                      email: values.email,
                      password: values.password
                    }
                  })
                  .then(() => {
                    // redirect
                  })
                  .catch((e) => {
                    this.$refs.rmodal.$emit('error', e)
                  })
              } catch (e) {
                this.$refs.rmodal.$emit('error', e)
              }
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
  }
}
</script>
