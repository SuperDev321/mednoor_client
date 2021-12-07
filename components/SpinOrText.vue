<template>
  <span v-if='localValue'>
    <a-spin :class='spinClassess'></a-spin>
  </span>
  <span v-else>
    <slot></slot>
  </span>
</template>

<script>
import vModelMixin from '~/mixins/vmodelMixin'
export default {
  name: 'SpinOrText',
  mixins: [vModelMixin],
  props: {
    dark: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    spinClassess(){
      const c = []
      if (this.$props.dark){
        c.push('dark-spin')
      }else{
        c.push('white-spin')
      }
      return c.join(" ")
    }
  }
}
</script>
