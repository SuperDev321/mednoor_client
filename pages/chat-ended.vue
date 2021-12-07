<template>
  <a-row class='pa-1 mh-100v'>
    <a-col>
      <p class="h1">
        {{$t('chat_ended')}}
      </p>
      <p>
        {{$t('chat_p1')}} <nuxt-link :to="localePath('/my-chats')">{{$t('chat_p2')}}</nuxt-link>
        {{ $t('chat_p3') }}
      </p>
      <p>
        {{$t('chat_a1')}} <nuxt-link :to="localePath('/')">{{$t('chats_list')}}</nuxt-link>
      </p>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'ChatEnded',
  head() {
    return {
      title: this.$t('chat_ended'),
    }
  },
}
</script>
