<template>
  <div>
    <ChatItem v-for='(m,i) in moderators' :key='"chat-" + i' :class="chatItemClass(m)" :active='to === m.user_uuid' @click="$emit('open-chat', m.user_uuid)">
      {{ m.user_first_name }} {{ m.user_last_name }}
      <div v-if="isModerator && !m.mypr_allowed" class="ml-1">
        <a-icon type="alert" style='color: tomato;'></a-icon>
      </div>
      <div v-if="m.messages">
        <a-badge :count="m.messages" class="ml-1" :number-style="{
                    backgroundColor: 'tomato',
                    color: '#fff',
                    boxShadow: '0 0 0 1px #eee inset',
                    }"
        />
      </div>
    </ChatItem>
  </div>
</template>

<script>
import ChatItem from "~/components/ChatItem";
import userRoleMixin from "~/mixins/userRoleMixin";

export default {
  name: "ChatItems",
  components: {
    ChatItem,
  },
  mixins: [userRoleMixin],
  props: {
    data: {
      type: Array,
      default: ()=>[],
    },
    selectedChat: {
      type: String,
      default: '',
    }
  },
  computed: {
    to (){
      return this.$props.selectedChat
    },
    moderators(){
      return this.$props.data
    }
  },
  methods: {
    chatItemClass(m){
      const c = []
      if (this.isModerator && !m.mypr_allowed){
        c.push('not-allowed')
      }
      return c.join(' ')
    }
  }
}
</script>

<style scoped lang="sass">
.not-allowed
  background-color: $mdn-super-light-grey
  color: $mdn-light-grey
</style>
