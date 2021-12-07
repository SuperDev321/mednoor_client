<template>
  <a-layout>
    <create-room></create-room>
    <join-room></join-room>
  </a-layout>
</template>

<script>
import CreateRoom from '~/components/CreateVideoRoom'
import JoinRoom from '~/components/JoinVideoRoom'
export default {
  name: 'video-chat',
  layout: 'default',
  components: {
    CreateRoom,
    JoinRoom
  }
}
</script>
