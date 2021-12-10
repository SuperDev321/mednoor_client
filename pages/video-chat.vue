<template>
  <div class="mh-100v d-flex f-center">
    <div
      :xs="{ span: 6, offset: 0 }"
    >
      <create-room />
    </div>
    <div
      :xs="{ span: 6, offset: 0 }"
    >
      <join-room />
    </div>
  </div>
</template>

<script>
import CreateRoom from '~/components/CreateVideoRoom'
import JoinRoom from '~/components/JoinVideoRoom'
export default {
  name: 'VideoChat',
  components: {
    CreateRoom,
    JoinRoom
  },
  layout: 'videoChat',
}
</script>
