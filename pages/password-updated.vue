<template>
<div>
  <a-row>
    <a-col class="pa-1">
      <p class="h1">{{$t('pwd_updated_suc')}}</p>
      <p>
        <nuxt-link :to="localePath('/welcome')">
          <a-icon type="home"></a-icon>
          {{$t('go_home')}}</nuxt-link>
      </p>
    </a-col>
  </a-row>
</div>
</template>

<script>
export default {
  name: "PasswordUpdated",
  head() {
    return {
      title: this.$t('pwd_updated'),
    }
  },
}
</script>
