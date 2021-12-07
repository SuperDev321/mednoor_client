<template>
  <div v-if="localValue" class="typing-indicator">
    <div class="typing-wrapper">
      <div>
        {{ $t('typing') }}
      </div>
      <div class="snippet" data-title=".dot-typing">
        <div class="stage">
          <div class="dot-typing"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vmodelMixin from '~/mixins/vmodelMixin'
export default {
  name: 'TypingIndicator',
  mixins: [vmodelMixin],
}
</script>

<style scoped lang='sass'>
.typing-indicator
  right: 0
  width: 100% !important
  background: #fff
  position: fixed
  bottom: 50px
  left: 0
  z-index: 202
  color: $mdn-super-light-grey
  padding: 1rem
  .typing-wrapper
    display: flex
    justify-content: center
    align-item: center
    width: 100px
    > div:first-of-type
      margin-right: 16px
    > div
      display: flex
      justify-content: center
      align-items: center
      flex: 1

.dot-typing
  position: relative
  left: -9999px
  width: 5px
  height: 5px
  border-radius: 5px
  background-color: $mdn-super-light-grey
  color: $mdn-super-light-grey
  box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey
  animation: dotTyping 1s infinite linear

  @keyframes dotTyping
    0%
      box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey
    16.667%
      box-shadow: 9984px -10px 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey
    33.333%
      box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey
    50%
      box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px -10px 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey
    66.667%
      box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey
    83.333%
      box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px -10px 0 0 $mdn-super-light-grey
    100%
      box-shadow: 9984px 0 0 0 $mdn-super-light-grey, 9999px 0 0 0 $mdn-super-light-grey, 10014px 0 0 0 $mdn-super-light-grey


</style>
