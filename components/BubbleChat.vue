<template>
  <div class='floating-chat'>
    <div class='bubble' @click='openChat'>
      <img :src="require('~/static/chat-c.png')" alt='chat icon'>
    </div>
    <div v-if='chatOpened' class='chat-box'>
      <div class='chat-box-header'>
        <div class='content'>
          {{ adminName }}
        </div>
        <div class='close' @click='chatOpened = false'>
          <a-icon type='close'></a-icon>
        </div>
      </div>
      <div ref="messages" class='chat-box-body'>
        <chat-messages :messages='messages'></chat-messages>
        <div style='position:relative !important'>
          <typing-indicator v-model='isTyping'></typing-indicator>
        </div>
      </div>
      <div class='chat-box-controls'>
        <div class="chat-input">
          <a-input v-model="message" placeholder="Type a message here" type='text' @keyup.enter="sendMessage"/>
        </div>
        <div class="chat-controls">
          <img :src="require('~/static/icon/send.svg')" alt='send icon' @click='sendMessage'>
        </div>
      </div>
    </div>
    <a-modal
      title="What is your name?"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-input v-model="name" placeholder="Example: John Doe" :max-length="30"></a-input>
    </a-modal>
    <request-modal ref='rmodal'></request-modal>
  </div>
</template>

<script>
import TypingIndicator from '~/components/TypingIndicator'
import ChatMessages from '~/components/ChatMessages'
import chatMixin from "~/mixins/chatMixin";
import RequestModal from "~/components/RequestModal";
import listenMixin from "~/mixins/listenMixin";

export default {
  name: "BubbleChat",
  components: {
    RequestModal,
    TypingIndicator,
    ChatMessages,
  },
  mixins: [chatMixin, listenMixin],
  data(){
    return {
      adminName: 'Admin',
      visible: false,
      confirmLoading: false,
      messages: [],
      chatOpened: false,
      isTyping: false,
      name: '',
    }
  },
  computed: {
    guestId(){
      const tmp = this.$cookies.get('temporalUser')
      if (tmp){
        return tmp.user_uuid
      }else{
        return null
      }
    }
  },
  mounted(){
    if (this.guestId){
      this.$api.get('/conversation/guest/' + this.guestId).then(({data})=>{
        if (data){
          this.messages = data
        }
        this.scrollMessagesSection()
      })
    }
  },
  created() {
    this.$api.get('/user/admin').then(({data})=>{
      if (data && data.user_uuid){
        this.to = data.user_uuid
        this.adminName = data.name
      }
    })
  },
  methods: {
    sendMessage(){
      if (!this.to){
        this.$toast.error('The administrator is not available. Try again later')
        return 0
      }
      if (this.message && this.message.length > 0) {
        const date = new Date()
        this.socket.emit('send-message', {
          from: this.guestId,
          to: this.to,
          message: this.message,
          mess_date: date,
        })
        this.messages.push({
          from: this.guestId,
          owner: true,
          message: this.message,
          mess_date: date,
        })
        this.message = ''
      }
      this.scrollMessagesSection()
    },
    handleOk(){
      if (this.name.length <= 0){
        this.$refs.rmodal.$emit('error', 'The name is required.')
        return 0
      }
      if (this.name.length > 30){
        this.$refs.rmodal.$emit('error', this.$t('v.max_30'))
        return 0
      }
      if (this.name.split(' ').length < 2){
        this.$refs.rmodal.$emit('error', 'Enter your first name and last name')
        return 0
      }
      this.confirmLoading = true
      this.$api.post('/user/tmp', {
        first_name: this.name,
      }).then(({data})=>{
        console.log('Temporal user is --->', data)
        this.$cookies.set('temporalUser', data)
        this.visible = false
        this.run_once(this.listen)
      }).finally(()=>{
        this.confirmLoading = false
      })
    },
    handleCancel(){
      this.visible = false
    },
    openChat () {
      this.temporalUser = this.$cookies.get('temporalUser')
      if (!this.temporalUser){
        this.visible = true
      }else{
        this.run_once(this.listen)
      }
      this.chatOpened = true
      this.$nextTick(()=>{
        this.scrollMessagesSection()
      })
      if (this.messages.length <= 0){
        this.isTyping = true
        setTimeout(()=>{
          this.messages.push({
            owner: false,
            message: 'Hello. Im the administrator of this website.',
            mess_date: new Date(),
          })
          this.playNotification()
          this.isTyping = false
          setTimeout(() => {
            this.isTyping = true
          }, 100)
          setTimeout(() => {
            this.messages.push({
              owner: false,
              message: 'How may I help you?',
              mess_date: new Date(),
            })
            this.isTyping = false
            this.playNotification()
            this.scrollMessagesSection()
          }, 500)
        }, 1000)
      }
    }
  }
}
</script>

<style scoped lang="sass">

.floating-chat
  position: fixed
  bottom: 50px
  right: 50px
  z-index: 400
  .bubble
    width: 60px
    height: 60px
    border-radius: 50%
    background: transparent
    box-shadow: 3px 3px 6px #ccc
    &:hover
      cursor: pointer
    img
      max-width: 100%
      max-height: 100%
      min-width: 100%
  .chat-box
    width: 100vw
    height: 100vh
    background: #fff
    position: fixed
    bottom: 0
    right: 0
    top: 0
    left: 0
    box-shadow: 3px 3px 6px #ccc
    border: 1px solid #eee
    > div
      padding: 0.5rem
    .chat-box-header
      background-color: $mdn-primary
      color: #fff
      display: flex
      .content
        width: calc(100% - 30px)
      .close
        width: 30px
        &:hover
          cursor: pointer
    .chat-box-body
      background: #ffffff
      overflow-y: scroll
      height: 300px
    .chat-box-controls
      position: absolute
      display: flex
      bottom: 0
      left: 0
      right: 0
      input
        width: 100%
        height: 30px
      img
        width: 20px
        margin-left: 0.6rem

.typing-indicator
  bottom: 40px !important

@media screen and (min-width: $md)
  .chat-box
    width: 300px !important
    height: 390px !important
    position: fixed
    bottom: 50px !important
    right: 50px !important
    top: unset !important
    left: unset !important
    box-shadow: 3px 3px 6px #ccc
    border: 1px solid #eee
    > div
      padding: 0.5rem

  .typing-indicator
    left: unset !important
    right: 50px !important
    width: 250px !important
    bottom: 100px !important
</style>
