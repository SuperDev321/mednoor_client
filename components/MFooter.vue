<template>
  <div class="m-footer">
    <a-row>
      <a-col>
        <p class="text-center">
          <nuxt-link :to="localePath('/privacy-policy')">{{$t('privacy_p')}}</nuxt-link>
          -
          <nuxt-link :to="localePath('/terms-and-conditions')">{{$t('terms_cond')}}</nuxt-link>
        </p>
        <p class="text-center">Mednoor © {{year}}</p>
      </a-col>
    </a-row>
    <a-row>
      <a-col class="mb-1">
        <flags-picker dark></flags-picker>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import FlagsPicker from '~/components/FlagsPicker'
export default {
  name: 'MFooter',
  components: { FlagsPicker },
  data: ()=>({
    year: '',
  }),
  mounted(){
    this.year = new Date().getFullYear()  // returns the current year
  },
}
</script>
<style scoped lang='sass'>
.m-footer
  padding: 1rem
  background: #475cff
  color: #FFF !important
  a
    color: #FFF !important
    text-decoration: underline

</style>
