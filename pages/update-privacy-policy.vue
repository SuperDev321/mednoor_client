<template>
  <div class='pa-1 mh-100v'>
    <a-row class='mb-1'>
      <a-col>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <nuxt-link :to="localePath('/dashboard')">{{ $t('dashboard') }}</nuxt-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ $t('update_pp') }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-col>
    </a-row>
    <a-row>
      <a-col :xs='24'>
        <p class='h1'>
          {{ $t('update_pp') }}
        </p>
        <a-skeleton v-if='loading'></a-skeleton>
        <div v-else>
          <client-only>
            <t-editor ref='editor' v-model='txt'></t-editor>
          </client-only>
          <a-button class='mt-1' type='primary' @click='update'>
            <spin-or-text v-model='loadingBtn'>
              {{ $t('update_pp') }}
            </spin-or-text>
          </a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import SpinOrText from '~/components/SpinOrText.vue'
import TEditor from '~/components/TEditor'
import vmodelMixin from '~/mixins/vmodelMixin'

export default {
  components: {
    TEditor,
    SpinOrText
  },
  mixins: [vmodelMixin],
  layout: 'dashboard',
  data() {
    return {
      loadingBtn: false,
      txt: '',
      loading: true
    }
  },
  head(){
    return {
      title: this.$t('update_pp')
    }
  },
  mounted() {
    this.$api.get('/content/privacy-policy').then(({ data }) => {
      this.loading = false
      this.$nextTick(() => {
        if (data && data.prpo_text) {
          const t = data.prpo_text
          this.$refs.editor.editor.commands.setContent(t)
        }
      })
    }).finally(() => {
      setTimeout(() => {
        this.loading = false
      }, 600)
    })
  },
  methods: {
    update() {
      this.loadingBtn = true
      this.$api.put('/content/privacy-policy', {
        txt: this.txt
      }).then(() => {
        this.$toast.success(this.$t('cont_hb_up').toString())
      }).catch(() => {
        this.$toast.error(this.$t('thw_tyl').toString())
      }).finally(() => {
        this.loadingBtn = false
      })
    }
  }
}
</script>
