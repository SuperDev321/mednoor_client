<template>
  <a-row>
    <a-col>
      <p class='h1 text-center'>{{$t('blocked_legend')}}</p>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'Blocked',
  middleware: ['authenticated', 'blocked-only'],
  head() {
    return {
      title: this.$t('acc_blocked'),
    }
  },
}
</script>

<style scoped>

</style>
