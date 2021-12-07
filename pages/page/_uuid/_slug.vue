<template>
  <div class='pa-1 mh-100v bg-eee'>
    <a-row>
      <a-col :xs='24' :md='{span: 16, offset: 4}' class="content">
        <a-skeleton v-if='loading' />
        <div v-else-if='not_found'>
          <p class='h1 text-center'>
            {{ $t('not_found') }}
          </p>
          <p class='text-center'>
            {{ $t('post_nf_del') }}
          </p>
          <p class='text-center'>
            <nuxt-link :to='localePath("/")'>
              {{ $t('home') }}
            </nuxt-link>
          </p>
        </div>
        <div v-else>
          <main>
            <h1 class='ml-0 pl-0'>{{ data.page_title }}</h1>
            <p class='mb-0 d-flex text-muted mt-1 mb-1'>
              <span class='mr-auto d-flex'>{{ $t('pub_date') }}: {{ dateStringDate(data.page_createdAt) }}</span>
              <span v-if='data.page_createdAt !== data.page_updated_at' class='ml-auto d-flex'>{{ $t('last_pdate') }}: {{ dateStringDate(data.page_updated_at) }}</span>
            </p>
            <hr class="mb-1">
            <!-- eslint-disable vue/no-v-html -->
            <pre v-html='data.page_content'></pre>
            <!--eslint-enable-->
            <p class='text-muted'>
              {{ $t('share') }}
            </p>
            <div class='share-links'>
              <a :href='shareTwitter' target='_blank'>
                <a-icon type='twitter' />
              </a>
              <a :href='shareFb' target='_blank'>
                <a-icon type='facebook' />
              </a>
              <a :href='shareLd' target='_blank'>
                <a-icon type='linkedin' />
              </a>
            </div>
          </main>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import dateMixin from '~/mixins/dateMixin'

export default {
  mixins: [dateMixin],
  data() {
    return {
      title: '',
      uuid: null,
      loading: true,
      not_found: false,
      data: {}
    }
  },
  head() {
    return {
      title: this.data.page_title ? this.data.page_title : '',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.data.page_content ? this.data.page_content.replace(/<[^>]*>?/gm, '').substr(0, 200) + '...' : ''
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: this.data.page_keywords ? this.data.page_keywords : ''
        }
      ]
    }
  },
  computed: {
    url() {
      return process.env.BASE_URL + '/page/' + this.uuid
    },
    shareTwitter() {
      return 'https://twitter.com/intent/tweet?text=' + this.url
    },
    shareFb() {
      return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.url)
    },
    shareLd() {
      return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(this.url)
    }
  },
  mounted() {
    this.uuid = this.$route.params.uuid
    this.loading = true

    this.$api.get('/page/' + this.uuid).then(({ data }) => {
      this.loading = false
      this.data = data
    }).catch(() => {
      this.uuid = null
      this.not_found = true
      this.loading = false
    })
  },
  methods: {}
}
</script>
<style scoped lang="sass">
.content
  background-color: #fff
  border: 1px solid #eee
  padding: 1rem

</style>
