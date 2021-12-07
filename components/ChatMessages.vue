<template>
  <div>
    <div v-for='(msg, i) in msgs' :key="'msg-' + i" :ref="'msg-' + i" :class='messageClass(msg)'>
      <span v-if='msg'>
        {{ msg.message }}
      </span>
      <span v-if='msg.mess_message'>
        {{ msg.mess_message }}
      </span>
      <div v-if='msg && msg.file_name'>
        <span v-if='isImg(msg.file_name)'>
          <img :src='filePath(msg.file_name)' alt='chat-img' class='img-fluid'>
        </span>
        <span v-else>
          <a target='_blank' :href='filePath(msg.file_name)' :download='filePath(msg.file_name)'>
            {{ msg.file_title }}
          </a>
        </span>
      </div>
      <span v-if='msg.mimetype && msg.mimetype.includes("image")'>
        <img :src='msg.path' :alt='msg.originalName' class='img-fluid'>
      </span>
      <span v-else>
        <a target='_blank' :href='msg.path' :download='msg.path'>{{ msg.name }}</a>
      </span>
      <div class='chat-time'>
        {{ hour(msg.mess_date) }}
      </div>
    </div>
  </div>
</template>

<script>
import chatMixin from '~/mixins/chatMixin'

export default {
  name: 'ChatMessages',
  mixins: [chatMixin],
  props: {
    messages: {
      type: Array,
      default: () => ([])
    }
  },
  computed: {
    msgs (){
      return this.$props.messages
    }
  }
}
</script>

<style scoped>

</style>
