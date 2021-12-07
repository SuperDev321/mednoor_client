<template>
<a-row>
  <a-col>
    <h1>{{$t('unauthorized')}}</h1>
    <p>{{$t('yornt_auth')}}</p>
    <nuxt-link :to="localePath('/')">
      {{$t('home')}}
    </nuxt-link>
  </a-col>
</a-row>
</template>

<script>
export default {
  name: 'Unauthorized',
    head() {
    return {
      title: this.$t('unauthorized'),
    }
  },
}
</script>
