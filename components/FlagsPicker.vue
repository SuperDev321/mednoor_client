<template>
  <div :class="computedClass">
    <div v-for='(f, i) in $i18n.locales' :key='i' class='flag' @click='locale(f.code)'>
      <small>{{f.name}}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlagsPicker',
  props: {
    dark: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    computedClass() {
      const c = ['flags-picker']
      if (this.$props.dark){
        c.push('dark')
      }
      return c.join(' ')
    }
  },
  methods: {
    locale(code){
      this.$i18n.setLocale(code)
    }
  }
}
</script>

<style scoped lang='sass'>
.flags-picker
  display: flex
  justify-content: center
  align-items: center
  .flag
    color: $mdn-primary
    &:hover
      cursor: pointer
  div
    margin-right: 0.6rem
    margin-left: 0.6rem
  img
    &:hover
      cursor: pointer
.flags-picker.dark
  .flag
    color: white
</style>
