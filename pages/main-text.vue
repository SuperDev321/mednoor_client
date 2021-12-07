<template>
  <div class="pa-1 mh-100v">
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>Main Text</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col>
        <p class="h1">
          Main Text
        </p>
        <p>
          Text that is shown in the middle of the image of the sign in / sign up pages.
        </p>
        <a-skeleton v-if="loading"></a-skeleton>
        <a-form v-else :form="form" @submit="handleSubmit">
          <a-form-item>
            <a-textarea v-decorator="[
                'text',
                {
                  rules: [
                    { required: true, message: 'This field is required' },
                    {max: 500, message: $t('v.max_500')}
                  ]
                },
              ]" placeholder="Enter the text here."></a-textarea>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">
              <SpinOrText v-model="saving">Save</SpinOrText>
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <request-modal ref="rmodal"></request-modal>
  </div>
</template>

<script>
import SpinOrText from '~/components/SpinOrText'
import RequestModal from '~/components/RequestModal'
export default {
  name: "MainText",
  components: {
    SpinOrText,
    RequestModal
  },
  layout: 'dashboard',
  middleware: ['authenticated', 'verified', 'not-blocked', 'not-deleted', 'admin-or-super'],
  data() {
    return {
      saving: false,
      form: this.$form.createForm(this),
      loading: true,
    }
  },
  mounted() {
    this.$api.get('/main-text').then(({data})=>{
      this.loading = false
      this.$nextTick(()=>{
        if (data && data.mate_text){
          this.form.setFieldsValue({
            text: data.mate_text
          })
        }
      })
    }).finally(() => {
      this.loading = false
    })
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        console.log(values)
        if (err) {
          return console.log(err)
        }
        this.saving = true
        this.$api.post('/main-text', values).then(()=>{
          this.$toast.success('Main text has been updated successfully')
        }).catch((err)=>{
          this.$refs.rmodal.$emit('error', err)
        }).finally(() => {
          this.saving = false
        })
      })
    }
  }
}
</script>

<style scoped lang="sass">

</style>
