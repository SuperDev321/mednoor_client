<template>
  <div class='pa-1 mh-100v'>
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/pages')">{{ $t('pages') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('new_page') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col>
        <p class='h1'>
          {{ $t('new_page') }}
        </p>
        <a-skeleton v-if='loading'></a-skeleton>
        <a-form v-else :form='form' size='small' @submit='handleSubmit'>
          <a-form-item>
            <a-input v-decorator="
                            [
                                'title',
                                {
                                    rules: [
                                    {required: true, message: $t('v.title_req')},
                                    {min: 3, message: $t('v.min_3')}
                                    ]
                                }
                            ]" :placeholder="$t('title')">
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="
                            [
                                'slug',
                                {
                                    rules: [{max: 330, message: $t('v.max_330')}]
                                }
                            ]" :placeholder="$t('slug_p')">
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="
                            [
                                'keywords',
                                {
                                    rules: [{max: 330, message: $t('v.max_330')}]
                                }
                            ]" :placeholder="$t('keywords_p')">
            </a-input>
          </a-form-item>
          <a-form-item>
            <t-editor ref='editor' v-model='txt' :enable-h1='false'></t-editor>
          </a-form-item>
          <a-form-item class='mt-3'>
            <a-button type='primary' html-type='submit'>
              <SpinOrText v-model='loadingCreate'>
                                <span v-if='uuid'>
                                    {{ $t('update') }}
                                </span>
                <span v-else>
                                    {{ $t('create_new_page') }}
                                </span>
              </SpinOrText>
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <RequestModal ref='rmodal' />
  </div>
</template>
<script>
import TEditor from '~/components/TEditor.vue'
import SpinOrText from '~/components/SpinOrText'
import RequestModal from '~/components/RequestModal'

export default {
  components: {
    TEditor,
    SpinOrText,
    RequestModal
  },
  layout: 'dashboard',
  data() {
    return {
      form: this.$form.createForm(this, { name: 'coordinated' }),
      loadingCreate: false,
      txt: '',
      uuid: null,
      loading: true
    }
  },
  head(){
    return {
      title: this.$t('new_page')
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.page) {
      this.loading = true
      this.uuid = this.$route.query.page
      this.$api.get('/page/' + this.uuid).then(({ data }) => {
        this.loading = false
        if (data) {
          this.$nextTick(() => {
            this.form.setFieldsValue({
              title: data.page_title,
              slug: data.page_slug,
              keywords: data.page_keywords
            })
            this.$refs.editor.editor.commands.setContent(data.page_content)
          })
        } else {
          this.uuid = null
        }

      }).catch(() => {
        this.uuid = null
        this.$refs.rmodal.$emit('error', this.$t('page_does_not_exist'))
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) {
          return false
        }
        this.loadingCreate = true
        values.txt = this.txt
        if (this.uuid) {
          this.$api.put('/page/' + this.uuid, values).then(() => {
            this.$toast.success(this.$t('page_hb_updated').toString())
          }).catch(() => {
            this.$refs.rmodal.$emit('error', err)
          }).finally(() => {
            this.loadingCreate = false
          })
        } else {
          this.$api.post('/page/', values).then(() => {
            this.$toast.success(this.$t('page_hb_created').toString())
            this.$router.push(this.localePath('/pages'))
          }).catch((err) => {
            this.$refs.rmodal.$emit('error', err)
          }).finally(() => {
            this.loadingCreate = false
          })
        }
      })
    }
  }
}
</script>
