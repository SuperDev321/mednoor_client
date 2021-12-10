<template>
  <div>
    <navbar></navbar>
    <div id="app-content">
      <Nuxt></Nuxt>
    </div>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar'
import authMixin from '~/mixins/authMixin'
import listenMixin from '~/mixins/listenMixin'
import userUpdatedMixin from '~/mixins/userUpdatedMixin'
import chatMixin from '~/mixins/chatMixin'

export default {
  name: 'video chat',
  components: {
    Navbar,
  },
  mixins: [authMixin, listenMixin, userUpdatedMixin, chatMixin],
  data: ()=>({
    socket: null,
  }),
  watch:{
    isLoggedIn(loggedIn){
      if (loggedIn){
        this.run_once(this.listen)
      }else{
        this.socket = null
      }
    }
  },
  methods: {
    listen() {
      this.socket = this.$nuxtSocket({ persist: 'defaultSocket' })
      this.socket.emit('join-room', this.$auth.user.uuid)
      this.socket.on('fetch-user', async ()=>{
        await this.$auth.fetchUser()
        this.user_was_updated()
      })
      this.socket.on('user-reload', ()=>{
        this.getChats(true)
      })
    }
  }
}
</script>

<style lang='sass'>
body
  overflow: hidden
#app-content
  margin: 0
  padding-top: 50px
  height: 100vh
</style>
