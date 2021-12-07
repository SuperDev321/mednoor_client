<template>
<div></div>
</template>

<script>

export default {
  layout: 'chat',
  middleware: ['authenticated', 'verified'],
  head() {
    return {
      title: this.$t('home'),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('seo.index')
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: this.$t('seo.index')
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: this.$t('seo.keywords.index')
        }
      ]
    }
  },
}
</script>
