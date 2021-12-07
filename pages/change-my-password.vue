<template>
  <div class="mh-100v">
    <a-row>
      <a-col class='mt-1' :xs='{span: 20, offset: 2}' :md='{span: 14, offset: 6}' :lg='{span: 8, offset: 8}'>
        <a-card>
          <h1 class='h1 text-center'>{{$t('change_pwd')}}</h1>
          <a-form :form='form' size='small' @submit='handleSubmit'>
            <a-form-item :label="$t('old_pwd')">
              <a-input v-decorator="
              [
                'old_password',
                {
                rules: [
                  {required: true, message: $t('v.pwd_req')},
                  {min: 6, message: $t('v.min_6')}
                ]
                }
              ]" :placeholder="$t('new_pwd')" type='password'>
                <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
              </a-input>
            </a-form-item>
            <a-row>
              <a-col :xs="12" :sm="12" :md="12">
                <a-form-item :label="$t('new_pwd')">
                  <a-input v-decorator="
              [
                'new_password',
                {
                rules: [
                  {required: true, message: $t('v.pwd_req')},
                  {min: 6, message: $t('v.min_6')}
                ]
                }
              ]" :placeholder="$t('new_pwd')" type='password'>
                    <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :xs="12" :sm="12" :md="12">
                <a-form-item :label="$t('v.c_npwd')">
                  <a-input v-decorator="
              [
                'confirm_new_password',
                {
                rules: [
                  {required: true, message: $t('v.pwd_req')},
                  {min: 6, message: $t('v.min_6')}
                ]
                }
              ]" :placeholder="$t('v.c_npwd')" type='password'>
                    <a-icon slot='prefix' type='lock' style='color:rgba(0,0,0,.25)' />
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <a-button type='primary' html-type='submit' block>
                <SpinOrText v-model='loading'>{{$t('change_pwd')}}</SpinOrText>
              </a-button>
            </a-form-item>
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
export default {
  components: {
    RequestModal,
    SpinOrText
  },
  middleware: ['authenticated'],
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      loading: false
    }
  },
  head() {
    return {
      title: this.$t('change_pwd'),
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields( (err, values) => {
          if (!err) {
            this.loading = true
            this.$api.post('/user/change-password', {
              old_password: values.old_password,
              password: values.new_password,
              confirm_password: values.confirm_new_password,
            }).then(()=>{
              this.$router.push(this.localePath('/password-updated'))
            }).catch((e)=>{
              this.$refs.rmodal.$emit('error', e)
            }).finally(()=>{
              this.loading = false
            })
          }
        }
      )
    },
  }
}
</script>
