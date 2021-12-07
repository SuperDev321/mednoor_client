<template>
  <a-row>
    <a-col>
      <p class='h1 text-center'>{{$t('usr_del')}}</p>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'Blocked',
  middleware: ['authenticated', 'deleted-only'],
  head() {
    return {
      title: this.$t('acc_del'),
    }
  },
}
</script>
